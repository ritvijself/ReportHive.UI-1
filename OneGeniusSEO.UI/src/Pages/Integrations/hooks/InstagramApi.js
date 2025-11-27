import { useEffect } from "react";
import { toast } from "react-toastify";
import { decodeJWT } from "../../../utils/JwtHelper";

export const InstagramApi = ({
  setConnected,
  setErrorMessage,
  pendingIntegration,
  setPendingIntegration,
  apibaseurl,
  setLoading,
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

      window.FB.getLoginStatus(function (response) {
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
          console.log("Facebook login success:", response.authResponse);
          handleLoginSuccess(response.authResponse.accessToken);
        } else {
          setErrorMessage("Facebook login was cancelled.");
          setLoading(false);
        }
      },
      {
        scope:
          "instagram_basic,pages_show_list,instagram_manage_insights,pages_read_engagement,business_management",
        return_scopes: true,
      }
    );
  };

  const handleLoginSuccess = async (accessToken) => {
    try {
      const token = localStorage.getItem("token");
      const { User_id: userId } = decodeJWT(token) || {};

      window.FB.api(
        "/me",
        { fields: "id,first_name,last_name,email,picture" },
        async (userInfo) => {
          if (!userInfo || userInfo.error) {
            setErrorMessage("Failed to fetch Facebook user info.");
            setLoading(false);
            return;
          }

          window.FB.api(
            "/me/accounts",
            { fields: "id,name,access_token,instagram_business_account" },
            (pagesResponse) => {
              if (pagesResponse && !pagesResponse.error) {
                const pages = pagesResponse.data || [];
                const instagramAccounts = [];

                pages.forEach((page) => {
                  if (page.instagram_business_account) {
                    instagramAccounts.push({
                      id: page.instagram_business_account.id,
                      name: page.name,
                      pageId: page.id,
                      pageAccessToken: page.access_token,
                    });
                  }
                });

                if (instagramAccounts.length === 0) {
                  const msg =
                    "No Instagram accounts found. Please connect an Instagram account to your Facebook Page first.";
                  setErrorMessage(msg);
                  toast.error(msg, { position: "top-right", autoClose: 5000 });
                  setLoading(false);
                  return;
                }

                const primaryAccount = instagramAccounts[0];

                window.FB.api(
                  `/${primaryAccount.id}`,
                  { fields: "id,username,profile_picture_url,name" },
                  (igResponse) => {
                    if (igResponse && !igResponse.error) {
                      const instaPayload = {
                        instagramId: primaryAccount.id,
                        pageId: primaryAccount.pageId,
                        pageName: primaryAccount.name,
                        pageAccessToken: primaryAccount.pageAccessToken,
                        username: igResponse.username,
                        userId: userId,
                      };

                      fetch(`${apibaseurl}/api/FacebookInstagram/FetchInstaAccount`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(instaPayload),
                      })
                        .then((res) => res.json())
                        .then((apiData) => {
                          if (apiData.isSuccess || apiData.success) {
                            setConnected((prev) => [
                              ...prev,
                              {
                                ...pendingIntegration,
                                name: "Instagram",
                                email: userInfo.email || "",
                                meta: {
                                  username: igResponse.username,
                                },
                              },
                            ]);
                            setErrorMessage("");
                          } else {
                            setErrorMessage(
                              apiData.message || "Instagram integration failed."
                            );
                          }
                          setPendingIntegration(null);
                          setLoading(false);
                        })
                        .catch((err) => {
                          console.error(err);
                          setErrorMessage("Failed to send Instagram data.");
                          setLoading(false);
                        });
                    } else {
                      console.error(
                        "Instagram details error:",
                        igResponse.error
                      );
                      setErrorMessage(
                        "Failed to fetch Instagram account details."
                      );
                      setLoading(false);
                    }
                  }
                );
              } else {
                console.error("Pages fetch error:", pagesResponse.error);
                setErrorMessage(
                  "Failed to fetch connected Pages. Make sure you have a Facebook Page with a connected Instagram account."
                );
                setLoading(false);
              }
            }
          );
        }
      );
    } catch (err) {
      console.error(err);
      setErrorMessage("Instagram login failed.");
      setPendingIntegration(null);
      setLoading(false);
    }
  };

  return login;
};
