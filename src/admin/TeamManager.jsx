import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { server_url } from "../url/url";
import "./TeamManager.css";

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
    if (Number.isNaN(parsed)) parsed = index + 1;
    if (parsed < 1) parsed = 1;
    if (parsed > total) parsed = total;
    if (parsed !== index + 1) onChange(index, parsed);
    else setVal(index + 1);
  };

  return (
    <input
      type="number"
      min="1"
      max={total}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      className="seq-input"
      title="Type to change order"
    />
  );
}

const emptyForm = {
  name: "",
  role: "",
  image: null,
  facebook: "",
  twitter: "",
  behance: "",
  linkedin: "",
  isActive: true,
};

export default function TeamManager() {
  const [showForm, setShowForm] = useState(false);
  const [teamItems, setTeamItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);

  const emptyMessage = useMemo(
    () => (loading ? "Loading team members..." : status || "No team members yet. Add your first team card."),
    [loading, status],
  );

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server_url}/Team/all`);
      const data = res?.data?.status ? (Array.isArray(res.data.data) ? res.data.data : []) : [];
      setTeamItems(sortBySequence(data));
      if (!res?.data?.status) setStatus(res?.data?.msg || "Unable to load team members.");
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDndEnabled(true));
    return () => {
      cancelAnimationFrame(frame);
      setDndEnabled(false);
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.name.trim()) {
      setStatus("Name is required.");
      return;
    }
    if (!form.role.trim()) {
      setStatus("Role is required.");
      return;
    }
    if (!editingId && !form.image) {
      setStatus("Photo is required.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("role", form.role.trim());
    data.append("facebook", form.facebook.trim());
    data.append("twitter", form.twitter.trim());
    data.append("behance", form.behance.trim());
    data.append("linkedin", form.linkedin.trim());
    data.append("isActive", form.isActive ? "true" : "false");
    if (form.image) data.append("image", form.image);

    try {
      let res;
      if (editingId) {
        res = await axios.put(`${server_url}/Team/update/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${server_url}/Team/save`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res?.data?.status) {
        setForm(emptyForm);
        setShowForm(false);
        setEditingId(null);
        setStatus("Team member saved successfully!");
        await fetchTeam();
      } else {
        setStatus(String(res?.data?.msg || "Unable to save."));
      }
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to save.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setForm({
      name: item.name || "",
      role: item.role || "",
      image: null,
      facebook: item.facebook || "",
      twitter: item.twitter || "",
      behance: item.behance || "",
      linkedin: item.linkedin || "",
      isActive: item.isActive !== false,
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      const res = await axios.delete(`${server_url}/Team/delete/${id}`);
      if (res?.data?.status) {
        setStatus("Team member deleted.");
        fetchTeam();
      } else {
        setStatus(String(res?.data?.msg || "Unable to delete."));
      }
    } catch (err) {
      setStatus(err?.response?.data?.msg || "Unable to delete.");
    }
  };

  const saveTeamSequence = async (orderedItems) => {
    try {
      setIsSavingSequence(true);
      const orderedIds = orderedItems.map((v) => v._id);
      await axios.put(`${server_url}/Team/sequence`, { orderedIds });
    } catch (err) {
      console.error(err);
      setStatus("Failed to save team sequence");
      fetchTeam();
    } finally {
      setIsSavingSequence(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = reorderList(teamItems, result.source.index, result.destination.index);
    const updated = reordered.map((item, idx) => ({ ...item, sequence: idx }));
    setTeamItems(updated);
    saveTeamSequence(updated);
  };

  const handleSequenceChange = (currentIndex, newPosition) => {
    if (newPosition < 1 || newPosition > teamItems.length) return;
    let newIndex = newPosition - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= teamItems.length) newIndex = teamItems.length - 1;
    if (currentIndex === newIndex) return;

    const reordered = reorderList(teamItems, currentIndex, newIndex);
    const updated = reordered.map((item, idx) => ({ ...item, sequence: idx }));
    setTeamItems(updated);
    saveTeamSequence(updated);
  };

  const existingImage = teamItems.find((i) => i._id === editingId)?.imageUrl;

  return (
    <section className="team-manager-page">
      <header className="team-head">
        <div>
          <h2>Team Manager</h2>
          <p>Add, edit, and reorder team cards shown on the About page.</p>
        </div>
        <button
          type="button"
          className="team-add-btn"
          onClick={() => {
            setShowForm(!showForm);
            setStatus("");
            setForm(emptyForm);
            setEditingId(null);
          }}
        >
          {showForm ? "Close" : "Add Team Member"}
        </button>
      </header>

      {status && (
        <div className={`team-status ${status.toLowerCase().includes("success") ? "is-success" : "is-error"}`}>
          {status}
        </div>
      )}

      {isSavingSequence && <p className="team-saving">Saving new sequence...</p>}

      {showForm && (
        <form className="team-form" onSubmit={handleSave}>
          <h3>{editingId ? "Edit Team Member" : "New Team Member"}</h3>
          <div className="team-form-grid">
            <label>
              Full Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Member name"
                required
              />
            </label>
            <label>
              Role / Designation
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Wall Designer"
                required
              />
            </label>
          </div>

          <label className="team-file-label">
            Photo {editingId ? "(optional — leave empty to keep current)" : ""}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
            />
          </label>
          {existingImage && editingId && (
            <img src={existingImage} alt="Current" className="team-form-preview" />
          )}

          <div className="team-form-grid team-form-grid-4">
            <label>
              Facebook URL
              <input type="url" value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
            </label>
            <label>
              Twitter URL
              <input type="url" value={form.twitter} onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))} placeholder="https://twitter.com/..." />
            </label>
            <label>
              Behance URL
              <input type="url" value={form.behance} onChange={(e) => setForm((f) => ({ ...f, behance: e.target.value }))} placeholder="https://behance.net/..." />
            </label>
            <label>
              LinkedIn URL
              <input type="url" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
            </label>
          </div>

          <label className="team-active-check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Show on About page
          </label>

          <button type="submit" className="team-save-btn" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Member" : "Save Member"}
          </button>
        </form>
      )}

      <section className="team-list-panel">
        <h3>Team List</h3>
        {teamItems.length === 0 ? (
          <div className="team-empty">{emptyMessage}</div>
        ) : (
          <div className="admin-team-grid-wrap">
            {dndEnabled ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="team-list" direction="horizontal">
                  {(provided) => (
                    <div className="admin-team-grid" ref={provided.innerRef} {...provided.droppableProps}>
                      {teamItems.map((item, index) => (
                        <Draggable key={item._id} draggableId={String(item._id)} index={index}>
                          {(dragProvided, snapshot) => (
                            <article
                              className={`admin-team-card ${snapshot.isDragging ? "dragging" : ""} ${item.isActive === false ? "is-hidden" : ""}`}
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <div className="admin-team-card-seq" onClick={(e) => e.stopPropagation()}>
                                #<SequenceInput index={index} total={teamItems.length} onChange={handleSequenceChange} />
                              </div>
                              <span className={`admin-team-badge ${item.isActive !== false ? "active" : "inactive"}`}>
                                {item.isActive !== false ? "Active" : "Hidden"}
                              </span>
                              <div className="admin-team-card-photo">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} />
                                ) : (
                                  <div className="admin-team-card-placeholder">{item.name?.charAt(0) || "?"}</div>
                                )}
                              </div>
                              <div className="admin-team-card-body">
                                <h4>{item.name}</h4>
                                <p className="admin-team-card-role">{item.role}</p>
                                <div className="admin-team-card-socials">
                                  {item.facebook ? <span title="Facebook">FB</span> : null}
                                  {item.twitter ? <span title="Twitter">TW</span> : null}
                                  {item.behance ? <span title="Behance">Be</span> : null}
                                  {item.linkedin ? <span title="LinkedIn">in</span> : null}
                                </div>
                                <div className="admin-team-actions">
                                  <button type="button" className="edit-icon-btn" title="Edit" onClick={() => handleEditClick(item)}>
                                    Edit
                                  </button>
                                  <button type="button" className="delete-icon-btn" title="Delete" onClick={() => handleDelete(item._id)}>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </article>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <p className="admin-team-loading">Initializing team list...</p>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
