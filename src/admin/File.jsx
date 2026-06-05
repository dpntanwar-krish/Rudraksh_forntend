import React, { useEffect, useState } from "react";
import "./File.css";
import axios from "axios";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { server_url } from "../url/url";

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

function File() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);
  const currentParent = breadcrumbs[breadcrumbs.length - 1];

  const fetchData = async () => {
    try {
      const [fRes, iRes] = await Promise.all([
        axios.get(`${server_url}/File/folders?parentId=${currentParent.id || ""}`),
        axios.get(`${server_url}/File/files`),
      ]);
      setFolders(fRes.data.data || []);
      setFiles(iRes.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [currentParent]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await axios.post(`${server_url}/File/create-folder`, { 
        folder: newFolderName, 
        parentId: currentParent.id 
      });
      setNewFolderName("");
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const targetFolder = currentParent.id; // Target folder must be currentParent.id
    if (!uploadFiles.length) return;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("folder", targetFolder);
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

  const saveSequence = async (updatedFolders) => {
    try {
      setIsSavingSequence(true);
      const folderNames = updatedFolders.map(f => f.name);
      await axios.put(`${server_url}/File/folders/sequence`, { folderNames });
    } catch (err) {
      console.error(err);
      alert("Failed to save folder sequence");
      fetchData();
    } finally {
      setIsSavingSequence(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const updated = reorderList(folders, result.source.index, result.destination.index);
    setFolders(updated);
    saveSequence(updated);
  };

  const handleSequenceChange = (currentIndex, newPosition) => {
    let newIndex = newPosition - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= folders.length) newIndex = folders.length - 1;

    if (currentIndex === newIndex) return;

    const updated = reorderList(folders, currentIndex, newIndex);
    setFolders(updated);
    saveSequence(updated);
  };

  const navigateToFolder = (folder) => {
    setBreadcrumbs([...breadcrumbs, { id: folder.name, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
  };

  const targetFolder = currentParent.id || "gallery";
  const filteredFiles = files.filter(f => f.folder === targetFolder && f.imageUrl);

  return (
    <div className="file-page">
      <div className="file-wrap">
        <div className="manager-header">
          <div className="breadcrumb-nav">
            {breadcrumbs.map((b, i) => (
              <span key={i}>
                <button 
                  className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'active' : ''}`}
                  onClick={() => navigateToBreadcrumb(i)}
                >
                  {b.name}
                </button>
                {i < breadcrumbs.length - 1 && <span className="breadcrumb-sep">/</span>}
              </span>
            ))}
          </div>
          <div className="header-btns">
            {!currentParent.id && (
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

        <div className="manager-content">
          {/* Sub-Folders Section */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="folders-grid" direction="horizontal">
              {(provided) => (
                <div className="folder-grid" style={{ marginBottom: folders.length > 0 ? '40px' : '0' }} ref={provided.innerRef} {...provided.droppableProps}>
                  {folders.map((f, index) => (
                    <Draggable key={f.name} draggableId={f.name} index={index}>
                      {(dragProvided, snapshot) => (
                        <div
                          className={`folder-card ${snapshot.isDragging ? "dragging" : ""}`}
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => navigateToFolder(f)}
                        >
                          <div className="slider-card-seq" style={{ top: "4px", left: "4px" }}>
                            #<SequenceInput index={index} total={folders.length} onChange={handleSequenceChange} />
                          </div>
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Upload Form and Files Grid Section (Only visible when inside a folder) */}
          {currentParent.id && (
            <>
              <form className="file-form" onSubmit={handleUpload}>
                <input type="text" placeholder="Image Title" value={title} onChange={e => setTitle(e.target.value)} />
                <input type="file" multiple onChange={e => setUploadFiles(Array.from(e.target.files))} />
                <button type="submit" disabled={loading}>
                  {loading ? "Uploading..." : `Upload to ${currentParent.name}`}
                </button>
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
    </div>
  );
}

export default File;