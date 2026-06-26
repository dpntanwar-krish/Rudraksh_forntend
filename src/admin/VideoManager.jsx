import React, { useEffect, useState } from "react";
import "./File.css";
import axios from "axios";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { server_url } from "../url/url";
import { extractVideoId, validateYoutubeUrl, getThumbnailUrl } from "../utils/youtubeUtils";

function reorderList(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function sortBySequence(list) {
  return [...list].sort((a, b) => {
    const folderA = a.folder || "";
    const folderB = b.folder || "";
    if (folderA !== folderB) return folderA.localeCompare(folderB);
    return (Number(a.sequence) || 0) - (Number(b.sequence) || 0);
  });
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

function VideoManager() {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [allVideos, setAllVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderName, setEditingFolderName] = useState("");
  const [editingFolderNewName, setEditingFolderNewName] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editingItemTitle, setEditingItemTitle] = useState("");
  const [editingItemUrl, setEditingItemUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);
  const currentParent = breadcrumbs[breadcrumbs.length - 1];

  const targetFolder = currentParent.id;

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const videoQuery = currentParent.id
        ? `?folder=${encodeURIComponent(targetFolder)}`
        : "";

      const [vRes, fRes] = await Promise.all([
        axios.get(`${server_url}/Video/videos${videoQuery}`),
        axios.get(`${server_url}/Video/folders?parentId=${currentParent.id || ""}`)
      ]);

      const videoData = Array.isArray(vRes.data) ? vRes.data : [];
      setAllVideos(sortBySequence(videoData));
      setFolders(sortBySequence(fRes.data.data || []));
    } catch (error) {
      setStatusMsg("Failed to fetch.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentParent]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDndEnabled(true));
    return () => {
      cancelAnimationFrame(frame);
      setDndEnabled(false);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentParent.id) return alert("Open a folder first");
    if (!title.trim()) return alert("Title is required");
    if (!validateYoutubeUrl(youtubeUrl)) return alert("Valid YouTube URL is required");

    setStatusMsg("Uploading...");
    try {
      await axios.post(`${server_url}/Video/youtube`, {
        title: title.trim(),
        folder: targetFolder,
        youtubeUrl: youtubeUrl.trim(),
      });
      setStatusMsg("Added successfully!");
      await fetchData();
      setTitle("");
      setYoutubeUrl("");
    } catch (error) {
      console.error("Add video error:", error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.msg || "Add failed";
      alert(errorMessage);
      setStatusMsg(errorMessage);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await axios.post(`${server_url}/Video/create-folder`, { 
        folder: newFolderName,
        parentId: currentParent.id 
      });
      setNewFolderName("");
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error creating folder");
    }
  };

  const saveFolderSequence = async (orderedFolders) => {
    try {
      setIsSavingSequence(true);
      // Ensure we send the names in the new order
      const folderNames = orderedFolders.map(f => f.name);
      await axios.put(`${server_url}/Video/folders/sequence`, { 
        folderNames,
        parentId: currentParent.id
      });
      showToast("Sequence updated");
    } catch (err) {
      console.error(err);
      alert("Failed to save folder sequence");
      await fetchData(); // Revert to server state on failure
    } finally {
      setIsSavingSequence(false);
    }
  };

  const handleFolderSequenceChange = (currentIndex, newPosition) => {
    if (newPosition < 1 || newPosition > folders.length) return;
    const newIndex = newPosition - 1;
    if (currentIndex === newIndex) return;

    const reordered = reorderList(folders, currentIndex, newIndex);
    // Optimistically update sequence: index + 1
    const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
    setFolders(updated);
    saveFolderSequence(updated);
  };

  const navigateToFolder = (folder) => {
    setBreadcrumbs([...breadcrumbs, { id: folder.name, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
  };

  const handleDeleteFolder = async (name) => {
    if (!window.confirm(`Delete folder "${name}"?`)) return;
    await axios.delete(`${server_url}/Video/delete-folder/${name}`);
    fetchData();
  };

  const startFolderEdit = (name) => {
    setEditingFolderName(name);
    setEditingFolderNewName(name);
  };

  const saveFolderEdit = async () => {
    if (!editingFolderName || !editingFolderNewName.trim()) return;
    try {
      await axios.put(`${server_url}/Video/rename-folder/${encodeURIComponent(editingFolderName)}`, {
        newName: editingFolderNewName.trim(),
      });
      setEditingFolderName("");
      setEditingFolderNewName("");
      await fetchData();
      showToast("Folder updated");
    } catch (err) {
      alert(err?.response?.data?.msg || "Folder rename failed");
    }
  };

  const saveVideoSequence = async (orderedVideos) => {
    try {
      setIsSavingSequence(true);
      const orderedIds = orderedVideos.map(v => v._id);
      await axios.put(`${server_url}/Video/videos/sequence`, { orderedIds });
      showToast("Sequence updated");
    } catch (err) {
      console.error(err);
      alert("Failed to save video sequence");
      await fetchData(); // Revert to server state on failure
    } finally {
      setIsSavingSequence(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    if (result.source.droppableId === "folders-grid") {
      const reordered = reorderList(folders, result.source.index, result.destination.index);
      const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
      setFolders(updated);
      saveFolderSequence(updated);
    } else if (result.source.droppableId === "videos-grid") {
      const reordered = reorderList(filteredVideos, result.source.index, result.destination.index);
      const updated = reordered.map((v, idx) => ({ ...v, sequence: idx + 1 }));
      
      const otherVideos = allVideos.filter(v => v.folder !== targetFolder || v.videoUrl === "null");
      setAllVideos(sortBySequence([...otherVideos, ...updated]));
      saveVideoSequence(updated);
    }
  };

  const handleVideoSequenceChange = (currentIndex, newPosition) => {
    if (newPosition < 1 || newPosition > filteredVideos.length) return;
    const newIndex = newPosition - 1;
    if (currentIndex === newIndex) return;

    const reordered = reorderList(filteredVideos, currentIndex, newIndex);
    const updated = reordered.map((v, idx) => ({ ...v, sequence: idx + 1 }));
    
    const otherVideos = allVideos.filter(v => v.folder !== targetFolder || v.videoUrl === "null");
    setAllVideos(sortBySequence([...otherVideos, ...updated]));
    saveVideoSequence(updated);
  };

  const filteredVideos = allVideos.filter(v => v.folder === targetFolder && v.videoUrl !== "null");

  const startItemEdit = (item) => {
    setEditingItem(item);
    setEditingItemTitle(item.title || "");
    setEditingItemUrl(item.videoUrl || "");
  };

  const saveItemEdit = async () => {
    if (!editingItem?._id) return;
    if (!editingItemTitle.trim()) return alert("Title is required");
    if (!validateYoutubeUrl(editingItemUrl)) return alert("Valid YouTube URL is required");
    try {
      await axios.put(`${server_url}/Video/youtube/${editingItem._id}`, {
        title: editingItemTitle.trim(),
        youtubeUrl: editingItemUrl.trim(),
      });
      setEditingItem(null);
      setEditingItemTitle("");
      setEditingItemUrl("");
      await fetchData();
      showToast("Item updated");
    } catch (err) {
      alert(err?.response?.data?.msg || "Item update failed");
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
        await fetchData();
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
              <h3>New Video Folder</h3>
              <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder Name" />
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button onClick={handleCreateFolder}>Create</button>
              </div>
            </div>
          </div>
        )}

        {toastMsg ? <div className="file-toast">{toastMsg}</div> : null}
        {isSavingSequence ? <p className="file-saving">Saving new sequence...</p> : null}
        {statusMsg ? <p className="file-status">{statusMsg}</p> : null}

        <div className="manager-content">
          {dndEnabled ? (
            <DragDropContext onDragEnd={onDragEnd}>
              {!currentParent.id && (
                <Droppable droppableId="folders-grid" direction="horizontal">
                  {(provided) => (
                    <div className="folder-grid" ref={provided.innerRef} {...provided.droppableProps}>
                      {folders.map((f, index) => (
                        <Draggable key={f.name || `folder-${index}`} draggableId={String(f.name || `folder-${index}`)} index={index}>
                          {(dragProvided, snapshot) => (
                            <div
                              className={`folder-card ${snapshot.isDragging ? 'dragging' : ''}`}
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => navigateToFolder(f)}
                            >
                              <div className="slider-card-seq" onClick={(e) => e.stopPropagation()}>
                                #<SequenceInput index={index} total={folders.length} onChange={handleFolderSequenceChange} />
                              </div>
                              <div className="folder-icon">🎬</div>
                              <div className="folder-details">
                                <span className="folder-name">{f.name}</span>
                                <span className="folder-count">{f.count} videos</span>
                              </div>
                              <div className="folder-actions-bottom" onClick={(e) => e.stopPropagation()}>
                                <button className="folder-edit-btn" onClick={() => startFolderEdit(f.name)} title="Edit Folder">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                                  </svg>
                                </button>
                                <button className="folder-del-btn" onClick={() => handleDeleteFolder(f.name)} title="Delete Folder">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}

              {currentParent.id && (
                <>
                  <form className="file-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input className="file-input" type="text" placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="file-input" type="url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                    <button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : `Add YouTube Video to ${currentParent.name}`}</button>
                  </form>

                  <Droppable droppableId="videos-grid" direction="horizontal">
                    {(provided) => (
                      <div className="file-grid" ref={provided.innerRef} {...provided.droppableProps}>
                        {filteredVideos.map((item, index) => (
                          <Draggable key={item._id} draggableId={item._id} index={index}>
                            {(dragProvided, snapshot) => (
                              <div
                                className={`file-card ${snapshot.isDragging ? "dragging" : ""}`}
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                              >
                                <div className="slider-card-seq">
                                  #<SequenceInput index={index} total={filteredVideos.length} onChange={handleVideoSequenceChange} />
                                </div>
                                <img className="file-img" src={getThumbnailUrl(extractVideoId(item.videoUrl))} alt={item.title || "Untitled"} />
                                <div className="file-content">
                                  <h3 className="file-name">{item.title || "Untitled"}</h3>
                                  <div className="folder-actions-bottom">
                                    <button className="folder-edit-btn" onClick={() => startItemEdit(item)} title="Edit Item">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                                      </svg>
                                    </button>
                                    <button className="delete-btn" onClick={() => deleteVideo(item._id)} title="Delete Item">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                      </svg>
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
                </>
              )}
            </DragDropContext>
          ) : (
            /* Fallback non-dnd rendering */
            <>
              {!currentParent.id && (
                <div className="folder-grid">
                  {folders.map((f, index) => (
                    <div key={f.name || `folder-${index}`} className="folder-card" onClick={() => navigateToFolder(f)}>
                      <div className="slider-card-seq" onClick={(e) => e.stopPropagation()}>
                        #<SequenceInput index={index} total={folders.length} onChange={handleFolderSequenceChange} />
                      </div>
                      <div className="folder-icon">🎬</div>
                      <div className="folder-details">
                        <span className="folder-name">{f.name}</span>
                        <span className="folder-count">{f.count} videos</span>
                      </div>
                      <div className="folder-actions-bottom" onClick={(e) => e.stopPropagation()}>
                        <button className="folder-edit-btn" onClick={() => startFolderEdit(f.name)} title="Edit Folder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                          </svg>
                        </button>
                        <button className="folder-del-btn" onClick={() => handleDeleteFolder(f.name)} title="Delete Folder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentParent.id && (
                <>
                  <form className="file-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input className="file-input" type="text" placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="file-input" type="url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                    <button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : `Add YouTube Video to ${currentParent.name}`}</button>
                  </form>

                  <div className="file-grid">
                    {filteredVideos.map((item, index) => (
                      <div key={item._id} className="file-card">
                        <div className="slider-card-seq">
                          #<SequenceInput index={index} total={filteredVideos.length} onChange={handleVideoSequenceChange} />
                        </div>
                        <img className="file-img" src={getThumbnailUrl(extractVideoId(item.videoUrl))} alt={item.title || "Untitled"} />
                        <div className="file-content">
                          <h3 className="file-name">{item.title || "Untitled"}</h3>
                          <div className="folder-actions-bottom">
                            <button className="folder-edit-btn" onClick={() => startItemEdit(item)} title="Edit Item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                              </svg>
                            </button>
                            <button className="delete-btn" onClick={() => deleteVideo(item._id)} title="Delete Item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {editingFolderName && (
        <div className="folder-modal-overlay">
          <div className="folder-modal">
            <h3>Edit Video Folder</h3>
            <input value={editingFolderNewName} onChange={(e) => setEditingFolderNewName(e.target.value)} placeholder="Folder Name" />
            <div className="modal-actions">
              <button onClick={() => setEditingFolderName("")}>Cancel</button>
              <button onClick={saveFolderEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="folder-modal-overlay">
          <div className="folder-modal item-modal">
            <h3>Edit Video Item</h3>
            <form className="file-form portfolio-item-form" onSubmit={(e) => { e.preventDefault(); saveItemEdit(); }}>
              <input className="file-input" value={editingItemTitle} onChange={(e) => setEditingItemTitle(e.target.value)} placeholder="Video Title" />
              <input className="file-input" type="url" value={editingItemUrl} onChange={(e) => setEditingItemUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoManager;
