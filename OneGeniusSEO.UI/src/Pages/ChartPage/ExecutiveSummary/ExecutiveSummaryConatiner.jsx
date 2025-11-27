import React, { useState, useEffect } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import { LinkNode, $createLinkNode } from "@lexical/link";
import { FaPencilAlt } from "react-icons/fa";
import { PiNotePencilFill } from "react-icons/pi";
import { format, addMonths } from "date-fns";
import ImageUploadButton from "./Image/ImageUploadsButton";
import ImagePlugin from "./Image/ImagePlugin";
import { ImageNode, $createImageNode } from "./Image/ImageNode";
import {
  RemovableImageNode,
  $createRemovableImageNode,
} from "./Image/RemovableImageNode";
import RemovableImagePlugin from "./Image/RemovableImagePlugin";
import NewContentButton from "../ExecutiveSummary/LinkDoc/NewContentButton";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $nodesOfType,
  $isParagraphNode,
  $isTextNode,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  $createListNode,
  $createListItemNode,
} from "@lexical/list";
import { $generateNodesFromDOM } from "@lexical/html";
import style from "./ExecutiveSummary.module.css";
import { formatDateLocal } from "../../../utils/FormatDate";

// --- LINK FEATURE HELPER FUNCTIONS ---
const LINK_REGEX =
  /\[(G-DOC|G-DRIVE)\|([^\]]+)\]\(([^)]+)\)( \[NOTES\|(.*?)\])?/;

function serializeLinkNode(node) {
  if (
    node.getType() === "paragraph" &&
    node.getChildren().length === 1 &&
    node.getChildren()[0].getType() === "link"
  ) {
    const linkNode = node.getChildren()[0];
    const url = linkNode.getURL();
    const text = linkNode.getTextContent();
    const notesRegex = / \[NOTES\|(.*)\]/;
    const notesMatch = text.match(notesRegex);

    let title = text;
    let notesContent = "";
    if (notesMatch) {
      title = text.replace(notesRegex, "");
      notesContent = ` [NOTES|${notesMatch[1]}]`;
    }

    const icon = title.startsWith("📄") ? "G-DOC" : "G-DRIVE";
    return `[${icon}|${title}](${url})${notesContent}`;
  }
  return null;
}

function deserializeLinkString(line) {
  const match = line.match(LINK_REGEX);
  if (match) {
    const [, type, title, url, notesBlock, notesContent] = match;
    const paragraph = $createParagraphNode();
    const linkNode = $createLinkNode(url);

    let linkText = `${title}`;
    if (notesContent) {
      linkText += ` [NOTES|${notesContent}]`;
    }

    linkNode.append($createTextNode(linkText));
    paragraph.append(linkNode);
    return paragraph;
  }
  return null;
}

function renderLinkString(line) {
  const match = line.match(LINK_REGEX);
  if (match) {
    const [, type, title, url, notesBlock, notesContent] = match;
    const notesHtml = notesContent
      ? `<blockquote class="rendered-notes">${notesContent}</blockquote>`
      : "";
    return `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></p>${notesHtml}`;
  }
  return null;
}
// --- END OF LINK FEATURE HELPERS ---

const Toolbar = ({ onImageSelected }) => {
  const [editor] = useLexicalComposerContext();

  return (
    <div
      className="toolbar mb-2"
      style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
    >
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        style={{ minWidth: "40px" }}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        style={{ minWidth: "40px" }}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        style={{ minWidth: "40px" }}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const heading = $createHeadingNode("h3");
              const text = $createTextNode(selection.getTextContent());
              heading.append(text);
              selection.insertNodes([heading]);
            }
          });
        }}
        style={{ minWidth: "40px" }}
      >
        H3
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        style={{ minWidth: "40px" }}
      >
        • List
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        style={{ minWidth: "40px" }}
      >
        1. List
      </button>
      <ImageUploadButton onImageSelected={onImageSelected} />
      <NewContentButton />
    </div>
  );
};

const ExecutiveSummaryItem = ({
  summary,
  onSave,
  onDelete,
  onCancel,
  isEditing: initialEditing,
  title,
  showInlineEdit = true,
  forceEditing = false,
  summaries,
  setSummaries,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing || forceEditing);
  const [tempSummaryText, setTempSummaryText] = useState(
    summary?.summary || ""
  );
  const [attachedImages, setAttachedImages] = useState([]);
  const [editorKey, setEditorKey] = useState(0);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Custom paste handler for Google Drive links
  const GoogleDrivePastePlugin = () => {
    const [editor] = useLexicalComposerContext();

    const handlePaste = (event) => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData("text");

      // Check if pasted text is a Google Drive link
      const driveLinkRegex =
        /^https:\/\/(docs\.google\.com|drive\.google\.com)\//;
      if (driveLinkRegex.test(pastedText.trim())) {
        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Create a new paragraph with the link, ensuring it starts on a new line
            const paragraph = $createParagraphNode();
            const linkNode = $createLinkNode(pastedText);
            linkNode.append($createTextNode(pastedText));
            paragraph.append(linkNode);

            // Insert a paragraph break before the link if needed
            const anchorNode = selection.anchor.getNode();
            const parent = anchorNode.getParent();

            if (parent && parent.getType() === "paragraph") {
              const textContent = parent.getTextContent();
              if (textContent.trim() !== "") {
                // Add space before link
                parent.append($createTextNode(" "));
              }
            }

            selection.insertNodes([paragraph]);
          }
        });

        return true;
      }

      return false;
    };

    return (
      <div onPaste={handlePaste} style={{ width: "100%", height: "100%" }} />
    );
  };

  useEffect(() => {
    if (forceEditing) {
      setIsEditing(true);
      setAttachedImages([]);
      setEditorKey((prev) => prev + 1);
    }
  }, [forceEditing]);

  // Sync attachedImages with summary.images when summary changes
  useEffect(() => {
    if (summary?.images && Array.isArray(summary.images)) {
      const imageObjects = summary.images
        .filter(Boolean)
        .map((url) => ({ dataUrl: url }))
        .slice(0, 3);
      setAttachedImages(imageObjects);
    } else {
      setAttachedImages([]);
    }
  }, [summary?.images]);

  const handleSave = () => {
    const dataUrlToFile = (dataUrl, filename = "image.png") => {
      try {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
      } catch (e) {
        return null;
      }
    };

    const fetchUrlAsFile = async (url, idx) => {
      try {
        const res = await fetch(url, { mode: "cors" });
        const blob = await res.blob();
        const ext = (blob.type && blob.type.split("/")[1]) || "png";
        return new File([blob], `image_${idx}.${ext}`, {
          type: blob.type || "image/png",
        });
      } catch (e) {
        return null;
      }
    };

    const buildFiles = async () => {
      const files = [];
      const capped = attachedImages.filter(Boolean).slice(0, 3);
      for (let i = 0; i < capped.length; i++) {
        const img = capped[i];
        if (img.file) {
          files.push(img.file);
          continue;
        }
        if (img.dataUrl) {
          if (img.dataUrl.startsWith("data:")) {
            const f = dataUrlToFile(img.dataUrl, `image_${i}.png`);
            if (f) files.push(f);
          } else {
            const f = await fetchUrlAsFile(img.dataUrl, i);
            if (f) files.push(f);
          }
        }
      }
      return files.slice(0, 3);
    };

    buildFiles().then((allFiles) => {
      const processedText = tempSummaryText.replace(/\[IMAGE:([^\]]+)\]/g, "");
      // Check if there are any links in the text
      const hasLinks = LINK_REGEX.test(processedText);
      if (processedText.trim() !== "" || allFiles.length > 0 || hasLinks) {
        onSave(processedText, allFiles);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    });
  };

  const handleCancel = () => {
    setTempSummaryText(summary?.summary || "");
    setIsEditing(false);
    // Don't reset attachedImages here - let it sync with editor state
    setEditorKey((prev) => prev + 1);
    if (onCancel) onCancel();
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Don't reset attachedImages here - let it sync with editor state
    setEditorKey((prev) => prev + 1);
  };

  const renderSummaryText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let html = "";
    let inUnorderedList = false;
    let inOrderedList = false;
    const closeLists = () => {
      if (inUnorderedList) {
        html += "</ul>";
        inUnorderedList = false;
      }
      if (inOrderedList) {
        html += "</ol>";
        inOrderedList = false;
      }
    };

    lines.forEach((line) => {
      const linkHtml = renderLinkString(line);
      if (linkHtml) {
        closeLists();
        html += linkHtml;
      } else if (line.startsWith("# ")) {
        closeLists();
        html += `<h3>${line.substring(2)}</h3>`;
      } else if (line.startsWith("- ")) {
        if (inOrderedList) closeLists();
        if (!inUnorderedList) {
          html += "<ul>";
          inUnorderedList = true;
        }
        html += `<li>${line.substring(2)}</li>`;
      } else if (line.match(/^\d+\.\s/)) {
        if (inUnorderedList) closeLists();
        if (!inOrderedList) {
          html += "<ol>";
          inOrderedList = true;
        }
        html += `<li>${line.replace(/^\d+\.\s/, "")}</li>`;
      } else if (line.trim() !== "") {
        closeLists();
        const imageMatch = line.match(/^\[IMAGE:([^\]]+)\]$/);
        if (imageMatch) {
          html += `<img src="${imageMatch[1]}" alt="summary-image" style="max-width: 100%; height: auto;" />`;
        } else {
          html += `<p>${line}</p>`;
        }
      } else {
        closeLists();
      }
    });

    closeLists();
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // FIXED: Prevent duplicate images by properly managing text content and existing images
  const prepareInitialContent = () => {
    // Extract image URLs from existing images array
    const existingImageUrls = Array.isArray(summary?.images)
      ? summary.images.filter(Boolean)
      : [];

    // If there's no text content, we still want to show existing images
    if (!tempSummaryText) {
      return { textContent: "", existingImageUrls };
    }

    // Remove image placeholders from text content to prevent duplication
    const cleanTextContent = tempSummaryText
      .replace(/\[IMAGE:([^\]]+)\]\n?/g, "")
      .trim();

    return { textContent: cleanTextContent, existingImageUrls };
  };

  const editorConfig = {
    namespace: `ExecutiveSummaryEditor-${
      summary?.summarySeq || "new"
    }-${editorKey}`,
    nodes: [
      ListNode,
      ListItemNode,
      HeadingNode,
      LinkNode,
      ImageNode,
      RemovableImageNode,
    ],
    onError: (error) => console.error("Lexical Error:", error),
    theme: {
      paragraph: style.summary_para,
      heading: {
        h3: style.summary_heading,
      },
      list: {
        ul: style.summary_para,
        ol: style.summary_para,
      },
      text: {
        bold: style.bold,
        italic: style.italic,
        underline: style.underline,
      },
    },
    // FIX: Initialize editor state even when there are only images
    editorState:
      tempSummaryText ||
      (Array.isArray(summary?.images) && summary.images.length > 0)
        ? (editor) => {
            const root = $getRoot();
            root.clear();

            const { textContent, existingImageUrls } = prepareInitialContent();

            // First, add text content without image placeholders
            if (textContent) {
              const lines = textContent
                .split("\n")
                .filter((line) => line.trim());
              let currentList = null;

              lines.forEach((line) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;

                // LINK LOGIC
                const linkNode = deserializeLinkString(trimmedLine);
                if (linkNode) {
                  currentList = null;
                  root.append(linkNode);
                } else if (trimmedLine.startsWith("- ")) {
                  if (!currentList || currentList.getListType() !== "bullet") {
                    currentList = $createListNode("bullet");
                    root.append(currentList);
                  }
                  const listItem = $createListItemNode();
                  const dom = new DOMParser().parseFromString(
                    trimmedLine.substring(2),
                    "text/html"
                  );
                  const nodes = $generateNodesFromDOM(editor, dom);
                  if (nodes.length > 0)
                    nodes.forEach((node) => listItem.append(node));
                  currentList.append(listItem);
                } else if (trimmedLine.match(/^\d+\.\s/)) {
                  if (!currentList || currentList.getListType() !== "number") {
                    currentList = $createListNode("number");
                    root.append(currentList);
                  }
                  const listItem = $createListItemNode();
                  const dom = new DOMParser().parseFromString(
                    trimmedLine.replace(/^\d+\.\s/, ""),
                    "text/html"
                  );
                  const nodes = $generateNodesFromDOM(editor, dom);
                  if (nodes.length > 0)
                    nodes.forEach((node) => listItem.append(node));
                  currentList.append(listItem);
                } else if (trimmedLine.startsWith("# ")) {
                  currentList = null;
                  const heading = $createHeadingNode("h3");
                  const dom = new DOMParser().parseFromString(
                    trimmedLine.substring(2),
                    "text/html"
                  );
                  const nodes = $generateNodesFromDOM(editor, dom);
                  if (nodes.length > 0)
                    nodes.forEach((node) => heading.append(node));
                  root.append(heading);
                } else {
                  currentList = null;
                  const paragraph = $createParagraphNode();
                  const dom = new DOMParser().parseFromString(
                    trimmedLine,
                    "text/html"
                  );
                  const nodes = $generateNodesFromDOM(editor, dom);
                  if (nodes.length > 0)
                    nodes.forEach((node) => paragraph.append(node));
                  root.append(paragraph);
                }
              });
            }

            // Then, add existing images ONLY ONCE from the images array
            existingImageUrls.forEach((src) => {
              if (src) {
                const imageNode = $createRemovableImageNode(
                  src,
                  "",
                  undefined,
                  handleImageRemove,
                  summary?.summarySeq,
                  apibaseurl,
                  token
                );
                root.append(imageNode);
              }
            });

            // FIX: If there are no text nodes but there are images, add an empty paragraph
            // to ensure the editor has proper structure
            if (!textContent && existingImageUrls.length > 0) {
              const paragraph = $createParagraphNode();
              root.append(paragraph);
            }
          }
        : null,
  };

  // FIXED: Better image reconciliation without duplication
  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const output = [];
      const imageNodes = $nodesOfType(ImageNode);
      const removableImageNodes = $nodesOfType(RemovableImageNode);
      const allImageNodes = [...imageNodes, ...removableImageNodes];

      // Get current image URLs from editor
      const currentImageUrls = allImageNodes
        .map((node) => {
          try {
            if (typeof node.getSrc === "function") return node.getSrc();
            if (node && node.__src) return node.__src;
            const latest =
              node && typeof node.getLatest === "function"
                ? node.getLatest()
                : null;
            return latest && latest.__src ? latest.__src : null;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      // Remove duplicates and update attached images
      const uniqueImageUrls = [...new Set(currentImageUrls)];

      setAttachedImages((prevImages) => {
        const newImageObjects = [];

        // Add unique images from editor
        uniqueImageUrls.forEach((url) => {
          const existing = prevImages.find((img) => img && img.dataUrl === url);
          if (existing) {
            newImageObjects.push(existing);
          } else {
            newImageObjects.push({ dataUrl: url });
          }
        });

        // Add any newly uploaded images that aren't in editor yet
        prevImages.forEach((img) => {
          if (img && img.file && !uniqueImageUrls.includes(img.dataUrl)) {
            newImageObjects.push(img);
          }
        });

        return newImageObjects.slice(0, 3);
      });

      // Process content without image placeholders in text
      const processNode = (node, listContext = null) => {
        const nodeType = node.getType();

        if (nodeType === "image" || nodeType === "removable-image") {
          // Don't add image placeholders to text content
          // Images are handled separately through attachedImages state
          return;
        }

        if (nodeType === "link") {
          const url = node.getURL();
          const text = node.getTextContent();
          const notesRegex = / \[NOTES\|(.*)\]/;
          const notesMatch = text.match(notesRegex);

          let title = text;
          let notesContent = "";
          if (notesMatch) {
            title = text.replace(notesRegex, "");
            notesContent = ` [NOTES|${notesMatch[1]}]`;
          }

          const icon = title.startsWith("📄") ? "G-DOC" : "G-DRIVE";
          const linkText = `[${icon}|${title}](${url})${notesContent}`;

          if (listContext) {
            return linkText;
          } else {
            output.push(linkText);
          }
          return;
        }

        if (nodeType === "text") {
          let text = node.getTextContent();
          const format = node.getFormat();

          if (format & 1) text = `<b>${text}</b>`;
          if (format & 2) text = `<i>${text}</i>`;
          if (format & 4) text = `<u>${text}</u>`;

          if (listContext) {
            return text;
          } else {
            if (text.trim()) output.push(text);
          }
          return;
        }

        if (nodeType === "paragraph") {
          const children = node.getChildren();
          let paragraphContent = "";

          children.forEach((child) => {
            const childType = child.getType();

            if (childType === "text") {
              let text = child.getTextContent();
              const format = child.getFormat();
              if (format & 1) text = `<b>${text}</b>`;
              if (format & 2) text = `<i>${text}</i>`;
              if (format & 4) text = `<u>${text}</u>`;
              paragraphContent += text;
            } else if (childType === "link") {
              const result = processNode(child, true);
              if (result) paragraphContent += result;
            }
          });

          if (paragraphContent.trim()) {
            if (listContext) {
              return paragraphContent;
            } else {
              output.push(paragraphContent);
            }
          }
          return;
        }

        if (nodeType === "heading") {
          const headingText = node.getTextContent();
          if (headingText.trim()) {
            output.push(`# ${headingText}`);
          }
          return;
        }

        if (nodeType === "list") {
          const listType = node.getListType();
          const listItems = node.getChildren();

          listItems.forEach((listItem, index) => {
            const prefix = listType === "bullet" ? "- " : `${index + 1}. `;
            let listItemContent = "";

            const listItemChildren = listItem.getChildren();
            listItemChildren.forEach((child) => {
              const childResult = processNode(child, true);
              if (childResult) {
                listItemContent += childResult;
              }
            });

            if (listItemContent.trim()) {
              output.push(prefix + listItemContent);
            }
          });
          return;
        }

        if (nodeType === "listitem") {
          const children = node.getChildren();
          let listItemContent = "";

          children.forEach((child) => {
            const childResult = processNode(child, true);
            if (childResult) {
              listItemContent += childResult;
            }
          });

          return listItemContent;
        }
      };

      // Process all root level nodes
      root.getChildren().forEach((node) => {
        processNode(node);
      });

      // Update text content without image placeholders
      const newText = output.join("\n");
      if (
        newText !== tempSummaryText.replace(/\[IMAGE:([^\]]+)\]\n?/g, "").trim()
      ) {
        setTempSummaryText(newText);
      }
    });
  };

  const handleImageSelected = (file, dataUrl) => {
    setAttachedImages((prev) => {
      const newImage = { file, dataUrl };
      const updated = [...prev, newImage];
      return updated.slice(0, 3);
    });
  };

  const handleImageRemove = async (imageSrc) => {
    // Update the current summary's images immediately for UI responsiveness
    if (
      summary?.images &&
      Array.isArray(summary.images) &&
      summary.images.includes(imageSrc)
    ) {
      // Update local summary state immediately
      const updatedImages = (summary.images || []).filter(
        (img) => img !== imageSrc
      );

      // Update the summaries state immediately if setSummaries is available
      if (setSummaries) {
        setSummaries((prev) =>
          prev.map((s) =>
            s.summarySeq === summary.summarySeq
              ? {
                  ...s,
                  images: updatedImages,
                }
              : s
          )
        );
      }

      // Also update the current summary object reference
      if (summary.summarySeq) {
        summary.images = updatedImages;
      }

      // Update the summary with the remaining images (async, don't wait for it)
      try {
        const remainingImages = updatedImages; // Use the updated images, not the old ones
        const formData = new FormData();
        formData.append("summary", summary.summary || "");
        formData.append("summaryFlag", "labelsummary");
        formData.append("createdDate", formatDateLocal(startDate));
        formData.append(
          "existingImageUrls",
          JSON.stringify(remainingImages.slice(0, 3))
        );

        const response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/update/${summary.summarySeq}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          console.error("Failed to update summary after image removal");
          // Optionally revert the change if API call fails
        }
      } catch (err) {
        console.error("Error updating summary after image removal:", err);
        // Optionally revert the change if API call fails
      }
    }

    // Force editor to re-render to reflect the change immediately
    // The handleEditorChange will sync the attachedImages state
    setEditorKey((prev) => prev + 1);
  };

  return (
    <div
      className="mb-4"
      style={{
        borderBottom: "1px solid #eee",
        paddingBottom: "20px",
        borderRadius: "8px",
        padding: "10px",
        border: "1px solid grey",
      }}
    >
      <h4
        className={`${style.summary_text} mb-2 mt-2`}
        style={{ fontSize: "16px", textDecoration: "none" }}
      >
        {summary && showInlineEdit && (
          <>
            <FaPencilAlt
              title="Edit"
              className={`${style.edit_button} pdf-ignore `}
              onClick={handleEdit}
              style={{
                cursor: "pointer",
                marginLeft: "12px",
                fontSize: "14px",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
            <span
              className={style.delete_button}
              onClick={() => onDelete(summary.summarySeq)}
              style={{
                cursor: "pointer",
                marginLeft: "12px",
                color: "white",
                fontSize: "14px",
                display: "none",
              }}
            >
              [Delete]
            </span>
          </>
        )}
      </h4>
      {isEditing ? (
        <Form.Group className="mb-3">
          <LexicalComposer key={editorKey} initialConfig={editorConfig}>
            <Toolbar onImageSelected={handleImageSelected} />
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={`${style.textarea} form-control`}
                  style={{
                    minHeight: "200px",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    padding: "12px",
                  }}
                />
              }
              placeholder={
                <div
                  className="placeholder"
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    color: "#999",
                    fontSize: "16px",
                  }}
                >
                  Enter summary...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <ImagePlugin
              onImageRemove={handleImageRemove}
              summarySeq={summary?.summarySeq}
              apibaseurl={apibaseurl}
              token={token}
            />
            <RemovableImagePlugin
              onImageRemove={handleImageRemove}
              summarySeq={summary?.summarySeq}
              apibaseurl={apibaseurl}
              token={token}
            />
            <OnChangePlugin onChange={handleEditorChange} />
            <GoogleDrivePastePlugin />
            <div className="mt-3" style={{ display: "flex", gap: "10px" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                style={{ padding: "8px 20px" }}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                style={{ padding: "8px 20px" }}
              >
                Cancel
              </Button>
            </div>
          </LexicalComposer>
        </Form.Group>
      ) : (
        // FIX: Show the container if there's text OR images
        (summary?.summary ||
          (Array.isArray(summary?.images) && summary.images.length > 0)) && (
          <div
            className={`${style.summary_container} mb-3`}
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {summary?.summary && renderSummaryText(summary.summary)}
            {Array.isArray(summary?.images) && summary.images.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "10px",
                }}
              >
                {summary.images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`summary-${idx}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

const ExecutiveSummaryContainer = ({
  startDate,
  clientSeq,
  onInitialSummaryFetch,
}) => {
  const [summaries, setSummaries] = useState([]);
  const [SummaryFlag, setSummaryFlag] = useState("labelsummary");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [forceEditIds, setForceEditIds] = useState([]);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedMonthYear = startDate
    ? format(new Date(startDate), "MMM yy")
    : "";
  const formattedMonthPlusOne = startDate
    ? format(addMonths(new Date(startDate), 1), "MMM yy")
    : "";
  useEffect(() => {
    const fetchSummaries = async () => {
      if (!token || !clientSeq) return;

      try {
        const formattedStart = formatDateLocal(startDate);
        const response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/label-Summary?_startDate=${formattedStart}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const summaryData = await response.json();
          setSummaries(summaryData);
          setForceEditIds([]);
          if (onInitialSummaryFetch) {
            onInitialSummaryFetch(summaryData);
          }
        } else {
          console.error(
            "Failed to fetch executive summaries:",
            response.statusText
          );
          setSummaries([]);
        }
      } catch (err) {
        console.error("Error fetching executive summaries:", err);
        setSummaries([]);
        setForceEditIds([]);
      }
    };

    fetchSummaries();
  }, [apibaseurl, token, clientSeq, startDate, onInitialSummaryFetch]);

  const handleAddNewSummary = () => {
    setIsAddingNew(true);
  };

  const handleSaveSummary = async (text, summarySeq, imageFiles = []) => {
    if (!token || !clientSeq) return;

    try {
      let response;
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;

      const formData = new FormData();
      formData.append("summary", text || "");
      formData.append("summaryFlag", SummaryFlag || "labelsummary");
      formData.append("createdDate", createdDate);
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach((file) => file && formData.append("Images", file));
      }

      if (summarySeq) {
        response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/update/${summarySeq}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        response = await fetch(`${apibaseurl}/api/ExecutiveSummary/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (response.ok) {
        const data = await response.json();
        const normalizedImages = (
          data.imageUrls ||
          data.images ||
          data.Images ||
          []
        ).slice(0, 3);
        if (summarySeq) {
          setSummaries((prev) =>
            prev.map((s) =>
              s.summarySeq === summarySeq
                ? {
                    ...s,
                    summary: text,
                    images: normalizedImages.length
                      ? normalizedImages
                      : s.images || [],
                  }
                : s
            )
          );
          setForceEditIds((prev) => prev.filter((id) => id !== summarySeq));
        } else {
          const created = normalizedImages.length
            ? { ...data, images: normalizedImages }
            : data;
          setSummaries((prev) => [...prev, created]);
          setIsAddingNew(false);
        }
      } else {
        console.error(
          `Failed to ${summarySeq ? "update" : "create"} executive summary:`,
          response.statusText
        );
      }
    } catch (err) {
      console.error(
        `Error ${summarySeq ? "updating" : "creating"} executive summary:`,
        err
      );
    }
  };

  const handleDeleteSummary = async (summarySeq) => {
    if (!token || !clientSeq || !summarySeq) return;

    try {
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;
      const response = await fetch(
        `${apibaseurl}/api/ExecutiveSummary/delete/${summarySeq}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientSeq, createdDate }),
        }
      );

      if (response.ok) {
        setSummaries((prev) => prev.filter((s) => s.summarySeq !== summarySeq));
        setForceEditIds((prev) => prev.filter((id) => id !== summarySeq));
      } else {
        console.error(
          "Failed to delete executive summary:",
          response.statusText
        );
        return false;
      }
    } catch (err) {
      console.error("Error deleting executive summary:", err);
      return false;
    }
    return true;
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
  };

  const handleHeaderClick = () => {
    if (summaries.length === 0) {
      setIsAddingNew(true);
      setForceEditIds([]);
    } else {
      const firstId = summaries[0]?.summarySeq;
      setForceEditIds(firstId ? [firstId] : []);
      setIsAddingNew(false);
    }
  };

  const handleCancelEdit = (summarySeq) => {
    setForceEditIds((prev) => prev.filter((id) => id !== summarySeq));
  };

  return (
    <div
      className="pb-3 mt-3"
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        background: "#fff",
      }}
    >
      <Table responsive bordered>
        <thead>
          <tr>
            <th className={style.table_header}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="m-0">
                  Task recommended for {formattedMonthPlusOne}
                </h6>
                <PiNotePencilFill
                  className="pdf-ignore"
                  onClick={handleHeaderClick}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={style.table_cell}>
              {summaries.length === 0 ? (
                <div
                  className="text-center p-3"
                  style={{ color: "gray", fontSize: "16px" }}
                ></div>
              ) : (
                summaries.map((summary) => (
                  <ExecutiveSummaryItem
                    key={`label-${summary.summarySeq}`}
                    summary={summary}
                    onSave={(text, files) =>
                      handleSaveSummary(text, summary.summarySeq, files)
                    }
                    onDelete={handleDeleteSummary}
                    onCancel={() => handleCancelEdit(summary.summarySeq)}
                    title={`Task recommended for ${formattedMonthYear}`}
                    showInlineEdit={false}
                    forceEditing={forceEditIds.includes(summary.summarySeq)}
                    summaries={summaries}
                    setSummaries={setSummaries}
                  />
                ))
              )}
              {isAddingNew && summaries.length === 0 && (
                <ExecutiveSummaryItem
                  onSave={(text, files) =>
                    handleSaveSummary(text, undefined, files)
                  }
                  onCancel={handleCancelNew}
                  isEditing={true}
                  title=""
                  showInlineEdit={false}
                  summaries={summaries}
                  setSummaries={setSummaries}
                />
              )}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default ExecutiveSummaryContainer;
