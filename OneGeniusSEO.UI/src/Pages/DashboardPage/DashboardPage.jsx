import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../styles/loadingDots.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import style from "./DashboardPage.module.css";
import DashboardHeaderContent from "./DashboardHeader/DashboardHeaderContent";
import { useNavigate, useLocation } from "react-router-dom";
import ChartPageSecond from "../ChartPage/ChartPageSecondContainer/ChartPageSecond";
import { formatDateLocal } from "../../utils/FormatDate";
import { getUserRoleFromToken } from "../../utils/Auth";

function DashboardPage() {
  const [integrations, setIntegrations] = useState({
    propertyId: "",
    gsC_id: "",
    gmbAccountId: "",
    gmbLocationId: "",
    fbPageId: "",
    ytChannelId: "",
    instaId: "",
    gAdsensePublisherId: "",
    linkedInUserId: "",
    shopifyId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasIntegrations, setHasIntegrations] = useState(true);
  const today = new Date();
  const lastMonth = today.getMonth() - 1;
  const yearOfLastMonth =
    lastMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
  const firstDayLastMonth = new Date(yearOfLastMonth, (lastMonth + 12) % 12, 1);
  const lastDayLastMonth = new Date(
    yearOfLastMonth,
    ((lastMonth + 12) % 12) + 1,
    0
  );
  const [startDate, setStartDate] = useState(firstDayLastMonth);
  const [endDate, setEndDate] = useState(lastDayLastMonth);
  const [selectedIntegration, setSelectedIntegration] = useState("");
  const [staticWidgetHeaders, setStaticWidgetHeaders] = useState([]);
  const [deletedHeaderIds, setDeletedHeaderIds] = useState([]);
  const [csvWidgets, setCsvWidgets] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summarySeq, setSummarySeq] = useState("");
  const [summaryImages, setSummaryImages] = useState([]);
  const [SummaryFlag, setSummaryFlag] = useState("executivesummary");
  // pdf button

  const [staticCommentKeys, setStaticCommentKeys] = useState([]);

  const [isExporting, setIsExporting] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const clientSeq =
    location.state?.clientSeq || localStorage.getItem("selectedClientSeq");
  const [role, setRole] = useState("");
  useEffect(() => {
    const currentToken =
      localStorage.getItem("datoken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);
    }
  }, []);
  const handleDateChange = useCallback((newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);
  const handleAddSummary = () => {
    setShowSummary(true);
    if (!summaryText) {
      setSummaryText("");
      setSummarySeq("");
    }
  };

  ///pdf button
  const handleExportClick = async () => {
    if (!chartsRef.current) {
      console.error("Chart component reference not found.");
      return;
    }

    try {
      setIsExporting(true); // Yahan se Loading shuru hogi
      await chartsRef.current.triggerExport(); // PDF banne ka intezar karega
    } catch (error) {
      console.error("An error occurred during PDF export:", error);
    } finally {
      setIsExporting(false); // Kaam khatm hone par Loading band hogi
    }
  };

  const handleSaveSummary = async (text, imageFiles = []) => {
    if (!token || !clientSeq) {
      navigate("/signin");
      return;
    }
    try {
      let response;
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;
      const formData = new FormData();
      const summaryText = text || ""; // Convert null/undefined to empty string
      formData.append("summary", summaryText);
      formData.append("summaryFlag", SummaryFlag || "executivesummary");
      formData.append("createdDate", createdDate);
      // Append files
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach((file) => {
          if (file) formData.append("Images", file);
        });
      }

      if (summarySeq) {
        response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/update/${summarySeq}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        response = await fetch(`${apibaseurl}/api/ExecutiveSummary/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }
      if (response.ok) {
        const data = await response.json();
        setSummaryText(text);
        const imagesResp = data.imageUrls || data.images || data.Images || [];
        if (Array.isArray(imagesResp)) {
          setSummaryImages(imagesResp);
        }
        if (!summarySeq && data.summarySeq) {
          setSummarySeq(data.summarySeq);
        }
        setShowSummary(true);
      } else {
        console.error(
          `Failed to ${summarySeq ? "update" : "create"} executive summary:`,
          response.statusText
        );
      }
    } catch (err) {
      console.error(
        `Error ${summarySeq ? "updating" : "creating"} executive summary:`,
        err
      );
    }
  };
  const handleDeleteSummary = async () => {
    if (!token || !clientSeq || !summarySeq) {
      navigate("/signin");
      return;
    }
    try {
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;
      const response = await fetch(
        `${apibaseurl}/api/ExecutiveSummary/delete/${summarySeq}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientSeq, createdDate }),
        }
      );
      if (response.ok) {
        setSummaryText("");
        setSummarySeq("");
        setSummaryImages([]);
        setShowSummary(false);
      } else {
        console.error(
          "Failed to delete executive summary:",
          response.statusText
        );
      }
    } catch (err) {
      console.error("Error deleting executive summary:", err);
    }
  };



  const supportedIntegrationNames = [
    "Google Analytics 4",
    "Google Search Console",
    "Google My Business",
    "Google Ads",
    "YouTube",
    "Google Adsense",
    "Shopify",
  ];

  const checkAnyIntegrationExists = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const [googleRes, metaRes, shopifyRes] = await Promise.all([
        fetch(`${apibaseurl}/api/UserIntegration`, { headers }),
        fetch(`${apibaseurl}/api/FacebookUserIntegration`, { headers }),
        fetch(`${apibaseurl}/api/ShopifyUserIntegration`, { headers }),
      ]);

      let hasIntegration = false;

      if (googleRes.ok) {
        const googleData = await googleRes.json();
        if (googleData.isSuccess && Array.isArray(googleData.data)) {
          hasIntegration = googleData.data.some((item) =>
            supportedIntegrationNames.includes(item.projectName)
          );
        }
      }

      if (!hasIntegration && metaRes.ok) {
        const metaData = await metaRes.json();
        if (metaData.isSuccess && Array.isArray(metaData.data)) {
          hasIntegration = metaData.data.length > 0;
        }
      }

      if (!hasIntegration && shopifyRes.ok) {
        const shopifyData = await shopifyRes.json();
        if (shopifyData.isSuccess && Array.isArray(shopifyData.data)) {
          hasIntegration = shopifyData.data.length > 0;
        }
      }

      return hasIntegration;
    } catch (e) {
      console.error("Error checking user integrations:", e);
      return false;
    }
  };

  const fetchIntegrations = useCallback(async () => {
    if (!clientSeq || !token) return;
    if (isInitialLoad) setIsLoading(true);
    try {
      let propertyId = "";
      let gmbAccountId = "";
      let gmbLocationId = "";
      let gscId = "";
      let fbPageId = "";
      let instaId = "";
      let googleAdsCustomerId = "";
      let ytChannelId = "";
      let gAdsensePublisherId = "";

      // GA4
      const ga4Res = await fetch(
        `${apibaseurl}/api/GoogleAnalytics4Api/GetByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (ga4Res.ok) {
        const ga4Data = await ga4Res.json();
        if (ga4Data.length > 0 && ga4Data[0].properties.length > 0) {
          propertyId = ga4Data[0].properties[0].propertyId.split("/").pop();
        }
      }
      // GMB
      const gmbRes = await fetch(
        `${apibaseurl}/api/GoogleMyBusiness/GetAccountByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (gmbRes.ok) {
        const gmbData = await gmbRes.json();
        if (
          gmbData.datas &&
          gmbData.datas.length > 0 &&
          gmbData.datas[0].locations.length > 0
        ) {
          gmbAccountId = gmbData.datas[0].accountNameID.split("/").pop();
          gmbLocationId = gmbData.datas[0].locations[0].gmB_LocationName
            .split("/")
            .pop();
        }
      }
      // GSC
      const gscRes = await fetch(
        `${apibaseurl}/api/GoogleSearchConsole/GetByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (gscRes.ok) {
        const gscData = await gscRes.json();
        if (
          gscData.datas &&
          gscData.datas.length > 0 &&
          gscData.datas[0].siteUrl
        ) {
          gscId = gscData.datas[0].siteUrl;
        }
      }
      // youtube
      const ytRes = await fetch(
        `${apibaseurl}/api/GoogleYouTube/GetAccountByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (
          ytData.data &&
          ytData.data.length > 0 &&
          ytData.data[0].gyT_ChannelID
        ) {
          ytChannelId = ytData.data[0].gyT_ChannelID;
        }
      }
      // Facebook Page
      try {
        const fbRes = await fetch(
          `${apibaseurl}/api/FacebookInsightsPage/getPageByUser`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.data && fbData.data.length > 0) {
            fbPageId = fbData.data[0].page_Id;
          }
        }
      } catch (err) {
        console.error("Error fetching Facebook Page ID:", err);
      }
      // Instagram
      try {
        const instaRes = await fetch(
          `${apibaseurl}/api/FacebookInstagram/user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (instaRes.ok) {
          const instaData = await instaRes.json();
          if (instaData.length > 0 && instaData[0].fbUserId) {
            instaId = instaData[0].fbUserId;
          }
        }
      } catch (err) {
        console.error("Error fetching Instagram ID:", err);
      }
      //GoogleAds
      try {
        const googleAdsRes = await fetch(
          `${apibaseurl}/api/GoogleAdsApi/user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (googleAdsRes.ok) {
          const googleAdsData = await googleAdsRes.json();
          if (
            googleAdsData.isSuccess &&
            googleAdsData.data &&
            googleAdsData.data.length > 0
          ) {
            googleAdsCustomerId = googleAdsData.data[0].customerId;
          }
        }
      } catch (err) {
        console.error("Error fetching Google Ads Customer ID:", err);
      }
      // Google Adsense
      try {
        const gAdsenseRes = await fetch(
          `${apibaseurl}/api/GoogleAdsenseApi/GetByUser`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (gAdsenseRes.ok) {
          const gAdsenseData = await gAdsenseRes.json();

          if (gAdsenseData.data && gAdsenseData.data.length > 0) {
            gAdsensePublisherId = gAdsenseData.data[0].displayName;
          }
        }
      } catch (err) {
        console.error("Error fetching Google Adsense Publisher ID:", err);
      }
      // LinkedIn

      let linkedInUserId = "";
      try {
        const linkedInRes = await fetch(
          `${apibaseurl}/api/LinkedInApi/GetAllPages`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (linkedInRes.ok) {
          const linkedInData = await linkedInRes.json();

          if (linkedInData.pages && linkedInData.pages.length > 0) {
            // assuming first page has linkedInUserId or id
            linkedInUserId =
              linkedInData.pages[0].organizationId || linkedInData.data[0].id;
          }
        }
      } catch (err) {
        console.error("Error fetching LinkedIn ID:", err);
      }

      // Shopify
      let shopifyId = "";

      try {
        const shopifyRes = await fetch(
          `${apibaseurl}/api/ShopifyProfileApi/profiles`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (shopifyRes.ok) {
          const shopifyData = await shopifyRes.json();
          if (
            shopifyData.isSuccess &&
            Array.isArray(shopifyData.data) &&
            shopifyData.data.length > 0
          ) {
            shopifyId =
              shopifyData.data[0].shop_Domain || shopifyData.data[0].shop_Email; // adjust based on API response
          }
        }
      } catch (err) {
        console.error("Error fetching Shopify ID:", err);
      }

      setIntegrations({
        propertyId,
        gsC_id: gscId,
        gmbAccountId,
        gmbLocationId,
        fbPageId,
        instaId,
        googleAdsCustomerId,
        ytChannelId,
        gAdsensePublisherId,
        linkedInUserId,
        shopifyId,
      });

      const directHasIntegrations = Boolean(
        propertyId ||
        gscId ||
        gmbAccountId ||
        gmbLocationId ||
        fbPageId ||
        instaId ||
        googleAdsCustomerId ||
        ytChannelId ||
        gAdsensePublisherId ||
        linkedInUserId ||
        shopifyId
      );

      let finalHasIntegrations = directHasIntegrations;
      if (!finalHasIntegrations) {
        finalHasIntegrations = await checkAnyIntegrationExists();
      }
      setHasIntegrations(finalHasIntegrations);

    } catch (err) {
      console.error("Error fetching integrations:", err);
      // Fallback: check global user integrations list
      const fallbackHas = await checkAnyIntegrationExists();
      setHasIntegrations(fallbackHas);
      setSummaryText("");
      setSummarySeq("");
      setSummaryImages([]);
      setShowSummary(false);
    } finally {
      setIsLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [apibaseurl, token, clientSeq, startDate, isInitialLoad]);

  // Reusable function to refresh CSV widgets list from server
  const refreshCsvWidgets = useCallback(async () => {
    if (!token || !clientSeq) return;
    try {
      const params = new URLSearchParams({ clientIdf: clientSeq });
      if (startDate) {
        try {
          const d = new Date(startDate);
          params.append('year', String(d.getFullYear()));
          params.append('month', String(d.getMonth() + 1));
          params.append('day', String(d.getDate()));
          params.append('dayOfWeek', String(d.getDay()));
          // Also include ReportDate object-like fields
          params.append('ReportDate[year]', String(d.getFullYear()));
          params.append('ReportDate[month]', String(d.getMonth() + 1));
          params.append('ReportDate[day]', String(d.getDate()));
          params.append('ReportDate[dayOfWeek]', String(d.getDay()));
          // Also include formatted ReportDate string for endpoints expecting a date value
          try {
            const formatted = formatDateLocal(startDate);
            if (formatted) params.append('ReportDate', formatted);
          } catch (e) {
            // ignore formatting errors
          }
        } catch (e) {
          // ignore
        }
      }
      const resp = await fetch(`${apibaseurl}/api/FetchExcelKeyword/fetch-csvDetails${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        const list = data?.listData || data?.data || [];
        setCsvWidgets(
          list.map((item) => ({
            keyword_Seq:
              item.keyword_Seq || item.csvCardId || item.id || `csv_${Date.now()}`,
            rows: Array.isArray(item.rows) ? item.rows : [],
            createdDate: item.createdDate,
            fileName: item.fileName || item.file_Name || item.name || null,
            id: item.csvCardId || item.id || item.keyword_Seq || null,
          }))
        );
      }
    } catch (e) {
      console.warn("Failed to refresh csv cards", e);
    }
  }, [apibaseurl, token, startDate, clientSeq]);
  useEffect(() => {
    if (!token || !clientSeq) return;
    fetchIntegrations();
    // fetch existing headers for this client
    const fetchHeaders = async () => {
      try {
        let formattedReportDate = null;
        try {
          formattedReportDate = formatDateLocal(startDate);
        } catch (err) {
          console.warn('Failed to format startDate for header fetch', err);
        }

        const params = new URLSearchParams({ clientIdf: clientSeq });
        if (formattedReportDate) params.append('ReportDate', formattedReportDate);

        const resp = await fetch(
          `${apibaseurl}/api/Header/get-by-client?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            const ids = data
              .map((h) => h.id || h.headerSeq || h.headerId || `header_${h.headerSeq || h.id}`)
              .filter((id) => !deletedHeaderIds.includes(id));
            setStaticWidgetHeaders(ids);
          }
          else {
            setStaticWidgetHeaders([]);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch headers for client", e);
      }
    };

    fetchHeaders();

    // fetch existing csv cards for this client (detailed objects)
    // moved to reusable callback `refreshCsvWidgets` (defined below) and invoked here
    refreshCsvWidgets();
  }, [token, clientSeq, fetchIntegrations]);

  // Refresh CSV widgets whenever the selected report start date or client changes
  useEffect(() => {
    if (!token || !clientSeq) return;
    // call the reusable refresh function which already uses startDate
    refreshCsvWidgets().catch((e) => console.warn('refreshCsvWidgets error', e));
  }, [refreshCsvWidgets, startDate, clientSeq, token]);


  const rightHeaderTitle = "Dashboards";

  const chartsRef = useRef(null);
  // Retry helper: call child's scrollToLatest until available (handles slow child mount)
  const requestScroll = (type) => {
    let attempts = 0;
    const maxAttempts = 15; // ~3s with 200ms interval
    const interval = 200;
    const id = setInterval(() => {
      attempts += 1;
      try {
        if (chartsRef.current && typeof chartsRef.current.scrollToLatest === 'function') {
          chartsRef.current.scrollToLatest(type);
          clearInterval(id);
          return;
        }
      } catch (e) {
        // ignore
      }
      if (attempts >= maxAttempts) clearInterval(id);
    }, interval);
  };
  const handlePreviewFromHeader = () => {
    try {
      chartsRef.current?.previewPdf?.();
    } catch (e) {
      // ignore
    }
  };
  return (
    <Container fluid className={style.dashboard_container}>
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-hidden={!isLoading}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            pointerEvents: "auto", // capture clicks so they don't pass through
            cursor: "default",
          }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem", borderWidth: "0.25em" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Loading Dashboard</span>
              <span className="loading-dots" aria-hidden>
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
            </div>
          </div>
        </div>
      )}
      <Row style={{ height: "100%" }}>
        <Col md={12} lg={12} className={`${style.main_content} p-0`}>
          <DashboardHeaderContent
            title={rightHeaderTitle}
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            selectedIntegration={selectedIntegration}
            setSelectedIntegration={setSelectedIntegration}
            onAddSummary={handleAddSummary}
            onPreviewPdf={handlePreviewFromHeader}
            //pdf button
            onExportPdf={handleExportClick}
            isExportingPdf={isExporting}
            onStaticWidgetSelect={async (key) => {
              if (key === "header") {
                // Create header on server for this client
                if (!clientSeq || !token) {
                  // fallback to local id
                  const id = `header_${Date.now()}`;
                  if (!deletedHeaderIds.includes(id)) {
                    setStaticWidgetHeaders((prev) => (prev.includes(id) ? prev : [...prev, id]));
                    requestScroll('header');
                  }
                  return;
                }
                try {
                  const formData = new FormData();
                  formData.append("HeaderTitle", "Header");
                  formData.append("clientIdf", clientSeq);
                  formData.append("ReportDate", formatDateLocal(startDate));

                  const resp = await fetch(`${apibaseurl}/api/Header/create`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  });
                  if (resp.ok) {
                    const created = await resp.json();
                    const newId =
                      created.id ||
                      created.headerSeq ||
                      created.headerId ||
                      `header_${Date.now()}`;
                    // don't re-add an id the user deleted in this session
                    if (!deletedHeaderIds.includes(newId)) {
                      setStaticWidgetHeaders((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
                      requestScroll('header');
                    }
                  } else {
                    // fallback local id
                    const id = `header_${Date.now()}`;
                    if (!deletedHeaderIds.includes(id)) {
                      setStaticWidgetHeaders((prev) => (prev.includes(id) ? prev : [...prev, id]));
                      requestScroll('header');
                    }
                  }
                } catch (e) {
                  console.warn("Failed to create header on server", e);
                  const id = `header_${Date.now()}`;
                  if (!deletedHeaderIds.includes(id)) {
                    setStaticWidgetHeaders((prev) => (prev.includes(id) ? prev : [...prev, id]));
                    requestScroll('header');
                  }
                }
              }
              if (key === "csv") {
                // create csv card on server and add returned id
                if (!clientSeq || !token) {
                  const id = `csv_${Date.now()}`;
                  setCsvWidgets((prev) => [...prev, id]);
                  requestScroll('csv');
                  return;
                }
                try {
                  const resp = await fetch(
                    `${apibaseurl}/api/FetchExcelKeyword/create-csv-card`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ clientSeq }),
                    }
                  );
                  if (resp.ok) {
                    const data = await resp.json();
                    // debug log - remove later if not needed
                    console.debug("create-csv-card response", data);
                    // server may return csvCardId at top-level or nested; check common shapes
                    const id =
                      data?.csvCardId ||
                      data?.data?.csvCardId ||
                      data?.data?.cardId ||
                      data?.cardId ||
                      data?.data?._id ||
                      data?.id ||
                      data?._id ||
                      data?.filePath ||
                      data?.data?.filePath;
                    if (id) {
                      setCsvWidgets((prev) => [...prev, id]);
                      requestScroll('csv');
                      return;
                    }
                  }
                  // fallback local id when server didn't return usable id
                  const fallbackId = `csv_${Date.now()}`;
                  setCsvWidgets((prev) => [...prev, fallbackId]);
                  requestScroll('csv');
                } catch (e) {
                  console.warn("Failed to create csv card on server", e);
                  const fallbackId = `csv_${Date.now()}`;
                  setCsvWidgets((prev) => [...prev, fallbackId]);
                  requestScroll('csv');
                }
              }

              // Open Executive Summary editor (moved from header button into Static Widget dropdown)
              if (key === "executive_summary") {
                // reuse existing handler that shows the summary modal/editor
                handleAddSummary();
                return;
              }

              // 👇️ NEW: Add Comments Widget Logic
              if (key === "comments") {
                const newKey = `comment_${Date.now()}`;
                // store simple string key so renderer and child components can use it directly
                setStaticCommentKeys((prev) => [...prev, newKey]);
                console.log(`Adding new comment widget with key: ${newKey}`);
                // ask child to scroll to the newly added comment widget
                requestScroll('comments');
              }

            }}
          />
          <div className={style.rightContent}></div>
          {hasIntegrations ? (
            <ChartPageSecond
              ref={chartsRef}
              propertyid={integrations.propertyId}
              gsC_id={integrations.gsC_id}
              fbPage_Id={integrations.fbPageId}
              gmbAccount_Id={integrations.gmbAccountId}
              gmbLocation_Id={integrations.gmbLocationId}
              insta_Id={integrations.instaId}
              googleAdsCustomerId={integrations.googleAdsCustomerId}
              ytChannelId={integrations.ytChannelId}
              gAdsensePublisherId={integrations.gAdsensePublisherId}
              linkedInUserId={integrations.linkedInUserId}
              shopifyId={integrations.shopifyId}
              startDate={startDate}
              endDate={endDate}
              selectedIntegration={selectedIntegration}
              staticWidgetHeaders={staticWidgetHeaders}
              csvWidgets={csvWidgets}
              onCsvUploadComplete={refreshCsvWidgets}
              onDeleteHeader={(hid) => {
                // remove header id from parent state when child confirms deletion
                setStaticWidgetHeaders((prev) => prev.filter((x) => x !== hid));
                // remember this id as deleted so it doesn't get re-added from server responses
                setDeletedHeaderIds((prev) => (prev.includes(hid) ? prev : [...prev, hid]));
              }}
              onDeleteCsvWidget={async (id) => {
                try {
                  // If this is a local, client-generated placeholder id (e.g. "csv_12345"),
                  // remove it locally without calling the backend. This avoids 500 errors
                  // when backend doesn't know about the placeholder id.
                  const isLocalCsv =
                    typeof id === "string" && id.startsWith("csv_");
                  if (isLocalCsv) {
                    setCsvWidgets((prev) =>
                      prev.filter((x) => (x?.keyword_Seq || x) !== id)
                    );
                    return;
                  }

                  // Pass keywordSeqDto as a query parameter for server-side-created cards
                  const response = await fetch(
                    `${apibaseurl}/api/FetchExcelKeyword/delete?keywordSeqDto=${encodeURIComponent(
                      id
                    )}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (response.ok) {
                    setCsvWidgets((prev) =>
                      prev.filter((x) => (x?.keyword_Seq || x) !== id)
                    );
                  } else {
                    console.error(
                      "Failed to delete CSV card:",
                      response.statusText
                    );
                  }
                } catch (err) {
                  console.error("Error deleting CSV card:", err);
                }
              }}
              ///new comments widget 
              staticCommentKeys={staticCommentKeys}
              onDeleteComment={(keyToDelete) => {
                // remove from parent state and remember as deleted so server responses won't re-add it
                setStaticCommentKeys((prev) => prev.filter((k) => k !== keyToDelete));
                setDeletedHeaderIds((prev) => (prev.includes(keyToDelete) ? prev : [...prev, keyToDelete]));
              }}

              showSummary={showSummary}
              summaryText={summaryText}
              summaryImages={summaryImages}
              onSaveSummary={handleSaveSummary}
              onDeleteSummary={handleDeleteSummary}
            />
          ) : (
            <div className="text-center mt-5">
              <p style={{ fontSize: "21px" }}>
                Go ahead and set up the necessary integrations to unlock your
                reports. Super quick and easy!
              </p>
              <h6>No Integrations Available</h6>
              {role !== "TeamMember" && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/integrations")}
                >
                  Set Up Integrations
                </Button>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
export default DashboardPage;
