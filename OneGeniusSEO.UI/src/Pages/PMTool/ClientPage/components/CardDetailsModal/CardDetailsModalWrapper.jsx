import React from "react";
import PropTypes from "prop-types";

const CardDetailsModalWrapper = ({ children, onClose }) => {
  return (
    <div
      className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-start tw:justify-center tw:pt-20 tw:bg-black/50"
      onClick={(e) => {
        if (!e.defaultPrevented) {
          onClose();
        }
      }}
    >
      <div
        className="tw:bg-white tw:rounded-lg tw:shadow-xl tw:max-w-3xl tw:w-full tw:mx-4 tw:min-h-[400px] tw:max-h-[calc(100vh-12rem)] tw:overflow-hidden tw:flex tw:flex-col"
        onClick={(e) => e.preventDefault()}
      >
        {children}
      </div>
    </div>
  );
};

CardDetailsModalWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CardDetailsModalWrapper;
