import React, { useState, useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";
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
import ImageUploadButton from "./Image/ImageUploadsButton";
import {
  ImageNode,
  $createImageNode,
} from "../ExecutiveSummary/Image/ImageNode";
import ImagePlugin from "../ExecutiveSummary/Image/ImagePlugin";
import {
  RemovableImageNode,
  $createRemovableImageNode,
} from "../ExecutiveSummary/Image/RemovableImageNode";
import RemovableImagePlugin from "../ExecutiveSummary/Image/RemovableImagePlugin";
import GoogleDrivePastePlugin from "./GoogleDrivePastePlugin";
import NewContentButton from "../ExecutiveSummary/LinkDoc/NewContentButton";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  $isElementNode,
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

// --- LINK FEATURE HELPER FUNCTIONS ---
// match pattern: [G-DOC|Title](url) [NOTES|note content]
const LINK_REGEX =
  /\[(G-DOC|G-DRIVE)\|([^\]]+)\]\(([^)]+)\)( \[NOTES\|(.*?)\])?/;

function serializeLinkNode(paragraphNode) {
  // Look for a LinkNode anywhere within the paragraph's children
  try {
    const children = paragraphNode.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (
        child &&
        typeof child.getType === "function" &&
        child.getType() === "link"
      ) {
        const linkNode = child;
        const url = linkNode.getURL ? linkNode.getURL() : "";
        const text = linkNode.getTextContent
          ? linkNode.getTextContent()
          : linkNode.getText() || "";
        // Extract notes if any inside the link text (the [NOTES|...] pattern)
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
    }
  } catch (e) {
    console.error("serializeLinkNode error:", e);
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

// Helper to get all descendant nodes of a node in document order (non-destructive)
function $getAllNodes(root) {
  const nodes = [];
  let child = root.getFirstChild && root.getFirstChild();
  while (child !== null) {
    nodes.push(child);
    if ($isElementNode(child)) {
      const subChildrenNodes = $getAllNodes(child);
      nodes.push(...subChildrenNodes);
    }
    child = child.getNextSibling && child.getNextSibling();
  }
  return nodes;
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

const ExecutiveSummary = ({
  showSummary,
  summaryText,
  summaryImages = [],
  onSaveSummary,
  onDeleteSummary,
  summarySeq,
  apibaseurl,
  token,
  onImageRemove,
}) => {
  const [isEditing, setIsEditing] = useState(!summaryText);
  const [tempSummaryText, setTempSummaryText] = useState(summaryText || "");
  const [attachedImages, setAttachedImages] = useState([]);
  const [hasLinks, setHasLinks] = useState(false);
  const editorRef = useRef(null);

  // Focus helper
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  useEffect(() => {
    setTempSummaryText(summaryText || "");

    // Check if summary contains links
    const containsLinks = summaryText && LINK_REGEX.test(summaryText);
    setHasLinks(containsLinks || false);

    // Close editor if:
    // 1. We have non-empty summary text, OR
    // 2. Summary is empty/null but images exist, OR
    // 3. Summary contains links
    if (
      (summaryText && summaryText.trim() !== "") ||
      (Array.isArray(summaryImages) && summaryImages.length > 0) ||
      containsLinks
    ) {
      setIsEditing(false);
    } else {
      // Keep editor open if both summary text and images are empty and no links
      setIsEditing(true);
    }

    // Initialize attached images if provided
    if (Array.isArray(summaryImages) && summaryImages.length > 0) {
      setAttachedImages(
        summaryImages.map((src) => ({ file: null, dataUrl: src }))
      );
    } else {
      setAttachedImages([]);
    }
  }, [summaryText, summaryImages]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // ensure we preserve existing images by converting data URLs to Files
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

    const files = attachedImages
      .map((i, idx) =>
        i.file
          ? i.file
          : i.dataUrl
          ? dataUrlToFile(i.dataUrl, `image_${idx}.png`)
          : null
      )
      .filter((f) => !!f);

    // Save if there's text, images, or links
    if (tempSummaryText.trim() !== "" || files.length > 0 || hasLinks) {
      onSaveSummary(tempSummaryText || "", files);
      setIsEditing(false); // close editor only when valid content exists
    } else {
      // If nothing entered, keep editor open (maybe show a warning later)
      setIsEditing(true);
      focusEditor();
    }
  };

  const handleCancel = () => {
    setTempSummaryText(summaryText);
    // Reset attached images to only include existing ones from current summary
    if (
      summaryText &&
      Array.isArray(summaryImages) &&
      summaryImages.length > 0
    ) {
      setAttachedImages(
        summaryImages.map((src) => ({ file: null, dataUrl: src }))
      );
    } else {
      setAttachedImages([]);
    }
    setIsEditing(false);
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
        html += `<p>${line}</p>`;
      } else {
        // empty line (possibly image placeholder) -> close lists
        closeLists();
      }
    });

    closeLists();
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const editorConfig = {
    namespace: "ExecutiveSummaryEditor",
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
      summaryText || (Array.isArray(summaryImages) && summaryImages.length > 0)
        ? (editor) => {
            const root = $getRoot();
            root.clear();
            if (summaryText) {
              const lines = summaryText.split("\n");
              let currentList = null;
              lines.forEach((line) => {
                const trimmedLine = line.trim();

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
                } else if (trimmedLine) {
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
                } else {
                  // empty line -> might represent a blank paragraph or an image placeholder in original
                  currentList = null;
                  // append empty paragraph to keep structure
                  root.append($createParagraphNode());
                }
              });
            }

            // Append images passed from API so they are visible when editing
            if (Array.isArray(summaryImages) && summaryImages.length > 0) {
              summaryImages.forEach((src) => {
                if (src) {
                  const imageNode = $createRemovableImageNode(
                    src,
                    "",
                    undefined,
                    handleImageRemove,
                    summarySeq,
                    apibaseurl,
                    token
                  );
                  root.append(imageNode);
                }
              });
            }
          }
        : null,
  };

  // robust function to safely extract src from image node
  const getImageSrcFromNode = (node) => {
    try {
      if (!node) return null;
      if (typeof node.getSrc === "function") return node.getSrc();
      // fallback to internal property used by some custom nodes
      if (node.__src) return node.__src;
      if (node.src) return node.src;
      return null;
    } catch (e) {
      return null;
    }
  };

  // Updated handleEditorChange: traverse top-level children in order and build lines;
  // also collect images (including nested) but preserve order by inserting a blank line for images
  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const output = [];
      const imageDataUrls = [];
      let containsLinks = false;

      // iterate top-level children in document order (keeps images and paragraphs order)
      let child = root.getFirstChild && root.getFirstChild();
      while (child) {
        // If paragraph-like node
        if ($isParagraphNode(child)) {
          // First, check if paragraph contains a link anywhere -> serialize as link pattern
          const linkString = serializeLinkNode(child);
          if (linkString) {
            output.push(linkString);
            containsLinks = true; // Mark that we found a link
          } else {
            // otherwise build the paragraph text from all children (preserving inline formatting markers)
            let line = "";
            const pChildren = child.getChildren ? child.getChildren() : [];
            pChildren.forEach((c) => {
              let text = c.getTextContent ? c.getTextContent() : "";
              const format = c.getFormat ? c.getFormat() : 0;
              // format bitmask: 1 bold, 2 italic, 4 underline (kept from your code)
              if (format & 4) text = `<u>${text}</u>`;
              if (format & 2) text = `<i>${text}</i>`;
              if (format & 1) text = `<b>${text}</b>`;
              line += text;
            });
            if (line !== "") {
              output.push(line);
            } else {
              // empty paragraph -> push empty string to preserve spacing
              output.push("");
            }
          }
        } else if (child.getType && child.getType() === "heading") {
          output.push(`# ${child.getTextContent()}`);
        } else if (child.getType && child.getType() === "list") {
          // iterate list items in order
          const listChildren = child.getChildren();
          for (let liIndex = 0; liIndex < listChildren.length; liIndex++) {
            const listItem = listChildren[liIndex];
            const prefix =
              child.getListType && child.getListType() === "bullet"
                ? "- "
                : `${liIndex + 1}. `;
            let line = "";
            const liChildren = listItem.getChildren
              ? listItem.getChildren()
              : [];
            liChildren.forEach((c) => {
              let text = c.getTextContent ? c.getTextContent() : "";
              const format = c.getFormat ? c.getFormat() : 0;
              if (format & 4) text = `<u>${text}</u>`;
              if (format & 2) text = `<i>${text}</i>`;
              if (format & 1) text = `<b>${text}</b>`;
              line += text;
            });
            if (line) output.push(prefix + line);
          }
        } else if (
          child.getType &&
          (child.getType() === "image" || child.getType() === "removable-image")
        ) {
          // preserve position of image in the text stream with an empty line
          // (images themselves are handled separately via attachedImages)
          const src = getImageSrcFromNode(child);
          if (src) {
            imageDataUrls.push(src);
          }
        } else {
          // Fallback: if node has children, try to extract textual content
          if ($isElementNode(child)) {
            let collected = "";
            const grandchildren = child.getChildren ? child.getChildren() : [];
            grandchildren.forEach((gc) => {
              if (gc.getTextContent) {
                collected += gc.getTextContent();
              }
            });
            if (collected) output.push(collected);
          }
        }

        // move to next top-level sibling
        child = child.getNextSibling && child.getNextSibling();
      }

      // Also scan all nodes (descendants) for images to ensure nested images are captured
      const allNodes = $getAllNodes(root);
      allNodes.forEach((node) => {
        // detect image nodes either by getType() or by checking likely internal props
        if (
          node &&
          typeof node.getType === "function" &&
          (node.getType() === "image" || node.getType() === "removable-image")
        ) {
          const src = getImageSrcFromNode(node);
          if (src) {
            // only add if not already collected
            if (!imageDataUrls.includes(src)) imageDataUrls.push(src);
          }
        }
      });

      // Check if the output contains any links
      const textContent = output.join("\n");
      const hasLinksInText = LINK_REGEX.test(textContent);
      setHasLinks(hasLinksInText || containsLinks);

      // join lines with newline to produce the text representation (keeps blank lines for images)
      setTempSummaryText(textContent);

      if ((textContent.trim() !== "" || hasLinksInText) && isEditing) {
        focusEditor(); // <-- auto-focus when text/link is detected
      }
      // Update attached images if new ones are found (only include data URLs for newly created images)
      if (imageDataUrls.length) {
        setAttachedImages((prev) => {
          const existing = new Set(prev.map((p) => p.dataUrl));
          const additions = imageDataUrls
            .filter(
              (src) => src && src.startsWith("data:") && !existing.has(src)
            )
            .map((src) => ({ file: null, dataUrl: src }));
          return additions.length ? [...prev, ...additions] : prev;
        });
      }
    });
  };

  const handleImageSelected = (file, dataUrl) => {
    setAttachedImages((prev) => [...prev, { file, dataUrl }]);
  };

  // Enhanced image removal handler
  const handleImageRemove = (imageSrc) => {
    // Remove from attached images state immediately
    setAttachedImages((prev) =>
      prev.filter((img) => img && img.dataUrl !== imageSrc)
    );

    // Call parent's image removal handler if provided
    if (onImageRemove) {
      onImageRemove(imageSrc);
    }
  };

  return (
    <>
      {showSummary && (
        <>
          <div
            style={{
              backgroundColor: "#ffffff", // Card ka background color
              border: "1px solid #e0e0e0", // Halki si border
              borderRadius: "8px", // Rounded corners
              padding: "8px", // Box ke andar space
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)", // Shadow effect
              // marginBottom: "1px", // Card ke neeche space
            }}
          >
            <h4
              className={`${style.summary_text} mb-2 mt-2`}
              style={{
                fontSize: "16px",
                fontWeight: 600,
                // textAlign: "left"
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: "4px solid #4338ca",
                paddingLeft: "10px",
              }}
            >
              Executive Summary:
              {!isEditing && (
                <button
                  className="pdf-ignore"
                  title="Edit"
                  onClick={handleEdit}
                  style={{
                    marginLeft: "12px",
                    verticalAlign: "middle",
                    marginRight: "12px",

                    // Layout aur Spacing
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",

                    // Background aur Border
                    // backgroundColor: '#eef2ff',
                    border: "1px solid #c7d2fe",
                    borderRadius: "10px",

                    // Text aur Cursor
                    // color: '#4338ca',
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <FaPencilAlt />
                  <span>Edit</span>
                </button>
              )}
            </h4>

            {isEditing ? (
              <Form.Group className="mb-3">
                <LexicalComposer initialConfig={editorConfig}>
                  <Toolbar onImageSelected={handleImageSelected} />
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        ref={editorRef}
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
                        Enter executive summary...
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <ListPlugin />
                  <ImagePlugin />
                  <RemovableImagePlugin
                    onImageRemove={handleImageRemove}
                    summarySeq={summarySeq}
                    apibaseurl={apibaseurl}
                    token={token}
                  />
                  <GoogleDrivePastePlugin />
                  <OnChangePlugin onChange={handleEditorChange} />
                  <div
                    className="mt-3"
                    style={{ display: "flex", gap: "10px" }}
                  >
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
              (summaryText ||
                (summaryImages && summaryImages.length > 0) ||
                hasLinks) && (
                <div
                  className={`${style.summary_container} mb-3`}
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  {renderSummaryText(summaryText)}
                  {Array.isArray(summaryImages) && summaryImages.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {summaryImages.map((src, idx) => (
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
        </>
      )}
    </>
  );
};

export default ExecutiveSummary;
