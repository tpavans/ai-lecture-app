"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type FontSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type ColorOverlay = "none" | "yellow" | "blue" | "pink";
export type ContrastMode = "normal" | "high";
export type FontStyle = "normal" | "dyslexic";

export interface AccessibilityModes {
  vision: boolean;
  hearing: boolean;
  dyslexia: boolean;
  language: boolean;
  normal: boolean;
}

interface AccessibilitySettings {
  fontSize: FontSize;
  contrast: ContrastMode;
  fontStyle: FontStyle;
  readingRuler: boolean;
  colorOverlay: ColorOverlay;
  speechRate: number;
  voiceURI: string;
  voiceActivation: boolean;
  targetLanguage: string;
}

interface AccessibilityContextProps {
  modes: AccessibilityModes;
  settings: AccessibilitySettings;
  assistantSpeaking: boolean;
  assistantListening: boolean;
  voiceCommand: string;
  toggleMode: (mode: keyof AccessibilityModes) => void;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  speak: (text: string, interrupt?: boolean) => void;
  stopSpeaking: () => void;
  startListening: () => void;
  stopListening: () => void;
  triggerSystemBeep: (frequency?: number, type?: OscillatorType) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "md",
  contrast: "normal",
  fontStyle: "normal",
  readingRuler: false,
  colorOverlay: "none",
  speechRate: 1.0,
  voiceURI: "",
  voiceActivation: true,
  targetLanguage: "Telugu"
};

const defaultModes: AccessibilityModes = {
  vision: false,
  hearing: false,
  dyslexia: false,
  language: false,
  normal: true
};

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modes, setModes] = useState<AccessibilityModes>(defaultModes);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [assistantListening, setAssistantListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // System sound effects using Web Audio API for blind/vision-impaired cues
  const triggerSystemBeep = (frequency: number = 440, type: OscillatorType = "sine") => {
    if (typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked: ", e);
    }
  };

  // Text To Speech Wrapper
  const speak = (text: string, interrupt = true) => {
    if (!synthRef.current) return;
    
    // Stop speaking if interrupt requested
    if (interrupt) {
      synthRef.current.cancel();
    }

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef.current = utterance;
    
    // Set speech speed configuration
    utterance.rate = settings.speechRate;
    
    // Select specific voice if matches config
    if (settings.voiceURI) {
      const voices = synthRef.current.getVoices();
      const selected = voices.find(v => v.voiceURI === settings.voiceURI);
      if (selected) utterance.voice = selected;
    }

    utterance.onstart = () => setAssistantSpeaking(true);
    utterance.onend = () => {
      setAssistantSpeaking(false);
      activeUtteranceRef.current = null;
      // Restart listening after speaking if it was active
      if (settings.voiceActivation && !assistantListening) {
        startListening();
      }
    };
    utterance.onerror = (e) => {
      console.error("Speech Synthesis error", e);
      setAssistantSpeaking(false);
      activeUtteranceRef.current = null;
    };

    // Temporarily pause recognition to prevent feedback loops
    if (assistantListening) {
      stopListening();
    }

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setAssistantSpeaking(false);
    }
  };

  // Speech Recognition Web API Configuration
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setAssistantListening(true);
      };

      rec.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const textCommand = event.results[lastResultIndex][0].transcript.trim();
        console.log("Recognized Voice Command: ", textCommand);
        setVoiceCommand(textCommand.toLowerCase());
        triggerSystemBeep(600, "sine");
      };

      rec.onerror = (e: any) => {
        // Only log serious failures, ignore 'no-speech'
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error: ", e.error);
        }
      };

      rec.onend = () => {
        setAssistantListening(false);
        // Automatically restart if settings allow always-listening
        if (settings.voiceActivation && !synthRef.current?.speaking) {
          // Add a tiny delay to avoid hitting rate-limits
          setTimeout(() => {
            try {
              if (settings.voiceActivation && !synthRef.current?.speaking) {
                rec.start();
              }
            } catch (err) {
              // Ignore already started errors
            }
          }, 300);
        }
      };

      recognitionRef.current = rec;
    }
  }, [settings.voiceActivation]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already started
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setAssistantListening(false);
      } catch (e) {
        // Recognition not started
      }
    }
  };

  // Auto-trigger microphone listening when settings or voice mode loaded
  useEffect(() => {
    if (settings.voiceActivation) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [settings.voiceActivation]);

  const toggleMode = (mode: keyof AccessibilityModes) => {
    setModes((prev) => {
      const updated = { ...prev };
      
      if (mode === "normal") {
        return {
          vision: false,
          hearing: false,
          dyslexia: false,
          language: false,
          normal: true
        };
      } else {
        updated.normal = false;
        updated[mode] = !updated[mode];
        
        // If all modes are toggled off, reset to normal
        const anyActive = Object.keys(updated)
          .filter((k) => k !== "normal")
          .some((k) => updated[k as keyof AccessibilityModes]);
        
        if (!anyActive) {
          return defaultModes;
        }
        return updated;
      }
    });

    // Provide voice synthesis confirmation
    const readableName = mode === "vision" ? "Vision Assistance" 
                       : mode === "hearing" ? "Hearing Assistance"
                       : mode === "dyslexia" ? "Dyslexia Assistance"
                       : mode === "language" ? "Language Assistance"
                       : "Normal Learning";
                       
    triggerSystemBeep(520, "sine");
    
    // Add custom adjustments based on selected modes automatically
    if (mode === "vision") {
      updateSettings({ contrast: "high", fontSize: "lg" });
      setTimeout(() => speak("Vision Assistance mode enabled. Interface font size increased and contrast set to high."), 100);
    } else if (mode === "dyslexia") {
      updateSettings({ fontStyle: "dyslexic", readingRuler: true });
      setTimeout(() => speak("Dyslexia mode enabled. OpenDyslexic spacing activated. Reading ruler is now visible."), 100);
    } else if (mode === "hearing") {
      setTimeout(() => speak("Hearing mode enabled. Real-time captions will be loaded."), 100);
    } else if (mode === "normal") {
      setSettings(defaultSettings);
      setTimeout(() => speak("Normal Mode restored."), 100);
    }
  };

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    triggerSystemBeep(480, "sine");
  };

  return (
    <AccessibilityContext.Provider
      value={{
        modes,
        settings,
        assistantSpeaking,
        assistantListening,
        voiceCommand,
        toggleMode,
        updateSettings,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        triggerSystemBeep
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
