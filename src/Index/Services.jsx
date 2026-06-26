import React, { useEffect } from "react";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import { useRevealOnScroll } from "./useRevealOnScroll";
import "./About.css";
import "./Contact.css";
import "./Services.css";

function Accent({ children }) {
  return <span className="accent">{children}</span>;
}

const SERVICE_BLOCKS = [
  {
    id: "printing",
    title: "Printing and Publishing",
    reverse: true,
    visualClass: "visual-analyst",
    image: "/image/ser1.gif",
    imageClass: "",
    alt: "Printing and publishing animation",
    content: (
      <>
        <p>
          Rudraksh Creation helps you in all aspects of
          <Accent> Graphic Designing</Accent>,
          <Accent> Layout Designing</Accent> and
          <Accent> Visualization</Accent>.
          We design engaging print assets for publishing and outdoor campaigns that create strong
          brand recall.
        </p>
        <p>
          Our team delivers quality output in
          <Accent> Visiting Cards</Accent>, LetterPads, Posters, Banners,
          <Accent> Brochures</Accent>, Catalogues and
          <Accent> Pamphlets</Accent>.
        </p>
      </>
    ),
  },
  {
    id: "web",
    title: "Web Designing and Development",
    reverse: false,
    visualClass: "visual-rocket",
    image: "/image/ser7.gif",
    imageClass: "",
    alt: "Web design and development animation",
    content: (
      <>
        <p>
          An effective website blends strategy, creativity and conversion focus. We build modern
          websites that help you capture your <Accent>audience attention</Accent> and
          communicate your offer clearly.
        </p>
        <p>
          From business sites to campaign pages, we craft experiences that stand out in the
          <Accent> online crowd</Accent> and support long-term growth.
        </p>
      </>
    ),
  },
  {
    id: "social",
    title: "Social Media Marketing",
    reverse: false,
    extraRowClass: "services-3d-row-next",
    visualClass: "visual-phone",
    image: "/image/ser4.png",
    imageClass: "services-3d-media-phone",
    alt: "Social media marketing illustration",
    content: (
      <>
        <p>
          Our social media marketing services are crafted to generate targeted traffic and genuine
          engagement for your brand. We combine
          <Accent> internet marketing</Accent> and conversion-focused content so your
          audience can discover, trust and remember your business.
        </p>
        <p>
          Services include
          <Accent> Search Engine Marketing (SEM)</Accent>,
          <Accent> Social Media Strategy</Accent>, custom creatives, content calendars,
          online directory submissions, and blog setup with management support.
        </p>
      </>
    ),
  },
  {
    id: "events",
    title: "Event Management",
    reverse: true,
    extraRowClass: "services-3d-row-event",
    visualClass: "visual-desk",
    image: "/image/connecting.jpg",
    imageClass: "services-3d-media-event",
    alt: "Event management and communication illustration",
    content: (
      <>
        <p>
          From
          <Accent> creative conceptualization</Accent> and venue planning to execution,
          Rudraksh Creation provides end-to-end event support that feels smooth, timely and
          professional.
        </p>
        <p>
          We manage sourcing, branding, decor, lighting, audio-visual setup and
          <Accent> interactive elements</Accent> so your event creates meaningful
          engagement with the right audience.
        </p>
      </>
    ),
  },
];

export default function Services() {
  useRevealOnScroll();

  useEffect(() => {
    const loader = document.querySelector(".page-loader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 300);
    }
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

      <SiteNav activePage="services" />

      <main>
        <section className="about-hero reveal-on-scroll" aria-label="Services banner">
          <div className="about-hero-inner">
            <p className="about-kicker">Services</p>
            <h1>Crafting bold print and brand stories.</h1>
            <p className="about-subtitle">
              From premium printing to outdoor advertising, we blend creativity and production to make your
              brand stand out across every surface.
            </p>
            <p className="about-crumbs">
              <a href="/">Home</a>
              <span>&raquo;</span>
              Services
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

        <section className="services-3d-hero reveal-on-scroll" aria-label="Services showcase">
          <span className="services-3d-shape shape-tri-left" aria-hidden="true" />
          <span className="services-3d-shape shape-tri-right" aria-hidden="true" />
          <span className="services-3d-shape shape-dot-top" aria-hidden="true" />
          <span className="services-3d-shape shape-dot-bottom" aria-hidden="true" />

          <div className="services-3d-inner">
            <p className="services-3d-kicker">Services</p>

            {SERVICE_BLOCKS.map((block) => {
              const visual = (
                <div className={`services-3d-visual ${block.visualClass}`} aria-hidden="true">
                  <img
                    className={`services-3d-media ${block.imageClass}`.trim()}
                    src={block.image}
                    alt={block.alt}
                    loading="lazy"
                  />
                </div>
              );
              const content = (
                <article className="services-3d-content">
                  <h2>{block.title}</h2>
                  {block.content}
                </article>
              );

              return (
                <div
                  key={block.id}
                  className={`services-3d-row ${block.reverse ? "services-3d-row-reverse" : ""} ${block.extraRowClass || ""}`.trim()}
                >
                  {block.reverse ? (
                    <>
                      {visual}
                      {content}
                    </>
                  ) : (
                    <>
                      {content}
                      {visual}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
