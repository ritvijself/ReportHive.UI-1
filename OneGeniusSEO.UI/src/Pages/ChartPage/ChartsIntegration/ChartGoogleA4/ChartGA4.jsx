import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProgressBar from "../../TotalCharts/ProgressBar/ProgressBar";
import DeviceTable from "../../TotalCharts/DeviceTable/DeviceTable";
import PieChartGA4 from "../../TotalCharts/GA4Charts/PieChartGA4";
import LineChartGA4 from "../../TotalCharts/GA4Charts/LineChartGA4";
import MetricSquareBoxGA4 from "../../TotalCharts/GA4Charts/MetricSquareBoxGA4";
import LineCharfilledGA4 from "../../TotalCharts/GA4Charts/LineChartfilledGA4";
import ConversionData from "../../TotalCharts/GA4Charts/ConversionData";
import DeviceBrowserChart from "../../TotalCharts/GA4Charts/DeviceBrowserChart";
import WorldMapChart from "../../TotalCharts/GA4Charts/WorldMapChart";
import DeviceSessionsChart from "../../TotalCharts/GA4Charts/DevicesSessionsChart";
import DeviceBounceBarChart from "../../TotalCharts/GA4Charts/DeviceBounceBarChart";
import MultiLineChartGA4 from "../../TotalCharts/GA4Charts/MultiLineChartGA4";
import ChannelTable from "../../TotalCharts/DeviceTable/ChannelTable";
import AvgEngagementBarChart from "../../TotalCharts/GA4Charts/AverageEngagementBarChart";
import BarChartActiveUser from "../../TotalCharts/GA4Charts/BarChartActiveUser/BarChartActiveUser";
import LineChartGA4ThreeMonth from "../../TotalCharts/GA4Charts/LineChartGA4ThreeMonth";
import BounceEngagementMetricBox from "../../TotalCharts/GA4Charts/BounceEngagementMetricBox";
import ContactFormChart from "../../TotalCharts/GA4Charts/ContactFormChart";
import ChannelSessionTable from "../../TotalCharts/DeviceTable/ChannelSessionTable";
import MetricDisplayGA4 from "../../TotalCharts/GA4Charts/MetricDisplayGA4/MetricDisplayGA4";
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

const ChartGA4 = ({
  propertyid,
  startDate,
  endDate,
  ConversionRate,
  Traffic,
  SessionByDevice,
  Devices,
  style,
  DayBydDayUser,
  activeUser,
  newUserDayByDay,
  UserEngagementDayByDay,
  TotalUserByCountry,
  TotalUserByCity,
  TotalUserByLanguage,
  TotalUserByDeviceBrowser,
  UserEngagementByCountry,
  KeyEventCountry,
  TotalPageUsers,
  PageViewPerDay,
  TrafficSourcePerPage,
  engSessions,
  engSessionsDevices,
  CampaignTable,
  BounceRateDevices,
  TotalDeviceUsersDayWise,
  CountByDevice,
  KeyEventsByDevice,
  SessionTable,
  GA4HighLight,
  AverageEngagement,
  TotalUserMap,
  sessions,
}) => {
  const safeTraffic = Traffic?.[0] || { id: "traffic-fallback" };
  const [totalUsers, setTotalUsers] = useState(0);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [internalLayouts, setInternalLayouts] = useState({
    lg: [],
    allCharts: [],
  });
  const [hiddenCharts, setHiddenCharts] = useState([]);
  const [activeMenuKey, setActiveMenuKey] = useState(null);
  const [chartTypes, setChartTypes] = useState({});
  const [chartColors, setChartColors] = useState({});
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedChartForColor, setSelectedChartForColor] = useState(null);

  ///layout saved
  const [layoutRestored, setLayoutRestored] = useState(false);
  useEffect(() => {
    const savedLayout = localStorage.getItem("ga4DashboardLayout");
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setInternalLayouts((prev) => ({
          ...prev,
          lg: parsedLayout,
        }));
        setLayoutRestored(true); // ✅ Mark restored
      } catch (err) {
        console.error("Error parsing saved layout:", err);
      }
    } else {
      console.log("No layout found in localStorage, using default layout");
    }
  }, []);

  const selectedClientSeq = localStorage.getItem('selectedClientSeq');
  const {
    comments,
    isModalOpen,
    selectedChart,
    openCommentModal,
    closeCommentModal,
    saveComment,
    deleteComment,
  } = useCommentSystem(startDate, selectedClientSeq);

  const [commentVisibility, setCommentVisibility] = useState(() => {
    try {
      const savedVisibility = localStorage.getItem("ga4CommentVisibilityState");
      return savedVisibility ? JSON.parse(savedVisibility) : {};
    } catch (error) {
      console.error(
        "Error reading GA4 visibility state from local storage",
        error
      );
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "ga4CommentVisibilityState",
      JSON.stringify(commentVisibility)
    );
  }, [commentVisibility]);

  // Handler to show comment for a chart — calls backend toggle API and updates local state
  const handleShowComment = async (chartKey) => {
    if (!chartKey) return;
    const prev = commentVisibility[chartKey];

    // Optimistic update
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

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
    } catch (err) {
      console.error("Error showing comment for", chartKey, err);
      // Revert optimistic update on failure
      setCommentVisibility((s) => ({ ...s, [chartKey]: prev }));
    }
  };

  // Handler to hide comment for a chart — calls backend toggle API and updates local state
  const handleHideComment = async (chartKey) => {
    if (!chartKey) return;
    const prev = commentVisibility[chartKey];

    // Optimistic update
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

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
    } catch (err) {
      console.error("Error hiding comment for", chartKey, err);
      // Revert optimistic update on failure
      setCommentVisibility((s) => ({ ...s, [chartKey]: prev }));
    }
  };

  useEffect(() => {
    const fetchChartCustomizations = async () => {
      try {
        // NOTE: API endpoint is assumed to be similar but for GA4
        const response = await fetch(
          `${apibaseurl}/api/GA4CustomizeHideApiList/get`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Assuming 'apiUniqueName' contains comma-separated codes of hidden charts
          const uncheckedApis =
            data.apiUniqueName?.split(", ").map((c) => c.trim()) || [];
          setHiddenCharts(uncheckedApis);
        }
      } catch (error) {
        console.error("Error fetching GA4 chart customizations:", error);
      }
    };

    if (token) {
      fetchChartCustomizations();
    }
  }, [token, apibaseurl]);

  useEffect(() => {
    let allCharts = [];
    let initialLayouts = [];
    let yOffset = 0;

    const addChart = (chartDetails, layoutDetails, chartCode = null) => {
      if (
        !chartDetails?.component ||
        (chartCode && hiddenCharts.includes(chartCode))
      ) {
        return;
      }

      const defaultSupports = { color: true, convert: true };
      const finalSupports = chartDetails.supports
        ? { ...defaultSupports, ...chartDetails.supports }
        : defaultSupports;

      const hasComment = !!comments[chartDetails.key];
      const isVisible = !!commentVisibility[chartDetails.key];
      const shouldBeTall = hasComment && isVisible;

      const finalLayout = layoutDetails; // Default height use ki jaa rahi hai

      allCharts.push({
        ...chartDetails,
        code: chartCode,
        supports: finalSupports,
      });
      initialLayouts.push({ ...finalLayout, i: chartDetails.key });
    };

    // Row 1: ChannelSessionTable (6 wide) & DayBydDayUser Line Chart (6 wide)
    if (SessionTable?.[0]) {
      addChart(
        {
          key: "ga4-session-table",
          title: SessionTable[0].title,
          component: (
            <ChannelSessionTable
              propertyId={propertyid}
              SquareBox={SessionTable[0]}
              id={SessionTable[0].id}
              startDate={startDate}
              endDate={endDate}
              title={SessionTable[0].title}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },

        { x: 0, y: yOffset, w: 6, h: 10 },
        SessionTable[0].code
      );
    }

    if (DayBydDayUser?.[0]) {
      addChart(
        {
          key: "ga4-day-by-day-user",
          title: DayBydDayUser[0].title,
          component: (
            <LineChartGA4ThreeMonth
              propertyId={propertyid}
              startDate={startDate}
              id={DayBydDayUser[0].id}
              endDate={endDate}
              SquareBox={DayBydDayUser[0]}
              title={DayBydDayUser[0].title}
              chartType={chartTypes["ga4-day-by-day-user"] || "line"}
              chartColor={chartColors["ga4-day-by-day-user"] || "#1565c0"} // (Aapko 'chartColors' state banani hogi)
            />
          ),
        },
        { x: 6, y: yOffset, w: 6, h: 11 },
        DayBydDayUser[0].code
      );
    }
    yOffset += 11;

    // Row 2: MetricDisplayGA4 (12 wide, this is a special row of smaller boxes, height may need adjustment)
    if (GA4HighLight?.[0]) {
      addChart(
        {
          key: "ga4-metric-highlight",
          title: GA4HighLight[0].title,
          component: (
            <MetricDisplayGA4
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              SquareBox={GA4HighLight[0]}
              title={GA4HighLight[0].title}
              code={GA4HighLight[0].code}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 15, h: 7 }, // Assuming height of 6 for this metric box row
        GA4HighLight[0].code
      );
      yOffset += 7;
    }

    // Row 3: Engaged Sessions Line Chart (6 wide) & UserEngagementDayByDay Line Chart (6 wide)
    if (engSessions?.[0]) {
      addChart(
        {
          key: "ga4-engaged-sessions",
          title: engSessions[0].title,
          component: (
            <LineChartGA4
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              SquareBox={engSessions[0]}
              title={engSessions[0].title}
              chartType={chartTypes["ga4-engaged-sessions"] || "line"} // <-- YEH SAHI HAI
              chartColor={chartColors["ga4-engaged-sessions"] || "#1565c0"}
            />
          ),
        },
        { x: 0, y: yOffset, w: 6, h: 11 },
        engSessions[0].code
      );
    }
    if (UserEngagementDayByDay?.[0]) {
      addChart(
        {
          key: "ga4-user-engagement-day",
          title: UserEngagementDayByDay[0].title,
          component: (
            <LineCharfilledGA4
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              id={UserEngagementDayByDay[0].id}
              SquareBox={UserEngagementDayByDay[0]}
              title={UserEngagementDayByDay[0].title}
              chartType={chartTypes["ga4-user-engagement-day"] || "line"}
              chartColor={chartColors["ga4-user-engagement-day"] || "#1565c0"}
            />
          ),
        },
        { x: 6, y: yOffset, w: 6, h: 11 },
        UserEngagementDayByDay[0].code
      );
    }
    yOffset += 11;
    // Row 4: Channel Table (12 wide)
    if (Traffic?.[0]) {
      addChart(
        {
          key: "ga4-channel-table",
          title: "Channel Traffic Overview",
          component: (
            <ChannelTable
              propertyid={propertyid}
              SquareBox={safeTraffic}
              startDate={startDate}
              endDate={endDate}
              columns={[
                { key: "channel", label: "Channel" },
                { key: "sessions", label: "Sessions" },
                { key: "totalUsers", label: "Total Users" },
                { key: "userEngagementDuration", label: "User Engagement" },
                { key: "screenPageViews", label: "Views" },
                { key: "eventCount", label: "Event Count" },
                { key: "keyEvents", label: "Key Events" },
                { key: "ecommercePurchases", label: "Total Purchasers" },
              ]}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 12, h: 10 }, // Large table, adjust height as needed
        Traffic[0].code // Assuming Traffic[0] holds the code
      );
      yOffset += 10;
    }

    // Row 5: Conversions - Active User Bar Chart (6 wide) & New User Line Chart (6 wide)
    if (activeUser?.[0]) {
      addChart(
        {
          key: "ga4-active-user-bar",
          title: activeUser[0].title,
          component: (
            <BarChartActiveUser
              propertyId={propertyid}
              id={activeUser[0].id}
              SquareBox={activeUser[0]}
              startDate={startDate}
              endDate={endDate}
              title={activeUser[0].title}
              code={activeUser[0].code}
              chartType={chartTypes["ga4-active-user-bar"] || "bar"}
              chartColor={chartColors["ga4-active-user-bar"] || "#1565c0"} // Default color agar save nahi hai
            />
          ),
        },
        { x: 0, y: yOffset, w: 6, h: 12 },
        activeUser[0].code
      );
    }
    if (newUserDayByDay?.[0]) {
      addChart(
        {
          key: "ga4-new-user-line",
          title: newUserDayByDay[0].title,
          component: (
            <LineChartGA4
              id={newUserDayByDay[0].id}
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              SquareBox={newUserDayByDay[0]}
              title={newUserDayByDay[0].title}
              chartType={chartTypes["ga4-new-user-line"] || "line"}
              chartColor={chartColors["ga4-new-user-line"] || "#1565c0"} // (Assume kar raha hoon aapne 'chartColors' state banayi hai)
            />
          ),
        },
        { x: 6, y: yOffset, w: 6, h: 12 },
        newUserDayByDay[0].code
      );
    }
    yOffset += 12;

    // Row 6: Average Engagement Bar Chart (8 wide) & Metric Boxes (4 wide - split into two 12-width items in the original Col md=4)
    if (AverageEngagement?.[0]) {
      addChart(
        {
          key: "ga4-avg-engagement-bar",
          title: "User Engagement Duration Per User",
          component: (
            <AvgEngagementBarChart
              propertyId={propertyid}
              id={AverageEngagement[0].id}
              SquareBox={AverageEngagement[0]}
              startDate={startDate}
              endDate={endDate}
              title={" User Engagement Duration Per User"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 8, h: 10 },
        AverageEngagement[0].code
      );
    }
    if (UserEngagementDayByDay?.[0]) {
      addChart(
        {
          key: "ga4-bounce-engagement-metric",
          title: "Engagement Metric Box",
          component: (
            <BounceEngagementMetricBox
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              id={UserEngagementDayByDay[0].id}
              SquareBox={UserEngagementDayByDay}
              title={UserEngagementDayByDay[0].title}
              metricType="engagementDuration"
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 8, y: yOffset, w: 4, h: 5 },
        UserEngagementDayByDay[0].code // Reusing the code from the other usage, assuming it's the correct one
      );
    }
    if (ConversionRate?.[0]) {
      addChart(
        {
          key: "ga4-conversion-data",
          title: ConversionRate[0].title,
          component: (
            <ConversionData
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              id={ConversionRate[0].id}
              SquareBox={ConversionRate[0]}
              title={ConversionRate[0].title}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 8, y: yOffset + 5, w: 4, h: 5 },
        ConversionRate[0].code
      );
    }
    yOffset += 10;

    // Row 7: Campaign Table (12 wide)
    if (CampaignTable?.[0]) {
      addChart(
        {
          key: "ga4-campaign-table",
          title: CampaignTable[0].title,
          component: (
            <DeviceTable
              propertyid={propertyid}
              id={CampaignTable[0].id}
              SquareBox={CampaignTable[0]}
              startDate={startDate}
              endDate={endDate}
              title={CampaignTable[0].title}
              columns={[
                { key: "campaign", label: "Campaign" },
                { key: "conversions", label: "Conversions" },
                { key: "newUsers", label: "New Users" },
                { key: "totalUsers", label: "Total Users" },
                { key: "userEngagementDuration", label: "Engagement Duration" },
              ]}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 12, h: 9.2 },
        CampaignTable[0].code
      );
      yOffset += 9.2;
    }

    // Row 8: World Map (6 wide) & Country/City Progress Bars (3 wide each)
    if (TotalUserMap?.[0]) {
      addChart(
        {
          key: "ga4-world-map",
          title: "Total Users By Country",
          component: (
            <WorldMapChart
              propertyid={propertyid}
              Progress={TotalUserMap[0]}
              startDate={startDate}
              endDate={endDate}
              id={TotalUserMap[0].id}
              title={"Total Users By Country"}
              totalUser={null}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 6, h: 12 },
        TotalUserMap[0].code
      );
    }
    if (TotalUserByCountry?.[0]) {
      addChart(
        {
          key: "ga4-user-by-country-bar",
          title: TotalUserByCountry[0].title,
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={TotalUserByCountry[0]}
              startDate={startDate}
              endDate={endDate}
              id={TotalUserByCountry[0].id}
              title={TotalUserByCountry[0].title}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 6, y: yOffset, w: 3, h: 12 },
        TotalUserByCountry[0].code
      );
    }
    if (TotalUserByCity?.[0]) {
      addChart(
        {
          key: "ga4-user-by-city-bar",
          title: TotalUserByCity[0].title,
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={TotalUserByCity[0]}
              startDate={startDate}
              endDate={endDate}
              id={TotalUserByCity[0].id}
              title={TotalUserByCity[0].title}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 9, y: yOffset, w: 3, h: 12 },
        TotalUserByCity[0].code
      );
    }
    yOffset += 12;

    ////Row-09

    const languageChartHeight = 10; // Height for w:4 ProgressBar charts (Aapne 9 rakhi hai, so we'll use 9)
    const fixedChartHeight = 10; // Height for the w:4 charts (same as language height for consistency)

    // Start the placement block at the current global yOffset
    let locationRowY = yOffset;
    let currentX = 0;

    // 1. TotalUserByLanguage Charts (Loop)
    if (TotalUserByLanguage && TotalUserByLanguage.length > 0) {
      TotalUserByLanguage.forEach((Data) => {
        // Agar row fill ho gayi hai, toh wrap karo
        if (currentX >= 12) {
          locationRowY += languageChartHeight;
          currentX = 0;
        }

        addChart(
          {
            key: `ga4-lang-${Data.id}`,
            title: Data.title,
            component: (
              <ProgressBar
                propertyid={propertyid}
                Progress={Data}
                startDate={startDate}
                endDate={endDate}
                title={Data.title}
                id={Data.id}
                barColor={"#0073ed"}
                titleSize={"16px"}
              />
            ),
            supports: { color: false, convert: false }, // <= disable color & convert
          },
          // Placement: width w:4, height h:9
          { x: currentX, y: locationRowY, w: 4, h: languageChartHeight },
          Data.code
        );

        // Agle chart ke liye column position ko update karo
        currentX += 4;
      });
    }

    if (UserEngagementByCountry && UserEngagementByCountry.length > 0) {
      // Wrap Check: Agar currentX+4 > 12 hai, toh new row par jao
      if (currentX > 8) {
        // agar currentX 12 ho gaya hai, toh wrap (currentX>=12) ya
        // agar currentX 10 hai (jo ki w:4 mein possible nahi), phir bhi wrap.
        locationRowY += fixedChartHeight;
        currentX = 0;
      }

      addChart(
        {
          key: `user-engagement-by-country-${UserEngagementByCountry[0].id}`,
          title: UserEngagementByCountry[0].title,
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={UserEngagementByCountry[0]}
              startDate={startDate}
              endDate={endDate}
              title={UserEngagementByCountry[0].title}
              id={UserEngagementByCountry[0].id}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        // Placement: x: currentX, y: locationRowY, width W:4, height H:9
        { x: currentX, y: locationRowY, w: 4, h: fixedChartHeight },
        UserEngagementByCountry[0].code
      );
      currentX += 4;
    }

    // 3. KeyEventCountry (w:4, h:9)
    if (KeyEventCountry && KeyEventCountry.length > 0) {
      // Wrap Check: Agar currentX+4 > 12 hai, toh new row par jao
      if (currentX > 8) {
        locationRowY += fixedChartHeight;
        currentX = 0;
      }

      addChart(
        {
          key: `key-event-country-${KeyEventCountry[0].id}`,
          title: KeyEventCountry[0].title,
          component: (
            <DeviceSessionsChart
              propertyId={propertyid}
              id={KeyEventCountry[0].id}
              startDate={startDate}
              endDate={endDate}
              SquareBox={KeyEventCountry[0]}
              title={KeyEventCountry[0].title}
              totalText={"Sessions"}
              dataType="device"
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        // Placement: x: currentX, y: locationRowY, width W:4, height H:9
        { x: currentX, y: locationRowY, w: 4, h: fixedChartHeight },
        KeyEventCountry[0].code
      );
      currentX += 4;
    }

    if (currentX > 0) {
      yOffset = locationRowY + fixedChartHeight;
    } else {
      yOffset = locationRowY;
    }

    // Row 10: Device/Browser Charts (Loop - 6 wide each)
    TotalUserByDeviceBrowser.forEach((Data, index) => {
      addChart(
        {
          key: `ga4-browser-${index}`,
          title: Data.title,
          component: (
            <DeviceBrowserChart
              propertyId={propertyid}
              id={Data.id}
              SquareBox={Data}
              startDate={startDate}
              endDate={endDate}
              title={Data.title}
              barColor={"#0073ed"}
              titleSize={"16px"}
              chartType={chartTypes[`ga4-browser-${index}`] || "bar"}
              chartColor={chartColors[`ga4-browser-${index}`] || "#1565c0"}
            />
          ),
        },
        {
          x: (index % 2) * 6,
          y: yOffset + Math.floor(index / 2) * 12,
          w: 6,
          h: 12,
        },
        Data.code
      );
    });
    yOffset += Math.ceil(TotalUserByDeviceBrowser.length / 2) * 12;

    // Row 11: Devices - Sessions Chart (4 wide), Engaged Sessions Bars (4 wide each)
    if (SessionByDevice?.[0]) {
      addChart(
        {
          key: "ga4-sessions-device",
          title: "Sessions",
          component: (
            <DeviceSessionsChart
              id={SessionByDevice[0].id}
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              SquareBox={SessionByDevice[0]}
              title={"Sessions"}
              totalText={"Sessions"}
              dataType="device"
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 4, h: 10 },
        SessionByDevice[0].code
      );
    }
    if (engSessionsDevices?.[0]) {
      addChart(
        {
          key: "ga4-engaged-sessions-device-1",
          title: engSessionsDevices[0].title,
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={engSessionsDevices[0]}
              startDate={startDate}
              endDate={endDate}
              title={engSessionsDevices[0].title}
              id={engSessionsDevices[0].id}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 4, y: yOffset, w: 4, h: 10 },
        engSessionsDevices[0].code
      );
    }
    if (engSessionsDevices?.[1]) {
      addChart(
        {
          key: "ga4-engaged-sessions-device-2",
          title: engSessionsDevices[1].title,
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={engSessionsDevices[1]}
              startDate={startDate}
              endDate={endDate}
              title={engSessionsDevices[1].title}
              id={engSessionsDevices[1].id}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 8, y: yOffset, w: 4, h: 10 },
        engSessionsDevices[1].code
      );
    }
    yOffset += 10;

    // Row 12: Bounce Rate Bar Chart (5 wide) & MultiLineChart (7 wide)
    if (BounceRateDevices?.[0]) {
      addChart(
        {
          key: "ga4-bounce-rate-bar",
          title: BounceRateDevices[0].title,
          component: (
            <DeviceBounceBarChart
              propertyId={propertyid}
              id={BounceRateDevices[0].id}
              SquareBox={BounceRateDevices[0]}
              startDate={startDate}
              endDate={endDate}
              title={BounceRateDevices[0].title}
              barColor={"#0073ed"}
              titleSize={"16px"}
              chartType={chartTypes["ga4-bounce-rate-bar"] || "bar"}
              chartColor={chartColors["ga4-bounce-rate-bar"] || "#1565c0"}
            />
          ),
        },
        { x: 0, y: yOffset, w: 5, h: 12 },
        BounceRateDevices[0].code
      );
    }
    if (TotalDeviceUsersDayWise?.[0]) {
      addChart(
        {
          key: "ga4-device-users-daywise-1",
          title: TotalDeviceUsersDayWise[0].title,
          component: (
            <MultiLineChartGA4
              propertyId={propertyid}
              id={TotalDeviceUsersDayWise[0].id}
              SquareBox={TotalDeviceUsersDayWise[0]}
              startDate={startDate}
              endDate={endDate}
              title={TotalDeviceUsersDayWise[0].title}
              chartType={chartTypes["ga4-device-users-daywise-1"] || "line"} // ✅ new line
              chartColor={
                chartColors["ga4-device-users-daywise-1"] || "#1565c0"
              }
            />
          ),
        },

        { x: 5, y: yOffset, w: 7, h: 12 },
        TotalDeviceUsersDayWise[0].code
      );
    }
    yOffset += 12;

    // Row 13: MultiLineChart (4 wide), DeviceBrowserChart (4 wide), ContactFormChart (4 wide)
    if (TotalDeviceUsersDayWise?.[1]) {
      addChart(
        {
          key: "ga4-device-users-daywise-2",
          title: TotalDeviceUsersDayWise[1].title,
          component: (
            <MultiLineChartGA4
              propertyId={propertyid}
              id={TotalDeviceUsersDayWise[1].id}
              SquareBox={TotalDeviceUsersDayWise[1]}
              startDate={startDate}
              endDate={endDate}
              title={TotalDeviceUsersDayWise[1].title}
              chartType={chartTypes["ga4-device-users-daywise-2"] || "line"}
              chartColor={
                chartColors["ga4-device-users-daywise-2"] || "#1565c0"
              }
            />
          ),
        },
        { x: 0, y: yOffset, w: 4, h: 12 },
        TotalDeviceUsersDayWise[1].code
      );
    }
    if (CountByDevice?.[0]) {
      addChart(
        {
          key: "ga4-count-by-device-browser",
          title: CountByDevice[0].title,
          component: (
            <DeviceBrowserChart
              propertyId={propertyid}
              SquareBox={CountByDevice[0]}
              startDate={startDate}
              endDate={endDate}
              title={CountByDevice[0].title}
              id={CountByDevice[0].id}
              barColor={"#0073ed"}
              titleSize={"16px"}
              chartType={chartTypes["ga4-count-by-device-browser"] || "bar"}
              chartColor={
                chartColors["ga4-count-by-device-browser"] || "#1565c0"
              }
            />
          ),
        },
        { x: 4, y: yOffset, w: 4, h: 12 },
        CountByDevice[0].code
      );
    }
    if (KeyEventsByDevice?.[0]) {
      addChart(
        {
          key: "ga4-key-events-device",
          title: KeyEventsByDevice[0].title,
          component: (
            <ContactFormChart
              propertyId={propertyid}
              Progress={KeyEventsByDevice[0]}
              startDate={startDate}
              endDate={endDate}
              title={KeyEventsByDevice[0].title}
              id={KeyEventsByDevice[0].id}
              chartType={chartTypes["ga4-key-events-device"] || "bar"}
              chartColor={chartColors["ga4-key-events-device"] || "#1565c0"}
            />
          ),
        },
        { x: 8, y: yOffset, w: 4, h: 12 },
        KeyEventsByDevice[0].code
      );
    }
    yOffset += 12;

    // Row 14: Devices Table (12 wide)
    if (Devices?.[0]) {
      addChart(
        {
          key: "ga4-devices-table",
          title: Devices[0].title,
          component: (
            <DeviceTable
              propertyid={propertyid}
              id={Devices[0].id}
              SquareBox={Devices[0]}
              startDate={startDate}
              endDate={endDate}
              title={Devices[0].title}
              textTransform={"capitalize"}
              columns={[
                { key: "deviceCategory", label: "Device Category" },
                { key: "sessions", label: "Session" },
                { key: "totalUsers", label: "Total Users" },
                { key: "userEngagementDuration", label: "User Engagement (s)" },
                { key: "views", label: " Views" },
                { key: "engagementRate", label: "Key Events" },
                { key: "eventCount", label: "Event Count" },
              ]}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 12, h: 7 },
        Devices[0].code
      );
      yOffset += 7;
    }

    // Row 15: Sessions Line Chart (6 wide) & Top Pages Bar Chart (6 wide)
    if (sessions?.[0]) {
      addChart(
        {
          key: "ga4-sessions-line",
          title: "Sessions",
          component: (
            <LineChartGA4
              propertyId={propertyid}
              startDate={startDate}
              id={sessions[0].id}
              endDate={endDate}
              SquareBox={sessions[0]}
              title={"Sessions"}
              height={"200px"}
              chartType={chartTypes["ga4-sessions-line"] || "line"}
              chartColor={chartColors["ga4-sessions-line"] || "#1565c0"} // (Assume kar raha hoon aapne 'chartColors' state banayi hai)
            />
          ),
        },
        { x: 0, y: yOffset, w: 6, h: 10 },
        sessions[0].code
      );
    }
    if (TotalPageUsers?.[0]) {
      addChart(
        {
          key: "ga4-total-page-users-1",
          title: TotalPageUsers[0].title,
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={TotalPageUsers[0]}
              startDate={startDate}
              endDate={endDate}
              title={TotalPageUsers[0].title}
              id={TotalPageUsers[0].id}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 6, y: yOffset, w: 6, h: 11 },
        TotalPageUsers[0].code
      );
    }
    yOffset += 11;

    // Row 16: Top Pages Bar Chart (6 wide) & PageView Line Chart (6 wide)
    if (TotalPageUsers?.[1]) {
      addChart(
        {
          key: "ga4-total-page-users-2",
          title: "Number of Time your website sepecific page are views",
          component: (
            <ProgressBar
              propertyid={propertyid}
              Progress={TotalPageUsers[1]}
              startDate={startDate}
              endDate={endDate}
              title={"Number of Time your website sepecific page are views"}
              id={TotalPageUsers[1].id}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 6, h: 11 },
        TotalPageUsers[1].code
      );
    }
    if (PageViewPerDay?.[0]) {
      addChart(
        {
          key: "ga4-pageview-per-day",
          title: PageViewPerDay[0].title,
          component: (
            <LineChartGA4
              propertyId={propertyid}
              startDate={startDate}
              id={PageViewPerDay[0].id}
              endDate={endDate}
              height={"270px"}
              SquareBox={PageViewPerDay[0]}
              title={PageViewPerDay[0].title}
              chartType={chartTypes["ga4-pageview-per-day"] || "line"}
              chartColor={chartColors["ga4-pageview-per-day"] || "#1565c0"}
            />
          ),
        },
        { x: 6, y: yOffset, w: 6, h: 10 },
        PageViewPerDay[0].code
      );
    }
    yOffset += 11;

    // Row 17: Traffic Source Per Page Table (12 wide)
    if (TrafficSourcePerPage?.[0]) {
      addChart(
        {
          key: "ga4-traffic-source-page-table",
          title: TrafficSourcePerPage[0].title,
          component: (
            <DeviceTable
              propertyid={propertyid}
              SquareBox={TrafficSourcePerPage[0]}
              startDate={startDate}
              endDate={endDate}
              columns={[
                { key: "pagePath", label: "Pages" },
                { key: "sessions", label: "Sessions" },
                { key: "totalUsers", label: "Total Users" },
                { key: "userEngagementDuration", label: "User Engagement" },
                { key: "screenPageViews", label: "Views" },
                { key: "eventCount", label: "Event Count" },
                { key: "keyEvents", label: "Key Events" },
                { key: "ecommercePurchases", label: "Purchases" },
              ]}
            />
          ),
          supports: { color: false, convert: false }, // <= disable color & convert
        },
        { x: 0, y: yOffset, w: 12, h: 42 },
        TrafficSourcePerPage[0].code
      );
      yOffset += 42;
    }

    setInternalLayouts((prev) => {
      // If layout already restored, preserve it and only attach charts
      if (layoutRestored && prev.lg?.length > 0) {
        console.log(
          "🟢 Using restored layout from localStorage, keeping chart positions"
        );
        return {
          ...prev,
          allCharts: allCharts, // only update chart components
        };
      }

      // Otherwise, set default layout (first-time load)
      return { lg: initialLayouts, allCharts: allCharts };
    });
  }, [
    startDate,
    endDate,
    hiddenCharts,
    propertyid,
    SessionTable,
    DayBydDayUser,
    GA4HighLight,
    engSessions,
    UserEngagementDayByDay,
    Traffic,
    activeUser,
    newUserDayByDay,
    AverageEngagement,
    ConversionRate,
    CampaignTable,
    TotalUserMap,
    TotalUserByCountry,
    TotalUserByCity,
    TotalUserByLanguage,
    UserEngagementByCountry,
    KeyEventCountry,
    TotalUserByDeviceBrowser,
    SessionByDevice,
    engSessionsDevices,
    BounceRateDevices,
    TotalDeviceUsersDayWise,
    CountByDevice,
    KeyEventsByDevice,
    Devices,
    sessions,
    TotalPageUsers,
    PageViewPerDay,
    TrafficSourcePerPage,
    comments,
    commentVisibility,
    chartTypes,
    chartColors,
  ]);

  const handleChartConvert = (chartKey, newType) => {
    console.log("Converting:", chartKey, "to", newType);
    setChartTypes((prev) => ({ ...prev, [chartKey]: newType }));
  };
  const handleChangeColor = (chartKey) => {
    const chart = internalLayouts.allCharts.find((c) => c.key === chartKey);
    if (chart) {
      setSelectedChartForColor(chart);
      setIsColorModalOpen(true);
    }
  };

  // Yeh naya function modal se color save karega
  const handleColorSave = (chartKey, newColor) => {
    setChartColors((prev) => ({
      ...prev,
      [chartKey]: newColor,
    }));
    setIsColorModalOpen(false); // Modal band karein
  };

  // Yeh naya function modal ko band karega
  const closeColorModal = () => {
    setIsColorModalOpen(false);
    setSelectedChartForColor(null);
  };

  // show/hide handlers implemented above (call backend toggle API)
  const handleSaveComment = (chartKey, newCommentData, reportDateParam) => {
    // Save the comment via comment system
    // reportDateParam should carry startDate from parent for CSV-like date fields
    saveComment(chartKey, newCommentData, reportDateParam || startDate);

    // Ensure comment visibility is true locally for newly saved comments
    setCommentVisibility((prev) => ({ ...prev, [chartKey]: true }));
    // Do NOT call handleShowComment to avoid triggering the toggle API on save
  };
  const handleDeleteComment = (chartKey) => {
    if (deleteComment) {
      deleteComment(chartKey);
    }
  };

  const savedUsername = localStorage.getItem("username");
  const currentUser = savedUsername
    ? { name: savedUsername, id: null }
    : { name: "Guest", id: null };

  return (
    <div style={{ padding: "10px" }}>
      <div className="text-center mt-2 mb-4">
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Website Traffic Overview <br />
        </h4>
        <h6 className="mb-4 fw-bold" style={{ fontSize: "20px" }}>
          {" "}
          (Data Source - Google Analytics 4){" "}
        </h6>
      </div>

      <ResponsiveGridLayout
        layouts={{ lg: internalLayouts.lg }}
        onLayoutChange={(currentLayout) => {
          setInternalLayouts((prev) => {
            const updatedLayouts = { ...prev, lg: currentLayout };
            localStorage.setItem(
              "ga4DashboardLayout",
              JSON.stringify(currentLayout)
            );
            return updatedLayouts;
          });
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={30} // 30px per unit height
        draggableHandle=".drag-handle"
        draggableCancel=".no-drag"
      >
        {internalLayouts.allCharts?.map((chart) => {
          // Determine visibility by preferring a local override (from stored user toggles)
          // and falling back to the server-provided IsShow value when no local value exists.
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
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                overflow: "visible", // Must be visible for menu to appear over other elements
                display: "flex",
                flexDirection: "column",
                position: "relative",
                height: "100%",
                zIndex: activeMenuKey === chart.key ? 999 : 1,
              }}
            >
              <div
                className="drag-handle "
                style={{
                  cursor: "grab",
                  // background: '#fafafa',
                  // background: '#ffffff',

                  // background: '#fbfbfb', // Thoda halka
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
              {/* Comment Display Section */}
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
                      {comments[chart.key]?.createdBy}:
                    </span>

                    <span style={{ marginLeft: "5px", wordBreak: "break-word" }}>
                      {(() => {
                        const msg = comments[chart.key]?.message || "";
                        // Highlight any @mention token (no localStorage lookup required)
                        const parts = msg.split(/(@[A-Za-z][A-Za-z0-9_]*)/g);
                        return parts.map((part, index) => {
                          if (part && part.startsWith && part.startsWith('@')) {
                            const raw = part.slice(1).trim();
                            return (
                              <span key={index} style={{ color: '#0073ed', fontWeight: '500' }}>
                                @{raw}
                              </span>
                            );
                          }
                          return <span key={index}>{part}</span>;
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

      {/* Comment Modal */}
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

export default ChartGA4;
