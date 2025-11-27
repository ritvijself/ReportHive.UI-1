import { useGoogleLogin } from "@react-oauth/google";

export const GoogleAnalytics4 = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setProperties,
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
          projectName: "Google Analytics 4",
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

          const propertiesRes = await fetch(
            `${apibaseurl}/api/GoogleAnalytics4Api/GetByUser`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const propertiesData = await propertiesRes.json();
          if (propertiesRes.ok && propertiesData.length > 0) {

            setProperties(propertiesData);
            setConnected((prev) => [
              ...prev,
              { ...pendingIntegration, email: apiData.email },
            ]);
            setErrorMessage("");
            setPendingIntegration(null);
          } else {
            setErrorMessage("No properties found for this account.");
            setPendingIntegration(null);
          }
        } else {
          setErrorMessage(apiData.message);
          setPendingIntegration(null);
        }
      } catch (err) {
        setErrorMessage("Error connecting the integration.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Google Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: googleScope,
    redirect_uri: window.location.origin,
  });
};