import React, { useEffect, useState, useRef } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Alert } from "react-bootstrap";
import { getUserIntegrations } from "./services/IntegrationServices.jsx";
import { GoogleAnalytics4 } from "./hooks/GoogleAnalytics4Api";
import { GoogleMyBusiness } from "./hooks/GoogleMyBusinessApi";
import { GoogleAdsense } from "./hooks/GoogleAdsenseApi.js";
import { GoogleAds } from "./hooks/GoogleAdsApi";
import AvailableIntegrations from "./AvailableIntegration/AvailableIntegrations";
import ConnectedIntegrations from "./ConnectedIntegration/ConnectedIntegrations";
import { GoogleSearchConsole } from "./hooks/GoogleSearchConsole";
import { GoogleTagManager } from "./hooks/GoogleTagManager";
import { FacebookApi } from "./hooks/FacebookApi";
import { InstagramApi } from "./hooks/InstagramApi";
import { useYouTubeIntegration } from "./hooks/YoutubeApi";
import { useLinkedInIntegration } from "./hooks/LinkedInApi";
import { useLocation, useNavigate } from "react-router-dom";
import GA4PropertySelectionModal from "./SelectIdModal/PropertySelectedModal/GA4Modal.jsx";
import GSCPropertySelectionModal from "./SelectIdModal/PropertySelectedModal/GSCModal.jsx";
import GMBPropertySelectionModal from "./SelectIdModal/PropertySelectedModal/GMBModal.jsx";
import FacebookPageSelectionModal from "./SelectIdModal/PropertySelectedModal/FBModal.jsx";
import GoogleAdsAccountModal from "./SelectIdModal/PropertySelectedModal/GAdsModal.jsx";
import YouTubeChannelSelectionModal from "./SelectIdModal/PropertySelectedModal/YoutubeModal.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "./SocialMediaIntegrations.module.css";
import "../../styles/loadingDots.css";
import { getUserRoleFromToken } from "../../utils/Auth";
import { useShopifyIntegration } from "./hooks/ShopifyApi";
import { Modal, Form, Button } from "react-bootstrap";
import LinkedInModal from "./SelectIdModal/PropertySelectedModal/LinkedInModal.jsx";

const ShopifyShopModal = ({ show, onHide, onSubmit }) => {
  const [shop, setShop] = useState("");
  const handleSubmit = () => {
    if (shop) {
      onSubmit(shop);
      onHide();
    } else {
      toast.error("Please enter your Shopify store URL.");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Enter Shopify Store URL</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Store URL (e.g., mystore.myshopify.com)</Form.Label>
            <Form.Control
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value.trim())}
              placeholder="mystore.myshopify.com"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Connect
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default function SocialMediaIntegrations() {
  const location = useLocation();
  const navigate = useNavigate();
  const clientSeqFromState = location.state?.clientSeq;
  const clientSeq =
    clientSeqFromState || localStorage.getItem("selectedClientSeq");

  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState([]);
  const [pendingIntegration, setPendingIntegration] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [gscProperties, setGscProperties] = useState(null);
  const [showGscModal, setShowGscModal] = useState(false);
  const [gmbProperties, setGmbProperties] = useState(null);
  const [showGmbModal, setShowGmbModal] = useState(false);
  const [fbPages, setFbPages] = useState(null);
  const [showFbModal, setShowFbModal] = useState(false);
  const [adsAccounts, setAdsAccounts] = useState(null);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [youTubeChannels, setYouTubeChannels] = useState(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [linkedInPages, setLinkedInPages] = useState(null); // New state for LinkedIn pages
  const [showLinkedInModal, setShowLinkedInModal] = useState(false); // New state for LinkedIn modal

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const googleClientId = import.meta.env.VITE_CLIENT_ID_GA4;
  const [role, setRole] = useState("");

  useEffect(() => {
    const currentToken =
      localStorage.getItem("datoken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);
    }
  }, []);

  const connectedRef = useRef(null);

  const login = GoogleAnalytics4({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setProperties,
  });

  const gmbLogin = GoogleMyBusiness({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setGmbProperties,
  });

  const adsLogin = GoogleAds({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setAdsAccounts,
  });

  const adsenseLogin = GoogleAdsense({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
  });

  const gscLogin = GoogleSearchConsole({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setGscProperties,
  });

  const gtmLogin = GoogleTagManager({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
  });

  const facebookLogin = FacebookApi({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setFbPages,
  });

  const instagramLogin = InstagramApi({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
  });

  const youtubeLogin = useYouTubeIntegration({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setYouTubeChannels,
  });

  const linkedInLogin = useLinkedInIntegration({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
    setLinkedInPages,
    setShowLinkedInModal,
  });

  const shopifyLogin = useShopifyIntegration({
    setConnected,
    setErrorMessage,
    pendingIntegration,
    setPendingIntegration,
    apibaseurl,
    setLoading,
    clientSeq,
  });

  // Ref to store onSelect callback

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token || !clientSeq) {
          setConnected([]);
          return;
        }
        const data = await getUserIntegrations(token, apibaseurl, clientSeq);
        setConnected(data);
      } catch (error) {
        setErrorMessage("Failed to fetch integrations");
        toast.error("Failed to load integrations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apibaseurl, clientSeq]);

  useEffect(() => {
    if (properties) {
      setShowModal(true);
    }
  }, [properties]);

  useEffect(() => {
    if (gscProperties) {
      setShowGscModal(true);
    }
  }, [gscProperties]);

  useEffect(() => {
    if (gmbProperties) {
      setShowGmbModal(true);
    }
  }, [gmbProperties]);

  useEffect(() => {
    if (fbPages) {
      setShowFbModal(true);
    }
  }, [fbPages]);

  useEffect(() => {
    if (adsAccounts) {
      setShowAdsModal(true);
    }
  }, [adsAccounts]);

  useEffect(() => {
    if (youTubeChannels) {
      setShowYouTubeModal(true);
    }
  }, [youTubeChannels]);

  useEffect(() => {
    if (linkedInPages) {
      setShowLinkedInModal(true);
    }
  }, [linkedInPages]);

  const handleAddIntegration = (integration) => {
    setErrorMessage("");
    if (integration.name === "Google Analytics 4") {
      setPendingIntegration(integration);
      login();
    } else if (integration.name === "Google My Business") {
      setPendingIntegration(integration);
      gmbLogin();
    } else if (integration.name === "Google Ads") {
      setPendingIntegration(integration);
      adsLogin();
    } else if (integration.name === "Google Adsense") {
      setPendingIntegration(integration);
      adsenseLogin();
    } else if (integration.name === "Google Search Console") {
      setPendingIntegration(integration);
      gscLogin();
    } else if (integration.name === "Google Tag Manager") {
      setPendingIntegration(integration);
      gtmLogin();
    } else if (integration.name === "Facebook") {
      setPendingIntegration(integration);
      facebookLogin();
    } else if (integration.name === "Instagram") {
      setPendingIntegration(integration);
      instagramLogin();
    } else if (integration.name === "YouTube") {
      setPendingIntegration(integration);
      youtubeLogin();
    } else if (
      integration.name === "LinkedIn" ||
      integration.name === "Linkedin"
    ) {
      setPendingIntegration(integration);
      linkedInLogin();
    } else if (integration.name === "Shopify") {
      setPendingIntegration(integration);
      setShowShopifyModal(true);
    } else {
      if (!connected.find((item) => item.name === integration.name)) {
        setConnected((prev) => [...prev, integration]);
        toast.success(`${integration.name} connected successfully!`);
      }
    }
  };

  const handleRemoveIntegration = async (name) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Cannot remove integration: Please log in again.");
        setConnected((prev) => prev.filter((item) => item.name !== name));
        toast.error("Please log in to remove integrations");
        return;
      }

      const integration = connected.find((item) => item.name === name);
      if (!integration || !integration.email) {
        setErrorMessage(
          `Cannot remove integration: Email not found for ${name}.`
        );
        setConnected((prev) => prev.filter((item) => item.name !== name));
        toast.error(`Email not found for ${name}`);
        return;
      }

      const encodedEmail = encodeURIComponent(integration.email);

      if (name === "Google Analytics 4") {
        const response = await fetch(
          `${apibaseurl}/api/GoogleAnalytics4Api/DeleteAllByEmail?integrationsEmail=${encodedEmail}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Google Analytics 4 integration");
        }
      } else if (name === "Google Search Console") {
        const response = await fetch(
          `${apibaseurl}/api/GoogleSearchConsole/search-console/delete?email=${encodedEmail}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Google Search Console integration");
        }
      } else if (name === "Google My Business") {
        const response = await fetch(
          `${apibaseurl}/api/GoogleMyBusiness/gmb/delete-by-email-client?email=${encodedEmail}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Google My Business integration");
        }
      } else if (name === "Google Adsense") {
        const response = await fetch(
          `${apibaseurl}/api/GoogleAdsenseApi/DeleteAdsense_Detials?email=${encodedEmail}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to remove Google Adsense integration");
        }
      } else if (name === "Google Ads") {
        const response = await fetch(
          `${apibaseurl}/api/GoogleAdsApi/DeleteWhole_Detials?email=${encodedEmail}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Google Ads integration");
        }
      } else if (name === "Instagram") {
        const instaUserId = integration.fbUserId;
        if (!instaUserId) {
          throw new Error("Instagram user ID not found.");
        }

        const response = await fetch(
          `${apibaseurl}/api/FacebookInstagram/Delete?instagramId=${instaUserId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Instagram integration");
        }
      } else if (name === "Facebook") {
        const fbUserId = integration.fbUserId;
        if (!fbUserId) {
          throw new Error("Facebook user ID not found.");
        }

        const response = await fetch(
          `${apibaseurl}/api/FacebookIntegrationsLogin/DeleteIntegration/${fbUserId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Facebook integration");
        }
      } else if (name === "YouTube") {
        const response = await fetch(
          `${apibaseurl}/api/GoogleYouTube/DeleteByEmail?email=${encodedEmail}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove YouTube integration");
        }
      } else if (name === "LinkedIn" || name === "Linkedin") {
        const linkedinUserId = integration.linkedInUserId;
        if (!linkedinUserId) {
          throw new Error("LinkedIn user ID not found.");
        }

        const response = await fetch(
          `${apibaseurl}/api/LinkedInApi/profile/${linkedinUserId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove LinkedIn integration");
        }
      } else if (name === "Shopify") {
        const response = await fetch(
          `${apibaseurl}/api/ShopifyProfileApi/delete/${encodedEmail}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove Shopify integration");
        }
      }

      setConnected((prev) => prev.filter((item) => item.name !== name));
      toast.success(`${name} removed successfully!`);
    } catch (error) {
      console.error("Error removing integration:", error);
      setErrorMessage(
        error.message || "Failed to remove integration. Please try again."
      );
      toast.error(`Failed to remove ${name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (selectedProperty) => {
    setConnected((prev) =>
      prev.map((item) =>
        item.name === "Google Analytics 4"
          ? { ...item, ...selectedProperty }
          : item
      )
    );
    setProperties(null);
    setShowModal(false);
    toast.success("Google Analytics 4 Integrated successfully!");
  };

  const handleSelectFbPage = (selectedPage) => {
    setConnected((prev) =>
      prev.map((item) =>
        item.name === "Facebook" ? { ...item, ...selectedPage } : item
      )
    );
    setFbPages(null);
    setShowFbModal(false);
    toast.success("Facebook Integrated successfully!");
  };

  const handleSelectAccount = (selectedAccount) => {
    setConnected((prev) =>
      prev.map((item) =>
        item.name === "Google Ads" ? { ...item, ...selectedAccount } : item
      )
    );
    setAdsAccounts(null);
    setShowAdsModal(false);
    toast.success("Google Ads Integrated successfully!");
  };

  const handleSelectChannel = (selectedChannel) => {
    setConnected((prev) =>
      prev.map((item) =>
        item.name === "YouTube" ? { ...item, ...selectedChannel } : item
      )
    );
    setYouTubeChannels(null);
    setShowYouTubeModal(false);
    toast.success("YouTube Integrated successfully!");
  };

  const handleSelectLinkedInPage = (selectedPage) => {
    setConnected((prev) =>
      prev.map((item) =>
        item.name === "LinkedIn" ? { ...item, ...selectedPage } : item
      )
    );
    setLinkedInPages(null);
    setShowLinkedInModal(false);
    toast.success("LinkedIn Integrated successfully!");
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className={style.toasterMessage}>
        <ToastContainer />
      </div>
      <div className="container">
        <div className="p-4">
          {loading && (
            <div
              role="status"
              aria-live="polite"
              aria-hidden={!loading}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                pointerEvents: "auto",
                cursor: "default",
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} onClick={(e) => e.stopPropagation()}>
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderWidth: "0.25em",
                  }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Loading</span>
                  <span className="loading-dots" aria-hidden>
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                </div>
              </div>
            </div>
          )}

          <GA4PropertySelectionModal
            show={showModal}
            onHide={() => {
              setShowModal(false);
              setProperties(null);
            }}
            properties={properties}
            onSelectProperty={handleSelectProperty}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            handleRemoveIntegration={handleRemoveIntegration}
          />

          <GSCPropertySelectionModal
            show={showGscModal}
            onHide={() => {
              setShowGscModal(false);
              setGscProperties(null);
            }}
            properties={gscProperties}
            onSelectProperty={(selected) => {
              setConnected((prev) =>
                prev.map((item) =>
                  item.name === "Google Search Console"
                    ? { ...item, ...selected }
                    : item
                )
              );
              setGscProperties(null);
              setShowGscModal(false);
              toast.success("Google Search Console Integrated successfully!");
            }}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            handleRemoveIntegration={handleRemoveIntegration}
          />

          <GMBPropertySelectionModal
            show={showGmbModal}
            onHide={() => {
              setShowGmbModal(false);
              setGmbProperties(null);
            }}
            properties={gmbProperties}
            onSelectProperty={(selected) => {
              setConnected((prev) =>
                prev.map((item) =>
                  item.name === "Google My Business"
                    ? { ...item, ...selected }
                    : item
                )
              );
              setGmbProperties(null);
              setShowGmbModal(false);
              toast.success("Google My Business Integrated successfully!");
            }}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            handleRemoveIntegration={handleRemoveIntegration}
          />

          <FacebookPageSelectionModal
            show={showFbModal}
            onHide={() => {
              setShowFbModal(false);
              setFbPages(null);
            }}
            pages={fbPages}
            onSelectPage={handleSelectFbPage}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
          />

          <GoogleAdsAccountModal
            show={showAdsModal}
            onHide={() => {
              setShowAdsModal(false);
              setAdsAccounts(null);
            }}
            accounts={adsAccounts}
            onSelectAccount={handleSelectAccount}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            handleRemoveIntegration={handleRemoveIntegration}
          />

          <YouTubeChannelSelectionModal
            show={showYouTubeModal}
            onHide={() => {
              setShowYouTubeModal(false);
              setYouTubeChannels(null);
            }}
            channels={youTubeChannels}
            onSelectChannel={handleSelectChannel}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            handleRemoveIntegration={handleRemoveIntegration}
          />

          <LinkedInModal
            show={showLinkedInModal}
            onHide={() => {
              setShowLinkedInModal(false);
              setLinkedInPages(null);
            }}
            pages={linkedInPages}
            onSelectPage={handleSelectLinkedInPage}
            apibaseurl={apibaseurl}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            handleRemoveIntegration={handleRemoveIntegration}
          />

          <ShopifyShopModal
            show={showShopifyModal}
            onHide={() => setShowShopifyModal(false)}
            onSubmit={(shop) => shopifyLogin(shop)}
          />

          <div className="row g-4">
            <div className="col-md-12" ref={connectedRef}>
              <ConnectedIntegrations
                connected={connected}
                handleRemoveIntegration={handleRemoveIntegration}
              />
            </div>

            {connected.length > 0 && role !== "TeamMember" && (
              <div className="col-md-12 text-center">
                <button
                  className="btn"
                  style={{
                    background: "var(--commoncolor)",
                    color: "var(--colorWhite)",
                  }}
                  onClick={() => navigate("/dashboard")}
                >
                  View Dashboard
                </button>
              </div>
            )}

            <div className="col-md-12">
              <AvailableIntegrations
                search={search}
                setSearch={setSearch}
                handleAddIntegration={handleAddIntegration}
                connected={connected}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
