import { useEffect, useMemo, useState } from "react";
import Admin from "../admin/Admin";
import Login from "../admin/Login";
import Signup from "../admin/Signup";

const AUTH_KEY = "rudraksh_admin_auth";

function getPath() {
  return window.location.pathname || "/";
}

function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

function getStoredAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AdminPortalRoutes() {
  const [path, setPath] = useState(getPath());
  const [auth, setAuth] = useState(getStoredAuth());

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const routeView = useMemo(() => {
    if (path === "/admin/signup") {
      return (
        <Signup
          onGoLogin={() => navigate("/admin/login")}
          onSignupDone={() => navigate("/admin/login")}
        />
      );
    }

    if (path === "/admin/login") {
      return (
        <Login
          onGoSignup={() => navigate("/admin/signup")}
          onLoginSuccess={(payload) => {
            localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
            setAuth(payload);
            navigate("/adminportal");
          }}
        />
      );
    }

    if (path === "/adminportal") {
      if (!auth?.token) {
        navigate("/admin/login");
        return null;
      }
      return (
        <Admin
          onLogout={() => {
            localStorage.removeItem(AUTH_KEY);
            setAuth(null);
            navigate("/admin/login");
          }}
        />
      );
    }

    navigate("/admin/login");
    return null;
  }, [auth, path]);

  return routeView;
}
