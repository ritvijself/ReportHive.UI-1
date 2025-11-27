import React, { useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_IMAGE_COMMAND } from "../Image/ImagePlugin"; // ImagePlugin se command import karein
import { INSERT_REMOVABLE_IMAGE_COMMAND } from "../Image/RemovableImagePlugin"; // RemovableImagePlugin se command import karein

const ImageUploadButton = ({ onImageSelected }) => {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const payload = { src: reader.result, alt: file.name };

        console.log(
          "Dispatching INSERT_REMOVABLE_IMAGE_COMMAND with payload:",
          payload
        );

        // Insert the image into the editor first
        const result = editor.dispatchCommand(
          INSERT_REMOVABLE_IMAGE_COMMAND,
          payload
        );

        // Then call the callback for state management
        if (typeof onImageSelected === "function") {
          onImageSelected(file, reader.result);
        }
      };
      reader.onerror = () => {
        console.error("Failed to read file:", file.name);
      };
      reader.readAsDataURL(file);
    }

    // Clear the input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => fileInputRef.current.click()}
        title="Insert Image"
      >
        📸 Image
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />
    </>
  );
};

export default ImageUploadButton;
