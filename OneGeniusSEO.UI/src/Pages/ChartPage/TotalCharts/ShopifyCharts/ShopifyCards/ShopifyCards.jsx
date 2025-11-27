import React, { useEffect, useState } from "react";

// Simple KPI Card component
const KPICard = ({ title, value }) => {
  return (
    <div
      className="card shadow-sm h-100"
      style={{ flex: 1, minWidth: "150px" }}
    >
      <div className="card-body d-flex flex-column">
        <h6 className="text-muted fw-semibold mb-2">{title}</h6>
        <div
          className="mt-auto text-center fw-bold"
          style={{ fontSize: "35px" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

const KPICards = ({ shopifyId, startDate, endDate, ShopifyReports }) => {
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  // Build initial data from ShopifyReports so titles match exactly
  const [data, setData] = useState(() =>
    ShopifyReports.map((report) => ({
      title: report.title,
      value: "Loading...",
    }))
  );

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        await Promise.all(
          ShopifyReports.map(async (report) => {
            const response = await fetch(
              `${apibaseurl}/api/${report.apiurl}/${report.url}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  shopifyDomainName: shopifyId,
                  startDate,
                  endDate,
                }),
              }
            );

            const result = await response.json();

            if (result.isSuccess) {
              setData((prev) =>
                prev.map((item) => {
                  if (item.title === report.title) {
                    // custom mapping per endpoint
                    if (report.url === "orders/total") {
                      return { ...item, value: result.data.totalOrders };
                    }
                    if (report.url === "orders/interval") {
                      return { ...item, value: result.data.total };
                    }
                    if (report.url === "checkouts/interval") {
                      return { ...item, value: result.data.total };
                    }
                    if (report.url === "customers/total") {
                      return { ...item, value: result.data.totalCustomers };
                    }
                    if (report.url === "customers/interval") {
                      return { ...item, value: result.data.total };
                    }
                    // fallback if new APIs added later
                    return {
                      ...item,
                      value:
                        result.data.total ||
                        result.data.value ||
                        JSON.stringify(result.data),
                    };
                  }
                  return item;
                })
              );
            } else {
              console.error(`${report.title} failed:`, result.message);
            }
          })
        );
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    if (shopifyId && startDate && endDate) {
      fetchReports();
    }
  }, [shopifyId, startDate, endDate, apibaseurl, ShopifyReports]);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "nowrap",
        overflowX: "auto",
      }}
    >
      {data.map((item, idx) => (
        <KPICard key={idx} {...item} />
      ))}
    </div>
  );
};

export default KPICards;
