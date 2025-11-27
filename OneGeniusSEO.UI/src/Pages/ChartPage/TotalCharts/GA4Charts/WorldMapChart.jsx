import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
// import { ComposableMap, Geographies, Geography } from "@visx/geo";

import lookup from "country-code-lookup";

const WorldMapChart = ({
  propertyid,
  Progress,
  title,
  startDate,
  endDate,
  siteUrl,
  totalUser,
}) => {
  const [loading, setLoading] = useState(true);
  const [queriesData, setQueriesData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 400,
    scale: 140,
  });

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const url = `${apibaseurl}/api/${Progress.apiurl}/${Progress.url}`;

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 40, 800);
      const scale = (width / 800) * 140;
      setDimensions({
        width,
        height: width * 0.5,
        scale,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!propertyid && !siteUrl) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setQueriesData([]);
      setSelectedCountries([]);

      try {
        const requestBody = Progress.requiresSiteUrl
          ? { siteUrl, startDate: formattedStart, endDate: formattedEnd }
          : {
              propertyId: propertyid,
              startDate: formattedStart,
              endDate: formattedEnd,
            };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (
          result.isSuccess === true &&
          result.data === null &&
          result.message === "User wants to hide this API"
        ) {
          setIsHidden(true);
          return [];
        }
        const formattedData = result
          .map((row) => {
            const country = row.country;
            const countryLookup =
              lookup.byCountry(country) || lookup.byInternet(row.country);
            const code = countryLookup?.iso2 || null;

            return code
              ? {
                  country,
                  countryCode: code,
                  totalUsers: Number(row.totalUsers) || 0,
                }
              : null;
          })
          .filter(Boolean);

        setQueriesData(formattedData);
        setSelectedCountries(
          formattedData.map((d) => ({
            code: d.countryCode,
            name: d.country,
            totalUsers: d.totalUsers,
          }))
        );
      } catch (err) {
        setQueriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    propertyid,
    siteUrl,
    url,
    formattedStart,
    formattedEnd,
    Progress.requiresSiteUrl,
  ]);

  const countryDataMap = useMemo(() => {
    const map = {};
    selectedCountries.forEach((country) => {
      if (country.code) map[country.code] = country;
      map[country.name] = country;
      if (country.name === "United States") {
        map["United States of America"] = country;
      }
      if (country.name === "United Kingdom") {
        map["UK"] = country;
      }
      if (country.name === "Russia") {
        map["Russian Federation"] = country;
      }
    });
    return map;
  }, [selectedCountries]);
  if (isHidden) return null;
  if (loading) return <Loader />;
  if (!queriesData.length)
    return <div>No data available for the selected period.</div>;

  const totalUsers = queriesData.reduce(
    (sum, item) => sum + item.totalUsers,
    0
  );

  return (
    <div
      className="card shadow-sm p-3 h-100"
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: "1px solid #dee2e6",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ marginBottom: "10px" }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: "300px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <ComposableMap
            projectionConfig={{ scale: dimensions.scale }}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              width: "100%",
              height: "100%",
              // maxHeight: "400px",
              
            }}
          >
            <Geographies geography="https://unpkg.com/world-atlas@2.0.2/countries-110m.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoCode =
                    geo.properties.iso_a2 || geo.properties.ISO_A2;
                  const geoName = geo.properties.name;
                  const geoNameLong = geo.properties.name_long || geoName;

                  const isSelected = selectedCountries.some(
                    (country) =>
                      (isoCode && country.code === isoCode) ||
                      country.name === geoName ||
                      country.name === geoNameLong ||
                      (country.code &&
                        lookup.byIso(country.code)?.country === geoName) ||
                      (country.code &&
                        lookup.byIso(country.code)?.country === geoNameLong) ||
                      (country.name === "United States" &&
                        (geoName === "United States" ||
                          geoName === "United States of America" ||
                          geoNameLong === "United States of America" ||
                          isoCode === "US")) ||
                      (country.name === "Russia" &&
                        (geoName === "Russia" ||
                          geoNameLong === "Russian Federation" ||
                          isoCode === "RU"))
                  );

                  const countryData =
                    countryDataMap[isoCode] ||
                    countryDataMap[geoName] ||
                    countryDataMap[geoNameLong] ||
                    (geoName === "United States of America"
                      ? countryDataMap["United States"]
                      : null) ||
                    (geoName === "Russian Federation" || geoName === "Russia"
                      ? countryDataMap["Russia"]
                      : null);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        if (isSelected && countryData) {
                          setTooltipContent(
                            `${
                              countryData.name
                            }: ${countryData.totalUsers.toLocaleString()} users`
                          );
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                        } else {
                          setTooltipContent(geoName);
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onMouseLeave={() => setTooltipContent("")}
                      fill={isSelected ? "#0073ed" : "#D3D3D3"}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: isSelected ? "#CC0000" : "#B0B0B0",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: isSelected ? "#990000" : "#A0A0A0",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {tooltipContent && (
          <div
            style={{
              position: "fixed",
              top: tooltipPos.y + 10,
              left: tooltipPos.x + 10,
              background: "rgba(0, 0, 0, 0.8)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              pointerEvents: "none",
              zIndex: 1000,
              fontSize: "12px",
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMapChart;
