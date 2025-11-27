import React, { useState } from 'react';
import Modal from 'react-modal';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './GoogleDocModal.css'; // Modal ki styling ke liye


const TiptapToolbar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div className="tiptap-toolbar">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>B</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>I</button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>S</button>
        </div>
    );
};

const GoogleDocModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [docType, setDocType] = useState('doc');

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose-mirror-editor',
            },
        },
    });

    const handleSubmit = () => {
        if (!title || !link) {
            alert('Please fill out the title and link fields.');
            return;
        }
        onSave({
            title,
            link,
            docType,
            notes: editor ? editor.getHTML() : '<p></p>',
        });
        onClose();
    };
    
    // Modal khulne par state reset karein
    const handleAfterOpen = () => {
        setTitle('');
        setLink('');
        setDocType('doc');
        editor?.commands.setContent('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            onAfterOpen={handleAfterOpen}
            className="modalContent"
            overlayClassName="modalOverlay"
            appElement={document.getElementById('root')}
        >
            <div className="modalHeader">
                <h4>Who's allowed to see this Google Doc?</h4>
                <button onClick={onClose} className="closeButton">&times;</button>
            </div>
            
            <div className="privacy-notice">
                <p>🔒 Everything added to <strong>this folder</strong> is private to us.</p>
            </div>
            
            <div className="form-body">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Google_Docs_logo_%282014-2020%29.svg/1481px-Google_Docs_logo_%282014-2020%29.svg.png" alt="Google Doc Icon" className="doc-icon" />
                <div className="form-fields">
                    <label>What do you want to call this link?</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume" />

                    <label>Paste the Google Drive link here</label>
                    <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g. https://docs.google.com/..." />
                    
                    <label>What kind of document is this?</label>
                    <div className="radio-group">
                        {['doc', 'sheet', 'slide', 'other'].map(type => (
                            <label key={type}>
                                <input type="radio" name="docType" value={type} checked={docType === type} onChange={(e) => setDocType(e.target.value)} />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                        ))}
                    </div>

                    <label>Notes</label>
                    <div className="notes-editor">
                        <TiptapToolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            <div className="modalFooter">
                <button onClick={onClose} className="cancelButton">Cancel</button>
                <button onClick={handleSubmit} className="saveButton">Save</button>
            </div>
        </Modal>
    );
};

export default GoogleDocModal;