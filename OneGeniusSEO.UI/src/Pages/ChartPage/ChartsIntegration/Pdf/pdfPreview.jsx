import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import PdfReport from './PdfReport';

// Styles
const previewStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // <<<<<<< THEEK KIYA GAYA
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const viewStyles = {
    width: '90%',
    height: '95%', // Thoda margin de diya upar-neeche
    border: 'none',
};

const closeButtonStyles = {
    position: 'absolute',
    top: '20px',
    right: '30px',
    padding: '10px 18px',
    backgroundColor: 'white',
    color: 'black',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: 10000, // <<<<<<< THEEK KIYA GAYA ('I' capital)
};

const PdfPreview = ({ documentProps, onClose }) => {
    return (
        <div style={previewStyles}>
            <button style={closeButtonStyles} onClick={onClose}>
                &times;  {/* Yeh 'X' ka better symbol hai */}
            </button>
            <PDFViewer style={viewStyles}>
                {/* <<<<<<< YAHAN SPACE ADD KIYA GAYA */}
               <PdfReport documentProps={documentProps} />
            </PDFViewer>
        </div>
    );
};

// <<<<<<< EXPORT KA NAAM THEEK KIYA GAYA
export default PdfPreview;
