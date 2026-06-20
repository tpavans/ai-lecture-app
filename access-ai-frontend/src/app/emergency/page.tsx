"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ArrowLeft, AlertTriangle, ShieldAlert, Phone, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function EmergencySOS() {
  const { speak, stopSpeaking, triggerSystemBeep } = useAccessibility();
  const [sosActive, setSosActive] = useState(false);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speakIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSOS = () => {
    setSosActive(true);
    speak("S O S alert activated. Siren alarm playing. Requesting classroom assistance.", true);
    
    // Web Audio siren alarm loop (High pitch beeps)
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = setInterval(() => {
      triggerSystemBeep(880, "sawtooth");
      setTimeout(() => triggerSystemBeep(660, "sawtooth"), 150);
    }, 400);

    // Continuous voice broadcast loop
    if (speakIntervalRef.current) clearInterval(speakIntervalRef.current);
    speakIntervalRef.current = setInterval(() => {
      speak("Emergency. Student requires immediate assistance in the classroom. SOS alert.", false);
    }, 4000);
  };

  const stopSOS = () => {
    setSosActive(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (speakIntervalRef.current) clearInterval(speakIntervalRef.current);
    stopSpeaking();
    speak("SOS alert canceled. Alarm muted.");
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (speakIntervalRef.current) clearInterval(speakIntervalRef.current);
    };
  }, []);

  return (
    <div className={`flex-1 w-full flex flex-col h-screen justify-center items-center px-6 transition-colors duration-500 ${sosActive ? "bg-red-950 animate-pulse text-white" : "bg-slate-950 text-slate-100"}`}>
      
      {/* Visual background overlays */}
      {sosActive && (
        <div className="absolute inset-0 bg-red-600/10 pointer-events-none mix-blend-color-burn animate-ping" />
      )}

      <div className="w-full max-w-md p-6 bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 text-center flex flex-col items-center">
        {/* Back navigation */}
        <Link href="/" className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 border border-white/10 text-white/85 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>

        <ShieldAlert size={48} className={`mb-4 ${sosActive ? "text-red-500 animate-bounce" : "text-red-400"}`} />
        
        <h1 className="text-xl font-bold text-white mb-2">Emergency Assistance</h1>
        <p className="text-xs text-white/50 mb-8 max-w-xs mx-auto">
          Triggers high-pitch auditory alarms and vocal requests to call for classroom or navigation support.
        </p>

        {/* Huge visual SOS Button */}
        {!sosActive ? (
          <button
            onClick={startSOS}
            className="w-40 h-40 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-extrabold text-2xl shadow-[0_0_50px_rgba(239,68,68,0.5)] border-4 border-red-500 hover:scale-105 transition-transform flex items-center justify-center flex-col gap-1 focus:ring-4 focus:ring-red-500/50"
          >
            <AlertTriangle size={28} />
            <span>TRIGGER</span>
            <span className="text-[10px] tracking-wider uppercase opacity-80">SOS</span>
          </button>
        ) : (
          <button
            onClick={stopSOS}
            className="w-40 h-40 rounded-full bg-slate-800 border-4 border-white text-white font-extrabold text-xl shadow-2xl hover:scale-105 transition-transform flex items-center justify-center flex-col gap-1 focus:ring-4 focus:ring-white/50"
          >
            <span>CANCEL</span>
            <span className="text-[10px] tracking-wider uppercase opacity-80">ALARM</span>
          </button>
        )}

        {/* SOS Details */}
        <div className="mt-8 pt-6 border-t border-white/5 w-full text-left space-y-3">
          <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Quick Actions</div>
          
          <button
            onClick={() => speak("Alert sent to Teacher desk.")}
            className="w-full py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-xs text-white/90 flex items-center justify-between px-3"
          >
            <span className="font-semibold">Notify Teacher Desk</span>
            <ShieldAlert size={14} className="text-red-400" />
          </button>

          <button
            onClick={() => speak("Calling campus emergency desk")}
            className="w-full py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-xs text-white/90 flex items-center justify-between px-3"
          >
            <span className="font-semibold">Call Campus Security</span>
            <Phone size={14} className="text-green-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
