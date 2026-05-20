import React, {useEffect, useRef, useState} from "react";
import "./File.css";
import axios from "axios";
import { server_url } from "../url/url";
function File() {

    const [title, setTitle] = useState("");

    const [files, setFiles] = useState([]);

    const [allFiles, setAllFiles] = useState([]);
    const [folderInput, setFolderInput] = useState("");
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState("gallery");
    const fileInputRef = useRef(null);

    /* Fetch */

    const fetchFiles = async () => {
        try {
            const res = await axios.get(server_url + "/File/files");
            setAllFiles(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("[File] Failed to fetch files:", error?.response?.data || error.message);
        }
    };

    const fetchFolders = async () => {
        try {
            const res = await axios.get(server_url + "/File/folders");
            const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
            const names = rows.map((row) => row.name).filter(Boolean);
            if (!names.includes("gallery")) {
                names.unshift("gallery");
            }
            setFolders(names);
        } catch (error) {
            console.error("[Folder] Failed to fetch folders:", error?.response?.data || error.message);
            setFolders(["gallery"]);
        }
    };

    useEffect(() => {
        fetchFiles();
        fetchFolders();
    }, []);

    /* Submit */

    const handleSubmit = async (e) => {

        e.preventDefault();
        console.log("[File Upload] Submit clicked", { title, filesCount: files.length });
        if (!files.length) {
            alert("Please select at least one file before upload.");
            return;
        }

        const formData = new FormData();

        formData.append("title", title);
        formData.append("folder", selectedFolder);

        for (let i = 0; i < files.length; i++) {

            formData.append(
                "files",
                files[i]
            );
        }

        try {
            console.log("[File Upload] Sending request to:", server_url + "/File/upload");

            await axios.post(server_url + "/File/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Uploaded");

            await fetchFiles();
            await fetchFolders();
            setTitle("");
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            console.log("Upload error:", error?.response?.data || error.message);
            alert(error?.response?.data?.msg || "Upload failed");
        }
    };

    // Delete functionality can be implemented here, using the file's _id or public_id to identify which file to delete from the server and Cloudinary.


    const deleteImage = async (id) => {
    try {
      const isConfirmed = window.confirm("Do you want to delete this image?");
      if (!isConfirmed) {
        return;
      }

      const response = await axios.get(server_url + `/File/deleteImage/${id}`);
      
      if (response.data.status === true) {
        await fetchFiles();
        const deletedTime = response.data.deletedAt
          ? new Date(response.data.deletedAt).toLocaleString()
          : new Date().toLocaleString();
        alert(`Deleted successfully at ${deletedTime}`);
      } else {
        alert(response.data.msg);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const createFolder = async () => {
    const folder = folderInput.trim();
    if (!folder) {
      alert("Please enter a folder name.");
      return;
    }

    try {
      const response = await axios.post(server_url + "/File/create-folder", { folder });
      alert(response?.data?.msg || "Folder created.");
      setFolderInput("");
      setSelectedFolder(folder);
      await fetchFolders();
      await fetchFiles();
    } catch (error) {
      alert(error?.response?.data?.msg || "Failed to create folder.");
    }
  };

  const deleteFolder = async () => {
    if (!selectedFolder || selectedFolder === "gallery") {
      alert("Default folder cannot be deleted.");
      return;
    }

    const ok = window.confirm(`Delete folder "${selectedFolder}" and all images inside it?`);
    if (!ok) return;

    try {
      const response = await axios.delete(server_url + `/File/delete-folder/${encodeURIComponent(selectedFolder)}`);
      alert(response?.data?.msg || "Folder deleted.");
      setSelectedFolder("gallery");
      await fetchFolders();
      await fetchFiles();
    } catch (error) {
      alert(error?.response?.data?.msg || "Failed to delete folder.");
    }
  };

  const filteredFiles = allFiles.filter((item) => (item.folder || "gallery") === selectedFolder);



    return (
        <div className="file-page">
          
            <div className="file-wrap">
                <h1 className="file-title">Multiple Upload Form</h1>
                <div className="folder-controls">
                    <input
                        className="file-input"
                        type="text"
                        placeholder="Enter new folder name (example: wedding-2026)"
                        value={folderInput}
                        onChange={(e) => setFolderInput(e.target.value)}
                    />
                    <button className="upload-btn" type="button" onClick={createFolder}>Create Folder</button>
                    <button className="delete-btn" type="button" onClick={deleteFolder}>Delete Folder</button>
                </div>

                <div className="folder-controls">
                    <select
                        className="file-input"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                    >
                        {folders.map((folderName) => (
                            <option key={folderName} value={folderName}>
                                Folder: {folderName}
                            </option>
                        ))}
                    </select>
                </div>

                <form className="file-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        className="file-input"
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        className="file-input"
                        type="file"
                        name="files"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                    <p className="file-help-text">
                        {files.length ? `${files.length} file(s) selected` : "Select one or more images"}
                    </p>

                    <button className="upload-btn" type="submit">
                        Upload
                    </button>
                </form>

                <div className="file-grid">
                    {filteredFiles.map((item) => (
                        <div key={item._id} className="file-card">
                            {item.imageUrl ? (
                                <img
                                    className="file-img"
                                    src={
                                        item.imageUrl && item.imageUrl.startsWith('/')
                                            ? server_url + item.imageUrl
                                            : item.imageUrl
                                    }
                                    alt={item.title || "Uploaded file"}
                                />
                            ) : null}

                            <div className="file-content">
                                <h3 className="file-name">{item.title || "Untitled"}</h3>
                                <button className="delete-btn" type="button" onClick={() => deleteImage(item._id)}>
                                    
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
                    ))}
                </div>
            </div>
        </div>
    );
}

export default File;
