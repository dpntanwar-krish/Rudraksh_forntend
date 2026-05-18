import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import Home from "./Index/Home.jsx";
import Contact from "./Index/Contact.jsx";
import Photogallery from "./Index/nav/Photogallery.jsx";
import Login from "./admin/Login.jsx";
import Signup from "./admin/Signup.jsx";
import Admin from "./admin/Admin.jsx";

const AUTH_KEY = "rudraksh_admin_auth";

function PrivateRoute({ children }) {
  const raw = localStorage.getItem(AUTH_KEY);
  let token = null;
  try {
    token = raw ? JSON.parse(raw)?.token : null;
  } catch {
    token = null;
  }
  return token ? children : <Navigate to="/admin/login" replace />;
}

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

function AdminLoginPage() {
  const navigate = useNavigate();
  return (
    <Login
      onGoSignup={() => navigate("/admin/signup")}
      onLoginSuccess={(payload) => {
        localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
        navigate("/adminportal", { replace: true });
      }}
    />
  );
}

function AdminSignupPage() {
  const navigate = useNavigate();
  return (
    <Signup
      onGoLogin={() => navigate("/admin/login")}
      onSignupDone={() => navigate("/admin/login", { replace: true })}
    />
  );
}

function AdminPortalPage() {
  const navigate = useNavigate();
  return (
    <PrivateRoute>
      <Admin
        onLogout={() => {
          localStorage.removeItem(AUTH_KEY);
          navigate("/admin/login", { replace: true });
        }}
      />
    </PrivateRoute>
  );
}

function AppShell() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => hideAppLoader());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/photo-gallery" element={<Photogallery />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        <Route path="/adminportal" element={<AdminPortalPage />} />

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
