import React, { useState, useEffect } from 'react';
import Loader from '../../../Loader/Loader';
import { formatDateLocal } from "../../../../utils/FormatDate";

const ChartDataContainer = ({ chartProps, children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Yahan hum ChartGA4 se aa rahe 'propertyid' (lowercase) ko use karenge
    const { propertyid, startDate, endDate, SquareBox } = chartProps;

    useEffect(() => {
        const fetchData = async () => {
            // Safety check: Agar zaroori props nahi hain to fetch na karein
            if (!propertyid || !SquareBox?.apiurl || !SquareBox?.url) {
                setError("Configuration is missing to fetch data.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setData(null);

            const token = localStorage.getItem("token");
            const apibaseurl = import.meta.env.VITE_API_BASE_URL;

            try {
                const formattedStart = formatDateLocal(startDate);
                const formattedEnd = formatDateLocal(endDate);

                const response = await fetch(`${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        // IMPORTANT: Backend 'propertyId' (camelCase) expect kar sakta hai,
                        // isliye hum 'propertyid' prop ko 'propertyId' key se bhej rahe hain.
                        propertyId: propertyid,
                        startDate: formattedStart,
                        endDate: formattedEnd,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const result = await response.json();
                setData(result);

            } catch (e) {
                console.error("ChartDataContainer fetch error:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [propertyid, startDate, endDate, SquareBox]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Error: {error}</div>;
    }

    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;
    }

    // Yeh data ko child component (aapke chart) mein inject kar dega
    return React.cloneElement(children, { ...children.props, data });
};

export default ChartDataContainer;