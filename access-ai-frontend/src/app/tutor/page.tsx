"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ArrowLeft, Send, Sparkles, Volume2, VolumeX, Mic, MicOff, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "student" | "tutor";
  text: string;
  timestamp: string;
  speaking?: boolean;
}

export default function AITutor() {
  const { settings, speak, stopSpeaking, assistantSpeaking, startListening, stopListening, assistantListening } = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "tutor",
      text: "Hello! I am your AI Tutor. Ask me anything, like 'Explain Binary Search' or 'Explain like a 10-year-old'. I can reply in English, Telugu, Hindi, or other languages.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<"normal" | "10-year-old" | "visual">("normal");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Voice assistant bridge logic
  useEffect(() => {
    const handleVoiceSubmit = () => {
      const inputEl = document.getElementById("tutor-voice-input-bridge") as HTMLInputElement;
      if (inputEl && inputEl.value) {
        const query = inputEl.value;
        inputEl.value = ""; // Clear bridge
        submitQuery(query);
      }
    };

    const sendBtn = document.getElementById("tutor-send-btn-bridge");
    sendBtn?.addEventListener("click", handleVoiceSubmit);
    return () => {
      sendBtn?.removeEventListener("click", handleVoiceSubmit);
    };
  }, [activePersona, messages]);

  const submitQuery = async (query: string) => {
    if (!query.trim()) return;

    // 1. Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "student",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    // 2. Fetch from backend with client-side fallback
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/tutor/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          persona: activePersona,
          language: settings.targetLanguage,
          history: messages.slice(-5).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiAnswer = settings.targetLanguage.toLowerCase() !== "english" ? data.translated_answer : data.answer;
        
        const aiMsg: Message = {
          id: Math.random().toString(),
          sender: "tutor",
          text: aiAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
        speak(aiAnswer);
      } else {
        throw new Error("Backend offline");
      }
    } catch (err) {
      // Client-side fallback simulation (e.g. if server is not booted)
      console.warn("Backend tutor failed, running client fallback generator.");
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let answer = "";
      const q = query.toLowerCase();
      
      if (q.includes("binary search")) {
        if (activePersona === "10-year-old") {
          answer = "Binary search is like finding a name in a phonebook. You open the book in the exact middle. If the name is further down, you throw away the first half. You repeat this until you find the name. It is super fast!";
        } else if (activePersona === "visual") {
          answer = "Binary Search Visualizer:\n\nArray: [2, 5, 8, 12, 16, 23, 38]\nTarget: 23\n\nStep 1: Low=0, High=6, Mid=3 (Value: 12)\nComparison: 23 > 12 -> Search right half.\n\nStep 2: Low=4, High=6, Mid=5 (Value: 23)\nComparison: 23 == 23 -> Target Found at index 5!";
        } else {
          answer = "Binary search is an efficient search algorithm that works on sorted arrays. It works by repeatedly dividing the search space in half, yielding an O(log n) time complexity.";
        }
      } else {
        answer = `I processed your question: "${query}". I see you selected the ${activePersona} mode. Here is a summary of the concept: It represents a core structure in study guides. Let me know if you would like a quiz on this!`;
      }

      // Handle translation simulation
      if (settings.targetLanguage.toLowerCase() === "telugu") {
        answer = "బైనరీ సెర్చ్ అనేది క్రమబద్ధీకరించిన జాబితాలో ఒక మూలకాన్ని కనుగొనడానికి ఒక సమర్థవంతమైన అల్గారిథమ్. ఇది ప్రతి దశలోనూ శోధన స్థలాన్ని సగానికి తగ్గిస్తుంది.";
      } else if (settings.targetLanguage.toLowerCase() === "hindi") {
        answer = "बाइनरी सर्च एक सॉर्ट की गई सूची में किसी तत्व को खोजने का एक कुशल एल्गोरिदम है। यह हर कदम पर खोज स्थान को आधा कर देता है।";
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "tutor",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      speak(answer);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    submitQuery(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-28 flex flex-col h-screen">
      {/* Voice Assistant bridges (hidden input, buttons used by the voice recognition loop to click) */}
      <input type="hidden" id="tutor-voice-input-bridge" />
      <button type="button" id="tutor-send-btn-bridge" className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-violet-400" size={20} />
              AI Learning Tutor
            </h1>
            <p className="text-xs text-white/50">Persona: {activePersona} | Target Language: {settings.targetLanguage}</p>
          </div>
        </div>

        {/* Persona Selectors */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {(["normal", "10-year-old", "visual"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setActivePersona(p);
                speak(`AI Persona changed to ${p}`);
              }}
              className={`px-3 py-1 text-xs rounded-md transition-all font-semibold capitalize ${activePersona === p ? "bg-violet-600 text-white shadow" : "text-white/60 hover:text-white"}`}
            >
              {p === "10-year-old" ? "Explain like 10yo" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto bg-slate-900/35 border border-white/10 rounded-2xl p-6 mb-6 space-y-4 max-h-[55vh]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "student" ? "items-end" : "items-start"}`}
          >
            <div className="text-[10px] text-white/40 mb-1 px-1">{m.sender === "student" ? "Student" : "AI Tutor"}</div>
            
            <div className="flex items-start gap-2 max-w-[80%]">
              {m.sender === "tutor" && (
                <button
                  onClick={() => {
                    if (assistantSpeaking) stopSpeaking();
                    else speak(m.text);
                  }}
                  className="mt-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 flex-shrink-0 transition-colors"
                  aria-label="Read message aloud"
                >
                  <Volume2 size={14} />
                </button>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed border whitespace-pre-wrap ${m.sender === "student" ? "bg-violet-600/10 border-violet-500/30 text-white rounded-tr-none" : "bg-slate-900/60 border-white/10 text-white/90 rounded-tl-none"}`}
              >
                {m.text}
              </div>
            </div>
            
            <span className="text-[9px] text-white/30 mt-1 px-2">{m.timestamp}</span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-white/40 p-2">
            <RefreshCw className="animate-spin" size={14} />
            <span>AI is brainstorming explanation...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div className="flex gap-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question (e.g. 'How does binary search work?')..."
          className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 resize-none h-12"
        />
        
        <button
          onClick={handleSend}
          disabled={loading || !inputText.trim()}
          className="p-3 bg-violet-600 text-white rounded-xl border border-violet-500 hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:hover:bg-violet-600 flex items-center justify-center"
          aria-label="Send query"
        >
          <Send size={16} />
        </button>

        <button
          onClick={() => {
            if (assistantListening) stopListening();
            else startListening();
          }}
          className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${assistantListening ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-white/5 text-white/60 border-white/10"}`}
          aria-label={assistantListening ? "Mute voice recognition" : "Start voice recognition"}
        >
          {assistantListening ? <Mic size={16} className="animate-pulse" /> : <MicOff size={16} />}
        </button>
      </div>
    </div>
  );
}
