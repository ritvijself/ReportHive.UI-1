import React, { useEffect, useState, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import GMBImpressionCard from "../../TotalCharts/GMBImpressionCard/GMBImpressionCard";
import BarChart from "../../TotalCharts/BarChart/BarChart";
import SearchKeywordsGMB from "../../TotalCharts/SearchKeywordGMB/SearchKeywordsGMB";
import GMBDateCard from "../../TotalCharts/GMBDateCard/GMBDateCard";
import GMBLineChart from "../../TotalCharts/GMBLineChart/GMBLineChart";
import GmbPiechart from "../../TotalCharts/GmbCharts/GmbPieChart";
import { formatDateLocal } from "../../../../utils/FormatDate";
import MetricDisplayGMB from "../../TotalCharts/GMBChart/MetricDisplayGmb/MetricDisplayGmb";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ChartActionsMenu from "../ChartActions/ChartActionsMenu";
import {
  useCommentSystem,
  AddEditCommentModal,
} from "../ChartActions/Comments/AddEditComments";
import ChartColorPickerModal from "../ChartActions/ChartColorPickermodal";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ChartGMB = ({
  style,
  startDate,
  endDate,
  GMBLocation_Id,
  DesktopMaps = [],
  SearchKeywords = [],
  GMBAccount_Id,
  TotalProfileImpression = [],
  BusinessInteractions = [],
}) => {
  // --- existing state & helpers
  const [pieChartData, setPieChartData] = useState({
    labels: ["Mobile Search", "Desktop Search", "Mobile Maps", "Desktop Maps"],
    dataValues: [0, 0, 0, 0],
    total: 0,
  });
  const [mapsVsSearchData, setMapsVsSearchData] = useState({
    labels: ["Search", "Maps"],
    dataValues: [0, 0],
    total: 0,
  });
  const [mobileVsDesktopData, setMobileVsDesktopData] = useState({
    labels: ["Mobile", "Desktop"],
    dataValues: [0, 0],
    total: 0,
  });
  const [loadingPieData, setLoadingPieData] = useState(true);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const startDateObj = new Date(startDate || Date.now());
  const startYear = startDateObj.getFullYear();
  const startMonth = startDateObj.getMonth() + 1;

  const calculateTotalImpressions = useCallback(
    (data) => {
      try {
        if (!data?.multiDailyMetricTimeSeries?.length) return 0;

        let total = 0;
        data.multiDailyMetricTimeSeries.forEach((metricSeries) => {
          if (!metricSeries?.dailyMetricTimeSeries) return;
          metricSeries.dailyMetricTimeSeries.forEach((series) => {
            const datedValues = series?.timeSeries?.datedValues || [];
            datedValues.forEach((item) => {
              if (item?.value && item?.date) {
                const itemYear = item.date.year;
                const itemMonth = item.date.month;

                if (itemYear === startYear && itemMonth === startMonth) {
                  total += parseInt(item.value, 10) || 0;
                }
              }
            });
          });
        });
        return total;
      } catch (err) {
        console.error("Error calculating impressions:", err);
        return 0;
      }
    },
    [startYear, startMonth]
  );

  useEffect(() => {
    if (!GMBLocation_Id) {
      setLoadingPieData(false);
      setPieChartData({
        labels: [
          "Mobile Search",
          "Desktop Search",
          "Mobile Maps",
          "Desktop Maps",
        ],
        dataValues: [0, 0, 0, 0],
        total: 0,
      });
      setMapsVsSearchData({
        labels: ["Search", "Maps"],
        dataValues: [0, 0],
        total: 0,
      });
      setMobileVsDesktopData({
        labels: ["Mobile", "Desktop"],
        dataValues: [0, 0],
        total: 0,
      });
      return;
    }

    const fetchPieChartData = async () => {
      setLoadingPieData(true);
      const newDataValues = [0, 0, 0, 0];
      const labels = [
        "Mobile Search",
        "Desktop Search",
        "Mobile Maps",
        "Desktop Maps",
      ];
      const urlToIndex = {
        "mobile-search": 0,
        "desktop-search": 1,
        "mobile-maps": 2,
        "desktop-maps": 3,
      };

      try {
        for (const data of DesktopMaps) {
          const apiUrl = `${apibaseurl}/api/${data.apiurl}/${data.url}`;
          const requestBody = {
            accountId: GMBAccount_Id,
            locationId: GMBLocation_Id,
            startDate: formattedStart,
            endDate: formattedEnd,
          };

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(
              `Request failed for ${data.url} with status ${response.status}`
            );
          }

          const result = await response.json();
          const total = calculateTotalImpressions(result);
          const index = urlToIndex[data.url];
          if (index !== undefined) {
            newDataValues[index] = total;
          }
        }

        const total = newDataValues.reduce((a, b) => a + b, 0);

        const totalSearch = newDataValues[0] + newDataValues[1];
        const totalMaps = newDataValues[2] + newDataValues[3];
        setMapsVsSearchData({
          labels: ["Search", "Maps"],
          dataValues: [totalSearch, totalMaps],
          total,
        });

        const totalMobile = newDataValues[0] + newDataValues[2];
        const totalDesktop = newDataValues[1] + newDataValues[3];
        setMobileVsDesktopData({
          labels: ["Mobile", "Desktop"],
          dataValues: [totalMobile, totalDesktop],
          total,
        });

        setPieChartData({ labels, dataValues: newDataValues, total });
      } catch (err) {
        console.error("Error fetching pie chart data:", err);
        setPieChartData({
          labels,
          dataValues: [0, 0, 0, 0],
          total: 0,
        });
        setMapsVsSearchData({
          labels: ["Search", "Maps"],
          dataValues: [0, 0],
          total: 0,
        });
        setMobileVsDesktopData({
          labels: ["Mobile", "Desktop"],
          dataValues: [0, 0],
          total: 0,
        });
      } finally {
        setLoadingPieData(false);
      }
    };

    fetchPieChartData();
  }, [
    GMBLocation_Id,
    GMBAccount_Id,
    formattedStart,
    formattedEnd,
    DesktopMaps,
    apibaseurl,
    token,
    calculateTotalImpressions,
  ]);

  const [internalLayouts, setInternalLayouts] = useState({
    lg: [],
    allCharts: [],
  });
  const [hiddenCharts, setHiddenCharts] = useState([]);
  const [layoutRestored, setLayoutRestored] = useState(false);
  const [chartTypes, setChartTypes] = useState({});
  const [chartColors, setChartColors] = useState({});
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedChartForColor, setSelectedChartForColor] = useState(null);
  const [activeMenuKey, setActiveMenuKey] = useState(null);

  // load saved layout for GMB
  useEffect(() => {
    const savedLayout = localStorage.getItem("gmbDashboardLayout");
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setInternalLayouts((prev) => ({ ...prev, lg: parsed }));
        setLayoutRestored(true);
      } catch (err) {
        console.error("Error parsing saved gmb layout:", err);
      }
    }
  }, []);

  // Comments system
  const selectedClientSeq = localStorage.getItem('selectedClientSeq');
  // Re-call hook with clientSeq so comments reload when selected client changes
  const commentHook = useCommentSystem(startDate, selectedClientSeq);
  const {
    comments: commentsFromHook,
    isModalOpen: isModalOpenFromHook,
    selectedChart: selectedChartFromHook,
    openCommentModal: openCommentModalFromHook,
    closeCommentModal: closeCommentModalFromHook,
    saveComment: saveCommentFromHook,
    deleteComment: deleteCommentFromHook,
  } = commentHook;

  // Backwards-compat: map hook returns to expected local names used in this file
  const comments = commentsFromHook || {};
  const isModalOpen = isModalOpenFromHook;
  const selectedChart = selectedChartFromHook;
  const openCommentModal = openCommentModalFromHook;
  const closeCommentModal = closeCommentModalFromHook;
  const saveComment = saveCommentFromHook;
  const deleteComment = deleteCommentFromHook;

  const [commentVisibility, setCommentVisibility] = useState(() => {
    try {
      const savedVisibility = localStorage.getItem("gmbCommentVisibilityState");
      return savedVisibility ? JSON.parse(savedVisibility) : {};
    } catch (err) {
      console.error("Error reading comment visibility:", err);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "gmbCommentVisibilityState",
      JSON.stringify(commentVisibility)
    );
  }, [commentVisibility]);

  // Toggle show comment on backend 
  const handleShowComment = async (chartKey) => {
    if (!chartKey) return;
    const prev = commentVisibility[chartKey];
    setCommentVisibility((s) => ({ ...s, [chartKey]: true }));

    try {
      const url = `${apibaseurl}/api/ChartComments/toggle-comment-visibility?chartUniqueName=${encodeURIComponent(
        chartKey
      )}`;
      const resp = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok)
        throw new Error(`Server returned ${resp.status}`);
    } catch (err) {
      console.error("Error showing comment for", chartKey, err);
      setCommentVisibility((s) => ({ ...s, [chartKey]: prev }));
    }
  };

  const handleHideComment = async (chartKey) => {
    if (!chartKey) return;
    const prev = commentVisibility[chartKey];
    setCommentVisibility((s) => ({ ...s, [chartKey]: false }));

    try {
      const url = `${apibaseurl}/api/ChartComments/toggle-comment-visibility?chartUniqueName=${encodeURIComponent(
        chartKey
      )}&isShow=false`;
      const resp = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok)
        throw new Error(`Server returned ${resp.status}`);
    } catch (err) {
      console.error("Error hiding comment for", chartKey, err);
      setCommentVisibility((s) => ({ ...s, [chartKey]: prev }));
    }
  };


  useEffect(() => {
    const fetchGmbCustomizations = async () => {
      try {
        const response = await fetch(
          `${apibaseurl}/api/GMBCustomizeHideApiList/get`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
          },

        );
        if (response.ok) {
          const data = await response.json();
          const uncheckedApis =
            data.apiUniqueName?.split(", ").map((c) => c.trim()) || [];
          setHiddenCharts(uncheckedApis);
        }
      } catch (err) {
        console.error("Error fetching GMB customizations:", err);
      }
    };

    if (token) fetchGmbCustomizations();
  }, [token, apibaseurl]);

  useEffect(() => {
    let allCharts = [];
    let initialLayouts = [];
    let yOffset = 0;

    const addChart = (chartDetails, layoutDetails, chartCode = null) => {
      if (!chartDetails?.component) return;
      if (chartCode && hiddenCharts.includes(chartCode)) return;

      const defaultSupports = { color: true, convert: true };
      const finalSupports = chartDetails.supports
        ? { ...defaultSupports, ...chartDetails.supports }
        : defaultSupports;

      allCharts.push({
        ...chartDetails,
        code: chartCode,
        supports: finalSupports,
      });
      initialLayouts.push({ ...layoutDetails, i: chartDetails.key });
    };

    // Row 1: Three pie charts (each w:4)
    addChart(
      {
        key: "gmb-pie-platform-device",
        title: "Platform & Device",
        component: (
          <GmbPiechart
            title="Platform & Device"
            totalText="Impressions"
            labels={pieChartData.labels}
            dataValues={pieChartData.dataValues}
            total={pieChartData.total}
            loading={loadingPieData}
          />
        ),
        supports: { color: false, convert: false },

      },
      // for incresing & decreasing height modify h & for width use w & height & common yOffset should be same  ex:-     yOffset += 10;

      { x: 0, y: yOffset, w: 4, h: 10 },
      "GMBApi001"
    );

    addChart(
      {
        key: "gmb-pie-mobile-desktop",
        title: "Total Mobile vs Desktop",
        component: (
          <GmbPiechart
            title="Total Mobile vs Desktop"
            totalText="Impressions"
            labels={mobileVsDesktopData.labels}
            dataValues={mobileVsDesktopData.dataValues}
            total={mobileVsDesktopData.total}
            loading={loadingPieData}
          />
        ),
        supports: { color: false, convert: false },

      },
      { x: 4, y: yOffset, w: 4, h: 10 },
      "GMBApi002"
    );

    addChart(
      {
        key: "gmb-pie-maps-search",
        title: "Total Maps vs Search",
        component: (
          <GmbPiechart
            title="Total Maps vs Search"
            totalText="Impressions"
            labels={mapsVsSearchData.labels}
            dataValues={mapsVsSearchData.dataValues}
            total={mapsVsSearchData.total}
            loading={loadingPieData}
          />

        ),
        supports: { color: false, convert: false },

      },
      { x: 8, y: yOffset, w: 4, h: 10 },
      "GMBApi003"
    );

    yOffset += 10;

    // Row 2: TotalProfileImpression charts (each w:6)
    if (TotalProfileImpression && TotalProfileImpression.length > 0) {
      TotalProfileImpression.forEach((data, idx) => {
        addChart(
          {
            key: `gmb-profile-impression-${data.id || idx}`,
            title: data.title,
            component: (
              <BarChart
                GMBLocation_Id={GMBLocation_Id}
                GMBAccount_Id={GMBAccount_Id}
                id={data.id}
                SquareBox={data}
                startDate={startDate}
                endDate={endDate}
                title={data.title}
                chartType={chartTypes[`gmb-profile-impression-${data.id || idx}`] || "bar"}
                chartColor={chartColors[`gmb-profile-impression-${data.id || idx}`] || "#1565c0"}
              />
            ),
          },
          { x: (idx % 2) * 6, y: yOffset + Math.floor(idx / 2) * 14, w: 6, h: 14 },
          data.code
        );
      });
      yOffset += Math.ceil(TotalProfileImpression.length / 2) * 14;
    }

    // Row 3: MetricDisplayGMB (full width)
    if (BusinessInteractions && BusinessInteractions[0]) {
      addChart(
        {
          key: `gmb-business-interactions-${BusinessInteractions[0].id}`,
          title: BusinessInteractions[0].title,
          component: (
            <MetricDisplayGMB
              locationId={GMBLocation_Id}
              accountId={GMBAccount_Id}
              id={BusinessInteractions[0].id}
              SquareBox={BusinessInteractions[0]}
              startDate={startDate}
              endDate={endDate}
              title={BusinessInteractions[0].title}
              code={BusinessInteractions[0].code}
            />
          ),
          supports: { color: false, convert: false },
        },
        { x: 0, y: yOffset, w: 12, h: 10 },
        BusinessInteractions[0].code
      );
      yOffset += 10;
    }


    // Row 4: DesktopMaps (loop: w:4 each)
    DesktopMaps.forEach((data, idx) => {
      addChart(
        {
          key: `gmb-desktopmap-${data.id || idx}`,
          title: data.title,
          component: (
            <BarChart
              GMBLocation_Id={GMBLocation_Id}
              GMBAccount_Id={GMBAccount_Id}
              id={data.id}
              SquareBox={data}
              startDate={startDate}
              endDate={endDate}
              title={data.title}
              chartType={chartTypes[`gmb-desktopmap-${data.id || idx}`] || "bar"}
              chartColor={chartColors[`gmb-desktopmap-${data.id || idx}`] || "#1565c0"}
            />
          ),
        },
        { x: (idx % 3) * 4, y: yOffset + Math.floor(idx / 3) * 14, w: 4, h: 14 },

        data.code
      );
    });
    yOffset += Math.ceil(DesktopMaps.length / 3) * 14;



    setInternalLayouts((prev) => {
      if (layoutRestored && prev.lg?.length > 0) {
        return { ...prev, allCharts };
      }
      // first-time default layouts
      return { lg: initialLayouts, allCharts };
    });
  }, [
    pieChartData,
    mapsVsSearchData,
    mobileVsDesktopData,
    TotalProfileImpression,
    BusinessInteractions,
    DesktopMaps,
    SearchKeywords,
    hiddenCharts,
    layoutRestored,
    startDate,
    endDate,
    chartTypes,
    chartColors,
  ]);

  // Chart convert & color handlers
  const handleChartConvert = (chartKey, newType) => {
    setChartTypes((prev) => ({ ...prev, [chartKey]: newType }));
  };
  const handleChangeColor = (chartKey) => {
    const chart = internalLayouts.allCharts.find((c) => c.key === chartKey);
    if (chart) {
      setSelectedChartForColor(chart);
      setIsColorModalOpen(true);
    }
  };
  const handleColorSave = (chartKey, newColor) => {
    setChartColors((prev) => ({
      ...prev,
      [chartKey]: newColor,
    }));
    setIsColorModalOpen(false);
    setSelectedChartForColor(null);
  };
  const closeColorModal = () => {
    setIsColorModalOpen(false);
    setSelectedChartForColor(null);
  };

  // comment save/delete wrappers
  const handleSaveComment = (chartKey, newCommentData, reportDateParam) => {
    // Pass reportDate aligned to CSV style (year, month, day, dayOfWeek)
    saveComment(chartKey, newCommentData, reportDateParam || startDate);
    setCommentVisibility((prev) => ({ ...prev, [chartKey]: true }));
  };
  const handleDeleteComment = (chartKey) => {
    if (deleteComment) deleteComment(chartKey);
  };

  const savedUsername = localStorage.getItem("username");
  const currentUser = savedUsername
    ? { name: savedUsername, id: null }
    : { name: "Guest", id: null };

  // --- Render
  return (
    <div style={{ padding: "10px" }}>
      <div className={`${style.table_heading} mb-4`}>
        <h4 className="mb-0">Local SEO</h4>
        <p className={`${style.table_subheading}`}>
          (Data Source - Google My Business)
        </p>
      </div>

      <ResponsiveGridLayout
        layouts={{ lg: internalLayouts.lg }}
        onLayoutChange={(currentLayout) => {
          setInternalLayouts((prev) => {
            const updated = { ...prev, lg: currentLayout };
            try {
              localStorage.setItem("gmbDashboardLayout",
                JSON.stringify(currentLayout));
            } catch (err) {
              console.error("Error saving gmb layout:", err);
            }
            return updated;
          });
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={30}
        draggableHandle=".drag-handle"
        draggableCancel=".no-drag"
      >
        {internalLayouts.allCharts?.map((chart) => {
          // Prefer local visibility override when present; otherwise use server-provided IsShow
          const hasCommentForKey = !!comments[chart.key];
          const serverIsShow = hasCommentForKey
            ? (comments[chart.key].isShow ?? comments[chart.key].IsShow ?? false)
            : false;
          const localHasKey = Object.prototype.hasOwnProperty.call(
            commentVisibility,
            chart.key
          );
          const localVis = localHasKey
            ? !!commentVisibility[chart.key]
            : serverIsShow;
          const isCommentVisibleForThisChart = hasCommentForKey && localVis;

          return chart.component ? (
            <div
              key={chart.key}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                height: "100%",
                zIndex: activeMenuKey === chart.key ? 999 : 1,
              }}
            >
              <div
                className="drag-handle"
                style={{
                  cursor: "grab",
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <h6
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    flex: 1,
                  }}
                >
                  {chart.title}
                </h6>
                <div className="ms-auto me-2 no-drag">
                  <ChartActionsMenu
                    chart={chart}
                    onToggle={setActiveMenuKey}
                    isCommentVisible={isCommentVisibleForThisChart}
                    onChartConvert={handleChartConvert}
                    onChangeColor={handleChangeColor}
                    onShowComment={handleShowComment}
                    onHideComment={handleHideComment}
                    onAddComment={openCommentModal}
                    onDeleteComment={handleDeleteComment}
                    hasComment={!!comments[chart.key]}
                  />
                </div>
              </div>

              <div
                className="chart-content-area"
                style={{
                  padding: "10px",
                  flex: 1,
                  width: "100%",
                  overflow: "auto",
                  minHeight: 0,
                }}
              >
                {chart.component}
              </div>

              {isCommentVisibleForThisChart && (
                <div
                  className="comment-display-section no-drag pdf-ignore"
                  style={{
                    padding: "10px 15px",
                    borderTop: "1px solid #eee",
                    backgroundColor: "#fafafa",
                    flexShrink: 0,
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    <span style={{ color: "#0073ed" }}>
                      {comments[chart.key]?.createdBy || "User"}:
                    </span>
                    <span style={{ marginLeft: "5px", wordBreak: "break-word" }}>
                      {(() => {
                        const msg = comments[chart.key]?.message || "";
                        const parts = msg.split(/(@[A-Za-z][A-Za-z0-9_]*)/g);
                        return parts.map((p, idx) => {
                          if (p && p.startsWith && p.startsWith('@')) {
                            const raw = p.slice(1).trim();
                            return <span key={idx} style={{ color: '#0073ed' }}>@{raw}</span>;
                          }
                          return <span key={idx}>{p}</span>;
                        });
                      })()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : null;
        })}
      </ResponsiveGridLayout>
      {/* Add/Edit Comment Modal */}
      <AddEditCommentModal
        show={isModalOpen}
        handleClose={closeCommentModal}
        chart={selectedChart}
        onSave={handleSaveComment}
        currentUser={currentUser}
        existingComment={selectedChart ? comments[selectedChart.key] : null}
        reportDate={startDate}
      />


      <ChartColorPickerModal
        show={isColorModalOpen}
        handleClose={closeColorModal}
        chart={selectedChartForColor}
        onSave={handleColorSave}
        currentColor={
          selectedChartForColor ? chartColors[selectedChartForColor.key] : null
        }
      />


    </div>
  );
};

export default ChartGMB;
