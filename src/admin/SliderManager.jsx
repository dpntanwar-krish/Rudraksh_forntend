import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { server_url } from "../url/url";
import "./SliderManager.css";

export default function SliderManager() {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const inputRef = useRef(null);

  const fetchSliders = async () => {
    try {
      const res = await axios.get(server_url + "/Slider/all");
      if (res?.data?.status === true) {
        setSliders(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to load sliders");
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
      setTitle("");
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      fetchSliders();
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
        fetchSliders();
      } else {
        setStatusMsg(String(res?.data?.msg || "Delete failed"));
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Delete failed");
    }
  };

  return (
    <div className="slider-manager">
      <form className="slider-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Slider Manager</h2>
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
        <button type="submit">Upload Slider</button>
        <p className="slider-status">{statusMsg}</p>
      </form>

      <div className="slider-grid">
        {sliders.map((item) => (
          <div className="slider-card" key={item._id}>
            <img src={item.imageUrl} alt={item.title || "Slider"} />
            <div className="slider-card-foot">
              <p>{item.title || "Untitled slider"}</p>
              <button type="button" onClick={() => handleDelete(item._id)} aria-label="Delete slider">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
