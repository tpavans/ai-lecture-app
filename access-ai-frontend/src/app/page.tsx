"use client";

import React, { useEffect, useState } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import { useAccessibility } from "@/context/AccessibilityContext";
import {
  MessageSquare,
  Presentation,
  ScanText,
  FileText,
  Mic,
  Volume2,
  Languages,
  Subtitles,
  History,
  Notebook,
  Eye,
  Navigation,
  AlertTriangle,
  Settings as SettingsIcon,
  Accessibility,
  FolderSync
} from "lucide-react";

export default function Dashboard() {
  const { speak } = useAccessibility();

  // Highlight page opening for blind students
  useEffect(() => {
    // Wait a brief moment for the layout voice greeting
    setTimeout(() => {
      speak("Dashboard opened. You can now speak a command or select a learning tool below.");
    }, 4500);
  }, []);

  const coreAITools = [
    {
      title: "AI Tutor",
      description: "Ask queries, generate quizzes, and receive explanations at your own pace.",
      icon: MessageSquare,
      href: "/tutor",
      glowColor: "rgba(139, 92, 246, 0.4)", // Violet
      badge: "Gemini Pro"
    },
    {
      title: "Live Classroom",
      description: "Mirror your teacher's speech in real-time with transcripts and instant notes.",
      icon: Presentation,
      href: "/classroom",
      glowColor: "rgba(16, 185, 129, 0.4)", // Emerald
      badge: "Live Broadcast"
    },
    {
      title: "OCR Scanner",
      description: "Extract study text from textbook images, simplify phrasing, and translate.",
      icon: ScanText,
      href: "/ocr",
      glowColor: "rgba(236, 72, 153, 0.4)" // Pink
    },
    {
      title: "PDF Reader",
      description: "Upload learning material and listen to high-quality audio with sentence tracking.",
      icon: FileText,
      href: "/pdf",
      glowColor: "rgba(6, 182, 212, 0.4)" // Cyan
    }
  ];

  const helperServices = [
    {
      title: "Speech to Text",
      description: "Direct speech transcriber. Convert audio recordings into written content.",
      icon: Mic,
      href: "/classroom", // Shared module
      glowColor: "rgba(249, 115, 22, 0.3)" // Orange
    },
    {
      title: "Text to Speech",
      description: "Synthesize notes or documents into natural spoken audio files.",
      icon: Volume2,
      href: "/pdf", // Shared module
      glowColor: "rgba(59, 130, 246, 0.3)" // Blue
    },
    {
      title: "Translator",
      description: "Translate lectures and documents into Indian languages like Telugu or Hindi.",
      icon: Languages,
      href: "/settings", // Settings manages default language
      glowColor: "rgba(99, 102, 241, 0.3)" // Indigo
    },
    {
      title: "Live Captions",
      description: "Dedicated full-screen subtitles with custom sizes and contrasts.",
      icon: Subtitles,
      href: "/classroom?subtitles=only",
      glowColor: "rgba(34, 197, 94, 0.3)" // Green
    }
  ];

  const archiveAndVision = [
    {
      title: "Lecture History",
      description: "Browse past transcripts, saved slides, and search old classroom dictations.",
      icon: History,
      href: "/classroom?tab=history",
      glowColor: "rgba(245, 158, 11, 0.3)" // Amber
    },
    {
      title: "AI Notes",
      description: "Review generated study materials: summary bullet points, mind maps, and quiz sets.",
      icon: Notebook,
      href: "/classroom?tab=history",
      glowColor: "rgba(168, 85, 247, 0.3)" // Purple
    },
    {
      title: "Object Detection",
      description: "Identify classroom equipment like whiteboards, doors, chairs, and books.",
      icon: Eye,
      href: "/navigation",
      glowColor: "rgba(239, 68, 68, 0.4)", // Red
      badge: "YOLOv8"
    },
    {
      title: "Navigation Assistant",
      description: "Auditory indoor guidance cues to navigate classrooms obstacle-free.",
      icon: Navigation,
      href: "/navigation",
      glowColor: "rgba(236, 72, 153, 0.3)" // Fuchsia
    }
  ];

  const systemControls = [
    {
      title: "Settings",
      description: "Change speed, voice narrator configs, offline mode, and languages.",
      icon: SettingsIcon,
      href: "/settings",
      glowColor: "rgba(100, 116, 139, 0.3)" // Slate
    },
    {
      title: "Accessibility Modes",
      description: "Activate vision, hearing, or dyslexia assistance visual helpers.",
      icon: Accessibility,
      href: "/settings?tab=profiles",
      glowColor: "rgba(20, 184, 166, 0.3)" // Teal
    },
    {
      title: "Emergency SOS",
      description: "Instantly alert peers or request room navigation assistance.",
      icon: AlertTriangle,
      href: "/emergency",
      glowColor: "rgba(220, 38, 38, 0.6)", // Bright Red
      badge: "SOS Alert"
    }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-28 flex flex-col justify-start">
      {/* Header Banner */}
      <div className="mb-12 relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-violet-400 bg-violet-950/40 border border-violet-800/40 rounded-full uppercase animate-pulse">
            Hackathon Edition
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">
          ACCESS AI
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl">
          Learn Without Barriers. A unified AI ecosystem customized dynamically for blind, hearing impaired, dyslexic, and multilingual students.
        </p>
      </div>

      {/* Grid Sections */}
      <div className="space-y-10">
        {/* Section 1: Core AI Applications */}
        <div>
          <h2 className="text-xl font-bold text-slate-200 border-l-4 border-violet-500 pl-3 mb-5">
            Core AI Learning Ecosystem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreAITools.map((card, i) => (
              <DashboardCard key={i} {...card} />
            ))}
          </div>
        </div>

        {/* Section 2: Helper Services */}
        <div>
          <h2 className="text-xl font-bold text-slate-200 border-l-4 border-emerald-500 pl-3 mb-5">
            Speech & Translator Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {helperServices.map((card, i) => (
              <DashboardCard key={i} {...card} />
            ))}
          </div>
        </div>

        {/* Section 3: Navigation, History & AI Notes */}
        <div>
          <h2 className="text-xl font-bold text-slate-200 border-l-4 border-rose-500 pl-3 mb-5">
            Vision, Navigation & Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {archiveAndVision.map((card, i) => (
              <DashboardCard key={i} {...card} />
            ))}
          </div>
        </div>

        {/* Section 4: System & Emergency */}
        <div>
          <h2 className="text-xl font-bold text-slate-200 border-l-4 border-red-500 pl-3 mb-5">
            System Config & Emergency Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {systemControls.map((card, i) => (
              <DashboardCard key={i} {...card} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
