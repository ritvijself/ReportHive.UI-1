import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import FollowerCount from "../../TotalCharts/InstagramCharts/InstaFollowerCount/InstaFollowerCount";
import CountryChart from "../../TotalCharts/BarChart/BarChart";
import LineGraph from "../../TotalCharts/LineGraph/LineGraph";
import { Follower } from "../../../../api/InstagramApis";
import InstagramMetricsGrid from "./InstagramMetricsGrid";
import FBPostTable from "../../TotalCharts/TopPostFB/FBPostTable";
import InstagramPostTable from "../../TotalCharts/InstagramCharts/InstagramPostTable/InstagramPostTable";

const ChartInstagram = ({
  insta_Id,
  startDate,
  endDate,
  TotalFollowers,
  GetPostsByDateRange,
  GetPostsDetailsByDateRange,
}) => {
  const [hiddenCodes, setHiddenCodes] = useState(new Set());
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const codeFor = (item) => (item && (item.url || item.apiurl || item.title)) || "";

  useEffect(() => {
    let mounted = true;

    const nullSafeSplit = (value, delimiter = ",") =>
      String(value || "")
        .split(delimiter)
        .map((s) => s.trim())
        .filter(Boolean);

    const parseResponse = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) {
        return data
          .map((item) => {
            if (!item) return null;
            if (typeof item === "string") return item;
            return item.apiUniqueName || item.code || item.url || item.title || null;
          })
          .filter(Boolean);
      }
      return nullSafeSplit(data?.apiUniqueName);
    };

    const fetchHidden = async () => {
      if (!apibaseurl || !token) return;
      try {
        const resp = await fetch(`${apibaseurl}/api/InstagramCustomizeHideApiList/get`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const list = parseResponse(data);
        if (!mounted) return;
        setHiddenCodes(new Set(list));
      } catch (e) {
        console.warn("Failed to fetch Instagram hide list", e);
      }
    };

    fetchHidden();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <>
      <div className={`text-center mt-5 `}>
        {" "}
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Instagram Report
        </h4>{" "}
      </div>
      {/* 
      Static Charts */}
      <Row>
        {Array.isArray(TotalFollowers) && TotalFollowers.map((instadata) => {
          const code = codeFor(instadata);
          if (!code || hiddenCodes.has(code)) return null;
          return (
            <Col md={4} className="mb-4" key={instadata.id}>
              <FollowerCount
                insta_id={insta_Id}
                instadata={instadata}
                id={instadata.id}
                title={instadata.title}
                metricType={instadata.metricType}
              />
            </Col>
          );
        })}
      </Row>

      <Row>
        <Col md={12} className="mb-3 mt-3">
          {GetPostsDetailsByDateRange && GetPostsDetailsByDateRange[0] && !hiddenCodes.has(codeFor(GetPostsDetailsByDateRange[0])) && (
            <InstagramMetricsGrid
              insta_Id={insta_Id}
              startDate={startDate}
              endDate={endDate}
              data={GetPostsDetailsByDateRange[0]}
            />
          )}

          {GetPostsByDateRange && GetPostsByDateRange[0] && !hiddenCodes.has(codeFor(GetPostsByDateRange[0])) && (
            <InstagramPostTable
              insta_Id={insta_Id}
              startDate={startDate}
              endDate={endDate}
              platform="instagram"
              data={GetPostsByDateRange[0]}
              id={GetPostsByDateRange[0].id}
              title={GetPostsByDateRange[0].title}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default ChartInstagram;
