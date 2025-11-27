import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromToken } from "../../utils/Auth";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUpload,
  FaTrashAlt,
  FaLock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaSpinner,
} from "react-icons/fa";
import styles from "./DASettingPage.module.css";

const DASettingsPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyWebsite: "",
    digitalAgencyName: "",
    phone: "",
    logoPath: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  const [role, setRole] = useState("");

  useEffect(() => {
    const currentToken =
      localStorage.getItem("datoken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    const fetchUserProfile = async (retries = 3, delay = 1000) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setApiError("No authentication token found. Please log in.");
        navigate("/login");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${apibaseurl}/api/DigitalAgency/get-user-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.isSuccess) {
          const {
            firstName,
            lastName,
            businessEmail,
            password,
            companyWebsite,
            phone,
            logoPath,
            digitalAgencyName,
          } = data.data;

          const fullLogoUrl = logoPath
            ? logoPath.startsWith("/")
              ? `${apibaseurl}${logoPath}`
              : logoPath
            : "";

          setFormData({
            firstName: firstName || "",
            lastName: lastName || "",
            email: businessEmail || "",
            password: password || "",
            companyWebsite: companyWebsite || "",
            phone: phone || "",
            logoPath: fullLogoUrl,
            digitalAgencyName: digitalAgencyName || "",
          });
          setImageError(false);
        } else {
          if (response.status === 401) {
            setApiError("Session expired. Please log in again.");
            navigate("/signin");
          } else if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchUserProfile(retries - 1, delay * 2);
          } else {
            setApiError(data.message || "Failed to fetch user profile.");
          }
        }
      } catch (error) {
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchUserProfile(retries - 1, delay * 2);
        }
        setApiError("An error occurred while fetching the profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, apibaseurl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setApiError("Please upload a valid image file (JPEG, PNG, or GIF).");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setApiError("Image file size must be less than 5MB.");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setApiError(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageError = () => {
    setImageError(true);
  };

  const validate = (values) => {
    const errors = {};
    const nameNoSpaceRegex = /^[A-Za-z]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!values.firstName) {
      errors.firstName = "Please enter your first name.";
    } else if (!nameNoSpaceRegex.test(values.firstName)) {
      errors.firstName = "Only letters without spaces are allowed.";
    }

    if (!values.lastName) {
      errors.lastName = "Please enter your last name.";
    } else if (!nameNoSpaceRegex.test(values.lastName)) {
      errors.lastName = "Only letters without spaces are allowed.";
    }
    if (!values.digitalAgencyName || values.digitalAgencyName.trim() === "") {
      errors.digitalAgencyName = "Please enter your Company name.";
    } else if (!nameRegex.test(values.digitalAgencyName)) {
      errors.digitalAgencyName = "Only letters are allowed.";
    }

    if (!values.password) {
      errors.password = "Please enter your password.";
    } else if (!passwordRegex.test(values.password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character.";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const token = localStorage.getItem("token");
      if (!token) {
        setApiError("No authentication token found. Please log in.");
        navigate("/login");
        return;
      }

      setIsLoading(true);

      const formDataUpload = new FormData();
      formDataUpload.append("firstName", formData.firstName);
      formDataUpload.append("lastName", formData.lastName);
      formDataUpload.append("businessEmail", formData.email);
      formDataUpload.append("password", formData.password || "");
      formDataUpload.append("companyWebsite", formData.companyWebsite || "");
      formDataUpload.append("phone", formData.phone || "");
      formDataUpload.append("status", true);
      formDataUpload.append("updatedDate", new Date().toISOString());
      formDataUpload.append(
        "digitalAgencyName",
        formData.digitalAgencyName || ""
      );

      try {
        if (selectedFile) {
          formDataUpload.append("logoFile", selectedFile);
        } else if (formData.logoPath) {
          const existingImageResponse = await fetch(formData.logoPath);
          const existingBlob = await existingImageResponse.blob();
          const fileName = formData.logoPath.split("/").pop() || "logo.jpg";
          const file = new File([existingBlob], fileName, {
            type: existingBlob.type,
          });
          formDataUpload.append("logoFile", file);
        }

        const response = await fetch(
          `${apibaseurl}/api/DigitalAgency/edit-user`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataUpload,
          }
        );

        const data = await response.json();

        if (response.ok && data.isSuccess) {
          const updatedData = data.data;

          const updatedLogoPath = updatedData.logoPath
            ? updatedData.logoPath.startsWith("/")
              ? `${apibaseurl}${updatedData.logoPath}`
              : updatedData.logoPath
            : formData.logoPath;

          setFormData((prev) => ({
            ...prev,
            logoPath: updatedLogoPath,
          }));

          const updatedUsername = `${updatedData.firstName || ""} ${
            updatedData.lastName || ""
          }`.trim();
          localStorage.setItem("username", updatedUsername);
          localStorage.setItem("companyName", updatedData.digitalAgencyName);
          setSelectedFile(null);
          setImagePreview(null);
          setImageError(false);
          navigate("/clientdashboard");
        } else {
          if (response.status === 401) {
            setApiError("Session expired. Please log in again.");
            navigate("/login");
          } else {
            setApiError(data.message || "Failed to update profile.");
          }
        }
      } catch (error) {
        console.error(error);
        setApiError("An error occurred while updating the profile.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getInitials = () => {
    const firstInitial = formData.firstName
      ? formData.firstName.charAt(0).toUpperCase()
      : "";
    const lastInitial = formData.lastName
      ? formData.lastName.charAt(0).toUpperCase()
      : "";
    return firstInitial + lastInitial || "--";
  };

  return (
    <div
      className="min-vh-100 d-flex pt-3"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="card p-4 shadow rounded-4 border-0">
              <div className="card-body">
                <h3 className="text-center fw-bold mb-4">Profile Settings</h3>

                <div className="d-flex justify-content-center align-items-center flex-column mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-2 position-relative"
                    style={{
                      width: "100px",
                      height: "100px",
                      fontSize: "36px",
                      color: "white",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    }}
                    aria-label={`Profile image for ${formData.firstName} ${formData.lastName}`}
                  >
                    {isLoading ? (
                      <FaSpinner className="fa-spin" />
                    ) : imagePreview || (formData.logoPath && !imageError) ? (
                      <img
                        src={imagePreview || formData.logoPath}
                        alt={`${formData.firstName} ${formData.lastName}'s profile`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        onError={handleImageError}
                      />
                    ) : (
                      <span>{getInitials()}</span>
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      id="profile-picture-upload"
                    />
                    <button
                      type="button"
                      className={`btn btn-sm d-flex align-items-center ${styles.uploadButton}`}
                      style={{ borderRadius: "20px" }}
                      onClick={() =>
                        document
                          .getElementById("profile-picture-upload")
                          .click()
                      }
                      disabled={isLoading}
                    >
                      <FaUpload className="me-1" /> Upload New
                    </button>
                    {/* {(formData.logoPath || imagePreview) && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                        style={{ borderRadius: "20px" }}
                        onClick={handleDelete}
                        disabled={isLoading}
                      >
                        <FaTrashAlt className="me-1" /> Delete
                      </button>
                    )} */}
                  </div>
                  {selectedFile && (
                    <small className="text-muted mt-2">
                      Selected: {selectedFile.name}
                    </small>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="firstName"
                        className="form-label fw-semibold text-muted d-flex align-items-center"
                      >
                        <FaUser className="me-2" /> First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className={`form-control rounded-pill ${
                          errors.firstName ? "is-invalid" : ""
                        }`}
                        value={formData.firstName}
                        onChange={handleChange}
                        style={{ padding: "10px 20px" }}
                        disabled={isLoading}
                      />
                      {errors.firstName && (
                        <div className="invalid-feedback d-block ms-2">
                          {errors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="lastName"
                        className="form-label fw-semibold text-muted d-flex align-items-center"
                      >
                        <FaUser className="me-2" /> Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-control rounded-pill ${
                          errors.lastName ? "is-invalid" : ""
                        }`}
                        value={formData.lastName}
                        onChange={handleChange}
                        style={{ padding: "10px 20px" }}
                        disabled={isLoading}
                      />
                      {errors.lastName && (
                        <div className="invalid-feedback d-block ms-2">
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="companyWebsite"
                        className="form-label fw-semibold text-muted d-flex align-items-center "
                      >
                        <FaGlobe className="me-2" /> Company Website
                      </label>
                      <input
                        type="text"
                        name="companyWebsite"
                        className={`form-control rounded-pill ${
                          errors.companyWebsite ? "is-invalid" : ""
                        }`}
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        style={{ padding: "10px 20px" }}
                        disabled={isLoading}
                      />
                      {errors.companyWebsite && (
                        <div className="invalid-feedback d-block ms-2">
                          {errors.companyWebsite}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="phone"
                        className="form-label fw-semibold text-muted d-flex align-items-center"
                      >
                        <FaPhone className="me-2" /> Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        className={`form-control rounded-pill ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        style={{ padding: "10px 20px" }}
                        disabled={isLoading}
                      />
                      {errors.phone && (
                        <div className="invalid-feedback d-block ms-2">
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="digitalAgencyName"
                      className="form-label fw-semibold text-muted d-flex align-items-center"
                    >
                      <FaGlobe className="me-2" /> Company Name
                    </label>
                    {role?.toLowerCase() === "teammember" ? (
                      <input
                        type="text"
                        name="digitalAgencyName"
                        className={`form-control rounded-pill ${
                          errors.digitalAgencyName ? "is-invalid" : ""
                        }`}
                        value={formData.digitalAgencyName}
                        onChange={handleChange}
                        placeholder="Enter your agency name"
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "rgb(245, 245, 245)",
                          cursor: "not-allowed",
                        }}
                        readOnly // <-- changed here
                      />
                    ) : (
                      <input
                        type="text"
                        name="digitalAgencyName"
                        className={`form-control rounded-pill ${
                          errors.digitalAgencyName ? "is-invalid" : ""
                        }`}
                        value={formData.digitalAgencyName}
                        onChange={handleChange}
                        placeholder="Enter your agency name"
                        style={{ padding: "10px 20px" }}
                        disabled={isLoading}
                      />
                    )}

                    {errors.digitalAgencyName && (
                      <div className="invalid-feedback d-block ms-2">
                        {errors.digitalAgencyName}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold text-muted d-flex align-items-center"
                    >
                      <FaEnvelope className="me-2" /> Email Address
                    </label>
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        className="form-control rounded-pill"
                        value={formData.email}
                        readOnly
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#f5f5f5",
                          cursor: "not-allowed",
                        }}
                      />
                      <span
                        className="input-group-text rounded-pill bg-light border-0"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "transparent",
                          color: "#6c757d",
                          fontSize: "0.8rem",
                        }}
                      >
                        (Can't be changed)
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold text-muted d-flex align-items-center"
                    >
                      <FaLock className="me-2" /> Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control rounded-pill ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password to change"
                      style={{ padding: "10px 20px" }}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <div className="invalid-feedback d-block ms-2">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => navigate("/dashboard")}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`${styles.saveButton} rounded-pill px-4`}
                      style={{
                        border: "none",
                        minWidth: "120px",
                        display: "flex",
                        paddingTop: "7px",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="fa-spin me-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DASettingsPage;
