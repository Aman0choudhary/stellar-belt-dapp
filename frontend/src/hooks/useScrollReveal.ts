import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Hook that triggers a fade-in animation when the element scrolls into view,
 * and resets when it scrolls out — creating a looping reveal effect.
 */
export function useScrollReveal(threshold = 0.15): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}
