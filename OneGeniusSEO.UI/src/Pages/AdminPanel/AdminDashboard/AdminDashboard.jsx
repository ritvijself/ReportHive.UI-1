import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [agencyList, setAgencyList] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const navigate = useNavigate();
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const fetchAgencyList = async (page = pageNumber) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      const response = await fetch(
        `${apibaseurl}/api/AdminPanel/get-digital-agency-list?pageNumber=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.isSuccess) {
        setAgencyList(result.data);
        setFilteredAgencies(result.data);
        setTotalRecords(result.totalRecords || 0);
        setPageNumber(result.pageNumber || page);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching agency list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyList(pageNumber);
  }, [pageNumber, pageSize]);

  // Search filter
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = agencyList.filter((agency) => {
      const name = `${agency.firstName} ${agency.lastName}`.toLowerCase();
      const email = (agency.businessEmail || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
    setFilteredAgencies(filtered);
  }, [searchTerm, agencyList]);

  // Sorting (client-side)
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredAgencies].sort((a, b) => {
      switch (key) {
        case "name": {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return direction === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
        case "email": {
          const emailA = (a.businessEmail || "").toLowerCase();
          const emailB = (b.businessEmail || "").toLowerCase();
          return direction === "asc"
            ? emailA.localeCompare(emailB)
            : emailB.localeCompare(emailA);
        }
        case "clients":
          return direction === "asc"
            ? (a.totalClient || 0) - (b.totalClient || 0)
            : (b.totalClient || 0) - (a.totalClient || 0);
        case "teamMembers":
          return direction === "asc"
            ? (a.totalTeamMembers || 0) - (b.totalTeamMembers || 0)
            : (b.totalTeamMembers || 0) - (a.totalTeamMembers || 0);
        case "status": {
          const sa = a.status ? "1" : "0";
          const sb = b.status ? "1" : "0";
          return direction === "asc"
            ? sa.localeCompare(sb)
            : sb.localeCompare(sa);
        }
        case "created":
          return direction === "asc"
            ? new Date(a.createdDate) - new Date(b.createdDate)
            : new Date(b.createdDate) - new Date(a.createdDate);
        case "modified": {
          const da = a.updatedDate ? new Date(a.updatedDate) : 0;
          const db = b.updatedDate ? new Date(b.updatedDate) : 0;
          return direction === "asc" ? da - db : db - da;
        }
        default:
          return 0;
      }
    });

    setFilteredAgencies(sorted);
  };

  const handleAgencyClick = (id) => {
    navigate(`/agencyDetails/${id}`);
  };

  const renderArrow = (colKey) => {
    if (sortConfig.key !== colKey) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Pagination controls
  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  // Close any open row menu when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      try {
        // If click is inside an open row menu or its toggle button, ignore
        const openRow = document.querySelector('tr[data-menu-open="1"]');
        if (!openRow) return;
        if (openRow.contains(e.target)) return;
        // otherwise close it
        document.querySelectorAll('tr[data-menu-open="1"]').forEach((r) => r.removeAttribute('data-menu-open'));
      } catch (err) {
        // ignore
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className={`container mt-4 ${style.admin_container}`}>
      <div className={`card ${style.card}`}>
        <div
          className={`d-flex justify-content-between align-items-center p-3 text-white ${style.headerBar}`}
        >
          <h4 className="mb-0">Admin Panel</h4>
          <div className="input-group w-25">
            <input
              type="text"
              className="form-control"
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>

        <div className={style.table_container}>
          {loading ? (
            <p className="p-3 text-center">Loading...</p>
          ) : (
            <>
              <table className={`table ${style.metrics_table}`}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th
                      onClick={() => handleSort("name")}
                      className={style.sortableHeader}
                    >
                      Agency Name <span className="ms-1">{renderArrow("name")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("email")}
                      className={style.sortableHeader}
                    >
                      Agency Email <span className="ms-1">{renderArrow("email")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("clients")}
                      className={style.sortableHeader}
                    >
                      Total Clients <span className="ms-1">{renderArrow("clients")}</span>
                    </th>
                    {/* ✅ Added Total Team Members column */}
                    <th
                      onClick={() => handleSort("teamMembers")}
                      className={style.sortableHeader}
                    >
                      Total Team Members{" "}
                      <span className="ms-1">{renderArrow("teamMembers")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("status")}
                      className={style.sortableHeader}
                    >
                      Status <span className="ms-1">{renderArrow("status")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("created")}
                      className={style.sortableHeader}
                    >
                      Created Date{" "}
                      <span className="ms-1">{renderArrow("created")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("modified")}
                      className={style.sortableHeader}
                    >
                      Modified Date{" "}
                      <span className="ms-1">{renderArrow("modified")}</span>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAgencies.length > 0 ? (
                    filteredAgencies.map((agency, index) => (
                      <tr key={agency.dA_UserIdf ?? index}>
                        <td>{(pageNumber - 1) * pageSize + index + 1}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleAgencyClick(agency.dA_UserIdf)}
                            className={style.link_button}
                          >
                            {`${agency.firstName} ${agency.lastName}`}
                          </button>
                        </td>
                        <td>{agency.businessEmail}</td>
                        <td>{agency.totalClient ?? 0}</td>
                        <td>{agency.totalTeamMembers ?? 0}</td>
                        <td>
                          <span
                            className={
                              agency.status
                                ? style.active_status
                                : style.inactive_status
                            }
                          >
                            {agency.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {agency.createdDate
                            ? new Date(agency.createdDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          {agency.updatedDate
                            ? new Date(agency.updatedDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ position: 'relative' }}>
                          {/* Ellipsis menu: click to reveal actions (keeps UI cleaner) */}
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              className={`btn btn-md  ${style.action_button}`}
                              onClick={(e) => {
                                // toggle menu visibility by adding/removing an attribute on the row element
                                const tr = e.currentTarget.closest('tr');
                                if (!tr) return;
                                const open = tr.getAttribute('data-menu-open') === '1';
                                // close any other open menus first
                                document.querySelectorAll('tr[data-menu-open="1"]').forEach((r) => r.removeAttribute('data-menu-open'));
                                if (!open) tr.setAttribute('data-menu-open', '1');
                                else tr.removeAttribute('data-menu-open');
                              }}
                              aria-label="Row actions"
                              title="More actions"
                            >
                              ⋮
                            </button>

                            <div
                              className={style.row_menu}
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '110%',
                                minWidth: 140,
                                background: '#fff',
                                border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderRadius: 6,
                                padding: '6px 8px',
                                display: 'none',
                                zIndex: 40,
                              }}
                            >
                              <button
                                className={`btn btn-sm 
                                   text-danger ${style.menu_item}`}
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  handleAgencyClick(agency.dA_UserIdf);
                                  // close menu
                                  const tr = ev.currentTarget.closest('tr');
                                  if (tr) tr.removeAttribute('data-menu-open');
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">
                        No Agencies Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page <strong>{pageNumber}</strong> of {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
