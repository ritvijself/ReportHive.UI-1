


// api integration
import React, { useEffect, useState, forwardRef, useRef, useLayoutEffect } from "react";
import ExecutiveSummary from "../../../ChartPage/ExecutiveSummary/ExecutiveSummary";
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

// StaticComment now integrates with backend CommentBox API (create/update/delete)
const StaticComment = forwardRef(({ onDelete, commentKey, initialComment = null, onSaved, reportDate = null }, ref) => {
  const containerRef = useRef(null);
  const [localSummaryText, setLocalSummaryText] = useState("");
  const [localSummaryImages, setLocalSummaryImages] = useState([]);
  const [showLocalSummary, setShowLocalSummary] = useState(true);
  const [serverId, setServerId] = useState(null); // id from backend when saved
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Initialize from initialComment if present
  useEffect(() => {
    if (initialComment) {
      // support server response shape: commentBoxSeq, comment, images
      setLocalSummaryText(initialComment.comment || initialComment.Comment || "");
      setLocalSummaryImages(initialComment.images || initialComment.Images || []);
      setServerId(initialComment.commentBoxSeq || initialComment.id || initialComment.idString || initialComment.id);
      setShowLocalSummary(true);
    }
  }, [initialComment]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      const heading = container.querySelector("h4");
      if (heading) heading.style.display = "none";

      const buttonContainer = container.querySelector('.mt-3[style*="display: flex"]');
      if (buttonContainer && buttonContainer.children.length > 1) {
        const cancelButton = buttonContainer.children[1];
        if (cancelButton && cancelButton.tagName === "BUTTON" && cancelButton.textContent.trim() === "Cancel") {
          cancelButton.style.display = "none";
        }
      }
    }
  }, [localSummaryText, localSummaryImages]);

  // Create or Update comment on save from ExecutiveSummary
  const handleSave = async (text, files = []) => {
    if (!apibaseurl) {
      toast.error("API base URL not configured");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Comment", text || "");
      // backend expects CreatedDate in date-time format
      formData.append("CreatedDate", new Date().toISOString());
      Array.from(files || []).forEach((file) => formData.append("Images", file));

      const headers = {
        // browser will set multipart boundary automatically
        Authorization: token ? `Bearer ${token}` : undefined,
      };

      let res;
      if (serverId) {
        // update
        res = await fetch(`${apibaseurl}/api/commentbox/update/${encodeURIComponent(serverId)}`, {
          method: "PUT",
          body: formData,
          headers,
        });
      } else {
        // create
        if (reportDate) {
          // backend expects ReportDate field for create
          formData.append('ReportDate', typeof reportDate === 'string' ? reportDate : new Date(reportDate).toISOString());
        }
        res = await fetch(`${apibaseurl}/api/commentbox/create`, {
          method: "POST",
          body: formData,
          headers,
        });
      }

      if (!res.ok) {
        const textRes = await res.text();
        console.error("CommentBox API error:", res.status, textRes);
        toast.error("Failed to save comment");
        return;
      }

      const data = await res.json().catch(() => null);
      // prefer server id from response (commentBoxSeq) or common id shapes
      const newId = data?.commentBoxSeq || data?.id || data?.Id || serverId || (data && typeof data === "string" ? data : null);
      setServerId(newId);
      setLocalSummaryText(text || "");
      // do not set images from response to avoid complexity; assume success
      if (onSaved) onSaved({ id: newId, comment: text, commentKey });
      toast.success("Comment saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error saving comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Show confirmation modal first; actual deletion happens on confirm
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    // If there is a serverId, delete on backend first
    if (serverId && apibaseurl) {
      try {
        const res = await fetch(`${apibaseurl}/api/commentbox/delete/${encodeURIComponent(serverId)}`, {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) {
          console.error("Failed to delete comment", await res.text());
          toast.error("Failed to delete comment");
          return;
        }
      } catch (err) {
        console.error(err);
        toast.error("Error deleting comment");
        return;
      }
    }

    // Clear local state and notify parent
    setLocalSummaryText("");
    setLocalSummaryImages([]);
    if (onDelete) onDelete(commentKey);
    toast.success("Comment deleted");
  };

  return (
    <>
    <div
      ref={(node) => {
        if (ref) {
          if (typeof ref === "function") ref(node);
          else if (ref.current !== undefined) ref.current = node;
        }
        containerRef.current = node;
      }}
      style={{
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #ddd",
        height: "100%",
        width: "100%",
      }}
    >
      <ExecutiveSummary
        showSummary={showLocalSummary}
        summaryText={localSummaryText}
        summaryImages={localSummaryImages}
        onSaveSummary={handleSave}
        onDeleteSummary={handleDelete}
        isSaving={loading}
      />
    </div>
      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Confirm Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default StaticComment;


