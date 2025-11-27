import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const CreateTeamMembers = ({ show, onHide, onCreate }) => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    businessEmail: "",
    password: "",
    tempPassword: true,
    logoPath: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    businessEmail: "",
  });
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  // Function to generate random password
  const generateRandomPassword = (length = 10) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Reset form and errors when modal is opened
  useEffect(() => {
    if (show) {
      setNewUser({
        firstName: "",
        lastName: "",
        businessEmail: "",
        password: generateRandomPassword(), // ✅ still auto-generate password
        tempPassword: true,
        logoPath: "",
      });
      setErrors({
        firstName: "",
        lastName: "",
        businessEmail: "",
      });
      setIsLoading(false);
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent numbers and special characters in firstName and lastName
    if (name === "firstName" || name === "lastName") {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Only letters and spaces are allowed",
        }));
        return;
      }
    }

    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      businessEmail: "",
    };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]*$/.test(newUser.firstName)) {
      newErrors.firstName = "Only letters and spaces are allowed in first name";
      isValid = false;
    }
    if (!newUser.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]*$/.test(newUser.lastName)) {
      newErrors.lastName = "Only letters and spaces are allowed in last name";
      isValid = false;
    }
    if (!emailRegex.test(newUser.businessEmail)) {
      newErrors.businessEmail = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("datoken") || localStorage.getItem("token");

      if (!token) {
        console.error("Token not found in localStorage");
        setErrors((prev) => ({
          ...prev,
          businessEmail: "Authentication token not found",
        }));
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${apibaseurl}/api/TeamMemberUser/teamMember-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUser),
        }
      );

      if (response.ok) {
        const responseData = await response.json();

        // Only show success when server explicitly reports success
        if (!responseData.isSuccess) {
          // Server returned a business-level failure (e.g. "User already exists")
          const msg = responseData.message || "Failed to create team member";
          setErrors((prev) => ({
            ...prev,
            businessEmail: msg,
          }));
          toast.error(msg, {
            position: "top-right",
            autoClose: 3000,
          });
          onHide();
          // Inform parent that refresh is needed (or pass along server message)
          onCreate({ refresh: true, isSuccess: false, message: msg });
          setIsLoading(false);
          return;
        }

        // Successful creation
        toast.success("Team member created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        if (!responseData.data?.teamMember_Seq) {
          onHide();
          onCreate({ refresh: true });
          setIsLoading(false);
          return;
        }

        onHide();
        onCreate({
          ...newUser,
          teamMember_Seq: responseData.data.teamMember_Seq,
          teamMember_Name: `${newUser.firstName} ${newUser.lastName}`,
          refresh: false,
        });
      } else {
        // HTTP error
        let errMsg = "Failed to create team member";
        try {
          const errBody = await response.json();
          errMsg = errBody.message || errBody.data?.message || errMsg;
        } catch (e) {
          // ignore JSON parse errors
        }
        toast.error(errMsg, { position: "top-right", autoClose: 3000 });
        setErrors((prev) => ({ ...prev, businessEmail: errMsg }));
        onHide();
        onCreate({ refresh: true });
      }
    } catch (error) {
      console.error("Error creating team member:", error);
      const errMsg = error?.message || "An error occurred while creating the team member";
      toast.error(errMsg, { position: "top-right", autoClose: 3000 });
      setErrors((prev) => ({ ...prev, businessEmail: errMsg }));
      onHide();
      onCreate({ refresh: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Team Member</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form autoComplete="off">
          <Row>
            <Col md={6}>
              <Form.Group controlId="firstName" className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={newUser.firstName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={isLoading}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="lastName" className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={newUser.lastName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={isLoading}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="businessEmail" className="mb-3">
                <Form.Label>Business Email</Form.Label>
                <Form.Control
                  type="email"
                  name="businessEmail"
                  placeholder="Enter business email"
                  value={newUser.businessEmail}
                  onChange={handleInputChange}
                  autoComplete="new-email"
                  disabled={isLoading}
                  isInvalid={!!errors.businessEmail}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.businessEmail}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTeamMembers;
