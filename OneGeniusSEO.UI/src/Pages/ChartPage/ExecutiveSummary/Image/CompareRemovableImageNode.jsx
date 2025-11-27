import { DecoratorNode } from "lexical";
import { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";

function RemovableImageComponent({
  src,
  alt,
  onRemove,
  summarySeq,
  apibaseurl,
  token,
  nodeKey,
}) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editor] = useLexicalComposerContext();

  const handleImageLoad = (e) => {
    const img = e.target;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Set initial size based on natural dimensions, but constrain to reasonable limits
    const maxWidth = 400;
    const maxHeight = 300;

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
    setIsLoaded(true);
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRemoving) return;

    setIsRemoving(true);

    try {
      // Remove the node from the Lexical editor immediately
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.remove();
        }
      });

      // Call the parent's remove handler for database cleanup
      if (onRemove) {
        await onRemove(src);
      }
    } catch (error) {
      console.error("Error removing image:", error);
      // Revert the removal if there was an error
      setIsRemoving(false);
    }
  };

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
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={(e) => {
          console.error("Failed to load image:", src);
          setIsLoaded(false);
        }}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          objectFit: "contain",
          borderRadius: "8px",
          display: "block",
          opacity: isRemoving ? 0.5 : isLoaded ? 1 : 0.7,
          transition: "opacity 0.2s",
          maxWidth: "100%",
          minWidth: "100px",
          minHeight: "75px",
          border: "2px solid transparent",
        }}
        onMouseEnter={(e) => {
          e.target.style.border = "2px solid #007bff";
        }}
        onMouseLeave={(e) => {
          e.target.style.border = "2px solid transparent";
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

export class RemovableImageNode extends DecoratorNode {
  __src;
  __alt;
  __onRemove;
  __summarySeq;
  __apibaseurl;
  __token;

  static getType() {
    return "removable-image";
  }

  static clone(node) {
    return new RemovableImageNode(
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
      <RemovableImageComponent
        src={this.__src}
        alt={this.__alt}
        onRemove={this.__onRemove}
        summarySeq={this.__summarySeq}
        apibaseurl={this.__apibaseurl}
        token={this.__token}
        nodeKey={this.getKey()}
      />
    );
  }

  static importDOM() {
    return {
      img: (node) => ({
        conversion: (domNode) => {
          const { alt, src } = domNode;
          return { node: $createRemovableImageNode(src, alt) };
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

  // Helper method to get the image source
  getSrc() {
    return this.__src;
  }
}

export function $createRemovableImageNode(
  src,
  alt,
  key,
  onRemove,
  summarySeq,
  apibaseurl,
  token
) {
  return new RemovableImageNode(
    src,
    alt,
    key,
    onRemove,
    summarySeq,
    apibaseurl,
    token
  );
}

export function $isRemovableImageNode(node) {
  return node instanceof RemovableImageNode;
}
