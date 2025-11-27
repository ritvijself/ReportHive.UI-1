// import React, { useState, useEffect } from 'react'; // useState aur useEffect import karein
// import { FaArrowLeft } from 'react-icons/fa';

// // Props ab badal jayenge
// const CommentModalContent = ({ initialComment, onSave, onBack, onClose }) => {

//     // STEP 1: State ko is component ke andar le aayein
//     const [text, setText] = useState('');

//     // STEP 2: useEffect se initial value set karein jab component khule
//     useEffect(() => {
//         setText(initialComment || '');
//     }, [initialComment]);

//     const handleSaveClick = () => {
//         // Save karte waqt state ki current value parent ko bhej dein
//         onSave(text);
//     };

//     return (
//         <>
//             <div className="modal-header">
//                 <button onClick={onBack} className="back-button"><FaArrowLeft /></button>
//                 <h3>Add/Edit Comment</h3>
//                 <button onClick={onClose} className="close-button">&times;</button>
//             </div>
//             <div className="modal-body">
//                 <textarea
//                     className="comment-textarea"
//                     value={text}
//                     // Yahan ab local setText function use hoga
//                     onChange={(e) => setText(e.target.value)}
//                     placeholder="Add your comment..."
//                 />
//                 {/* Yahan naya handleSaveClick function call hoga */}
//                 <button onClick={handleSaveClick} className="modal-button save-button">Save Comment</button>
//             </div>
//         </>
//     );
// };

// export default CommentModalContent;


import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// Props mein ab 'currentUser' bhi aayega
const CommentModalContent = ({ initialComment, onSave, onBack, onClose, currentUser }) => {

    const [text, setText] = useState('');

    useEffect(() => {
        // Agar pehle se comment hai, to uska text dikhayein
        setText(initialComment?.text || '');
    }, [initialComment]);

    const handleSaveClick = () => {
        // Naya comment object banayein
        const newComment = {
            text: text,
            user: currentUser.name, // Current user ka naam
            timestamp: new Date().toISOString() // Current time
        };
        onSave(newComment);
    };

    // Timestamp ko aasan format mein dikhane ke liye
    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="modal-header">
                <button onClick={onBack} className="back-button"><FaArrowLeft /></button>
                <h3>Add/Edit Comment</h3>
                <button onClick={onClose} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
                {/* Purane comment ki details dikhayein */}
                {initialComment?.user && (
                    <div className="previous-comment-info">
                        <p>
                            <strong>Last updated by:</strong> {initialComment.user}
                            <br />
                            <strong>On:</strong> {formatTimestamp(initialComment.timestamp)}
                        </p>
                    </div>
                )}
                
                <textarea
                    className="comment-textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add your comment..."
                />
                
                <button onClick={handleSaveClick} className="modal-button save-button">
                    Save Comment
                </button>
            </div>
        </>
    );
};

export default CommentModalContent;