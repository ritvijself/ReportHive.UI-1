import { DecoratorNode } from "lexical";
import { useState } from "react";

function ImageComponent({ src, alt, onRemove, summarySeq, apibaseurl, token }) {
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleResize = (e) => {
    const newWidth = e.target.width;
    const newHeight = e.target.height;
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    try {
      // Call the parent's remove handler first (for immediate UI update)
      if (onRemove) {
        onRemove(src);
      }
      
      // Note: Database deletion is handled by the parent component's handleImageRemove function
      // which updates the summary through the existing update API endpoint
    } catch (error) {
      console.error("Error removing image:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block", margin: "10px 0" }}>
      <img
        src={src}
        alt={alt}
        onLoad={handleResize}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: "cover",
          borderRadius: "8px",
          display: "block",
          resize: "both",
          overflow: "hidden",
          opacity: isRemoving ? 0.5 : 1,
          transition: "opacity 0.2s",
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
            lineHeight: "24px",
            textAlign: "center",
            padding: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 10,
            transition: "background-color 0.2s",
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

export function $createImageNode(src, alt, key, onRemove, summarySeq, apibaseurl, token) {
  return new ImageNode(src, alt, key, onRemove, summarySeq, apibaseurl, token);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
