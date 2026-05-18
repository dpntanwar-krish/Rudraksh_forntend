import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AdminPortalRoutes from "./routes/AdminPortalRoutes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminPortalRoutes />
  </StrictMode>,
)
