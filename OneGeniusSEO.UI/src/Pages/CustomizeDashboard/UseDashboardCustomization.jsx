import { useState, useEffect } from "react";
import {
  DesktopMaps,
  TotalProfileImpression,
  BusinessInteractions,
} from "../../api/GmbApis";
import {
  SitemapTableApi,
  GoogleOrganicRanking,
  PopularContent,
  SearchClicksGsc,
  PerformanceByDevices,
  SearchClicksGscOneMonth,
  Top5Pages,
  Top5SearchQueries,
  SecurityCheckApi,
} from "../../api/GscChartsApis";
import {
  ConversionRate,
  Traffic,
  Devices,
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
  SessionByDevice,
  AverageEngagement,
  TotalUserMap,
  sessions,
} from "../../api/Ga4Apis";
import { ClicksConversionCost } from "../../api/GoogleAdsReport";
import {
  SubscriberGainsAndLosses,
  statistics,
  channelLifetimeLikes,
  ChannelLikesMonthly,
  engagementByCountry,
} from "../../api/YoutubeApis";
import { GAdsenseReport } from "../../api/GAdsenseReport";
import { LinkedInPageReport } from "../../api/LinkedinApis";
import { ShopifyReports } from "../../api/ShopifyApis";
import {
  FacebookUniqueImpressionApi,
  totalFollowers,
  totalPageLikes,
  totalPost_Like_cmnt_share,
  TopFivePost,
} from "../../api/FacebookApis";
import {
  Follower as InstagramFollower,
  TotalFollowers as InstagramTotalFollowers,
  GetPostsByDateRange as InstagramGetPostsByDateRange,
  GetPostsDetailsByDateRange as InstagramGetPostsDetailsByDateRange,
} from "../../api/InstagramApis";

const useDashboardCustomization = (apibaseurl, token) => {
  // GA4 Charts
  const ga4Charts = [
    ...SessionTable,
    ...DayBydDayUser,
    ...GA4HighLight,
    ...engSessions,
    ...UserEngagementDayByDay,
    ...Traffic,
    ...ConversionRate,
    ...Devices,
    ...activeUser,
    ...newUserDayByDay,
    ...TotalUserByCountry,
    ...TotalUserByCity,
    ...TotalUserByLanguage,
    ...TotalUserByDeviceBrowser,
    ...UserEngagementByCountry,
    ...KeyEventCountry,
    ...TotalPageUsers,
    ...PageViewPerDay,
    ...TrafficSourcePerPage,
    ...SessionByDevice,
    ...engSessionsDevices,
    ...CampaignTable,
    ...BounceRateDevices,
    ...TotalDeviceUsersDayWise,
    ...CountByDevice,
    ...KeyEventsByDevice,
    ...AverageEngagement,
    ...TotalUserMap,
    ...sessions,
  ].map((item) => ({ id: item.id, title: item.title, code: item.code }));

  // GMB Charts
  const gmbCharts = [
    ...DesktopMaps,
    ...TotalProfileImpression,
    ...BusinessInteractions,
  ].map((item) => ({ id: item.id, title: item.title, code: item.code }));

  // GSC Charts
  const gscCharts = [
    ...SitemapTableApi,
    ...GoogleOrganicRanking,
    ...SearchClicksGscOneMonth,
    ...Top5Pages,
    ...Top5SearchQueries,
    ...PopularContent,
    ...SearchClicksGsc,
    ...PerformanceByDevices,
    ...SecurityCheckApi,
  ].map((item) => ({ id: item.id, title: item.title, code: item.code }));

  // Google Ads Charts
  const googleAdsCharts = [...ClicksConversionCost].map((item) => ({
    id: item.id,
    title: item.title,
    code: item.code,
  }));

  // YouTube Charts
  const youtubeCharts = [
    ...SubscriberGainsAndLosses,
    ...statistics,
    ...channelLifetimeLikes,
    ...ChannelLikesMonthly,
    ...engagementByCountry,
  ].map((item) => ({ id: item.id, title: item.title, code: item.code }));

  // Google Adsense Charts
  const gAdsenseCharts = [...GAdsenseReport].map((item) => ({
    id: item.id,
    title: item.title,
    code: item.code,
  }));

  // LinkedIn Charts
  const linkedinCharts = [...LinkedInPageReport].map((item) => ({
    id: item.id,
    title: item.title,
    code: item.code,
  }));

  // Shopify Charts
  const shopifyCharts = [...ShopifyReports].map((item) => ({
    id: item.id,
    title: item.title,
    code: item.code,
  }));

  // Facebook Charts
  const facebookCharts = [
    ...FacebookUniqueImpressionApi,
    ...totalFollowers,
    ...totalPageLikes,
    ...totalPost_Like_cmnt_share,
    ...TopFivePost,
  ].map((item) => ({
    id: item.id,
    title: item.title || item.url,
    code: item.url || item.apiurl || item.title,
  }));

  // Instagram Charts
  const instagramCharts = [
    ...InstagramFollower,
    ...InstagramTotalFollowers,
    ...InstagramGetPostsByDateRange,
    ...InstagramGetPostsDetailsByDateRange,
  ].map((item) => ({
    id: item.id,
    title: item.title || item.url,
    code: item.url || item.apiurl || item.title,
  }));

  // Integration Chart Map
  const integrationChartMap = {
    "Google Analytics 4": ga4Charts,
    "Google My Business": gmbCharts,
    "Google Search Console": gscCharts,
    "Google Ads": googleAdsCharts,
    YouTube: youtubeCharts,
    "Google Adsense": gAdsenseCharts,
    LinkedIn: linkedinCharts,
    Linkedin: linkedinCharts,
    Linkedln: linkedinCharts,
    Shopify: shopifyCharts,
    Facebook: facebookCharts,
    facebook: facebookCharts,
    Instagram: instagramCharts,
    instagram: instagramCharts,
  };

  const [integrationOptions, setIntegrationOptions] = useState([]);
  const [chartConfigurations, setChartConfigurations] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const nullSafeSplit = (value, delimiter = ",") =>
    String(value || "")
      .split(delimiter)
      .map((s) => s.trim())
      .filter(Boolean);

  // const parseMonthApiList = (data) => {
  //   const codes = nullSafeSplit(data?.apiUniqueName);
  //   const dataShowTypes = nullSafeSplit(data?.dataShowType);
  //   const statuses = nullSafeSplit(data?.status);
  //   return codes.map((c, i) => ({
  //     code: c,
  //     dataShowType: dataShowTypes[i] || "chart",
  //     status:
  //       typeof statuses[i] !== "undefined"
  //         ? String(statuses[i]).toLowerCase() === "true"
  //         : undefined,
  //   }));
  // };

  // ✅ FIXED: More accurate parseMonthApiList with proper boolean handling
  const parseMonthApiList = (data) => {
    // If backend returns array (newer format)
    if (Array.isArray(data)) {
      return data
        .filter((item) => item && item.apiUniqueName) // ignore invalid/missing items
        .map((item) => {
          let statusValue = false;

          // Convert status to boolean safely
          if (typeof item.status === "boolean") {
            statusValue = item.status;
          } else if (typeof item.status === "string") {
            statusValue = item.status.toLowerCase() === "true";
          }

          return {
            code: item.apiUniqueName,
            dataShowType: item.dataShowType || "chart",
            status: statusValue,
          };
        });
    }

    // Fallback: old comma-separated backend response format
    const codes = nullSafeSplit(data?.apiUniqueName);
    const dataShowTypes = nullSafeSplit(data?.dataShowType);
    const statuses = nullSafeSplit(data?.status);

    return codes.map((c, i) => {
      let statusValue = false;
      if (typeof statuses[i] !== "undefined") {
        statusValue = String(statuses[i]).toLowerCase() === "true";
      }
      return {
        code: c,
        dataShowType: dataShowTypes[i] || "chart",
        status: statusValue,
      };
    });
  };




  const fetchIntegrations = async (abortController) => {
    if (!token) {
      setErrorMessage("Authentication token missing");
      return;
    }
    try {
      // Fetch Google-family + LinkedIn + Shopify available integrations in parallel
      const [
        integrationResponse,
        linkedinIntegrationResponse,
        shopifyIntegrationResponse,
        facebookIntegrationResponse,
      ] = await Promise.all([
        fetch(`${apibaseurl}/api/UserIntegration`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
        }),
        fetch(`${apibaseurl}/api/LinkedlnUserIntegration`, {
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
        fetch(`${apibaseurl}/api/FacebookUserIntegration`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
        }),
      ]);

      if (
        !integrationResponse.ok &&
        !linkedinIntegrationResponse.ok &&
        !shopifyIntegrationResponse.ok &&
        !facebookIntegrationResponse?.ok
      ) {
        setErrorMessage("Failed to fetch integrations");
        return;
      }

      const integrationData = integrationResponse.ok
        ? await integrationResponse.json()
        : { data: [] };
      const linkedinIntegrationData = linkedinIntegrationResponse.ok
        ? await linkedinIntegrationResponse.json()
        : { data: [] };
      const shopifyIntegrationData = shopifyIntegrationResponse.ok
        ? await shopifyIntegrationResponse.json()
        : { data: [] };
      const facebookIntegrationData = facebookIntegrationResponse?.ok
        ? await facebookIntegrationResponse.json()
        : { data: [] };

      // Treat combinedIntegrations as a raw array of items
      const combinedIntegrations = [
        ...(Array.isArray(integrationData?.data) ? integrationData.data : []),
        ...(Array.isArray(linkedinIntegrationData?.data)
          ? linkedinIntegrationData.data
          : []),
        ...(Array.isArray(shopifyIntegrationData?.data)
          ? shopifyIntegrationData.data
          : []),
        ...(Array.isArray(facebookIntegrationData?.data)
          ? facebookIntegrationData.data
          : []),
      ];

      if (Array.isArray(combinedIntegrations)) {
        const options = combinedIntegrations
          .map((item) => ({
            value: item.projectName,
            label: item.projectName,
          }))
          .filter((option) => integrationChartMap.hasOwnProperty(option.value));
        setIntegrationOptions(options);

        const configs = {};

        // Prepare unchecked arrays and month data holders for each integration
        let uncheckedGmbApis = [],
          uncheckedGscApis = [],
          uncheckedGa4Apis = [],
          uncheckedYoutubeApis = [],
          uncheckedGoogleAdsApis = [],
          uncheckedGAdsenseApis = [],
          uncheckedLinkedinApis = [],
          uncheckedShopifyApis = [],
          uncheckedFacebookApis = [],
          uncheckedInstagramApis = [];

        let gmbMonthData = [],
          ga4MonthData = [],
          gscMonthData = [],
          youtubeMonthData = [],
          googleAdsMonthData = [],
          gAdsenseMonthData = [],
          linkedinMonthData = [],
          shopifyMonthData = [],
          facebookMonthData = [],
          instagramMonthData = [];

        // Fetch all customization GET endpoints in parallel
        const [
          gmbApiResponse,
          gscApiResponse,
          ga4ApiResponse,
          youtubeApiResponse,
          googleAdsApiResponse,
          gAdsenseApiResponse,
          linkedinApiResponse,
          shopifyApiResponse,
          facebookApiResponse,
          instagramApiResponse,
          gmbMonthApiResponse,
          ga4MonthApiResponse,
          gscMonthApiResponse,
          youtubeMonthApiResponse,
          googleAdsMonthApiResponse,
          gAdsenseMonthApiResponse,
          linkedinMonthApiResponse,
          shopifyMonthApiResponse,
          facebookMonthApiResponse,
          instagramMonthApiResponse,
        ] = await Promise.all([
          fetch(`${apibaseurl}/api/GMBCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GSCCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GA4CustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/YoutubeCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GAdsCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GAdsenseCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/LinkedinCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/ShopifyCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/FacebookCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/InstagramCustomizeHideApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GMBCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GA4CustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GSCCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/YoutubeCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GAdsCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/GAdsenseCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/LinkedinCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/ShopifyCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/FacebookCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
          fetch(`${apibaseurl}/api/InstagramCustomizeMonthApiList/get`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }),
        ]);

        // Unchecked (Hide) lists
        if (gmbApiResponse.ok) {
          const data = await gmbApiResponse.json();
          uncheckedGmbApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (gscApiResponse.ok) {
          const data = await gscApiResponse.json();
          uncheckedGscApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (ga4ApiResponse.ok) {
          const data = await ga4ApiResponse.json();
          uncheckedGa4Apis = nullSafeSplit(data?.apiUniqueName);
        }
        if (youtubeApiResponse.ok) {
          const data = await youtubeApiResponse.json();
          uncheckedYoutubeApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (googleAdsApiResponse.ok) {
          const data = await googleAdsApiResponse.json();
          uncheckedGoogleAdsApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (gAdsenseApiResponse.ok) {
          const data = await gAdsenseApiResponse.json();
          uncheckedGAdsenseApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (linkedinApiResponse.ok) {
          const data = await linkedinApiResponse.json();
          uncheckedLinkedinApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (shopifyApiResponse.ok) {
          const data = await shopifyApiResponse.json();
          uncheckedShopifyApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (facebookApiResponse?.ok) {
          const data = await facebookApiResponse.json();
          uncheckedFacebookApis = nullSafeSplit(data?.apiUniqueName);
        }
        if (instagramApiResponse?.ok) {
          const data = await instagramApiResponse.json();
          uncheckedInstagramApis = nullSafeSplit(data?.apiUniqueName);
        }

        // Month lists (with dataShowType + optional status)
        if (gmbMonthApiResponse.ok) {
          const data = await gmbMonthApiResponse.json();
          gmbMonthData = parseMonthApiList(data);
        }
        if (ga4MonthApiResponse.ok) {
          const data = await ga4MonthApiResponse.json();
          ga4MonthData = parseMonthApiList(data);


        }
        if (gscMonthApiResponse.ok) {
          const data = await gscMonthApiResponse.json();
          gscMonthData = parseMonthApiList(data);
        }
        if (youtubeMonthApiResponse.ok) {
          const data = await youtubeMonthApiResponse.json();
          youtubeMonthData = parseMonthApiList(data);
        }
        if (googleAdsMonthApiResponse.ok) {
          const data = await googleAdsMonthApiResponse.json();
          googleAdsMonthData = parseMonthApiList(data);
        }
        if (gAdsenseMonthApiResponse.ok) {
          const data = await gAdsenseMonthApiResponse.json();
          gAdsenseMonthData = parseMonthApiList(data);
        }
        if (linkedinMonthApiResponse.ok) {
          const data = await linkedinMonthApiResponse.json();
          linkedinMonthData = parseMonthApiList(data);
        }
        if (shopifyMonthApiResponse.ok) {
          const data = await shopifyMonthApiResponse.json();
          shopifyMonthData = parseMonthApiList(data);
        }
        if (facebookMonthApiResponse?.ok) {
          const data = await facebookMonthApiResponse.json();
          facebookMonthData = parseMonthApiList(data);
        }
        if (instagramMonthApiResponse?.ok) {
          const data = await instagramMonthApiResponse.json();
          instagramMonthData = parseMonthApiList(data);
        }

        const uncheckedApis = [
          ...uncheckedGmbApis,
          ...uncheckedGscApis,
          ...uncheckedGa4Apis,
          ...uncheckedGoogleAdsApis,
          ...uncheckedYoutubeApis,
          ...uncheckedGAdsenseApis,
          ...uncheckedLinkedinApis,
          ...uncheckedShopifyApis,
          ...uncheckedFacebookApis,
          ...uncheckedInstagramApis,
        ];

        const monthDataMap = {
          "Google My Business": Object.fromEntries(
            gmbMonthData.map((item) => [item.code, item.dataShowType])
          ),
          "Google Analytics 4": Object.fromEntries(
            ga4MonthData.map((item) => [item.code, item.dataShowType])
          ),
          "Google Search Console": Object.fromEntries(
            gscMonthData.map((item) => [item.code, item.dataShowType])
          ),
          "Google Ads": Object.fromEntries(
            googleAdsMonthData.map((item) => [item.code, item.dataShowType])
          ),
          YouTube: Object.fromEntries(
            youtubeMonthData.map((item) => [item.code, item.dataShowType])
          ),
          "Google Adsense": Object.fromEntries(
            gAdsenseMonthData.map((item) => [item.code, item.dataShowType])
          ),
          LinkedIn: Object.fromEntries(
            linkedinMonthData.map((item) => [item.code, item.dataShowType])
          ),
          Shopify: Object.fromEntries(
            shopifyMonthData.map((item) => [item.code, item.dataShowType])
          ),
          Facebook: Object.fromEntries(
            facebookMonthData.map((item) => [item.code, item.dataShowType])
          ),
          facebook: Object.fromEntries(
            facebookMonthData.map((item) => [item.code, item.dataShowType])
          ),
          Instagram: Object.fromEntries(
            instagramMonthData.map((item) => [item.code, item.dataShowType])
          ),
          instagram: Object.fromEntries(
            instagramMonthData.map((item) => [item.code, item.dataShowType])
          ),
        };

        // ENHANCED: More robust computation with proper defaults
        const computeShowComparison = (integration, chartCode) => {
          const list =
            integration === "Google My Business"
              ? gmbMonthData
              : integration === "Google Analytics 4"
                ? ga4MonthData
                : integration === "Google Search Console"
                  ? gscMonthData
                  : integration === "Google Ads"
                    ? googleAdsMonthData
                    : integration === "YouTube"
                      ? youtubeMonthData
                      : integration === "Google Adsense"
                        ? gAdsenseMonthData
                              : integration === "LinkedIn" ||
                          integration === "Linkedin" ||
                          integration === "Linkedln"
                          ? linkedinMonthData
                                : integration === "Shopify"
                            ? shopifyMonthData
                                  : integration === "Facebook" || integration === "facebook"
                                    ? facebookMonthData
                                    : integration === "Instagram" || integration === "instagram"
                                      ? instagramMonthData
                            : [];

          // Find the specific chart configuration
          const hit = list.find((x) => x.code === chartCode);

          // Enhanced logic: if backend provides explicit status, use it; otherwise default to true
          if (hit && typeof hit.status !== "undefined") {
            return Boolean(hit.status);
          }

          // Default to true for charts to ensure they can show comparison
          return true;
        };



        // ENHANCED: Better chart capability detection
        const canShowChartComparison = (integration, chartCode) => {
          // Charts that can show comparison (not table-only)
          const TABLE_ONLY_CODES = ["GA4Api020", "GA4Api052", "GMBApi011"];
          return !TABLE_ONLY_CODES.includes(chartCode);
        };

        const canShowTableComparison = (integration, chartCode) => {
          // All charts can potentially show table comparison
          return true;
        };

        options.forEach((option) => {
          const charts = integrationChartMap[option.value] || [];
          configs[option.value] = {};
          charts.forEach((chart) => {
            const showComparisonValue = computeShowComparison(
              option.value,
              chart.code
            );
            const dataShowTypeValue =
              monthDataMap[option.value]?.[chart.code] || "chart";

            configs[option.value][chart.code] = {
              id: chart.id,
              code: chart.code,
              selected: !uncheckedApis.includes(chart.code),
              showComparison: showComparisonValue,
              dataShowType: dataShowTypeValue,
              // ENHANCED: Add capability flags for better UI logic
              canShowChartComparison: canShowChartComparison(
                option.value,
                chart.code
              ),
              canShowTableComparison: canShowTableComparison(
                option.value,
                chart.code
              ),
            };
          });
        });

        setChartConfigurations(configs);

        // ENHANCED: Debug logging to help identify issues
        console.log("Chart Configurations:", configs);
      } else {
        setErrorMessage("No supported integrations found");
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMessage("Failed to fetch integrations or API statuses");
      console.error("Error fetching integrations:", err);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchIntegrations(abortController);
    return () => abortController.abort();
  }, [apibaseurl, token]);

  const TABLE_ONLY_CODES = ["GA4Api020", "GA4Api052", "GMBApi011"];

  const handleChartToggle = (integration, code) => {
    setChartConfigurations((prev) => {
      const isTableOnly = TABLE_ONLY_CODES.includes(code);
      const wasSelected = prev[integration]?.[code]?.selected || false;

      if (!prev[integration]?.[code]) {
        console.warn(`Chart ${code} not found for integration ${integration}`);
        return prev;
      }

      return {
        ...prev,
        [integration]: {
          ...prev[integration],
          [code]: {
            ...prev[integration][code],
            selected: !wasSelected,
            showComparison: wasSelected
              ? prev[integration][code].showComparison
              : false,
            dataShowType: wasSelected
              ? prev[integration][code].dataShowType
              : isTableOnly
                ? "table"
                : "chart",
          },
        },
      };
    });
  };

  // ENHANCED: More robust showComparison toggle with better error handling
  // const handleShowComparisonToggle = (integration, code) => {
  //   setChartConfigurations((prev) => {
  //     // Validate inputs
  //     if (!prev[integration]) {
  //       console.warn(`Integration ${integration} not found in configurations`);
  //       return prev;
  //     }

  //     const currentChart = prev[integration][code];
  //     if (!currentChart) {
  //       console.warn(`Chart ${code} not found for integration ${integration}`);
  //       return prev;
  //     }

  //     const newShowComparison = !currentChart.showComparison;

  //     console.log(
  //       `Toggling showComparison for ${integration}:${code} from ${currentChart.showComparison} to ${newShowComparison}`
  //     );

  //     // Create completely new state object with proper immutability
  //     const newState = {
  //       ...prev,
  //       [integration]: {
  //         ...prev[integration],
  //         [code]: {
  //           ...currentChart,
  //           showComparison: newShowComparison,
  //           // Enhanced dataShowType logic
  //           dataShowType: newShowComparison
  //             ? currentChart.dataShowType === "table"
  //               ? "table"
  //               : "chart"
  //             : currentChart.dataShowType || "chart",
  //         },
  //       },
  //     };

  //     console.log(`New state for ${code}:`, newState[integration][code]);
  //     return newState;
  //   });
  // };
  const handleShowComparisonToggle = (integration, code) => {
    setChartConfigurations((prev) => {
      const current = prev[integration]?.[code];
      if (!current) return prev;

      const newShowComparison = !current.showComparison;

      // ✅ If unchecked, reset back to single-month "chart" view
      const newDataShowType = newShowComparison
        ? current.dataShowType || "chart"
        : "chart";

      return {
        ...prev,
        [integration]: {
          ...prev[integration],
          [code]: {
            ...current,
            showComparison: newShowComparison,
            dataShowType: newDataShowType,
          },
        },
      };
    });
  };


  const handleSelectAllCharts = (integration, checked) => {
    setChartConfigurations((prev) => {
      if (!prev[integration]) {
        console.warn(`Integration ${integration} not found in configurations`);
        return prev;
      }

      const newConfigurations = { ...prev };
      newConfigurations[integration] = { ...newConfigurations[integration] };

      Object.keys(newConfigurations[integration]).forEach((code) => {
        newConfigurations[integration][code] = {
          ...newConfigurations[integration][code],
          selected: checked,
          showComparison: checked
            ? newConfigurations[integration][code].showComparison
            : false,
          dataShowType: checked
            ? newConfigurations[integration][code].dataShowType
            : "chart",
        };
      });

      return newConfigurations;
    });
  };

  // ENHANCED: More robust select all comparison with better validation
  const handleSelectAllShowComparison = (integration, checked) => {
    setChartConfigurations((prev) => {
      if (!prev[integration]) {
        console.warn(`Integration ${integration} not found in configurations`);
        return prev;
      }

      console.log(
        `Setting all showComparison for ${integration} to ${checked}`
      );

      const newConfigurations = { ...prev };
      newConfigurations[integration] = { ...newConfigurations[integration] };

      Object.keys(newConfigurations[integration]).forEach((code) => {
        const currentChart = newConfigurations[integration][code];

        // Only update selected charts
        if (currentChart.selected) {
          newConfigurations[integration][code] = {
            ...currentChart,
            showComparison: checked,
            // Ensure dataShowType is properly maintained
            dataShowType: checked
              ? currentChart.dataShowType || "chart"
              : currentChart.dataShowType || "chart",
          };
        }
      });

      console.log(
        `Updated configurations for ${integration}:`,
        newConfigurations[integration]
      );
      return newConfigurations;
    });
  };

  const handleTableTypeToggle = (integration, code) => {
    setChartConfigurations((prev) => {
      if (!prev[integration]?.[code]) {
        console.warn(`Chart ${code} not found for integration ${integration}`);
        return prev;
      }

      const current = prev[integration][code];
      const isTable = current.dataShowType === "table";

      return {
        ...prev,
        [integration]: {
          ...prev[integration],
          [code]: {
            ...current,
            dataShowType: isTable ? "chart" : "table",
            showComparison: isTable ? true : false,
          },
        },
      };
    });
  };

  const handleChartTypeToggle = (integration, code) => {
    setChartConfigurations((prev) => {
      if (!prev[integration]?.[code]) {
        console.warn(`Chart ${code} not found for integration ${integration}`);
        return prev;
      }

      const current = prev[integration][code];

      return {
        ...prev,
        [integration]: {
          ...prev[integration],
          [code]: {
            ...current,
            dataShowType: "chart",
          },
        },
      };
    });
  };

  // ENHANCED: Helper function to check if chart comparison should be shown in UI
  const shouldShowChartComparison = (integration, code) => {
    const chart = chartConfigurations[integration]?.[code];
    if (!chart) return false;

    // Only show chart comparison checkbox if:
    // 1. Chart is selected
    // 2. Chart can show chart comparison (not table-only)
    // 3. Chart is not currently set to table mode
    return (
      chart.selected &&
      chart.canShowChartComparison !== false &&
      chart.dataShowType !== "table"
    );
  };

  // ENHANCED: Helper function to check if table comparison should be shown in UI
  const shouldShowTableComparison = (integration, code) => {
    const chart = chartConfigurations[integration]?.[code];
    if (!chart) return false;

    // Only show table comparison checkbox if:
    // 1. Chart is selected
    // 2. Chart can show table comparison
    // 3. Chart is currently set to table mode OR can show tables
    return (
      chart.selected &&
      chart.canShowTableComparison !== false &&
      (chart.dataShowType === "table" || chart.canShowTableComparison)
    );
  };

  const prepareSaveData = () => {
    // Your existing prepareSaveData logic remains the same
    const gmbApiStatuses = Object.values(
      chartConfigurations["Google My Business"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const gmbMonthApiStatuses = Object.values(
      chartConfigurations["Google My Business"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const gscApiStatuses = Object.values(
      chartConfigurations["Google Search Console"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const gscMonthApiStatuses = Object.values(
      chartConfigurations["Google Search Console"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const ga4ApiStatuses = Object.values(
      chartConfigurations["Google Analytics 4"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const ga4MonthApiStatuses = Object.values(
      chartConfigurations["Google Analytics 4"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const googleAdsApiStatuses = Object.values(
      chartConfigurations["Google Ads"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const googleAdsMonthApiStatuses = Object.values(
      chartConfigurations["Google Ads"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const youtubeApiStatuses = Object.values(
      chartConfigurations["YouTube"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const youtubeMonthApiStatuses = Object.values(
      chartConfigurations["YouTube"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const gAdsenseApiStatuses = Object.values(
      chartConfigurations["Google Adsense"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const gAdsenseMonthApiStatuses = Object.values(
      chartConfigurations["Google Adsense"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const linkedinApiStatuses = Object.values(
      chartConfigurations["LinkedIn"] ||
      chartConfigurations["Linkedin"] ||
      chartConfigurations["Linkedln"] ||
      {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const linkedinMonthApiStatuses = Object.values(
      chartConfigurations["LinkedIn"] ||
      chartConfigurations["Linkedin"] ||
      chartConfigurations["Linkedln"] ||
      {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    const shopifyApiStatuses = Object.values(
      chartConfigurations["Shopify"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.selected,
    }));
    const shopifyMonthApiStatuses = Object.values(
      chartConfigurations["Shopify"] || {}
    ).map((chart) => ({
      apiUniqueName: chart.code,
      status: chart.showComparison,
      dataShowType: chart.dataShowType || "chart",
    }));

    return {
      gmbApiStatuses,
      gmbMonthApiStatuses,
      gscApiStatuses,
      gscMonthApiStatuses,
      ga4ApiStatuses,
      ga4MonthApiStatuses,
      googleAdsApiStatuses,
      googleAdsMonthApiStatuses,
      youtubeApiStatuses,
      youtubeMonthApiStatuses,
      gAdsenseApiStatuses,
      gAdsenseMonthApiStatuses,
      linkedinApiStatuses,
      linkedinMonthApiStatuses,
      shopifyApiStatuses,
      shopifyMonthApiStatuses,
    };
  };

  return {
    integrationOptions,
    chartConfigurations,
    errorMessage,
    integrationChartMap,
    handleChartToggle,
    handleShowComparisonToggle,
    handleSelectAllCharts,
    handleSelectAllShowComparison,
    handleTableTypeToggle,
    handleChartTypeToggle,
    prepareSaveData,
    setErrorMessage,
    // ENHANCED: Export helper functions for UI rendering
    shouldShowChartComparison,
    shouldShowTableComparison,
  };
};

export default useDashboardCustomization;
