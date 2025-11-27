import { useGoogleLogin } from "@react-oauth/google";

export const GoogleAdsense = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
}) => {
  const googleScope = import.meta.env.VITE_APP_GOOGLE_SCOPES;

  return useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const integrationLoginRequest = {
          projectName: "Google Adsense",
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
          setConnected((prev) => [
            ...prev,
            { ...pendingIntegration, email: apiData.email },
          ]);
          setErrorMessage("");
          setPendingIntegration(null);
        } else {
          setErrorMessage(apiData.message || "Something went wrong.");
          setPendingIntegration(null);
        }
      } catch (err) {
        console.error("Google Adsense Integration Error:", err);
        setErrorMessage("Error connecting the integration.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Google Adsense Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: googleScope,
    redirect_uri: window.location.origin,
  });
};
