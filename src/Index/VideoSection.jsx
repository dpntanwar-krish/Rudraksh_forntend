import React from "react";

export default function VideoSection() {
  return (
    <section className="video-section reveal-on-scroll py-12 px-4 sm:px-6 lg:px-8" aria-label="Design guideline video">
      <div className="video-inner max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start md:space-x-12 space-y-12 md:space-y-0">
        <div className="video-card w-full md:w-1/2 relative rounded-lg overflow-hidden shadow-xl">
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

        <div className="video-content w-full md:w-1/2 text-center md:text-left">

          <div className="video-panels mt-8 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="video-panel highlight bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
              <h3>Grid Guideline</h3>
              <ul>
                <li>Bleed: 2.91" × 1.26"</li>
                <li>Trim: 2.75" × 1.10"</li>
                <li>Safe: 2.6" × 0.94"</li>
              </ul>
            </div>

            <div className="video-panel tools is-animated bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
              <h3>Design Tools</h3>
              <ul>
                <li>Adobe Photoshop</li>
                <li>Adobe InDesign</li>
                <li>Adobe Illustrator</li>
              </ul>
            </div>
          </div>

          <div className="video-footer mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="video-avatars flex -space-x-2 overflow-hidden">
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
