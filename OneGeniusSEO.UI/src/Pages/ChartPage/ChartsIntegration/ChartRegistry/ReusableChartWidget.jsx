// import React, { useState } from "react";
// import Modal from 'react-modal'; // Modal ko import karein
// import { chartComponents } from "./ChartRegistry";
// import { FaBars } from "react-icons/fa";
// import './ReusableChartWidget.css';

// const ReusableChartWidget = ({ title, initialType, chartProps, availableTypes }) => {
//     const [currentChartType, setCurrentChartType] = useState(initialType);
    
//     // State ko dropdown se modal ke liye change karein
//     const [modalIsOpen, setModalIsOpen] = useState(false);

//     const ChartComponent = chartComponents[currentChartType];

//     if (!ChartComponent) {
//         return <div className="error-message">Error: Chart type "{currentChartType}" not found.</div>;
//     }

//     // Modal ko kholne aur band karne ke functions
//     const openModal = (e) => {
//         e.stopPropagation();
//         setModalIsOpen(true);
//     };

//     const closeModal = () => {
//         setModalIsOpen(false);
//     };

//     const handleTypeChange = (type) => {
//         setCurrentChartType(type);
//         closeModal(); // Type change karne ke baad modal band ho jayega
//     };
    
//     const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1').trim() : '';

//     return (
//         <div className="widget-container">
//             <div className="drag-handle widget-header">
//                 <h6 className="widget-title">{title}</h6>
//                 <div className="menu-container no-drag">
//                     {/* Button ab modal kholega */}
//                     <button className="menu-button" onClick={openModal}>
//                         <FaBars />
//                     </button>
//                 </div>
//             </div>

//             <div className="widget-body">
//                 <ChartComponent {...chartProps} />
//             </div>

//             {/* Yahan Dropdown ki jagah Modal ka code hai */}
//             <Modal
//                 isOpen={modalIsOpen}
//                 onRequestClose={closeModal}
//                 contentLabel="Chart Conversion Modal"
//                 className="ReactModal__Content"
//                 overlayClassName="ReactModal__Overlay"
//             >
//                 <div className="modal-header">
//                     <h3>Convert Chart</h3>
//                     <button onClick={closeModal} className="close-button">&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <p>Select a new chart type to view the data differently.</p>
//                     <div className="conversion-options">
//                         {availableTypes?.map((type) => (
//                             <button
//                                 key={type}
//                                 onClick={() => handleTypeChange(type)}
//                                 className="modal-button"
//                             >
//                                 {capitalize(type)}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// };

// export default ReusableChartWidget;





// abhi fixing ka mew code==================================
import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaBars, FaArrowLeft, FaRegCommentDots } from "react-icons/fa";

import { chartComponents } from "./ChartRegistry";
import ColorModalContent from './ColorFunctionalities/ColorModalContent'; // Isko import karein
// import CommentModalContent from './CommentSection/CommentModalContent'; // Comment component ko bhi import karein
import './ReusableChartWidget.css';

// Modal ko root element se bind karna zaroori hai
Modal.setAppElement('#root');

const ReusableChartWidget = ({ chartKey, title, initialType, chartProps, availableTypes }) => {
    const [currentChartType, setCurrentChartType] = useState(initialType);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    
    // YEH STATE SABSE IMPORTANT HAI: yeh decide karta hai ki modal ke andar kya dikhega
    const [modalView, setModalView] = useState('main'); // Views: 'main', 'convert', 'color'

    // Comment ke liye alag modal ka state
    // const [showCommentModal, setShowCommentModal] = useState(false);

    const ChartComponent = chartComponents[currentChartType];

    // Main modal ko kholne ka function
    const openModalWithOptions = (e) => {
        e.stopPropagation();
        setModalView('main'); // Hamesha main menu se shuru karein
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleTypeChange = (type) => {
        setCurrentChartType(type);
        closeModal(); // Type badalne par modal band
    };

    // Correct function jo parent component ko naya color bhejega
    const handleSaveColor = (newColor) => {
        if (chartProps.onSaveColor) {
            chartProps.onSaveColor(chartKey, newColor);
        }
        closeModal();
    };
    
    // Correct function jo parent component ko naya comment bhejega
    // const handleSaveComment = (newComment) => {
    //     if (chartProps.onSaveComment) {
    //         chartProps.onSaveComment(chartKey, newComment);
    //     }
    //     setShowCommentModal(false); // Comment modal band
    // };

    const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1').trim() : '';
    
    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
        });
    };

    // Yeh function modal ke andar ka content decide karta hai
    const renderModalContent = () => {
        switch (modalView) {
            case 'convert':
                return (
                    <>
                        <div className="modal-header">
                            <button onClick={() => setModalView('main')} className="back-button"><FaArrowLeft /></button>
                            <h3>Convert Chart</h3>
                            <button onClick={closeModal} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="conversion-options">
                                {availableTypes?.map((type) => (
                                    <button key={type} onClick={() => handleTypeChange(type)} className="modal-button">{capitalize(type)}</button>
                                ))}
                            </div>
                        </div>
                    </>
                );

            case 'color':
                return (
                    <ColorModalContent
                        initialColor={chartProps.color}
                        onSave={handleSaveColor}
                        onBack={() => setModalView('main')}
                        onClose={closeModal}
                    />
                );

            default: // 'main' view
                return (
                    <>
                        <div className="modal-header">
                            <h3>Chart Options</h3>
                            <button onClick={closeModal} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body">
                            <ul className="main-menu-options">
                                {/* <li onClick={() => setModalView('convert')}>Convert Chart</li> */}
                                <li onClick={() => setModalView('color')}>Change Chart Color</li>
                            </ul>
                        </div>
                    </>
                );
        }
    };

    if (!ChartComponent) {
        return <div className="widget-container">Error: Chart type "{currentChartType}" not found.</div>;
    }

    return (
        <div className="widget-container">
            <div className="drag-handle widget-header">
                <h6 className="widget-title">{title}</h6>
                <div className="menu-container no-drag">
                     {/* <button className="menu-button" onClick={() => setShowCommentModal(true)}>
                        <FaRegCommentDots />
                    </button> */}
                    <button className="menu-button" onClick={openModalWithOptions}>
                        <FaBars />
                    </button>
                </div>
            </div>

            <div className="widget-body">
                <ChartComponent {...chartProps} />
            </div>

            {chartProps.comment && chartProps.comment.user && (
                <div className="widget-footer chat-style">
                    <div className="comment-header">
                        <strong className="username">{chartProps.comment.user}</strong>
                        <span className="timestamp">{formatTimestamp(chartProps.comment.timestamp)}</span>
                    </div>
                    <p className="comment-text">{chartProps.comment.text}</p>
                </div>
            )}

            {/* Yeh main modal hai options (Convert/Color) ke liye */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="ReactModal__Content"
                overlayClassName="ReactModal__Overlay"
            >
                {renderModalContent()}
            </Modal>

            {/* Yeh alag se modal sirf comments ke liye hai */}
            {/* <Modal
                isOpen={showCommentModal}
                onRequestClose={() => setShowCommentModal(false)}
                className="ReactModal__Content"
                overlayClassName="ReactModal__Overlay"
            >
                <CommentModalContent
                    initialComment={chartProps.comment}
                    onSave={handleSaveComment}
                    onClose={() => setShowCommentModal(false)}
                    currentUser={chartProps.currentUser}
                />
            </Modal> */}
        </div>
    );
};

export default ReusableChartWidget;