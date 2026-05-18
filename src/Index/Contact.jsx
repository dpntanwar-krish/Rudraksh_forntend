import React, { useState, useEffect } from "react";
import axios from "axios";
import { server_url } from "../url/url";
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
    website: "", // bot trap
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Set form started time
    setFormData(prev => ({ ...prev, formStartedAt: String(Date.now()) }));

    // Page loader logic
    const loader = document.querySelector(".page-loader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 300);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Navigation and other JS logic would go here, but simplified for React
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = String(e.target.value || "").replace(/\D/g, "").slice(0, 10);
    setFormData(prev => ({ ...prev, phone: onlyDigits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.reportValidity()) {
      setStatus("Please fill all required fields correctly.");
      return;
    }

    const phoneDigits = String(formData.phone).replace(/\D/g, "").slice(0, 10);
    if (phoneDigits.length !== 10) {
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
    setStatus("Sending...");

    try {
      const response = await axios.post(`${server_url}/Enquiry/Esave`, payload);
      if (response?.data?.status === true) {
        setStatus("Thanks! Your enquiry has been submitted.");
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
      } else {
        setStatus(response?.data?.msg || "Unable to submit enquiry right now.");
      }
    } catch (error) {
      console.error("[Contact] Enquiry submit failed:", error?.response?.data || error.message);
      setStatus("Unable to submit enquiry right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-loader" aria-hidden="true">
        <div className="loader-inner">
          <img src="images/1.png" alt="Rudraksh Creation" className="loader-logo" />
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
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
            <a className="order-btn" href="https://wa.me/919814573940" target="_blank" rel="noopener">Make An Order</a>
          </div>
        </div>
        <nav className="nav-bar">
          <div className="nav-inner">
            <a className="brand" href="/">
              <img className="brand-logo" src="images/1.png" alt="Rudraksh Creation logo" />
            </a>
            <button className="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="primaryNav">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="nav-links" id="primaryNav">
              <a href="/">Home</a>
              <a href="/about">About</a>
              <div className="nav-dropdown" data-nav-dropdown>
                <a className="nav-gallery-toggle" href="#" role="button" aria-expanded="false">Portfolio</a>
                <div className="nav-dropdown-menu" role="menu" aria-label="Portfolio options">
                  <a className="nav-dropdown-item" href="/printing">PRINTING</a>
                  <a className="nav-dropdown-item" href="/outdoor">Outdoor</a>
                  <a className="nav-dropdown-item" href="/online">Online</a>
                  <a className="nav-dropdown-item" href="/photoshot-video">Photoshot &amp; Video</a>
                  <a className="nav-dropdown-item" href="/events">Events</a>
                  <a className="nav-dropdown-item" href="/promotional">Promotional</a>
                  <a className="nav-dropdown-item" href="/electrronic-ads">Electrronic ADS</a>
                </div>
              </div>
              <a href="services-details.html">Services</a>
              <div className="nav-dropdown" data-nav-dropdown>
                <a className="nav-gallery-toggle" href="#" role="button" aria-expanded="false">Gallery</a>
                <div className="nav-dropdown-menu" role="menu" aria-label="Gallery options">
                  <a className="nav-dropdown-item" href="/photo-gallery">Photo Gallery</a>
                  <a className="nav-dropdown-item" href="/video-gallery">Video Gallery</a>
                </div>
              </div>
              <a className="active" href="/contact">Contact</a>
              <div className="mobile-topbar">
                <div className="mobile-item">
                  <span className="label">Call Us Now</span>
                  <span className="value">09814573940 | 9517511636</span>
                </div>
                <div className="mobile-item">
                  <span className="label">Email Address</span>
                  <span className="value">rcbti@hotmail.com</span>
                </div>
                <div className="mobile-item">
                  <span className="label">Office Address</span>
                  <span className="value">Near Bank of Baroda, G.T. Road, Bathinda</span>
                </div>
                <a className="mobile-order" href="https://wa.me/919814573940" target="_blank" rel="noopener">Make An Order</a>
              </div>
              <div className="mobile-actions">
                <div className="social-icons">
                  <a className="social-btn fb" href="#" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a className="social-btn ig" href="#" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                      <circle cx="12" cy="12" r="4"></circle>
                      <circle cx="17.5" cy="6.5" r="1"></circle>
                    </svg>
                  </a>
                  <a className="social-btn yt" href="#" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 8.5a4 4 0 0 0-2.8-2.8C17.3 5 12 5 12 5s-5.3 0-7.2.7A4 4 0 0 0 2 8.5 41 41 0 0 0 2 12a41 41 0 0 0 .8 3.5 4 4 0 0 0 2.8 2.8C6.7 19 12 19 12 19s5.3 0 7.2-.7a4 4 0 0 0 2.8-2.8A41 41 0 0 0 22 12a41 41 0 0 0 0-3.5z"></path>
                      <path d="M10 9l6 3-6 3z"></path>
                    </svg>
                  </a>
                  <a className="social-btn gm" href="mailto:rcbti@hotmail.com" aria-label="Email">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path>
                      <path d="m22 8-10 6L2 8"></path>
                    </svg>
                  </a>
                </div>
                <button className="print-btn" aria-label="Print">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 7V3h12v4h-2V5H8v2H6zm12 4h2a2 2 0 0 1 2 2v5h-4v3H6v-3H2v-5a2 2 0 0 1 2-2h2v2H4v3h16v-3h-2v-2zM8 19h8v-5H8v5z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="nav-actions">
              <div className="social-icons">
                <a className="social-btn fb" href="https://www.facebook.com/rudrakshcreation/about" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a className="social-btn ig" href="https://www.instagram.com/rudrakshcreationbti/" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17.5" cy="6.5" r="1"></circle>
                  </svg>
                </a>
                <a className="social-btn yt" href="https://www.youtube.com/" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 8.5a4 4 0 0 0-2.8-2.8C17.3 5 12 5 12 5s-5.3 0-7.2.7A4 4 0 0 0 2 8.5 41 41 0 0 0 2 12a41 41 0 0 0 .8 3.5 4 4 0 0 0 2.8 2.8C6.7 19 12 19 12 19s5.3 0 7.2-.7a4 4 0 0 0 2.8-2.8A41 41 0 0 0 22 12a41 41 0 0 0 0-3.5z"></path>
                    <path d="M10 9l6 3-6 3z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section className="contact-hero reveal-on-scroll" aria-label="Contact banner">
          <div className="contact-hero-inner">
            <h1>Contact Us</h1>
            <p className="contact-crumbs"><a href="/">Home</a> <span>&raquo;</span> Contact Us</p>
          </div>
        </section>
        <section className="container py-5 contact-professional-section">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-6">
              <div className="contact-info-card h-100">
                <p className="contact-section-kicker mb-2">Rudraksh Creation</p>
                <h2>Get in Touch</h2>
                <p className="text-muted">We would be happy to discuss your project requirements. Share your details, and our team will get back to you promptly.</p>
                <ul className="contact-info-list list-unstyled mb-0">
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
                    <a className="btn contact-mini-btn primary" href="tel:+919814573940">Call Now</a>
                    <a className="btn contact-mini-btn ghost" href="https://wa.me/919814573940" target="_blank" rel="noopener">WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 contact-form-card h-100">
                <h3>Enquiry Form</h3>
                <p className="form-helper">Our team typically responds within one business day.</p>
                <form className="contact-message-form" onSubmit={handleSubmit} noValidate>
                  <input type="hidden" name="formStartedAt" value={formData.formStartedAt} />
                  <div className="bot-trap-field" aria-hidden="true">
                    <label htmlFor="contactWebsite">Website</label>
                    <input id="contactWebsite" type="text" name="website" tabIndex="-1" autoComplete="off" value={formData.website} onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone No</label>
                    <input type="tel" className="form-control" id="contactPhone" name="phone" placeholder="Enter your 10 digit number" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" minLength="10" maxLength="10" value={formData.phone} onChange={handlePhoneChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" name="address" rows="2" maxLength="150" placeholder="Enter your address" value={formData.address} onChange={handleInputChange} required></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" name="message" rows="4" maxLength="100" placeholder=" Write Your Message Here..." value={formData.message} onChange={handleInputChange} required></textarea>
                  </div>
                  <div className="mb-3 contact-robot-check">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="contactNotRobot" name="notRobot" value="1" checked={formData.notRobot} onChange={handleInputChange} required />
                      <label className="form-check-label" htmlFor="contactNotRobot">I'm not a robot</label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-danger contact-submit-btn" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                  <p className="contact-form-status" role="status" aria-live="polite" style={{ display: status ? "block" : "none" }}>
                    {status}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer reveal-on-scroll" aria-label="Site footer">
        <div className="footer-inner">
          <div className="footer-column about">
            <h3>About Us</h3>
            <p>
              A print is a plot of land that is used to grow crops and raise livestock, as in our farm,
              we raise sheep and sell their wool. The word farm is also used as a verb to mean to work land.
            </p>
          </div>
          <div className="footer-column links">
            <h3>Other Pages</h3>
            <ul className="footer-links">
              <li><a href="/">About Us</a></li>
              <li><a href="/">Services</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">News &amp; Insights</a></li>
              <li><a href="#">Refund Policy</a></li>
              <li><a href="#">Terms &amp; Conditions</a></li>
              <li><a href="#">FAQ &amp; ANS</a></li>
            </ul>
          </div>
          <div className="footer-column contact">
            <h3>Get In Touch</h3>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92V21a1 1 0 0 1-1.09 1 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 3.09 1 1 0 0 1 3 2h4.09a1 1 0 0 1 1 .75l1 3.49a1 1 0 0 1-.27 1L7.21 8.79a16 16 0 0 0 6 6l1.55-1.55a1 1 0 0 1 1-.27l3.49 1a1 1 0 0 1 .75 1z"></path>
                  </svg>
                </span>
                <span>09814573940 | 9517511636</span>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path>
                    <path d="m22 8-10 6L2 8"></path>
                  </svg>
                </span>
                <span>rcbti@hotmail.com</span>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <span>Near Bank of Baroda, G.T. Road, Bathinda</span>
              </li>
              <li>
                <span className="contact-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <span>United States, America</span>
              </li>
            </ul>
          </div>
          <div className="footer-column subscribe">
            <h3>Subscribe Us</h3>
            <p>Subscribe us &amp; receive our office &amp; update in your inbox directly</p>
            <form className="footer-form" action="#" aria-label="Subscribe form">
              <span className="footer-form-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path>
                  <path d="m22 8-10 6L2 8"></path>
                </svg>
              </span>
              <input type="email" name="email" placeholder="Email address" required />
              <button type="submit" aria-label="Subscribe">Subscribe</button>
            </form>
            <p className="footer-success" role="status" aria-live="polite"></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright &amp; Design By <span>@Bdevs</span> - 2026</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 8v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="#" aria-label="Behance">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h6a3 3 0 0 1 0 6H3V6zm0 7h6a3 3 0 0 1 0 6H3v-6zm10-6h6v2h-6V7zm3 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"></path>
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 8.5a4 4 0 0 0-2.8-2.8C17.3 5 12 5 12 5s-5.3 0-7.2.7A4 4 0 0 0 2 8.5 41 41 0 0 0 2 12a41 41 0 0 0 .8 3.5 4 4 0 0 0 2.8 2.8C6.7 19 12 19 12 19s5.3 0 7.2-.7a4 4 0 0 0 2.8-2.8A41 41 0 0 0 22 12a41 41 0 0 0 0-3.5z"></path>
                <path d="M10 9l6 3-6 3z"></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-logo" aria-hidden="true">
          <img src="images/1.png" alt="" />
        </div>
      </footer>
    </>
  );
}
