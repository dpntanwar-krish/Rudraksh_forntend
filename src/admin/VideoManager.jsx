import React, { useEffect, useRef, useState } from "react";
import "./File.css";
import axios from "axios";
import { server_url } from "../url/url";

function VideoManager() {
  const [title, setTitle] = useState("");
  const [videos, setVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const videoInputRef = useRef(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(server_url + "/Video/videos");
      setAllVideos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("[Video] Failed to fetch videos:", error?.response?.data || error.message);
      setStatusMsg("Failed to fetch videos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const videoFiles = [];
    let error = "";
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    for (const file of selectedFiles) {
      if (file.size > MAX_SIZE) {
        error += `${file.name} is too large (max 8MB).\n`;
      } else {
        videoFiles.push(file);
      }
    }

    if (error) {
      alert(error);
      // filter out oversized files from input
      const validFiles = new DataTransfer();
      videoFiles.forEach(f => validFiles.items.add(f));
      e.target.files = validFiles.files;
    }
    setVideos(videoFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videos.length) {
      alert("Please select at least one video before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    for (let i = 0; i < videos.length; i++) {
      formData.append("videos", videos[i]);
    }

    setStatusMsg("Uploading...");
    try {
      await axios.post(server_url + "/Video/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Uploaded successfully!");
      setStatusMsg("Uploaded successfully!");
      await fetchVideos();
      setTitle("");
      setVideos([]);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.msg || "Upload failed";
      alert(errorMessage);
      setStatusMsg(errorMessage);
    }
  };

  const deleteVideo = async (id) => {
    try {
      const isConfirmed = window.confirm("Do you want to delete this video?");
      if (!isConfirmed) {
        return;
      }

      const response = await axios.delete(server_url + `/Video/delete/${id}`);

      if (response.data.status === true) {
        await fetchVideos();
        alert(`Deleted successfully!`);
      } else {
        alert(response.data.msg);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="file-page">
      <div className="file-wrap">
        <h1 className="file-title">Video Upload Form</h1>

        <form className="file-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            className="file-input"
            type="text"
            placeholder="Video title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="file-input"
            type="file"
            name="videos"
            multiple
            accept="video/*"
            ref={videoInputRef}
            onChange={handleFileChange}
          />
          <p className="file-help-text">
            {videos.length ? `${videos.length} video(s) selected` : "Select one or more videos (max 8MB each)"}
          </p>

          <button className="upload-btn" type="submit">
            Upload
          </button>
          {statusMsg && <p className="status-msg">{statusMsg}</p>}
        </form>

        <div className="file-grid">
          {isLoading ? (
            <p>Loading videos...</p>
          ) : allVideos.length > 0 ? (
            allVideos.map((item) => (
              <div key={item._id} className="file-card">
                {item.videoUrl ? (
                  <video
                    className="file-img"
                    controls
                    src={
                      item.videoUrl && item.videoUrl.startsWith('/')
                        ? server_url + item.videoUrl
                        : item.videoUrl
                    }
                    style={{ backgroundColor: "#000", objectFit: "contain", maxHeight: "250px" }}
                  />
                ) : null}

                <div className="file-content">
                  <h3 className="file-name">{item.title || "Untitled"}</h3>
                  <button className="delete-btn" type="button" onClick={() => deleteVideo(item._id)}>
                    <svg className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No videos found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoManager;