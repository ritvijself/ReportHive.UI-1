import React, { useState } from 'react';
import Modal from 'react-modal';
import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/react';
import './GoogleDriveModal.css'; 

// Tiptap Toolbar (Same as before)
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

// ✅ Component ka naam badal diya gaya hai
const GoogleDriveModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    // ✅ docType state hata diya gaya hai

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
        // ✅ onSave se docType hata diya gaya hai
        onSave({
            title,
            link,
            notes: editor ? editor.getHTML() : '<p></p>',
        });
        onClose();
    };
    
    const handleAfterOpen = () => {
        setTitle('');
        setLink('');
        // ✅ docType reset karna hata diya gaya hai
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
                {/* ✅ Title badal diya gaya hai */}
                <h4>Add a link to a Google Drive item</h4>
                <button onClick={onClose} className="closeButton">&times;</button>
            </div>
            
            <div className="privacy-notice">
                <p>🔒 Everything added to <strong>this folder</strong> is private to us.</p>
            </div>
            
            <div className="form-body">
                {/* ✅ Icon badal diya gaya hai */}
                <svg width="64px" height="64px" viewBox="0 0 32 27.4" className="doc-icon"><polygon fill="#1E88E5" points="21.2,0 10.8,0 0,18.8 5.4,27.4 16.2,27.4 26.7,9.1 "/><polygon fill="#42A5F5" points="16.2,27.4 21.6,18.8 32,18.8 26.7,27.4 "/><polygon fill="#FFC107" points="5.4,27.4 0,18.8 10.8,0 16.2,9.1 "/></svg>
                <div className="form-fields">
                    <label>What do you want to call this link?</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Marketing Assets Folder" />

                    <label>Paste the Google Drive link here</label>
                    <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://drive.google.com/..." />
                    
                    {/* ✅ Radio buttons yahan se hata diye gaye hain */}

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

export default GoogleDriveModal;