import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 import icons
import styles from "./ForgetPassword.module.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    token: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 👇 state for toggling visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") || "";
    setFormData((prev) => ({ ...prev, token }));
  }, [location.search]);

  useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0) {
        resetPassword();
      }
      setIsSubmitting(false);
    }
  }, [errors, isSubmitting]);

  const validate = (values) => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!values.password) {
      errors.password = "Password is required.";
    } else if (!passwordRegex.test(values.password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character.";
    }
    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      password: true,
      confirmPassword: true,
    });
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setIsSubmitting(true);
  };

  const resetPassword = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/DigitalAgency/resetpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: formData.token,
            newPassword: formData.password,
          }),
        }
      );

      if (response.ok) {
        setIsSuccess(true);
        setApiMessage(
          "Password has been successfully reset. Redirecting to login..."
        );
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setIsSuccess(false);
        const data = await response.json();
        setApiMessage(
          data.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      setApiMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logo}>
          <img
            src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
            alt="1GeniusSEO Logo"
            style={{ width: "25%" }}
          />
        </div>
        <h1 className={styles.title}>
          Reset your <b>Password</b>
        </h1>
        <p className={styles.description}>Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div className={styles.formGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New Password"
                className={`${styles.input} ${
                  errors.password && touched.password ? styles.inputError : ""
                }`}
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && touched.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                className={`${styles.input} ${
                  errors.confirmPassword && touched.confirmPassword
                    ? styles.inputError
                    : ""
                }`}
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <button type="submit" className={styles.submitBtn}>
              Reset Password
            </button>
          </div>
        </form>

        {apiMessage && (
          <div
            className={`${styles.apiMessage} ${
              isSuccess ? styles.successMessage : styles.errorMessage
            }`}
          >
            {apiMessage}
          </div>
        )}

        <div className={styles.loginLink}>
          Go back to{" "}
          <span
            className={styles.link}
            onClick={() => navigate("/signin")}
            style={{ cursor: "pointer" }}
          >
            Sign in.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
