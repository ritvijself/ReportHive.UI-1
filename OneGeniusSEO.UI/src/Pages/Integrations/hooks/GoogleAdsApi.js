import { useGoogleLogin } from "@react-oauth/google";

export const GoogleAds = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setAdsAccounts,
}) => {
  const googleScope = import.meta.env.VITE_APP_GOOGLE_SCOPES;

  return useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const integrationLoginRequest = {
          projectName: "Google Ads",
          code: tokenResponse.code,
        };

        const exchangeRes = await fetch(
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

        const exchangeData = await exchangeRes.json();

        if (exchangeData.isSuccess) {
          const accountsRes = await fetch(
            `${apibaseurl}/api/GoogleAdsApi/user`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const accountsData = await accountsRes.json();

          setAdsAccounts(
            accountsData?.data?.map((account) => ({
              email: exchangeData.email,
              accountId: account.customerId,
              displayName: account.displayName,
              customerId: account.customerId,
              customerName: account.customerName,
            })) || []
          );

          setConnected((prev) => [
            ...prev,
            {
              ...pendingIntegration,
              email: exchangeData.email,
            },
          ]);

          setErrorMessage("");
          setPendingIntegration(null);
        } else {
          setErrorMessage(
            exchangeData.message || "Failed to connect Google Ads."
          );
          setPendingIntegration(null);
        }
      } catch (err) {
        console.error("Google Ads Integration Error:", err);
        setErrorMessage("Error connecting to Google Ads.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Google Ads Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: googleScope,
    redirect_uri: window.location.origin,
  });
};
