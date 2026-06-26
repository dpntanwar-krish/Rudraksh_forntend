import React, { useEffect } from "react";
import SiteNav from "../Index/SiteNav";
import SiteFooter from "../Index/SiteFooter";
import VideoSection from "../components/videos/VideoSection";
import { useRevealOnScroll } from "../Index/useRevealOnScroll";
import "../Index/Contact.css";

export default function VideoGallery() {
  useRevealOnScroll();

  useEffect(() => {
    const loader = document.querySelector(".page-loader");
    if (loader) setTimeout(() => loader.classList.add("hidden"), 300);
  }, []);

  return (
    <>
      <div className="page-loader" aria-hidden="true">
        <div className="loader-inner">
          <img src="/image/1.png" alt="Rudraksh Creation" className="loader-logo" />
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <SiteNav activePage="gallery" galleryType="video" />

      <main>
        <section className="contact-hero reveal-on-scroll" aria-label="Video gallery banner">
          <div className="contact-hero-inner">
            <h1>Video Gallery</h1>
            <p className="contact-crumbs">
              <a href="/">Home</a> <span>&raquo;</span> Video Gallery
            </p>
          </div>
        </section>

        <VideoSection
          title="All Videos"
          subtitle="Browse our complete video collection with filters and search."
          showFilters
          showSearch
          showPagination
          pageSize={9}
        />
      </main>

      <SiteFooter />
    </>
  );
}
