import React from "react";

export default function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="portfolio-modal-backdrop">
      <div className="portfolio-confirm-modal" role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="portfolio-modal-actions">
          <button type="button" className="portfolio-btn portfolio-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="portfolio-btn portfolio-btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
