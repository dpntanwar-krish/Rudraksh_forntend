import { useEffect } from "react";

export function useRevealOnScroll() {
  useEffect(() => {
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
}
