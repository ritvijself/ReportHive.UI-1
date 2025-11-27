import React from 'react';
// Dropdown aur Button ko react-bootstrap se import karein
import { Dropdown, Button } from 'react-bootstrap';

const CustomToggle = React.forwardRef(({ children, onClick, className }, ref) => (
  <Button
    variant=""
    size="sm"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e); // 
    }}
    a
    className={className}
  >
    {children}
  </Button>
));

// 2. Main Dropdown Component
const StaticWidgetActions = ({ onOptionSelect, buttonClassName }) => {

  const handleSelect = (eventKey) => {
    if (onOptionSelect) {
      onOptionSelect(eventKey);
    }
  };

  return (
    <Dropdown onSelect={handleSelect} drop="down">

      <Dropdown.Toggle
        as={CustomToggle}
        id="static-widget-options-dropdown"
        className={buttonClassName} // DashboardHeaderContent se aane wali class
      >
        Static Widget
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ padding: '8px' }}>
        <Dropdown.Item
          eventKey="header"
          className="mb-2 btn btn-primary text-center"
        // style={{ width: '100%', color: 'white' }}
        >
          Header
        </Dropdown.Item>

        <Dropdown.Item
          eventKey="csv"
          className="mb-2 btn btn-success text-center"
        // style={{ width: '100%', color: 'white' }}
        >
          CSV
        </Dropdown.Item>

        <Dropdown.Item
          eventKey="comments"
          className="btn btn-info text-center"
        // style={{ width: '100%', color: 'white' }}
        >
          Comments
        </Dropdown.Item>

        {/* <Dropdown.Item
          eventKey="executive_summary"
          className="mt-2 btn btn-warning text-center"
        >
          Executive Summary
        </Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default StaticWidgetActions;