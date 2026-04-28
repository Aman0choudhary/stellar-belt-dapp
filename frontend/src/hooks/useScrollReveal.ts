import { useEffect, useRef, type RefObject } from "react";

/**
 * Hook that triggers a CSS-class-based scroll reveal animation.
 * Uses direct DOM manipulation (no React state) to prevent scroll jank.
 * Adds/removes the "revealed" class which CSS transitions handle.
 */
export function useScrollReveal(threshold = 0.15): [RefObject<HTMLDivElement | null>, string] {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback for environments without IntersectionObserver support.
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          // Keep revealed once visible to avoid flicker/disappearing content.
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  // Return a className string instead of a boolean
  // Components use this as: className={`scroll-reveal ${revealClass}`}
  return [ref, "scroll-reveal"];
}
