"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("hb-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.removeItem("hb-theme");
    }
  }

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={isLight ? "עבור למצב כהה" : "עבור למצב בהיר"}
      title={isLight ? "מצב כהה" : "מצב בהיר"}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
