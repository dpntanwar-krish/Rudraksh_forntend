import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import NewsForm from "./NewsForm";
import "./NewsManager.css";
// import { server_url } from "../url/url";
const  server_url= require("dotenv");
server_url.config();
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

function reorderList(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function sortBySequence(list) {
  return [...list].sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));
}

function SequenceInput({ index, total, onChange }) {
  const [val, setVal] = useState(index + 1);

  useEffect(() => {
    setVal(index + 1);
  }, [index]);

  const handleBlur = () => {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) parsed = index + 1;
    if (parsed < 1) parsed = 1;
    if (parsed > total) parsed = total;
    if (parsed !== index + 1) {
      onChange(index, parsed);
    } else {
      setVal(index + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  return (
    <input type="number" min="1" max={total} value={val} onChange={(e) => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} className="seq-input" title="Type to change order" />
  );
}

export default function NewsManager() {
  const [isTickerOn, setIsTickerOn] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);

  const emptyMessage = useMemo(() => loading ? "Loading news items..." : status || "Unable to load news items.", [loading, status]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(server_url + "/News/all");
      const data = res?.data?.status ? (Array.isArray(res.data.data) ? res.data.data : []) : [];
      setNewsItems(sortBySequence(data));
      setStatus(res?.data?.status ? "" : (res?.data?.msg || "Unable to load."));
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDndEnabled(true));
    return () => {
      cancelAnimationFrame(frame);
      setDndEnabled(false);
    };
  }, []);

  const handleSaveNews = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!form.title.trim()) { setStatus("Title is required."); return; }
    if (!editingId && !form.image) { setStatus("Image is required."); return; }
    
    setLoading(true);
    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("description", form.description.trim());
    if (form.image) data.append("image", form.image);
    
    try {
      let res;
      if (editingId) {
        res = await axios.put(`${server_url}/News/update/${editingId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        res = await axios.post(server_url + "/News/save", data, { headers: { "Content-Type": "multipart/form-data" } });
      }

      if (res?.data?.status) { 
        setForm({ title: "", description: "", image: null }); 
        setShowForm(false); 
        setEditingId(null);
        setStatus("News saved successfully!");
        await fetchNews(); 
      } else {
        setStatus(String(res?.data?.msg || "Unable to save."));
      }
    } catch (err) { setStatus(err?.response?.data?.msg || "Unable to save."); }
    finally { setLoading(false); }
  };

  const handleEditClick = (item) => {
    setForm({ title: item.title, description: item.description || "", image: null });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      const res = await axios.delete(server_url + "/News/delete/" + id);
      if (res?.data?.status) fetchNews();
      else setStatus(String(res?.data?.msg || "Unable to delete."));
    } catch (err) { setStatus(err?.response?.data?.msg || "Unable to delete."); }
  };

  const saveNewsSequence = async (orderedItems) => {
    try {
      setIsSavingSequence(true);
      const orderedIds = orderedItems.map((v) => v._id);
      await axios.put(`${server_url}/News/sequence`, { orderedIds });
    } catch (err) {
      console.error(err);
      setStatus("Failed to save news sequence");
      fetchNews();
    } finally {
      setIsSavingSequence(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered = reorderList(newsItems, result.source.index, result.destination.index);
    // Optimistically update sequence numbers locally
    const updated = reordered.map((item, idx) => ({ ...item, sequence: idx + 1 }));
    setNewsItems(updated);
    saveNewsSequence(updated);
  };

  const handleSequenceChange = (currentIndex, newPosition) => {
    if (newPosition < 1 || newPosition > newsItems.length) return;
    let newIndex = newPosition - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= newsItems.length) newIndex = newsItems.length - 1;

    if (currentIndex === newIndex) return;

    const reordered = reorderList(newsItems, currentIndex, newIndex);
    const updated = reordered.map((item, idx) => ({ ...item, sequence: idx + 1 }));
    setNewsItems(updated);
    saveNewsSequence(updated);
  };

  return (
    <section className="news-manager-page">
      <header className="news-head">
        <div>
          <h2>News Manager</h2>
          <p>Add, edit, and delete items shown on news page.</p>
        </div>

        <div className="news-head-actions">
          <button type="button" className="news-add-btn" onClick={() => { setShowForm(!showForm); setStatus(""); setForm({ title: "", description: "", image: null }); setEditingId(null); }}>
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

      {status && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', backgroundColor: status.includes('successfully') ? '#dcfce7' : '#fee2e2', color: status.includes('successfully') ? '#166534' : '#991b1b', border: `1px solid ${status.includes('successfully') ? '#bbf7d0' : '#fecaca'}`, fontWeight: '600', textAlign: 'center' }}>
          {status}
        </div>
      )}

      {isSavingSequence && <p className="news-saving">Saving new sequence...</p>}

      {showForm && (
        <NewsForm 
          form={form} 
          setForm={setForm} 
          onSubmit={handleSaveNews} 
          isLoading={loading} 
          isEditing={!!editingId}
          existingImage={newsItems.find(i => i._id === editingId)?.imageUrl}
        />
      )}

      <section className="news-list-panel">
        <h3>News List</h3>
        {newsItems.length === 0 ? (
          <div className="news-empty">{emptyMessage}</div>
        ) : (
          <div className="news-table-wrap">
            {dndEnabled ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <table className="news-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>News Title</th>
                      <th>Description</th>
                      <th>Image</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <Droppable droppableId="news-list">
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {newsItems.map((item, index) => (
                          <Draggable key={item._id} draggableId={String(item._id)} index={index}>
                            {(dragProvided, snapshot) => (
                              <tr 
                                ref={dragProvided.innerRef} 
                                {...dragProvided.draggableProps} 
                                {...dragProvided.dragHandleProps}
                                className={snapshot.isDragging ? "dragging" : ""}
                              >
                                <td className="news-sr-cell" data-label="Sr. No.">
                                  <SequenceInput index={index} total={newsItems.length} onChange={handleSequenceChange} />
                                </td>
                                <td className="news-title-cell" data-label="Title"><strong>{item.title}</strong></td>
                                <td className="news-desc-cell" data-label="Description">{item.description || "No description"}</td>
                                <td data-label="Image">
                                  {item.imageUrl ? (
                                    <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                                      {item.imageUrl.toLowerCase().endsWith(".pdf") ? (
                                        <div className="news-table-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>PDF</div>
                                      ) : (
                                        <img className="news-table-thumb" src={item.imageUrl} alt={item.title} />
                                      )}
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td data-label="Action">
                                  <div className="news-actions">
                                    <button type="button" className="edit-icon-btn" title="Edit" onClick={() => handleEditClick(item)}>
                                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="delete-icon-btn"
                                      onClick={() => handleDelete(item._id)}
                                      title="Delete"
                                    >
                                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                        <path d="M10 11v6"></path>
                                        <path d="M14 11v6"></path>
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </table>
              </DragDropContext>
            ) : (
              <p>Initializing news list...</p>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
