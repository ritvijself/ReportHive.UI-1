import React, { useState, useEffect } from "react";
import style from "./SignUpPage.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getUserRoleFromToken } from "../../utils/Auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocialAuth from "../SocialAuthPage/SocialAuth.jsx";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyWebsite: "",
    phone: "",
    businessEmail: "",
    password: "",
    acceptTerms: false,
    digitalAgencyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (location.state?.signupSuccess) {
      toast.success(location.state.signupSuccess, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (isSubmitting && Object.keys(errors).length === 0) {
      // Form submission side-effect placeholder
    }
    setIsSubmitting(false);
  }, [errors, isSubmitting]);

  const validate = (values) => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&.]{8,}$/;

    if (!values.firstName) {
      errors.firstName = "Please enter your first name.";
    } else if (!nameRegex.test(values.firstName)) {
      errors.firstName = "Only letters are allowed.";
    }

    if (!values.lastName) {
      errors.lastName = "Please enter your last name.";
    } else if (!nameRegex.test(values.lastName)) {
      errors.lastName = "Only letters are allowed.";
    }
    if (!values.digitalAgencyName || values.digitalAgencyName.trim() === "") {
      errors.digitalAgencyName = "Company Name is required.";
    }
    if (values.phone && values.phone.length < 10) {
      errors.phone = "Phone number must be at least 10 digits.";
    }

    if (!values.businessEmail) {
      errors.businessEmail = "Please enter a valid email address";
    } else if (!emailRegex.test(values.businessEmail)) {
      errors.businessEmail = "Invalid email format";
    }

    if (!values.password) {
      errors.password = "Please enter a valid password.";
    } else if (!passwordRegex.test(values.password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    if (!values.acceptTerms)
      errors.acceptTerms =
        "You must accept 1GeniusSEO Terms of Service & Privacy Policy in order to create an account.";

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      companyWebsite: true,
      phone: true,
      businessEmail: true,
      password: true,
      acceptTerms: true,
      digitalAgencyName: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${apibaseurl}/api/DigitalAgency/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyWebsite: formData.companyWebsite,
            phone: formData.phone,
            businessEmail: formData.businessEmail,
            password: formData.password,
            digitalAgencyName: formData.digitalAgencyName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Signup failed");
        }

        setFormData({
          firstName: "",
          lastName: "",
          companyWebsite: "",
          phone: "",
          businessEmail: "",
          password: "",
          acceptTerms: false,
          digitalAgencyName: "",
        });
        setErrors({});
        setTouched({});
        navigate("/signin", {
          state: {
            signupSuccess: "Account created successfully. Please Sign In.",
          },
        });
      } catch (error) {
        console.error("Error:", error);
        if (error.message === "User already exists") {
          setErrors((prev) => ({
            ...prev,
            businessEmail:
              "This email is already registered. Please use a different email.",
          }));
          setTouched((prev) => ({ ...prev, businessEmail: true }));
        } else {
          setErrors((prev) => ({ ...prev, submit: error.message }));
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Social auth success handler
  const handleSocialSuccess = (data, role) => {
    if (role?.toLowerCase() === "admin") navigate("/admindashboard");
    else navigate("/clientdashboard");
  };

  // Social auth error handler
  const handleSocialError = (errorMessage) => {
    console.error("Social auth error:", errorMessage);
  };

  return (
    <div className={style.centerWrapper}>
      <ToastContainer />
      <div className={style.FormBox}>
        <div className={style.logo}>
          <img
            src="https://i.postimg.cc/d022Ztjr/1-Genius-SEO-LOGO.png"
            alt="1GeniusSEO Logo"
            style={{ width: "14%" }}
          />
          <div className={style.logoText}>
            <h2>1 Genius SEO</h2>
            <p>One Genius. Endless Visibility</p>
          </div>
        </div>
        <div className={style.subText}>
          Get started in minutes. Manage campaigns, clients, and reporting in
          one place.
        </div>
        <h2 className={style.title} style={{ marginBottom: "8px" }}>
          Create your account
        </h2>

        {/* Social signup buttons */}
        {!showEmailForm && (
          <>
            <SocialAuth
              mode="signup"
              onSuccess={handleSocialSuccess}
              onError={handleSocialError}
              buttonStyle="column"
              showLabels={true}
              disabled={isSubmitting}
            />

            {/* Email signup button */}
            <div className={style.socialBtnGroup}>
              <button
                type="button"
                className={style.socialBtn}
                onClick={() => setShowEmailForm(true)}
                disabled={isSubmitting}
              >
                <span
                  className={style.socialIcon}
                  style={{ fontWeight: "bold", color: "black" }}
                >
                  @
                </span>{" "}
                Sign up with Email and Password
              </button>
            </div>

            <div className={style.disclaimer}>
              acknowledge our{" "}
              <Link
                to="/privacy"
                className={style.link}
                style={{ color: "#5b6478" }}
              >
                Privacy Policy
              </Link>
              .
            </div>
          </>
        )}

        {/* Email/password signup form */}
        {showEmailForm && (
          <form onSubmit={handleSubmit}>
            {/* Row 1: Names */}
            <div className="row g-1 mb-2">
              <div className="col-md-6">
                <input
                  type="text"
                  name="firstName"
                  className={`form-control ${style.input} ${
                    errors.firstName && touched.firstName ? "is-invalid" : ""
                  }`}
                  placeholder="First Name*"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && touched.firstName && (
                  <div className={`${style.error} invalid-feedback`}>
                    {errors.firstName}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="lastName"
                  className={`form-control ${style.input} ${
                    errors.lastName && touched.lastName ? "is-invalid" : ""
                  }`}
                  placeholder="Last Name*"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && touched.lastName && (
                  <div className={`${style.error} invalid-feedback`}>
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Company + Website */}
            <div className="row g-1 mb-2">
              <div className="col-md-6">
                <input
                  type="text"
                  name="digitalAgencyName"
                  className={`form-control ${style.input} ${
                    errors.digitalAgencyName && touched.digitalAgencyName
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="Company Name*"
                  value={formData.digitalAgencyName}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, digitalAgencyName: true }))
                  }
                />
                {errors.digitalAgencyName && touched.digitalAgencyName && (
                  <div className={`${style.error} invalid-feedback`}>
                    {errors.digitalAgencyName}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="companyWebsite"
                  className={`form-control ${style.input} ${
                    errors.companyWebsite && touched.companyWebsite
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="Company Website"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Phone + Email */}
            <div className="row g-1 mb-2">
              <div className="col-md-6">
                <input
                  type="tel"
                  name="phone"
                  className={`form-control ${style.input} ${
                    errors.phone && touched.phone ? "is-invalid" : ""
                  }`}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, phone: true }))
                  }
                  maxLength={10}
                />
                {errors.phone && touched.phone && (
                  <div className={`${style.error} invalid-feedback`}>
                    {errors.phone}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <input
                  type="email"
                  name="businessEmail"
                  className={`form-control ${style.input} ${
                    errors.businessEmail && touched.businessEmail
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="Business Email*"
                  value={formData.businessEmail}
                  onChange={handleChange}
                />
                {errors.businessEmail && touched.businessEmail && (
                  <div className={`${style.error} invalid-feedback`}>
                    {errors.businessEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Password */}
            <div className="row g-1 mb-1">
              <div className="col-md-6">
                <div className={style.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-control ${style.input} ${
                      errors.password && touched.password ? "is-invalid" : ""
                    }`}
                    placeholder="Password*"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className={style.passwordToggle}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {errors.password && touched.password && (
                  <div className={`${style.error} invalid-feedback`}>
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="col-md-6 d-none d-md-block"></div>
            </div>

            {/* Terms */}
            <div className={`form-check ${style.checkbox}`}>
              <input
                type="checkbox"
                name="acceptTerms"
                className="form-check-input"
                checked={formData.acceptTerms}
                onChange={handleChange}
                style={{ border: "1px solid black" }}
              />
              <label
                className={`form-check-label ${
                  errors.acceptTerms && touched.acceptTerms ? "is-invalid" : ""
                }`}
              >
                I accept the <Link to="/terms">terms and conditions.*</Link>
              </label>

              {errors.acceptTerms && touched.acceptTerms && (
                <div className={`${style.error} invalid-feedback`}>
                  {errors.acceptTerms}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={style.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "START FREE TRIAL NOW"}
            </button>

            {errors.submit && (
              <div className={`${style.error} mt-2 text-danger`}>
                {errors.submit}
              </div>
            )}

            <div className={style.loginLink}>
              Already have an account with us?{" "}
              <span
                className={style.link}
                onClick={() => navigate("/signin")}
                style={{ cursor: "pointer" }}
              >
                Sign in here
              </span>
            </div>
            <div className={style.backSocial}>
              <button
                type="button"
                className={style.backBtn}
                onClick={() => setShowEmailForm(false)}
              >
                ← Back to social sign up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
