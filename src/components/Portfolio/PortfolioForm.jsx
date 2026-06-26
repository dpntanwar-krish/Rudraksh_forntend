import React, { useEffect, useState } from "react";
import { FiImage, FiSave, FiX } from "./PortfolioIcons";
import { PORTFOLIO_CATEGORIES } from "../../services/portfolioApi";

const initialForm = {
  title: "",
  category: "PRINTING",
  status: true,
};

export default function PortfolioForm({ category, editingItem, onCancel, onSubmit, isSaving }) {
  const [form, setForm] = useState({ ...initialForm, category });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!editingItem) {
      setForm({ ...initialForm, category });
      setFiles([]);
      return;
    }

    setForm({
      title: editingItem.title || "",
      category: editingItem.category || category,
      status: editingItem.status !== false,
    });
    setFiles([]);
  }, [category, editingItem]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    files.forEach((file) => formData.append("files", file));
    onSubmit(formData);
  };

  return (
    <form className="portfolio-form" onSubmit={handleSubmit}>
      <div className="portfolio-form-header">
        <div>
          <h3>{editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}</h3>
          <p>{form.category}</p>
        </div>
        <button type="button" className="portfolio-icon-btn" onClick={onCancel} aria-label="Close form">
          <FiX />
        </button>
      </div>

      <div className="portfolio-form-grid">
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange} required>
            {PORTFOLIO_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="portfolio-upload-grid" style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <label className="portfolio-file-field" style={{ width: "100%", fontSize: "0.85rem", padding: "10px", boxSizing: "border-box" }}>
          <FiImage />
          <span>{files.length ? `${files.length} images selected` : "Choose images"}</span>
          <input type="file" multiple accept="image/*" onChange={(event) => setFiles(Array.from(event.target.files || []))} required={!editingItem} />
        </label>
      </div>

      <label className="portfolio-toggle-row">
        <input type="checkbox" name="status" checked={form.status} onChange={handleChange} />
        <span>Active Status</span>
      </label>

      <div className="portfolio-form-actions">
        <button type="button" className="portfolio-btn portfolio-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="portfolio-btn portfolio-btn-primary" disabled={isSaving}>
          <FiSave /> {isSaving ? "Saving..." : "Save Item"}
        </button>
      </div>
    </form>
  );
}
