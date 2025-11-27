import { useGoogleLogin } from "@react-oauth/google";
export const GoogleMyBusiness = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setGmbProperties,
}) => {
  const googleScope = import.meta.env.VITE_APP_GOOGLE_SCOPES;

  return useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");


        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await userInfoRes.json();

        const integrationLoginRequest = {
          projectName: "Google My Business",
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
      
          const accountsRes = await fetch(
            `${apibaseurl}/api/GoogleMyBusinessLocation/GetLocation`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const accountsData = await accountsRes.json();

      
          setGmbProperties(
            accountsData.data?.map(location => ({
              email: location.gmB_AccountEmail || apiData.email || userInfo.email || "unknown",
              accountNameID: location.gmB_LocationName?.split('/')[1] || "",
              displayName: location.gmB_LocationTitle || "Untitled Location",
              locationName: location.gmB_LocationName?.split('/')[1] || "",
            })) || []
          );

          
          setConnected((prev) => [
            ...prev,
            {
              ...pendingIntegration,
              email: apiData.email || userInfo.email || "unknown"
            },
          ]);

          setErrorMessage("");
          setPendingIntegration(null);
        } else {
          setErrorMessage(apiData.message || "Failed to connect to GMB.");
          setPendingIntegration(null);
        }
      } catch (err) {
        console.error("Google My Business Integration Error:", err);
        setErrorMessage("Error connecting to Google My Business.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Google Business Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: googleScope,
    redirect_uri: window.location.origin,
  });
};
