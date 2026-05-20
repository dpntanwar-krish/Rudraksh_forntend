import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { server_url } from "../url/url";
import "./SliderManager.css";

function reorderList(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function SliderManager() {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const inputRef = useRef(null);

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const fetchSliders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(server_url + "/Slider/all");
      if (res?.data?.status === true) {
        setSliders(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setStatusMsg("Unable to load sliders");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to load sliders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) {
      setStatusMsg("Please choose at least one slider image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    files.forEach((file) => formData.append("files", file));

    try {
      setStatusMsg("Uploading...");
      await axios.post(server_url + "/Slider/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatusMsg("Slider uploaded successfully");
      showToast("Slider uploaded");
      setTitle("");
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      await fetchSliders();
    } catch (err) {
      console.error(err);
      setStatusMsg(err?.response?.data?.msg || "Upload failed");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this slider?");
    if (!ok) return;
    try {
      const res = await axios.delete(server_url + "/Slider/delete/" + id);
      if (res?.data?.status === true) {
        setStatusMsg("Slider deleted");
        showToast("Slider deleted");
        await fetchSliders();
      } else {
        setStatusMsg(String(res?.data?.msg || "Delete failed"));
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Delete failed");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(server_url + "/Slider/toggle/" + id);
      if (res?.data?.status === true) {
        setSliders((prev) =>
          prev.map((row) => (row._id === id ? { ...row, isActive: res.data.data.isActive } : row))
        );
        showToast(res.data.msg || "Slider status updated");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg(err?.response?.data?.msg || "Failed to update slider status");
    }
  };

  const saveSequence = async (rows) => {
    const orderedIds = rows.map((item) => item._id);
    await axios.put(server_url + "/Slider/sequence", { orderedIds });
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const updated = reorderList(sliders, result.source.index, result.destination.index);
    setSliders(updated);

    try {
      setIsSavingSequence(true);
      await saveSequence(updated);
      showToast("Sequence updated");
    } catch (err) {
      console.error(err);
      setStatusMsg(err?.response?.data?.msg || "Failed to save sequence");
      await fetchSliders();
    } finally {
      setIsSavingSequence(false);
    }
  };

  return (
    <div className="slider-manager">
      <form className="slider-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Slider Sequence Manager</h2>
        <input
          type="text"
          placeholder="Slider title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          ref={inputRef}
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button type="submit">Upload New Slider</button>
        <p className="slider-status">{statusMsg}</p>
      </form>

      {toastMsg ? <div className="slider-toast">{toastMsg}</div> : null}
      {isSavingSequence ? <p className="slider-saving">Saving new sequence...</p> : null}

      {isLoading ? (
        <div className="slider-loading">Loading sliders...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="slider-sequence">
            {(provided) => (
              <div className="slider-grid" ref={provided.innerRef} {...provided.droppableProps}>
                {sliders.map((item, index) => (
                  <Draggable key={item._id} draggableId={item._id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        className={`slider-card ${snapshot.isDragging ? "dragging" : ""}`}
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                      >
                        <div className="slider-card-seq">#{index + 1}</div>
                        <div className="slider-card-handle" {...dragProvided.dragHandleProps} title="Drag to reorder">
                          Drag
                        </div>
                        <img src={item.imageUrl || item.image} alt={item.title || "Slider"} />
                        <div className="slider-card-foot">
                          <p>{item.title || "Untitled slider"}</p>
                          <div className="slider-actions">
                            <button type="button" onClick={() => handleToggle(item._id)}>
                              {item.isActive ? "Active" : "Inactive"}
                            </button>
                            <button type="button" onClick={() => handleDelete(item._id)} aria-label="Delete slider">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
