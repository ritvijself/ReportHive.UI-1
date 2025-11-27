import { useEffect } from "react";
import { decodeJWT } from "../../../utils/JwtHelper";
import { getIntegrationIcon } from "../services/IntegrationServices";

export const FacebookApi = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
  setFbPages,
}) => {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;

  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      window.FB.getLoginStatus((response) => {
        console.log("Facebook login status:", response.status);
      });
    };

    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, [appId]);

  const login = () => {
    setLoading(true);

    if (!window.FB) {
      setErrorMessage("Facebook SDK not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    window.FB.login(
      function (response) {
        if (response.authResponse) {
          handleLoginSuccess(response.authResponse);
        } else {
          setErrorMessage("Facebook login was cancelled.");
          setLoading(false);
        }
      },
      {
        scope: "public_profile,email,pages_read_engagement",
        return_scopes: true,
      }
    );
  };

  const handleLoginSuccess = async (authResponse) => {
    try {
      const token = localStorage.getItem("token");
      const { User_id: userId } = decodeJWT(token) || {};
      const {
        accessToken,
        expiresIn,
        data_access_expiration_time,
        grantedScopes,
        graphDomain,
        signedRequest,
        userID,
      } = authResponse;

      window.FB.api("/me", { fields: "id,first_name,last_name,email,picture" }, async (userInfo) => {
        if (!userInfo || userInfo.error) {
          setErrorMessage("Failed to fetch Facebook user info.");
          setLoading(false);
          return;
        }

        window.FB.api("/me/accounts", (pagesResponse) => {
          const pages = pagesResponse?.data || [];

          const integrationLoginRequest = {
            email: userInfo.email || "",
            firstName: userInfo.first_name || "",
            lastName: userInfo.last_name || "",
            logoPath: userInfo.picture?.data?.url || "",
            user_Id: userId,
            accessToken,
            refreshToken: "",
            createdDate: new Date().toISOString(),
            updatedDate: null,
            projectName: "Facebook",
            pages: pages.map((p) => ({ id: p.id, name: p.name })),
            fbUserId: userID,
            expiresIn,
            dataAccessExpirationTime: data_access_expiration_time,
            grantedScopes,
            graphDomain,
            signedRequest,
          };

          fetch(`${apibaseurl}/api/FacebookIntegrationsLogin/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(integrationLoginRequest),
          })
            .then((res) => res.json())
            .then((apiData) => {
              if (apiData.isSuccess) {
                fetch(`${apibaseurl}/api/FacebookInsightsPage/getPageByUser`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                  .then((res) => res.json())
                  .then((pageData) => {
                    if (pageData.isSuccess && pageData.data?.length > 0) {
                      setFbPages(pageData.data);
                    }
                  });

                setConnected((prev) => [
                  ...prev,
                  { ...pendingIntegration, name: "Facebook", email: userInfo.email || "", icon: getIntegrationIcon("Facebook") },
                ]);
                setErrorMessage("");
              } else {
                setErrorMessage(apiData.message || "Facebook integration failed.");
              }
              setPendingIntegration(null);
              setLoading(false);
            })
            .catch((err) => {
              setErrorMessage("Failed to save integration.");
              setLoading(false);
            });
        });
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Facebook login failed.");
      setPendingIntegration(null);
      setLoading(false);
    }
  };

  return login;
};
