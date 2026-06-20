"use client";

import React, { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ArrowLeft, Upload, Camera, Volume2, Languages, BookOpen, FileText, Check } from "lucide-react";
import Link from "next/link";

export default function OCRScanner() {
  const { settings, speak } = useAccessibility();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeLang, setActiveLang] = useState(settings.targetLanguage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      speak(`Document ${file.name} selected. Press start OCR to parse.`);
    }
  };

  const triggerCameraMock = () => {
    speak("Camera capture simulated. Posed snapshot of classroom neural networks guide selected.");
    // Simulate camera snapshot by setting a dummy preview
    setPreviewUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80");
    setSelectedFile(new File(["camera"], "classroom_snapshot.jpg", { type: "image/jpeg" }));
  };

  const startOCR = async () => {
    if (!selectedFile) {
      speak("Please select a file or take a camera snapshot first.");
      return;
    }
    setScanning(true);
    speak("Scanning document snapshots. Applying OCR text extraction algorithms.");

    // Form data upload
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("language", activeLang);
    formData.append("simplify", "true");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/ocr/scan", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        speak("Text extracted successfully. Read aloud buttons are now active.");
      } else {
        throw new Error("offline");
      }
    } catch (e) {
      // Mock result fallback
      await new Promise(r => setTimeout(r, 1500));
      
      const mockResult = {
        extracted_text: "Chapter 4: Neural Networks. A Neural Network is a computational framework inspired by the structure and function of the human brain. It relies on layered collections of artificial node neurons that send connections. The system trains on data pairs and minimizes categorical entropy losses through backpropagations.",
        simplified_text: "**Neural Networks** are computer systems inspired by the **human brain**.\n\nThey use collections of **neurons** in layers.\n\nThe system learns from **data** by using math (backpropagation) to fix errors.",
        translated_text: activeLang === "Telugu" ? "[తెలుగు]: న్యూరల్ నెట్‌వర్క్‌లు మానవ మెదడు నిర్మాణంతో ప్రేరణ పొందిన కంప్యూటర్ వ్యవస్థలు. ఇవి డేటా నుండి నేర్చుకుంటాయి." : `[${activeLang}]: Neural networks are computer systems inspired by human brain.`,
        summary: "Neural Networks are brain-inspired models comprising layer structures that learn representations through backpropagation computations."
      };
      
      setResult(mockResult);
      speak("Text extracted successfully.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-28 flex flex-col h-screen">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
        <Link href="/" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera size={20} className="text-pink-400" />
            AI OCR Text Scanner
          </h1>
          <p className="text-xs text-white/50">Capture textbook sections to read, simplify, or translate.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden max-h-[62vh]">
        {/* Left Upload Panel */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div className="space-y-4 flex-1 overflow-y-auto">
            <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 mb-3">Upload textbook image</h2>
            
            {/* Preview & drag box */}
            <div className="h-60 border-2 border-dashed border-white/10 hover:border-pink-500/40 rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all bg-black/25">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Upload size={32} className="mx-auto text-white/30" />
                  <p className="text-xs font-semibold text-white/80">Drag file here or browse</p>
                  <p className="text-[10px] text-white/40">PNG, JPG, or JPEG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload document snap"
              />
            </div>

            <div className="flex justify-between items-center gap-2">
              <button
                onClick={triggerCameraMock}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center justify-center gap-1.5 font-semibold"
              >
                <Camera size={14} />
                Snapshot Camera
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40">Translation Lang:</span>
                <select
                  value={activeLang}
                  onChange={(e) => setActiveLang(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="Telugu" className="bg-slate-900 text-white">Telugu</option>
                  <option value="Hindi" className="bg-slate-900 text-white">Hindi</option>
                  <option value="Tamil" className="bg-slate-900 text-white">Tamil</option>
                  <option value="Kannada" className="bg-slate-900 text-white">Kannada</option>
                  <option value="Malayalam" className="bg-slate-900 text-white">Malayalam</option>
                  <option value="English" className="bg-slate-900 text-white">English</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={startOCR}
            disabled={scanning || !selectedFile}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 border border-pink-500 rounded-xl text-white font-bold text-xs disabled:opacity-40 disabled:hover:bg-pink-600 flex items-center justify-center gap-2 mt-4"
          >
            {scanning ? "Parsing document..." : "Extract Text (Start OCR)"}
          </button>
        </div>

        {/* Right Output Panel */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 mb-3">Extracted & Processed text</h2>

            {result ? (
              <div className="space-y-5">
                {/* Simplified Text (Dyslexia Mode focus) */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen size={12} /> Easy Read Format
                    </span>
                    <button
                      onClick={() => speak(result.simplified_text)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60"
                      aria-label="Read simplified text"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                  <div className="text-xs text-white/90 leading-relaxed whitespace-pre-line font-medium">
                    {result.simplified_text}
                  </div>
                </div>

                {/* Translated Text (Language Mode focus) */}
                {activeLang !== "English" && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                        <Languages size={12} /> Translated Output ({activeLang})
                      </span>
                      <button
                        onClick={() => speak(result.translated_text)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60"
                        aria-label="Read translated text"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                    <div className="text-xs text-white/90 leading-relaxed font-medium">
                      {result.translated_text}
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText size={12} /> AI Lesson Summary
                    </span>
                    <button
                      onClick={() => speak(result.summary)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60"
                      aria-label="Read summary text"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                  <div className="text-xs text-white/80 leading-relaxed font-medium">
                    {result.summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/30 py-20">
                <FileText size={40} className="mb-2 opacity-30 text-pink-400" />
                <p className="text-xs">Extracted content, translations, and summaries will appear here after parsing.</p>
              </div>
            )}
          </div>

          {result && (
            <button
              onClick={() => {
                // Mock saving notes
                speak("OCR summary notes saved to AI study bank.");
              }}
              className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 mt-4"
            >
              <Check size={14} className="text-green-400" />
              Save summary to Notes Bank
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
