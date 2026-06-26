import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import "./index.css";
import Home from "./Index/Home.jsx";
import About from "./Index/About.jsx";
import Contact from "./Index/Contact.jsx";
import Services from "./Index/Services.jsx";
import Photogallery from "./Index/nav/Photogallery.jsx";
import VideoGallery from "./pages/VideoGallery.jsx";
import PortfolioFront from "./Index/nav/PortfolioFront.jsx";
import axios from "axios";
import Login from "./admin/Login.jsx";
import Admin from "./admin/Admin.jsx";
import { server_url } from "./url/url.js";

const SESSION_MS = 30 * 60 * 1000;
const ADMIN_TAB_AUTH_KEY = "rudraksh_admin_tab_auth";

const hideAppLoader = () => {
  const loader = document.getElementById("app-loader");
  if (!loader || loader.dataset.dismissed === "true") return;

  loader.dataset.dismissed = "true";
  loader.classList.add("app-loader--hidden");

  const removeLoader = () => {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  };

  loader.addEventListener("transitionend", removeLoader, { once: true });
  setTimeout(removeLoader, 1000);
};

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const expireTimerRef = useRef(null);

  const setExpiryTimer = (expiresAt) => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    const target = Number(expiresAt) || Date.now() + SESSION_MS;
    const remaining = Math.max(0, target - Date.now());
    expireTimerRef.current = setTimeout(async () => {
      try {
        await axios.post(`${server_url}/admin/logout`, {}, { withCredentials: true });
      } catch {
        // no-op
      }
      sessionStorage.removeItem(ADMIN_TAB_AUTH_KEY);
      setIsAuthed(false);
      setCurrentAdmin(null);
      setLoginError("Session Expired, Please Login Again");
    }, remaining);
  };

  const verifySession = async () => {
    if (sessionStorage.getItem(ADMIN_TAB_AUTH_KEY) !== "true") {
      setIsAuthed(false);
      setCurrentAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${server_url}/admin/me`, { withCredentials: true });
      if (!data?.success) throw new Error("Unauthorized");
      setIsAuthed(true);
      setCurrentAdmin(data.admin || null);
      setLoginError("");
      setExpiryTimer(data.expiresAt);
    } catch {
      sessionStorage.removeItem(ADMIN_TAB_AUTH_KEY);
      setIsAuthed(false);
      setCurrentAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifySession();
    return () => {
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    };
  }, []);

  if (loading) return null;

  if (isAuthed) {
    return (
      <Admin
        currentAdmin={currentAdmin}
        onLogout={async () => {
          try {
            await axios.post(`${server_url}/admin/logout`, {}, { withCredentials: true });
          } catch {
            // no-op
          }
          if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
          sessionStorage.removeItem(ADMIN_TAB_AUTH_KEY);
          setIsAuthed(false);
          setCurrentAdmin(null);
          setLoginError("");
        }}
      />
    );
  }

  return (
    <Login
      initialMessage={loginError}
      onLoginSuccess={async () => {
        sessionStorage.setItem(ADMIN_TAB_AUTH_KEY, "true");
        await verifySession();
      }}
    />
  );
}

function AppShell() {
  useEffect(() => {
    axios.defaults.withCredentials = true;
    const frame = requestAnimationFrame(() => hideAppLoader());
    return () => cancelAnimationFrame(frame);
  }, []);

  const adminFallbackRoute = useMemo(() => <Navigate to="/admin" replace />, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/service" element={<Navigate to="/services" replace />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/photo-gallery" element={<Photogallery />} />
        <Route path="/video-gallery" element={<VideoGallery />} />

        <Route path="/printing" element={<PortfolioFront category="Printing" />} />
        <Route path="/outdoor" element={<PortfolioFront category="Outdoor" />} />
        <Route path="/online" element={<PortfolioFront category="Online" />} />
        <Route path="/photoshot-video" element={<PortfolioFront category="Photoshoot & Video" />} />
        <Route path="/events" element={<PortfolioFront category="Events" />} />
        <Route path="/promotional" element={<PortfolioFront category="Promotional" />} />
        <Route path="/electronic-ads" element={<PortfolioFront category="Electronic Ads" />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/signup" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
        <Route path="/adminportal" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={adminFallbackRoute} />
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/users" element={<Navigate to="/admin" replace />} />
        <Route path="/settings" element={<Navigate to="/admin" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
