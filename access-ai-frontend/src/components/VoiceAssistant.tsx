"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccessibility } from "../context/AccessibilityContext";
import { Mic, MicOff, Volume2, VolumeX, X, HelpCircle } from "lucide-react";

export const VoiceAssistant: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    settings,
    modes,
    assistantSpeaking,
    assistantListening,
    voiceCommand,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    toggleMode,
    updateSettings,
    triggerSystemBeep
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [lastProcessedCommand, setLastProcessedCommand] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const initialGreetingDone = useRef(false);

  // 1. Initial Wake-up Greeting
  useEffect(() => {
    if (!initialGreetingDone.current) {
      initialGreetingDone.current = true;
      triggerSystemBeep(520, "sine");
      
      // Delay greeting slightly for page setup
      setTimeout(() => {
        speak(
          "Hello. Welcome to Access AI. I am your AI Learning Assistant. How can I help you today? You can speak naturally or use the keyboard.",
          true
        );
      }, 1200);
    }
  }, []);

  // 2. Map voice commands to system actions
  useEffect(() => {
    if (!voiceCommand || voiceCommand === lastProcessedCommand) return;
    
    setLastProcessedCommand(voiceCommand);
    const cmd = voiceCommand.toLowerCase();

    // Router navigation commands
    if (cmd.includes("open tutor") || cmd.includes("open ai tutor") || cmd.includes("tutor")) {
      speak("Opening AI Tutor");
      router.push("/tutor");
    } else if (cmd.includes("go home") || cmd.includes("go to dashboard") || cmd.includes("home") || cmd.includes("dashboard")) {
      speak("Opening Dashboard");
      router.push("/");
    } else if (cmd.includes("classroom") || cmd.includes("open classroom") || cmd.includes("live classroom")) {
      speak("Opening Live Classroom");
      router.push("/classroom");
    } else if (cmd.includes("open ocr") || cmd.includes("ocr scanner") || cmd.includes("ocr") || cmd.includes("scanner")) {
      speak("Opening OCR Scanner");
      router.push("/ocr");
    } else if (cmd.includes("open pdf") || cmd.includes("pdf reader") || cmd.includes("read pdf")) {
      speak("Opening PDF Reader");
      router.push("/pdf");
    } else if (cmd.includes("open settings") || cmd.includes("settings")) {
      speak("Opening Settings");
      router.push("/settings");
    } else if (cmd.includes("open navigation") || cmd.includes("navigation") || cmd.includes("navigation assistant")) {
      speak("Opening Navigation Assistant");
      router.push("/navigation");
    } 
    // Setting adjustments
    else if (cmd.includes("dark mode") || cmd.includes("enable dark mode")) {
      updateSettings({ contrast: "high" });
      speak("High contrast dark mode activated.");
    } else if (cmd.includes("light mode") || cmd.includes("disable dark mode")) {
      updateSettings({ contrast: "normal" });
      speak("Standard contrast mode activated.");
    } else if (cmd.includes("increase font") || cmd.includes("make font bigger") || cmd.includes("larger font")) {
      const nextFont = settings.fontSize === "sm" ? "md" : settings.fontSize === "md" ? "lg" : settings.fontSize === "lg" ? "xl" : "2xl";
      updateSettings({ fontSize: nextFont });
      speak(`Font size increased to ${nextFont}.`);
    } else if (cmd.includes("decrease font") || cmd.includes("make font smaller") || cmd.includes("smaller font")) {
      const prevFont = settings.fontSize === "2xl" ? "xl" : settings.fontSize === "xl" ? "lg" : settings.fontSize === "lg" ? "md" : "sm";
      updateSettings({ fontSize: prevFont });
      speak(`Font size decreased to ${prevFont}.`);
    } else if (cmd.includes("dyslexia mode") || cmd.includes("enable dyslexia")) {
      toggleMode("dyslexia");
    } else if (cmd.includes("hearing mode") || cmd.includes("enable hearing")) {
      toggleMode("hearing");
    } else if (cmd.includes("vision mode") || cmd.includes("enable vision")) {
      toggleMode("vision");
    } else if (cmd.includes("normal mode") || cmd.includes("reset mode")) {
      toggleMode("normal");
    } else if (cmd.includes("stop speaking") || cmd.includes("shut up") || cmd.includes("mute")) {
      stopSpeaking();
    } else if (cmd.includes("translate to telugu") || cmd.includes("telugu")) {
      updateSettings({ targetLanguage: "Telugu" });
      speak("Translation target set to Telugu.");
    } else if (cmd.includes("translate to hindi") || cmd.includes("hindi")) {
      updateSettings({ targetLanguage: "Hindi" });
      speak("Translation target set to Hindi.");
    } else if (cmd.includes("translate to tamil") || cmd.includes("tamil")) {
      updateSettings({ targetLanguage: "Tamil" });
      speak("Translation target set to Tamil.");
    } else if (cmd.includes("translate to kannada") || cmd.includes("kannada")) {
      updateSettings({ targetLanguage: "Kannada" });
      speak("Translation target set to Kannada.");
    } else if (cmd.includes("translate to malayalam") || cmd.includes("malayalam")) {
      updateSettings({ targetLanguage: "Malayalam" });
      speak("Translation target set to Malayalam.");
    } else {
      // If we are in AI Tutor route and it is not a system command, send it as tutor query!
      if (pathname === "/tutor") {
        // Let tutor handle the voice command directly
        const tutorInput = document.getElementById("tutor-voice-input-bridge") as HTMLInputElement;
        if (tutorInput) {
          tutorInput.value = voiceCommand;
          const tutorBtn = document.getElementById("tutor-send-btn-bridge") as HTMLButtonElement;
          if (tutorBtn) tutorBtn.click();
        }
      } else {
        // If not in tutor, just report unrecognized command or speak it softly
        console.log("Unmapped voice command received: ", voiceCommand);
      }
    }
  }, [voiceCommand]);

  // 3. Audio visualizer logic (Canvas API)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Determine wave speed and height based on state
      let speed = 0.05;
      let amplitude = 15;
      let waveColor = "rgba(139, 92, 246, 0.4)"; // Violet for idle
      
      if (assistantSpeaking) {
        speed = 0.15;
        amplitude = 25;
        waveColor = "rgba(236, 72, 153, 0.6)"; // Pink/Rose for speaking
      } else if (assistantListening) {
        speed = 0.2;
        amplitude = 30;
        waveColor = "rgba(34, 197, 94, 0.6)"; // Neon green for listening
      }

      ctx.beginPath();
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 3;

      for (let x = 0; x < canvas.width; x++) {
        // Overlay three sine waves with different phase shifts for visual depth
        const y = canvas.height / 2 + 
          Math.sin(x * 0.02 + phase) * amplitude + 
          Math.sin(x * 0.01 + phase * 1.5) * (amplitude / 2);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second thinner accent wave
      ctx.beginPath();
      ctx.strokeStyle = assistantListening ? "rgba(74, 222, 128, 0.3)" : "rgba(167, 139, 250, 0.3)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * 0.03 - phase) * (amplitude * 0.7) + 
          Math.cos(x * 0.015 + phase) * (amplitude * 0.3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += speed;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [assistantSpeaking, assistantListening]);

  // Voice feedback when router shifts pages
  useEffect(() => {
    let message = "";
    if (pathname === "/") {
      message = "Dashboard opened. Welcome back. I am ready for voice commands.";
    } else if (pathname === "/tutor") {
      message = "AI Tutor opened. Speak your question to study, or type details.";
    } else if (pathname === "/classroom") {
      message = "Live Classroom opened. Real-time captions will start automatically.";
    } else if (pathname === "/ocr") {
      message = "O C R Document reader opened. Drag and drop book snapshots.";
    } else if (pathname === "/pdf") {
      message = "P D F Reader opened. Upload articles to read aloud.";
    } else if (pathname === "/navigation") {
      message = "Indoor Navigation Assistant active. Please grant camera permission.";
    } else if (pathname === "/settings") {
      message = "Settings dashboard loaded.";
    }
    
    if (message) {
      setTimeout(() => speak(message, false), 800);
    }
  }, [pathname]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    triggerSystemBeep(isOpen ? 400 : 600, "sine");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[990]">
      {/* Visualizer Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 p-5 rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-white transition-all duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${assistantListening ? "bg-green-500 animate-pulse" : assistantSpeaking ? "bg-pink-500 animate-bounce" : "bg-violet-500"}`} />
              <span className="font-semibold text-sm">Access AI Assistant</span>
            </div>
            <button onClick={toggleOpen} className="p-1 rounded hover:bg-white/10">
              <X size={16} />
            </button>
          </div>

          <div className="relative h-20 mb-3 bg-black/30 rounded-xl overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} width={280} height={80} className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!assistantListening && !assistantSpeaking && (
                <span className="text-xs text-white/40">Say "Open AI Tutor" or "Go Home"</span>
              )}
              {assistantListening && !assistantSpeaking && (
                <span className="text-xs text-green-400 font-medium animate-pulse">Listening for commands...</span>
              )}
              {assistantSpeaking && (
                <span className="text-xs text-pink-400 font-medium">Assistant is speaking</span>
              )}
            </div>
          </div>

          {voiceCommand && (
            <div className="bg-white/5 rounded-lg p-2 mb-3 border border-white/5">
              <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Detected Speech</div>
              <div className="text-xs text-white/90 italic font-mono">"{voiceCommand}"</div>
            </div>
          )}

          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => {
                if (assistantListening) {
                  stopListening();
                  updateSettings({ voiceActivation: false });
                } else {
                  startListening();
                  updateSettings({ voiceActivation: true });
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${assistantListening ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30"}`}
            >
              {assistantListening ? <MicOff size={14} /> : <Mic size={14} />}
              {assistantListening ? "Pause Mic" : "Resume Mic"}
            </button>

            <button
              onClick={() => {
                if (assistantSpeaking) stopSpeaking();
                else speak("I am online. Control Access AI completely by speaking commands.");
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center justify-center transition-all ${assistantSpeaking ? "bg-pink-500/20 text-pink-400 border-pink-500/30" : "bg-white/10 text-white/80 border-white/10"}`}
            >
              {assistantSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${isOpen ? "bg-violet-600 hover:bg-violet-700 text-white rotate-90" : "bg-gradient-to-tr from-violet-600 to-pink-500 text-white"} relative`}
        aria-label="Toggle voice assistant menu"
      >
        {isOpen ? <X size={24} /> : <Mic size={24} />}
        {assistantListening && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-ping" />
        )}
      </button>
    </div>
  );
};
