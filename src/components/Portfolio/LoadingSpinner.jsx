import React from "react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="portfolio-loading" role="status" aria-live="polite">
      <span className="portfolio-spinner"></span>
      <span>{label}</span>
    </div>
  );
}
