import React, { useState, useEffect } from "react";
import axios from "axios";
// import { server_url } from "../../url/url";
const  server_url= require("dotenv");
server_url.config();
import SiteNav from "../SiteNav";
import SiteFooter from "../SiteFooter";
import { useRevealOnScroll } from "../useRevealOnScroll";
import { extractVideoId, getEmbedUrl } from "../../utils/youtubeUtils";
import "../Contact.css";
import "./Gallery.css";

export default function VideoGallery() {
  const [folders, setFolders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);
  const [loading, setLoading] = useState(true);

  useRevealOnScroll();

  const currentParent = breadcrumbs[breadcrumbs.length - 1];
  const targetFolder = currentParent.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const videoQuery = currentParent.id ? `?folder=${encodeURIComponent(targetFolder)}` : "";
        const [vRes, fRes] = await Promise.all([
          axios.get(`${server_url}/Video/videos${videoQuery}`),
          axios.get(`${server_url}/Video/folders?parentId=${currentParent.id || ""}`),
        ]);

        const sortedFolders = [...(fRes.data.data || [])].sort(
          (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0),
        );
        const fetchedVideos = Array.isArray(vRes.data) ? vRes.data : [];
        const sortedVideos = [...fetchedVideos].sort(
          (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0),
        );

        setFolders(sortedFolders);
        setVideos(sortedVideos.filter((v) => v.folder === targetFolder && v.videoUrl !== "null"));
      } catch (err) {
        console.error("Failed to fetch video gallery data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentParent.id, targetFolder]);

  const navigateToFolder = (folder) =>
    setBreadcrumbs([...breadcrumbs, { id: folder.name, name: folder.name }]);
  const navigateToBreadcrumb = (index) => setBreadcrumbs(breadcrumbs.slice(0, index + 1));

  return (
    <>
      <SiteNav activePage="gallery" galleryType="video" />

      <main>
        <section className="contact-hero reveal-on-scroll" aria-label="Gallery banner">
          <div className="contact-hero-inner">
            <h1>Video Gallery</h1>
            <p className="contact-crumbs">
              <a href="/">Home</a> <span>&raquo;</span> Video Gallery
            </p>
          </div>
        </section>

        <section className="gallery-section reveal-on-scroll">
          <div className="gallery-container">
            <div className="gallery-breadcrumbs">
              {breadcrumbs.map((b, i) => {
                const isActive = i === breadcrumbs.length - 1;
                return (
                  <span key={i}>
                    <button
                      type="button"
                      className={`gallery-breadcrumb-btn ${isActive ? "active" : "inactive"}`}
                      onClick={() => navigateToBreadcrumb(i)}
                    >
                      {b.name}
                    </button>
                    {!isActive && <span className="breadcrumb-divider">/</span>}
                  </span>
                );
              })}
            </div>

            {loading ? (
              <div className="gallery-loading" role="status" aria-label="Loading">
                <div className="gallery-spinner" />
              </div>
            ) : (
              <div className="media-grid">
                {!currentParent.id &&
                  folders.map((f) => (
                    <div key={f.name} className="folder-card" onClick={() => navigateToFolder(f)}>
                      <div className="folder-icon">🎬</div>
                      <h5 className="folder-title">{f.name}</h5>
                      <p className="folder-count">{f.count} videos</p>
                    </div>
                  ))}

                {currentParent.id &&
                  videos.map((item) => (
                    <div key={item._id} className="media-card">
                      <div className="video-wrapper">
                        <iframe
                          className="video-player"
                          src={getEmbedUrl(extractVideoId(item.videoUrl), false)}
                          title={item.title || "YouTube video"}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {item.title && (
                        <div className="media-body">
                          <h6 className="media-title" title={item.title}>
                            {item.title}
                          </h6>
                        </div>
                      )}
                    </div>
                  ))}

                {!currentParent.id && folders.length === 0 && (
                  <div className="gallery-empty">
                    <h5>No video folders available.</h5>
                  </div>
                )}
                {currentParent.id && videos.length === 0 && (
                  <div className="gallery-empty">
                    <h5>No videos available in this folder.</h5>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
