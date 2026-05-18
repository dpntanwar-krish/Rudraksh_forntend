import React, { useEffect, useState } from "react";
import "./Home.css";
import rc from "/image/1.png";
import Testimonials from "./Testimonials";
import VideoSection from "./VideoSection";
import Sponsors from "./Sponsors";
import axios from "axios";
import { server_url } from "../url/url";

function Home() {
  const navItems = ["Home", "About", "Portfolio", "Services", "Gallery", "Contact"];
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(true);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const fetchHomeSliders = async () => {
      try {
        const res = await axios.get(server_url + "/Slider/all");
        if (res?.data?.status === true) {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          const images = list.map((item) => item.imageUrl).filter(Boolean);
          setSlides(images);
        }
      } catch (err) {
        console.error("Home slider fetch failed:", err?.message);
      }
    };

    fetchHomeSliders();
  }, []);

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
    if (!data.subject || data.subject.trim().length < 5) return "Subject must be at least 5 characters";
    if (!data.message || data.message.trim().length < 10) return "Message must be at least 10 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate(formData);
    if (err) {
      setStatusMsg(err);
      return;
    }

    setSubmitting(true);
    setStatusMsg("Sending...");

    try {
      const res = await axios.post(server_url + "/Enquiry/Esave", formData);

      if (res?.data?.status === true) {
        setStatusMsg("Enquiry sent successfully");
        setFormData({ fullname: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatusMsg(String(res?.data?.msg || "Server error"));
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-bg">
      {isEnquiryModalOpen ? (
        <div className="home-enquiry-modal-overlay" role="dialog" aria-modal="true" aria-label="Enquiry Form">
          <div className="home-enquiry-modal">
            <button
              type="button"
              className="home-enquiry-close"
              aria-label="Close enquiry form"
              onClick={() => setIsEnquiryModalOpen(false)}
            >
              x
            </button>

            <h2>Enquiry Form</h2>
            <form onSubmit={handleSubmit} className="home-enquiry-form">
              <div className="home-enquiry-grid">
                <input type="text" name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="home-enquiry-grid">
                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
                <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
              </div>

              <textarea name="message" placeholder="Message" rows={5} value={formData.message} onChange={handleChange} required />

              <button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send"}</button>
              <p className="home-enquiry-status">{statusMsg}</p>
            </form>
          </div>
        </div>
      ) : (
        <button type="button" className="open-enquiry-btn" onClick={() => setIsEnquiryModalOpen(true)}>
          Open Enquiry Form
        </button>
      )}

      <header className="site-header">
        <div className="top-bar">
          <div className="top-inner">
            <div className="top-info">
              <div className="top-item">
                <span className="label">CALL US NOW</span>
                <span className="value">09814573940 | 9517511636</span>
              </div>
              <div className="top-item">
                <span className="label">EMAIL ADDRESS</span>
                <span className="value">rcbti@hotmail.com</span>
              </div>
              <div className="top-item">
                <span className="label">OFFICE ADDRESS</span>
                <span className="value">Near Bank of Baroda, G.T. Road, Bathinda</span>
              </div>
            </div>
            <a href="#" className="order-btn">Make An Order</a>
          </div>
        </div>

        <div className="nav-bar">
          <div className="nav-inner">
            <a href="#" className="brand">
              <img src={rc} alt="Rudraksh Creation" className="brand-logo" />
            </a>

            <nav className="nav-links">
              {navItems.map((item, idx) => (
                <a key={item} href="#" className={idx === 0 ? "active" : ""}>
                  {item}
                </a>
              ))}
            </nav>

            <div className="nav-actions">
              <div className="social-icons">
                <a href="#" className="social-btn fb" aria-label="Facebook">f</a>
                <a href="#" className="social-btn ig" aria-label="Instagram">O</a>
                <a href="#" className="social-btn yt" aria-label="YouTube">&gt;</a>
              </div>
            </div>
          </div>
        </div>
      </header>

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
      <VideoSection />
      <Sponsors />
    </div>
  );
}

export default Home;
