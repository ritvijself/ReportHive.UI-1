import { DecoratorNode } from "lexical";
import { useState, useEffect, useRef } from "react";

function ImageComponent({ src, alt, onRemove, summarySeq, apibaseurl, token }) {
  const [dimensions, setDimensions] = useState({ width: 200, height: 150 });
  const [isRemoving, setIsRemoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef(null);

  const handleImageLoad = (e) => {
    const img = e.target;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Set initial size based on natural dimensions, but constrain to reasonable limits
    const maxWidth = 250;
    const maxHeight = 200;

    let width = naturalWidth;
    let height = naturalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    setDimensions({ width: Math.round(width), height: Math.round(height) });
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving) return;

    setIsRemoving(true);

    try {
      // Call the parent's remove handler first (for immediate UI update)
      if (onRemove) {
        await onRemove(src);
      }

      // Note: Database deletion is handled by the parent component's handleImageRemove function
      // which updates the summary through the existing update API endpoint
    } catch (error) {
      console.error("Error removing image:", error);
      // Revert the removal state if there was an error
      setIsRemoving(false);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target === imageRef.current) {
      setIsResizing(true);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isResizing]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        margin: "10px 0",
        maxWidth: "100%",
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onMouseDown={handleMouseDown}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          objectFit: "contain",
          borderRadius: "8px",
          display: "block",
          resize: "both",
          overflow: "hidden",
          opacity: isRemoving ? 0.5 : 1,
          transition: "opacity 0.2s",
          cursor: isResizing ? "nw-resize" : "default",
          border: "2px solid transparent",
          maxWidth: "100%",
          minWidth: "100px",
          minHeight: "75px",
        }}
        onMouseEnter={(e) => {
          e.target.style.border = "2px solid #007bff";
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.target.style.border = "2px solid transparent";
          }
        }}
      />
      {onRemove && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            background: isRemoving ? "#ccc" : "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: isRemoving ? "not-allowed" : "pointer",
            fontSize: "16px",
            lineHeight: "1",
            textAlign: "center",
            padding: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 10,
            transition: "background-color 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            if (!isRemoving) {
              e.target.style.backgroundColor = "#cc0000";
            }
          }}
          onMouseLeave={(e) => {
            if (!isRemoving) {
              e.target.style.backgroundColor = "#ff4444";
            }
          }}
          title={isRemoving ? "Removing..." : "Remove image"}
        >
          {isRemoving ? "⏳" : "×"}
        </button>
      )}

      {/* Resize handle */}
      <div
        style={{
          position: "absolute",
          bottom: "-4px",
          right: "-4px",
          width: "12px",
          height: "12px",
          background: "#007bff",
          cursor: "nw-resize",
          borderRadius: "2px",
          opacity: 0.7,
          zIndex: 5,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);

          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = dimensions.width;
          const startHeight = dimensions.height;

          const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            const newWidth = Math.max(100, startWidth + deltaX);
            const newHeight = Math.max(75, startHeight + deltaY);

            setDimensions({ width: newWidth, height: newHeight });
          };

          const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
        title="Drag to resize"
      />
    </div>
  );
}

export class ImageNode extends DecoratorNode {
  __src;
  __alt;
  __onRemove;
  __summarySeq;
  __apibaseurl;
  __token;

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__key,
      node.__onRemove,
      node.__summarySeq,
      node.__apibaseurl,
      node.__token
    );
  }

  constructor(src, alt, key, onRemove, summarySeq, apibaseurl, token) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__onRemove = onRemove;
    this.__summarySeq = summarySeq;
    this.__apibaseurl = apibaseurl;
    this.__token = token;
  }

  createDOM() {
    const dom = document.createElement("span");
    return dom;
  }

  updateDOM() {
    return false;
  }

  decorate(editor) {
    return (
      <ImageComponent
        src={this.__src}
        alt={this.__alt}
        onRemove={this.__onRemove}
        summarySeq={this.__summarySeq}
        apibaseurl={this.__apibaseurl}
        token={this.__token}
      />
    );
  }

  static importDOM() {
    return {
      img: (node) => ({
        conversion: (domNode) => {
          const { alt, src } = domNode;
          return { node: $createImageNode(src, alt) };
        },
        priority: 0,
      }),
    };
  }

  exportDOM() {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__alt);
    return { element };
  }
}

export function $createImageNode(
  src,
  alt,
  key,
  onRemove,
  summarySeq,
  apibaseurl,
  token
) {
  return new ImageNode(src, alt, key, onRemove, summarySeq, apibaseurl, token);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
