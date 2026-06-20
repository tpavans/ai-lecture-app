"use client";

import React from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { AccessibilityManager } from "./AccessibilityManager";
import { VoiceAssistant } from "./VoiceAssistant";
import { ReadingRuler } from "./ReadingRuler";
import { ColorOverlay } from "./ColorOverlay";

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useAccessibility();

  // Map settings to Tailwind font size classes
  const fontSizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  }[settings.fontSize];

  // Map high contrast theme
  const contrastClass =
    settings.contrast === "high"
      ? "bg-slate-950 text-white border-white high-contrast font-bold"
      : "bg-slate-950 text-slate-100";

  // Map font style (OpenDyslexic style)
  const fontStyleClass =
    settings.fontStyle === "dyslexic" ? "font-dyslexic" : "font-sans";

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ${fontSizeClass} ${contrastClass} ${fontStyleClass}`}
    >
      {/* Background radial gradient decoration for normal mode */}
      {settings.contrast === "normal" && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.06),transparent_50%)] pointer-events-none -z-20" />
      )}

      {/* Access AI Accessibility helper overlays */}
      <ReadingRuler />
      <ColorOverlay />
      <AccessibilityManager />
      <VoiceAssistant />

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col relative z-10">{children}</main>
    </div>
  );
};
