import React, { useEffect, useState } from "react";
import { BsCheckCircle, BsExclamationTriangle } from "react-icons/bs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";
import style from "./SecurityCheckBox.module.css";

const SecurityCheckBox = ({ siteUrl, startDate, endDate, SquareBox }) => {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [hasIssues, setHasIssues] = useState(false);
  const [issuesList, setIssuesList] = useState([]);
  const token = localStorage.getItem("token");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const url = `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`;
  const [isHidden, setIsHidden] = useState(false);
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            siteUrl,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        });

        const result = await response.json();

        if (
          result.isSuccess === true &&
          result.data === null &&
          result.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          setLoading(false);
          return;
        }

        if (Array.isArray(result.securityIssues)) {
          if (result.securityIssues.length === 0) {
            setStatusMessage("No security issues detected");
            setHasIssues(false);
            setIssuesList([]);
          } else {
            setStatusMessage(
              `Security issues found: ${result.securityIssues.length}`
            );
            setHasIssues(true);
            setIssuesList(result.securityIssues);
          }
        } else {
          setStatusMessage("Unexpected response format");
          setHasIssues(true);
          setIssuesList([]);
        }
      } catch (error) {
        console.error("Error fetching security status:", error);
        setStatusMessage("Failed to load security data");
        setHasIssues(true);
        setIssuesList([]);
      } finally {
        setLoading(false);
      }
    };

    if (siteUrl) {
      fetchSecurityStatus();
    }
  }, [siteUrl, formattedStart, formattedEnd, url]);

  const renderTooltip = (props) => (
    <Tooltip id="security-tooltip" {...props}>
      {hasIssues && issuesList.length > 0 ? (
        <div>
          <strong>Security Issues Detected:</strong>
          <ul className="mb-0">
            {issuesList.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : (
        "Checks if your website has any security issues or problems that might prevent Google from indexing it."
      )}
    </Tooltip>
  );
  if (isHidden) return null;
  if (loading) return <Loader />;

  return (
    <div className={`${style.security_box} d-flex justify-content-center`}>
      <div
        className={`alert ${
          hasIssues ? "alert-danger" : "alert-success"
        } d-flex align-items-center justify-content-between `}
        role="alert"
      >
        <div className="d-flex align-items-center gap-2">
          {hasIssues ? (
            <BsExclamationTriangle size={24} />
          ) : (
            <BsCheckCircle size={24} />
          )}
          <strong>{statusMessage}</strong>
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <span className="ms-2">
              <FaInfoCircle size={16} />
            </span>
          </OverlayTrigger>
        </div>
      </div>
    </div>
  );
};

export default SecurityCheckBox;
