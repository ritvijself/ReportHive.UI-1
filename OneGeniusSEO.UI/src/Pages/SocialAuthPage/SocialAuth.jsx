import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGoogle, FaLinkedin } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import { getUserRoleFromToken } from "../../utils/Auth";
import { toast } from "react-toastify";
import styles from "./SocialAuth.module.css";

const SocialAuth = ({
  mode = "login", // "login" or "signup"
  onSuccess,
  onError,
  className = "",
  buttonStyle = "row", // "row" or "column"
  showLabels = false,
  disabled = false,
}) => {
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    linkedin: false,
  });
  const [socialError, setSocialError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  // Google Authentication
  const googleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSocialLoading({ google: true, linkedin: false });
      setSocialError("");
      try {
        const currentUrl = window.location.href;
        const exchangeRes = await fetch(
          `${apibaseurl}/api/DigitalAgency/exchange_Gcode`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              TokenCode: tokenResponse.code,
            }),
          }
        );

        const data = await exchangeRes.json();
        if (!exchangeRes.ok || !data.isSuccess)
          throw new Error(data.message || `Google ${mode} failed`);

        // Store authentication data
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("username", data.username);
        localStorage.setItem("companyName", data.companyName);

        const role = getUserRoleFromToken(data.token);
        setSocialLoading({ google: false, linkedin: false });

        // Handle success callback or default navigation
        if (onSuccess) {
          onSuccess(data, role);
        } else {
          if (role?.toLowerCase() === "teammember") {
            if (data.tempPassword) navigate("/setteammemberpassword");
            else navigate("/clientdashboard");
          } else if (role?.toLowerCase() === "admin")
            navigate("/admindashboard");
          else navigate("/clientdashboard");
        }
      } catch (err) {
        const errorMessage = err.message || `Google ${mode} failed`;
        setSocialError(errorMessage);
        setSocialLoading({ google: false, linkedin: false });
        if (onError) onError(errorMessage);
        toast.error(errorMessage);
      }
    },
    onError: () => {
      const errorMessage = `Google ${
        mode === "login" ? "Sign-In" : "Sign-Up"
      } Failed. Please try again.`;
      setSocialError(errorMessage);
      setSocialLoading({ google: false, linkedin: false });
      if (onError) onError(errorMessage);
      toast.error(errorMessage);
    },
    flow: "auth-code",
    scope: "openid email profile",
    redirect_uri: window.location.origin,
  });

  // LinkedIn Authentication
  const linkedInAuth = () => {
    setSocialLoading({ google: false, linkedin: true });
    setSocialError("");
    try {
      // Use mode-specific environment variables if available
      const clientId =
        mode === "signup" && import.meta.env.VITE_LINKEDIN_CLIENTID_SIGNUP
          ? import.meta.env.VITE_LINKEDIN_CLIENTID_SIGNUP
          : import.meta.env.VITE_LINKEDIN_CLIENTID_LOGIN;

      const redirectPath =
        mode === "signup" && import.meta.env.VITE_LINKEDIN_REDIRECT_SIGNUP
          ? import.meta.env.VITE_LINKEDIN_REDIRECT_SIGNUP
          : import.meta.env.VITE_LINKEDIN_REDIRECT_LOGIN;

      const redirectUri = window.location.origin + redirectPath;
      const state = Math.random().toString(36).substring(2);
      const scope = import.meta.env.VITE_LINKEDIN_SCOPES_LOGIN;

      // Store state with mode identifier and current page
      localStorage.setItem(`linkedin_${mode}_state`, state);
      localStorage.setItem("linkedin_origin_mode", mode);
      localStorage.setItem("linkedin_origin_path", location.pathname);

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${state}&scope=${encodeURIComponent(scope)}`;

      window.location.href = authUrl;
    } catch (err) {
      const errorMessage = `LinkedIn ${
        mode === "login" ? "Sign-In" : "Sign-Up"
      } Failed`;
      setSocialError(errorMessage);
      setSocialLoading({ google: false, linkedin: false });
      if (onError) onError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Handle LinkedIn callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const originMode = localStorage.getItem("linkedin_origin_mode") || mode;
    const storedState = localStorage.getItem(`linkedin_${originMode}_state`);

    if (code && state && state === storedState) {
      localStorage.removeItem(`linkedin_${originMode}_state`);
      localStorage.removeItem("linkedin_origin_mode");
      localStorage.removeItem("linkedin_origin_path");
      setSocialLoading({ google: false, linkedin: true });
      setSocialError("");

      (async () => {
        try {
          const redirectPath =
            originMode === "signup" &&
            import.meta.env.VITE_LINKEDIN_REDIRECT_SIGNUP
              ? import.meta.env.VITE_LINKEDIN_REDIRECT_SIGNUP
              : import.meta.env.VITE_LINKEDIN_REDIRECT_LOGIN;

          const redirectUri = window.location.origin + redirectPath;

          const response = await fetch(
            `${apibaseurl}/api/DigitalAgency/exchange_Lcode`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code, redirectUri }),
            }
          );

          const data = await response.json();
          if (!response.ok || !data.isSuccess)
            throw new Error(data.message || `LinkedIn ${originMode} failed`);

          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("username", data.username);
          localStorage.setItem("companyName", data.companyName);

          const role = getUserRoleFromToken(data.token);
          setSocialLoading({ google: false, linkedin: false });

          // Clear URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          if (onSuccess) {
            onSuccess(data, role);
          } else {
            if (role?.toLowerCase() === "admin") navigate("/admindashboard");
            else navigate("/clientdashboard");
          }
        } catch (err) {
          const errorMessage = err.message || `LinkedIn ${originMode} failed`;
          setSocialError(errorMessage);
          setSocialLoading({ google: false, linkedin: false });
          if (onError) onError(errorMessage);
          toast.error(errorMessage);
        }
      })();
    }
  }, [navigate, apibaseurl, mode, onSuccess, onError, location.pathname]);

  // Loader component
  const SocialLoader = () => <span className={styles.socialLoader}></span>;

  const buttonClass =
    buttonStyle === "column" ? styles.socialBtnColumn : styles.socialBtn;
  const containerClass =
    buttonStyle === "column" ? styles.socialBtnGroup : styles.socialRow;

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Google Button */}
      <button
        type="button"
        className={buttonClass}
        aria-label={`${mode === "login" ? "Sign in" : "Sign up"} with Google`}
        onClick={() => {
          setSocialLoading({ google: true, linkedin: false });
          setSocialError("");
          googleAuth();
        }}
        disabled={disabled || socialLoading.google || socialLoading.linkedin}
      >
        {socialLoading.google ? (
          <SocialLoader />
        ) : (
          <FaGoogle className={styles.socialIcon} />
        )}
        {showLabels && (
          <span>{mode === "login" ? "Sign in" : "Sign up"} with Google</span>
        )}
      </button>

      {/* LinkedIn Button */}
      <button
        type="button"
        className={buttonClass}
        aria-label={`${mode === "login" ? "Sign in" : "Sign up"} with LinkedIn`}
        onClick={() => linkedInAuth()}
        disabled={disabled || socialLoading.google || socialLoading.linkedin}
      >
        {socialLoading.linkedin ? (
          <SocialLoader />
        ) : (
          <FaLinkedin
            className={styles.socialIcon}
            style={{ color: "#0077b5" }}
          />
        )}
        {showLabels && (
          <span>{mode === "login" ? "Sign in" : "Sign up"} with LinkedIn</span>
        )}
      </button>
    </div>
  );
};

export default SocialAuth;
