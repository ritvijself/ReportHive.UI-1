import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./AgencyDetails.module.css";

const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agencyDetail, setAgencyDetail] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
  };

  const fetchAgencyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const agencyResponse = await fetch(
        `${apibaseurl}/api/AdminPanel/get-digital-agency-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dA_UserId: id }),
        }
      );
      const agencyResult = await agencyResponse.json();

      if (agencyResult.isSuccess && Array.isArray(agencyResult.data)) {
        setAgencyDetail(agencyResult.data[0]);
      }

      const clientsResponse = await fetch(
        `${apibaseurl}/api/AdminPanel/Client-list?_DAClient=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const clientsResult = await clientsResponse.json();

      if (clientsResult.isSuccess && Array.isArray(clientsResult.data)) {
        setClients(clientsResult.data);
        setFilteredClients(clientsResult.data);
      }
    } catch (err) {
      setError("Failed to load data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyData();
  }, [id]);

  // Search functionality
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        (client.clientName?.toLowerCase() || "").includes(term) ||
        (client.webSiteAddress?.toLowerCase() || "").includes(term)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Sorting functionality
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredClients].sort((a, b) => {
      if (key === "clientName") {
        const nameA = (a.clientName || "").toLowerCase();
        const nameB = (b.clientName || "").toLowerCase();
        return direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (key === "webSiteAddress") {
        const siteA = (a.webSiteAddress || "").toLowerCase();
        const siteB = (b.webSiteAddress || "").toLowerCase();
        return direction === "asc"
          ? siteA.localeCompare(siteB)
          : siteB.localeCompare(siteA);
      }
      if (key === "createdDate") {
        return direction === "asc"
          ? new Date(a.createdDate || 0) - new Date(b.createdDate || 0)
          : new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
      }
      return 0;
    });
    setFilteredClients(sorted);
  };

  const renderArrow = (colKey) => {
    if (sortConfig.key !== colKey) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className={`container mt-4 ${style.agency_container}`}>
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="fw-bold mb-0">
          {agencyDetail
            ? `${agencyDetail.firstName} ${agencyDetail.lastName}`
            : ""}
        </h3>
        <div className="d-flex align-items-center">
          <div className="input-group w-auto me-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search clients..."
              style={{ fontSize: "14px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`btn btn-outline-secondary ${style.back_button}`}
            onClick={() => navigate("/admindashboard")}
          >
            ← Back
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className={style.table_container}>
          <table className={style.metrics_table}>
            <thead>
              <tr>
                <th
                  className={`${style.col_client} ${style.sortableHeader}`}
                  onClick={() => handleSort("clientName")}
                >
                  Client
                  <span className={`ms-1 ${style.sortArrow}`}>
                    {renderArrow("clientName")}
                  </span>
                </th>
                <th
                  className={`${style.col_website} ${style.sortableHeader}`}
                  onClick={() => handleSort("webSiteAddress")}
                >
                  Website
                  <span className={`ms-1 ${style.sortArrow}`}>
                    {renderArrow("webSiteAddress")}
                  </span>
                </th>
                <th
                  className={`${style.col_created} ${style.sortableHeader}`}
                  onClick={() => handleSort("createdDate")}
                >
                  Created On
                  <span className={`ms-1 ${style.sortArrow}`}>
                    {renderArrow("createdDate")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((c) => (
                  <tr key={c.clientSeq}>
                    <td>{c.clientName || "-"}</td>
                    <td>
                      {c.webSiteAddress ? (
                        <a
                          href={c.webSiteAddress}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={style.website_link}
                        >
                          {c.webSiteAddress}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{formatDate(c.createdDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgencyDetails;
