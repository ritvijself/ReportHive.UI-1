import { useGoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

// Updated useYouTubeIntegration Hook
export const useYouTubeIntegration = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setYouTubeChannels, // New prop to set YouTube channels
}) => {
  const youtubeScope = import.meta.env.VITE_APP_GOOGLE_SCOPES;

  return useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch user info to get email
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await userInfoRes.json();

        // Exchange code for integration
        const integrationLoginRequest = {
          projectName: "YouTube",
          code: tokenResponse.code,
        };

        const apiRes = await fetch(
          `${apibaseurl}/api/IntegrationsLogin/exchange_code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(integrationLoginRequest),
          }
        );

        const apiData = await apiRes.json();

        if (apiData.isSuccess) {
          // Fetch YouTube channels
          const channelsRes = await fetch(
            `${apibaseurl}/api/GoogleYouTube/GetAccountByUser`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const channelsData = await channelsRes.json();

          if (channelsData.isSuccess) {
            setYouTubeChannels(
              channelsData?.data?.map((channel) => ({
                email: userInfo.email || apiData.email,
                channelId: channel.gyT_ChannelID,
                channelName: channel.gyT_ChannelName,
                channelDescription: channel.gyT_ChannelDescription,
              })) || []
            );

            setConnected((prev) => [
              ...prev,
              {
                ...pendingIntegration,
                email: userInfo.email || apiData.email,
              },
            ]);
            setErrorMessage("");
            setPendingIntegration(null);
          } else {
            setErrorMessage(
              channelsData.message || "Failed to fetch YouTube channels."
            );
            setPendingIntegration(null);
          }
        } else {
          setErrorMessage(apiData.message || "Failed to connect YouTube.");
          setPendingIntegration(null);
        }
      } catch (err) {
        console.error("YouTube Integration Error:", err);
        setErrorMessage("Error connecting to YouTube.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("YouTube Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: youtubeScope,
    redirect_uri: window.location.origin,
  });
};
