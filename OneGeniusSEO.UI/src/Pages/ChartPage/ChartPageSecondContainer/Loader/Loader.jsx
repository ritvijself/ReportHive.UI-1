import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
  return (
    <div className={styles.loaderOverlay}>
      {/* Colorful PDF icon loader */}
      <div className={styles.pdfLoader}>
        <span className={styles.pdfText}>PDF</span>
      </div>

      {/* Iske neeche 3 animating dots */}
      <div className={styles.dotsContainer}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>

      {/* Stylish text */}
      <p className={styles.loaderText}>Generating PDF preview...</p>
    </div>
  );
};

export default Loader;