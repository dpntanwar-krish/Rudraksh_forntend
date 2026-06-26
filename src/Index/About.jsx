import React, { useEffect, useState } from "react";
import axios from "axios";
import { server_url } from "../url/url";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import Sponsors from "./Sponsors";
import { useRevealOnScroll } from "./useRevealOnScroll";
import "./About.css";
import "./Contact.css";

const SOCIAL_LINKS = [
  { key: "facebook", label: "Facebook", short: "f" },
  { key: "twitter", label: "Twitter", short: "t" },
  { key: "behance", label: "Behance", short: "Be" },
  { key: "linkedin", label: "LinkedIn", short: "in" },
];

export default function About() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useRevealOnScroll();

  useEffect(() => {
    const loader = document.querySelector(".page-loader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 300);
    }
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      setTeamLoading(true);
      try {
        const res = await axios.get(`${server_url}/Team/active`);
        if (res?.data?.status === true) {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          setTeamMembers(
            [...list].sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0)),
          );
        }
      } catch (err) {
        console.error("Team fetch failed:", err?.message || err);
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeam();
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

      <SiteNav activePage="about" />

      <main>
        <section className="about-hero reveal-on-scroll" aria-label="About banner">
          <div className="about-hero-inner">
            <p className="about-kicker">About</p>
            <h1>Crafting bold print and brand stories.</h1>
            <p className="about-subtitle">
              From premium printing to outdoor advertising, we blend creativity and production to make your
              brand stand out across every surface.
            </p>
            <p className="about-crumbs">
              <a href="/">Home</a>
              <span>&raquo;</span>
              About
            </p>
            <div className="about-hero-actions">
              <a className="primary-btn" href="https://wa.me/919814573940" target="_blank" rel="noopener">
                Start on WhatsApp
              </a>
              <a className="ghost-btn" href="/contact">
                Contact Us
              </a>
            </div>
          </div>
        </section>

        <section className="about-experience-section reveal-on-scroll" aria-label="Experience">
          <div className="about-experience-inner">
            <div className="about-collage">
              <img src="/image/about-1.png" alt="Print production and design collage" />
            </div>
            <div className="about-experience-content">
              <p className="about-eyebrow">Our Experience</p>
              <h1>Creative Advertising &amp; Print Experts</h1>
              <p>
                We deliver indoor &amp; outdoor advertising, posters, banners, hoardings, and branding
                solutions with premium design and reliable execution.
              </p>
              <ul className="about-points">
                <li>Custom layouts for every size and placement</li>
                <li>High-quality print materials and finishes</li>
                <li>On-time delivery with professional installation support</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="team-section reveal-on-scroll" aria-label="Team members">
          <div className="team-inner">
            <p className="team-eyebrow">Join Our Teams</p>
            <h2>Team Member</h2>

            {teamLoading ? (
              <div className="team-loading">Loading team members...</div>
            ) : teamMembers.length === 0 ? (
              <div className="team-empty-state">Team members will appear here once added from the admin panel.</div>
            ) : (
              <div className="team-grid">
                {teamMembers.map((member) => (
                  <article key={member._id} className="team-card">
                    <div className="team-photo">
                      <img src={member.imageUrl} alt={member.name} loading="lazy" />
                    </div>
                    <div className="team-body">
                      <h3>{member.name}</h3>
                      <p className="team-role">{member.role}</p>
                      <div className="team-socials">
                        {SOCIAL_LINKS.map((social) => {
                          const href = member[social.key];
                          if (!href) return null;
                          return (
                            <a
                              key={social.key}
                              className="team-social"
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={social.label}
                            >
                              {social.short}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <Sponsors />
      </main>

      <SiteFooter />
    </>
  );
}
