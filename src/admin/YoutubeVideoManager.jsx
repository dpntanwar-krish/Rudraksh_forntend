import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { formatVideoDate } from "../utils/youtubeUtils";
import { videoService } from "../services/videoService";
import { useVideos } from "../hooks/useVideos";
import VideoForm from "../components/videos/VideoForm";
import "./YoutubeVideoManager.css";

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

  useEffect(() => setVal(index + 1), [index]);

  const handleBlur = () => {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) parsed = index + 1;
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
      className="yt-seq-input"
      title="Type to change order"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export default function YoutubeVideoManager({ category = "Photoshoot & Video" }) {
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);

  const { videos, loading, refetch } = useVideos({ category, includeInactive: true, limit: 100 });

  useEffect(() => {
    setVideoList(sortBySequence(videos));
  }, [videos]);

  useEffect(() => {
    setShowForm(false);
    setEditingVideo(null);
    setDeleteTarget(null);
  }, [category]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDndEnabled(true));
    return () => {
      cancelAnimationFrame(id);
      setDndEnabled(false);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  const saveSequence = async (ordered) => {
    setIsSavingSequence(true);
    try {
      const res = await videoService.updateSequence(ordered.map((video) => video._id));
      if (res?.data?.success) {
        showToast("Video sequence updated");
      } else {
        throw new Error(res?.data?.message || "Save sequence failed");
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Save sequence failed");
      refetch();
    } finally {
      setIsSavingSequence(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered = reorderList(videoList, result.source.index, result.destination.index);
    const updated = reordered.map((video, idx) => ({ ...video, sequence: idx + 1 }));
    setVideoList(updated);
    saveSequence(updated);
  };

  const handleSequenceChange = (currentIndex, newPos) => {
    if (newPos < 1 || newPos > videoList.length) return;
    const newIndex = newPos - 1;
    if (currentIndex === newIndex) return;

    const reordered = reorderList(videoList, currentIndex, newIndex);
    const updated = reordered.map((video, idx) => ({ ...video, sequence: idx + 1 }));
    setVideoList(updated);
    saveSequence(updated);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const res = editingVideo
        ? await videoService.update(editingVideo._id, form)
        : await videoService.create(form);

      if (res?.data?.success) {
        showToast(editingVideo ? "Video updated." : "Video added.");
        setShowForm(false);
        setEditingVideo(null);
        refetch();
      } else {
        alert(res?.data?.message || "Save failed.");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await videoService.remove(deleteTarget._id);
      if (res?.data?.success) {
        showToast("Video deleted.");
        setDeleteTarget(null);
        refetch();
      } else {
        alert(res?.data?.message || "Delete failed.");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section className="yt-admin-page">
      <header className="yt-admin-head">
        <div>
          <h2>{category}</h2>
          <p>Manage YouTube videos for {category}. Drag cards to reorder.</p>
        </div>
        <button
          type="button"
          className="yt-admin-add-btn"
          onClick={() => {
            setEditingVideo(null);
            setShowForm(true);
          }}
        >
          Add Video
        </button>
      </header>

      {toast ? <div className="yt-admin-toast">{toast}</div> : null}
      {isSavingSequence ? <p className="yt-admin-saving">Saving new sequence...</p> : null}

      {showForm ? (
        <VideoForm
          initialData={editingVideo}
          fixedCategory={category}
          loading={saving}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingVideo(null);
          }}
        />
      ) : null}

      <div className="yt-admin-list">
        <h3>{category} Videos ({videoList.length})</h3>
        {loading ? <p className="yt-admin-loading">Loading videos...</p> : null}
        {!loading && videoList.length === 0 ? (
          <p className="yt-admin-empty">No YouTube videos in {category} yet.</p>
        ) : null}

        {dndEnabled && videoList.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`youtube-videos-grid-${category}`} direction="horizontal">
              {(provided) => (
                <div className="yt-admin-grid" ref={provided.innerRef} {...provided.droppableProps}>
                  {videoList.map((video, index) => (
                    <Draggable key={video._id} draggableId={video._id} index={index}>
                      {(dragProvided, snapshot) => (
                        <article
                          className={`yt-admin-card ${snapshot.isDragging ? "dragging" : ""}`}
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <div className="yt-admin-card-seq" onClick={(e) => e.stopPropagation()}>
                            #<SequenceInput index={index} total={videoList.length} onChange={handleSequenceChange} />
                          </div>
                          <img src={video.thumbnail} alt={video.title} className="yt-admin-thumb" loading="lazy" />
                          <div className="yt-admin-card-body">
                            <h4>{video.title}</h4>
                            <p>{formatVideoDate(video.createdAt)}</p>
                            <div className="yt-admin-card-actions">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingVideo(video);
                                  setShowForm(true);
                                }}
                              >
                                Edit
                              </button>
                              <button type="button" className="danger" onClick={() => setDeleteTarget(video)}>
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
        ) : null}
      </div>

      {deleteTarget ? (
        <div className="yt-admin-modal-overlay">
          <div className="yt-admin-modal" role="dialog" aria-modal="true">
            <h3>Delete Video?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
            </p>
            <div className="yt-admin-form-actions">
              <button type="button" className="yt-admin-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="yt-admin-save danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
