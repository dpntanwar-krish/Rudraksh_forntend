import { useEffect, useMemo, useState } from "react";
import "./SplashScreen.css";

const STATUS_LABELS = [
  "Initializing Brand Canvas...",
  "Loading Creative Modules...",
  "Rendering Visual Experience...",
  "Preparing Final Touch...",
];

function playCompleteSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    master.connect(ctx.destination);

    const oscA = ctx.createOscillator();
    oscA.type = "sine";
    oscA.frequency.setValueAtTime(660, now);
    oscA.frequency.exponentialRampToValueAtTime(980, now + 0.18);
    oscA.connect(master);

    const oscB = ctx.createOscillator();
    oscB.type = "triangle";
    oscB.frequency.setValueAtTime(420, now);
    oscB.frequency.exponentialRampToValueAtTime(760, now + 0.2);
    oscB.connect(master);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.35);
    oscB.stop(now + 0.35);

    setTimeout(() => ctx.close(), 450);
  } catch {
    // Ignore audio errors to avoid blocking UX.
  }
}

export default function SplashScreen({ onComplete, duration = 3000 }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        style: {
          left: `${5 + Math.random() * 90}%`,
          top: `${8 + Math.random() * 84}%`,
          animationDelay: `${Math.random() * 1.6}s`,
          animationDuration: `${2.6 + Math.random() * 2.4}s`,
        },
      })),
    []
  );

  useEffect(() => {
    const startTime = Date.now();
    const cycleMs = Math.max(600, Math.floor(duration / STATUS_LABELS.length));
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_LABELS.length);
    }, cycleMs);

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);
    }, 50);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      playCompleteSound();
      setIsExiting(true);
      setTimeout(() => onComplete?.(), 520);
    }, duration);

    return () => {
      clearInterval(statusTimer);
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`splash-overlay ${isExiting ? "splash-exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Rudraksh Creation"
    >
      <div className="splash-frame frame-tl" />
      <div className="splash-frame frame-tr" />
      <div className="splash-frame frame-bl" />
      <div className="splash-frame frame-br" />

      <div className="splash-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span key={particle.id} className="splash-particle" style={particle.style} />
        ))}
      </div>

      <div className="splash-center">
        <div className="splash-ambient-glow" aria-hidden="true" />
        <h1 className="brand-title">
          <span className="brand-rudraksh">
            Ru
            <span className="brand-d-mark">
              d
              <span className="d-spiral-ring" aria-hidden="true" />
            </span>
            raksh
          </span>
          <span className="brand-creation">creation</span>
        </h1>
        <p className="brand-tagline">Crafting Visual Excellence</p>

        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-track">
            <span className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
        <p className="status-text">{STATUS_LABELS[statusIndex]}</p>
      </div>
    </div>
  );
}
