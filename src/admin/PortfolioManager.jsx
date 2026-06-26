import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { server_url } from "../url/url";
import "./File.css";

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
      className="seq-input"
      title="Type to change order"
    />
  );
}

export default function PortfolioManager({ category }) {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [folderThumbnail, setFolderThumbnail] = useState(null);
  
  const [itemType, setItemType] = useState("image");
  const [itemTitle, setItemTitle] = useState("");
  const [itemFiles, setItemFiles] = useState([]);
  const [itemLinkUrl, setItemLinkUrl] = useState("");
  
  const [statusMsg, setStatusMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSequence, setIsSavingSequence] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);
  
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, title: "Root" }]);
  const currentParent = breadcrumbs[breadcrumbs.length - 1];
  const targetFolder = currentParent.id;

  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fRes, iRes] = await Promise.all([
        axios.get(`${server_url}/Portfolio/folders?parentId=${targetFolder || ""}&category=${encodeURIComponent(category)}`),
        targetFolder ? axios.get(`${server_url}/Portfolio/items?folderId=${targetFolder}&category=${encodeURIComponent(category)}`) : Promise.resolve({ data: { data: [] } })
      ]);
      setFolders(sortBySequence(fRes.data?.data || []));
      setItems(sortBySequence(iRes.data?.data || []));
    } catch (err) {
      setStatusMsg("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentParent, category]);

  useEffect(() => { setBreadcrumbs([{ id: null, title: "Root" }]); }, [category]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDndEnabled(true));
    return () => { cancelAnimationFrame(id); setDndEnabled(false); };
  }, []);

  const resetFolderForm = () => {
    setNewFolderTitle("");
    setFolderThumbnail(null);
    setEditingFolder(null);
  };

  const openCreateFolderModal = () => {
    resetFolderForm();
    setShowFolderModal(true);
  };

  const openEditFolderModal = (folder) => {
    setEditingFolder(folder);
    setNewFolderTitle(folder.title || "");
    setFolderThumbnail(null);
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    resetFolderForm();
  };

  const handleSaveFolder = async () => {
    if (!newFolderTitle.trim()) return;
    try {
      const fd = new FormData();
      fd.append("title", newFolderTitle.trim());
      if (editingFolder) {
        if (folderThumbnail) fd.append("file", folderThumbnail);
        await axios.put(`${server_url}/Portfolio/update-folder/${editingFolder._id}`, fd);
        setBreadcrumbs((prev) =>
          prev.map((b) => (b.id === editingFolder._id ? { ...b, title: newFolderTitle.trim() } : b)),
        );
        showToast("Folder updated");
      } else {
        if (targetFolder) fd.append("parentId", targetFolder);
        fd.append("category", category);
        if (folderThumbnail) fd.append("file", folderThumbnail);
        await axios.post(`${server_url}/Portfolio/create-folder`, fd);
        showToast("Folder created");
      }
      closeFolderModal();
      fetchData();
    } catch (err) {
      alert(editingFolder ? "Update folder failed" : "Create folder failed");
    }
  };


  const handleDeleteFolder = async (id, title) => {
    if (!window.confirm(`Delete folder "${title}" and all items inside it?`)) return;
    try {
      await axios.delete(`${server_url}/Portfolio/delete-folder/${id}`);
      fetchData();
      showToast("Folder deleted");
    } catch (err) {
      alert("Delete folder failed");
    }
  };

  const saveFolderSequence = async (ordered) => {
    setIsSavingSequence(true);
    try {
      await axios.put(`${server_url}/Portfolio/folders/sequence`, { orderedIds: ordered.map(f => f._id), category });
      showToast("Folder sequence updated");
    } catch (err) {
      alert("Save folder sequence failed");
      await fetchData();
    } finally {
      setIsSavingSequence(false);
    }
  };

  const saveItemSequence = async (ordered) => {
    setIsSavingSequence(true);
    try {
      await axios.put(`${server_url}/Portfolio/items/sequence`, { orderedIds: ordered.map(i => i._id), category });
      showToast("Item sequence updated");
    } catch (err) {
      alert("Save item sequence failed");
      await fetchData();
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
    } else if (result.source.droppableId === "items-grid") {
      const reordered = reorderList(items, result.source.index, result.destination.index);
      const updated = reordered.map((i, idx) => ({ ...i, sequence: idx + 1 }));
      setItems(updated);
      saveItemSequence(updated);
    }
  };

  const handleFolderSeqChange = (currentIndex, newPos) => {
    if (newPos < 1 || newPos > folders.length) return;
    const newIndex = newPos - 1;
    if (currentIndex === newIndex) return;
    const reordered = reorderList(folders, currentIndex, newIndex);
    const updated = reordered.map((f, idx) => ({ ...f, sequence: idx + 1 }));
    setFolders(updated);
    saveFolderSequence(updated);
  };

  const handleItemSeqChange = (currentIndex, newPos) => {
    if (newPos < 1 || newPos > items.length) return;
    const newIndex = newPos - 1;
    if (currentIndex === newIndex) return;
    const reordered = reorderList(items, currentIndex, newIndex);
    const updated = reordered.map((i, idx) => ({ ...i, sequence: idx + 1 }));
    setItems(updated);
    saveItemSequence(updated);
  };

  const navigateToFolder = (folder) => setBreadcrumbs([...breadcrumbs, { id: folder._id, title: folder.title }]);
  const navigateToBreadcrumb = (i) => setBreadcrumbs(breadcrumbs.slice(0, i + 1));

  const needsFile = itemType !== "link";
  const canUpload = itemType === "link" ? itemLinkUrl.trim().length > 0 : itemFiles.length > 0;

  const handleTypeChange = (nextType) => {
    setItemType(nextType);
    setItemFiles([]);
    setItemLinkUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setItemType("image");
    setItemTitle("");
    setItemFiles([]);
    setItemLinkUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddItemModal = () => {
    resetItemForm();
    setShowItemModal(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setItemType(item.type || "image");
    setItemTitle(item.title || "");
    setItemFiles([]);
    setItemLinkUrl(item.linkUrl || (item.type === "link" ? item.fileUrl : "") || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    resetItemForm();
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!targetFolder) return alert("Please open a folder to manage items.");

    if (editingItem) {
      if (editingItem.type === "link" && !itemLinkUrl.trim()) {
        return alert("Please enter a URL for link type.");
      }

      setStatusMsg("Updating item...");
      const fd = new FormData();
      fd.append("title", itemTitle);
      fd.append("linkUrl", itemLinkUrl.trim());
      if (itemFiles.length) {
        itemFiles.forEach((file) => fd.append("files", file));
      }

      try {
        await axios.put(`${server_url}/Portfolio/update-item/${editingItem._id}`, fd);
        closeItemModal();
        setStatusMsg("Item updated");
        fetchData();
        showToast("Item updated");
      } catch (err) {
        alert(err?.response?.data?.msg || "Update failed");
        setStatusMsg("Update failed");
      }
      return;
    }

    if (itemType === "link") {
      if (!itemLinkUrl.trim()) return alert("Please enter a URL for link type.");
    } else if (!itemFiles.length) {
      return alert("Please select an image, video or PDF file. URL alone cannot be uploaded.");
    }

    setStatusMsg("Uploading item...");
    const fd = new FormData();
    fd.append("title", itemTitle);
    fd.append("type", itemType);
    fd.append("folderId", targetFolder);
    fd.append("category", category);
    if (itemType === "link") {
      fd.append("linkUrl", itemLinkUrl.trim());
    } else {
      if (itemLinkUrl.trim()) fd.append("linkUrl", itemLinkUrl.trim());
      itemFiles.forEach((file) => fd.append("files", file));
    }

    try {
      await axios.post(`${server_url}/Portfolio/upload-item`, fd);
      closeItemModal();
      setStatusMsg("Item uploaded");
      fetchData();
      showToast("Item uploaded");
    } catch (err) {
      alert(err?.response?.data?.msg || "Upload failed");
      setStatusMsg("Upload failed");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`${server_url}/Portfolio/delete-item/${id}`);
      fetchData();
      showToast("Item deleted");
    } catch (err) {
      alert("Delete failed");
    }
  };

  const renderThumbnail = (item) => {
    if (item.type === 'image') return <img className="file-img" src={item.fileUrl} alt={item.title} />;
    if (item.type === 'video') return <video className="file-img" src={item.fileUrl} controls style={{backgroundColor:'#000'}} />;
    if (item.type === 'pdf') return <div className="file-img" style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', background:'#f0f0f0', color:'#e53e3e'}}>PDF</div>;
    if (item.type === 'link') return <div className="file-img" style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', background:'#e0f2fe', color:'#2563eb'}}>🔗 Link</div>;
    return null;
  };

  return (
    <div className="file-page">
      <div className="file-wrap">
        <div className="manager-header">
          <div className="breadcrumb-nav">
            {breadcrumbs.map((b, i) => (
              <span key={i}>
                <button className={`breadcrumb-item ${i === breadcrumbs.length - 1 ? 'active' : ''}`} onClick={() => navigateToBreadcrumb(i)}>{b.title}</button>
                {i < breadcrumbs.length - 1 && <span className="breadcrumb-sep">/</span>}
              </span>
            ))}
          </div>
          <div className="header-btns">
            <button className="create-folder-btn" onClick={openCreateFolderModal}>+ New Folder</button>
            {targetFolder && (
              <button className="create-folder-btn add-item-btn" onClick={openAddItemModal}>+ Add Item</button>
            )}
          </div>
        </div>

        {showFolderModal && (
          <div className="folder-modal-overlay" onClick={closeFolderModal}>
            <div className="folder-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingFolder ? "Edit Folder" : "Create New Folder"}</h3>
              <input type="text" value={newFolderTitle} onChange={(e) => setNewFolderTitle(e.target.value)} placeholder="Folder Title" />
              <label style={{display:'block', textAlign:'left', marginTop:'10px', fontSize:'0.85rem', color:'#aaa'}}>
                {editingFolder ? "Replace Thumbnail (optional):" : "Optional Thumbnail:"}
              </label>
              {editingFolder?.thumbnail ? (
                <img
                  src={editingFolder.thumbnail}
                  alt={editingFolder.title}
                  style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
                />
              ) : null}
              <input type="file" accept="image/*" onChange={(e) => setFolderThumbnail(e.target.files[0])} />
              <div className="modal-actions">
                <button type="button" onClick={closeFolderModal}>Cancel</button>
                <button type="button" onClick={handleSaveFolder}>{editingFolder ? "Save" : "Create"}</button>
              </div>
            </div>
          </div>
        )}

        {showItemModal && (
          <div className="folder-modal-overlay" onClick={closeItemModal}>
            <div className="folder-modal item-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingItem ? `Edit Item in ${currentParent.title}` : `Add Item to ${currentParent.title}`}</h3>
              <form className="file-form portfolio-item-form" onSubmit={handleSaveItem}>
                {!editingItem ? (
                  <select className="file-input" value={itemType} onChange={(e) => handleTypeChange(e.target.value)}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="link">Link</option>
                  </select>
                ) : (
                  <p className="portfolio-upload-hint" style={{ marginTop: 0 }}>
                    Type: <strong>{editingItem.type}</strong>
                  </p>
                )}
                <input className="file-input" type="text" placeholder="Title (optional)" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
                {(editingItem?.type || itemType) === "link" ? (
                  <input
                    className="file-input"
                    type="url"
                    placeholder="Link URL (required) https://..."
                    value={itemLinkUrl}
                    onChange={(e) => setItemLinkUrl(e.target.value)}
                  />
                ) : (
                  <div className="portfolio-upload-row">
                    <input
                      className="file-input"
                      type="url"
                      placeholder="Click URL (optional) https://..."
                      value={itemLinkUrl}
                      onChange={(e) => setItemLinkUrl(e.target.value)}
                    />
                    <input
                      className="file-input"
                      type="file"
                      multiple={!editingItem}
                      accept={
                        (editingItem?.type || itemType) === "video"
                          ? "video/*"
                          : (editingItem?.type || itemType) === "pdf"
                            ? ".pdf,application/pdf"
                            : "image/*"
                      }
                      ref={fileInputRef}
                      onChange={(e) => setItemFiles(Array.from(e.target.files || []))}
                    />
                  </div>
                )}
                {editingItem ? (
                  <p className="portfolio-upload-hint">
                    Update title, click URL, or replace file. Leave file empty to keep the current one.
                  </p>
                ) : needsFile ? (
                  <p className="portfolio-upload-hint">
                    File is required. Click URL is optional — visitors can click the image to open it.
                  </p>
                ) : (
                  <p className="portfolio-upload-hint">Link type needs URL only. No file upload.</p>
                )}
                <div className="modal-actions">
                  <button type="button" onClick={closeItemModal}>Cancel</button>
                  <button type="submit" disabled={isLoading || (!editingItem && !canUpload)}>
                    {isLoading ? "Saving..." : editingItem ? "Save Changes" : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {toastMsg && <div className="file-toast">{toastMsg}</div>}
        {isSavingSequence && <p className="file-saving">Saving new sequence...</p>}
        {statusMsg && <p className="file-status">{statusMsg}</p>}

        <div className="manager-content">
          {dndEnabled ? (
            <DragDropContext onDragEnd={onDragEnd}>
              
              {folders.length > 0 && (
                <div style={{marginBottom:'30px'}}>
                  <h3 style={{marginBottom:'15px', color:'#ccc'}}>Folders</h3>
                  <Droppable droppableId="folders-grid" direction="horizontal">
                    {(provided) => (
                      <div className="folder-grid" ref={provided.innerRef} {...provided.droppableProps}>
                        {folders.map((f, index) => (
                          <Draggable key={f._id} draggableId={f._id} index={index}>
                            {(dragProvided, snapshot) => (
                              <div className={`folder-card ${snapshot.isDragging ? 'dragging' : ''}`} ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} onClick={() => navigateToFolder(f)}>
                                <div className="slider-card-seq" onClick={(e) => e.stopPropagation()}>
                                  #<SequenceInput index={index} total={folders.length} onChange={handleFolderSeqChange} />
                                </div>
                                {f.thumbnail ? (
                                  <img src={f.thumbnail} alt={f.title} style={{width:'100%', height:'80px', objectFit:'cover', borderRadius:'8px', marginBottom:'10px'}} />
                                ) : (
                                  <div className="folder-icon">📁</div>
                                )}
                                <div className="folder-details">
                                  <span className="folder-name">{f.title}</span>
                                  <span className="folder-count">{f.count || 0} items</span>
                                </div>
                                <div className="folder-card-actions" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="folder-edit-btn"
                                    title="Edit Folder"
                                    onClick={() => openEditFolderModal(f)}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M12 20h9" />
                                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="folder-del-btn"
                                    title="Delete Folder"
                                    onClick={() => handleDeleteFolder(f._id, f.title)}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
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
                </div>
              )}

              {targetFolder && (
                <div style={{marginTop:'30px', borderTop:'1px solid #333', paddingTop:'20px'}}>
                  <h3 style={{marginBottom:'15px', color:'#ccc'}}>Items in {currentParent.title}</h3>
                  {items.length === 0 ? <p style={{color:'#666'}}>No items in this folder yet.</p> : (
                    <Droppable droppableId="items-grid" direction="horizontal">
                      {(provided) => (
                        <div className="file-grid" ref={provided.innerRef} {...provided.droppableProps}>
                          {items.map((item, index) => (
                            <Draggable key={item._id} draggableId={item._id} index={index}>
                              {(dragProvided, snapshot) => (
                                <div className={`file-card ${snapshot.isDragging ? 'dragging' : ''}`} ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                                  <div className="slider-card-seq">#<SequenceInput index={index} total={items.length} onChange={handleItemSeqChange} /></div>
                                  {renderThumbnail(item)}
                                  <div className="file-content">
                                    <h3 className="file-name">{item.title || "Untitled"}</h3>
                                    <span style={{fontSize:'0.65rem', color:'#aaa', textTransform:'uppercase'}}>{item.type}</span>
                                    {item.linkUrl && item.type !== "link" ? (
                                      <a href={item.linkUrl} target="_blank" rel="noreferrer" style={{color:'#3b82f6', fontSize:'0.75rem'}}>Visit URL</a>
                                    ) : null}
                                    {item.type === "link" && (
                                      <a href={item.fileUrl || item.linkUrl} target="_blank" rel="noreferrer" style={{color:'#3b82f6', fontSize:'0.75rem'}}>Visit Link</a>
                                    )}
                                    <div className="folder-actions-bottom">
                                      <button
                                        type="button"
                                        className="folder-edit-btn"
                                        onClick={() => openEditItemModal(item)}
                                        title="Edit Item"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M12 20h9" />
                                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDeleteItem(item._id)}
                                        title="Delete Item"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <polyline points="3 6 5 6 21 6" />
                                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
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
                  )}
                </div>
              )}
            </DragDropContext>
          ) : (
            <p>Initializing...</p>
          )}
        </div>
      </div>
    </div>
  );
}