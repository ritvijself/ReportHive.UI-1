import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Pages
import LoginPage from "./Pages/LoginPage/LoginPage.jsx";
import SignupPage from "./Pages/SignUpPage/SignUpPage.jsx";
import ForgetPassword from "./Pages/ForgetPasswordPage/ForgetPassword.jsx";
import ResetPassword from "./Pages/ForgetPasswordPage/ResetPassword.jsx";
import DashboardPage from "./Pages/DashboardPage/DashboardPage.jsx";
import DashboardLayout from "./Pages/DashboardPage/Layout/DashboardLayout.jsx";
import SocialMediaIntegrations from "./Pages/Integrations/SocialMediaIntegrations.jsx";
import ClientDashboard from "./Pages/ClientDashboard/ClientDashboard.jsx";
import DASettingsPage from "./Pages/DASettingPage/DASettingPage.jsx";
import CustomizeDashboard from "./Pages/CustomizeDashboard/CustomizeDashboard.jsx";
import TermAndPrivacy from "./Pages/Term&Privacy/TermAndPrivacy/TermAndPrivacy.jsx";
import AdminDashboard from "./Pages/AdminPanel/AdminDashboard/AdminDashboard.jsx";
import HomePage from "./Pages/HomePage/HomePage.jsx";
import PMToolHomePage from "./Pages/PMTool/HomePage/HomePage.jsx";
import PMToolClientPage from "./Pages/PMTool/ClientPage/ClientPage.jsx";
// Decode JWT token
import AdminLayout from "./Pages/Layout/AdminLayout.jsx";
import AgencyDetails from "./Pages/AdminPanel/AgencyDetailPage/AgencyDetails.jsx";
import Unauthorized from "./Pages/Unauthorized/Unauthorized.jsx";
import HomePageLayout from "./Pages/Layout/HomePageLayout/HomePageLayout.jsx";
import ScrollToTop from "./utils/ScrollTop";
import TeamMembersDashboard from "./Pages/TeamMembers/TeamMembersDashboard.jsx";
import useIdleLogout from "./utils/UseIdleLogout";
import SetTeamMemberPassword from "./Pages/ForgetPasswordPage/SetTeamMemberPassword.jsx";

// Utils
const decodeToken = (token) => {
  if (!token) return null;
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
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("selectedClientSeq");
  localStorage.removeItem("daToken");
  window.location.href = "/";
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  try {
    const response = await fetch(
      `${apibaseurl}/api/Auth/refresh-token?request=${encodeURIComponent(
        refreshToken
      )}`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const newToken = data.token;

    if (newToken) {
      localStorage.setItem("token", newToken);
      return newToken;
    }
    return null;
  } catch (err) {
    console.error("Refresh token error", err);
    return null;
  }
};
const IdleLogoutWrapper = ({ children }) => {
  useIdleLogout(60 * 60 * 1000);
  return <>{children}</>;
};

// Simple token-based protection
const ProtectedRoute = ({ blockAdmin = false, children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/signin" replace />;

  const decoded = decodeToken(token);
  if (!decoded) return <Navigate to="/signin" replace />;

  // If blockAdmin is true, and user is admin, redirect to admin dashboard
  if (blockAdmin && decoded.role?.toLowerCase() === "admin") {
    return <Navigate to="/admindashboard" replace />;
  }

  return children;
};

// Role-based protection (Admin only)
const RoleProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  const decoded = decodeToken(token);
  if (!decoded || decoded.role?.toLowerCase() !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Inside App.jsx or utils/RoleProtectedRoute.js
const RoleRestrictedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/signin" replace />;

  const decoded = decodeToken(token);
  const userRole = decoded?.role?.toLowerCase();

  if (!decoded || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    let timeoutId;
    let isRefreshing = false;

    const scheduleTokenRefresh = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      const decoded = decodeToken(token);
      if (!decoded) return;

      const currentTime = Date.now();
      const expiryTime = decoded.exp * 1000;
      const timeUntilExpiry = expiryTime - currentTime;
      const refreshDelay = timeUntilExpiry - 60 * 1000;

      if (refreshDelay <= 0) {
        if (isRefreshing) return;
        isRefreshing = true;

        const newToken = await refreshToken();
        isRefreshing = false;

        if (newToken) {
          scheduleTokenRefresh();
        } else {
          logout();
        }
        return;
      }

      timeoutId = setTimeout(async () => {
        const newToken = await refreshToken();
        if (newToken) {
          scheduleTokenRefresh();
        } else {
          logout();
        }
      }, refreshDelay);
    };

    scheduleTokenRefresh();
    return () => clearTimeout(timeoutId);
  }, []);

  const googleClientId = import.meta.env.VITE_CLIENT_ID_GA4;
  const googleClientIdLogin = import.meta.env.VITE_GOOGLE_CLIENTID_LOGIN;
  //const googleClientId = import.meta.env.VITE_CLIENT_ID_GA4;
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <IdleLogoutWrapper>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}

            <Route
              path="/signin"
              element={
                <GoogleOAuthProvider clientId={googleClientIdLogin}>
                  <HomePageLayout>
                    <LoginPage />
                  </HomePageLayout>
                </GoogleOAuthProvider>
              }
            />
            <Route
              path="/setteammemberpassword"
              element={
                <HomePageLayout>
                  <SetTeamMemberPassword />
                </HomePageLayout>
              }
            />
            <Route path="/" element={<HomePage />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes (Role-based) */}
            <Route
              path="/admindashboard"
              element={
                <RoleProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/agencyDetails/:id"
              element={
                <RoleProtectedRoute>
                  <AdminLayout>
                    <AgencyDetails />
                  </AdminLayout>
                </RoleProtectedRoute>
              }
            />

            {/* Client/Agency Routes (Token-based only) */}
            <Route
              path="/signup"
              element={
                <GoogleOAuthProvider clientId={googleClientIdLogin}>
                  <HomePageLayout>
                    <SignupPage />
                  </HomePageLayout>
                </GoogleOAuthProvider>
              }
            />
            <Route
              path="/forgetpassword"
              element={
                <HomePageLayout>
                  <ForgetPassword />
                </HomePageLayout>
              }
            />
            <Route
              path="/resetpassword"
              element={
                <HomePageLayout>
                  <ResetPassword />
                </HomePageLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <HomePageLayout>
                  <TermAndPrivacy />
                </HomePageLayout>
              }
            />

            <Route
              path="/clientdashboard"
              element={
                <ProtectedRoute blockAdmin={true}>
                  <DashboardLayout>
                    <ClientDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute blockAdmin={true}>
                  <DashboardLayout pageTitle="Dashboard">
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute blockAdmin={true}>
                  <DashboardLayout pageTitle="Integration">
                    <SocialMediaIntegrations />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute blockAdmin={true}>
                  <DashboardLayout pageTitle="settings">
                    <DASettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customizedashboard"
              element={
                <ProtectedRoute blockAdmin={true}>
                  <DashboardLayout>
                    <CustomizeDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teammembers"
              element={
                <ProtectedRoute blockAdmin={true}>
                  <RoleRestrictedRoute allowedRoles={["digitalagency"]}>
                    <DashboardLayout>
                      <TeamMembersDashboard />
                    </DashboardLayout>
                  </RoleRestrictedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pmtool"
              element={
                <DashboardLayout>
                  <PMToolHomePage />
                </DashboardLayout>
              }
            />

            <Route path="/pmtool/clients">
              <Route
                path=":clientId"
                element={
                  <DashboardLayout>
                    <PMToolClientPage />
                  </DashboardLayout>
                }
              >
                <Route path="task/:taskId" element={null} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </IdleLogoutWrapper>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
