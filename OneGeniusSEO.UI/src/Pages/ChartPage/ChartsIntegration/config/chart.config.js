// Yeh aapke dashboard ke sabhi charts ki master list (single source of truth) hai.
export const CHART_CONFIG = [
  {
    id: "gsc_clicksLineGraph",
    integration: "Google Search Console",
    configKey: "GSCApi007",
  },
  {
    id: "gsc_top5QueriesBar",
    integration: "Google Search Console",
    configKey: "GSCApi005",
  },
  {
    id: "gsc_performanceMetrices",
    integration: "Google Search Console",
    configKey: "GSCApi003",
  },
  {
    id: "gsc_top50QueriesTable",
    integration: "Google Search Console",
    configKey: "GSCApi002",
  },
  {
    id: "gsc_top5pagesProgressBar",
    integration: "Google Search Console",
    configKey: "GSCApi004",
  },
  {
    id: "gsc_top50PagesVisited",
    integration: "Google Search Console",
    configKey: "GSCApi006",
  },
  {
    id: "gsc_performanceDeviceTable",
    integration: "Google Search Console",
    configKey: "GSCApi008",
  },
  {
    id: "gsc_securityIssuesSecurityCheckBox",
    integration: "Google Search Console",
    configKey: "GSCApi009",
  },
  {
    id: "gsc_sitemapTable",
    integration: "Google Search Console",
    configKey: "GSCApi001",
  },

  // --- YouTube ---
  { id: "yt_subscriberTrend", integration: "YouTube", configKey: "YTApi001" },
  { id: "yt_totalViewsCard", integration: "YouTube", configKey: "YTApi002" },
  { id: "yt_totalVideosCard", integration: "YouTube", configKey: "YTApi002" },
  { id: "yt_subscribersCard", integration: "YouTube", configKey: "YTApi002" },
  { id: "yt_likesCard", integration: "YouTube", configKey: "YTApi003" },
  { id: "yt_likesTrend", integration: "YouTube", configKey: "YTApi004" },
  { id: "yt_engagementTable", integration: "YouTube", configKey: "YTApi005" },

  // --- Google Analytics 4 ---

  {
    id: "ga4_conversiondata",
    integration: "Google Analytics 4",
    configKey: "Ga4Api001",
  },
  {
    id: "ga4_channeltable",
    integration: "Google Analytics 4",
    configKey: "Ga4Api002",
  },
  {
    id: "ga4_devicetable1",
    integration: "Google Analytics 4",
    configKey: "Ga4Api003",
  },
  {
    id: "ga4_barchartactiveuser",
    integration: "Google Analytics 4",
    configKey: "Ga4Api004",
  },
  {
    id: "ga4_devicesessionschart1",
    integration: "Google Analytics 4",
    configKey: "Ga4Api005",
  },
  {
    id: "ga4_devivebrowserchart1",
    integration: "Google Analytics 4",
    configKey: "Ga4Api006",
  },
  {
    id: "ga4_linechartga4threemonth",
    integration: "Google Analytics 4",
    configKey: "Ga4Api007",
  },
  {
    id: "ga4_linechartga41",
    integration: "Google Analytics 4",
    configKey: "Ga4Api008",
  },
  {
    id: "ga4_linechartfilledga4",
    integration: "Google Analytics 4",
    configKey: "Ga4Api009",
  },
  {
    id: "ga4_bounceengagementmetricbox",
    integration: "Google Analytics 4",
    configKey: "Ga4Api009",
  },
  {
    id: "ga4_progressbar",
    integration: "Google Analytics 4",
    configKey: "Ga4Api010",
  },
  {
    id: "ga4_progressbar1",
    integration: "Google Analytics 4",
    configKey: "Ga4Api011",
  },
  {
    id: "ga4_language_progress_0",
    integration: "Google Analytics 4",
    configKey: "Ga4Api012",
  },
  {
    id: "ga4_language_progress_1",
    integration: "Google Analytics 4",
    configKey: "Ga4Api012",
  },
  {
    id: "ga4_language_progress_2",
    integration: "Google Analytics 4",
    configKey: "Ga4Api012",
  },
  {
    id: "ga4_progressbar6",
    integration: "Google Analytics 4",
    configKey: "Ga4Api013",
  },
  {
    id: "ga4_devicesessionschart",
    integration: "Google Analytics 4",
    configKey: "Ga4Api013",
  },
  {
    id: "ga4_devicetable",
    integration: "Google Analytics 4",
    configKey: "Ga4Api014",
  },
  {
    id: "ga4_progressbar4",
    integration: "Google Analytics 4",
    configKey: "Ga4Api014",
  },
  {
    id: "ga4_progressbar5",
    integration: "Google Analytics 4",
    configKey: "Ga4Api014",
  },
  {
    id: "ga4_linechartga43",
    integration: "Google Analytics 4",
    configKey: "Ga4Api014",
  },
  {
    id: "ga4_linechartga4",
    integration: "Google Analytics 4",
    configKey: "Ga4Api015",
  },
  {
    id: "ga4_progressbar3",
    integration: "Google Analytics 4",
    configKey: "Ga4Api016",
  },
  {
    id: "ga4_progressbar7",
    integration: "Google Analytics 4",
    configKey: "Ga4Api016",
  },
  {
    id: "ga4_devicebouncebarchart",
    integration: "Google Analytics 4",
    configKey: "Ga4Api017",
  },
  {
    id: "ga4_devivebrowserchart",
    integration: "Google Analytics 4",
    configKey: "Ga4Api018",
  },
  {
    id: "ga4_multilinechartga4",
    integration: "Google Analytics 4",
    configKey: "Ga4Api018",
  },
  {
    id: "ga4_multilinechartga41",
    integration: "Google Analytics 4",
    configKey: "Ga4Api018",
  },
  {
    id: "ga4_contactformchart",
    integration: "Google Analytics 4",
    configKey: "Ga4Api018",
  },
  {
    id: "ga4_worldmapchart",
    integration: "Google Analytics 4",
    configKey: "Ga4Api019",
  },
  {
    id: "ga4_avgengagementbarchart",
    integration: "Google Analytics 4",
    configKey: "Ga4Api020",
  },
  {
    id: "ga4_metricdisplayga4",
    integration: "Google Analytics 4",
    configKey: "Ga4Api021",
  },
  {
    id: "ga4_channelsessiontable",
    integration: "Google Analytics 4",
    configKey: "Ga4Api022",
  },
  {
    id: "ga4_linechartga42",
    integration: "Google Analytics 4",
    configKey: "Ga4Api023",
  },
  {
    id: "ga4_devicetable2",
    integration: "Google Analytics 4",
    configKey: "Ga4Api024",
  },

  // --- Google Ads ---
  {
    id: "gads_summary_cards",
    integration: "Google Ads",
    configKey: "GAdsApi001",
  },
  {
    id: "gads_three_month_trend",
    integration: "Google Ads",
    configKey: "GAdsApi002",
  },
  {
    id: "gads_performance_by_device",
    integration: "Google Ads",
    configKey: "GAdsApi003",
  },
  {
    id: "gads_keyword_performance",
    integration: "Google Ads",
    configKey: "GAdsApi004",
  },
  {
    id: "gads_landing_page_performance",
    integration: "Google Ads",
    configKey: "GAdsApi005",
  },
  {
    id: "gads_campaign_type_performance",
    integration: "Google Ads",
    configKey: "GAdsApi006",
  },
  {
    id: "gads_active_campaign_performance",
    integration: "Google Ads",
    configKey: "GAdsApi007",
  },
  {
    id: "gads_call_performance",
    integration: "Google Ads",
    configKey: "GAdsApi008",
  },

  //-----Google My Business -----
  {
    id: "gmb_pie_platform_device",
    integration: "Google My Business",
    configKey: "GMBApi001",
  },
  {
    id: "gmb_pie_mobile_desktop",
    integration: "Google My Business",
    configKey: "GMBApi002",
  },
  {
    id: "gmb_pie_maps_search",
    integration: "Google My Business",
    configKey: "GMBApi003",
  },
  {
    id: "gmb_impressions_search",
    integration: "Google My Business",
    configKey: "GMBApi004",
  },
  {
    id: "gmb_impressions_maps",
    integration: "Google My Business",
    configKey: "GMBApi005",
  },
  {
    id: "gmb_business_interactions",
    integration: "Google My Business",
    configKey: "GMBApi006",
  },
  {
    id: "gmb_desktop_search",
    integration: "Google My Business",
    configKey: "GMBApi007",
  },
  {
    id: "gmb_mobile_search",
    integration: "Google My Business",
    configKey: "GMBApi008",
  },
  {
    id: "gmb_desktop_maps",
    integration: "Google My Business",
    configKey: "GMBApi009",
  },
  {
    id: "gmb_mobile_maps",
    integration: "Google My Business",
    configKey: "GMBApi010",
  },
  {
    id: "gmb_calls_made",
    integration: "Google My Business",
    configKey: "GMBApi005",
  },
  {
    id: "gmb_direction_requests",
    integration: "Google My Business",
    configKey: "GMBApi006",
  },
  {
    id: "gmb_website_clicks",
    integration: "Google My Business",
    configKey: "GMBApi007",
  },
  //Executive Summary

  //Executive Summary
  {
    id: "executive_summary",
    integration: "General",
    configKey: "ExecSummary001",
  },
];
