import React, { useState } from "react";
import "./Home.css";

const LOGO_URL = "/image/1.png";

const navDropdownStyle = `
  .nav-dropdown:hover .hover-menu { display: flex !important; }
  .hover-menu {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    border-radius: 8px;
    min-width: 170px;
    padding: 8px 0;
    z-index: 9999;
    border: 1px solid rgba(0,0,0,0.05);
  }
  .hover-menu a {
    color: #333 !important;
    padding: 10px 20px !important;
    font-weight: 600;
    margin: 0 !important;
    text-align: left;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .hover-menu a:hover {
    background: #f9f9f9;
    color: #b31217 !important;
  }
`;

export default function SiteNav({ activePage = "", galleryType = "", portfolioPath = "" }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = (page) => (activePage === page ? "active" : "");
  const dropdownToggleClass = (page) =>
    `nav-gallery-toggle${activePage === page ? " active" : ""}`;
  const dropdownItemClass = (href) => {
    if (activePage === "gallery" && galleryType === "photo" && href === "/photo-gallery") {
      return "nav-dropdown-item active";
    }
    if (activePage === "gallery" && galleryType === "video" && href === "/video-gallery") {
      return "nav-dropdown-item active";
    }
    if (activePage === "portfolio" && portfolioPath === href) {
      return "nav-dropdown-item active";
    }
    return "nav-dropdown-item";
  };

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="top-inner">
          <div className="top-info">
            <div className="top-item">
              <span className="label">Call Us Now</span>
              <span className="value">09814573940 | 9517511636</span>
            </div>
            <div className="top-item">
              <span className="label">Email Address</span>
              <span className="value">rcbti@hotmail.com</span>
            </div>
            <div className="top-item">
              <span className="label">Office Address</span>
              <span className="value">Near Bank of Baroda, G.T. Road, Bathinda</span>
            </div>
          </div>
          <a href="https://wa.me/919814573940" target="_blank" rel="noopener" className="order-btn">
            Make An Order
          </a>
        </div>
      </div>

      <div className="nav-bar">
        <div className="nav-inner">
          <a href="/" className="brand">
            <img src={LOGO_URL} alt="Rudraksh Creation" className="brand-logo" />
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {isMobileMenuOpen ? (
            <button
              type="button"
              className="menu-overlay"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ) : null}

          <nav className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
            <a href="/" className={linkClass("home")} onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </a>
            <a href="/about" className={linkClass("about")} onClick={() => setIsMobileMenuOpen(false)}>
              About
            </a>

            <div className="nav-dropdown" style={{ position: "relative", display: "inline-block" }}>
              <a className={dropdownToggleClass("portfolio")} href="#" role="button" onClick={(e) => e.preventDefault()}>
                Portfolio ▾
              </a>
              <div className="nav-dropdown-menu hover-menu">
                <a className={dropdownItemClass("/printing")} href="/printing">Printing</a>
                <a className={dropdownItemClass("/outdoor")} href="/outdoor">Outdoor</a>
                <a className={dropdownItemClass("/online")} href="/online">Online</a>
                <a className={dropdownItemClass("/photoshot-video")} href="/photoshot-video">Photoshot &amp; Video</a>
                <a className={dropdownItemClass("/events")} href="/events">Events</a>
                <a className={dropdownItemClass("/promotional")} href="/promotional">Promotional</a>
                <a className={dropdownItemClass("/electronic-ads")} href="/electronic-ads">Electronic Ads</a>
              </div>
            </div>

            <a href="/services" className={linkClass("services")} onClick={() => setIsMobileMenuOpen(false)}>
              Services
            </a>

            <div className="nav-dropdown" style={{ position: "relative", display: "inline-block" }}>
              <a className={dropdownToggleClass("gallery")} href="#" role="button" onClick={(e) => e.preventDefault()}>
                Gallery ▾
              </a>
              <div className="nav-dropdown-menu hover-menu">
                <a className={dropdownItemClass("/photo-gallery")} href="/photo-gallery">Photo Gallery</a>
                <a className={dropdownItemClass("/video-gallery")} href="/video-gallery">Video Gallery</a>
              </div>
              <style>{navDropdownStyle}</style>
            </div>

            <a href="/contact" className={linkClass("contact")} onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </a>

            <div className="mobile-contact-menu">
              <p>
                <strong>CALL US NOW</strong>
                <span>09814573940 | 9517511636</span>
              </p>
              <p>
                <strong>EMAIL ADDRESS</strong>
                <span>rcbti@hotmail.com</span>
              </p>
              <p>
                <strong>OFFICE ADDRESS</strong>
                <span>Near Bank of Baroda, G.T. Road, Bathinda</span>
              </p>
              <a
                href="https://wa.me/919814573940"
                target="_blank"
                rel="noopener"
                className="mobile-order"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Make An Order
              </a>
            </div>

            <div className="mobile-socials">
              <a href="https://www.facebook.com/rudrakshcreation/about" target="_blank" rel="noopener" className="social-btn fb" aria-label="Facebook">f</a>
              <a href="https://www.instagram.com/rudrakshcreationbti/" target="_blank" rel="noopener" className="social-btn ig" aria-label="Instagram">O</a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener" className="social-btn yt" aria-label="YouTube">&gt;</a>
            </div>
          </nav>

          <div className="nav-actions">
            <div className="social-icons">
              <a href="https://www.facebook.com/rudrakshcreation/about" target="_blank" rel="noopener" className="social-btn fb" aria-label="Facebook">f</a>
              <a href="https://www.instagram.com/rudrakshcreationbti/" target="_blank" rel="noopener" className="social-btn ig" aria-label="Instagram">O</a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener" className="social-btn yt" aria-label="YouTube">&gt;</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
