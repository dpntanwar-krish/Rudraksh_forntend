import React from "react";

export default function Testimonials() {
  return (
    <section id="Testimonials" className="testimonials-section reveal-on-scroll" aria-label="User feedback">
      <div className="testimonials-inner">
        <div className="testimonials-head">
          <div>
            <p className="testimonials-eyebrow">Testimonials</p>
            <h2>Users Feedback</h2>
          </div>
          <div className="testimonials-actions">
            <button type="button" data-testimonial-nav="prev" aria-label="Previous">←</button>
            <button type="button" data-testimonial-nav="next" aria-label="Next">→</button>
          </div>
        </div>

        <div className="testimonials-row">
          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span>★</span>
            </div>
            <p className="testimonial-text">“I never leave in-house without business cards. They help us impress clients and close deals faster.”</p>
            <div className="testimonial-footer">
              <div className="avatar">MH</div>
              <div>
                <p className="name">Miranda Helson</p>
                <p className="role">Head Of Idea</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>

          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span>★</span>
            </div>
            <p className="testimonial-text">“The design quality and quick delivery helped our campaign launch on time without extra cost.”</p>
            <div className="testimonial-footer">
              <div className="avatar">RR</div>
              <div>
                <p className="name">Raphael Ross</p>
                <p className="role">Print Finisher</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>

          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span>
            </div>
            <p className="testimonial-text">“Great support and brilliant creativity. Our social media engagement doubled within weeks.”</p>
            <div className="testimonial-footer">
              <div className="avatar">CR</div>
              <div>
                <p className="name">Clara Rishi</p>
                <p className="role">Marketing Lead</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>

          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span>★</span>
            </div>
            <p className="testimonial-text">“Professional service and premium print finishes. Our event banners looked amazing.”</p>
            <div className="testimonial-footer">
              <div className="avatar">AS</div>
              <div>
                <p className="name">Aarav Singh</p>
                <p className="role">Event Manager</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>

          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span>
            </div>
            <p className="testimonial-text">“Everything from logo to brochures felt premium. The team really cares about details.”</p>
            <div className="testimonial-footer">
              <div className="avatar">PS</div>
              <div>
                <p className="name">Priya Sharma</p>
                <p className="role">Business Owner</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>

          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span>★</span>
            </div>
            <p className="testimonial-text">“Fast turnaround and friendly support. They handled our branding and signage perfectly.”</p>
            <div className="testimonial-footer">
              <div className="avatar">NK</div>
              <div>
                <p className="name">Neha Kapoor</p>
                <p className="role">Store Manager</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>

          <article className="testimonial-card">
            <div className="stars">
              <span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span><span className="filled">★</span>
            </div>
            <p className="testimonial-text">“Highly professional team. Our wedding cards and banners looked stunning.”</p>
            <div className="testimonial-footer">
              <div className="avatar">VT</div>
              <div>
                <p className="name">Vikram Tandon</p>
                <p className="role">Client</p>
              </div>
            </div>
            <span className="quote-mark">“</span>
          </article>
        </div>
      </div>
    </section>
  );
}
