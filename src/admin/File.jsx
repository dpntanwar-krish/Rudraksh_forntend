import React, { useEffect, useState } from "react";
import "./File.css";
import axios from "axios";
import { server_url } from "../url/url";

function File() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [title, setTitle] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [fRes, iRes] = await Promise.all([
        axios.get(`${server_url}/File/folders`),
        axios.get(`${server_url}/File/files`),
      ]);
      setFolders(fRes.data.data || []);
      setFiles(iRes.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await axios.post(`${server_url}/File/create-folder`, { folder: newFolderName });
      setNewFolderName("");
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFiles.length || !selectedFolder) return;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("folder", selectedFolder);
    uploadFiles.forEach(f => formData.append("files", f));

    setLoading(true);
    try {
      await axios.post(`${server_url}/File/upload`, formData);
      setTitle("");
      setUploadFiles([]);
      fetchData();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Delete image?")) return;
    await axios.get(`${server_url}/File/deleteImage/${id}`);
    fetchData();
  };

  const handleDeleteFolder = async (name) => {
    if (!window.confirm(`Delete folder "${name}" and all contents?`)) return;
    await axios.delete(`${server_url}/File/delete-folder/${name}`);
    fetchData();
  };

  const filteredFiles = files.filter(f => f.folder === selectedFolder && f.imageUrl);

  return (
    <div className="file-page">
      <div className="file-wrap">
        <div className="manager-header">
          <h1 className="file-title">{selectedFolder ? `Folder: ${selectedFolder}` : "Image Gallery"}</h1>
          <div className="header-btns">
            {selectedFolder ? (
              <button className="back-btn" onClick={() => setSelectedFolder(null)}>← Back</button>
            ) : (
              <button className="create-folder-btn" onClick={() => setShowModal(true)}>+ New Folder</button>
            )}
          </div>
        </div>

        {showModal && (
          <div className="folder-modal-overlay">
            <div className="folder-modal">
              <h3>Create New Folder</h3>
              <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder Name" />
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button onClick={handleCreateFolder}>Create</button>
              </div>
            </div>
          </div>
        )}

        {!selectedFolder ? (
          <div className="folder-grid">
            {folders.map(f => (
              <div className="folder-card" key={f.name} onClick={() => setSelectedFolder(f.name)}>
                <div className="folder-icon">📂</div>
                <div className="folder-details">
                  <span className="folder-name">{f.name}</span>
                  <span className="folder-count">{f.count} items</span>
                </div>
                <button className="folder-del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.name); }} title="Delete Folder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <form className="file-form" onSubmit={handleUpload}>
              <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="file" multiple onChange={e => setUploadFiles(Array.from(e.target.files))} />
              <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload to Folder"}</button>
            </form>

            <div className="file-grid">
              {filteredFiles.map(file => (
                <div className="file-card" key={file._id}>
                  <img src={file.imageUrl} className="file-img" alt="" />
                  <div className="file-content">
                    <span className="file-name">{file.title || "Untitled"}</span>
                    <button className="delete-btn" onClick={() => handleDeleteFile(file._id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default File;