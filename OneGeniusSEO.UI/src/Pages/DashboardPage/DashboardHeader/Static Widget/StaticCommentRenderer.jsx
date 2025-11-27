import React, { useState, useRef } from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import StaticComment from './StaticComment';

// StaticCommentRenderer: renders multiple StaticComment widgets
const StaticCommentRenderer = ({
    commentKeys,
    commentRefs,
    highlightedKey,
    onDeleteComment,
    fetchedComments = [],
    onSaved,
    reportDate, // forwarded from parent (report start date)
}) => {
    if (!commentKeys || commentKeys.length === 0) return null;

    const getKeyString = (k) => {
        if (!k) return String(Math.random());
        if (typeof k === 'string') return k;
        if (typeof k === 'object') return k.id || k.key || k.commentKey || JSON.stringify(k);
        return String(k);
    };

    const findInitialForKey = (keyStr) => {
        if (!Array.isArray(fetchedComments)) return null;
        return (
            fetchedComments.find((c) =>
                String(c.commentBoxSeq) === String(keyStr) ||
                String(c.commentBoxSeq) === String(keyStr?.replace?.("comment_", "")) ||
                String(c.id) === String(keyStr) ||
                String(c.id) === String(keyStr?.replace?.("comment_", ""))
            ) || null
        );
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const deleteKeyRef = useRef(null);

    const confirmDeleteKey = () => {
        const key = deleteKeyRef.current;
        setShowDeleteModal(false);
        deleteKeyRef.current = null;
        if (typeof onDeleteComment === 'function') onDeleteComment(key);
    };

    const commentElements = commentKeys.map((rawKey) => {
        const key = getKeyString(rawKey);
        const isHighlighted = key === highlightedKey;
        const highlightStyle = isHighlighted
            ? { border: '4px solid #4CAF50', boxShadow: '0 0 10px rgba(76, 175, 80, 0.8)' }
            : { border: '4px solid transparent', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)' };

        const initialComment = findInitialForKey(key);
        const hasValue = (
            ((initialComment?.comment || initialComment?.Comment || '').trim().length > 0) ||
            (Array.isArray(initialComment?.images) && initialComment.images.length > 0) ||
            (Array.isArray(initialComment?.Images) && initialComment.Images.length > 0)
        );

        return (
            <Row
                key={key}
                className="mb-4"
                ref={(el) => {
                    if (commentRefs && commentRefs.current) commentRefs.current[key] = el;
                }}
                style={{ transition: 'all 0.3s ease-in-out', borderRadius: '8px', ...highlightStyle ,backgroundColor:"white",marginTop:"20px",marginBottom:"20px"}}
            >
                <Col md={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* ✅ Added "Comment" text here */}
                        <h6 style={{ margin: 0, fontWeight: 'bold' }}>Comment Box</h6>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {hasValue && (
                                <button
                                    className="btn btn-sm btn-outline-primary pdf-ignore"
                                    title="Edit comment widget"
                                    onClick={() => {
                                        try {
                                            if (!commentRefs || !commentRefs.current) return;
                                            const obj = commentRefs.current[key];
                                            const el = obj && obj.el ? obj.el : obj || null;
                                            if (!el) return;
                                            const editBtn = el.querySelector && el.querySelector('[title="Edit"]');
                                            if (editBtn) {
                                                editBtn.click();
                                                return;
                                            }
                                            const maybe = el.querySelectorAll && el.querySelectorAll('button');
                                            if (maybe && maybe.length) {
                                                for (const b of maybe) {
                                                    if ((b.textContent || '').trim().toLowerCase() === 'edit') {
                                                        b.click();
                                                        return;
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            console.warn('Failed to programmatically enter edit mode for comment', e);
                                        }
                                    }}
                                >
                                    Edit
                                </button>
                            )}
                            {typeof onDeleteComment === 'function' && (
                                <>
                                    <button
                                        className="btn btn-sm btn-danger pdf-ignore"
                                        onClick={() => {
                                            // If this comment widget has no content (no text/images), bypass confirmation
                                            if (!hasValue) {
                                                if (typeof onDeleteComment === 'function') onDeleteComment(key);
                                                return;
                                            }
                                            deleteKeyRef.current = key; setShowDeleteModal(true);
                                        }}
                                        title="Remove comment widget"
                                        style={{ marginLeft: 0 }}
                                    >
                                        Remove
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <StaticComment
                            commentKey={key}
                            onDelete={onDeleteComment}
                            initialComment={initialComment}
                            onSaved={onSaved}
                            reportDate={reportDate}
                        />
                    </div>
                </Col>
            </Row>
        );
    });

    return (
        <>
            <div>{commentElements}</div>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>🗑️ Delete Comment Widget</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to remove this comment widget? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDeleteKey}>Confirm Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default StaticCommentRenderer;
