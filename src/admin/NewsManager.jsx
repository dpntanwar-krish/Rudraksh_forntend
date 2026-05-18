import { useMemo, useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import "./NewsManager.css";
import { server_url } from "../url/url";

export default function NewsManager() {
  const [isTickerOn, setIsTickerOn] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const emptyMessage = useMemo(() => {
    if (loading) return "Loading news items...";
    if (status) return status;
    return "Unable to load news items.";
  }, [loading, status]);

  const fetchNews = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await axios.get(server_url + "/News/all");
      if (res?.data?.status === true) {
        setNewsItems(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setStatus(String(res?.data?.msg || "Unable to load news items."));
      }
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to load news items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setStatus("Title is required.");
      return;
    }
    if (!form.image) {
      setStatus("News image is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("image", form.image);

      const res = await axios.post(server_url + "/News/save", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.status === true) {
        setForm({ title: "", description: "", image: null });
        setStatus("");
        setShowForm(false);
        fetchNews();
      } else {
        setStatus(String(res?.data?.msg || "Unable to save news."));
      }
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to save news.");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this news item?");
    if (!ok) return;
    try {
      const res = await axios.delete(server_url + "/News/delete/" + id);
      if (res?.data?.status === true) {
        fetchNews();
      } else {
        setStatus(String(res?.data?.msg || "Unable to delete news."));
      }
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to delete news.");
    }
  };

  return (
    <section className="news-manager-page">
      <header className="news-head">
        <div>
          <h2>News Manager</h2>
          <p>Add, edit, and delete items shown on news page.</p>
        </div>

        <div className="news-head-actions">
          <button type="button" className="news-add-btn" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "Add News"}
          </button>

          <button
            type="button"
            className={`news-toggle ${isTickerOn ? "is-on" : ""}`}
            onClick={() => setIsTickerOn((v) => !v)}
            aria-label="Toggle news scroll running"
          >
            <span className="news-toggle-label">News scroll running</span>
            <span className="news-toggle-pill">
              <span className="state">{isTickerOn ? "ON" : "OFF"}</span>
              <span className="knob" />
            </span>
          </button>
        </div>
      </header>

      {showForm ? (
        <form className="news-form" onSubmit={handleAddNews}>
          <input
            type="text"
            placeholder="News title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
          />
          <textarea
            rows={3}
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button type="submit">Save News</button>
        </form>
      ) : null}

      <section className="news-list-panel">
        <h3>News List</h3>

        {newsItems.length === 0 ? (
          <div className="news-empty">{emptyMessage}</div>
        ) : (
          <div className="news-list">
            {newsItems.map((item) => (
              <article className="news-item" key={item._id}>
                <div>
                  {item.imageUrl ? <img className="news-thumb" src={item.imageUrl} alt={item.title} /> : null}
                  <h4>{item.title}</h4>
                  <p>{item.description || "No description"}</p>
                </div>
                <button type="button" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
