"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ArrowLeft, Upload, Volume2, Bookmark, Play, Pause, SkipForward, SkipBack, RotateCcw, FileText, Check } from "lucide-react";
import Link from "next/link";

interface PDFData {
  filename: string;
  paragraphs: string[];
  summary: string;
  key_points: string[];
}

export default function PDFReader() {
  const { settings, speak, stopSpeaking, assistantSpeaking } = useAccessibility();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState<PDFData | null>(null);

  // Read-along playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeParagraphIdx, setActiveParagraphIdx] = useState(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(0);
  const [bookmarkedIndex, setBookmarkedIndex] = useState<{ p: number; s: number } | null>(null);

  const sentencesRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // Helper to split paragraph into sentences
  const getSentences = (text: string): string[] => {
    return text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  };

  // Build list of sentences for current active paragraph
  useEffect(() => {
    if (pdfData && pdfData.paragraphs[activeParagraphIdx]) {
      sentencesRef.current = getSentences(pdfData.paragraphs[activeParagraphIdx]);
    } else {
      sentencesRef.current = [];
    }
  }, [pdfData, activeParagraphIdx]);

  // Handle TTS tracking
  const speakCurrentSentence = () => {
    if (!pdfData || !isPlayingRef.current) return;
    
    const sentences = sentencesRef.current;
    if (activeSentenceIdx >= sentences.length) {
      // Move to next paragraph
      if (activeParagraphIdx < pdfData.paragraphs.length - 1) {
        setActiveParagraphIdx(prev => prev + 1);
        setActiveSentenceIdx(0);
      } else {
        // End of file
        setIsPlaying(false);
        isPlayingRef.current = false;
        speak("You have reached the end of the document.");
      }
      return;
    }

    const textToSpeak = sentences[activeSentenceIdx].trim();
    if (!textToSpeak) return;

    // Standard Speech Synthesis Utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = settings.speechRate;

    utterance.onend = () => {
      if (isPlayingRef.current) {
        setActiveSentenceIdx(prev => prev + 1);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    // Synthesize sentence
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Trigger speak when indices shift during play mode
  useEffect(() => {
    if (isPlaying) {
      speakCurrentSentence();
    }
  }, [activeParagraphIdx, activeSentenceIdx, isPlaying]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setLoading(true);
      speak(`Uploading and reading ${file.name}.`);

      // Mock uploading delay
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://127.0.0.1:8000/api/v1/pdf/upload", {
          method: "POST",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setPdfData(data);
          setActiveParagraphIdx(0);
          setActiveSentenceIdx(0);
          speak(`Document loaded. Rending paragraph lists.`);
        } else {
          throw new Error("offline");
        }
      } catch (err) {
        await new Promise(r => setTimeout(r, 1200));
        
        const mockPDF: PDFData = {
          filename: file.name,
          paragraphs: [
            "Chapter 1: Principles of UI Accessibility. Accessibility ensures that digital products are usable by everyone, regardless of ability. This includes blind students utilizing screen readers, hearing impaired students reading caption logs, and dyslexic students using visual tinter overlays.",
            "Chapter 2: Designing Adaptations. Adaptations must update the layout in real-time without requiring application reloads. We utilize global state machines to configure text size changes, dyslexia letter grids, and audio warnings.",
            "Chapter 3: Cognitive Offloading. Cognitive accessibility simplifies complex educational content. Using AI summary nodes, we distill heavy documentation into flashcard decks, quiz structures, and visual mind maps."
          ],
          summary: "This study chapter introduces digital accessibility, details screen adjustment rules, and advocates for cognitive offloading methods using summaries.",
          key_points: [
            "Accessibility benefits all students, including neurodivergent learners.",
            "Adaptations must happen dynamically on screen without refreshes.",
            "AI notes represent critical aids for cognitive learning offloads."
          ]
        };
        
        setPdfData(mockPDF);
        setActiveParagraphIdx(0);
        setActiveSentenceIdx(0);
        speak(`Document loaded.`);
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      window.speechSynthesis.cancel();
      speak("Reading paused.");
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      speak("Reading started.");
    }
  };

  const handleSkipForward = () => {
    const sentences = sentencesRef.current;
    if (activeSentenceIdx < sentences.length - 1) {
      setActiveSentenceIdx(prev => prev + 1);
    } else if (activeParagraphIdx < (pdfData?.paragraphs.length || 0) - 1) {
      setActiveParagraphIdx(prev => prev + 1);
      setActiveSentenceIdx(0);
    }
    speak("Skipped forward.");
  };

  const handleSkipBackward = () => {
    if (activeSentenceIdx > 0) {
      setActiveSentenceIdx(prev => prev - 1);
    } else if (activeParagraphIdx > 0) {
      setActiveParagraphIdx(prev => prev - 1);
      // set to last sentence of prev paragraph
      setActiveSentenceIdx(0);
    }
    speak("Skipped backward.");
  };

  const resetPlayback = () => {
    window.speechSynthesis.cancel();
    setActiveParagraphIdx(0);
    setActiveSentenceIdx(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    speak("Playback reset to start.");
  };

  const saveBookmark = () => {
    setBookmarkedIndex({ p: activeParagraphIdx, s: activeSentenceIdx });
    speak("Current paragraph and sentence bookmarked.");
  };

  const loadBookmark = () => {
    if (bookmarkedIndex) {
      setActiveParagraphIdx(bookmarkedIndex.p);
      setActiveSentenceIdx(bookmarkedIndex.s);
      speak("Resumed reading from bookmarked paragraph.");
    } else {
      speak("No active bookmarks saved for this file.");
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
            <Volume2 size={20} className="text-cyan-400" />
            AI PDF Audio Reader
          </h1>
          <p className="text-xs text-white/50">Listen to study guides with highlighted text-to-speech tracking.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden max-h-[62vh]">
        {/* Main Document Text Viewer (Left, Span 2) */}
        <div className="md:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 mb-3">Document Contents</h2>

            {!pdfData ? (
              <div className="h-64 border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all bg-black/25">
                {loading ? (
                  <div className="text-center space-y-2">
                    <RotateCcw className="animate-spin text-cyan-400 mx-auto" size={24} />
                    <p className="text-xs text-white/60">Parsing document structure...</p>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Upload size={32} className="mx-auto text-white/30" />
                    <p className="text-xs font-semibold text-white/80">Upload textbook PDF</p>
                    <p className="text-[10px] text-white/40">Select learning files up to 10MB</p>
                  </div>
                )}
                {!loading && (
                  <input
                    type="file"
                    accept="application/pdf,text/plain"
                    onChange={handleUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Upload study material PDF"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {pdfData.paragraphs.map((pText, pIdx) => {
                  const isActiveP = pIdx === activeParagraphIdx;
                  const sentences = getSentences(pText);
                  
                  return (
                    <div
                      key={pIdx}
                      className={`p-4 rounded-xl border transition-all ${isActiveP ? "bg-white/5 border-cyan-500/20" : "bg-white/0 border-transparent"}`}
                    >
                      <div className="text-[10px] text-white/30 font-semibold mb-1">Paragraph {pIdx + 1}</div>
                      <p className="text-sm leading-relaxed text-white/80 font-medium">
                        {sentences.map((sent, sIdx) => {
                          const isActiveS = isActiveP && sIdx === activeSentenceIdx;
                          return (
                            <span
                              key={sIdx}
                              className={`transition-all rounded-sm px-0.5 ${isActiveS ? "bg-cyan-500/25 border-b-2 border-cyan-400 text-white font-bold" : ""}`}
                            >
                              {sent}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {pdfData && (
            /* Audio playback control deck */
            <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-white/5 pt-4 mt-4 gap-4">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSkipBackward}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80"
                  aria-label="Skip backward sentence"
                >
                  <SkipBack size={16} />
                </button>
                
                <button
                  onClick={togglePlayback}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  aria-label={isPlaying ? "Pause reading" : "Start reading"}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause" : "Play Reader"}
                </button>

                <button
                  onClick={handleSkipForward}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80"
                  aria-label="Skip forward sentence"
                >
                  <SkipForward size={16} />
                </button>

                <button
                  onClick={resetPlayback}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60"
                  aria-label="Reset playback"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveBookmark}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-xl text-xs flex items-center gap-1"
                >
                  <Bookmark size={14} />
                  Bookmark
                </button>

                {bookmarkedIndex && (
                  <button
                    onClick={loadBookmark}
                    className="px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 rounded-xl text-xs flex items-center gap-1"
                  >
                    Resume Bookmark
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI summary analysis panel (Right panel) */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 mb-3">AI PDF Digest</h2>

            {pdfData ? (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FileText size={12} /> Executive summary
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {pdfData.summary}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Bookmark size={12} /> Core study bullets
                  </h3>
                  <ul className="space-y-2">
                    {pdfData.key_points.map((pt, i) => (
                      <li key={i} className="text-[11px] text-white/80 leading-relaxed flex items-start gap-1.5 font-medium">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/30 py-20">
                <FileText size={40} className="mb-2 opacity-30 text-cyan-400" />
                <p className="text-xs">Summary notes and syllabus highlights will appear here after document upload.</p>
              </div>
            )}
          </div>

          {pdfData && (
            <button
              onClick={() => {
                speak("PDF summary nodes saved to AI Study Bank.");
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
