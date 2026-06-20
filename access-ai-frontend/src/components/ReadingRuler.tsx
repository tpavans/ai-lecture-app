"use client";

import React, { useEffect, useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";

export const ReadingRuler: React.FC = () => {
  const { settings } = useAccessibility();
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    if (!settings.readingRuler) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [settings.readingRuler]);

  if (!settings.readingRuler) return null;

  return (
    <div
      className="fixed left-0 right-0 pointer-events-none z-[999] transition-all duration-75 ease-out"
      style={{
        top: `${mouseY - 20}px`,
        height: "40px",
        background: "rgba(234, 179, 8, 0.15)", // Transparent yellow highlight
        borderTop: "2px solid rgba(234, 179, 8, 0.4)",
        borderBottom: "2px solid rgba(234, 179, 8, 0.4)",
        boxShadow: "0 0 15px rgba(234, 179, 8, 0.2)",
      }}
    />
  );
};
