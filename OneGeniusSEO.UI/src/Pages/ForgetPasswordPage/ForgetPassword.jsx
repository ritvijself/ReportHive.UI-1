import React, { useState } from "react";
import styles from "./ForgetPassword.module.css";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiMessage, setApiMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const validate = (values) => {
    const errors = {};
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) {
      errors.email = "Please enter a valid email address.";
    } else if (!regex.test(values.email)) {
      errors.email = "Invalid email format";
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setApiMessage("");

      try {
        const response = await fetch(
          `${apibaseurl}/api/DigitalAgency/forgot-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
          }
        );

        if (response.ok) {
          setTimeout(() => {
            setIsEmailSent(true);
            setIsSubmitting(false);
          }, 1000);
        } else {
          setApiMessage(
            "We couldn't find an account with this email. Please check and try again."
          );
          setIsSubmitting(false);
        }
      } catch (error) {
        setApiMessage(
          "Something went wrong. Please check your connection or try again later."
        );
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className="container" style={{ maxWidth: 980 }}>
        <div
          className="shadow-sm"
          style={{
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "saturate(170%) blur(14px)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div className="row g-0">
            {/* Visual side panel */}
            <div
              className="col-lg-6 d-none d-lg-flex align-items-stretch"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, rgba(11,18,32,0.78), rgba(17,24,39,0.62)), linear-gradient(160deg, rgba(79,70,229,0.28), rgba(124,58,237,0.18)), url('https://images.unsplash.com/photo-1497493292307-31c376b6e479?q=80&w=1600&auto=format&fit=crop')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div
                className="w-100 d-flex flex-column justify-content-between"
                style={{ padding: "28px 28px", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                <div className="text-white">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <img
                      src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
                      alt="1GeniusSEO Logo"
                      style={{ height: 36, width: 36, objectFit: "contain" }}
                    />
                    <strong>1GeniusSEO</strong>
                  </div>
                  <h3 className="fw-bold mb-2">Reset access securely</h3>
                  <p className="mb-4" style={{ maxWidth: 420 }}>
                    Enter your email and we’ll send a secure link to reset your password.
                  </p>
                </div>
                <ul className="list-unstyled text-white-50 mb-0">
                  <li className="d-flex align-items-center mb-2">✔ Encrypted reset link</li>
                  <li className="d-flex align-items-center mb-2">✔ Link expires in 24 hours</li>
                  <li className="d-flex align-items-center">✔ Support if you need help</li>
                </ul>
              </div>
            </div>

            {/* Form panel */}
            <div className="col-lg-6">
              <div className="p-4 p-lg-5">
                <div className={styles.logo}>
                  <img
                    src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
                    alt="1GeniusSEO Logo"
                    style={{ width: "22%" }}
                  />
                  <div className={styles.logoText}>
                    <h2>1 Genius SEO</h2>
                    <p>One Genius. Endless Visibility</p>
                  </div>
                </div>

                {isSubmitting ? (
                  <div className={styles.loaderWrapper}>
                    <div className={styles.loader}></div>
                    <p>Sending reset email...</p>
                  </div>
                ) : isEmailSent ? (
                  <div className={styles.successMessage}>
                    <h1 className={styles.title}>Check Your Inbox</h1>
                    <p className={styles.description} style={{ textAlign: "center" }}>
                      We’ve sent you an email with a link to reset your password. <strong>Please check your email for the link.</strong>
                    </p>
                    <p className={styles.description} style={{ textAlign: "center" }}>
                      If you don’t receive the email within 10 minutes, or if you’re having trouble resetting your password, contact us at {" "}
                      <a href="mailto:Contact@eatechnologies.net">Contact@eatechnologies.net</a>.
                    </p>
                  </div>
                ) : (
                  <>
                    <h1 className={styles.title}>Reset your password</h1>
                    <div className="d-flex justify-content-center">
                      <p className={styles.description}>
                        We’ll send you an email with a secure reset link to complete the password reset process.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
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

                      <div className={styles.formGroup}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                          Send Reset Email
                        </button>
                      </div>
                    </form>

                    {apiMessage && (
                      <div className={styles.errorMessage}>{apiMessage}</div>
                    )}

                    <div className={styles.loginLink}>
                      Go back to {" "}
                      <span
                        className={styles.link}
                        onClick={() => navigate("/signin")}
                        style={{ cursor: "pointer" }}
                      >
                        Sign in
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
