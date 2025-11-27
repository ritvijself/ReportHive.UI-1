// CompareExecutiveSummary.jsx
import React, { useState, useEffect, useRef } from "react";
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
import { FaPencilAlt, FaSave, FaTimes } from "react-icons/fa";
import { PiNotePencilFill } from "react-icons/pi";
import { format } from "date-fns";
import ImageUploadButton from "./Image/ImageUploadsButton";
import ImagePlugin from "./Image/ImagePlugin";
import RemovableImagePlugin from "./Image/CompareRemovableImagePlugin";
import { ImageNode, $createImageNode } from "./Image/CompareImageNode";
import {
  RemovableImageNode,
  $createRemovableImageNode,
} from "./Image/CompareRemovableImageNode";
import NewContentButton from "../ExecutiveSummary/LinkDoc/NewContentButton";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
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
import DOMPurify from "dompurify"; // For HTML sanitization

// --- LINK FEATURE HELPER FUNCTIONS ---
// Keep the bracketed LINK_REGEX for backwards compatibility with stored items
const LINK_REGEX =
  /\[(G-DOC|G-DRIVE)\|([^\]]+)\]\(([^)]+)\)( \[NOTES\|(.*?)\])?/;

// helper to detect google drive / docs/presentation links (you can expand)
function isGoogleDocsUrl(url) {
  try {
    return /docs\.google\.com\/presentation|docs\.google\.com\/document|drive\.google\.com/.test(
      url
    );
  } catch {
    return false;
  }
}

// Serialize any LinkNode found inside a paragraph or standalone paragraph that contains a single link.
// For paragraphs with mixed content we build inline content (tags preserved for bold/italic/underline).
function serializeParagraphNodeToLine(node) {
  // If node is a paragraph, loop children and build a line
  const parts = [];
  node.getChildren().forEach((child) => {
    const type = child.getType ? child.getType() : null;
    if (type === "link") {
      // LinkNode: wrap using bracket format so stored format is consistent
      const url = child.getURL ? child.getURL() : "";
      // get display text without NOTES suffix
      let text = child.getTextContent ? child.getTextContent() : url;
      const notesMatch = text.match(/\s\[NOTES\|(.*)\]$/);
      let notesPart = "";
      if (notesMatch) {
        notesPart = ` [NOTES|${notesMatch[1]}]`;
        text = text.replace(/\s\[NOTES\|.*\]$/, "");
      }
      const icon = isGoogleDocsUrl(url) ? "G-DOC" : "G-DRIVE";
      parts.push(`[${icon}|${text}](${url})${notesPart}`);
    } else {
      // Text or other inline nodes: respect simple formatting
      let text = child.getTextContent ? child.getTextContent() : "";
      const format = child.getFormat ? child.getFormat() : 0;
      if (format & 4) text = `<u>${text}</u>`;
      if (format & 2) text = `<i>${text}</i>`;
      if (format & 1) text = `<b>${text}</b>`;
      parts.push(text);
    }
  });
  return parts.join("");
}

// New serialize function that handles headings/lists/images too (used in OnChange)
function serializeLinkNode(node) {
  // If it is a paragraph node, handle children inline (including links)
  if ($isParagraphNode(node)) {
    return serializeParagraphNodeToLine(node);
  }

  // fallback: if node itself is a link node (rare), handle explicitly
  const type = node.getType ? node.getType() : null;
  if (type === "link") {
    const url = node.getURL ? node.getURL() : "";
    const text = node.getTextContent ? node.getTextContent() : url;
    const icon = isGoogleDocsUrl(url) ? "G-DOC" : "G-DRIVE";
    return `[${icon}|${text}](${url})`;
  }

  return null;
}

// Deserialize stored bracketed format OR plain URLs into a paragraph with link node
function deserializeLinkString(line, editor) {
  const trimmed = (line || "").trim();

  // bracketed format first
  const match = trimmed.match(LINK_REGEX);
  if (match) {
    const [, , title, url, , notesContent] = match;
    const paragraph = $createParagraphNode();
    const linkNode = $createLinkNode(url);
    let linkText = title;
    if (notesContent) {
      linkText += ` [NOTES|${notesContent}]`;
    }
    linkNode.append($createTextNode(linkText));
    paragraph.append(linkNode);
    return paragraph;
  }

  // if the whole line is a plain URL -> create a link with the URL as text
  if (/^https?:\/\//i.test(trimmed)) {
    const paragraph = $createParagraphNode();
    const linkNode = $createLinkNode(trimmed);
    linkNode.append($createTextNode(trimmed));
    paragraph.append(linkNode);
    return paragraph;
  }

  // not a link
  return null;
}

function renderLinkElement(line, index) {
  const match = line.match(LINK_REGEX);
  if (match) {
    const [, , title, url, , notesContent] = match;
    const linkElement = (
      <a
        key={`link-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="d-inline-block me-2 mb-2"
      >
        {title}
      </a>
    );

    if (notesContent) {
      const cleanNotesContent = notesContent.replace(/<\/?p>/g, "");
      return (
        <div key={`link-container-${index}`} className="mb-3">
          {linkElement}
          <div
            key={`notes-${index}`}
            className="ms-3 ps-2  fst-italic text-muted"
          >
            {cleanNotesContent}
          </div>
        </div>
      );
    }

    return (
      <div key={`link-wrapper-${index}`} className="mb-2">
        {linkElement}
      </div>
    );
  }

  // fallback: if line is a plain URL, render it as anchor
  if (/^https?:\/\//i.test(line.trim())) {
    return (
      <div key={`link-wrapper-${index}`} className="mb-2">
        <a href={line.trim()} target="_blank" rel="noopener noreferrer">
          {line.trim()}
        </a>
      </div>
    );
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

// Simplified FocusAtEndPlugin without scroll interference
const FocusAtEndPlugin = ({ active }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!active) return;

    const id = setTimeout(() => {
      editor.update(() => {
        try {
          const root = $getRoot();
          const lastChild = root.getLastChild();
          if (lastChild) {
            lastChild.selectEnd();
          } else {
            root.selectEnd();
          }
        } catch (e) {
          // no-op
        }
      });
    }, 100);

    return () => clearTimeout(id);
  }, [active, editor]);

  return null;
};

// Plugin to sync attached images with editor state
const AttachedImagesPlugin = ({
  attachedImages,
  onImageRemove,
  summarySeq,
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Only add new images that aren't already in the editor
    const newImages = attachedImages.filter((img) => img && !img.existing);

    if (newImages.length > 0) {
      editor.update(() => {
        const root = $getRoot();

        // Check if these images are already in the editor to avoid duplicates
        const existingImageNodes = root
          .getChildren()
          .filter(
            (node) =>
              node.getType &&
              (node.getType() === "image" ||
                node.getType() === "removable-image")
          );

        const existingImageSrcs = existingImageNodes.map((node) =>
          node.getSrc ? node.getSrc() : node.__src || ""
        );

        newImages.forEach((img) => {
          if (img.dataUrl && !existingImageSrcs.includes(img.dataUrl)) {
            const imageNode = $createRemovableImageNode(
              img.dataUrl,
              "",
              undefined,
              onImageRemove,
              summarySeq,
              import.meta.env.VITE_API_BASE_URL,
              localStorage.getItem("token")
            );
            root.append(imageNode);
          }
        });
      });
    }
  }, [attachedImages, editor, onImageRemove, summarySeq]);

  return null;
};

// Component to safely render HTML content
const SafeHTMLRenderer = ({ htmlContent }) => {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "u",
      "strong",
      "em",
      "p",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "br",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className={style.summary_para}
    />
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
  errorMessage = null,
  editorRef = null,
  onHeightChange = null, // New callback to notify parent of height changes
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing || forceEditing);
  const [tempSummaryText, setTempSummaryText] = useState(
    summary?.summary || ""
  );
  const [attachedImages, setAttachedImages] = useState([]);
  const contentEditableRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  // New state and ref for static content height
  const [staticContentHeight, setStaticContentHeight] = useState(200); // default to 200px
  const staticContentRef = useRef(null);
  const containerRef = useRef(null); // Ref for the entire container

  useEffect(() => {
    setIsEditing(initialEditing || forceEditing);
  }, [initialEditing, forceEditing]);

  useEffect(() => {
    if (isEditing) {
      setAttachedImages((prev) => {
        const hasExistingSeed = prev.some(
          (img) => img && img.existing === true
        );
        if (hasExistingSeed) return prev;
        const seeded = Array.isArray(summary?.images)
          ? summary.images
              .filter(Boolean)
              .slice(0, 3)
              .map((src) => ({ file: null, dataUrl: src, existing: true }))
          : [];
        return seeded;
      });
    } else {
      setAttachedImages([]);
    }
  }, [isEditing, summary?.images]);

  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus({ preventScroll: true });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isEditing]);

  // New effect to measure static content height when not editing
  useEffect(() => {
    if (!isEditing && staticContentRef.current) {
      // Set initial height
      const height = staticContentRef.current.scrollHeight;
      setStaticContentHeight(height);

      // Notify parent of height change
      if (onHeightChange) {
        onHeightChange(height);
      }

      // Setup ResizeObserver to detect changes in the static content container
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newHeight = entry.target.scrollHeight;
          setStaticContentHeight(newHeight);

          // Notify parent of height change
          if (onHeightChange) {
            onHeightChange(newHeight);
          }
        }
      });

      resizeObserver.observe(staticContentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isEditing, summary, onHeightChange]);

  // Effect to measure editor height when editing
  useEffect(() => {
    if (isEditing && containerRef.current) {
      // Set initial height
      const height = containerRef.current.scrollHeight;

      // Notify parent of height change
      if (onHeightChange) {
        onHeightChange(height);
      }

      // Setup ResizeObserver to detect changes in the editor container
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newHeight = entry.target.scrollHeight;

          // Notify parent of height change
          if (onHeightChange) {
            onHeightChange(newHeight);
          }
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isEditing, onHeightChange]);

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
      // Allow saving if there's either text or images
      if (tempSummaryText.trim() !== "" || allFiles.length > 0) {
        onSave(tempSummaryText, allFiles, []);
        setIsEditing(false); // close editor only when valid content exists
      } else {
        // If nothing entered, keep editor open (maybe show a warning later)
        setIsEditing(true);
      }
    });
  };

  const handleCancel = () => {
    setTempSummaryText(summary?.summary || "");
    setIsEditing(false);
    if (onCancel) onCancel();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const renderSummaryText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let currentList = [];
    let listType = null;
    const elements = [];

    lines.forEach((line, index) => {
      let trimmedLine = line.trim();
      if (trimmedLine === title && index === 0) {
        return;
      }

      const linkElement = renderLinkElement(trimmedLine, index);
      if (linkElement) {
        if (currentList.length > 0) {
          elements.push(
            React.createElement(
              listType,
              {
                key: `list-before-link-${index}`,
                className: style.summary_para,
              },
              currentList
            )
          );
          currentList = [];
          listType = null;
        }
        elements.push(linkElement);
        return;
      }

      // Check for HTML tags in the line
      if (
        trimmedLine.includes("<b>") ||
        trimmedLine.includes("<i>") ||
        trimmedLine.includes("<u>")
      ) {
        if (currentList.length > 0) {
          elements.push(
            React.createElement(
              listType,
              { key: `list-${index}`, className: style.summary_para },
              currentList
            )
          );
          currentList = [];
          listType = null;
        }
        // Use SafeHTMLRenderer to render HTML content
        elements.push(
          <SafeHTMLRenderer key={`html-${index}`} htmlContent={trimmedLine} />
        );
        return;
      }

      let isBold = false;
      let content = trimmedLine;
      if (trimmedLine.startsWith("<b>") && trimmedLine.endsWith("</b>")) {
        isBold = true;
        content = trimmedLine.replace(/<\/?b>/g, "").trim();
      }

      if (trimmedLine.startsWith("- ")) {
        if (listType !== "ul") {
          if (currentList.length > 0) {
            elements.push(
              React.createElement(
                listType,
                { key: `list-${index}`, className: style.summary_para },
                currentList
              )
            );
            currentList = [];
          }
          listType = "ul";
        }
        currentList.push(
          <li key={`bullet-${index}`}>
            {isBold ? (
              <b>{content.substring(2).trim()}</b>
            ) : (
              content.substring(2).trim()
            )}
          </li>
        );
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        if (listType !== "ol") {
          if (currentList.length > 0) {
            elements.push(
              React.createElement(
                listType,
                { key: `list-${index}`, className: style.summary_para },
                currentList
              )
            );
            currentList = [];
          }
          listType = "ol";
        }
        currentList.push(
          <li key={`numbered-${index}`}>
            {isBold ? (
              <b>{content.replace(/^\d+\.\s/, "").trim()}</b>
            ) : (
              content.replace(/^\d+\.\s/, "").trim()
            )}
          </li>
        );
      } else if (trimmedLine.startsWith("# ")) {
        if (currentList.length > 0) {
          elements.push(
            React.createElement(
              listType,
              { key: `list-${index}`, className: style.summary_para },
              currentList
            )
          );
          currentList = [];
          listType = null;
        }
        elements.push(
          <h3 key={`heading-${index}`} className={style.summary_heading}>
            {isBold ? (
              <b>{content.substring(2).trim()}</b>
            ) : (
              content.substring(2).trim()
            )}
          </h3>
        );
      } else {
        if (currentList.length > 0) {
          elements.push(
            React.createElement(
              listType,
              { key: `list-${index}`, className: style.summary_para },
              currentList
            )
          );
          currentList = [];
          listType = null;
        }
        if (trimmedLine) {
          elements.push(
            <p key={`para-${index}`} className={style.summary_para}>
              {isBold ? <b>{content}</b> : content}
            </p>
          );
        }
      }
    });

    if (currentList.length > 0) {
      elements.push(
        React.createElement(
          listType,
          { key: `list-end`, className: style.summary_para },
          currentList
        )
      );
    }

    return elements;
  };

  const editorConfig = {
    namespace: `ExecutiveSummaryEditor-${summary?.summarySeq || "new"}`,
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
    editorState:
      tempSummaryText ||
      (Array.isArray(summary?.images) && summary.images.length > 0) ||
      attachedImages.length > 0
        ? (editor) => {
            const root = $getRoot();
            root.clear();

            // Process text content if it exists
            if (tempSummaryText) {
              const lines = tempSummaryText.split("\n");
              let currentList = null;

              lines.forEach((line) => {
                const trimmedLine = line.trim();

                const linkNode = deserializeLinkString(trimmedLine, editor);
                if (linkNode) {
                  root.append(linkNode);
                  return;
                }

                if (trimmedLine.startsWith("- ")) {
                  if (!currentList || currentList.getListType() !== "bullet") {
                    if (currentList) root.append(currentList);
                    currentList = $createListNode("bullet");
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
                    if (currentList) root.append(currentList);
                    currentList = $createListNode("number");
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
                  if (currentList) {
                    root.append(currentList);
                    currentList = null;
                  }
                  const heading = $createHeadingNode("h3");
                  const dom = new DOMParser().parseFromString(
                    trimmedLine.substring(2),
                    "text/html"
                  );
                  const nodes = $generateNodesFromDOM(editor, dom);
                  if (nodes.length > 0)
                    nodes.forEach((node) => heading.append(node));
                  root.append(heading);
                } else if (trimmedLine) {
                  if (currentList) {
                    root.append(currentList);
                    currentList = null;
                  }
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

              if (currentList) {
                root.append(currentList);
              }
            }

            // Process existing images from summary
            if (Array.isArray(summary?.images) && summary.images.length > 0) {
              summary.images.forEach((src) => {
                if (src) {
                  const imageNode = $createRemovableImageNode(
                    src,
                    "",
                    undefined,
                    handleImageRemove,
                    summary?.summarySeq,
                    import.meta.env.VITE_API_BASE_URL,
                    localStorage.getItem("token")
                  );
                  root.append(imageNode);
                }
              });
            }

            // Process newly attached images that aren't in the summary yet
            if (attachedImages.length > 0) {
              attachedImages.forEach((img) => {
                if (img && img.dataUrl && !img.existing) {
                  const imageNode = $createRemovableImageNode(
                    img.dataUrl,
                    "",
                    undefined,
                    handleImageRemove,
                    summary?.summarySeq,
                    import.meta.env.VITE_API_BASE_URL,
                    localStorage.getItem("token")
                  );
                  root.append(imageNode);
                }
              });
            }
          }
        : null,
  };

  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const output = [];

      root.getChildren().forEach((node) => {
        const linkString = serializeLinkNode(node);
        if (linkString) {
          output.push(linkString);
          return;
        }

        // headings
        if (node.getType && node.getType() === "heading") {
          output.push(`# ${node.getTextContent()}`);
          return;
        }

        // lists
        if (node.getType && node.getType() === "list") {
          const listChildren = node.getChildren();
          listChildren.forEach((listItem, index) => {
            const prefix =
              node.getListType() === "bullet" ? "- " : `${index + 1}. `;
            let line = "";
            listItem.getChildren().forEach((child) => {
              let text = child.getTextContent();
              const format = child.getFormat ? child.getFormat() : 0;
              if (format & 4) text = `<u>${text}</u>`;
              if (format & 2) text = `<i>${text}</i>`;
              if (format & 1) text = `<b>${text}</b>`;
              line += text;
            });
            if (line) output.push(prefix + line);
          });
          return;
        }

        // images: handled separately (we skip in summary text)
        if (
          node.getType &&
          (node.getType() === "image" || node.getType() === "removable-image")
        ) {
          // skip (images handled as separate array)
          return;
        }

        // fallback: try to get text content
        if (node.getTextContent) {
          const txt = node.getTextContent();
          if (txt) output.push(txt);
        }
      });

      setTempSummaryText(output.join("\n"));
    });
  };

  const handleImageSelected = (file, dataUrl) => {
    // Update the attached images state for form submission
    setAttachedImages((prev) => {
      const next = [...prev, { file, dataUrl, existing: false }];
      return next.slice(0, 3);
    });

    // Force editor to update and ensure the image is visible immediately
    // The INSERT_REMOVABLE_IMAGE_COMMAND should handle the display, but we ensure it's processed
    setTimeout(() => {
      // This timeout ensures the command has been processed
      console.log("Image added to editor, attachedImages updated");
    }, 100);
  };

  // Handler for removing images from the editor
  const handleImageRemove = async (imageSrc) => {
    try {
      // Remove from attachedImages state immediately for UI responsiveness
      setAttachedImages((prev) =>
        prev.filter((img) => img.dataUrl !== imageSrc)
      );

      // If this is an existing summary, update the database
      if (summary?.summarySeq) {
        const apibaseurl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem("token");

        // Get current images and remove the deleted one
        const updatedImages = (summary.images || []).filter(
          (url) => url !== imageSrc
        );

        // Update the summary with the new image list
        const formData = new FormData();
        formData.append("summary", tempSummaryText || "");
        formData.append(
          "summaryFlag",
          summary.summaryFlag || "compareexecutivesummary"
        );
        formData.append(
          "createdDate",
          summary.createdDate || new Date().toISOString()
        );
        formData.append("existingImageUrls", JSON.stringify(updatedImages));

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

        if (response.ok) {
          const data = await response.json();
          // Update the summary object directly instead of page reload
          if (summary) {
            summary.images = updatedImages;
          }
          console.log("Image removed successfully from database");
        } else {
          console.error("Failed to update summary after image removal");
          // Revert the UI change if database update failed
          setAttachedImages((prev) => [
            ...prev,
            { file: null, dataUrl: imageSrc, existing: true },
          ]);
        }
      }
    } catch (error) {
      console.error("Error removing image:", error);
      // Revert the UI change if there was an error
      if (summary?.summarySeq) {
        setAttachedImages((prev) => [
          ...prev,
          { file: null, dataUrl: imageSrc, existing: true },
        ]);
      }
    }
  };

  return (
    <div
      ref={containerRef} // Attach ref to the entire container
      className="mb-4"
      style={{
        paddingBottom: "20px",
        borderRadius: "8px",
        padding: "10px",
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
              className={style.edit_button}
              onClick={handleEdit}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                cursor: "pointer",
                marginLeft: "12px",
                fontSize: "14px",
                display: "inline-block",
                verticalAlign: "middle",
                backgroundColor: isHovering ? "#007bff" : "transparent",
                color: isHovering ? "white" : "inherit",
                padding: "4px",
                borderRadius: "4px",
                transition: "background-color 0.2s, color 0.2s",
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
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
          <LexicalComposer initialConfig={editorConfig}>
            <Toolbar onImageSelected={handleImageSelected} />
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  ref={(el) => {
                    contentEditableRef.current = el;
                    if (editorRef && typeof editorRef === "object") {
                      editorRef.current = el;
                    }
                  }}
                  className={`${style.textarea} form-control`}
                  style={{
                    minHeight: "200px",
                    height: `${staticContentHeight}px`, // Set the fixed height
                    fontSize: "16px",
                    lineHeight: "1.6",
                    padding: "12px",
                    overflowY: "auto", // Add scroll if content exceeds height
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
              apibaseurl={import.meta.env.VITE_API_BASE_URL}
              token={localStorage.getItem("token")}
            />
            <RemovableImagePlugin
              onImageRemove={handleImageRemove}
              summarySeq={summary?.summarySeq}
              apibaseurl={import.meta.env.VITE_API_BASE_URL}
              token={localStorage.getItem("token")}
            />
            <OnChangePlugin onChange={handleEditorChange} />
            <AttachedImagesPlugin
              attachedImages={attachedImages}
              onImageRemove={handleImageRemove}
              summarySeq={summary?.summarySeq}
            />
            <FocusAtEndPlugin active={isEditing} />
            <div
              className="mt-3 d-flex justify-content-end"
              style={{ gap: "10px" }}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "10px",
                }}
              >
                <FaTimes style={{ marginRight: "5px" }} /> Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "10px",
                }}
              >
                <FaSave style={{ marginRight: "5px" }} /> Save
              </Button>
            </div>
          </LexicalComposer>
        </Form.Group>
      ) : (
        // Updated condition to show container if there's either text or images
        summary &&
        (summary.summary || (summary.images && summary.images.length > 0)) && (
          <div
            ref={staticContentRef} // Attach the ref to measure height
            className={`${style.summary_container} mb-3`}
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {/* Only render text if it exists */}
            {summary.summary && renderSummaryText(summary.summary)}

            {/* Render images if they exist */}
            {Array.isArray(summary.images) && summary.images.length > 0 && (
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

const CompareExecutiveSummary = ({
  startDate,
  clientSeq,
  onInitialSummaryFetch,
}) => {
  const [labelSummaries, setLabelSummaries] = useState([]);
  const [executiveSummaries, setExecutiveSummaries] = useState([]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isAddingExecutive, setIsAddingExecutive] = useState(false);
  const [forceEditLabelIds, setForceEditLabelIds] = useState([]);
  const [forceEditExecutiveIds, setForceEditExecutiveIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs to synchronize editor heights
  const leftEditorRef = useRef(null);
  const rightEditorRef = useRef(null);
  const leftCellRef = useRef(null);
  const rightCellRef = useRef(null);

  // State to track heights of both editors
  const [leftHeight, setLeftHeight] = useState(0);
  const [rightHeight, setRightHeight] = useState(0);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedMonthYear = startDate
    ? format(new Date(startDate), "MMM yy")
    : "";

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!token || !clientSeq) return;

      try {
        const formattedStart = formatDateLocal(startDate);

        const [labelResponse, executiveResponse] = await Promise.all([
          fetch(
            `${apibaseurl}/api/ExecutiveSummary/compare-LabelSummary?_startDate=${formattedStart}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${apibaseurl}/api/ExecutiveSummary/compare-ExecutiveSummary?_startDate=${formattedStart}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const labelData = labelResponse.ok ? await labelResponse.json() : [];
        const executiveData = executiveResponse.ok
          ? await executiveResponse.json()
          : [];

        setLabelSummaries(labelData);
        setExecutiveSummaries(executiveData);
        setForceEditLabelIds([]);
        setForceEditExecutiveIds([]);
        setErrorMessage(null);

        if (onInitialSummaryFetch) {
          onInitialSummaryFetch({
            labelSummaries: labelData,
            executiveSummaries: executiveData,
          });
        }
      } catch (err) {
        console.error("Error fetching summaries:", err);
        setLabelSummaries([]);
        setExecutiveSummaries([]);
        setForceEditLabelIds([]);
        setForceEditExecutiveIds([]);
        setErrorMessage(null);
      }
    };
    fetchSummaries();
  }, [apibaseurl, token, clientSeq, startDate, onInitialSummaryFetch]);

  // Effect to synchronize heights between editors
  useEffect(() => {
    const maxHeight = Math.max(leftHeight, rightHeight);

    if (maxHeight > 0 && leftCellRef.current && rightCellRef.current) {
      leftCellRef.current.style.height = `${maxHeight}px`;
      rightCellRef.current.style.height = `${maxHeight}px`;
    }
  }, [leftHeight, rightHeight]);

  // Handler for left editor height changes
  const handleLeftHeightChange = (height) => {
    setLeftHeight(height);
  };

  // Handler for right editor height changes
  const handleRightHeightChange = (height) => {
    setRightHeight(height);
  };

  const handleAddNewLabelSummary = () => {
    setIsAddingLabel(true);
    setErrorMessage(null);
  };
  const handleAddNewExecutiveSummary = () => {
    setIsAddingExecutive(true);
    setErrorMessage(null);
  };
  const handleCancelNewLabel = () => {
    setIsAddingLabel(false);
    setErrorMessage(null);
  };
  const handleCancelNewExecutive = () => {
    setIsAddingExecutive(false);
    setErrorMessage(null);
  };

  const handleCancelLabelEdit = (summarySeq) => {
    setForceEditLabelIds((prev) => prev.filter((id) => id !== summarySeq));
    setErrorMessage(null);
  };
  const handleCancelExecutiveEdit = (summarySeq) => {
    setForceEditExecutiveIds((prev) => prev.filter((id) => id !== summarySeq));
    setErrorMessage(null);
  };

  const handleSaveSummary = async (
    text,
    summarySeq,
    type,
    imageFiles = [],
    existingUrls = []
  ) => {
    if (!token || !clientSeq) return;

    try {
      const formattedStart = formatDateLocal(startDate);
      let createdDate = formattedStart;
      if (!summarySeq && type === "label") {
        const dateObj = new Date(formattedStart);
        dateObj.setMonth(dateObj.getMonth() - 1);
        createdDate = dateObj.toISOString();
      }

      const flag =
        type === "label" ? "labelsummary" : "compareexecutivesummary";

      let response;

      const formData = new FormData();
      formData.append("summary", text || "");
      formData.append("summaryFlag", flag);
      formData.append("createdDate", createdDate);
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach((file) => file && formData.append("Images", file));
      }
      formData.append(
        "existingImageUrls",
        JSON.stringify(
          Array.isArray(existingUrls) ? existingUrls.slice(0, 3) : []
        )
      );

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
        if (summarySeq) {
          if (type === "label") {
            setLabelSummaries((prev) =>
              prev.map((s) =>
                s.summarySeq === summarySeq
                  ? {
                      ...s,
                      summary: text,
                      images: (data.imageUrls || s.images || []).slice(0, 3),
                    }
                  : s
              )
            );
            setForceEditLabelIds((prev) =>
              prev.filter((id) => id !== summarySeq)
            );
          } else {
            setExecutiveSummaries((prev) =>
              prev.map((s) =>
                s.summarySeq === summarySeq
                  ? {
                      ...s,
                      summary: text,
                      images: (data.imageUrls || s.images || []).slice(0, 3),
                    }
                  : s
              )
            );
            setForceEditExecutiveIds((prev) =>
              prev.filter((id) => id !== summarySeq)
            );
          }
        } else {
          if (type === "label") {
            const created =
              data && data.imageUrls
                ? { ...data, images: (data.imageUrls || []).slice(0, 3) }
                : data;
            setLabelSummaries((prev) => [...prev, created]);
            setIsAddingLabel(false);
          } else {
            const created =
              data && data.imageUrls
                ? { ...data, images: (data.imageUrls || []).slice(0, 3) }
                : data;
            setExecutiveSummaries((prev) => [...prev, created]);
            setIsAddingExecutive(false);
          }
        }
        setErrorMessage(null);
      } else {
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.errors && errorData.errors.summary) {
            setErrorMessage(
              errorData.errors.summary[0] || "The summary field is required."
            );
            return;
          }
        }

        const errorText = `Failed to ${
          summarySeq ? "update" : "create"
        } ${type} summary. Please try again.`;
        setErrorMessage(errorText);
        console.error(
          `Failed to ${summarySeq ? "update" : "create"} ${type} summary:`,
          response.statusText
        );
      }
    } catch (err) {
      const errorText = `An error occurred while ${
        summarySeq ? "updating" : "creating"
      } the ${type} summary. Please try again.`;
      setErrorMessage(errorText);
      console.error(
        `Error ${summarySeq ? "updating" : "creating"} ${type} summary:`,
        err
      );
    }
  };

  const handleDeleteSummary = async (summarySeq, type) => {
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
        if (type === "label") {
          setLabelSummaries((prev) =>
            prev.filter((s) => s.summarySeq !== summarySeq)
          );
          setForceEditLabelIds((prev) =>
            prev.filter((id) => id !== summarySeq)
          );
        } else {
          setExecutiveSummaries((prev) =>
            prev.filter((s) => s.summarySeq !== summarySeq)
          );
          setForceEditExecutiveIds((prev) =>
            prev.filter((id) => id !== summarySeq)
          );
        }
      } else {
        const errorText = "Failed to delete summary. Please try again.";
        setErrorMessage(errorText);
        console.error("Failed to delete summary:", response.statusText);
        return false;
      }
    } catch (err) {
      const errorText =
        "An error occurred while deleting the summary. Please try again.";
      setErrorMessage(errorText);
      console.error("Error deleting summary:", err);
      return false;
    }

    return true;
  };

  const handleHeaderLabelClick = () => {
    if (labelSummaries.length === 0) {
      setIsAddingLabel(true);
      setForceEditLabelIds([]);
    } else {
      const firstId = labelSummaries[0]?.summarySeq;
      setForceEditLabelIds(firstId ? [firstId] : []);
      setIsAddingLabel(false);
    }
    setErrorMessage(null);
  };

  const handleHeaderExecutiveClick = () => {
    if (executiveSummaries.length === 0) {
      setIsAddingExecutive(true);
      setForceEditExecutiveIds([]);
    } else {
      const firstId = executiveSummaries[0]?.summarySeq;
      setForceEditExecutiveIds(firstId ? [firstId] : []);
      setIsAddingExecutive(false);
    }
    setErrorMessage(null);
  };

  return (
    <div
      className="pb-3"
      style={{
        marginTop: "32px",
        borderRadius: "8px",
        padding: "20px",
        background: "#fff",
      }}
    >
      <p style={{ fontWeight: 700, fontSize: "20px" }}>
        SEO Tasks & Accomplishments
      </p>

      <Table responsive bordered>
        <thead>
          <tr>
            <th className={style.table_header}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="m-0">
                  Task recommended for {formattedMonthYear}
                </h6>
                <PiNotePencilFill
                  onClick={handleHeaderLabelClick}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    transition: "color 0.2s ease",
                    width: "33px",
                  }}
                  className="hover-blue pdf-ignore"
                />
              </div>
            </th>
            <th className={style.table_header}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="m-0">Task done in {formattedMonthYear}</h6>
                <PiNotePencilFill
                  onClick={handleHeaderExecutiveClick}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    transition: "color 0.2s ease",
                    width: "33px",
                  }}
                  className="hover-blue pdf-ignore"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              ref={leftCellRef}
              className={style.table_cell}
              style={{ verticalAlign: "top" }}
            >
              {labelSummaries.length === 0 ? (
                <div
                  className="text-center p-3"
                  style={{ color: "gray", fontSize: "16px" }}
                ></div>
              ) : (
                labelSummaries.map((summary) => (
                  <ExecutiveSummaryItem
                    key={`label-${summary.summarySeq}`}
                    editorRef={
                      forceEditLabelIds.includes(summary.summarySeq)
                        ? leftEditorRef
                        : undefined
                    }
                    summary={summary}
                    onSave={(text, files, existingUrls) =>
                      handleSaveSummary(
                        text,
                        summary.summarySeq,
                        "label",
                        files,
                        existingUrls
                      )
                    }
                    onDelete={(seq) => handleDeleteSummary(seq, "label")}
                    onCancel={() => handleCancelLabelEdit(summary.summarySeq)}
                    title={`Task recommended for ${formattedMonthYear}`}
                    showInlineEdit={false}
                    forceEditing={forceEditLabelIds.includes(
                      summary.summarySeq
                    )}
                    errorMessage={errorMessage}
                    onHeightChange={handleLeftHeightChange} // Add height change handler
                  />
                ))
              )}
              {isAddingLabel && labelSummaries.length === 0 && (
                <ExecutiveSummaryItem
                  editorRef={leftEditorRef}
                  onSave={(text, files, existingUrls) =>
                    handleSaveSummary(text, null, "label", files, existingUrls)
                  }
                  onCancel={handleCancelNewLabel}
                  isEditing={true}
                  title=""
                  showInlineEdit={false}
                  errorMessage={errorMessage}
                  onHeightChange={handleLeftHeightChange} // Add height change handler
                />
              )}
            </td>

            <td
              ref={rightCellRef}
              className={style.table_cell}
              style={{ verticalAlign: "top" }}
            >
              {executiveSummaries.length === 0 ? (
                <div
                  className="text-center p-3"
                  style={{ color: "gray", fontSize: "16px" }}
                ></div>
              ) : (
                executiveSummaries.map((summary) => (
                  <ExecutiveSummaryItem
                    key={`executive-${summary.summarySeq}`}
                    editorRef={
                      forceEditExecutiveIds.includes(summary.summarySeq)
                        ? rightEditorRef
                        : undefined
                    }
                    summary={summary}
                    onSave={(text, files, existingUrls) =>
                      handleSaveSummary(
                        text,
                        summary.summarySeq,
                        "executive",
                        files,
                        existingUrls
                      )
                    }
                    onDelete={(seq) => handleDeleteSummary(seq, "executive")}
                    onCancel={() =>
                      handleCancelExecutiveEdit(summary.summarySeq)
                    }
                    title={`Task done in ${formattedMonthYear}`}
                    showInlineEdit={false}
                    forceEditing={forceEditExecutiveIds.includes(
                      summary.summarySeq
                    )}
                    errorMessage={errorMessage}
                    onHeightChange={handleRightHeightChange} // Add height change handler
                  />
                ))
              )}
              {isAddingExecutive && executiveSummaries.length === 0 && (
                <ExecutiveSummaryItem
                  editorRef={rightEditorRef}
                  onSave={(text, files, existingUrls) =>
                    handleSaveSummary(
                      text,
                      null,
                      "executive",
                      files,
                      existingUrls
                    )
                  }
                  onCancel={handleCancelNewExecutive}
                  isEditing={true}
                  title=""
                  showInlineEdit={false}
                  errorMessage={errorMessage}
                  onHeightChange={handleRightHeightChange} // Add height change handler
                />
              )}
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Add CSS for hover effect */}
      <style jsx>{`
        .hover-blue:hover {
          background: #3b82f6;
          border-radius: 5px;
          width: 33px;
        }
      `}</style>
    </div>
  );
};

export default CompareExecutiveSummary;
