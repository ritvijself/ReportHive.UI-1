
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import {
    FaBars, FaChartBar, FaPalette, FaEye,
    FaEyeSlash, FaCommentDots, FaTrash
} from 'react-icons/fa';


const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
        href=''
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}

        className="text-secondary"
        title="Chart Actions" // Mouse hover it will show title

    >
        <FaBars />
    </a>
));

const ChartActionsMenu = ({
    chart,
    onToggle,
    isCommentVisible,
    onChartConvert,
    onChangeColor,
    onShowComment,
    onHideComment,
    onAddComment,
    onDeleteComment,
    hasComment, // new prop

}) => {
    return (
        <Dropdown onToggle={(isOpen) => onToggle(isOpen ? chart.key : null)}>
            <Dropdown.Toggle as={CustomToggle} id={`dropdown-${chart.key}`} />

            <Dropdown.Menu>
                {/*  Chart Conversion — only if chart.supports.convert is true */}
                {chart.supports?.convert && (
                    <Dropdown drop="end">
                        <Dropdown.Toggle as="div" className="dropdown-item text-dark">
                            <FaChartBar className="me-2" /> Chart Conversion ▸
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => onChartConvert(chart.key, "line")}>Line</Dropdown.Item>
                            <Dropdown.Item onClick={() => onChartConvert(chart.key, "bar")}>Bar</Dropdown.Item>
                            <Dropdown.Item onClick={() => onChartConvert(chart.key, "pie")}>Pie</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}

                {/*  Color Change — only if chart.supports.color is true */}
                {chart.supports?.color && (
                    <Dropdown.Item onClick={() => onChangeColor(chart.key)}>
                        <FaPalette className="me-2" /> Change Chart Color
                    </Dropdown.Item>
                )}

                <Dropdown.Divider />


                {/* Comment show/hide  conditional logic */}
                {hasComment && (
                    <>
                        {isCommentVisible ? (
                            <Dropdown.Item onClick={() => onHideComment(chart.key)}>
                                <FaEyeSlash className="me-2" /> Hide Comment
                            </Dropdown.Item>
                        ) : (
                            <Dropdown.Item onClick={() => onShowComment(chart.key)}>
                                <FaEye className="me-2" /> Show Comment
                            </Dropdown.Item>
                        )}
                    </>
                )}



                <Dropdown.Item onClick={() => onAddComment(chart)}>
                    <FaCommentDots className="me-2" /> Add/Edit Comment
                </Dropdown.Item>

                <Dropdown.Item onClick={() => onDeleteComment(chart.key)} className="text-danger">
                    <FaTrash className="me-2" /> Delete Comment
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
export default ChartActionsMenu;

