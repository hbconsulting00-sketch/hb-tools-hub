"use client";
import { useCallback, useSyncExternalStore } from "react";

/** The `light` class on <html> is the source of truth — read it, don't mirror it. */
function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

export function ThemeToggle() {
  const isLight = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("light"),
    () => false, // server render: dark is the default
  );

  const toggle = useCallback(() => {
    const root = document.documentElement;
    if (root.classList.contains("light")) {
      root.classList.remove("light");
      localStorage.removeItem("hb-theme");
    } else {
      root.classList.add("light");
      localStorage.setItem("hb-theme", "light");
    }
  }, []);

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={isLight ? "עבור למצב כהה" : "עבור למצב בהיר"}
      title={isLight ? "מצב כהה" : "מצב בהיר"}
      suppressHydrationWarning
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
