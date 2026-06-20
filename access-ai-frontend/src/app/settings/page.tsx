"use client";

import React, { useEffect, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ArrowLeft, Settings, Volume2, Languages, Eye, Ear, BookOpen, Sparkles, Moon, Sun, Smartphone } from "lucide-react";
import Link from "next/link";

export default function SettingsPanel() {
  const {
    settings,
    modes,
    toggleMode,
    updateSettings,
    speak,
    stopSpeaking
  } = useAccessibility();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState("Testing Access A.I. Speech engine config.");
  const [offlineMode, setOfflineMode] = useState(false);

  // 1. Fetch available web synthesis voices
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      setVoices(synth.getVoices());
    };
    
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestSpeech = () => {
    speak(testText);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ voiceURI: e.target.value });
    speak("Synthesizer voice updated.");
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ targetLanguage: e.target.value });
    speak(`Translation language set to ${e.target.value}`);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-28 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
        <Link href="/" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            System Configurations
          </h1>
          <p className="text-xs text-white/50">Manage text-to-speech engine rates, voice settings, and translation languages.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden max-h-[62vh]">
        {/* Left Column (Speech Synthesis settings) */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-6 overflow-y-auto pr-2">
          <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
            <Volume2 size={16} className="text-violet-400" />
            Text To Speech Config
          </h2>

          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-semibold block">Select Speech Voice</label>
            <select
              value={settings.voiceURI}
              onChange={handleVoiceChange}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">Default System Voice</option>
              {voices.map((v, i) => (
                <option key={i} value={v.voiceURI} className="bg-slate-900 text-white text-xs">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-white/60">
              <label className="font-semibold">Speech Speed Rate</label>
              <span className="font-mono text-violet-400 font-bold">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          {/* Voice Command Toggle */}
          <div className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs text-white font-semibold block">Voice Activation (Mic Listening)</span>
              <span className="text-[10px] text-white/40 block">Always listen for wake routes</span>
            </div>
            <button
              onClick={() => updateSettings({ voiceActivation: !settings.voiceActivation })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.voiceActivation ? "bg-green-500" : "bg-white/20"}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full transition-transform ${settings.voiceActivation ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {/* Test Speech Field */}
          <div className="space-y-2 pt-2">
            <label className="text-xs text-white/50 font-semibold block">Test Synthesizer Output</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleTestSpeech}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl border border-violet-500 transition-colors"
              >
                Speak Test
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Profiles & General Config) */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-6 overflow-y-auto pr-2">
          <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
            <Languages size={16} className="text-emerald-400" />
            Classroom & Profile Config
          </h2>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-semibold block">Target Class Translation Language</label>
            <select
              value={settings.targetLanguage}
              onChange={handleLanguageChange}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Profiles Grid */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-semibold block">Activate Accessibility Profile</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleMode("vision")}
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${modes.vision ? "bg-violet-600/20 border-violet-500 text-white font-semibold" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
              >
                <Eye size={14} className="text-violet-400" />
                <span>Vision Profile</span>
              </button>

              <button
                onClick={() => toggleMode("hearing")}
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${modes.hearing ? "bg-emerald-600/20 border-emerald-500 text-white font-semibold" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
              >
                <Ear size={14} className="text-emerald-400" />
                <span>Hearing Profile</span>
              </button>

              <button
                onClick={() => toggleMode("dyslexia")}
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${modes.dyslexia ? "bg-pink-600/20 border-pink-500 text-white font-semibold" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
              >
                <BookOpen size={14} className="text-pink-400" />
                <span>Dyslexia Profile</span>
              </button>

              <button
                onClick={() => toggleMode("normal")}
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${modes.normal ? "bg-slate-600/20 border-slate-500 text-white font-semibold" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
              >
                <Sparkles size={14} className="text-yellow-400" />
                <span>Normal Learning</span>
              </button>
            </div>
          </div>

          {/* Offline Mode config */}
          <div className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs text-white font-semibold block">Offline Mode</span>
              <span className="text-[10px] text-white/40 block">Run client-side mock AI models</span>
            </div>
            <button
              onClick={() => {
                setOfflineMode(!offlineMode);
                speak(offlineMode ? "Online API services restored." : "Offline simulation enabled.");
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${offlineMode ? "bg-green-500" : "bg-white/20"}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full transition-transform ${offlineMode ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
