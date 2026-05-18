import React from "react";

export default function VideoSection() {
  return (
    <section className="video-section reveal-on-scroll" aria-label="Design guideline video">
      <div className="video-inner">
        <div className="video-card">
          <img src="/image/1.png" alt="Design workspace preview" />
          <button
            className="play-button"
            type="button"
            data-video-url="https://www.youtube.com/embed/978unUC_qiY"
            aria-label="Play video"
          >
            <span />
          </button>
        </div>

        <div className="video-content">
          <p className="video-eyebrow">Core Features</p>
          <h2>Download A Design Guideline</h2>

          <div className="video-panels">
            <div className="video-panel highlight">
              <h3>Grid Guideline</h3>
              <ul>
                <li>Bleed: 2.91" × 1.26"</li>
                <li>Trim: 2.75" × 1.10"</li>
                <li>Safe: 2.6" × 0.94"</li>
              </ul>
            </div>

            <div className="video-panel tools is-animated">
              <h3>Design Tools</h3>
              <ul>
                <li>Adobe Photoshop</li>
                <li>Adobe InDesign</li>
                <li>Adobe Illustrator</li>
              </ul>
            </div>
          </div>

          <div className="video-footer">
            <div className="video-avatars">
              <img src="/image/men1.avif" alt="Reviewer RC" loading="lazy" />
              <img src="/image/men2.jpg" alt="Reviewer DM" loading="lazy" />
              <img src="/image/men3.avif" alt="Reviewer PR" loading="lazy" />
            </div>
            <p>Over 30,000 people trust us across 10+ countries.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
