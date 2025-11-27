import React from "react";
import { useNavigate } from "react-router";
import ClientCard from "./components/ClientCard";
import AddNewClientCard from "./components/AddNewClientCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

// JWT decoding function (ensure you have this)
const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

export const HomePage = () => {
  // Get token and decode
  const token = localStorage.getItem("token");
  const decodedToken = token ? decodeJWT(token) : null;
  const userId = decodedToken?.User_id || null;

  const navigate = useNavigate();

  // Fetch clients using react-query and passing userId in payload
  const { data, isLoading, isError } = useQuery({
    queryKey: ["clients", userId],
    queryFn: async () => {
      const response = await api.get("/api/clients", {
        params: { userId }, // Pass userId as query param
      });
      return response.data;
    },
    enabled: !!userId, // Only fetch if userId exists
  });

  const clients = data?.clients || [];
  const user = data?.user || {};

  if (isLoading) return <div>Loading clients...</div>;
  if (isError) return <div>Error fetching clients.</div>;

  return (
    <div className="tw:max-w-7xl tw:mx-auto tw:px-4 tw:py-8 tw:sm:px-6 tw:lg:px-12">
      {/* Workspace Header */}
      <div className="tw:flex tw:items-center tw:gap-4 tw:mb-6">
        <div>
          <div className="tw:text-2xl tw:font-bold tw:text-gray-800">
            {user.firstName} {user.lastName}
          </div>
          <div className="tw:text-lg tw:text-gray-500">Clients</div>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:md:grid-cols-3 tw:lg:grid-cols-5 tw:gap-6">
        {clients.map((client) => (
          <ClientCard
            key={client._id}
            client={client}
            onClick={() => {
              navigate(`clients/${client._id}`);
            }}
          />
        ))}

        <AddNewClientCard />
      </div>
    </div>
  );
};

export default HomePage;
