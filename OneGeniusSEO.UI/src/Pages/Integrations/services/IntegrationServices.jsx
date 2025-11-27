// IntegrationServices.jsx
import React from "react";
import {
  FaPinterest,
  FaFacebook,
  FaTiktok,
  FaReddit,
  FaLink,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaShopify,
} from "react-icons/fa";
import { SiHomeassistantcommunitystore, SiGoogle } from "react-icons/si";
import {
  SiGoogleanalytics,
  SiMeta,
  SiGoogleadsense,
  SiGoogleads,
} from "react-icons/si";
import "./IntegrationServices.module.css";

export const getUserIntegrations = async (token, apibaseurl) => {
  try {
    // 1️⃣ Fetch Google integrations
    const googleRes = await fetch(`${apibaseurl}/api/UserIntegration`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!googleRes.ok) {
      throw new Error("Failed to fetch user integrations");
    }

    const googleResult = await googleRes.json();
    const integrationsData = googleResult.data ?? [];

    // 2️⃣ Fetch Facebook integrations
    const fbRes = await fetch(`${apibaseurl}/api/FacebookUserIntegration`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let fbData = [];
    if (fbRes.ok) {
      const fbResult = await fbRes.json();
      fbData = fbResult.data ?? [];
    }

    // 3️⃣ Fetch LinkedIn integrations
    const linkedinRes = await fetch(
      `${apibaseurl}/api/LinkedlnUserIntegration`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    let linkedinData = [];
    if (linkedinRes.ok) {
      const linkedinResult = await linkedinRes.json();
      linkedinData = linkedinResult.data ?? [];
    }

    // 4️⃣ Fetch Shopify integrations (new)
    const shopifyRes = await fetch(`${apibaseurl}/api/ShopifyUserIntegration`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let shopifyData = [];
    if (shopifyRes.ok) {
      const shopifyResult = await shopifyRes.json();
      shopifyData = shopifyResult.data ?? [];
    }

    // 5️⃣ Combine all integration data
    const combinedData = [
      // Google integrations
      ...integrationsData.map((item) => ({
        name: item.projectName,
        email: item.email,
        icon: getIntegrationIcon(item.projectName),
        integrationId: item.id,
        type: "google",
      })),

      // Facebook integrations
      ...fbData.map((item) => {
        const platform =
          item.projectName?.toLowerCase() === "instagram"
            ? "Instagram"
            : "Facebook";
        return {
          name: platform,
          email: item.fullName || item.fbUser_Id,
          icon: getIntegrationIcon(platform),
          fbUserId: item.fbUser_Id,
          integrationId: item.id,
          type: "facebook",
        };
      }),

      // LinkedIn integrations
      ...linkedinData.map((item) => ({
        name: "LinkedIn",
        email: item.email || item.linkedInUserId || item.fullName || "N/A",
        icon: getIntegrationIcon("LinkedIn"),
        linkedInUserId: item.linkedInUserId,
        integrationId: item.id,
        type: "linkedin",
        profileUrl: item.profileUrl,
      })),

      // Shopify integrations (new)
      ...shopifyData.map((item) => ({
        name: "Shopify",
        email: item.email || item.shopifyUserId || item.shopName || "N/A",
        icon: getIntegrationIcon("Shopify"),
        shopifyUserId: item.shopifyUserId, // match your API response key
        integrationId: item.id,
        type: "Shopify",
        shopName: item.shopName,
        shopDomain: item.shopDomain,
      })),
    ];

    return combinedData;
  } catch (error) {
    console.error("Error fetching integrations:", error);
    throw error;
  }
};

// Icons logic
export const getIntegrationIcon = (name) => {
  switch (name) {
    case "Pinterest":
      return <FaPinterest className="red-icon" />;
    case "Pinterest Ads":
      return <FaPinterest className="red-icon" />;
    case "Reddit Ads":
      return <FaReddit className="orange-icon" />;
    case "TikTok":
      return <FaTiktok className="black-icon" />;
    case "Google Analytics 4":
      return <SiGoogleanalytics className="yellow-icon" />;
    case "Google My Business":
      return <SiHomeassistantcommunitystore className="business-icon" />;
    case "Google Ads":
      return <SiGoogleads className="blue-icon" />;
    case "Google Adsense":
      return <SiGoogleadsense className="yellow-icon" />;
    case "Google Search Console":
      return <SiGoogle className="green-icon" />;
    case "Facebook":
      return <FaFacebook className="blue-icon" />;
    case "YouTube":
      return <FaYoutube className="red-icon" />;
    case "Instagram":
      return <FaInstagram className="pink-icon" />;
    case "LinkedIn":
      return <FaLinkedin className="blue-icon" />;
    case "Shopify":
      return <FaShopify className="green-icon" />;
    default:
      return <FaLink />;
  }
};
