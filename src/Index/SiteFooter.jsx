import React from "react";
import "./Contact.css";

export default function SiteFooter() {
  return (
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
  );
}
