import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePdfFromElement = async (
  element,
  fileName = "report.pdf",
  options = {}
) => {
  if (!element) return;

  const {
    scale = window.devicePixelRatio || 2,
    quality = 0.92,
    pdfFormat = "a4",
    orientation = "p",
    compression = true,
    logging = false,
    margin = { top: 15, right: 10, bottom: 15, left: 10 },
    pageGutter = 6, // mm of extra breathing room at top/bottom to avoid clipping
    freezeSelectors = [
      ".accordion",
      ".collapsible",
      ".expander",
      ".executive-summary",
    ],
  } = options;

  const toAbsolute = (u) => {
    try {
      return new URL(u, window.location.origin).href;
    } catch {
      return u;
    }
  };

  const freezeLayout = () => {
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-pdf-freeze", "true");
    styleEl.textContent = `
      *:focus { outline: none !important; }
      a:hover, a:active { text-decoration: inherit !important; }
      .no-print, .pdf-ignore { display: none !important; }
      /* Neutralize transforms that desync rects vs raster */
      [data-pdf-root="true"] { transform: none !important; }
      /* Soft page-break hints for measurement phase only */
      .pdf-keep { break-inside: avoid; page-break-inside: avoid; }
      .pdf-break-before { break-before: page; page-break-before: always; }
      .pdf-break-after { break-after: page; page-break-after: always; }
    `;
    document.head.appendChild(styleEl);

    const frozen = [];
    freezeSelectors.forEach((sel) => {
      element.querySelectorAll(sel).forEach((node) => {
        const prev = {
          node,
          transition: node.style.transition,
          animation: node.style.animation,
          overflow: node.style.overflow,
          maxHeight: node.style.maxHeight,
          height: node.style.height,
        };
        frozen.push(prev);
        node.style.transition = "none";
        node.style.animation = "none";
        node.style.overflow = "visible";
        const rect = node.getBoundingClientRect();
        node.style.height = `${rect.height}px`;
        node.style.maxHeight = `${rect.height}px`;
      });
    });

    const stickies = [];
    element.querySelectorAll("*").forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.position === "sticky") {
        stickies.push({ el, pos: el.style.position, top: el.style.top });
        el.style.position = "static";
        el.style.top = "auto";
      }
    });

    // Mark export root to disable transforms
    element.setAttribute("data-pdf-root", "true");

    return () => {
      const styleNode = document.querySelector('style[data-pdf-freeze="true"]');
      if (styleNode) styleNode.remove();
      frozen.forEach((f) => {
        f.node.style.transition = f.transition;
        f.node.style.animation = f.animation;
        f.node.style.overflow = f.overflow;
        f.node.style.maxHeight = f.maxHeight;
        f.node.style.height = f.height;
      });
      stickies.forEach((s) => {
        s.el.style.position = s.pos;
        s.el.style.top = s.top;
      });
      element.removeAttribute("data-pdf-root");
    };
  };

  try {
    const unfreeze = freezeLayout(); // stabilize layout to prevent cutting via reflow [web:22]

    // Measure container rect in CSS px
    const containerRect = element.getBoundingClientRect();

    // Collect links, measured in canvas pixels to match raster scale
    const links = [];
    element.querySelectorAll("a[href]").forEach((linkEl) => {
      const rect = linkEl.getBoundingClientRect();
      const url = linkEl.getAttribute("href");
      if (!url || url === "#" || rect.width === 0 || rect.height === 0) return;

      let formattedUrl = url;
      if (
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("mailto:") &&
        !url.startsWith("tel:")
      ) {
        formattedUrl = url.startsWith("/") ? url : `/${url}`;
      }
      formattedUrl = toAbsolute(formattedUrl);

      const relXcss = rect.left - containerRect.left;
      const relYcss = rect.top - containerRect.top;

      links.push({
        url: formattedUrl,
        xPx: relXcss * scale,
        yPx: relYcss * scale,
        wPx: rect.width * scale,
        hPx: rect.height * scale,
      });
    });

    // Build a list of block sections with no-split hints
    // Any element with class "pdf-keep" is treated as an indivisible block
    const noSplitBlocks = Array.from(element.querySelectorAll(".pdf-keep")).map(
      (node) => {
        const r = node.getBoundingClientRect();
        return {
          node,
          startPx: (r.top - containerRect.top) * scale, // canvas px
          endPx: (r.bottom - containerRect.top) * scale, // canvas px
        };
      }
    ); // avoids mid-block splits that look like content cutting [web:24]

    // Force page breaks before/after markers by recording their positions
    const forcedBreaksBefore = Array.from(
      element.querySelectorAll(".pdf-break-before")
    ).map(
      (node) => (node.getBoundingClientRect().top - containerRect.top) * scale
    );
    const forcedBreaksAfter = Array.from(
      element.querySelectorAll(".pdf-break-after")
    ).map(
      (node) =>
        (node.getBoundingClientRect().bottom - containerRect.top) * scale
    ); // subtle control for large sections [web:22]

    // Rasterize once at the chosen scale
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      logging,
      imageTimeout: 0,
      ignoreElements: (el) =>
        el.classList?.contains?.("no-print") ||
        el.classList?.contains?.("pdf-ignore") ||
        el.classList?.contains?.("react-resizable-handle"),
    }); // single canvas then slice to prevent inconsistencies across pages [web:9]

    // Setup PDF and scaling math
    const pdf = new jsPDF(orientation, "mm", pdfFormat);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Apply gutters by shrinking the usable content box
    const contentWidth = pdfWidth - margin.left - margin.right;
    const contentHeight =
      pdfHeight - (margin.top + margin.bottom) - pageGutter - pageGutter; // reserve top/bottom gutters [web:9]

    const scaleXmmPerPx = contentWidth / canvas.width;
    const scaleYmmPerPx = contentWidth / canvas.width;

    // Convert gutter from mm to canvas px for slicing math
    const gutterPx = pageGutter / scaleYmmPerPx;

    // Helper to check if a proposed slice [topPx, bottomPx) would cut a no-split block
    const adjustSliceBottomToAvoidCuts = (sliceTopPx, proposedBottomPx) => {
      // Respect forced breaks: if any break-before lies within this slice, end before it
      const forcedBefore = forcedBreaksBefore
        .filter((y) => y > sliceTopPx && y < proposedBottomPx)
        .sort((a, b) => a - b)[0];
      if (forcedBefore !== undefined) {
        return forcedBefore; // stop before the forced break [web:22]
      }

      // Respect forced break-after: if any after lies above proposed bottom but below top, extend bottom to include it
      const forcedAfter = forcedBreaksAfter
        .filter((y) => y >= sliceTopPx && y <= proposedBottomPx)
        .sort((a, b) => b - a)[0];
      if (forcedAfter !== undefined) {
        return forcedAfter; // end exactly after that block [web:22]
      }

      // For no-split blocks, if the slice intersects a block, move bottom up to the block start
      for (const blk of noSplitBlocks) {
        const intersects = !(
          proposedBottomPx <= blk.startPx || sliceTopPx >= blk.endPx
        );
        if (intersects) {
          if (blk.startPx > sliceTopPx + 1) {
            return blk.startPx; // end before the block to avoid cutting it [web:24]
          } else {
            // Block itself is taller than a page; let it flow and avoid infinite loop
            return proposedBottomPx; // unavoidable split; best-effort fallback [web:24]
          }
        }
      }
      return proposedBottomPx;
    };

    // Link placement for a slice
    const addLinksToPage = (currentPageNum, sliceTopPx, sliceHeightPx) => {
      links.forEach((lnk) => {
        const yInSlicePx = lnk.yPx - sliceTopPx;
        if (yInSlicePx >= 0 && yInSlicePx <= sliceHeightPx) {
          const xmm = lnk.xPx * scaleXmmPerPx + margin.left;
          const ymm =
            pageGutter + // top gutter
            margin.top +
            yInSlicePx * scaleYmmPerPx;
          const wmm = lnk.wPx * scaleXmmPerPx;
          const hmm = lnk.hPx * scaleYmmPerPx;

          pdf.setPage(currentPageNum);
          pdf.link(xmm, ymm, wmm, hmm, { url: lnk.url });
        }
      });
    };

    // Slice height in canvas px corresponding to contentHeight mm
    const pageSliceHeightPx = Math.floor(contentHeight / scaleYmmPerPx);

    let pageNum = 1;
    let sliceTopPx = 0;

    while (sliceTopPx < canvas.height) {
      if (pageNum > 1) pdf.addPage();

      const remainingPx = canvas.height - sliceTopPx;
      let desiredBottomPx =
        sliceTopPx + Math.min(pageSliceHeightPx, remainingPx);

      // Adjust bottom to avoid cutting keep-blocks and honor forced breaks
      const adjustedBottomPx = adjustSliceBottomToAvoidCuts(
        sliceTopPx,
        desiredBottomPx
      );

      // Ensure progress
      const thisSlicePx = Math.max(
        1,
        Math.floor(adjustedBottomPx - sliceTopPx)
      );

      // Prepare slice canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = thisSlicePx;

      const ctx = tempCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        sliceTopPx,
        canvas.width,
        thisSlicePx,
        0,
        0,
        canvas.width,
        thisSlicePx
      );

      const imageData = tempCanvas.toDataURL("image/jpeg", quality);
      const drawHeightMm = thisSlicePx * scaleYmmPerPx;

      // Draw with top gutter offset and leave bottom gutter space
      pdf.addImage(
        imageData,
        "JPEG",
        margin.left,
        margin.top + pageGutter,
        contentWidth,
        drawHeightMm,
        undefined,
        "FAST"
      );

      addLinksToPage(pageNum, sliceTopPx, thisSlicePx);

      sliceTopPx += thisSlicePx;
      pageNum++;
    }

    if (compression && pdf.setCompression) {
      pdf.setCompression(true);
    }

    pdf.save(fileName);
    unfreeze();
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("PDF generation failed.");
  }
};
