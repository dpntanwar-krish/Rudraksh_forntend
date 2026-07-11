import React, { useEffect, useRef, useState } from "react";
import "./File.css";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import { server_url } from "../url/url";
const  server_url= require("dotenv");
server_url.config();

function reorderList(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function sortBySequence(list) {
  return [...list].sort((a, b) => {
    // First sort by folder name to prevent interleaving
    const folderA = a.folder || "";
    const folderB = b.folder || "";
    if (folderA !== folderB) return folderA.localeCompare(folderB);
    // Then sort by sequence within that folder
    return (Number(a.sequence) || 0) - (Number(b.sequence) || 0);
  });
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
      className="seq-input"
      title="Type to change order"
    />
  );
}

function File() {
  const [title, setTitle] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderName, setEditingFolderName] = useState("");
  const [editingFolderNewName, setEditingFolderNewName] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editingItemTitle, setEditingItemTitle] = useState("");
  const fileInputRef = useRef(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const fileQuery = targetFolder ? `?folder=${encodeURIComponent(targetFolder)}` : "";
      const [fRes, folderRes] = await Promise.all([
        axios.get(`${server_url}/File/files${fileQuery}`),
        axios.get(`${server_url}/File/folders?parentId=${currentParent.id || ""}`),
      ]);
      setAllFiles(sortBySequence(Array.isArray(fRes.data) ? fRes.data : []));
      setFolders(sortBySequence(folderRes.data.data || []));
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentParent]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDndEnabled(true));
    return () => { cancelAnimationFrame(id); setDndEnabled(false); };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    const MAX_SIZE = 5 * 1024 * 1024;
    for (const f of files) if (f.size <= MAX_SIZE) valid.push(f);
    setUploadFiles(valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFiles.length || !targetFolder) return alert("Select files and open a folder to upload.");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("folder", targetFolder);
    uploadFiles.forEach(f => fd.append("files", f));
    setStatusMsg("Uploading...");
    try {
      await axios.post(`${server_url}/File/upload`, fd);
      setTitle(""); setUploadFiles([]); if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchData();
      setStatusMsg("Uploaded");
    } catch (err) {
      console.error(err); alert(err?.response?.data?.msg || "Upload failed");
      setStatusMsg("Upload failed");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await axios.post(`${server_url}/File/create-folder`, { folder: newFolderName, parentId: currentParent.id });
      setNewFolderName(""); setShowModal(false); fetchData();
    } catch (err) { console.error(err); alert("Create folder failed"); }
  };

  const saveFolderSequence = async (updated) => {
    setIsSavingSequence(true);
    try {
      const folderNames = updated.map(f => f.name);
      await axios.put(`${server_url}/File/folders/sequence`, { folderNames, parentId: currentParent.id });
      showToast("Folder sequence updated");
    } catch (err) { console.error(err); alert("Save folder sequence failed"); await fetchData(); }
    finally { setIsSavingSequence(false); }
  };

  const saveFileSequence = async (ordered) => {
    setIsSavingSequence(true);
    try {
      await axios.put(`${server_url}/File/files/sequence`, { orderedIds: ordered.map(f => f._id), folder: targetFolder });
      showToast("File sequence updated");
    } catch (err) { console.error(err); alert("Save file sequence failed"); await fetchData(); }
    finally { setIsSavingSequence(false); }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    if (result.source.droppableId === "folders-grid") {
      const reordered = reorderList(folders, result.source.index, result.destination.index);
      const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
      setFolders(updated); 
      saveFolderSequence(updated);
    } else if (result.source.droppableId === "files-grid") {
      const filesInFolder = allFiles.filter(f => f.folder === targetFolder && f.title !== "__folder__");
      const reordered = reorderList(filesInFolder, result.source.index, result.destination.index);
      const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
      
      const otherFiles = allFiles.filter(f => f.folder !== targetFolder || f.title === "__folder__");
      setAllFiles(sortBySequence([...otherFiles, ...updated]));
      saveFileSequence(updated);
    }
  };

  const handleFolderSequenceChange = (currentIndex, newPosition) => {
    if (newPosition < 1 || newPosition > folders.length) return;
    const newIndex = newPosition - 1;
    if (currentIndex === newIndex) return;

    const reordered = reorderList(folders, currentIndex, newIndex);
    const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
    setFolders(updated); saveFolderSequence(updated);
  };

  const handleFileSequenceChange = (currentIndex, newPosition) => {
    const filesInFolder = allFiles.filter(f => f.folder === targetFolder && f.title !== "__folder__");
    if (newPosition < 1 || newPosition > filesInFolder.length) return;
    const newIndex = newPosition - 1;
    if (currentIndex === newIndex) return;

    const reordered = reorderList(filesInFolder, currentIndex, newIndex);
    const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
    
    const otherFiles = allFiles.filter(f => f.folder !== targetFolder || f.title === "__folder__");
    setAllFiles(sortBySequence([...otherFiles, ...updated])); 
    saveFileSequence(updated);
  };

  const navigateToFolder = (folder) => setBreadcrumbs([...breadcrumbs, { id: folder.name, name: folder.name }]);
  const navigateToBreadcrumb = (i) => setBreadcrumbs(breadcrumbs.slice(0, i + 1));

  const deleteFile = async (id) => {
    try {
      if (!window.confirm("Delete this file?")) return;
      const res = await axios.get(`${server_url}/File/deleteImage/${id}`);
      if (res.data.status) { await fetchData(); showToast("File deleted"); } else alert(res.data.msg);
    } catch (err) { console.error(err); alert("Delete failed"); }
  };

  const handleDeleteFolder = async (name) => {
    if (!window.confirm(`Delete folder "${name}" and its files?`)) return;
    try { await axios.delete(`${server_url}/File/delete-folder/${name}`); fetchData(); showToast("Folder deleted"); }
    catch (err) { console.error(err); alert("Delete folder failed"); }
  };

  const startFolderEdit = (name) => {
    setEditingFolderName(name);
    setEditingFolderNewName(name);
  };

  const saveFolderEdit = async () => {
    if (!editingFolderName || !editingFolderNewName.trim()) return;
    try {
      await axios.put(`${server_url}/File/rename-folder/${encodeURIComponent(editingFolderName)}`, {
        newName: editingFolderNewName.trim(),
      });
      setEditingFolderName("");
      setEditingFolderNewName("");
      await fetchData();
      showToast("Folder updated");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Folder rename failed");
    }
  };

  const startItemEdit = (item) => {
    setEditingItem(item);
    setEditingItemTitle(item.title || "");
  };

  const saveItemEdit = async () => {
    if (!editingItem?._id) return;
    try {
      await axios.put(`${server_url}/File/files/${editingItem._id}`, { title: editingItemTitle.trim() });
      setEditingItem(null);
      setEditingItemTitle("");
      await fetchData();
      showToast("Item updated");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Item update failed");
    }
  };

  const filteredFiles = allFiles.filter(f => f.folder === targetFolder && f.title !== "__folder__");

  return (
    <div className="file-page">
      <div className="file-wrap">
        <div className="manager-header">
          <div className="breadcrumb-nav">
            {breadcrumbs.map((b, i) => (
              <span key={i}>
                <button className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'active' : ''}`} onClick={() => navigateToBreadcrumb(i)}>{b.name}</button>
                {i < breadcrumbs.length - 1 && <span className="breadcrumb-sep">/</span>}
              </span>
            ))}
          </div>
          <div className="header-btns">
            {!currentParent.id && <button className="create-folder-btn" onClick={() => setShowModal(true)}>+ New Folder</button>}
          </div>
        </div>

        {showModal && (
          <div className="folder-modal-overlay">
            <div className="folder-modal">
              <h3>New Photo Folder</h3>
              <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder Name" />
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button onClick={handleCreateFolder}>Create</button>
              </div>
            </div>
          </div>
        )}

        {toastMsg && <div className="file-toast">{toastMsg}</div>}
        {isSavingSequence && <p className="file-saving">Saving new sequence...</p>}
        {statusMsg && <p className="file-status">{statusMsg}</p>}

        <div className="manager-content">
          {dndEnabled ? (
            <DragDropContext onDragEnd={onDragEnd}>
              {!currentParent.id && (
                <Droppable droppableId="folders-grid" direction="horizontal">
                  {(provided) => (
                    <div className="folder-grid" ref={provided.innerRef} {...provided.droppableProps}>
                      {folders.map((f, index) => (
                        <Draggable key={String(f.name)} draggableId={String(f.name)} index={index}>
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
                              <div className="folder-icon">📁</div>
                              <div className="folder-details">
                                <span className="folder-name">{f.name}</span>
                                <span className="folder-count">{f.count} files</span>
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

              {targetFolder && (
                <>
                  <form className="file-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input className="file-input" type="text" placeholder="Image Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="file-input" type="file" name="files" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                    <button type="submit" disabled={isLoading}>{isLoading ? "Uploading..." : `Upload to ${currentParent.name}`}</button>
                  </form>

                  <Droppable droppableId="files-grid" direction="horizontal">
                    {(provided) => (
                      <div className="file-grid" ref={provided.innerRef} {...provided.droppableProps}>
                        {filteredFiles.map((item, index) => (
                          <Draggable key={String(item._id)} draggableId={String(item._id)} index={index}>
                            {(dragProvided, snapshot) => (
                              <div className={`file-card ${snapshot.isDragging ? 'dragging' : ''}`} ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                                <div className="slider-card-seq">#<SequenceInput index={index} total={filteredFiles.length} onChange={handleFileSequenceChange} /></div>
                                <img className="file-img" src={item.imageUrl} alt={item.title || 'Untitled'} />
                                <div className="file-content">
                                  <h3 className="file-name">{item.title || 'Untitled'}</h3>
                                  <div className="folder-actions-bottom">
                                    <button className="folder-edit-btn" onClick={() => startItemEdit(item)} title="Edit Item">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                                      </svg>
                                    </button>
                                    <button className="delete-btn" onClick={() => deleteFile(item._id)} title="Delete Item">
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
            /* non-dnd fallback */
            <>
              {!currentParent.id && (
                <div className="folder-grid">
                  {folders.map((f, index) => (
                    <div key={String(f.name)} className="folder-card" onClick={() => navigateToFolder(f)}>
                      <div className="slider-card-seq" onClick={(e) => e.stopPropagation()}>#<SequenceInput index={index} total={folders.length} onChange={handleFolderSequenceChange} /></div>
                      <div className="folder-icon">📁</div>
                      <div className="folder-details"><span className="folder-name">{f.name}</span><span className="folder-count">{f.count} files</span></div>
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

              {targetFolder && (
                <>
                  <form className="file-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input className="file-input" type="text" placeholder="Image Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="file-input" type="file" name="files" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                    <button type="submit" disabled={isLoading}>{isLoading ? "Uploading..." : `Upload to ${currentParent.name}`}</button>
                  </form>

                  <div className="file-grid">
                    {filteredFiles.map((item, index) => (
                      <div key={String(item._id)} className="file-card">
                        <div className="slider-card-seq">#<SequenceInput index={index} total={filteredFiles.length} onChange={handleFileSequenceChange} /></div>
                        <img className="file-img" src={item.imageUrl} alt={item.title || 'Untitled'} />
                        <div className="file-content">
                          <h3 className="file-name">{item.title || "Untitled"}</h3>
                          <div className="folder-actions-bottom">
                            <button className="folder-edit-btn" onClick={() => startItemEdit(item)} title="Edit Item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                              </svg>
                            </button>
                            <button className="delete-btn" onClick={() => deleteFile(item._id)} title="Delete Item">
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

        {editingFolderName && (
          <div className="folder-modal-overlay">
            <div className="folder-modal">
              <h3>Edit Folder</h3>
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
            <div className="folder-modal">
              <h3>Edit Photo Item</h3>
              <input value={editingItemTitle} onChange={(e) => setEditingItemTitle(e.target.value)} placeholder="Item title" />
              <div className="modal-actions">
                <button onClick={() => setEditingItem(null)}>Cancel</button>
                <button onClick={saveItemEdit}>Save</button>
              </div>
            </div>
          </div>
        )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default File;
