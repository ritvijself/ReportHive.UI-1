import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react"; //step-1 button
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import {
  Traffic,
  BounceRatePercentage,
  Devices,
  ConversionRate,
  DayBydDayUser,
  activeUser,
  newUserDayByDay,
  UserEngagementDayByDay,
  TotalUserByCountry,
  TotalUserByCity,
  TotalUserByLanguage,
  TotalUserByDeviceBrowser,
  UserEngagementByCountry,
  KeyEventCountry,
  TotalPageUsers,
  PageViewPerDay,
  TrafficSourcePerPage,
  engSessions,
  engSessionsDevices,
  CampaignTable,
  BounceRateDevices,
  TotalDeviceUsersDayWise,
  CountByDevice,
  KeyEventsByDevice,
  EnagementRateChannel,
  SessionTable,
  GA4HighLight,
  SessionByDevice,
  AverageEngagement,
  TotalUserMap,
  sessions,
} from "../../../api/Ga4Apis";
import style from "./ChartPageSecond.module.css";
import { generatePdfFromElement } from "../../../utils/PdfGenerator";
import GoogleConsoleCharts from "../ChartsIntegration/ChartsGSC/GoogleConsoleCharts";
import ChartsFb from "../ChartsIntegration/ChartsFb/ChartsFb";
import {
  FacebookUniqueImpressionApi,
  TopFivePost,
  totalFollowers,
  totalPageLikes,
  totalPost_Like_cmnt_share,
} from "../../../api/FacebookApis";
import {
  ExcelSearchQueries,
  GoogleMapRanking,
  GoogleOrganicRanking,
  PerformanceByCountry,
  PerformanceByDevices,
  PopularContent,
  SearchClicksGsc,
  SearchClicksGscOneMonth,
  SecurityCheckApi,
  SitemapTableApi,
  Top5Pages,
  Top5SearchQueries,
} from "../../../api/GscChartsApis";
import ChartGMB from "../ChartsIntegration/ChartGMB/ChartGMB";
import {
  BusinessInteractions,
  DesktopMaps,
  SearchKeywords,
  TotalProfileImpression,
} from "../../../api/GmbApis";
import ChartYoutube from "../ChartsIntegration/ChartYoutube/ChartYoutube";
import {
  channelLifetimeLikes,
  ChannelLikesMonthly,
  engagementByCountry,
  statistics,
  SubscriberGainsAndLosses,
} from "../../../api/YoutubeApis";
import { LighthouseScoreApi } from "../../../api/GoogleLightHouseApis";
import ChartInstagram from "../ChartsIntegration/ChartInstagram/ChartInstagram";
import {
  GetPostsByDateRange,
  TotalFollowers,
  GetPostsDetailsByDateRange,
} from "../../../api/InstagramApis";
import ChartGA4 from "../ChartsIntegration/ChartGoogleA4/ChartGA4";
import GoogleLightHouse from "../ChartsIntegration/ChartGoogleLightHouse/ChartGoogleLightHouse";
import ExecutiveSummary from "../ExecutiveSummary/ExecutiveSummary";
import { useLocation, useNavigate } from "react-router-dom";
import ExecutiveSummaryContainer from "../ExecutiveSummary/ExecutiveSummaryConatiner";
import ChartGAds from "../ChartsIntegration/ChartGAds/ChartGAds";
import { ClicksConversionCost } from "../../../api/GoogleAdsReport";
import ChartsLinkedIn from "../ChartsIntegration/ChartLinkedIn/ChartsLinkedIn";
import ChartShopify from "../ChartsIntegration/ChartShopify/ChartShopify";
import CompareExecutiveSummary from "../ExecutiveSummary/CompareExecutiveSummary";
import ChartGAdsense from "../ChartsIntegration/ChartGAdsense/ChartGAdsense";
import { GAdsenseReport } from "../../../api/GAdsenseReport";
import { ShopifyReports } from "../../../api/ShopifyApis";
import { MdOutlineFileDownload } from "react-icons/md";
import { formatDateLocal } from "../../../utils/FormatDate";
import { FiTrash2, FiMove } from "react-icons/fi";

import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css"; //
// Removed ResizableBox usage; keep react-resizable dependency if needed elsewhere
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StaticCommentRenderer from "../../DashboardPage/DashboardHeader/Static Widget/StaticCommentRenderer";


const ResponsiveGridLayout = WidthProvider(Responsive);

// Small helper component: editable header text backed by Header API (create/get/update)
const EditableHeaderText = ({ clientSeq, headerId, apibaseurl, token }) => {
  const storageKey = `dashboard_header_text_${headerId || clientSeq || "default"
    }`;
  const [text, setText] = React.useState("");
  const ref = React.useRef(null);

  const isLocalKey = (id) => typeof id === "string" && id.startsWith("header_");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // If headerId looks like a server id, try to fetch it
      if (headerId && !isLocalKey(headerId)) {
        try {
          const resp = await fetch(
            `${apibaseurl}/api/Header/get-by-id?id=${encodeURIComponent(
              headerId
            )}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (mounted)
              setText(
                data.HeaderTitle || data.headerTitle || data.title || "Header"
              );
            return;
          }
        } catch (e) {
          console.warn("Failed to fetch header by id", e);
        }
      }

      // fallback to localStorage
      try {
        const v = localStorage.getItem(storageKey) || "Header";
        if (mounted) setText(v);
      } catch (e) {
        if (mounted) setText("Header");
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [headerId, apibaseurl, token]);

  const handleBlur = async () => {
    const newText = ref.current?.innerText || text;
    setText(newText);

    // If headerId is a server id, call update API
    if (headerId && !isLocalKey(headerId) && token) {
      try {
        const formData = new FormData();
        formData.append("HeaderTitle", newText);
        // PUT /api/Header/update/{id}
        const resp = await fetch(
          `${apibaseurl}/api/Header/update/${encodeURIComponent(headerId)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        if (!resp.ok) {
          console.warn("Failed to update header on server", resp.statusText);
        }
        return;
      } catch (e) {
        console.warn("Error updating header on server", e);
      }
    }

    // otherwise persist locally
    try {
      localStorage.setItem(storageKey, newText);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();

          const el = ref.current;
          if (el) {
            el.innerText = el.innerText.replace(/\n/g, " ");
          }
          // trigger blur to save
          el?.blur();
        }
      }}
      style={{
        outline: "none",
        minHeight: 24,
        fontSize: 16,
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
};
// CsvWidget: upload Excel/CSV, fetch processed rows, display/edit using AG Grid
const CsvWidget = ({
  widgetId,
  apibaseurl,
  token,
  onRemove,
  onUploaded,
  initialRows = [],
  initialFileName = null,
  isResizableContainer,
  reportDate = null,
}) => {
  const [fileName, setFileName] = React.useState(initialFileName || null);
  React.useEffect(() => {
    if (initialFileName && initialFileName !== fileName) {
      setFileName(initialFileName);
    }
  }, [initialFileName]);
  const [rows, setRows] = React.useState(
    Array.isArray(initialRows) ? initialRows : []
  );
  const [cols, setCols] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const gridApiRef = React.useRef(null);
  const [showCsvDeleteModal, setShowCsvDeleteModal] = React.useState(false);
  const csvToDeleteRef = React.useRef(null);

  const parseColumns = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const keys = Object.keys(arr[0]);
    // Add cellClass to avoid editable look and ensure vertical borders via cellStyle
    return keys.map((k) => ({
      field: k,
      headerName: k,
      editable: false,
      cellClass: 'ag-cell-no-edit',
      cellStyle: { borderRight: '1px solid rgba(0,0,0,0.08)' },
    }));
  };

  // If initialRows provided (from server), set columns accordingly on mount/update
  React.useEffect(() => {
    if (Array.isArray(initialRows) && initialRows.length > 0) {
      setRows(initialRows);
      setCols(parseColumns(initialRows));
    }
  }, [initialRows]);

  const fetchProcessed = async () => {
    setLoading(true);
    try {

      const keywordSeq = widgetId?.keyword_Seq || widgetId;
      const params = new URLSearchParams();
      if (keywordSeq && !(typeof keywordSeq === 'string' && keywordSeq.startsWith('csv_'))) {
        params.append('keywordSeq', String(keywordSeq));
      }
      if (reportDate) {
        try {
          const d = new Date(reportDate);
          params.append('year', String(d.getFullYear()));
          params.append('month', String(d.getMonth() + 1));
          params.append('day', String(d.getDate()));
          params.append('dayOfWeek', String(d.getDay()));
        } catch (e) {
          // ignore
        }
      }
      const url = `${apibaseurl}/api/FetchExcelKeyword/fetch-keyword${params.toString() ? `?${params.toString()}` : ''}`;

      const resp = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      const result = await resp.json();
      let dataArray = Array.isArray(result)
        ? result
        : result.data || result.rows || result.result || [];
      if (!Array.isArray(dataArray)) dataArray = [];
      setRows(dataArray);
      setCols(parseColumns(dataArray));
      toast.success("Keywords fetched successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (e) {
      console.warn("Failed to fetch processed keywords", e);
      setRows([]);
      setCols([]);
      toast.error(
        `Failed to fetch keywords. Please upload a CSV file in the correct format. `,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      console.warn(
        "error message for update and fetch the keyword from CSV file",
        e.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm CSV delete handler with toast feedback
  const confirmCsvDelete = async () => {
    const keywordSeq = csvToDeleteRef.current;
    setShowCsvDeleteModal(false);
    csvToDeleteRef.current = null;
    if (!keywordSeq) return;

    // If it's a local placeholder, inform parent to remove and succeed
    const isLocal = typeof keywordSeq === 'string' && keywordSeq.startsWith('csv_');
    if (isLocal) {
      try {
        if (typeof onRemove === 'function') onRemove(keywordSeq);
        toast.success('CSV removed');
      } catch (e) {
        console.error('Error removing local csv widget', e);
        toast.error('Failed to remove CSV');
      }
      return;
    }

    // Server-side delete
    try {
      const url = `${apibaseurl}/api/FetchExcelKeyword/delete?keywordSeqDto=${encodeURIComponent(
        keywordSeq
      )}`;
      const resp = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => resp.statusText || '');
        console.error('CSV delete failed', resp.status, txt);
        toast.error(`Failed to delete CSV: ${txt || resp.status}`);
        return;
      }

      // Inform parent to update UI
      try {
        if (typeof onRemove === 'function') onRemove(keywordSeq);
      } catch (e) {
        console.warn('onRemove callback failed', e);
      }
      toast.success('CSV removed');
    } catch (e) {
      console.error('Error deleting CSV', e);
      toast.error('Error deleting CSV');
    }
  };

  const handleFileSelected = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    // If widgetId represents a server-side csv card (keywordSeq), include it so backend updates that record
    try {
      const keywordSeq = widgetId?.keyword_Seq || widgetId;
      if (keywordSeq && !(typeof keywordSeq === 'string' && keywordSeq.startsWith('csv_'))) {
        fd.append('keywordSeq', String(keywordSeq));
      }
    } catch (e) {
      // ignore
    }
    try {
      setLoading(true);
      const up = await fetch(`${apibaseurl}/api/FetchExcelKeyword/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!up.ok) throw new Error(`Upload failed: ${up.status}`);
      await fetchProcessed();
      // Notify parent to refresh csv widgets (so keyword id / widget id become available)
      try {
        typeof onUploaded === "function" && onUploaded();
      } catch (e) {
        console.warn("onUploaded callback failed", e);
      }
    } catch (e) {
      console.error("Upload error", e);
    } finally {
      setLoading(false);
    }
  };

  // const onGridReady = (params) => {
  //   gridApiRef.current = params.api;
  // };
  // 🌟 FIX 2: onGridReady mein sizeColumnsToFit call kiya
  const onGridReady = (params) => {
    gridApiRef.current = params.api;

    // Columns ko fit karein
    if (params.api) {
      try {
        params.api.sizeColumnsToFit();
      } catch (e) {
        console.warn("AG Grid: Failed to size columns on ready.", e);
      }
    }
  };

  const handleEditToggle = () => {
    setEditing((s) => !s);
    setCols((prev) => prev.map((c) => ({ ...c, editable: !editing })));
  };

  // Toggle expansion and notify AG Grid to update layout/size so rows remain visible
  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      // wait a bit for DOM changes, then force AG Grid to update
      setTimeout(() => {
        const api = gridApiRef.current;
        if (api) {
          try {
            // Update DOM layout mode
            if (typeof api.setDomLayout === "function") {
              api.setDomLayout(next ? "autoHeight" : "normal");
            }
            // Force a redraw + size columns to fit when collapsed
            try {
              api.redrawRows();
            } catch (e) { }
            try {
              api.sizeColumnsToFit();
            } catch (e) { }
          } catch (e) {
            console.warn("AG Grid update after toggle failed", e);
          }
        }
      }, 60);

      return next;
    });
  };

  const handleSave = async () => {
    const api = gridApiRef.current;
    if (api) {
      const rowData = [];
      api.forEachNode((node) => rowData.push(node.data));
      try {
        const csvRows = [];
        const headers = cols.map((c) => c.field);
        csvRows.push(headers.join(","));
        rowData.forEach((r) => {
          const row = headers.map((h) => JSON.stringify(r[h] ?? ""));
          csvRows.push(row.join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const fd = new FormData();
        fd.append("file", blob, fileName || `edited_${Date.now()}.csv`);
        // include keywordSeq when available so backend updates existing record instead of creating new
        try {
          const keywordSeq = widgetId?.keyword_Seq || widgetId;
          if (keywordSeq && !(typeof keywordSeq === 'string' && keywordSeq.startsWith('csv_'))) {
            fd.append('keywordSeq', String(keywordSeq));
          }
        } catch (e) {
          // ignore
        }
        setLoading(true);
        const up = await fetch(`${apibaseurl}/api/FetchExcelKeyword/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        if (!up.ok) throw new Error("Save upload failed");
        await fetchProcessed();
        try {
          typeof onUploaded === "function" && onUploaded();
        } catch (e) {
          console.warn("onUploaded callback failed", e);
        }
        setEditing(false);
      } catch (e) {
        console.error("Save error", e);
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    const api = gridApiRef.current;
    if (api) {
      try {
        api.sizeColumnsToFit();
      } catch (e) {
        // Error ignore karein
      }
    }
  }, [rows, cols]);

  // 🌟 FIX 4: useEffect for Resizable Container (Window Resize)
  React.useEffect(() => {
    const api = gridApiRef.current;
    if (api) {
      const handleResize = () => {
        try {
          api.sizeColumnsToFit();
        } catch (e) {
          // Ignore resize error
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // start with no filename; filename will be set only when user uploads/selects a file
  // Expand/collapse behaviour: measure content scrollHeight and animate max-height
  const contentRef = React.useRef(null);
  const [expanded, setExpanded] = React.useState(false);
  const [maxHeight, setMaxHeight] = React.useState("350px");

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      // when expanded, set maxHeight to scrollHeight to fit content
      if (expanded) {
        // allow some breathing room
        const h = el.scrollHeight || el.offsetHeight || 0;
        const final = Math.max(h + 8, 350);
        setMaxHeight(`${final}px`);
      } else {
        // collapsed state: enforce minimum visible area
        setMaxHeight("350px");
      }
    };

    update();

    // Observe size changes inside the content (AG Grid may resize)
    let ro;
    try {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } catch (e) {
      // ResizeObserver may not be available in some environments
      window.addEventListener("resize", update);
    }

    return () => {
      try {
        ro && ro.disconnect();
      } catch (e) { }
      window.removeEventListener("resize", update);
    };
  }, [expanded, rows, cols, isResizableContainer]);

  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 6,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="pdf-ignore"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 700 }}>{fileName ? fileName : "Upload CSV/Excel"}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            style={{ display: "none" }}
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </button>

          {editing ? (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </button>
          ) : (
            onRemove && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  try {
                    const keywordSeq = widgetId?.keyword_Seq || widgetId;
                    const isLocal = typeof keywordSeq === 'string' && keywordSeq.startsWith('csv_');

                    // If there's no fileName uploaded, or no server-side id, or it's a local placeholder,
                    // bypass the confirmation modal and remove immediately.
                    if (!fileName || !keywordSeq || isLocal) {
                      if (typeof onRemove === 'function') onRemove(keywordSeq || widgetId);
                      return;
                    }

                    // otherwise show confirmation modal
                    csvToDeleteRef.current = keywordSeq;
                    setShowCsvDeleteModal(true);
                  } catch (e) {
                    console.error('Error removing CSV', e);
                    toast.error('Failed to remove CSV');
                  }
                }}
              >
                Remove
              </button>
            )
          )}

          {Array.isArray(rows) && rows.length > 0 && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleExpanded}
              aria-pressed={expanded}
              title={expanded ? "Collapse" : "Expand to fit content"}
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      </div>
      {/* CSV Remove Confirmation Modal */}
      <Modal
        show={showCsvDeleteModal}
        onHide={() => setShowCsvDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Delete CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove this CSV/Excel upload? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCsvDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmCsvDelete}>Confirm Delete</Button>
        </Modal.Footer>
      </Modal>

      <div
        ref={contentRef}
        className="ag-theme-alpine"
        style={{
          width: "100%",
          // When collapsed allow internal scrolling at 350px so content is visible
          overflow: expanded ? "visible" : "auto",
          transition: "max-height 280ms ease",
          maxHeight: maxHeight,
          minHeight: "350px", // Ensure visible area
          // When collapsed we give the grid a fixed height so rows stay visible
          height: expanded ? undefined : "350px",
        }}
      >
        <AgGridReact
          rowData={rows}
          columnDefs={cols}
          // Use autoHeight when expanded so grid grows; when collapsed use normal layout with fixed height
          domLayout={expanded ? "autoHeight" : "normal"}
          defaultColDef={{ sortable: true, filter: true, resizable: true, editable: false }}
          onGridReady={onGridReady}
          stopEditingWhenCellsLoseFocus={true}
          suppressRowClickSelection={true}
          suppressCellSelection={true}
          suppressClickEdit={true}
        />
      </div>
    </div>
  );
};
const ChartPageSecond = forwardRef(
  (
    {
      propertyid,
      gsC_id,
      fbPage_Id,
      gmbAccount_Id,
      gmbLocation_Id,
      ytChannelId,
      insta_Id,
      startDate,
      endDate,
      selectedIntegration,
      staticWidgetHeaders,
      csvWidgets,
      onCsvUploadComplete,
      onDeleteCsvWidget,
      onDeleteHeader,
      showSummary,
      summaryText,
      summaryImages,
      onSaveSummary,
      onDeleteSummary,
      googleAdsCustomerId,
      gAdsensePublisherId,
      linkedInUserId,
      shopifyId,
      staticCommentKeys,
      onDeleteComment,

    },
    ref
  ) => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [clientName, setClientName] = useState("");
    const [clientColor, setClientColor] = useState("");
    const [websiteAddress, setWebsiteAddress] = useState("");
    const [clientLogo, setClientLogo] = useState("");
    const location = useLocation();
    const visibleRef = useRef();
    const pdfContentRef = useRef();
    const headerRef = useRef(null);
    const headerRefs = useRef({});
    const clientSeq =
      location.state?.clientSeq || localStorage.getItem("selectedClientSeq");

    const [clientLogoBase64, setClientLogoBase64] = useState("");
    const [agencyLogoBase64, setAgencyLogoBase64] = useState("");
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [reportType, setReportType] = useState("SEO");
    const [labelSummaryLinks, setLabelSummaryLinks] = useState([]);
    const [hoveredHeaderId, setHoveredHeaderId] = useState(null); // State to track which header is hovered
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [headerToDeleteId, setHeaderToDeleteId] = useState(null);

    const [layout, setLayout] = useState([]);
    const [widgets, setWidgets] = useState([]); // List of widgets to render
    const [fetchedComments, setFetchedComments] = useState([]);
    const [headerMetas, setHeaderMetas] = useState([]); // [{id, createdTs, raw}]
    const isInitialMount = useRef(true);
    // 👇️ New State for Static Comment Widgets
    // const [staticCommentKeys, setStaticCommentKeys] = useState([]); 
    const commentRefs = useRef({});

    const handleCloseModal = () => {
      setShowDeleteModal(false);
      setHeaderToDeleteId(null);
    };
    const handleShowModal = (hid) => {
      setHeaderToDeleteId(hid);
      setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
      if (!headerToDeleteId) return; // Safety check

      const hid = headerToDeleteId;

      // Log the ID for debugging
      console.log("Attempting to delete header ID:", hid);

      try {
        const isLocal = typeof hid === "string" && hid.startsWith("header_");

        // Flag to control UI update
        let deletionSuccessful = true;

        // If not local, call backend delete API
        if (!isLocal) {
          const deleteUrl = `${apibaseurl}/api/Header/delete/${encodeURIComponent(
            hid
          )}`;
          console.log("DELETE URL:", deleteUrl); // Full URL check

          const resp = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              Accept: "*/*",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          // 🔥 **Crucial Fix: Server Response Handling**
          if (!resp.ok) {
            let msg = resp.statusText;
            try {
              const obj = await resp.json();
              msg = obj?.message || msg;
            } catch (e) {
              // ignore
            }
            console.error("Server Delete failed:", resp.status, msg);
            toast.error(`Failed to delete header: ${msg}`);

            // Do not update UI when server delete fails
            deletionSuccessful = false;
          }
        }

        // Agar delete server par successful hua ya item local tha, tabhi UI update karo
        if (deletionSuccessful) {
          // Remove widget & layout entry locally (UI update)
          setWidgets((prev) => prev.filter((w) => w.hid !== hid));
          setLayout((prev) =>
            prev.filter((l) => {
              return l.i !== `custom_header_${hid}` && l.i !== hid;
            })
          );

          // Inform parent to remove header id from its array so DB and UI stay in sync
          if (typeof onDeleteHeader === "function") {
            try {
              onDeleteHeader(hid);
            } catch (e) {
              console.warn("onDeleteHeader callback failed", e);
            }
          }

          console.log("Header removed from UI:", hid);
          toast.success("Header removed");
        }
      } catch (err) {
        console.error("Error during header deletion:", err);
        alert("Error deleting header: " + (err.message || err));
      } finally {
        // Modal ko band kar dein
        handleCloseModal();
      }
    };

    const apibaseurl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("token");

    // Fetch comments function (kept as ref to allow calling from handlers)
    const fetchCommentsRef = useRef(null);

    const fetchComments = async () => {
      if (!clientSeq) return;
      try {
        // include dateOnly query derived from startDate so backend can filter by report date
        const params = new URLSearchParams();
        if (startDate) {
          try {
            const d = new Date(startDate);
            params.append('year', String(d.getFullYear()));
            params.append('month', String(d.getMonth() + 1));
            params.append('day', String(d.getDate()));
            params.append('dayOfWeek', String(d.getDay()));
          } catch (e) {
            // ignore formatting errors
          }
        }
        const url = `${apibaseurl}/api/commentBox/commentbox${params.toString() ? `?${params.toString()}` : ''}`;
        const resp = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (resp.ok) {
          const data = await resp.json();
          const list = Array.isArray(data) ? data : data?.data || [];
          setFetchedComments(list || []);
        } else {
          setFetchedComments([]);
        }
      } catch (e) {
        console.warn("Failed to fetch comments", e);
        setFetchedComments([]);
      }
    };
    fetchCommentsRef.current = fetchComments;

    // Called when a StaticComment reports it saved successfully
    const handleCommentSaved = async ({ id, comment, commentKey }) => {
      // Immediately refresh server comments
      try {
        await fetchCommentsRef.current?.();
      } catch (e) {
        console.warn('Error refreshing comments after save', e);
      }

      // If the saved comment replaced a local placeholder key, remove that placeholder
      if (commentKey && typeof commentKey === 'string' && commentKey.startsWith('comment_')) {
        if (typeof onDeleteComment === 'function') onDeleteComment(commentKey);
      }
    };

    // Delete handler for comment widgets (called from renderer)
    const handleDeleteComment = async (key) => {
      try {
        // If key looks like a local placeholder (comment_...), just inform parent to remove
        if (typeof key === 'string' && key.startsWith('comment_')) {
          if (typeof onDeleteComment === 'function') onDeleteComment(key);
          return;
        }

        // Find matching server comment id in fetchedComments
        const match = (fetchedComments || []).find(
          (c) => String(c.commentBoxSeq) === String(key) || String(c.id) === String(key)
        );
        const idToDelete = match ? (match.commentBoxSeq || match.id || key) : key;

        if (!idToDelete) {
          // fallback: just call parent removal
          if (typeof onDeleteComment === 'function') onDeleteComment(key);
          return;
        }

        const url = `${apibaseurl}/api/commentbox/delete/${encodeURIComponent(idToDelete)}`;
        const resp = await fetch(url, {
          method: 'DELETE',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          toast.error(`Failed to delete comment: ${resp.status} ${text}`);
          return;
        }

        // Remove from fetchedComments if present
        setFetchedComments((prev) => prev.filter((c) => String(c.commentBoxSeq) !== String(idToDelete) && String(c.id) !== String(idToDelete)));

        // Inform parent to remove key from staticCommentKeys if it exists there
        if (typeof onDeleteComment === 'function') onDeleteComment(idToDelete);

        toast.success('Comment deleted');
      } catch (err) {
        console.error('Error deleting comment', err);
        toast.error('Error deleting comment');
      }
    };

    const onLayoutChange = (newLayout) => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      setLayout(newLayout);
      // Optional: Save layout to localStorage/API here
    };

    //   const initialWidgets = [];
    //   const initialLayout = [];
    //   let yPos = 0;

    //   const execSummaryId = "executive_summary_widget";
    //   initialWidgets.push({ id: execSummaryId, type: 'ExecutiveSummary' });
    //   initialLayout.push({
    //     i: execSummaryId,
    //     x: 0,
    //     y: yPos,
    //     w: 12, // Full width
    //     h: 4, // A rough height estimate, adjust as needed (1 unit = 30px)
    //     // minH: 5,
    //     isResizable: true,
    //   });
    //   yPos += 5; // Next item ki position adjust karein

    //   // --- 2. CompareExecutiveSummary Component ---
    //   const compareSummaryId = "compare_executive_summary_widget";
    //   initialWidgets.push({ id: compareSummaryId, type: 'CompareExecutiveSummary' });
    //   initialLayout.push({
    //     i: compareSummaryId,
    //     x: 0,
    //     y: yPos,
    //     w: 12, // Full width
    //     h: 8.6, // A rough height estimate, adjust as needed
    //     // minH: 8.6,
    //     isResizable: true,
    //   });
    //   yPos += 8.6; // Next item ki position adjust karein
    //   staticWidgetHeaders.forEach((hid) => {
    //     const headerId = `custom_header_${hid}`;
    //     initialWidgets.push({ id: headerId, type: 'EditableHeader', hid });
    //     initialLayout.push({
    //       i: headerId,
    //       x: 0,
    //       y: yPos,
    //       w: 12, // Full width
    //       h: 1.5,  // Small height for a header
    //       isResizable: false, // 🧩 Disable resizing for this item only

    //     });
    //     yPos += 2;
    //   });

    //   setLayout(initialLayout);
    //   setWidgets(initialWidgets);

    // }, [staticWidgetHeaders]);

    // ChartPageSecond.js ke andar useEffect mein:

    useEffect(() => {
      // Fetch comments for this client on mount or when clientSeq changes
      const fetchComments = async () => {
        if (!clientSeq) return;
        try {
          // include dateOnly query derived from startDate so backend can filter by report date
          const params = new URLSearchParams();
          if (startDate) {
            try {
              const d = new Date(startDate);
              params.append('year', String(d.getFullYear()));
              params.append('month', String(d.getMonth() + 1));
              params.append('day', String(d.getDate()));
              params.append('dayOfWeek', String(d.getDay()));
            } catch (e) {
              // ignore formatting errors
            }
          }
          const url = `${apibaseurl}/api/commentBox/commentbox${params.toString() ? `?${params.toString()}` : ''}`;
          const resp = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });
          if (resp.ok) {
            const data = await resp.json();
            const list = Array.isArray(data) ? data : data?.data || [];
            setFetchedComments(list || []);
          } else {
            setFetchedComments([]);
          }
        } catch (e) {
          console.warn("Failed to fetch comments", e);
          setFetchedComments([]);
        }
      };
      fetchComments();
      const initialWidgets = [];
      const initialLayout = [];
      let yPos = 0; // Starting position (y: 0)

      // --- 1. ExecutiveSummary Component ---
      const execSummaryId = "executive_summary_widget";
      const execSummaryH = 4; // Height: 4 rows
      initialWidgets.push({ id: execSummaryId, type: "ExecutiveSummary" });
      initialLayout.push({
        i: execSummaryId,
        x: 0,
        y: yPos,
        w: 12, // Full width
        h: execSummaryH,
        minH: 4, // Minimum height set karein
        isResizable: true,
      });
      // 🌟 FIX: Y-position ko sirf height se badhayein
      yPos += execSummaryH;

      // --- 2. CompareExecutiveSummary Component ---
      const compareSummaryId = "compare_executive_summary_widget";
      const compareSummaryH = 8.6; // Height: 8.6 rows
      initialWidgets.push({
        id: compareSummaryId,
        type: "CompareExecutiveSummary",
      });
      initialLayout.push({
        i: compareSummaryId,
        x: 0,
        y: yPos, // Pichle widget ki ending position
        w: 12, // Full width
        h: compareSummaryH,
        minH: 8, // Minimum height set karein
        isResizable: true,
      });
      // 🌟 FIX: Y-position ko sirf height se badhayein
      yPos += compareSummaryH;

      // --- 3. EditableHeader Components ---
      const headerH = 1.5; // Header height: 1.5 rows
      staticWidgetHeaders.forEach((hid) => {
        const headerId = `custom_header_${hid}`;
        initialWidgets.push({ id: headerId, type: "EditableHeader", hid });
        initialLayout.push({
          i: headerId,
          x: 0,
          y: yPos, // Pichle item ki ending position
          w: 12, // Full width
          h: headerH,
          isResizable: false, // Resize disable karein
          maxH: headerH, // Height fixed
          minH: headerH, // Height fixed
        });
        // 🌟 FIX: Y-position ko sirf height se badhayein (ya thoda gap jiske liye aapne 2 set kiya tha)
        yPos += 1.5; // Header height use karein
      });

      setLayout(initialLayout);
      setWidgets(initialWidgets);
    }, [staticWidgetHeaders, startDate, clientSeq, apibaseurl, token]);

    // Fetch header metadata (created dates) so we can order header/csv/comment by creation time
    useEffect(() => {
      let mounted = true;
      const fetchMetaFor = async (hid) => {
        // local placeholder: header_<ts>
        try {
          if (typeof hid === 'string' && hid.startsWith('header_')) {
            const parts = hid.split('_');
            const ts = parseInt(parts[1], 10) || Date.now();
            return { id: hid, createdTs: ts };
          }
          // server-side header: try fetch
          const resp = await fetch(`${apibaseurl}/api/Header/get-by-id?id=${encodeURIComponent(hid)}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          });
          if (!resp.ok) return { id: hid, createdTs: Date.now() };
          const data = await resp.json().catch(() => null) || {};
          const cd = data.createdAt || data.createdDate || data.CreatedDate || data.CreatedOn || data.createdOn || data.created || null;
          const ts = cd ? new Date(cd).getTime() : Date.now();
          return { id: hid, createdTs: ts, raw: data };
        } catch (e) {
          return { id: hid, createdTs: Date.now() };
        }
      };

      const load = async () => {
        if (!Array.isArray(staticWidgetHeaders) || staticWidgetHeaders.length === 0) {
          if (mounted) setHeaderMetas([]);
          return;
        }
        const all = await Promise.all(staticWidgetHeaders.map((h) => fetchMetaFor(h)));
        if (mounted) setHeaderMetas(all);
      };
      load();
      return () => { mounted = false; };
    }, [staticWidgetHeaders, apibaseurl, token]);

    // Fetch label summary links (extracted and transformed)
    // const fetchLabelSummaryLinks = async () => {
    //   if (!startDate) return;
    //   const formattedStart = formatDateLocal(startDate);
    //   try {
    //     const url = `${apibaseurl}/api/ExecutiveSummary/label-SummaryLinkOnly?_startDate=${formattedStart}&_cacheBuster=${new Date().getTime()}`;
    //     const resp = await fetch(url, {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: token ? `Bearer ${token}` : "",
    //       },
    //     });
    //     if (resp.ok) {
    //       const apiData = await resp.json();
    //       const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    //       const formattedLinks = [];
    //       apiData.forEach((item) => {
    //         const s = item.summary || "";
    //         let match;
    //         while ((match = linkRegex.exec(s)) !== null) {
    //           if (match[1] && match[2]) {
    //             const titleParts = match[1].split("|");
    //             const finalTitle = titleParts[titleParts.length - 1];
    //             formattedLinks.push({
    //               title: finalTitle.trim(),
    //               url: match[2],
    //             });
    //           }
    //         }
    //       });
    //       setLabelSummaryLinks(formattedLinks);
    //     } else {
    //       setLabelSummaryLinks([]);
    //     }
    //   } catch (e) {
    //     console.warn("Failed to fetch label summary links for UI", e);
    //     setLabelSummaryLinks([]);
    //   }
    // };

    // useEffect(() => {
    //   fetchLabelSummaryLinks().catch(console.error);
    // }, [clientSeq, apibaseurl, token, startDate]);

    const handleDownloadPdf = async () => {
      try {
        setIsGeneratingPdf(true); // Disable the button and show loader

        const monthYear = startDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        const [month, year] = monthYear.split(" ");
        const fileName = `${clientName || "dashboard"} ${reportType || "SEO"
          } Report ${month}_${year}.pdf`;

        await generatePdfFromElement(pdfContentRef.current, fileName, {
          logging: true,
        });

        setIsGeneratingPdf(false); // Re-enable after generation
      } catch (err) {
        setIsGeneratingPdf(false); // Ensure re-enabled on error
        setError("Failed to generate PDF. Please try again.");
      }
    };

    useEffect(() => {
      const fetchClientDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!clientSeq) {
            console.warn("No clientSeq found, skipping client details fetch");
            setClientName("");
            setWebsiteAddress("");
            setClientColor("");
            setClientLogo("");
            return;
          }
          const response = await fetch(
            `${apibaseurl}/api/AgencyClient/client-Details-by-user&ClientId?clientSeq=${clientSeq}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );
          const data = await response.json();

          if (data[0]?.isSuccess) {
            setClientName(data[0].clientName || "");
            setWebsiteAddress(data[0].webSiteAddress || "");
            setClientColor(data[0].clientColor || "");
            setClientLogo(data[0].clientLogo || "");
            setReportType(data[0].reportType || "SEO");
          } else {
            console.error("Failed to fetch client details:", data.message);
            setClientName("");
            setWebsiteAddress("");
            setClientColor("");
            setClientLogo("");
          }
        } catch (err) {
          console.error("Error fetching client details:", err);
          setClientName("");
          setWebsiteAddress("");
          setClientColor("");
          setClientLogo("");
        }
      };

      fetchClientDetails();
    }, [location.state?.clientSeq, clientSeq]);

    useEffect(() => {
      const convertImageToBase64 = async (imageUrl) => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();

          const reader = new FileReader();
          reader.onloadend = () => {
            setClientLogoBase64(reader.result);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error converting image to base64:", error);
          setClientLogoBase64("");
        }
      };

      if (clientLogo) {
        const logoUrl = `${apibaseurl}/${clientLogo}`;
        convertImageToBase64(logoUrl);
      }
    }, [clientLogo]);

    useEffect(() => {
      const fetchAgencyLogo = async () => {
        try {
          const token = localStorage.getItem("daToken");
          if (!token) return;

          const response = await fetch(
            `${apibaseurl}/api/DigitalAgency/get-user-profile`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.isSuccess) {
            const logoPath = data.data.logoPath;
            if (logoPath) {
              const logoUrl = `${apibaseurl}/${logoPath}`;
              const imgRes = await fetch(logoUrl);
              const blob = await imgRes.blob();
              const reader = new FileReader();
              reader.onloadend = () => {
                setAgencyLogoBase64(reader.result);
              };
              reader.readAsDataURL(blob);
            }
          } else {
            console.error("Failed to fetch agency logo");
          }
        } catch (error) {
          console.error("Error fetching agency logo:", error);
        }
      };

      fetchAgencyLogo();
    }, []);

    const renderAllCharts = selectedIntegration === "";
    const shouldRenderChart = (integration) =>
      renderAllCharts || selectedIntegration === integration;
    // Refs to CSV item wrappers so parent can scroll to them
    const csvRefs = useRef({});

    useImperativeHandle(ref, () => ({
      triggerExport: handleDownloadPdf,
      // Parent can call scrollToLatest('header' | 'csv') to scroll to newly created widgets
      scrollToLatest: (type) => {
        try {
          const tryScroll = (getEl) => {
            const el = getEl();
            if (el && typeof el.scrollIntoView === "function") {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              return true;
            }
            return false;
          };

          let attempts = 0;
          const maxAttempts = 6;
          const interval = 150; // ms

          const getHeaderEl = () => {
            if (
              !Array.isArray(staticWidgetHeaders) ||
              staticWidgetHeaders.length === 0
            )
              return null;
            const lastId = staticWidgetHeaders[staticWidgetHeaders.length - 1];
            // prefer direct ref
            const byRef = headerRefs.current[lastId];
            if (byRef) return byRef;
            // fallback to DOM query using data attribute
            try {
              const sel = document.querySelector(
                `[data-header-id="${String(lastId)}"]`
              );
              if (sel) return sel;
            } catch (e) {
              // ignore
            }
            // last resort: fuzzy match keys that contain lastId
            const keys = Object.keys(headerRefs.current || {});
            for (const k of keys) {
              if (
                String(k) === String(lastId) ||
                String(k).includes(String(lastId))
              ) {
                return headerRefs.current[k];
              }
            }
            return null;
          };

          const getCsvEl = () => {
            if (!Array.isArray(csvWidgets) || csvWidgets.length === 0)
              return null;
            const last = csvWidgets[csvWidgets.length - 1];
            const key = last?.keyword_Seq || last?.id || last;
            return csvRefs.current[key] || null;
          };

          const getCommentEl = () => {
            try {
              const keys = commentRefs?.current ? Object.keys(commentRefs.current) : [];
              if (!keys || keys.length === 0) return null;
              const lastKey = keys[keys.length - 1];
              const el = commentRefs.current[lastKey];
              if (el) return el;
              // fallback: try DOM query for data attr or last .static-comment
              try {
                const sel = document.querySelector('[data-comment-key="' + String(lastKey) + '"]');
                if (sel) return sel;
              } catch (e) { }
            } catch (e) {
              // ignore
            }
            return null;
          };

          const runner = () => {
            attempts += 1;
            try {
              if (type === "header") {
                if (tryScroll(getHeaderEl)) return;
              } else if (type === "csv") {
                if (tryScroll(getCsvEl)) return;
              } else if (type === "comments") {
                if (tryScroll(getCommentEl)) return;
              }
            } catch (e) {
              // ignore and retry
            }
            if (attempts < maxAttempts) setTimeout(runner, interval);
          };

          // start attempts
          runner();
        } catch (e) {
          console.warn("scrollToLatest error", e);
        }
      },
    }));

    // Parent now controls scrolling to newly created headers/csv via imperative handle.
    // Removed auto-scroll effect to avoid competing scrolls and focus jumps.
    // (previous implementation tracked header count and scrolled on increases)

    if (!clientSeq) {
      return (
        <Container
          fluid
          className="d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div className="text-center">
            <h4>
              No client selected. Please create a client to view the dashboard.
            </h4>
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => navigate("/clientdashboard")}
            >
              Create Client
            </Button>
          </div>
        </Container>
      );
    }

    return (
      <>
        {/* <ToastContainer /> */}
        {error && (
          <div className="mt-4 text-red-600 bg-red-100 p-4 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div ref={visibleRef} className={style.chart_container}>
          <div ref={pdfContentRef}>
            <Container
              fluid
              style={{
                width: "100%",
                backgroundColor: "#fafafa",
                padding: "0px 30px 30px 30px",
              }}
            >
              <Row className="mb-2">
                <div className={style.property_name}>
                  {clientName || "Loading..."}
                </div>
                <div style={{ fontSize: "13px" }}>
                  ({websiteAddress || "Loading..."})
                </div>
              </Row>

              <div className={style.banner_container}>
                <div
                  className={style.banner}
                  style={{
                    paddingBottom: "10px",
                  }}
                >
                  Monthly {reportType} Report -{" "}
                  {startDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  <p
                    style={{ margin: "3px", fontSize: "16px", fontWeight: 100 }}
                  >
                    Report Generated on{" "}
                    {new Date().toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* {Array.isArray(csvWidgets) && csvWidgets.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                    {csvWidgets.map((cw) => (
                    <CsvWidget
                      key={cw?.id || cw}
                      widgetId={cw?.id || cw}
                      initialRows={cw?.rows || []}
                      apibaseurl={apibaseurl}
                      token={token}
                      reportDate={startDate}
                      onRemove={
                        typeof onDeleteCsvWidget === "function"
                          ? onDeleteCsvWidget
                          : null
                      }
                    />
                  ))}
                </div>
              )} */}

              {/* 
              <div style={{ marginTop: 16, width: "100%" }}>
                <ResponsiveGridLayout
                  className="layout"
                  layouts={{ lg: layout }}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
                  draggableCancel=".no-drag"
                  draggableHandle=".drag-handle"


                  rowHeight={30}
                  onLayoutChange={onLayoutChange}

                  style={{ width: "100%" }}


                >
                  {widgets.map((widget) => {
                    const layoutItem = layout.find((l) => l.i === widget.id);
                    if (!layoutItem) return null;
                    const widgetWrapperProps = {
                      key: widget.id,
                      // Header ko drag handle de sakte hain ya unhe non-draggable rakh sakte hain.
                      // Hum ismein poore div ko drag-handle bana rahe hain:
                      className: "drag-handle",
                      style: {
                        // Grid item ko visually alag karne ke liye optional styling
                        // backgroundColor: 'white',
                        // border: '1px solid #ddd',
                        // borderRadius: '8px',
                        padding: '10px',
                        // overflow: 'auto', // Zaroori hai taaki content cut na ho
                      }
                    };

                    switch (widget.type) {

                      case "ExecutiveSummary":
                        return (
                          <div {...widgetWrapperProps}>
                            <ExecutiveSummary
                              showSummary={showSummary}
                              summaryText={summaryText}
                              summaryImages={summaryImages}
                              onSaveSummary={onSaveSummary}
                              onDeleteSummary={onDeleteSummary}
                              isFullHeight={true}
                            />
                          </div>
                        );
                      case "CompareExecutiveSummary":
                        return (
                          <div {...widgetWrapperProps}>
                            <CompareExecutiveSummary
                              startDate={startDate}

                              clientSeq={clientSeq}
                              isFullHeight={true}

                            />
                          </div>
                        );
                      case "EditableHeader":
                        const hid = widget.hid;
                        const isHovered = hoveredHeaderId === hid;
                        return (
                          <div
                            key={widget.id}
                            ref={(el) => (headerRefs.current[hid] = el)}
                            data-header-id={hid}
                            // className={`${style.table_header} no-drag`}
                            className={style.table_header}
                            onMouseEnter={() => setHoveredHeaderId(hid)} // On enter, set the id
                            onMouseLeave={() => setHoveredHeaderId(null)} // On leave, reset to null
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "15px ",
                              backgroundColor: "#8B5E3C",
                              color: "white",
                              borderRadius: 8,
                              width: "100%",
                              // height: "100%",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              position: 'relative',
                            }}
                          >

                            <EditableHeaderText
                              clientSeq={clientSeq}
                              headerId={hid}
                              apibaseurl={apibaseurl}
                              token={token}
                            />
                            {isHovered && ( // Icon tabhi render hoga jab isHovered true ho
                              <div
                                style={{
                                  position: 'absolute',
                                  top: -15,
                                  right: -10,
                                  display: 'flex',
                                  gap: '5px',
                                  backgroundColor: '#fff',
                                  borderRadius: 4,
                                  padding: '5px 8px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  zIndex: 10,
                                }}
                              >
                                <FiMove
                                  size={16}
                                  className="drag-handle" // <-- **Drag Handle class**
                                  // onMouseDown={(e) => e.stopPropagation()}
                                  // onPointerDown={(e) => e.stopPropagation()}
                                  style={{ cursor: "grab", color: "#333" }} // Dark color
                                  title="Drag Header"
                                />


                                <FiTrash2
                                  size={16}
                                  onClick={() => handleShowModal(hid)}
                                  // Delete par click/tap ko bhi roko taaki drag na ho
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  style={{ cursor: "pointer", color: "#e74c3c" }}
                                  title="Delete Header"
                                />
                              </div>
                            )}
                          </div>


                        );

                      default:
                        return null;
                    }
                  })}
                </ResponsiveGridLayout>
              </div> */}

              {/* <ExecutiveSummary
                showSummary={showSummary}
                summaryText={summaryText}
                summaryImages={summaryImages}
                onSaveSummary={onSaveSummary}
                onDeleteSummary={onDeleteSummary}
              />
              <CompareExecutiveSummary
                startDate={startDate}
                clientSeq={clientSeq}
              /> */}

              <div style={{ marginTop: 16, width: "98%", margin: "0px 0px 0px 17px" }}>
                {/* Combined chronological rendering of Headers, CSV and Comment Boxes */}
                {(() => {
                  const items = [];
                  // headers from headerMetas
                  (headerMetas || []).forEach((h) => {
                    items.push({ type: "header", id: h.id, ts: h.createdTs || Date.now() });
                  });

                  // csv widgets
                  if (Array.isArray(csvWidgets)) {
                    csvWidgets.forEach((cw) => {
                      const key = cw?.keyword_Seq || cw?.id || cw;
                      let ts = Date.now();
                      if (typeof cw === "string") {
                        if (cw.startsWith("csv_")) {
                          const p = String(cw).split("_")[1];
                          ts = parseInt(p, 10) || Date.now();
                        }
                      } else {
                        const cd = cw?.createdDate || cw?.createdAt || cw?.CreatedDate || cw?.createdOn || cw?.CreatedOn;
                        ts = cd ? new Date(cd).getTime() : (typeof cw?.id === 'string' && cw.id.startsWith('csv_') ? parseInt(String(cw.id).split('_')[1], 10) || Date.now() : Date.now());
                      }
                      items.push({ type: "csv", key, ts, cw });
                    });
                  }

                  // comments: prefer server timestamps, then local keys
                  const serverArr = Array.isArray(fetchedComments)
                    ? fetchedComments.map((c) => ({
                      key: String(c.commentBoxSeq || c.id || ""),
                      ts: (c?.CreatedDate || c?.createdAt || c?.createdDate || c?.CreatedOn || c?.createdOn) ? new Date(c?.CreatedDate || c?.createdAt || c?.createdDate || c?.CreatedOn || c?.createdOn).getTime() : Date.now(),
                      raw: c,
                    }))
                    : [];
                  const localArr = Array.isArray(staticCommentKeys)
                    ? staticCommentKeys.map((k) => {
                      if (typeof k === "string" && k.startsWith("comment_")) {
                        const p = String(k).split("_")[1];
                        return { key: k, ts: parseInt(p, 10) || Date.now() };
                      }
                      return { key: String(k), ts: Date.now() };
                    })
                    : [];
                  const commentMap = new Map();
                  serverArr.forEach((s) => commentMap.set(String(s.key), s));
                  localArr.forEach((l) => { if (!commentMap.has(String(l.key))) commentMap.set(String(l.key), l); });
                  for (const [k, v] of commentMap) items.push({ type: "comment", key: k, ts: v.ts, raw: v.raw });

                  // sort ascending by timestamp
                  items.sort((a, b) => (a.ts || 0) - (b.ts || 0));

                  return items.map((it) => {
                    if (it.type === "header") {
                      const hid = it.id;
                      const isHovered = hoveredHeaderId === hid;
                      return (
                        <div
                          key={hid}
                          ref={(el) => (headerRefs.current[hid] = el)}
                          data-header-id={hid}
                          className={style.table_header}
                          onMouseEnter={() => setHoveredHeaderId(hid)}
                          onMouseLeave={() => setHoveredHeaderId(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "15px ",
                            backgroundColor: "#8B5E3C",
                            color: "white",
                            borderRadius: 8,
                            width: "100%",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            position: "relative",
                          }}
                        >
                          <EditableHeaderText clientSeq={clientSeq} headerId={hid} apibaseurl={apibaseurl} token={token} />
                          {isHovered && (
                            <div
                              style={{
                                position: "absolute",
                                top: -15,
                                right: -10,
                                display: "flex",
                                gap: "5px",
                                backgroundColor: "#fff",
                                borderRadius: 4,
                                padding: "5px 8px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                zIndex: 10,
                              }}
                            >
                              <FiTrash2 size={16} onClick={() => handleShowModal(hid)} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} style={{ cursor: "pointer", color: "#e74c3c" }} title="Delete Header" />
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (it.type === "csv") {
                      const key = it.key;
                      return (
                        <div key={key} ref={(el) => (csvRefs.current[key] = el)} style={{ width: "100%" }}>
                          <CsvWidget widgetId={it.cw?.id || it.key} initialRows={it.cw?.rows || []} initialFileName={it.cw?.fileName || null} apibaseurl={apibaseurl} token={token} reportDate={startDate} onRemove={typeof onDeleteCsvWidget === "function" ? onDeleteCsvWidget : null} onUploaded={typeof onCsvUploadComplete === 'function' ? onCsvUploadComplete : undefined} />
                        </div>
                      );
                    }
                    // comments
                    if (it.type === "comment") {
                      return (
                        <div key={it.key} style={{ width: "100%" }}>
                          <StaticCommentRenderer commentKeys={[it.key]} commentRefs={commentRefs} fetchedComments={fetchedComments} onDeleteComment={handleDeleteComment} onSaved={handleCommentSaved} reportDate={startDate} />
                        </div>
                      );
                    }
                    return null;
                  });
                })()}
              </div>




              {shouldRenderChart("Google Analytics 4") && propertyid && (
                <ChartGA4
                  propertyid={propertyid}
                  startDate={startDate}
                  endDate={endDate}
                  ConversionRate={ConversionRate}
                  Traffic={Traffic}
                  BounceRatePercentage={BounceRatePercentage}
                  Devices={Devices}
                  style={style}
                  DayBydDayUser={DayBydDayUser}
                  activeUser={activeUser}
                  newUserDayByDay={newUserDayByDay}
                  UserEngagementDayByDay={UserEngagementDayByDay}
                  TotalUserByCountry={TotalUserByCountry}
                  TotalUserByCity={TotalUserByCity}
                  TotalUserByLanguage={TotalUserByLanguage}
                  TotalUserByDeviceBrowser={TotalUserByDeviceBrowser}
                  UserEngagementByCountry={UserEngagementByCountry}
                  KeyEventCountry={KeyEventCountry}
                  TotalPageUsers={TotalPageUsers}
                  PageViewPerDay={PageViewPerDay}
                  TrafficSourcePerPage={TrafficSourcePerPage}
                  engSessions={engSessions}
                  engSessionsDevices={engSessionsDevices}
                  CampaignTable={CampaignTable}
                  BounceRateDevices={BounceRateDevices}
                  TotalDeviceUsersDayWise={TotalDeviceUsersDayWise}
                  CountByDevice={CountByDevice}
                  KeyEventsByDevice={KeyEventsByDevice}
                  EnagementRateChannel={EnagementRateChannel}
                  SessionTable={SessionTable}
                  GA4HighLight={GA4HighLight}
                  SessionByDevice={SessionByDevice}
                  AverageEngagement={AverageEngagement}
                  TotalUserMap={TotalUserMap}
                  sessions={sessions}
                  showSummary={showSummary}
                  summaryText={summaryText}
                  summaryImages={summaryImages}
                  onSaveSummary={onSaveSummary}
                  onDeleteSummary={onDeleteSummary}
                />
              )}

              {shouldRenderChart("Google Search Console") && gsC_id && (
                <GoogleConsoleCharts
                  propertyid={propertyid}
                  siteUrl={gsC_id}
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                  GoogleOrganicRanking={GoogleOrganicRanking}
                  PopularContent={PopularContent}
                  PerformanceByCountry={PerformanceByCountry}
                  PerformanceByDevices={PerformanceByDevices}
                  SearchClicksGsc={SearchClicksGsc}
                  SitemapTableApi={SitemapTableApi}
                  SecurityCheckApi={SecurityCheckApi}
                  GoogleMapRanking={GoogleMapRanking}
                  SearchClicksGscOneMonth={SearchClicksGscOneMonth}
                  ExcelSearchQueries={ExcelSearchQueries}
                  Top5SearchQueries={Top5SearchQueries}
                  Top5Pages={Top5Pages}
                />
              )}

              {shouldRenderChart("Google My Business") && gmbLocation_Id && (
                <ChartGMB
                  GMBLocation_Id={gmbLocation_Id}
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                  DesktopMaps={DesktopMaps}
                  SearchKeywords={SearchKeywords}
                  GMBAccount_Id={gmbAccount_Id}
                  TotalProfileImpression={TotalProfileImpression}
                  BusinessInteractions={BusinessInteractions}
                />
              )}

              {shouldRenderChart("Google Ads") && googleAdsCustomerId && (
                <ChartGAds
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                  googleAdsCustomerId={googleAdsCustomerId}
                  ClicksConversionCost={ClicksConversionCost}
                />
              )}
              {shouldRenderChart("Google Adsense") && gAdsensePublisherId && (
                <>
                  {GAdsenseReport.map((apiData) => (
                    <ChartGAdsense
                      key={apiData.id}
                      startDate={startDate}
                      endDate={endDate}
                      style={style}
                      gAdsensePublisherId={gAdsensePublisherId}
                      ApiData={apiData}
                    />
                  ))}
                </>
              )}

              {shouldRenderChart("Facebook") && fbPage_Id && (
                <ChartsFb
                  startDate={startDate}
                  endDate={endDate}
                  pageId={fbPage_Id}
                  FacebookUniqueImpressionApi={FacebookUniqueImpressionApi}
                  totalFollowers={totalFollowers}
                  totalPageLikes={totalPageLikes}
                  totalPost_Like_cmnt_share={totalPost_Like_cmnt_share}
                  TopFivePost={TopFivePost}
                />
              )}

              {shouldRenderChart("YouTube") && ytChannelId && (
                <ChartYoutube
                  ytChannel_Id={ytChannelId}
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                  SubscriberGainsAndLosses={SubscriberGainsAndLosses}
                  statistics={statistics}
                  channelLifetimeLikes={channelLifetimeLikes}
                  ChannelLikesMonthly={ChannelLikesMonthly}
                  engagementByCountry={engagementByCountry}
                />
              )}

              {shouldRenderChart("Instagram") && insta_Id && (
                <ChartInstagram
                  insta_Id={insta_Id}
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                  TotalFollowers={TotalFollowers}
                  GetPostsByDateRange={GetPostsByDateRange}
                  GetPostsDetailsByDateRange={GetPostsDetailsByDateRange}
                />
              )}
              {shouldRenderChart("LinkedIn") && linkedInUserId && (
                <ChartsLinkedIn
                  linkedInUserId={linkedInUserId}
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                />
              )}
              {shouldRenderChart("Shopify") && shopifyId && (
                <ChartShopify
                  shopifyId={shopifyId}
                  startDate={startDate}
                  endDate={endDate}
                  style={style}
                  ShopifyReports={ShopifyReports}
                />
              )}

              {/* {shouldRenderChart("Google Lighthouse") && websiteAddress && (
              <GoogleLightHouse
                lighthouseurl={websiteAddress}
                style={style}
                LighthouseScoreApi={LighthouseScoreApi}
              />
            )} */}
              {/* <ChartsLinkedIn /> */}

              {/* <ExecutiveSummaryContainer
                startDate={startDate}
                clientSeq={clientSeq}
              /> */}
              {/* Static widget: one or more editable headers at the end of the dashboard */}
              <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                  <Modal.Title>🗑️ Delete Header</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    Are you sure you want to delete this custom header? This
                    action cannot be undone.
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleConfirmDelete}>
                    Confirm Delete
                  </Button>
                </Modal.Footer>
              </Modal>
            </Container>
          </div>
        </div>
      </>
    );
  }
);

export default ChartPageSecond;
