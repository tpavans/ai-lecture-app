"use client";

import React, { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { Eye, Ear, Sparkles, BookOpen, Settings, Languages, Type, TypeIcon } from "lucide-react";

export const AccessibilityManager: React.FC = () => {
  const { modes, settings, toggleMode, updateSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const fontSizes = [
    { label: "A-", size: "sm" as const },
    { label: "A", size: "md" as const },
    { label: "A+", size: "lg" as const },
    { label: "A++", size: "xl" as const },
    { label: "A+++", size: "2xl" as const },
  ];

  const overlays = [
    { label: "None", value: "none" as const },
    { label: "Yellow Tint", value: "yellow" as const },
    { label: "Blue Tint", value: "blue" as const },
    { label: "Pink Tint", value: "pink" as const },
  ];

  return (
    <div className="fixed top-4 right-4 z-[990]">
      {/* Floating Manager Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        aria-label="Toggle Accessibility Menu"
      >
        <Settings size={18} className="animate-spin-slow" />
        <span className="text-sm font-semibold">Accessibility Settings</span>
      </button>

      {/* Settings Modal Bar */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-80 p-5 rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl text-white shadow-2xl transition-all">
          <div className="border-b border-white/10 pb-2.5 mb-4">
            <h3 className="font-bold text-sm text-violet-400">Accessibility Profiles</h3>
            <p className="text-[10px] text-white/50">Enable multiple modes simultaneously</p>
          </div>

          {/* Mode Toggles */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => toggleMode("vision")}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${modes.vision ? "bg-violet-600 border-violet-500 text-white font-semibold shadow-inner" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
            >
              <Eye size={16} />
              <span>Vision Assist</span>
            </button>

            <button
              onClick={() => toggleMode("hearing")}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${modes.hearing ? "bg-violet-600 border-violet-500 text-white font-semibold shadow-inner" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
            >
              <Ear size={16} />
              <span>Hearing Assist</span>
            </button>

            <button
              onClick={() => toggleMode("dyslexia")}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${modes.dyslexia ? "bg-violet-600 border-violet-500 text-white font-semibold shadow-inner" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
            >
              <BookOpen size={16} />
              <span>Dyslexia Assist</span>
            </button>

            <button
              onClick={() => toggleMode("normal")}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${modes.normal ? "bg-violet-600 border-violet-500 text-white font-semibold shadow-inner" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
            >
              <Sparkles size={16} />
              <span>Normal learning</span>
            </button>
          </div>

          {/* Sizing Toggles */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-white/40 uppercase mb-2 flex items-center gap-1">
              <Type size={12} />
              <span>Adjust Font Size</span>
            </div>
            <div className="flex bg-white/5 border border-white/5 p-1 rounded-lg justify-between">
              {fontSizes.map((f) => (
                <button
                  key={f.size}
                  onClick={() => updateSettings({ fontSize: f.size })}
                  className={`flex-1 py-1 text-xs rounded transition-all ${settings.fontSize === f.size ? "bg-violet-600 text-white font-bold" : "text-white/60 hover:text-white"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Options (Dyslexia Focus) */}
          <div className="mb-4 space-y-2.5">
            <div className="text-[11px] font-bold text-white/40 uppercase flex items-center gap-1">
              <BookOpen size={12} />
              <span>Dyslexia Assistance Tools</span>
            </div>

            {/* Font Style Toggle */}
            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className="text-xs text-white/80">OpenDyslexic Font</span>
              <button
                onClick={() =>
                  updateSettings({
                    fontStyle: settings.fontStyle === "dyslexic" ? "normal" : "dyslexic",
                  })
                }
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.fontStyle === "dyslexic" ? "bg-green-500" : "bg-white/20"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition-transform ${settings.fontStyle === "dyslexic" ? "translate-x-6" : ""}`}
                />
              </button>
            </div>

            {/* Reading Ruler Toggle */}
            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className="text-xs text-white/80">Reading Ruler Guide</span>
              <button
                onClick={() => updateSettings({ readingRuler: !settings.readingRuler })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.readingRuler ? "bg-green-500" : "bg-white/20"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition-transform ${settings.readingRuler ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Color Overlay Selection */}
          <div className="mb-2">
            <div className="text-[11px] font-bold text-white/40 uppercase mb-2 flex items-center gap-1">
              <Sparkles size={12} />
              <span>Color Tints & Overlays</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {overlays.map((o) => (
                <button
                  key={o.value}
                  onClick={() => updateSettings({ colorOverlay: o.value })}
                  className={`py-1 px-2 text-xs border rounded-lg transition-all text-left truncate ${settings.colorOverlay === o.value ? "bg-white/20 border-white/30 text-white font-semibold" : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
