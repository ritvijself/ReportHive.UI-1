import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import DateRangePicker from "../../ChartPage/ChartHeader/DatePicker/DatePicker";
import styles from "./DashboardHeaderContent.module.css";
import { MdOutlineFileDownload } from "react-icons/md";
import StaticWidgetActions from "./Static Widget/StaticWidgetAction";
const DashboardHeaderContent = ({
  title,
  startDate,
  endDate,
  onDateChange,
  selectedIntegration,
  setSelectedIntegration,
  onAddSummary,
  onPreviewPdf,
  onExportPdf, //pdf button props
  isExportingPdf, //pdf button props
  onStaticWidgetSelect,
}) => {
  const navigate = useNavigate();
  const [integrationOptions, setIntegrationOptions] = useState([
    { value: "", label: "All Integrations" },
  ]);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // ✅ keep your supported integrations array for reference
  const supportedIntegrations = [
    "Google Analytics 4",
    "Google Search Console",
    "Google My Business",
    "Google Ads",
    "Facebook",
    "YouTube",
    "Instagram",
    "Google Adsense",
    "LinkedIn", // added LinkedIn to list
  ];

  useEffect(() => {
    const abortController = new AbortController();

    const fetchIntegrations = async () => {
      if (!token) {
        setIntegrationOptions([{ value: "", label: "All Integrations" }]);
        return;
      }

      try {
        // ✅ fetch Google + Facebook + LinkedIn integrations in parallel
        const [googleRes, metaRes, linkedinRes, shopifyRes] = await Promise.all(
          [
            fetch(`${apibaseurl}/api/UserIntegration`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: abortController.signal,
            }),
            fetch(`${apibaseurl}/api/FacebookUserIntegration`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: abortController.signal,
            }),
            fetch(`${apibaseurl}/api/LinkedlnUserIntegration`, {
              // ⚠️ check your backend – endpoint spelling must match server route
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: abortController.signal,
            }),
            fetch(`${apibaseurl}/api/ShopifyUserIntegration`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: abortController.signal,
            }),
          ]
        );

        const googleData = googleRes.ok ? await googleRes.json() : { data: [] };
        const metaData = metaRes.ok ? await metaRes.json() : { data: [] };
        const linkedinData = linkedinRes.ok
          ? await linkedinRes.json()
          : { data: [] };
        const shopifyData = shopifyRes.ok
          ? await shopifyRes.json()
          : { data: [] };

        let options = [{ value: "", label: "All Integrations" }];

        let hasAnyIntegration = false;

        // ✅ Google integrations
        if (googleData.isSuccess && Array.isArray(googleData.data)) {
          const googleOptions = googleData.data
            .filter((item) =>
              [
                "Google Analytics 4",
                "Google Search Console",
                "Google My Business",
                "Google Ads",
                "YouTube",
                "Google Adsense",
              ].includes(item.projectName)
            )
            .map((item) => ({
              value: item.projectName,
              label: item.projectName,
            }));

          if (googleOptions.length > 0) hasAnyIntegration = true;

          options = [...options, ...googleOptions];
        }

        // ✅ Facebook integrations
        if (metaData.isSuccess && Array.isArray(metaData.data)) {
          const metaOptions = metaData.data.map((item) => {
            const name =
              item.projectName.charAt(0).toUpperCase() +
              item.projectName.slice(1).toLowerCase();
            return {
              value: name,
              label: name,
            };
          });

          if (metaOptions.length > 0) hasAnyIntegration = true;

          metaOptions.forEach((meta) => {
            if (!options.some((opt) => opt.value === meta.value)) {
              options.push(meta);
            }
          });
        }

        // ✅ LinkedIn integrations
        if (linkedinData.isSuccess && Array.isArray(linkedinData.data)) {
          const linkedinOptions = linkedinData.data.map((item) => {
            const raw = (item.projectName || "").trim();
            const normalized =
              raw === "LinkedIn" || raw === "Linkedin" || raw === "Linkedln"
                ? "LinkedIn"
                : raw;
            return {
              value: normalized,
              label: normalized,
            };
          });

          if (linkedinOptions.length > 0) hasAnyIntegration = true;

          linkedinOptions.forEach((li) => {
            if (!options.some((opt) => opt.value === li.value)) {
              options.push(li);
            }
          });
        }

        // ✅ Shopify integrations
        if (shopifyData.isSuccess && Array.isArray(shopifyData.data)) {
          const shopifyOptions = shopifyData.data.map(() => ({
            value: "Shopify",
            label: "Shopify",
          }));

          if (shopifyOptions.length > 0) hasAnyIntegration = true;

          shopifyOptions.forEach((opt) => {
            if (!options.some((o) => o.value === opt.value)) {
              options.push(opt);
            }
          });
        }

        // ✅ (Optional) You had this commented before for Google Lighthouse
        // if (hasAnyIntegration) {
        //   options.push({
        //     value: "Google Lighthouse",
        //     label: "Google Lighthouse",
        //   });
        // }

        setIntegrationOptions(options);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching integrations:", err);
        setIntegrationOptions([{ value: "", label: "All Integrations" }]);
      }
    };

    fetchIntegrations();
    return () => abortController.abort();
  }, [apibaseurl, token]);

  const handleCustomizeDashboard = () => {
    navigate("/customizedashboard", {
      state: { selectedIntegration, title },
    });
  };
  const handleStaticWidgetSelection = (eventKey) => {
    console.log("Static Widget selected:", eventKey);

    if (onStaticWidgetSelect) {
      onStaticWidgetSelect(eventKey);
    }
  };
  return (
    <div className="p-3 bg-white shadow-sm rounded">
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-md-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={onDateChange}
          />
        </div>

        <div className="col-md-3">
          <Form.Select
            size="sm"
            value={selectedIntegration}
            onChange={(e) => setSelectedIntegration(e.target.value)}
          >
            {integrationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="col-md-5 d-flex gap-2 justify-content-md-end flex-wrap">
          {/* <Button
            variant=""
            size="sm"
            onClick={onPreviewPdf}
            className={`flex-grow-1 flex-md-grow-0 ${styles.addSummaryButton}`}
          >
            Export PDF
          </Button> */}

          {/* pdf button  */}

          <StaticWidgetActions
            onOptionSelect={handleStaticWidgetSelection}
            buttonClassName={`flex-grow-1 flex-md-grow-0 ${styles.addSummaryButton}`}
          />
          <Button
            variant=""
            size="sm"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className={`d-flex align-items-center flex-grow-1 flex-md-grow-0 ${styles.addSummaryButton}`}
          >
            {isExportingPdf ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Generating...
              </span>
            ) : (
              <>
                <MdOutlineFileDownload className="me-2" />
                Export PDF
              </>
            )}
          </Button>
          <Button
            variant=""
            size="sm"
            onClick={handleCustomizeDashboard}
            className={`flex-grow-1 flex-md-grow-0 ${styles.customizeDashboard}`}
          >
            Customize Dashboard
          </Button>
          {/* 'Add Executive Summary' moved into Static Widget dropdown */}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeaderContent;
