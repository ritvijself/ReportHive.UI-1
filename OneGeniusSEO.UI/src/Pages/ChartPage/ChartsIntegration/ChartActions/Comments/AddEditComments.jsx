import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';

const apibaseurl = import.meta.env.VITE_API_BASE_URL;

// Helper function to get fresh token
const getToken = () => {
    return localStorage.getItem("token");
};

// Section-01 Custom Hook
export const useCommentSystem = (reportDateSource = null, clientSeq = null) => {
    // State management
    const [comments, setComments] = useState({});
    const [isModalOpen, setisModalOpen] = useState(false);
    const [selectedChart, setSelectedChart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // API se saare comments fetch karne ka function
    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        // Clear previous month's comments immediately to prevent stale display
        setComments({});

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Build query params from reportDateSource (startDate)
            let url = `${apibaseurl}/api/ChartComments/all`;
            try {
                if (reportDateSource) {
                    const d = new Date(reportDateSource);
                    if (!isNaN(d.getTime())) {
                        const params = new URLSearchParams();
                        params.append('year', String(d.getFullYear()));
                        params.append('month', String(d.getMonth() + 1));
                        params.append('day', String(d.getDate()));
                        // include clientSeq when available to ensure backend can scope results
                        if (clientSeq) params.append('clientSeq', String(clientSeq));
                        url = `${url}?${params.toString()}`;
                    }
                }
            } catch (e) { }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            }

            if (!response.ok) {
                throw new Error('Error in comment fetch.');
            }

            const apiData = await response.json();

            // Normalize response to array
            const list = Array.isArray(apiData) ? apiData : (Array.isArray(apiData?.data) ? apiData.data : []);

            if (!Array.isArray(list) || list.length === 0) {
                setComments({});
            } else {
                const commentsObject = list.reduce((acc, comment) => {
                    const key = comment.chartUniqueName || comment.ChartUniqueName || comment?.chartKey || comment?.chartUniqueName;
                    if (key) acc[key] = comment;
                    return acc;
                }, {});
                setComments(commentsObject);
            }
        } catch (err) {
            setError(err.message);
            console.error("Fetch comments error:", err);
        } finally {
            setLoading(false);
        }
    }, [reportDateSource, clientSeq]);

    // Also clear comments whenever the report date changes
    useEffect(() => {
        // Clear comments when either the report date or client changes
        setComments({});
    }, [reportDateSource, clientSeq]);

    // Component load hone par comments fetch karein
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Modal ko kholne ka function
    const openCommentModal = (chart) => {
        setSelectedChart(chart);
        setisModalOpen(true);
    };

    // Modal ko band karne ka function
    const closeCommentModal = () => {
        setisModalOpen(false);
        setSelectedChart(null);
    };

    // Comment ko SAVE (Create/Edit) karne ka function
    const saveComment = async (chartId, commentData, reportDateSource = null) => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found');
            return;
        }

        const isEditing = !!comments[chartId];

        const url = isEditing
            ? `${apibaseurl}/api/ChartComments/edit`
            : `${apibaseurl}/api/ChartComments/create`;

        const method = isEditing ? 'PUT' : 'POST';

        // reportDate ko CSV/Keyword APIs ke jaise structure mein bhejna hai
        let reportDate = null;
        try {
            const d = reportDateSource ? new Date(reportDateSource) : new Date();
            if (!isNaN(d.getTime())) {
                // API expects System.DateOnly, supply ISO date part (YYYY-MM-DD)
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                reportDate = `${yyyy}-${mm}-${dd}`;
            }
        } catch (e) {
            // ignore, server can infer
        }

        const nowIso = new Date().toISOString();

        // Server expects JSON with top-level PascalCase fields
        const requestBody = {
            ChartUniqueName: chartId,
            Message: commentData.text,
            CreatedBy: commentData.user,
            // Optional server-friendly metadata
            IsShow: true,
            CreatedDate: nowIso,
            UpdatedDate: nowIso,
            ...(reportDate ? { ReportDate: reportDate } : {}),
        };
        const payload = requestBody;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            }

            if (!response.ok) {
                throw new Error('Comment has not saved.');
            }

            // Success ke baad comment list refresh karein
            await fetchComments();
        } catch (err) {
            setError(err.message);
            console.error("Error in comment save:", err);
        }
    };

    // Comment ko DELETE karne ka function
    const deleteComment = async (chartId) => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found');
            return;
        }

        try {
            const response = await fetch(`${apibaseurl}/api/ChartComments/delete/${chartId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            }

            if (!response.ok) {
                throw new Error('Comment delete nahi ho paaya.');
            }

            // Success ke baad comment list refresh karein
            await fetchComments();
        } catch (err) {
            setError(err.message);
            console.error("Comment delete karne mein error:", err);
        }
    };

    // Hook se sab kuch return karein
    return {
        comments,
        isModalOpen,
        selectedChart,
        loading,
        error,
        openCommentModal,
        closeCommentModal,
        saveComment,
        deleteComment,
    };
};

// Section-02 UI Component 
export const AddEditCommentModal = ({ show, chart, handleClose, onSave, currentUser, existingComment, reportDate }) => {
    const [text, setText] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [caretIndex, setCaretIndex] = useState(0);
    const textareaRef = React.useRef(null);

    useEffect(() => {
        if (existingComment) {
            setText(existingComment.message || '');
        } else {
            setText('');
        }
    }, [existingComment, show]); // Added 'show' to reset when modal opens/closes

    // Fetch team members for mention suggestions on demand
    const fetchMembers = async () => {
        const token = getToken();
        if (!token) {
            console.error("No token found");
            return [];
        }

        try {
            const resp = await fetch(`${apibaseurl}/api/TeamMemberClient/dashboard_teamMembers`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (resp.status === 401) {
                console.error('Authentication failed');
                return [];
            }

            if (!resp.ok) return [];
            const data = await resp.json();
            const membersArray = Array.isArray(data) ? data : (data.data || []);
            // Normalize to names
            const names = membersArray.map((m) => m.teamMember_Name || m.name || '').filter(Boolean);
            setTeamMembers(names);
            return names;
        } catch (e) {
            console.error("Error fetching team members:", e);
            return [];
        }
    };

    // Reset and refresh members/suggestions each time the modal opens so
    // the suggestions don't persist a previous filtered result.
    useEffect(() => {
        if (show) {
            // Refresh cached members and reset suggestions (do not show suggestions yet)
            fetchMembers().then((names) => {
                setFilteredSuggestions(names.slice(0, 8));
                setShowSuggestions(false);
            }).catch(() => {
                setFilteredSuggestions([]);
                setShowSuggestions(false);
            });
        } else {
            // Modal closed -> clear any leftover suggestions
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    }, [show]);

    // Handle typing to show @mention suggestions
    const handleTextChange = (e) => {
        const val = e.target.value;
        setText(val);
        const pos = e.target.selectionStart || 0;
        setCaretIndex(pos);

        // Find the fragment after the last '@' before caret
        const uptoCaret = val.slice(0, pos);
        const atIndex = uptoCaret.lastIndexOf('@');
        if (atIndex >= 0) {
            const fragment = uptoCaret.slice(atIndex + 1);
            // stop if space or newline immediately follows '@'
            if (fragment.length === 0) {
                // if we already have members, show all; otherwise fetch
                if (teamMembers.length === 0) {
                    fetchMembers().then((names) => {
                        setFilteredSuggestions(names.slice(0, 8));
                        setShowSuggestions(names.length > 0);
                    });
                } else {
                    setFilteredSuggestions(teamMembers.slice(0, 8));
                    setShowSuggestions(teamMembers.length > 0);
                }
                return;
            }
            // If fragment contains whitespace, do not suggest
            if (/\s/.test(fragment)) {
                setShowSuggestions(false);
                return;
            }
            const q = fragment.toLowerCase();
            if (teamMembers.length === 0) {
                fetchMembers().then((names) => {
                    const filtered = names.filter((n) => n.toLowerCase().startsWith(q));
                    setFilteredSuggestions(filtered.slice(0, 8));
                    setShowSuggestions(filtered.length > 0);
                });
            } else {
                const filtered = teamMembers.filter((n) => n.toLowerCase().startsWith(q));
                setFilteredSuggestions(filtered.slice(0, 8));
                setShowSuggestions(filtered.length > 0);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    // Render highlighted HTML for mentions inside the input (overlay)
    const getHighlightedHtml = (value) => {
        try {
            const escapeHtml = (s) => s
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            const safe = escapeHtml(value || '');
            // Split into parts but do NOT allow spaces inside the mention token.
            // This prevents strings like "@rohit this" from being matched as a single mention.
            const parts = safe.split(/(@[A-Za-z][A-Za-z0-9_]*)/g);
            // Always highlight any @mention token in the overlay so existing mentions
            // show as highlighted immediately (no dependency on teamMembers state).
            return parts
                .map((p) => {
                    if (p && p.startsWith && p.startsWith('@')) {
                        const raw = p.slice(1).trim();
                        return `<span style="color:#0073ed">@${raw}</span>`;
                    }
                    return p;
                })
                .join('');
        } catch (e) {
            return value || '';
        }
    };

    const insertMention = (name) => {
        const el = textareaRef.current;
        const value = text;
        const pos = caretIndex;
        const uptoCaret = value.slice(0, pos);
        const fromCaret = value.slice(pos);
        const atIndex = uptoCaret.lastIndexOf('@');
        if (atIndex >= 0) {
            const before = value.slice(0, atIndex);
            const after = fromCaret;
            const newVal = `${before}@${name} ${after}`;
            setText(newVal);
            setShowSuggestions(false);
            // restore caret after inserted mention + space
            const newPos = (before + '@' + name + ' ').length;
            requestAnimationFrame(() => {
                try {
                    if (el) {
                        el.focus();
                        el.setSelectionRange(newPos, newPos);
                    }
                } catch (e) { }
            });
        } else {
            setShowSuggestions(false);
        }
    };

    if (!chart) return null;

    const handleSave = () => {
        const newComment = {
            text: text,
            user: currentUser.name,
            timestamp: new Date().toISOString()
        };
        onSave(chart.key, newComment, reportDate);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {existingComment ? 'Edit' : 'Add'} Comment for: {chart.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ position: 'relative' }}>
                    {/* Highlight layer */}
                    <div
                        aria-hidden
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            border: '1px solid #ced4da',
                            borderRadius: '.375rem',
                            padding: '.375rem .75rem',
                            minHeight: '120px',
                            color: '#212529',
                            background: '#fff'
                        }}
                        dangerouslySetInnerHTML={{ __html: getHighlightedHtml(text) }}
                    />
                    {/* Transparent textarea overlay */}
                    <textarea
                        ref={textareaRef}
                        rows={4}
                        value={text}
                        onChange={handleTextChange}
                        onClick={(e) => setCaretIndex(e.target.selectionStart || 0)}
                        onKeyUp={(e) => setCaretIndex(e.target.selectionStart || 0)}
                        placeholder="Type your comment here... Use @ to mention"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: 'transparent',
                            caretColor: '#212529',
                            padding: '.375rem .75rem',
                            resize: 'vertical'
                        }}
                    />
                    {showSuggestions && (
                        <div
                            className="list-group"
                            style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0, right: 0, maxHeight: 180, overflowY: 'auto' }}
                        >
                            {filteredSuggestions.map((name) => (
                                <button
                                    type="button"
                                    key={name}
                                    className="list-group-item list-group-item-action"
                                    onMouseDown={(e) => { e.preventDefault(); insertMention(name); }}
                                >
                                    @{name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={!text.trim()}>
                    Save Comment
                </Button>
            </Modal.Footer>
        </Modal>
    );
};