import { useCallback, useState, useEffect } from "react";
import axios from "axios";
// import { server_url } from "../../url/url";
const  server_url= require("dotenv");
server_url.config();
import SiteNav from "../SiteNav";
import SiteFooter from "../SiteFooter";
import { useRevealOnScroll } from "../useRevealOnScroll";
import "../Contact.css";
import "./Gallery.css";

export default function Photogallery() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useRevealOnScroll();

  const currentParent = breadcrumbs[breadcrumbs.length - 1];
  const targetFolder = currentParent.id;
  const previewImages = files.map((item) => item.imageUrl).filter(Boolean);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fileQuery = targetFolder ? `?folder=${encodeURIComponent(targetFolder)}` : "";
        const [fRes, folderRes] = await Promise.all([
          axios.get(`${server_url}/File/files${fileQuery}`),
          axios.get(`${server_url}/File/folders?parentId=${targetFolder || ""}`),
        ]);

        const sortedFolders = [...(folderRes.data.data || [])].sort(
          (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0),
        );
        const fetchedFiles = Array.isArray(fRes.data) ? fRes.data : [];
        const sortedFiles = [...fetchedFiles].sort(
          (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0),
        );

        setFolders(sortedFolders);
        setFiles(sortedFiles.filter((f) => f.folder === targetFolder && f.title !== "__folder__"));
      } catch (err) {
        console.error("Failed to fetch photo gallery data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetFolder]);

  const navigateToFolder = (folder) =>
    setBreadcrumbs([...breadcrumbs, { id: folder.name, name: folder.name }]);
  const navigateToBreadcrumb = (index) => setBreadcrumbs(breadcrumbs.slice(0, index + 1));

  const openLightbox = (list, idx = 0) => {
    const images = (list || []).filter(Boolean);
    if (images.length === 0) return;
    setLightboxItems(images);
    setLightboxIndex(Number.isFinite(idx) ? Math.max(0, Math.min(idx, images.length - 1)) : 0);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevLightbox = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + lightboxItems.length) % lightboxItems.length);
  }, [lightboxItems.length]);
  const nextLightbox = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % lightboxItems.length);
  }, [lightboxItems.length]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox, lightboxOpen, nextLightbox, prevLightbox]);

  return (
    <>
      <SiteNav activePage="gallery" galleryType="photo" />

      <main>
        <section className="contact-hero reveal-on-scroll" aria-label="Gallery banner">
          <div className="contact-hero-inner">
            <h1>Photo Gallery</h1>
            <p className="contact-crumbs">
              <a href="/">Home</a> <span>&raquo;</span> Photo Gallery
            </p>
          </div>
        </section>

        {lightboxOpen && (
          <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true">
            <button
              type="button"
              className="lightbox-close"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              aria-label="Close"
            >
              ✕
            </button>
            {lightboxItems.length > 1 && (
              <button
                type="button"
                className="lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                aria-label="Previous"
              >
                ‹
              </button>
            )}
            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <img src={lightboxItems[lightboxIndex]} alt={`Preview ${lightboxIndex + 1}`} />
              {lightboxItems.length > 1 && (
                <div className="lightbox-counter">
                  {lightboxIndex + 1} / {lightboxItems.length}
                </div>
              )}
            </div>
            {lightboxItems.length > 1 && (
              <button
                type="button"
                className="lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                aria-label="Next"
              >
                ›
              </button>
            )}
          </div>
        )}

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
                      <div className="folder-icon">📁</div>
                      <h5 className="folder-title">{f.name}</h5>
                      <p className="folder-count">{f.count} photos</p>
                    </div>
                  ))}

                {currentParent.id &&
                  files.map((item) => (
                    <div key={item._id} className="media-card">
                      <div className="media-img-wrapper">
                        <img
                          src={item.imageUrl}
                          className="media-img"
                          alt={item.title || "Gallery image"}
                          onClick={() => {
                            const selectedIndex = previewImages.indexOf(item.imageUrl);
                            openLightbox(previewImages, selectedIndex >= 0 ? selectedIndex : 0);
                          }}
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
                    <h5>No photo folders available.</h5>
                  </div>
                )}
                {currentParent.id && files.length === 0 && (
                  <div className="gallery-empty">
                    <h5>No photos available in this folder.</h5>
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
