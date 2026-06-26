import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { server_url } from "../../url/url";
import SiteNav from "../SiteNav";
import SiteFooter from "../SiteFooter";
import VideoSection from "../../components/videos/VideoSection";
import { useRevealOnScroll } from "../useRevealOnScroll";
import "../Contact.css";
import "./Gallery.css";

const CATEGORY_PATHS = {
  Printing: "/printing",
  Outdoor: "/outdoor",
  Online: "/online",
  "Photoshoot & Video": "/photoshot-video",
  Events: "/events",
  Promotional: "/promotional",
  "Electronic Ads": "/electronic-ads",
};

const YOUTUBE_CATEGORY_MAP = {
  "Photoshoot & Video": "Photoshoot & Video",
  Events: "Events",
};

export default function PortfolioFront({ category = "Printing", youtubeCategory = YOUTUBE_CATEGORY_MAP[category] || null }) {
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, title: `${category} Projects` }]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useRevealOnScroll();

  const currentParent = breadcrumbs[breadcrumbs.length - 1];
  const targetFolder = currentParent.id;
  const portfolioPath = CATEGORY_PATHS[category] || "";
  const placeholderImage = "/image/placeholder.jpg";

  useEffect(() => {
    setBreadcrumbs([{ id: null, title: `${category} Projects` }]);
  }, [category]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fRes, iRes] = await Promise.all([
          axios.get(
            `${server_url}/Portfolio/folders?parentId=${targetFolder || ""}&category=${encodeURIComponent(category)}`,
          ),
          targetFolder
            ? axios.get(
                `${server_url}/Portfolio/items?folderId=${targetFolder}&category=${encodeURIComponent(category)}`,
              )
            : Promise.resolve({ data: { data: [] } }),
        ]);

        const sortedFolders = [...(fRes.data?.data || [])].sort(
          (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0),
        );

        const fetchedItems = Array.isArray(iRes.data?.data) ? iRes.data.data : [];
        const activeItems = fetchedItems.filter(
          (item) => item.status !== false && item.status !== "false",
        );
        const sortedItems = [...activeItems].sort(
          (a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0),
        );

        setFolders(sortedFolders);
        setItems(sortedItems);
      } catch (err) {
        console.error("Failed to fetch portfolio data", err);
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchData();
  }, [category, targetFolder]);

  const navigateToFolder = (folder) =>
    setBreadcrumbs([...breadcrumbs, { id: folder._id, title: folder.title }]);
  const navigateToBreadcrumb = (index) => setBreadcrumbs(breadcrumbs.slice(0, index + 1));

  const resolveImageUrl = (url) => {
    if (!url || url === "null") return placeholderImage;
    if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) return url;
    if (url.startsWith("/images/") || url.startsWith("/image/")) return url;
    if (url.startsWith("/")) return `${server_url}${url}`;
    return url;
  };

  const getItemImage = (item) => resolveImageUrl(item.thumbnail || item.imageUrl || item.fileUrl);
  const previewImages = items
    .filter((item) => item.type !== "video" && item.type !== "link" && item.type !== "pdf")
    .map(getItemImage);

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
      <SiteNav activePage="portfolio" portfolioPath={portfolioPath} />

      <main>
        <section className="contact-hero reveal-on-scroll" aria-label="Portfolio banner">
          <div className="contact-hero-inner">
            <h1>{category} Portfolio</h1>
            <p className="contact-crumbs">
              <a href="/">Home</a> <span>&raquo;</span> Portfolio <span>&raquo;</span> {category}
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
                      {b.title}
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
                {folders.map((f) => (
                  <div key={f._id} className="portfolio-folder-card" onClick={() => navigateToFolder(f)}>
                    <div className="folder-thumb-wrapper">
                      {f.thumbnail ? (
                        <img
                          src={resolveImageUrl(f.thumbnail)}
                          loading="lazy"
                          className="folder-img"
                          alt={f.title}
                        />
                      ) : (
                        <div className="folder-icon" aria-hidden="true">
                          📁
                        </div>
                      )}
                    </div>
                    <div className="portfolio-folder-body">
                      <h5 className="folder-title">{f.title}</h5>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p className="folder-count">{f.count || 0} items</p>
                        <span className="folder-cta" aria-hidden="true">
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {items.map((item) => (
                  <div key={item._id} className="media-card">
                    {item.type === "video" || (item.videoUrl && item.videoUrl !== "null") ? (
                      <div className="video-wrapper">
                        <video controls src={item.fileUrl || item.videoUrl} className="video-player" />
                      </div>
                    ) : item.type === "link" ? (
                      <div className="media-img-wrapper media-link-box">
                        <a href={item.fileUrl || item.linkUrl} target="_blank" rel="noreferrer">
                          🔗 Link
                        </a>
                      </div>
                    ) : item.type === "pdf" ? (
                      <div className="media-img-wrapper media-pdf-box">
                        <a href={item.fileUrl} target="_blank" rel="noreferrer">
                          📄 PDF
                        </a>
                      </div>
                    ) : item.linkUrl ? (
                      <div className="media-img-wrapper">
                        <a href={item.linkUrl} target="_blank" rel="noreferrer" className="media-img-link">
                          <img
                            loading="lazy"
                            src={getItemImage(item)}
                            className="media-img"
                            alt={item.title || "Portfolio item"}
                          />
                        </a>
                      </div>
                    ) : (
                      <div className="media-img-wrapper">
                        <img
                          loading="lazy"
                          src={getItemImage(item)}
                          className="media-img"
                          alt={item.title || "Portfolio item"}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            const selectedImage = getItemImage(item);
                            const selectedIndex = previewImages.indexOf(selectedImage);
                            openLightbox(previewImages, selectedIndex >= 0 ? selectedIndex : 0);
                          }}
                        />
                      </div>
                    )}
                    <div className="media-body">
                      <h6 className="media-title" title={item.title}>
                        {item.title}
                      </h6>
                      {item.clientName && (
                        <p className="media-subtitle" title={item.clientName}>
                          {item.clientName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {folders.length === 0 && items.length === 0 && (
                  <div className="gallery-empty">
                    <h5>No portfolio folders or items available in this category.</h5>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {youtubeCategory ? (
          <VideoSection
            category={youtubeCategory}
            title={`${category} Videos`}
            subtitle="Watch our latest videos directly on the website."
          />
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
