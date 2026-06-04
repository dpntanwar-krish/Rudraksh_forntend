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

function SequenceInput({ index, total, onChange }) {
  const [val, setVal] = useState(index + 1);

  useEffect(() => {
    setVal(index + 1);
  }, [index]);

  const handleBlur = () => {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) parsed = index + 1;
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

  const handleSequenceChange = async (currentIndex, newPosition) => {
    let newIndex = newPosition - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= sliders.length) newIndex = sliders.length - 1;

    if (currentIndex === newIndex) return;

    const updated = reorderList(sliders, currentIndex, newIndex);
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
                        <div className="slider-card-seq">
                          #<SequenceInput index={index} total={sliders.length} onChange={handleSequenceChange} />
                        </div>
                        <div className="slider-card-handle" {...dragProvided.dragHandleProps} title="Drag to reorder">
                          Drag
                        </div>
                        <img src={item.imageUrl || item.image} alt={item.title || "Slider"} />
                        <div className="slider-card-foot">
                          <p>{item.title || "Untitled slider"}</p>
                          <div className="slider-actions">
                            <button type="button" onClick={() => handleToggle(item._id)}>
                              {item.isActive ? "Turn Off" : "Turn On"}
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
