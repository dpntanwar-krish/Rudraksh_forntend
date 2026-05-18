import { useMemo, useState } from "react";
import "./NewsManager.css";

export default function NewsManager() {
  const [isTickerOn, setIsTickerOn] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [status, setStatus] = useState("");

  const emptyMessage = useMemo(() => {
    if (status) return status;
    return "Unable to load news items.";
  }, [status]);

  const handleAddNews = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setStatus("Title is required.");
      return;
    }

    const newItem = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
    };
    setNewsItems((prev) => [newItem, ...prev]);
    setForm({ title: "", description: "" });
    setStatus("");
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setNewsItems((prev) => prev.filter((item) => item.id !== id));
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
              <article className="news-item" key={item.id}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description || "No description"}</p>
                </div>
                <button type="button" onClick={() => handleDelete(item.id)}>
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
