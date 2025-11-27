import { useGoogleLogin } from "@react-oauth/google";

export const GoogleTagManager = ({
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
          projectName: "Google Tag Manager",
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
          setConnected((prev) => [
            ...prev,
            { ...pendingIntegration, email: data.email },
          ]);
          setErrorMessage("");
          setPendingIntegration(null);
        } else {
          setErrorMessage(data.message || "Failed to connect to GTM.");
          setPendingIntegration(null);
        }
      } catch (err) {
        console.error("Google Tag Manager Integration Error:", err);
        setErrorMessage("Error connecting to Google Tag Manager.");
        setPendingIntegration(null);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Google Tag Manager Login Failed. Please try again.");
      setPendingIntegration(null);
      setLoading(false);
    },
    flow: "auth-code",
    scope: googleScope,
    redirect_uri: window.location.origin,
  });
};
