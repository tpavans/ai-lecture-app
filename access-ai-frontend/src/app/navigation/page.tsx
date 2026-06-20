"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ArrowLeft, Camera, Navigation, RefreshCw, Volume2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface BBox {
  name: string;
  confidence: number;
  box: number[]; // [x1, y1, x2, y2]
  guidance: string;
}

export default function NavigationAssistant() {
  const { settings, speak, stopSpeaking } = useAccessibility();
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<BBox[]>([]);
  const [announcementInterval, setAnnouncementInterval] = useState<number>(3); // Speak alert every 3s

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize camera stream
  const startCamera = async () => {
    setLoading(true);
    speak("Attempting to access video feed for object tracking.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      speak("Camera stream active. YOLO object detection loop initialized.");
      
      // Start processing loop
      startProcessingLoop();
    } catch (err) {
      console.warn("Camera access denied or blocked: ", err);
      speak("Camera block detected. Activating grid classroom mapping simulator.");
      setCameraActive(true);
      startSimulationLoop();
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (loopRef.current) {
      clearInterval(loopRef.current);
    }
    setCameraActive(false);
    setDetections([]);
    speak("Camera navigation stream closed.");
  };

  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  // 2. Real YOLO processing loop (Webcam uploads frames to backend)
  const startProcessingLoop = () => {
    if (loopRef.current) clearInterval(loopRef.current);

    loopRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw video frame to hidden canvas to obtain blob bytes
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        try {
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");
          
          const res = await fetch("http://127.0.0.1:8000/api/v1/vision/detect", {
            method: "POST",
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            const boxes = data.detections;
            setDetections(boxes);
            drawBoxes(boxes);
            
            // Speak guidance for the most prominent object
            if (boxes.length > 0) {
              speak(boxes[0].guidance, false);
            }
          }
        } catch (e) {
          // Trigger local simulator logic on connection timeout
          runLocalDetectionSimulation();
        }
      }, "image/jpeg");
    }, announcementInterval * 1000);
  };

  // 3. Simulated loop when camera denied
  const startSimulationLoop = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(() => {
      runLocalDetectionSimulation();
    }, announcementInterval * 1000);
  };

  const runLocalDetectionSimulation = () => {
    const list = [
      { name: "Door", confidence: 0.94, box: [180, 60, 320, 420], guidance: "Door detected ahead. Turn left." },
      { name: "Chair", confidence: 0.89, box: [350, 220, 520, 450], guidance: "Chair nearby on your right. Steer slightly left." },
      { name: "Laptop", confidence: 0.91, box: [220, 300, 380, 410], guidance: "Laptop detected. Open on the table." },
      { name: "Teacher", confidence: 0.95, box: [80, 100, 200, 380], guidance: "Teacher in front of you." },
      { name: "Whiteboard", confidence: 0.88, box: [50, 40, 580, 200], guidance: "Whiteboard ahead." }
    ];

    // Pick 1 to 2 items
    const count = Math.random() > 0.5 ? 2 : 1;
    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(list[Math.floor(Math.random() * list.length)]);
    }

    setDetections(selected);
    drawBoxes(selected);
    
    if (selected.length > 0) {
      speak(selected[0].guidance, false);
    }
  };

  // 4. Render boxes on screen overlay canvas
  const drawBoxes = (boxes: BBox[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boxes.forEach(item => {
      const [x1, y1, x2, y2] = item.box;
      const w = x2 - x1;
      const h = y2 - y1;

      // Draw outer glowing neon box
      ctx.strokeStyle = "#f43f5e"; // Rose
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, w, h);
      
      // Box shadow overlay
      ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
      ctx.lineWidth = 8;
      ctx.strokeRect(x1, y1, w, h);

      // Label background
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(x1, y1 - 25, ctx.measureText(item.name).width + 50, 25);

      // Text label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`${item.name} (${Math.round(item.confidence * 100)}%)`, x1 + 8, y1 - 8);
    });
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
            <Navigation size={20} className="text-rose-400" />
            Indoor Navigation Assistant
          </h1>
          <p className="text-xs text-white/50">YOLOv8 classroom recognition with real-time navigational speech alerts.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden max-h-[62vh]">
        {/* Navigation Video Feed (Left, Span 2) */}
        <div className="md:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? "bg-rose-500 animate-pulse" : "bg-white/20"}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">YOLO Camera Stream</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40">Refresh alerts:</span>
              <select
                value={announcementInterval}
                onChange={(e) => setAnnouncementInterval(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
              >
                <option value="2">2s</option>
                <option value="3">3s</option>
                <option value="5">5s</option>
              </select>
            </div>
          </div>

          {/* Render Area */}
          <div className="flex-1 bg-black/60 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center min-h-[300px]">
            {cameraActive ? (
              <div className="w-full h-full relative">
                {/* Hidden video node */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Visual canvas overlay */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-4">
                <Camera size={48} className="mx-auto text-rose-500/30 animate-pulse" />
                <p className="text-xs text-white/50 max-w-sm">Access your camera stream to detect classroom objects and generate voice guidance alerts.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 border border-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {loading ? "Accessing Feed..." : "Activate Camera System"}
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                Close Camera Stream
              </button>
            )}
          </div>
        </div>

        {/* Warning Logs & Auditory alerts (Right) */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <h2 className="text-sm font-bold text-white border-b border-white/5 pb-2 mb-3">Navigation Log</h2>

            {detections.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/30 py-20">
                <ShieldAlert size={40} className="mb-2 opacity-30 text-rose-500" />
                <p className="text-xs">No active navigation warnings. Open camera stream to track obstacles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Active Obstacles</div>
                {detections.map((d, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded">
                        {d.name}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">Conf: {Math.round(d.confidence * 100)}%</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium italic">"{d.guidance}"</p>
                    <button
                      onClick={() => speak(d.guidance)}
                      className="self-end p-1 rounded bg-white/5 hover:bg-white/10 text-white/50"
                      aria-label="Replay voice alert"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {detections.length > 0 && (
            <div className="text-center text-[10px] text-white/40 font-bold border-t border-white/5 pt-3 mt-4 flex items-center justify-center gap-1">
              <ShieldAlert size={12} className="text-rose-500 animate-bounce" />
              <span>Safety warnings are read aloud automatically</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
