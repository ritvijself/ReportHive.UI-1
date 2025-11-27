import React from "react";
import {
  FaPinterest,
  FaFacebook,
  FaTiktok,
  FaReddit,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaShopify,
} from "react-icons/fa";
import { SiHomeassistantcommunitystore, SiGoogle } from "react-icons/si";
import {
  SiGoogleanalytics,
  SiMeta,
  SiGoogleadsense,
  SiGoogleads,
} from "react-icons/si";
import "./AvailableIntegrations.css";
import { Container, Row, Col, Form } from "react-bootstrap";

const integrationsData = [
  {
    name: "Google Analytics 4",
    icon: <SiGoogleanalytics className="yellow-icon" />,
  },
  {
    name: "Google Search Console",
    icon: <SiGoogle className="green-icon" />,
  },
  {
    name: "Google My Business",
    icon: <SiHomeassistantcommunitystore className="business-icon" />,
  },
  { name: "Facebook", icon: <FaFacebook className="blue-icon"  />,
   },
  { name: "Instagram", icon: <FaInstagram className="pink-icon" />,

   },
  { name: "Google Ads", icon: <SiGoogleads className="blue-icon" /> },
  {
    name: "Google Adsense",
    icon: <SiGoogleadsense className="yellow-icon" />,
    disabled: true,
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedin className="blue-icon" />,
    disabled: true,
  },
  { name: "YouTube", icon: <FaYoutube className="red-icon" /> },
  {
    name: "Shopify",
    icon: <FaShopify className="green-icon" />,
    disabled: true,
  },

  {
    name: "Google Tag Manager",
    icon: <SiGoogle className="green-icon" />,
    disabled: true,
  },

  {
    name: "Pinterest",
    icon: <FaPinterest className="red-icon" />,
    disabled: true,
  },
  {
    name: "Pinterest Ads",
    icon: <FaPinterest className="red-icon" />,
    disabled: true,
  },

  { name: "TikTok", icon: <FaTiktok className="black-icon" />, disabled: true },
];

export default function AvailableIntegrations({
  search,
  setSearch,
  handleAddIntegration,
  connected,
}) {
  const filteredIntegrations = integrationsData.filter(
    (integration) =>
      !connected.some((conn) => conn.name === integration.name) &&
      integration.name.toLowerCase().includes(search)
  );

  return (
    <Container
      className="available-container p-4 bg-white"
      id="available-integrations"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Available Integrations</h2>
      </div>

      <Form.Control
        type="text"
        placeholder="Search integrations..."
        className="search-box mb-4"
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />

      {filteredIntegrations.length > 0 ? (
        <Row className="integration-list g-3">
          {filteredIntegrations.map((integration, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={4} className="mb-3">
              <div
                className={`d-flex flex-column align-items-center p-3 border rounded ${
                  integration.disabled
                    ? "disabled-integration"
                    : "clickable-integration"
                }`}
                onClick={() => {
                  if (!integration.disabled) handleAddIntegration(integration);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Add ${integration.name} integration`}
                onKeyDown={(e) => {
                  if (
                    !integration.disabled &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    handleAddIntegration(integration);
                  }
                }}
              >
                <div className="integration-icon text-center mb-2">
                  {integration.icon}
                </div>
                <h5 className="integration-name text-center mb-0">
                  {integration.name}
                </h5>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="no-result-item text-center p-4">
          No integrations found
        </div>
      )}
    </Container>
  );
}
