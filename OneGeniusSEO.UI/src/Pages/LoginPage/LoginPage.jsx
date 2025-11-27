import React, { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserRoleFromToken } from "../../utils/Auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SocialAuth from "../SocialAuthPage/SocialAuth";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();

  useEffect(() => {
    if (location.state?.signupSuccess) {
      toast.success(location.state.signupSuccess, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const validate = (values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!values.email) errors.email = "Please enter a valid email address.";
    else if (!emailRegex.test(values.email))
      errors.email = "Invalid email format";

    if (!values.password) errors.password = "Please enter a valid password.";

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${apibaseurl}/api/DigitalAgency/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!response.ok || !data.isSuccess)
          throw new Error("Invalid email or password.");

        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("username", data.username);
        localStorage.setItem("companyName", data.companyName);

        const role = getUserRoleFromToken(data.token);
        if (role?.toLowerCase() === "teammember") {
          if (data.tempPassword) navigate("/setteammemberpassword");
          else navigate("/clientdashboard");
        } else if (role?.toLowerCase() === "admin") navigate("/admindashboard");
        else navigate("/clientdashboard");
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit:
            error.message === "Invalid email or password."
              ? error.message
              : "Something went wrong. Please try again later.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Social auth success handler
  const handleSocialSuccess = (data, role) => {
    if (role?.toLowerCase() === "teammember") {
      if (data.tempPassword) navigate("/setteammemberpassword");
      else navigate("/clientdashboard");
    } else if (role?.toLowerCase() === "admin") navigate("/admindashboard");
    else navigate("/clientdashboard");
  };

  // Social auth error handler
  const handleSocialError = (errorMessage) => {
    console.error("Social auth error:", errorMessage);
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.formContainer}>
        <div className={styles.logo}>
          <img
            src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
            alt="1GeniusSEO Logo"
            className={styles.logoImg}
          />
          <div className={styles.logoText}>
            <span className={styles.logoBrand}>
              1Genius<span style={{ fontWeight: 400 }}>SEO</span>
            </span>
          </div>
        </div>
        <div className={styles.welcomeText}>Sign in to your account</div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`${styles.input} ${
              errors.email && touched.email ? styles.inputError : ""
            }`}
            autoComplete="username"
          />
          {errors.email && touched.email && (
            <span className={styles.error}>{errors.email}</span>
          )}

          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`${styles.input} ${
                errors.password && touched.password ? styles.inputError : ""
              }`}
              autoComplete="current-password"
            />
            <span
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
              role="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                togglePasswordVisibility()
              }
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && touched.password && (
            <span className={styles.error}>{errors.password}</span>
          )}

          <div className={styles.optionsRow}>
            <label className={styles.rememberMe}>
              <input type="checkbox" style={{ marginRight: 6 }} disabled />
              Remember me
            </label>
            <span
              className={styles.forgotPassword}
              onClick={() => navigate("/forgetpassword")}
              role="button"
              tabIndex={0}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Log In"}
          </button>
          {errors.submit && (
            <span className={styles.error}>{errors.submit}</span>
          )}
        </form>

        <div className={styles.orDivider}>
          <span>or continue with</span>
        </div>

        {/* Social Authentication Component */}
        <SocialAuth
          mode="login"
          onSuccess={handleSocialSuccess}
          onError={handleSocialError}
          buttonStyle="row"
          disabled={isSubmitting}
        />

        <div className={styles.signupRow}>
          Don't have an account?{" "}
          <span
            className={styles.signupLink}
            onClick={() => navigate("/signup")}
            role="button"
            tabIndex={0}
          >
            Start your free trial!
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
