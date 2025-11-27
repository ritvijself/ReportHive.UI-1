import React, { useState, useEffect, useRef } from "react";
import { Popover } from "react-tiny-popover";
import { FocusTrap } from "focus-trap-react";
import { Button, Input, Select } from "@/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { validateURL } from "@/utils/common";
import { convertMongoIdToUUID } from "@/utils/idConverter";

// Utility to decode JWT token (client-side, for demonstration purposes)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Retrieve username from localStorage
const getUsername = () => localStorage.getItem("username") || "partner Two";

// Get token and decode it
const getTokenData = () => {
  const token = localStorage.getItem("token");
  return {
    token,
    decodedToken: token ? decodeJWT(token) : null,
    username: getUsername(),
  };
};

const AddNewClientPopover = ({
  isOpen,
  setIsOpen,
  children,
  clientData = null,
  isEditMode = false,
}) => {
  const queryClient = useQueryClient();
  const clientNameInputRef = useRef(null);

  // Get token data inside the component (we'll use a reactive username from localStorage separately)
  const { token, decodedToken } = getTokenData();

  // Keep username in component state so changes to localStorage can update the UI
  const [storedUsername, setStoredUsername] = useState(getUsername());

  // Initial form data with username and role from token
  const initialFormData = {
    clientName: "",
    websiteUrl: "",
    projectManager: storedUsername,
    scope: decodedToken?.role || "DigitalAgency", // Fallback to "DigitalAgency"
  };

  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFocusTrapActive, setIsFocusTrapActive] = useState(false);

  // Extract userId from decoded token
  const userId = decodedToken?.User_id || null;

  // Debug: Log the userId to verify it's correct
  useEffect(() => {
    if (isOpen && userId) {
      console.log("Extracted userId from token:", userId);
    } else if (isOpen && !userId) {
      console.warn("No valid userId extracted from token");
    }
  }, [isOpen, userId]);

  // Keep storedUsername in sync when localStorage changes in other tabs/windows
  // and also refresh when the window regains focus (in-case localStorage was changed in the same tab without firing a storage event).
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "username") {
        setStoredUsername(e.newValue || "partner Two");
      }
    };

    const handleFocus = () => {
      const current = getUsername();
      setStoredUsername(current);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const projectManagerOptions = React.useMemo(
    () => [{ value: storedUsername, label: storedUsername }],
    [storedUsername]
  );

  const resetForm = () => {
    if (isEditMode && clientData) {
      setFormData({
        clientName: clientData.name || "",
        websiteUrl: clientData.website_url || "",
        projectManager: clientData.project_manager || storedUsername,
        scope: clientData.scope || decodedToken?.role || "DigitalAgency",
      });
    } else {
      setFormData(initialFormData);
    }
    setFieldErrors({});
  };

  const closePopover = () => {
    setIsFocusTrapActive(false);
    resetForm();
    setIsOpen(false);
  };

  // Initialize form data when popover opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, isEditMode, clientData]);

  // Focus the first input when popover opens and activate focus trap
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsFocusTrapActive(true);
        if (clientNameInputRef.current) {
          clientNameInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsFocusTrapActive(false);
    }
  }, [isOpen]);

  const { mutate: saveClient, isPending } = useMutation({
    mutationFn: async (client) => {
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!userId) {
        throw new Error("Invalid user ID");
      }

      // Check token expiration
      if (decodedToken?.exp && decodedToken.exp * 1000 < Date.now()) {
        throw new Error("Token has expired");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Debug: Log the payload before sending
      const payload = {
        name: client.clientName,
        website_url: client.websiteUrl,
        user_id: userId,
        // ensure we always send a project_manager (fall back to storedUsername)
        project_manager: client.projectManager || storedUsername,
        scope: client.scope,
      };
      console.log("API Payload:", payload);

      if (isEditMode && clientData) {
        const { data } = await api.put(
          `/api/clients/${clientData._id}`,
          payload,
          config
        );
        return data;
      } else {
        const { data } = await api.post("/api/clients", payload, config);
        return data;
      }
    },
    onSuccess: () => {
      // Close the popover; list will be refetched in onSettled
      closePopover();
    },
    onError: (error) => {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} client:`,
        error
      );
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        `An unexpected error occurred while ${
          isEditMode ? "updating" : "adding"
        } the client`;

      setFieldErrors({
        clientName: errorMessage,
      });
    },
    onSettled: async () => {
      // Always refetch clients after create/edit (or failure) to sync UI
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ["clients", userId] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
      }
    },
  });

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Enter" && !isPending) {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.tagName === "BUTTON") {
          return;
        }
        if (
          focusedElement &&
          (focusedElement.tagName === "INPUT" ||
            focusedElement.tagName === "SELECT")
        ) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isPending, formData]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSubmit = () => {
    const newFieldErrors = {};

    if (!formData.clientName.trim()) {
      newFieldErrors.clientName = "Client name is required!";
    }

    const urlError = validateURL(formData.websiteUrl);
    if (urlError) {
      newFieldErrors.websiteUrl = urlError;
    }

    if (!userId) {
      newFieldErrors.clientName = "Invalid user ID. Please re-authenticate.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    saveClient(formData);
  };

  const handleCancel = () => {
    closePopover();
  };

  return (
    <Popover
      isOpen={isOpen}
      positions={["right", "left", "top", "bottom"]}
      onClickOutside={() => setIsOpen(false)}
      padding={10}
      content={
        <FocusTrap
          active={isFocusTrapActive}
          focusTrapOptions={{
            escapeDeactivates: false,
            clickOutsideDeactivates: true,
            onDeactivate: () => {
              setIsFocusTrapActive(false);
            },
            setReturnFocus: true,
          }}
        >
          <div
            className="tw:bg-white tw:border tw:border-gray-200 tw:rounded-lg tw:shadow-xl tw:w-80"
            style={{ zIndex: 9999 }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-client-title"
          >
            <div className="tw:px-4 tw:py-3 tw:border-b tw:border-gray-200">
              <div
                id="add-client-title"
                className="tw:text-sm tw:font-semibold tw:text-gray-800"
              >
                {isEditMode ? "Edit client" : "Add client"}
              </div>
              <div className="tw:text-xs tw:text-gray-600">
                Adding as: {storedUsername}
              </div>
            </div>

            <div className="tw:p-4 tw:space-y-3">
              <Input
                ref={clientNameInputRef}
                label="Client name"
                placeholder="e.g. Acme Corporation"
                value={formData.clientName}
                onChange={handleInputChange("clientName")}
                error={fieldErrors.clientName}
                required
              />

              <Input
                label="Website URL"
                type="url"
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={handleInputChange("websiteUrl")}
                error={fieldErrors.websiteUrl}
              />

              <Select
                label="Project manager"
                options={projectManagerOptions}
                value={formData.projectManager}
                onChange={handleInputChange("projectManager")}
                placeholder="Select project manager"
                disabled={true}
              />

              <Input
                label="Scope"
                type="text"
                placeholder="e.g. DigitalAgency"
                value={formData.scope}
                disabled={true}
                onChange={handleInputChange("scope")}
              />
            </div>

            <div className="tw:px-4 tw:py-3 tw:border-t tw:border-gray-200 tw:flex tw:justify-end tw:gap-2">
              <Button variant="secondary" onClick={handleCancel} isCompact>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isCompact
                isLoading={isPending}
                disabled={!userId}
              >
                {isEditMode ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </FocusTrap>
      }
    >
      {children}
    </Popover>
  );
};

export default AddNewClientPopover;
