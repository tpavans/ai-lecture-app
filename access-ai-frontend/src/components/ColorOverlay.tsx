"use client";

import React from "react";
import { useAccessibility } from "../context/AccessibilityContext";

export const ColorOverlay: React.FC = () => {
  const { settings } = useAccessibility();

  if (settings.colorOverlay === "none") return null;

  // Determine overlay color and opacity
  let bgColor = "";
  if (settings.colorOverlay === "yellow") {
    bgColor = "rgba(253, 224, 71, 0.08)"; // Warm yellow
  } else if (settings.colorOverlay === "blue") {
    bgColor = "rgba(96, 165, 250, 0.08)"; // Cool blue
  } else if (settings.colorOverlay === "pink") {
    bgColor = "rgba(244, 114, 182, 0.08)"; // Calm pink
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[998] mix-blend-multiply transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    />
  );
};
