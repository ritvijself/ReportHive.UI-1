import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getIntegrationIcon } from "../services/IntegrationServices";

export const useLinkedInIntegration = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setLinkedInPages,
  setShowLinkedInModal,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Exchange LinkedIn code for access_token and fetch pages
  const handleLoginSuccess = async (code) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1️⃣ Exchange code for access token
      const exchangeRes = await fetch(
        `${apibaseurl}/api/LinkedInApi/exchange_code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ code }),
        }
      );

      const exchangeData = await exchangeRes.json();

      if (exchangeRes.ok && exchangeData.isSuccess) {
        // 2️⃣ Fetch LinkedIn pages instead of integrations
        const pagesRes = await fetch(
          `${apibaseurl}/api/LinkedInApi/GetAllPages`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );

        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          const pages = pagesData.pages ?? [];

          setConnected((prev) => [
            ...prev,
            {
              ...pendingIntegration,
              email: exchangeData.email ?? "",
              icon: getIntegrationIcon("LinkedIn"),
            },
          ]);

          if (pages.length === 0) {
            setErrorMessage("No LinkedIn pages found for this account.");
            setConnected((prev) =>
              prev.filter((item) => item.name !== "LinkedIn")
            );
          } else {
            // Map pages to include only page_Seq and linkedInUserId for the modal
            const mappedPages = pages.map((page) => ({
              page_Seq: page.page_Seq,
              linkedInUserId: page.linkedInUserId,
              name: page.name, // Optional: Include name for display in modal
              vanityName: page.vanityName, // Optional: Include for display
              logoUrl: page.logoUrl, // Optional: Include for display
            }));
            setLinkedInPages(mappedPages);
            setShowLinkedInModal(true);
          }
        } else {
          setErrorMessage("Failed to fetch LinkedIn pages.");
        }
      } else {
        setErrorMessage(exchangeData.message || "Failed to connect LinkedIn.");
      }
    } catch (err) {
      console.error("LinkedIn Integration Error:", err);
      setErrorMessage("Error connecting to LinkedIn.");
    } finally {
      setPendingIntegration(null);
      setLoading(false);
    }
  };

  // Handle redirect from LinkedIn OAuth
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      console.error("LinkedIn OAuth Error:", error, errorDescription);
      setErrorMessage(`${error}: ${errorDescription}`);
      setPendingIntegration(null);
      setLoading(false);
      navigate(location.pathname, { replace: true });
      return;
    }

    const code = params.get("code");
    const state = params.get("state");
    const storedState = localStorage.getItem("linkedin_state");

    if (code && state && state === storedState) {
      localStorage.removeItem("linkedin_state");
      handleLoginSuccess(code);
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  // Initiate LinkedIn OAuth flow
  const login = () => {
    setLoading(true);
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = window.location.origin + "/integrations";
    const scope = import.meta.env.VITE_LINKEDIN_SCOPES;
    const state = Math.random().toString(36).substring(7);

    localStorage.setItem("linkedin_state", state);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&state=${state}&prompt=consent`;

    window.location.href = authUrl;
  };

  return login;
};
