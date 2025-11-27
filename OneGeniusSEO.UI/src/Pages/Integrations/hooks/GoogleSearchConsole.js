import { useGoogleLogin } from "@react-oauth/google";
export const GoogleSearchConsole = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setGscProperties,
}) => {
  const googleScope = import.meta.env.VITE_APP_GOOGLE_SCOPES;

  return useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const integrationLoginRequest = {
          projectName: "Google Search Console",
          code: tokenResponse.code,
        };

        const response = await fetch(
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

        const data = await response.json();

        if (data.isSuccess) {
          const siteRes = await fetch(
            `${apibaseurl}/api/GoogleSearchConsole/GetByUser`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const siteData = await siteRes.json();

          
          const userEmail = siteData.datas?.[0]?.verifiedEmail || data.email || "unknown";

          setGscProperties([
            {
              email: userEmail,
              sites: siteData.datas || [],
            },
          ]);


          setConnected((prev) => [
            ...prev,
            { ...pendingIntegration, email: userEmail },
          ]);

          setErrorMessage("");
        } else {
          setErrorMessage(data.message || "Failed to connect to GSC.");
          setPendingIntegration(null);
        }
      } catch (err) {
        console.error("GSC integration error:", err);
        setErrorMessage("Error connecting to Google Search Console.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Google Search Console Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: googleScope,
    redirect_uri: window.location.origin,
  });
};
