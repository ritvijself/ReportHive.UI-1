import React, { useState, useEffect } from "react";
import style from "./TeamMembersDashboard.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateTeamMembers from "./NewTeamMembersModal/CreateTeamMembers";
import ClientAccessModal from "./ClientAccessModal/ClientAccessModal";
import { BsPencilSquare, BsTrash } from "react-icons/bs";

const featureHeaders = [
  "Dashboard View",
  "Integrations",
  "PM Tool",
  "LMS Tool",
];

const TeamMembersDashboard = () => {
  const [accessMatrix, setAccessMatrix] = useState([]);
  const [username, setUsername] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMemberClientMappings, setTeamMemberClientMappings] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editAccessMatrix, setEditAccessMatrix] = useState([]);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token =
    localStorage.getItem("datoken") || localStorage.getItem("token");

  const [clientMappingStatus, setClientMappingStatus] = useState({});

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedCompanyName = localStorage.getItem("companyName");

    if (storedCompanyName) {
      setUsername(storedCompanyName);
    } else if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchTeamMembers = async () => {
      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        toast.error("No authentication token found", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      try {
        setIsLoading(true);

        const teamResponse = await fetch(
          `${apibaseurl}/api/TeamMemberClient/team-members`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!teamResponse.ok) {
          throw new Error(`HTTP error! Status: ${teamResponse.status}`);
        }

        const teamData = await teamResponse.json();
        const membersArray = Array.isArray(teamData)
          ? teamData
          : teamData.data || [];
        setTeamMembers(membersArray);

        const clientResponse = await fetch(
          `${apibaseurl}/api/TeamMemberClient/clients`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!clientResponse.ok) {
          throw new Error(`HTTP error! Status: ${clientResponse.status}`);
        }

        const clientData = await clientResponse.json();
        const clientsArray = Array.isArray(clientData.data)
          ? clientData.data
          : [];
        setClients(clientsArray);

        setAccessMatrix(
          clientsArray.map(() => featureHeaders.map(() => false))
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setIsLoading(false);
        toast.error("Failed to load data", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchTeamMembers();
  }, [token]);

  useEffect(() => {
    if (!selectedTeamMember || !clients.length) {
      setClientMappingStatus({});
      setAccessMatrix(clients.map(() => featureHeaders.map(() => false)));
      return;
    }

    const fetchTeamMemberClients = async () => {
      try {
        const response = await fetch(
          `${apibaseurl}/api/TeamMemberClient/get-team-member-clients`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.isSuccess && Array.isArray(data.dataList)) {
          setTeamMemberClientMappings(data.dataList);

          const newMappingStatus = {};
          clients.forEach((client) => {
            const hasMapping = data.dataList.some(
              (mapping) =>
                mapping.teamMember_Idf === selectedTeamMember &&
                mapping.client_Idf === client.client_Seq
            );
            newMappingStatus[client.client_Seq] = hasMapping;
          });
          setClientMappingStatus(newMappingStatus);

          const newAccessMatrix = clients.map(() =>
            featureHeaders.map(() => false)
          );

          data.dataList.forEach((mapping) => {
            if (mapping.teamMember_Idf === selectedTeamMember) {
              const clientIndex = clients.findIndex(
                (client) => client.client_Seq === mapping.client_Idf
              );
              if (clientIndex !== -1) {
                newAccessMatrix[clientIndex] = [
                  mapping.isDashboardView,
                  mapping.isIntegration,
                  mapping.isPmTool,
                  mapping.isLMSTool,
                ];
              }
            }
          });

          setAccessMatrix(newAccessMatrix);
        } else {
          setTeamMemberClientMappings([]);
          setClientMappingStatus({});
          setAccessMatrix(clients.map(() => featureHeaders.map(() => false)));
        }
      } catch (error) {
        console.error("Error fetching team member clients:", error);
        toast.error("Failed to load team member permissions", {
          position: "top-right",
          autoClose: 3000,
        });
        setClientMappingStatus({});
        setAccessMatrix(clients.map(() => featureHeaders.map(() => false)));
      }
    };

    fetchTeamMemberClients();
  }, [selectedTeamMember, clients, token]);

  const handleCreateUser = async (newUser) => {
    if (newUser.refresh) {
      try {
        const teamResponse = await fetch(
          `${apibaseurl}/api/TeamMemberClient/team-members`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!teamResponse.ok) {
          throw new Error(`HTTP error! Status: ${teamResponse.status}`);
        }

        const teamData = await teamResponse.json();
        const membersArray = Array.isArray(teamData)
          ? teamData
          : teamData.data || [];
        setTeamMembers(membersArray);
      } catch (error) {
        console.error("Error refreshing team members:", error);
        toast.error("Failed to refresh team members list", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return;
    }

    if (
      newUser.firstName.trim() &&
      newUser.lastName.trim() &&
      newUser.businessEmail.trim() &&
      newUser.password.trim()
    ) {
      setUsername(`${newUser.firstName} ${newUser.lastName}`);
      toast.success("Team member created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTeamMembers((prev) => [
        ...prev,
        {
          teamMember_Seq: newUser.teamMember_Seq,
          teamMember_Name: newUser.teamMember_Name,
        },
      ]);
    }
  };

  const handleOpenAccessModal = (clientIndex) => {
    setSelectedClient(clients[clientIndex]);
    setEditAccessMatrix([...accessMatrix[clientIndex]]);
    setShowAccessModal(true);
  };

  const handleSaveAccess = async (newAccess) => {
    if (!selectedTeamMember) {
      toast.error("Please select a team member", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!token) {
      toast.error("No authentication token found", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const hasMapping = clientMappingStatus[selectedClient.client_Seq];

    if (!hasMapping) {
      const payload = [
        {
          client_Idf: selectedClient.client_Seq,
          teamMember_Idf: selectedTeamMember,
          isDashboardView: newAccess[0] || false,
          isIntegration: newAccess[1] || false,
          isPmTool: newAccess[2] || false,
          isLMSTool: newAccess[3] || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      try {
        const response = await fetch(
          `${apibaseurl}/api/TeamMemberClient/create-multiple`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const refreshResponse = await fetch(
          `${apibaseurl}/api/TeamMemberClient/get-team-member-clients`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.isSuccess && Array.isArray(data.dataList)) {
            setTeamMemberClientMappings(data.dataList);
            setClientMappingStatus((prev) => ({
              ...prev,
              [selectedClient.client_Seq]: true,
            }));
          }
        }

        const updatedMatrix = [...accessMatrix];
        const clientIndex = clients.findIndex(
          (client) => client.client_Seq === selectedClient.client_Seq
        );
        updatedMatrix[clientIndex] = [...newAccess];
        setAccessMatrix(updatedMatrix);

        toast.success("Access permissions saved successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error saving access permissions:", error);
        toast.error("Failed to save access permissions", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      const mapping = teamMemberClientMappings.find(
        (m) =>
          m.teamMember_Idf === selectedTeamMember &&
          m.client_Idf === selectedClient.client_Seq
      );

      if (!mapping || !mapping.teamMemberClient_Seq) {
        toast.error("No mapping found for this team member and client", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const payload = {
        teamMemberClient_Seq: mapping.teamMemberClient_Seq,
        client_Idf: selectedClient.client_Seq,
        teamMember_Idf: selectedTeamMember,
        isDashboardView: newAccess[0] || false,
        isIntegration: newAccess[1] || false,
        isPmTool: newAccess[2] || false,
        isLMSTool: newAccess[3] || false,
        createdAt: mapping.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const response = await fetch(
          `${apibaseurl}/api/TeamMemberClient/edit`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const refreshResponse = await fetch(
          `${apibaseurl}/api/TeamMemberClient/get-team-member-clients`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.isSuccess && Array.isArray(data.dataList)) {
            setTeamMemberClientMappings(data.dataList);
          }
        }

        const updatedMatrix = [...accessMatrix];
        const clientIndex = clients.findIndex(
          (client) => client.client_Seq === selectedClient.client_Seq
        );
        updatedMatrix[clientIndex] = [...newAccess];
        setAccessMatrix(updatedMatrix);

        toast.success("Access permissions updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error updating access permissions:", error);
        toast.error("Failed to update access permissions", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleDeleteAccess = async (clientIndex) => {
    const client = clients[clientIndex];
    const mapping = teamMemberClientMappings.find(
      (m) =>
        m.teamMember_Idf === selectedTeamMember &&
        m.client_Idf === client.client_Seq
    );

    if (!mapping) {
      toast.error("No mapping found to delete", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const payload = {
      teamMemberClient_Seq: mapping.teamMemberClient_Seq,
      client_Idf: client.client_Seq,
      teamMember_Idf: selectedTeamMember,
      isDashboardView: mapping.isDashboardView,
      isIntegration: mapping.isIntegration,
      isPmTool: mapping.isPmTool,
      isLMSTool: mapping.isLMSTool,
      createdAt: mapping.createdAt,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        `${apibaseurl}/api/TeamMemberClient/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      toast.success("Access deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      const refreshResponse = await fetch(
        `${apibaseurl}/api/TeamMemberClient/get-team-member-clients`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.isSuccess && Array.isArray(data.dataList)) {
          setTeamMemberClientMappings(data.dataList);

          const newMappingStatus = {};
          clients.forEach((c) => {
            const hasMapping = data.dataList.some(
              (m) =>
                m.teamMember_Idf === selectedTeamMember &&
                m.client_Idf === c.client_Seq
            );
            newMappingStatus[c.client_Seq] = hasMapping;
          });
          setClientMappingStatus(newMappingStatus);

          setAccessMatrix(
            clients.map((c) => {
              const mapping = data.dataList.find(
                (m) =>
                  m.teamMember_Idf === selectedTeamMember &&
                  m.client_Idf === c.client_Seq
              );
              return mapping
                ? [
                    mapping.isDashboardView,
                    mapping.isIntegration,
                    mapping.isPmTool,
                    mapping.isLMSTool,
                  ]
                : featureHeaders.map(() => false);
            })
          );
        }
      }
    } catch (error) {
      console.error("Error deleting access:", error);
      toast.error("Failed to delete access permissions", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={`container mt-4 ${style.admin_container}`}>
      <div className={`card ${style.card}`}>
        <div
          className={`d-flex justify-content-between align-items-center p-3 text-white ${style.headerBar}`}
        >
          <h4 className="mb-0">{username}</h4>
          <div className="d-flex align-items-center">
            {isLoading ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border text-light me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading team members...</span>
              </div>
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : (
              <select
                className="form-select me-2"
                style={{ width: "200px", fontSize: "14px" }}
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
              >
                <option value="">-- Select Team Member --</option>
                {Array.isArray(teamMembers) &&
                  teamMembers.map((member, index) => (
                    <option key={index} value={member.teamMember_Seq}>
                      {`${member.teamMember_Name}`}
                    </option>
                  ))}
              </select>
            )}
            <button
              className={`${style.createbtn} btn `}
              onClick={() => setShowCreateModal(true)}
            >
              Create New Team Member
            </button>
          </div>
        </div>

        <div className={style.table_container}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className={`table ${style.metrics_table} text-center`}>
              <thead>
                <tr>
                  <th className="text-start">Client</th>
                  {featureHeaders.map((header, idx) => (
                    <th key={idx} className="text-center">
                      {header}
                    </th>
                  ))}
                  <th className="text-center" style={{ minWidth: "120px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, clientIndex) => (
                  <tr key={client.client_Seq}>
                    <td className="text-start">{client.clientName}</td>
                    {featureHeaders.map((_, featureIndex) => (
                      <td key={featureIndex}>
                        <div className={style.center_checkbox}>
                          <input
                            type="checkbox"
                            checked={
                              accessMatrix[clientIndex]?.[featureIndex] || false
                            }
                            disabled
                          />
                        </div>
                      </td>
                    ))}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {clientMappingStatus[client.client_Seq] ? (
                          <>
                            <button
                              className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                              style={{ width: "40px" }}
                              onClick={() => handleOpenAccessModal(clientIndex)}
                              disabled={!selectedTeamMember}
                              title="Edit Access"
                            >
                              <BsPencilSquare />
                            </button>
                            <button
                              className="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
                              style={{ width: "40px" }}
                              onClick={() => handleDeleteAccess(clientIndex)}
                              disabled={!selectedTeamMember}
                              title="Delete Access"
                            >
                              <BsTrash />
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                            style={{ width: "80px" }}
                            onClick={() => handleOpenAccessModal(clientIndex)}
                            disabled={!selectedTeamMember}
                            title="Add Access"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateTeamMembers
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
      />
      <ClientAccessModal
        show={showAccessModal}
        onHide={() => setShowAccessModal(false)}
        client={selectedClient}
        accessMatrix={editAccessMatrix}
        onSave={handleSaveAccess}
        featureHeaders={featureHeaders}
        isEdit={
          selectedClient && clientMappingStatus[selectedClient?.client_Seq]
        }
      />
      <ToastContainer />
    </div>
  );
};

export default TeamMembersDashboard;
