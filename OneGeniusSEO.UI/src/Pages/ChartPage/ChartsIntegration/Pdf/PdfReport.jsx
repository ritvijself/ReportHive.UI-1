import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    // backgroundColor: '#FFFFFF',
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 50,
    objectFit: "contain",
  },
  titleContainer: {
    textAlign: "center",
    marginBottom: 15,
    borderBottom: "2px solid #eeeeee",
    paddingBottom: 15,
  },
  clientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  website: {
    fontSize: 12,
    color: "#555555",
    marginTop: 5,
  },
  reportDate: {
    fontSize: 14,
    color: "#333333",
    marginTop: 12,
  },
  sectionHeader: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  sectionSubHeaderText: {
    fontSize: 10,
    color: "grey",
    marginTop: 4,
  },
  linkSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  linkItem: {
    fontSize: 4,
    color: "#1a0dab",
    marginBottom: 4,
  },
  linkItemText: {
    fontSize: 10,
    color: "#1a0dab",
  },
  chartImage: {
    width: "100%",
    height: "auto",
    marginBottom: 10,
  },
  manualChartContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },

  column: {
    width: "48%", // 50% se thoda kam taaki beech me gap rahe
  },
  manualChartTitle: {
    fontSize: 8,
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#333",
  },

  //////
  linkCard: {
    backgroundColor: "#F0F4F8", // Halki neeli background
    borderLeftWidth: 3,
    borderLeftColor: "#4A90E2", // Accent color border
    padding: 8,
    marginBottom: 5,
    borderRadius: 3,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bulletPoint: {
    fontSize: 10,
    marginRight: 5,
    color: "#4A90E2",
  },
  linkTextStyled: {
    fontSize: 4,
    color: "#1a0dab",
    textDecoration: "underline", // Link ko underline karega
  },
  // ===== Row & Column Styles for Layout =====
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15, // Gap between rows
    flexWrap: "wrap", // new gmb issue
  },
  col12: { width: "100%" },
  col6: { width: "48%" },
  col4: { width: "31%" },
  col_half: { width: "48%" }, // 50% width jaisa, gap ke liye
  col_quarter: { width: "24%" }, // 25% width jaisa, gap ke liye
});

// Helper function to check for valid image data
const isValidImageData = (imageData) => {
  return imageData && imageData !== "data:," && imageData.length > 100;
};

const PdfReport = ({ documentProps }) => {
  if (!documentProps) {
    return null;
  }

  const { clientName, websiteAddress, reportDate, agencyLogo, clientLogo } =
    documentProps;
  const labelSummaryLinks = Array.isArray(documentProps.labelSummaryLinks)
    ? documentProps.labelSummaryLinks
    : [];

  const getLinkTitle = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return (
      item.title || item.name || item.label || item.text || item.url || "Link"
    );
  };
  const getLinkUrl = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.url || item.link || item.href || "";
  };

  const gscChartIds = [
    "gsc_clicksLineGraph",
    "gsc_top5QueriesBar",
    "gsc_performanceMetrices",
    "gsc_top50QueriesTable",
    "gsc_top5pagesProgressBar",
    "gsc_top50PagesVisited",
    "gsc_performanceDeviceTable",
    "gsc_securityIssuesSecurityCheckBox",
    "gsc_sitemapTable",
  ];

  const ytChartIds = [
    "yt_subscriberTrend",
    "yt_totalViewsCard",
    "yt_totalVideosCard",
    "yt_subscribersCard",
    "yt_likesCard",
    "yt_likesTrend",
    "yt_engagementTable",
  ];

  const ga4ChartIds = [
    "ga4_conversiondata",
    "ga4_channeltable",
    "ga4_devicetable1",
    "ga4_barchartactiveuser",
    "ga4_devicesessionschart1",
    "ga4_devivebrowserchart1",
    "ga4_linechartga4threemonth",
    "ga4_linechartga41",
    "ga4_linechartfilledga4",
    "ga4_bounceengagementmetricbox",
    "ga4_progressbar",
    "ga4_progressbar1",
    "ga4_progressbar2",
    "ga4_progressbar6",
    "ga4_devicesessionschart",
    "ga4_devicetable",
    "ga4_progressbar4",
    "ga4_progressbar5",
    "ga4_linechartga43",
    "ga4_linechartga4",
    "ga4_progressbar3",
    "ga4_progressbar7",
    "ga4_devicebouncebarchart",
    "ga4_devivebrowserchart",
    "ga4_multilinechartga4",
    "ga4_multilinechartga41",
    "ga4_contactformchart",
    "ga4_worldmapchart",
    "ga4_avgengagementbarchart",
    "ga4_metricdisplayga4",
    "ga4_channelsessiontable",
    "ga4_linechartga42",
    "ga4_devicetable2",
  ];

  const gadsChartIds = [
    "gads_summary_cards",
    "gads_three_month_trend",
    "gads_performance_by_device",
    "gads_keyword_performance",
    "gads_landing_page_performance",
    "gads_campaign_type_performance",
    "gads_active_campaign_performance",
    "gads_call_performance",
  ];
  const gmbChartIds = [
    "gmb_pie_platform_device",
    "gmb_pie_mobile_desktop",
    "gmb_pie_maps_search",
    "gmb_impressions_search",
    "gmb_impressions_maps",
    "gmb_business_interactions",
    "gmb_desktop_search",
    "gmb_mobile_search",
    "gmb_desktop_maps",
    "gmb_mobile_maps",
    "gmb_calls_made",
    "gmb_direction_requests",
    "gmb_website_clicks",
  ];

  // Baki sections ke liye helper function
  const isSectionVisible = (chartIds) => {
    return chartIds.some(
      (id) =>
        documentProps[`show_${id}`] === true &&
        isValidImageData(documentProps[id])
    );
  };
  const isChartVisible = (id) =>
    documentProps[`show_${id}`] && isValidImageData(documentProps[id]);
  //visibility check
  const anyGscVisible = isSectionVisible(gscChartIds);
  const anyYtVisible = isSectionVisible(ytChartIds);
  const anyGa4Visible = isSectionVisible(ga4ChartIds);
  const anyGadsVisible = isSectionVisible(gadsChartIds);
  const anyGmbVisible = isSectionVisible(gmbChartIds);

  // Visibility check waise hi rahega
  const isChannelTableVisible =
    documentProps.show_ga4_channelsessiontable === true &&
    isValidImageData(documentProps.ga4_channelsessiontable);
  const isTrendChartVisible =
    documentProps.show_ga4_linechartga4threemonth === true &&
    isValidImageData(documentProps.ga4_linechartga4threemonth);

  // ===== YAHAN NAYI IDs AUR CHECKS ADD KAREIN (AGAR ZAROORAT HO) =====
  // Zaroori nahi hai, lekin saaf code ke liye accha hai
  const generalChartIds = ["executive_summary"];
  const anySummaryVisible = isSectionVisible(generalChartIds);

  // ===== GMB Charts ki visibility pehle se check kar lein =====
  // GMB Charts ki visibility pehle se check kar lein
  const visibleGmbCharts = {
    pie1:
      documentProps.show_gmb_pie_platform_device === true &&
      isValidImageData(documentProps.gmb_pie_platform_device),
    pie2:
      documentProps.show_gmb_pie_mobile_desktop === true &&
      isValidImageData(documentProps.gmb_pie_mobile_desktop),
    pie3:
      documentProps.show_gmb_pie_maps_search === true &&
      isValidImageData(documentProps.gmb_pie_maps_search),
    imp1:
      documentProps.show_gmb_impressions_search === true &&
      isValidImageData(documentProps.gmb_impressions_search),
    imp2:
      documentProps.show_gmb_impressions_maps === true &&
      isValidImageData(documentProps.gmb_impressions_maps),
    interactions:
      documentProps.show_gmb_business_interactions === true &&
      isValidImageData(documentProps.gmb_business_interactions),
    breakdown1:
      documentProps.show_gmb_desktop_search === true &&
      isValidImageData(documentProps.gmb_desktop_search),
    breakdown2:
      documentProps.show_gmb_mobile_search === true &&
      isValidImageData(documentProps.gmb_mobile_search),
    breakdown3:
      documentProps.show_gmb_desktop_maps === true &&
      isValidImageData(documentProps.gmb_desktop_maps),
    breakdown4:
      documentProps.show_gmb_mobile_maps === true &&
      isValidImageData(documentProps.gmb_mobile_maps),
    calls:
      documentProps.show_gmb_calls_made === true &&
      isValidImageData(documentProps.gmb_calls_made),
    directions:
      documentProps.show_gmb_direction_requests === true &&
      isValidImageData(documentProps.gmb_direction_requests),
    websiteClicks:
      documentProps.show_gmb_website_clicks === true &&
      isValidImageData(documentProps.gmb_website_clicks),
  };

  // Helper to count visible charts in a group
  const countVisible = (charts) => charts.filter((c) => c).length;

  // Helper to count visible charts in a group
  // const countVisible = (charts) => charts.filter(c => c).length;

  const visiblePies = countVisible([
    visibleGmbCharts.pie1,
    visibleGmbCharts.pie2,
    visibleGmbCharts.pie3,
  ]);
  const visibleImpressions = countVisible([
    visibleGmbCharts.imp1,
    visibleGmbCharts.imp2,
  ]);
  const visibleBreakdown1 = countVisible([
    visibleGmbCharts.breakdown1,
    visibleGmbCharts.breakdown2,
  ]);
  const visibleBreakdown2 = countVisible([
    visibleGmbCharts.breakdown3,
    visibleGmbCharts.breakdown4,
  ]);
  const visibleInteractionBars = countVisible([
    visibleGmbCharts.calls,
    visibleGmbCharts.directions,
    visibleGmbCharts.websiteClicks,
  ]);

  // ===== NEW: GA4 Charts ki visibility pehle se check kar lein =====
  const visibleGa4Charts = {
    channelSessionTable: isChartVisible("ga4_channelsessiontable"),
    threeMonthTrend: isChartVisible("ga4_linechartga4threemonth"),
    metricDisplay: isChartVisible("ga4_metricdisplayga4"),
    lineChart: isChartVisible("ga4_linechartga4"),
    filledLineChart: isChartVisible("ga4_linechartfilledga4"),
    channelTable: isChartVisible("ga4_channeltable"),
    activeUsers: isChartVisible("ga4_barchartactiveuser"),
    newUsers: isChartVisible("ga4_linechartga41"),
    avgEngagement: isChartVisible("ga4_avgengagementbarchart"),
    bounceBox: isChartVisible("ga4_bounceengagementmetricbox"),
    conversions: isChartVisible("ga4_conversiondata"),
    campaignTable: isChartVisible("ga4_devicetable"),
    worldMap: isChartVisible("ga4_worldmapchart"),
    countryProgress: isChartVisible("ga4_progressbar"),
    cityProgress: isChartVisible("ga4_progressbar1"),
    languageProgress: isChartVisible("ga4_progressbar2"),
    userEngagementCountry: isChartVisible("ga4_progressbar6"),
    keyEventCountry: isChartVisible("ga4_devicesessionschart"),
    deviceBrowser: isChartVisible("ga4_devivebrowserchart"),
    deviceSessions: isChartVisible("ga4_devicesessionschart1"),
    engProgress1: isChartVisible("ga4_progressbar3"),
    engProgress2: isChartVisible("ga4_progressbar7"),
    deviceBounce: isChartVisible("ga4_devicebouncebarchart"),
    multiLine1: isChartVisible("ga4_multilinechartga4"),
    multiLine2: isChartVisible("ga4_multilinechartga41"),
    deviceBrowser2: isChartVisible("ga4_devivebrowserchart1"),
    contactForm: isChartVisible("ga4_contactformchart"),
    deviceTable1: isChartVisible("ga4_devicetable1"),
    sessionsLine: isChartVisible("ga4_linechartga42"),
    pageUsersProgress: isChartVisible("ga4_progressbar4"),
    pageViewsProgress: isChartVisible("ga4_progressbar5"),
    pageViewDay: isChartVisible("ga4_linechartga43"),
    pageTrafficTable: isChartVisible("ga4_devicetable2"),
  };

  // ===== NEW: GA4 visibility counts =====
  const ga4Row1 = countVisible([
    visibleGa4Charts.channelSessionTable,
    visibleGa4Charts.threeMonthTrend,
  ]);
  const ga4Row2 = countVisible([
    visibleGa4Charts.lineChart,
    visibleGa4Charts.filledLineChart,
  ]);
  const ga4Row3 = countVisible([
    visibleGa4Charts.activeUsers,
    visibleGa4Charts.newUsers,
  ]);
  const ga4Row5 = countVisible([
    visibleGa4Charts.worldMap,
    visibleGa4Charts.countryProgress,
    visibleGa4Charts.cityProgress,
  ]);
  const ga4Row6 = countVisible([
    visibleGa4Charts.userEngagementCountry,
    visibleGa4Charts.keyEventCountry,
  ]);
  const ga4Row7 = countVisible([
    visibleGa4Charts.deviceSessions,
    visibleGa4Charts.engProgress1,
    visibleGa4Charts.engProgress2,
  ]);
  const ga4Row8 = countVisible([
    visibleGa4Charts.deviceBounce,
    visibleGa4Charts.multiLine1,
  ]);
  const ga4Row9 = countVisible([
    visibleGa4Charts.multiLine2,
    visibleGa4Charts.deviceBrowser2,
    visibleGa4Charts.contactForm,
  ]);
  const ga4Row10 = countVisible([
    visibleGa4Charts.sessionsLine,
    visibleGa4Charts.pageUsersProgress,
  ]);
  const ga4Row11 = countVisible([
    visibleGa4Charts.pageViewsProgress,
    visibleGa4Charts.pageViewDay,
  ]);

  // heading common
  // Add this with your other visibility constants (like anyGscVisible, etc.)
  const anyEngagementVisible =
    visibleGa4Charts.lineChart ||
    visibleGa4Charts.filledLineChart ||
    visibleGa4Charts.activeUsers ||
    visibleGa4Charts.newUsers ||
    visibleGa4Charts.avgEngagement ||
    visibleGa4Charts.bounceBox ||
    visibleGa4Charts.conversions;

  const anyAudienceVisible =
    isChartVisible("ga4_worldmapchart") ||
    visibleGa4Charts.countryProgress ||
    visibleGa4Charts.cityProgress ||
    isChartVisible("ga4_language_progress_0") ||
    isChartVisible("ga4_language_progress_1") ||
    isChartVisible("ga4_language_progress_2") ||
    isChartVisible("ga4_progressbar6") ||
    isChartVisible("ga4_devicesessionschart") ||
    visibleGa4Charts.languageProgress ||
    visibleGa4Charts.deviceBrowser;

  const anyDeviceVisible =
    visibleGa4Charts.deviceSessions ||
    visibleGa4Charts.engProgress1 ||
    visibleGa4Charts.engProgress2 ||
    visibleGa4Charts.deviceBounce ||
    visibleGa4Charts.multiLine1 ||
    isChartVisible("ga4_devicetable1") ||
    visibleGa4Charts.multiLine2 ||
    visibleGa4Charts.deviceBrowser2 ||
    visibleGa4Charts.contactForm;

  const anyPagesVisible =
    visibleGa4Charts.sessionsLine ||
    visibleGa4Charts.pageUsersProgress ||
    visibleGa4Charts.pageViewsProgress ||
    visibleGa4Charts.pageViewDay ||
    visibleGa4Charts.pageTrafficTable;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Section 1: Header (Logos and Title) */}
        <View style={styles.header}>
          {isValidImageData(agencyLogo) && (
            <Image style={styles.logo} src={agencyLogo} />
          )}
          {isValidImageData(clientLogo) && (
            <Image style={styles.logo} src={clientLogo} />
          )}
        </View>
        <View style={styles.titleContainer}>
          {clientName && <Text style={styles.clientName}>{clientName}</Text>}
          {websiteAddress && (
            <Text style={styles.website}>({websiteAddress})</Text>
          )}
          {reportDate && (
            <Text style={styles.reportDate}>Monthly Report - {reportDate}</Text>
          )}
        </View>
        {/* Executive Summary Image */}
        {documentProps.show_executive_summary === true &&
          isValidImageData(documentProps.executive_summary) && (
            <View style={{ marginTop: 15 }}>
              <Image
                style={styles.chartImage}
                src={documentProps.executive_summary}
              />
            </View>
          )}
        {/* ===== YAHAN PURANE LINK CODE KO IS NAYE TABLE SE REPLACE KIYA GAYA HAI ===== */}
        {labelSummaryLinks.length > 0 && (
          <View style={styles.linkListContainer}>
            {/* Heading */}
            <Text
              style={{
                fontSize: 8,
                fontFamily: "Helvetica-Bold",
                marginBottom: 8,
              }}
            >
              Important Links
            </Text>

            {/* Numbered List */}
            {labelSummaryLinks.map((item, index) => {
              const url = getLinkUrl(item);
              const title = getLinkTitle(item);
              return url ? (
                <Text key={index} style={styles.linkListItem}>
                  {/* Numbering ke liye index + 1 */}
                  <Text
                    style={{
                      fontFamily: "Helvetica",
                      fontSize: 8, // <-- Font size yahan se badlein
                    }}
                  >
                    {index + 1}. {title}:{" "}
                  </Text>
                  {/* Link ka Part */}
                  <Link src={url}>
                    <Text
                      style={{
                        color: "blue",
                        textDecoration: "underline",
                        fontSize: 8, // <-- LINK URL ka size yahan se badlein
                      }}
                    >
                      {url}
                    </Text>
                  </Link>
                </Text>
              ) : null;
            })}
          </View>
        )}
        {/* Section 2: Google Search Console (FULLY MANUAL with 9 charts)   */}
        {anyGscVisible && (
          <View style={styles.sectionHeader} break>
            <Text style={styles.sectionHeaderText}>
              Website Monitoring and Performance
            </Text>
            <Text style={styles.sectionSubHeaderText}>
              (Data Source - Google Search Console)
            </Text>
          </View>
        )}
        {/* Chart 1: Performance Metrices */}
        {documentProps.show_gsc_performanceMetrices &&
          isValidImageData(documentProps.gsc_performanceMetrices) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_performanceMetrices}
              />
            </View>
          )}
        {/* Chart 2: Clicks Line Graph */}
        {documentProps.show_gsc_clicksLineGraph &&
          isValidImageData(documentProps.gsc_clicksLineGraph) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_clicksLineGraph}
              />
            </View>
          )}
        {/* Chart 3: Top 5 Queries Bar Chart */}
        {documentProps.show_gsc_top5QueriesBar &&
          isValidImageData(documentProps.gsc_top5QueriesBar) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_top5QueriesBar}
              />
            </View>
          )}
        {/* Chart 4: Top 5 Pages Progress Bar */}
        {documentProps.show_gsc_top5pagesProgressBar &&
          isValidImageData(documentProps.gsc_top5pagesProgressBar) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_top5pagesProgressBar}
              />
            </View>
          )}
        {/* Chart 5: Performance by Device Table */}
        {documentProps.show_gsc_performanceDeviceTable &&
          isValidImageData(documentProps.gsc_performanceDeviceTable) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_performanceDeviceTable}
              />
            </View>
          )}
        {/* Chart 6: Top 50 Queries Table */}
        {documentProps.show_gsc_top50QueriesTable &&
          isValidImageData(documentProps.gsc_top50QueriesTable) && (
            <View break>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_top50QueriesTable}
              />
            </View>
          )}
        {/* Chart 7: Top 50 Pages Visited Table */}
        {documentProps.show_gsc_top50PagesVisited &&
          isValidImageData(documentProps.gsc_top50PagesVisited) && (
            <View break>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_top50PagesVisited}
              />
            </View>
          )}
        {/* Chart 8: Sitemap Table */}
        {documentProps.show_gsc_sitemapTable &&
          isValidImageData(documentProps.gsc_sitemapTable) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_sitemapTable}
              />
            </View>
          )}
        {/* Chart 9: Security Issues Checkbox/Status */}
        {documentProps.show_gsc_securityIssuesSecurityCheckBox &&
          isValidImageData(
            documentProps.gsc_securityIssuesSecurityCheckBox
          ) && (
            <View style={styles.manualChartContainer}>
              <Image
                style={styles.chartImage}
                src={documentProps.gsc_securityIssuesSecurityCheckBox}
              />
            </View>
          )}
        {/* ===== CHANGE: Poora YouTube section manual banaya gaya hai ===== */}
        {/* Section 3: YouTube (Manual) */}
        {anyYtVisible && (
          <View style={styles.sectionHeader} break>
            <Text style={styles.sectionHeaderText}>YouTube Report</Text>
            <Text style={styles.sectionSubHeaderText}>
              (Data Source - YouTube)
            </Text>
          </View>
        )}
        {documentProps.show_yt_subscriberTrend === true &&
          isValidImageData(documentProps.yt_subscriberTrend) && (
            <View>
              <Text style={styles.manualChartTitle}>Subscriber Trend</Text>
              <Image
                style={styles.chartImage}
                src={documentProps.yt_subscriberTrend}
              />
            </View>
          )}
        {documentProps.show_yt_totalViewsCard === true &&
          isValidImageData(documentProps.yt_totalViewsCard) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.yt_totalViewsCard}
              />
            </View>
          )}
        {documentProps.show_yt_totalVideosCard === true &&
          isValidImageData(documentProps.yt_totalVideosCard) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.yt_totalVideosCard}
              />
            </View>
          )}
        {documentProps.show_yt_subscribersCard === true &&
          isValidImageData(documentProps.yt_subscribersCard) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.yt_subscribersCard}
              />
            </View>
          )}
        {documentProps.show_yt_likesCard === true &&
          isValidImageData(documentProps.yt_likesCard) && (
            <View>
              <Image
                style={styles.chartImage}
                src={documentProps.yt_likesCard}
              />
            </View>
          )}
        {documentProps.show_yt_engagementTable === true &&
          isValidImageData(documentProps.yt_engagementTable) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>Engagement by Country</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.yt_engagementTable}
              />
            </View>
          )}
        {documentProps.show_yt_likesTrend === true &&
          isValidImageData(documentProps.yt_likesTrend) && (
            <View break>
              {/* <Text style={styles.manualChartTitle}>Likes Trend</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.yt_likesTrend}
              />
            </View>
          )}
        {/* ================================================================= */}
        {/* Section 4: Google Analytics 4 (NEW ORGANIZED LAYOUT)          */}
        {/* ================================================================= */}
        {anyGa4Visible && (
          <View style={styles.sectionHeader} break>
            <Text style={styles.sectionHeaderText}>
              Website Traffic Overview
            </Text>
            <Text style={styles.sectionSubHeaderText}>
              (Data Source - Google Analytics 4)
            </Text>
          </View>
        )}
        {/* --- Traffic Overview --- */}
        {ga4Row1 > 0 && (
          <View style={styles.row}>
            {visibleGa4Charts.channelSessionTable && (
              <View style={ga4Row1 === 1 ? styles.col12 : styles.col6}>
                {/* <Text style={styles.manualChartTitle}>Sessions by Channel</Text> */}
                <Image
                  style={styles.chartImage}
                  src={documentProps.ga4_channelsessiontable}
                />
              </View>
            )}
            {visibleGa4Charts.threeMonthTrend && (
              <View style={ga4Row1 === 1 ? styles.col12 : styles.col6}>
                {/* <Text style={styles.manualChartTitle}>3-Month User Trend</Text> */}
                <Image
                  style={styles.chartImage}
                  src={documentProps.ga4_linechartga4threemonth}
                />
              </View>
            )}
          </View>
        )}
        {visibleGa4Charts.metricDisplay && (
          <View style={styles.row}>
            <View style={styles.col12}>
              {/* <Text style={styles.manualChartTitle}>Key Metrics Overview</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_metricdisplayga4}
              />
            </View>
          </View>
        )}
        {visibleGa4Charts.channelTable && (
          <View style={styles.row}>
            <View style={styles.col12}>
              {/* <Text style={styles.manualChartTitle}>Traffic by Channel</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_channeltable}
              />
            </View>
          </View>
        )}
        {/* /heading start/ */}
        {/* --- Engagement & Conversions --- */}
        {/* Show heading only if any chart in this section is visible */}
        {anyEngagementVisible && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Conversion</Text>
          </View>
        )}
        {/* Row 1 */}
        {ga4Row2 > 0 && (
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.lineChart && (
                <View style={ga4Row2 === 1 ? styles.col12 : styles.col6}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_linechartga4}
                  />
                </View>
              )}
              {visibleGa4Charts.filledLineChart && (
                <View style={ga4Row2 === 1 ? styles.col12 : styles.col6}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_linechartfilledga4}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {/* Row 2 */}
        {(visibleGa4Charts.activeUsers || visibleGa4Charts.newUsers) && (
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.activeUsers && (
                <View style={styles.col6}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_barchartactiveuser}
                  />
                </View>
              )}
              {visibleGa4Charts.newUsers && (
                <View style={styles.col6}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_linechartga41}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {/* Row 3 */}
        {(visibleGa4Charts.avgEngagement ||
          visibleGa4Charts.bounceBox ||
          visibleGa4Charts.conversions) && (
          <View wrap={false}>
            <View style={styles.row}>
              {/* Left Column */}
              {visibleGa4Charts.avgEngagement && (
                <View style={{ width: "65%" }}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_avgengagementbarchart}
                  />
                </View>
              )}
              {/* Right Column */}
              {(visibleGa4Charts.bounceBox || visibleGa4Charts.conversions) && (
                <View style={{ width: "31%" }}>
                  {visibleGa4Charts.bounceBox && (
                    <View>
                      <Image
                        style={styles.chartImage}
                        src={documentProps.ga4_bounceengagementmetricbox}
                      />
                    </View>
                  )}
                  {visibleGa4Charts.conversions && (
                    <View>
                      <Image
                        style={styles.chartImage}
                        src={documentProps.ga4_conversiondata}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
        {/* /heading end/ */}
        {visibleGa4Charts.campaignTable && (
          <View style={styles.row}>
            <View style={styles.col12}>
              {/* <Text style={styles.manualChartTitle}>Campaign Performance</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_devicetable}
              />
            </View>
          </View>
        )}
        {/* Heading start -2 Where your Vistors are Located */}
        {/* --- Audience / Location Section --- */}
        {/* Show heading only if any chart in this section is visible */}
        {anyAudienceVisible && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              Where Your Visitors Are Located
            </Text>
          </View>
        )}
        <View style={styles.row} wrap={false}>
          {/* Chart 1: World Map (Bada Size) */}
          {isChartVisible("ga4_worldmapchart") && (
            <View style={styles.col_half}>
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_worldmapchart}
              />
            </View>
          )}

          {/* Chart 2: Top Countries (Chota Size) */}
          {visibleGa4Charts.countryProgress && (
            <View style={styles.col_quarter}>
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_progressbar}
              />
            </View>
          )}

          {/* Chart 3: Top Cities (Chota Size) */}
          {visibleGa4Charts.cityProgress && (
            <View style={styles.col_quarter}>
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_progressbar1}
              />
            </View>
          )}
        </View>
        {(isChartVisible("ga4_language_progress_0") ||
          isChartVisible("ga4_language_progress_1") ||
          isChartVisible("ga4_language_progress_2") ||
          isChartVisible("ga4_progressbar6") ||
          isChartVisible("ga4_devicesessionschart")) && (
          // This parent View ensures the entire row stays together on a page break
          <View wrap={false}>
            <View style={styles.row}>
              {/* ===== COLUMN 1: Language Charts (Stacked Vertically) ===== */}
              <View style={styles.col4}>
                {isChartVisible("ga4_language_progress_0") && (
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_language_progress_0}
                  />
                )}
                {isChartVisible("ga4_language_progress_1") && (
                  <Image
                    style={{ ...styles.chartImage, marginTop: 4 }}
                    src={documentProps.ga4_language_progress_1}
                  />
                )}
                {isChartVisible("ga4_language_progress_2") && (
                  <Image
                    style={{ ...styles.chartImage, marginTop: 4 }}
                    src={documentProps.ga4_language_progress_2}
                  />
                )}
              </View>

              {/* ===== COLUMN 2: User Engagement by Country Chart ===== */}
              <View style={styles.col4}>
                {isChartVisible("ga4_progressbar6") && (
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_progressbar6}
                  />
                )}
              </View>

              {/* ===== COLUMN 3: Key Events by Country Chart ===== */}
              <View style={styles.col4}>
                {isChartVisible("ga4_devicesessionschart") && (
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_devicesessionschart}
                  />
                )}
              </View>
            </View>
          </View>
        )}
        {(visibleGa4Charts.languageProgress ||
          visibleGa4Charts.deviceBrowser) && (
          <View wrap={false}>
            {/* ===== Chart 1: Users by Language (Full Width) ===== */}
            {visibleGa4Charts.languageProgress && (
              <View style={styles.row}>
                <View style={styles.col12}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_progressbar2}
                  />
                </View>
              </View>
            )}

            {/* ===== Chart 2: Users by Device & Browser (Full Width) ===== */}
            {visibleGa4Charts.deviceBrowser && (
              <View style={styles.row}>
                <View style={styles.col12}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_devivebrowserchart}
                  />
                </View>
              </View>
            )}
          </View>
        )}
        {/* heading -2 finish */}
        {/* Heading Three Start Devices */}
        {/* --- Devices Section --- */}
        {/* Show heading only if any chart in this section is visible */}
        {anyDeviceVisible && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Devices</Text>
          </View>
        )}
        {ga4Row7 > 0 && (
          // This parent View will keep the entire row together
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.deviceSessions && (
                <View
                  style={
                    ga4Row7 === 1
                      ? styles.col12
                      : ga4Row7 === 2
                      ? styles.col6
                      : styles.col4
                  }
                >
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_devicesessionschart1}
                  />
                </View>
              )}

              {visibleGa4Charts.engProgress1 && (
                <View
                  style={
                    ga4Row7 === 1
                      ? styles.col12
                      : ga4Row7 === 2
                      ? styles.col6
                      : styles.col4
                  }
                >
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_progressbar3}
                  />
                </View>
              )}

              {visibleGa4Charts.engProgress2 && (
                <View
                  style={
                    ga4Row7 === 1
                      ? styles.col12
                      : ga4Row7 === 2
                      ? styles.col6
                      : styles.col4
                  }
                >
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_progressbar7}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {ga4Row8 > 0 && (
          // This parent View keeps the row from splitting across a page
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.deviceBounce && (
                <View style={ga4Row8 === 1 ? styles.col12 : styles.col6}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_devicebouncebarchart}
                  />
                </View>
              )}

              {visibleGa4Charts.multiLine1 && (
                <View style={ga4Row8 === 1 ? styles.col12 : styles.col6}>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_multilinechartga4}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {isChartVisible("ga4_devicetable1") && (
          <View style={styles.row}>
            <View style={styles.col12}>
              {/* <Text style={styles.manualChartTitle}>Device Category Details</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_devicetable1}
              />
            </View>
          </View>
        )}
        {ga4Row9 > 0 && (
          // This parent View will keep the entire row together
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.multiLine2 && (
                <View
                  style={
                    ga4Row9 === 1
                      ? styles.col12
                      : ga4Row9 === 2
                      ? styles.col6
                      : styles.col4
                  }
                >
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_multilinechartga41}
                  />
                </View>
              )}

              {visibleGa4Charts.deviceBrowser2 && (
                <View
                  style={
                    ga4Row9 === 1
                      ? styles.col12
                      : ga4Row9 === 2
                      ? styles.col6
                      : styles.col4
                  }
                >
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_devivebrowserchart1}
                  />
                </View>
              )}

              {visibleGa4Charts.contactForm && (
                <View
                  style={
                    ga4Row9 === 1
                      ? styles.col12
                      : ga4Row9 === 2
                      ? styles.col6
                      : styles.col4
                  }
                >
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_contactformchart}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {/* Website Pages Accessed by The User Heading Start */}
        {/* --- Pages & Screens Section --- */}
        {/* Show heading only if any chart in this section is visible */}
        {anyPagesVisible && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              Website Pages Accessed By The User
            </Text>
          </View>
        )}
        {ga4Row10 > 0 && (
          // This parent View keeps the row from splitting across a page
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.sessionsLine && (
                <View style={ga4Row10 === 1 ? styles.col12 : styles.col6}>
                  {/* <Text style={styles.manualChartTitle}>Sessions Trend</Text> */}
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_linechartga42}
                  />
                </View>
              )}

              {visibleGa4Charts.pageUsersProgress && (
                <View style={ga4Row10 === 1 ? styles.col12 : styles.col6}>
                  {/* <Text style={styles.manualChartTitle}>Users by Page</Text> */}
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_progressbar4}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {ga4Row11 > 0 && (
          // This parent View keeps the row from splitting across a page
          <View wrap={false}>
            <View style={styles.row}>
              {visibleGa4Charts.pageViewsProgress && (
                <View style={ga4Row11 === 1 ? styles.col12 : styles.col6}>
                  <Text style={styles.manualChartTitle}>
                    Views by Page Title
                  </Text>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_progressbar5}
                  />
                </View>
              )}

              {visibleGa4Charts.pageViewDay && (
                <View style={ga4Row11 === 1 ? styles.col12 : styles.col6}>
                  <Text style={styles.manualChartTitle}>Views by Day</Text>
                  <Image
                    style={styles.chartImage}
                    src={documentProps.ga4_linechartga43}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {visibleGa4Charts.pageTrafficTable && (
          <View style={styles.row}>
            <View style={styles.col12}>
              {/* <Text style={styles.manualChartTitle}>Traffic Source by Page</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.ga4_devicetable2}
              />
            </View>
          </View>
        )}
        {/* ================================================================= */}
        {/* Section 5: Google Ads (FULLY MANUAL)                            */}
        {/* ================================================================= */}
        {anyGadsVisible && (
          <View style={styles.sectionHeader} break>
            <Text style={styles.sectionHeaderText}>Paid Marketing Report</Text>
            <Text style={styles.sectionSubHeaderText}>
              (Data Source - Google Ads)
            </Text>
          </View>
        )}
        {documentProps.show_gads_summary_cards === true &&
          isValidImageData(documentProps.gads_summary_cards) && (
            <View>
              <Text style={styles.manualChartTitle}>
                Campaign Performance Overview
              </Text>
              <Image
                style={styles.chartImage}
                src={documentProps.gads_summary_cards}
              />
            </View>
          )}
        {documentProps.show_gads_three_month_trend === true &&
          isValidImageData(documentProps.gads_three_month_trend) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>3-Month Cost & Conversion Trend</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_three_month_trend}
              />
            </View>
          )}
        {documentProps.show_gads_performance_by_device === true &&
          isValidImageData(documentProps.gads_performance_by_device) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>Performance by Device</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_performance_by_device}
              />
            </View>
          )}
        {documentProps.show_gads_keyword_performance === true &&
          isValidImageData(documentProps.gads_keyword_performance) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>Keyword Performance</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_keyword_performance}
              />
            </View>
          )}
        {documentProps.show_gads_landing_page_performance === true &&
          isValidImageData(documentProps.gads_landing_page_performance) && (
            <View break>
              {/* <Text style={styles.manualChartTitle}>Landing Page Performance</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_landing_page_performance}
              />
            </View>
          )}
        {documentProps.show_gads_campaign_type_performance === true &&
          isValidImageData(documentProps.gads_campaign_type_performance) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>Performance by Campaign Type</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_campaign_type_performance}
              />
            </View>
          )}
        {documentProps.show_gads_active_campaign_performance === true &&
          isValidImageData(documentProps.gads_active_campaign_performance) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>Active Campaign Performance</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_active_campaign_performance}
              />
            </View>
          )}
        {documentProps.show_gads_call_performance === true &&
          isValidImageData(documentProps.gads_call_performance) && (
            <View>
              {/* <Text style={styles.manualChartTitle}>Call Performance</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gads_call_performance}
              />
            </View>
          )}
        {/* ================================================================= */}
        {/* Section: Google My Business (Row/Column Layout)                 */}
        {/* ================================================================= */}
        {anyGmbVisible && (
          <View style={styles.sectionHeader} break>
            <Text style={styles.sectionHeaderText}>Local SEO Report</Text>
            <Text style={styles.sectionSubHeaderText}>
              (Data Source - Google My Business)
            </Text>
          </View>
        )}
        {/* Row 1: Three Pie Charts (Smart Layout & No Page Break) */}
        <View wrap={false}>
          <View style={styles.row}>
            {visibleGmbCharts.pie1 && (
              <View
                style={
                  visiblePies === 1
                    ? styles.col12
                    : visiblePies === 2
                    ? styles.col6
                    : styles.col4
                }
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_pie_platform_device}
                />
              </View>
            )}

            {visibleGmbCharts.pie2 && (
              <View
                style={
                  visiblePies === 1
                    ? styles.col12
                    : visiblePies === 2
                    ? styles.col6
                    : styles.col4
                }
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_pie_mobile_desktop}
                />
              </View>
            )}

            {visibleGmbCharts.pie3 && (
              <View
                style={
                  visiblePies === 1
                    ? styles.col12
                    : visiblePies === 2
                    ? styles.col6
                    : styles.col4
                }
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_pie_maps_search}
                />
              </View>
            )}
          </View>
        </View>
        {/* Row 2: Two Impression Bar Charts (No Page Break) */}
        <View wrap={false}>
          <View style={styles.row}>
            {visibleGmbCharts.imp1 && (
              <View
                style={visibleImpressions === 1 ? styles.col12 : styles.col6}
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_impressions_search}
                />
              </View>
            )}

            {visibleGmbCharts.imp2 && (
              <View
                style={visibleImpressions === 1 ? styles.col12 : styles.col6}
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_impressions_maps}
                />
              </View>
            )}
          </View>
        </View>
        {/* Row 3: Business Interactions (Full Width) */}
        {visibleGmbCharts.interactions && (
          <View style={styles.row}>
            <View style={styles.col12}>
              {/* <Text style={styles.manualChartTitle}>Business Interactions</Text> */}
              <Image
                style={styles.chartImage}
                src={documentProps.gmb_business_interactions}
              />
            </View>
          </View>
        )}
        // This parent View keeps the row from splitting across a page
        <View wrap={false}>
          <View style={styles.row}>
            {visibleGmbCharts.breakdown3 && (
              <View
                style={visibleBreakdown2 === 1 ? styles.col12 : styles.col6}
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_desktop_maps}
                />
              </View>
            )}

            {visibleGmbCharts.breakdown4 && (
              <View
                style={visibleBreakdown2 === 1 ? styles.col12 : styles.col6}
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_mobile_maps}
                />
              </View>
            )}
          </View>
        </View>
        <View wrap={false}>
          <View style={styles.row}>
            {visibleGmbCharts.breakdown3 && (
              <View
                style={visibleBreakdown2 === 1 ? styles.col12 : styles.col6}
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_desktop_maps}
                />
              </View>
            )}

            {visibleGmbCharts.breakdown4 && (
              <View
                style={visibleBreakdown2 === 1 ? styles.col12 : styles.col6}
              >
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_mobile_maps}
                />
              </View>
            )}
          </View>
        </View>
        {/* Row 6: Interaction Bar Charts (Calls, Directions, Website Clicks) - UPDATED */}
        {(visibleGmbCharts.calls ||
          visibleGmbCharts.directions ||
          visibleGmbCharts.websiteClicks) && (
          <View style={styles.row}>
            {visibleGmbCharts.calls && (
              <View style={styles.col6}>
                {/* <Text style={styles.manualChartTitle}>Calls made from GBP</Text> */}
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_calls_made}
                />
              </View>
            )}
            {visibleGmbCharts.directions && (
              <View style={styles.col6}>
                {/* <Text style={styles.manualChartTitle}>GBP Direction Requests</Text> */}
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_direction_requests}
                />
              </View>
            )}
            {visibleGmbCharts.websiteClicks && (
              <View style={styles.col6}>
                {/* <Text style={styles.manualChartTitle}>GBP Website Clicks</Text> */}
                <Image
                  style={styles.chartImage}
                  src={documentProps.gmb_website_clicks}
                />
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PdfReport;
