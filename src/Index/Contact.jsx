import React, { useState, useEffect } from "react";
import axios from "axios";
// import { server_url } from "../url/url";
const  server_url= require("dotenv");
server_url.config();  
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
    notRobot: false,
    formStartedAt: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, formStartedAt: String(Date.now()) }));

    const loader = document.querySelector(".page-loader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 300);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const revealItems = document.querySelectorAll(".reveal-on-scroll");
    if (!revealItems.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
    return () => revealObserver.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = String(e.target.value || "").replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: onlyDigits }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      message: "",
      notRobot: false,
      formStartedAt: String(Date.now()),
      website: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.reportValidity()) {
      setIsError(true);
      setStatus("Please fill all required fields correctly.");
      return;
    }

    const phoneDigits = String(formData.phone).replace(/\D/g, "").slice(0, 10);
    if (phoneDigits.length !== 10) {
      setIsError(true);
      setStatus("Enter a valid 10-digit phone number.");
      return;
    }

    const payload = {
      fullname: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: phoneDigits,
      subject: "Website Contact Form",
      message: formData.message.trim(),
      address: formData.address.trim(),
      notRobot: formData.notRobot,
      formStartedAt: formData.formStartedAt,
      website: formData.website,
      source: "contact",
    };

    setLoading(true);
    setIsError(false);
    setStatus("Sending...");

    try {
      const response = await axios.post(`${server_url}/Enquiry/Esave`, payload);
      if (response?.data?.status === true) {
        setIsError(false);
        setStatus("Thanks! Your enquiry has been submitted.");
        resetForm();
      } else {
        setIsError(true);
        setStatus(response?.data?.msg || "Unable to submit enquiry right now.");
      }
    } catch (error) {
      console.error("[Contact] Enquiry submit failed:", error?.response?.data || error.message);
      setIsError(true);
      setStatus("Unable to submit enquiry right now.");
    } finally {
      setLoading(false);
    }
  };

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

      <SiteNav activePage="contact" />

      <main>
        <section className="contact-hero reveal-on-scroll" aria-label="Contact banner">
          <div className="contact-hero-inner">
            <h1>Contact Us</h1>
            <p className="contact-crumbs">
              <a href="/">Home</a> <span>&raquo;</span> Contact Us
            </p>
          </div>
        </section>

        <section className="contact-professional-section reveal-on-scroll">
          <div className="contact-professional-inner">
            <div className="contact-professional-grid">
              <div className="contact-info-card">
                <p className="contact-section-kicker">Rudraksh Creation</p>
                <h2>Get in Touch</h2>
                <p className="contact-muted">
                  We would be happy to discuss your project requirements. Share your details, and our team will get back to you promptly.
                </p>
                <ul className="contact-info-list">
                  <li>
                    <span className="info-label">Phone</span>
                    <div className="info-value">
                      <a href="tel:+919814573940">+91 98145 73940</a>
                      <span className="divider">|</span>
                      <a href="tel:+919517511636">+91 95175 11636</a>
                    </div>
                  </li>
                  <li>
                    <span className="info-label">Email</span>
                    <div className="info-value">
                      <a href="mailto:rcbti@hotmail.com">rcbti@hotmail.com</a>
                    </div>
                  </li>
                  <li>
                    <span className="info-label">Address</span>
                    <div className="info-value">Near Bank of Baroda, G.T. Road, Bathinda</div>
                  </li>
                </ul>
                <div className="contact-info-extra">
                  <p className="extra-label">Business Hours</p>
                  <p className="extra-value">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <div className="contact-info-actions">
                    <a className="contact-mini-btn primary" href="tel:+919814573940">Call Now</a>
                    <a
                      className="contact-mini-btn ghost"
                      href="https://wa.me/919814573940"
                      target="_blank"
                      rel="noopener"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-form-card">
                <h3>Enquiry Form</h3>
                <p className="form-helper">Our team typically responds within one business day.</p>
                <form className="contact-message-form" onSubmit={handleSubmit}>
                  <input type="hidden" name="formStartedAt" value={formData.formStartedAt} />
                  <div className="bot-trap-field" aria-hidden="true">
                    <label htmlFor="contactWebsite">Website</label>
                    <input
                      id="contactWebsite"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="contactFullName">Full Name</label>
                    <input
                      id="contactFullName"
                      type="text"
                      className="form-control"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="contactEmail">Email Address</label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="contactPhone">Phone No</label>
                    <input
                      id="contactPhone"
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="Enter your 10 digit number"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="contactAddress">Address</label>
                    <textarea
                      id="contactAddress"
                      className="form-control"
                      name="address"
                      rows={2}
                      maxLength={150}
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="contactMessage">Message</label>
                    <textarea
                      id="contactMessage"
                      className="form-control"
                      name="message"
                      rows={4}
                      maxLength={100}
                      placeholder="Write Your Message Here..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="contact-robot-check">
                    <label className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="contactNotRobot"
                        name="notRobot"
                        checked={formData.notRobot}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="form-check-label">I&apos;m not a robot</span>
                    </label>
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                  <p
                    className={`contact-form-status ${status ? "is-visible" : ""} ${isError ? "is-error" : ""}`}
                    role="status"
                    aria-live="polite"
                  >
                    {status}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
