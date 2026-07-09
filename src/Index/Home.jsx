import React, { useCallback, useEffect, useState } from "react";
import "./Home.css";
import SiteNav from "./SiteNav";
import { useRevealOnScroll } from "./useRevealOnScroll";
import Testimonials from "./Testimonials";
import Sponsors from "./Sponsors";
import axios from "axios";
import { server_url } from "../url/url";
import SiteFooter from "./SiteFooter";

function Home() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    subject: "Printing Services",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const subjectOptions = [
    "Printing Services",
    "Web Design Services",
    "Offset Services",
    "Design Services",
    "Photoshoot & Video",
    "Events & Promotions",
    "Other",
  ];

  const closeEnquiryModal = useCallback(() => {
    setIsEnquiryModalOpen(false);
    setStatusMsg("");
    setIsError(false);
  }, []);

  useRevealOnScroll();
  useEffect(() => {
    const fetchHomeSliders = async () => {
      try {
        const res = await axios.get(server_url + "/Slider/all");
        if (res?.data?.status === true) {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          const images = list
            .filter((item) => item?.isActive !== false)
            .map((item) => item.imageUrl || item.image)
            .filter(Boolean);
          setSlides(images);
        }
      } catch (err) {
        console.error("Home slider fetch failed:", err?.message);
      }
    };

    fetchHomeSliders();
  }, []);

  useEffect(() => {
    if (!isEnquiryModalOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeEnquiryModal();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isEnquiryModalOpen, closeEnquiryModal]);

  useEffect(() => {
    if (!slides.length) return undefined;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    if (!slides.length) return;
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (!slides.length) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyDigits = String(value || "").replace(/\D/g, "").slice(0, 10);
      setFormData((f) => ({ ...f, [name]: onlyDigits }));
      return;
    }
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const validate = (data) => {
    if (!data.fullname || data.fullname.trim().length < 3) return "Full name must be at least 3 characters";
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Enter a valid email";
    if (!data.phone || !/^[0-9]{10}$/.test(data.phone)) return "Enter a valid 10 digit phone number";
    if (!data.subject || data.subject.trim().length < 3) return "Please select a service";
    if (!data.message || data.message.trim().length < 10) return "Message must be at least 10 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate(formData);
    if (err) {
      setIsError(true);
      setStatusMsg(err);
      return;
    }

    setSubmitting(true);
    setIsError(false);
    setStatusMsg("Sending your enquiry...");

    try {
      const res = await axios.post(server_url + "/Enquiry/Esave", {
        ...formData,
        source: "home",
      });

      if (res?.data?.status === true) {
        setIsError(false);
        setStatusMsg("Thank you! Our team will contact you shortly.");
        setFormData({ fullname: "", email: "", phone: "", subject: subjectOptions[0], message: "" });
      } else {
        setIsError(true);
        setStatusMsg(String(res?.data?.msg || "Unable to submit enquiry right now."));
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setStatusMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-bg">
      <button
        type="button"
        className="home-enquiry-fab"
        onClick={() => setIsEnquiryModalOpen(true)}
        aria-label="Open enquiry form"
      >
        <span className="home-enquiry-fab-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </span>
        Enquire Now
      </button>

      {isEnquiryModalOpen ? (
        <div
          className="home-enquiry-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Enquiry form"
          onClick={closeEnquiryModal}
        >
          <div className="home-enquiry-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="home-enquiry-close"
              aria-label="Close enquiry form"
              onClick={closeEnquiryModal}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="home-enquiry-head">
              <p className="home-enquiry-kicker">Rudraksh Creation</p>
              <h2>Quick Enquiry</h2>
              <p className="home-enquiry-helper">
                Share your requirements and our team will get back to you within one business day.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="home-enquiry-form" noValidate>
              <div className="home-enquiry-grid">
                <div className="home-enquiry-field">
                  <label className="home-enquiry-label" htmlFor="homeEnquiryName">Full Name</label>
                  <input
                    id="homeEnquiryName"
                    type="text"
                    name="fullname"
                    className="home-enquiry-control"
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    minLength={3}
                    autoComplete="name"
                  />
                </div>
                <div className="home-enquiry-field">
                  <label className="home-enquiry-label" htmlFor="homeEnquiryEmail">Email Address</label>
                  <input
                    id="homeEnquiryEmail"
                    type="email"
                    name="email"
                    className="home-enquiry-control"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="home-enquiry-grid">
                <div className="home-enquiry-field">
                  <label className="home-enquiry-label" htmlFor="homeEnquiryPhone">Phone Number</label>
                  <input
                    id="homeEnquiryPhone"
                    type="tel"
                    name="phone"
                    className="home-enquiry-control"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    minLength={10}
                    maxLength={10}
                    autoComplete="tel-national"
                  />
                </div>
                <div className="home-enquiry-field">
                  <label className="home-enquiry-label" htmlFor="homeEnquirySubject">Service Required</label>
                  <select
                    id="homeEnquirySubject"
                    name="subject"
                    className="home-enquiry-control"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="home-enquiry-field">
                <label className="home-enquiry-label" htmlFor="homeEnquiryMessage">Project Details</label>
                <textarea
                  id="homeEnquiryMessage"
                  name="message"
                  className="home-enquiry-control"
                  placeholder="Tell us about quantity, timeline, or any specific requirements..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                />
              </div>

              <div className="home-enquiry-actions">
                <button type="submit" className="home-enquiry-submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Submit Enquiry"}
                </button>
                <p
                  className={`home-enquiry-status ${statusMsg ? "is-visible" : ""} ${isError ? "is-error" : statusMsg ? "is-success" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {statusMsg}
                </p>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <SiteNav activePage="home" />

      <section className="hero-black carousel">
        {!slides.length ? (
          <div className="carousel-empty">No sliders available</div>
        ) : (
          <>
        <button type="button" className="carousel-btn left" onClick={prevSlide} aria-label="Previous slide">&lt;</button>
        <img
          key={current}
          src={slides[current]}
          alt="Rudraksh slide"
          className="carousel-image carousel-image-enter"
        />
        <button type="button" className="carousel-btn right" onClick={nextSlide} aria-label="Next slide">&gt;</button>

        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`dot ${index === current ? "active" : ""}`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
                </>
        )}
      </section>

      <section className="experience-section">
        <div className="experience-inner">
          <div className="experience-visual">
            <div className="experience-ring" />
            <div className="experience-ring experience-ring-secondary" />
            <div>
              <div className="experience-count">
                <span>15</span>
                <span className="experience-plus">+</span>
              </div>
              <p className="experience-label">YEARS EXPERIENCE</p>
            </div>
          </div>

          <div className="experience-content">
            <p className="experience-eyebrow">ABOUT US</p>
            <h2>Printing Solutions for Your Company.</h2>
            <p>
              From finance, retail, and travel, to social media, cybersecurity, adtech, and
              more, market leaders are leveraging web data to maintain their advantage.
              Discover how it can work for you.
            </p>

            <div className="experience-stats">
              <div>
                <span className="stat-number">200+</span>
                <span className="stat-label">Projects Delivered</span>
              </div>
              <div>
                <span className="stat-number">150+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="Services" className="services-section reveal-on-scroll" aria-label="Best offer services">
        <div className="services-inner">
          <div className="services-head">
            <p className="services-eyebrow">Best Offer Services</p>
            <h2>Best Offer Services</h2>
          </div>
          <div className="services-grid">
            <article className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="12" rx="2" />
                  <rect x="6" y="2" width="12" height="5" rx="2" />
                  <circle cx="9" cy="11" r="2" />
                  <path d="M7 15h10" />
                </svg>
              </div>
              <h3>Printing Services</h3>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
              </div>
              <h3>Web Design Services</h3>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="3" width="16" height="18" rx="3" />
                  <path d="M8 8h8M8 12h8M8 16h6" />
                </svg>
              </div>
              <h3>Offset Services</h3>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="M7 9h10M7 12h10M7 15h6" />
                </svg>
              </div>
              <h3>Design Services</h3>
            </article>
          </div>
        </div>
      </section>

      <Testimonials />
      <Sponsors />
      <SiteFooter />
    </div>
  );
}

export default Home;
