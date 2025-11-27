import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useShopifyIntegration = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  clientSeq, // Optional, if needed
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle successful Shopify login redirect
  const handleLoginSuccess = async (code, shop) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apibaseurl}/api/ShopifyProfileApi/exchange_code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ code, shop }), // Send shop and code to backend
        }
      );

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        setConnected((prev) => [
          ...prev,
          {
            ...pendingIntegration,
            shop: data.shop || shop,
            email: data.email ?? "",
            profile: data.profile ?? {},
          },
        ]);
        setErrorMessage("");
        toast.success("Shopify connected successfully!");
      } else {
        setErrorMessage(data.message || "Failed to connect Shopify.");
        toast.error(data.message || "Failed to connect Shopify.");
      }
    } catch (err) {
      console.error("Shopify Integration Error:", err);
      setErrorMessage("Error connecting to Shopify.");
      toast.error("Error connecting to Shopify.");
    } finally {
      setPendingIntegration(null);
      setLoading(false);
    }
  };

  // Handle Shopify redirect callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const error = params.get("error") || params.get("error_description");
    if (error) {
      console.error("Shopify OAuth Error:", error);
      setErrorMessage(error);
      setPendingIntegration(null);
      setLoading(false);
      navigate(location.pathname, { replace: true });
      return;
    }

    const code = params.get("code");
    const shop = params.get("shop");
    const state = params.get("state");
    const storedState = localStorage.getItem("Shopify_state");

    if (code && shop && state && state === storedState) {
      localStorage.removeItem("Shopify_state");
      handleLoginSuccess(code, shop);
      navigate(location.pathname, { replace: true }); // Clean URL
    }
  }, [location]);

  // Start Shopify OAuth login flow with user-provided shop
  const login = (shop) => {
    if (!shop) {
      setErrorMessage("Shop URL is required.");
      return;
    }
    setLoading(true);
    const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
    const redirectUri =
      window.location.origin + import.meta.env.VITE_SHOPIFY_REDIRECT_PATH;
    const scope = import.meta.env.VITE_SHOPIFY_SCOPES;
    const state = Math.random().toString(36).substring(7);

    localStorage.setItem("Shopify_state", state);

    // Per-store Shopify OAuth URL
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    window.location.href = authUrl; // Redirect user to Shopify login/authorize
  };

  return login;
};
