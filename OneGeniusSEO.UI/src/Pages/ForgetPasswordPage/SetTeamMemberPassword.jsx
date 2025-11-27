import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForgetPassword.module.css"; // Reusing same styles for consistent UI
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 for password toggles

const SetTeamMemberPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 👇 track visibility of each password field
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0) {
        setTeamMemberPassword();
      }
      setIsSubmitting(false);
    }
  }, [errors, isSubmitting]);

  const validate = (values) => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

    if (!values.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Invalid email address.";
    }

    if (!values.tempPassword) {
      errors.tempPassword = "Temporary password is required.";
    }

    if (!values.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (!passwordRegex.test(values.newPassword)) {
      errors.newPassword =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character.";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword =
        "Confirm new password and new password do not match.";
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
      email: true,
      tempPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setIsSubmitting(true);
  };

  const setTeamMemberPassword = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/TeamMemberUser/setNewPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            tempPassword: formData.tempPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      if (response.ok) {
        setIsSuccess(true);
        setApiMessage(
          "Password has been successfully set. Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setIsSuccess(false);
        const data = await response.json();
        setApiMessage(
          data.message || "Failed to set password. Please try again."
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
          Reset <b>Password</b>
        </h1>
        <p className={styles.description}>
          Enter your details to set your new password.
        </p>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className={styles.formGroup}>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`${styles.input} ${
                errors.email && touched.email ? styles.inputError : ""
              }`}
            />
            {errors.email && touched.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          {/* Temporary Password */}
          <div className={styles.formGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showTempPassword ? "text" : "password"}
                id="tempPassword"
                name="tempPassword"
                value={formData.tempPassword}
                onChange={handleChange}
                placeholder="Temporary Password"
                className={`${styles.input} ${
                  errors.tempPassword && touched.tempPassword
                    ? styles.inputError
                    : ""
                }`}
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowTempPassword((prev) => !prev)}
              >
                {showTempPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.tempPassword && touched.tempPassword && (
              <span className={styles.error}>{errors.tempPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className={styles.formGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New Password"
                className={`${styles.input} ${
                  errors.newPassword && touched.newPassword
                    ? styles.inputError
                    : ""
                }`}
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.newPassword && touched.newPassword && (
              <span className={styles.error}>{errors.newPassword}</span>
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
              Set Password
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

export default SetTeamMemberPassword;
