import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import ToolbarPlugin from "./ToolbarPlugin";
import { Button } from "@/components/ui";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import classes from "./RichTextEditor.module.css";

const theme = {
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
  },
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
  },
  quote: "editor-quote",
  list: {
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listitem",
  },
};

function onError(error) {
  console.error(error);
}

const initialConfig = {
  namespace: "RichTextEditor",
  theme,
  onError,
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode],
  editorState: null,
};

function MyOnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
      });
    });
  }, [editor, onChange]);

  return null;
}

function SetInitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent && initialContent.trim()) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        // Try to parse HTML content
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialContent, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);

          if (nodes.length > 0) {
            root.append(...nodes);
          } else {
            // If no nodes generated, create a paragraph with the text content
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(
              initialContent.replace(/<[^>]*>/g, "")
            );
            paragraph.append(textNode);
            root.append(paragraph);
          }
        } catch {
          // If parsing fails, create a simple text paragraph
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(
            initialContent.replace(/<[^>]*>/g, "")
          );
          paragraph.append(textNode);
          root.append(paragraph);
        }

        // Move cursor to the end
        root.selectEnd();
      });
    }
  }, [editor, initialContent]);

  return null;
}

const RichTextEditor = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const wrapperRef = useRef(null);

  const valueNode = document.createElement("div");
  valueNode.innerHTML = value;

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useLayoutEffect(() => {
    if (previewRef.current && wrapperRef.current) {
      const currentScrollHeight = previewRef.current.scrollHeight;
      const wrapperOffsetHeight = wrapperRef.current.offsetHeight;
      const needsShowMore = isExpanded
        ? wrapperOffsetHeight > 200
          ? true
          : false
        : currentScrollHeight > wrapperOffsetHeight;

      setShowMore(needsShowMore);
    }
  }, [value, isExpanded]);

  const handleValueChange = (newValue) => {
    setCurrentValue(newValue);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave(currentValue);
  };

  if (!isEditing) {
    const _value = valueNode.innerText;

    return (
      <div className={classes.container}>
        <div
          ref={wrapperRef}
          className={`${classes.richTextPreviewWrapper} ${
            isExpanded ? classes.expanded : classes.collapsed
          }`}
        >
          <div
            ref={previewRef}
            className={`${classes.richTextPreview} ${
              !_value ? classes.placeholder : ""
            }`}
            onClick={() => setIsEditing(true)}
            dangerouslySetInnerHTML={{
              __html: _value || "Add a more detailed explanation...",
            }}
          />

          {showMore && !isExpanded && (
            <div className={classes.showMoreOverlay}></div>
          )}

          {showMore && (
            <div className={classes.showMoreLessButtonContainer}>
              <Button
                onClick={() => setIsExpanded((prev) => !prev)}
                variant="secondary"
                style={{ width: "100%" }}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="tw:w-4 tw:h-4 tw:mr-2" />
                ) : (
                  <ChevronDownIcon className="tw:w-4 tw:h-4 tw:mr-2" />
                )}
                {isExpanded ? "Show less" : "Show more"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <LexicalComposer key="editor" initialConfig={initialConfig}>
        <div className={classes.richTextEditor}>
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
                  ariaLabel="Rich text editor"
                  style={{
                    minHeight: "200px",
                    padding: "12px",
                    outline: "none",
                    border: "none",
                    whiteSpace: "pre-wrap",
                  }}
                />
              }
              placeholder={
                <div className="editor-placeholder">
                  Enter some rich text...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <MyOnChangePlugin onChange={handleValueChange} />
            <SetInitialContentPlugin initialContent={currentValue} />
          </div>
        </div>
      </LexicalComposer>

      <div className="tw:flex tw:py-2 tw:gap-1">
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="plain" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RichTextEditor;
