import React, { useState, useRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { $createLinkNode } from '@lexical/link';
import { $generateNodesFromDOM } from '@lexical/html';

import GoogleDocModal from '../LinkDoc/GoogleDocModal';
import GoogleDriveModal from '../LinkDoc/GoogleDriveModal';
import './NewContentButton.css';

// Icons
const GoogleDocIcon = () => <svg width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#4285F4" /></svg>;
const GoogleDriveIcon = () => <svg width="24" height="24" viewBox="0 0 32 27.4"><polygon fill="#1E88E5" points="21.2,0 10.8,0 0,18.8 5.4,27.4 16.2,27.4 26.7,9.1 "/><polygon fill="#42A5F5" points="16.2,27.4 21.6,18.8 32,18.8 26.7,27.4 "/><polygon fill="#FFC107" points="5.4,27.4 0,18.8 10.8,0 16.2,9.1 "/></svg>;

const NewContentButton = () => {
    const [editor] = useLexicalComposerContext();
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [isDriveModalOpen, setIsDriveModalOpen] = useState(false); // ✅ Naye modal ke liye state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ✅ Dono modals ke liye alag-alag save handlers
    const handleDocModalSave = (data) => {
        const { title, link, notes } = data;
        insertContentInEditor(`${title}`, link, notes);
    };

    const handleDriveModalSave = (data) => {
        const { title, link, notes } = data;
        insertContentInEditor(`${title}`, link, notes); // Alag icon use kiya
    };
    
    // ✅ Common function jo content ko editor mein daalega
    // const insertContentInEditor = (title, link, notes) => {
    //     editor.update(() => {
    //         const root = $getRoot();
    //         const container = $createParagraphNode();
    //         const linkNode = $createLinkNode(link, { rel: 'noopener noreferrer', target: '_blank' });
    //         linkNode.append($createTextNode(title));
    //         container.append(linkNode);
    //         root.append(container);

    //         if (notes && notes !== '<p></p>') {
    //             const notesContainer = $createParagraphNode();
    //             const dom = new DOMParser().parseFromString(`<blockquote>${notes}</blockquote>`, 'text/html');
    //             const nodes = $generateNodesFromDOM(editor, dom);
    //             nodes.forEach(node => root.append(node));
    //         }
    //     });
    // };


const insertContentInEditor = (title, link, notes) => {
    editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();

        // Link Node
        const linkNode = $createLinkNode(link, { rel: 'noopener noreferrer', target: '_blank' });
        linkNode.append($createTextNode(title));
        
        // Notes Node
        if (notes && notes !== '<p></p>') {
            // Hum notes ko link node ke andar ek custom data attribute mein store karenge
            // Yeh sabse aasan tareeka hai serialize aur deserialize karne ka.
            linkNode.setFormat('bold'); // Bold kar dete hain taaki alag dikhe
            const notesText = ` [NOTES|${notes}]`;
            linkNode.append($createTextNode(notesText));
        }

        paragraph.append(linkNode);
        root.append(paragraph);
    });
};



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDropdownItemClick = (type) => {
        setIsDropdownOpen(false);
        if (type === 'doc') {
            setIsDocModalOpen(true);
        } else if (type === 'drive') { // ✅ Drive ke liye logic
            setIsDriveModalOpen(true);
        }
    };

    return (
        <div className="new-content-container" ref={dropdownRef}>
            <button className="btn btn-primary btn-sm" onClick={() => setIsDropdownOpen(prev => !prev)}>
                + New
            </button>

            {isDropdownOpen && (
                <div className="custom-dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleDropdownItemClick('doc')}>
                        <GoogleDocIcon />
                        <span>Google Doc</span>
                    </div>
                    <div className="dropdown-item" onClick={() => handleDropdownItemClick('drive')}>
                        <GoogleDriveIcon />
                        <span>Google Drive</span>
                    </div>
                </div>
            )}

            {/* Dono modals render honge lekin dikhenge state ke hisab se */}
            <GoogleDocModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                onSave={handleDocModalSave}
            />
            <GoogleDriveModal
                isOpen={isDriveModalOpen}
                onClose={() => setIsDriveModalOpen(false)}
                onSave={handleDriveModalSave}
            />
        </div>
    );
};

export default NewContentButton;