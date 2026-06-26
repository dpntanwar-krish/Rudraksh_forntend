import React, { useEffect, useState } from "react";
import { extractVideoId, getThumbnailUrl, validateYoutubeUrl, VIDEO_CATEGORIES } from "../../utils/youtubeUtils";

const emptyForm = { title: "", youtubeUrl: "", category: VIDEO_CATEGORIES[0] };

export default function VideoForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  fixedCategory = null,
}) {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        youtubeUrl: initialData.youtubeUrl || "",
        category: initialData.category || VIDEO_CATEGORIES[0],
      });
      setPreview(initialData.thumbnail || getThumbnailUrl(initialData.videoId));
    } else {
      setForm({
        ...emptyForm,
        category: fixedCategory || VIDEO_CATEGORIES[0],
      });
      setPreview("");
    }
  }, [initialData, fixedCategory]);

  useEffect(() => {
    if (!form.youtubeUrl.trim()) {
      setPreview("");
      return;
    }
    if (!validateYoutubeUrl(form.youtubeUrl)) {
      setPreview("");
      return;
    }
    const id = extractVideoId(form.youtubeUrl);
    setPreview(id ? getThumbnailUrl(id) : "");
  }, [form.youtubeUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (!validateYoutubeUrl(form.youtubeUrl)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    if (!extractVideoId(form.youtubeUrl)) {
      setError("Could not extract video ID from URL.");
      return;
    }

    onSubmit({
      ...form,
      category: fixedCategory || form.category,
    });
  };

  return (
    <form className="yt-admin-form" onSubmit={handleSubmit}>
      <h3>{initialData ? "Edit YouTube Video" : "Add YouTube Video"}</h3>

      {error ? <p className="yt-admin-error">{error}</p> : null}

      <label>
        Video Title
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Enter video title (min 3 characters)"
          minLength={3}
          maxLength={100}
          required
        />
      </label>

      <label>
        YouTube URL
        <input
          type="url"
          value={form.youtubeUrl}
          onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
      </label>

      {!fixedCategory ? (
        <label>
          Category
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {VIDEO_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {preview ? (
        <div className="yt-admin-preview">
          <p>Thumbnail Preview</p>
          <img
            src={preview}
            alt="Thumbnail preview"
            onError={(e) => {
              const id = extractVideoId(form.youtubeUrl);
              if (id) e.currentTarget.src = getThumbnailUrl(id, "high");
            }}
          />
        </div>
      ) : null}

      <div className="yt-admin-form-actions">
        {onCancel ? (
          <button type="button" className="yt-admin-cancel" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="yt-admin-save" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Video" : "Save Video"}
        </button>
      </div>
    </form>
  );
}
