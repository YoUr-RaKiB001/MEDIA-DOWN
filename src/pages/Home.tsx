import React, { useState } from "react";
import { 
  Download, Play, CheckCircle, AlertCircle, Loader2, 
  RotateCcw, Globe, Clipboard, X, Instagram, Facebook,
  Youtube, Cloud, Scissors, Video, Music
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { cn } from "@/src/lib/utils";

interface VideoFormat {
  quality: string;
  url: string;
  size: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: VideoFormat[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await axios.get(`/api/analyze?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
      setSelectedQuality(null); // Reset selection on new analysis
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to analyze URL. Please check the link and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoInfo) return;
    const format = videoInfo.formats.find(f => f.quality === selectedQuality);
    if (format) {
      window.open(format.url, "_blank");
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("Clipboard API not available");
      }
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (err: any) {
      console.error("Failed to read clipboard", err);
      setError("Clipboard access denied. Please paste the link manually.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClear = () => {
    setUrl("");
    setVideoInfo(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-10 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Download size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">All Video Downloader</h1>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all">
          <RotateCcw size={22} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-4 px-4">
        <h2 className="text-4xl font-black leading-[1.1] tracking-tight gradient-text">
          Download Videos <br /> from Any Platform
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
          Fast, free, and unlimited video downloads from YouTube, Facebook, Instagram, TikTok, and more with our premium downloader tool.
        </p>
      </div>

      {/* Platform Icons Grid */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-wrap justify-center gap-6 px-4">
          <PlatformIcon icon={Youtube} color="bg-red-600/20 text-red-500" label="YouTube" />
          <PlatformIcon icon={Instagram} color="bg-pink-600/20 text-pink-500" label="Instagram" />
          <PlatformIcon icon={Facebook} color="bg-blue-600/20 text-blue-500" label="Facebook" />
          <PlatformIcon icon={Scissors} color="bg-slate-800/40 text-slate-300" label="CapCut" />
          <PlatformIcon icon={Music} color="bg-black/40 text-white" label="TikTok" />
        </div>
        <div className="flex gap-6">
          <PlatformIcon icon={Cloud} color="bg-slate-800/40 text-slate-400" label="Cloud" />
          <PlatformIcon icon={Globe} color="bg-gradient-to-br from-purple-500 to-pink-500 text-white glow-purple" label="Web" />
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col gap-6">
        <div className="glass-card p-5 flex flex-col gap-4 bg-slate-900/40 border-white/5">
          <div className="flex items-center gap-2 text-slate-300">
            <Globe size={18} className="text-purple-400" />
            <span className="text-sm font-bold">All Platforms Mode: Paste Video URL</span>
          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="Paste video URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-5 outline-none focus:border-purple-500/30 transition-all text-sm pr-28 font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                onClick={handlePaste}
                className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-all"
              >
                <Clipboard size={18} />
              </button>
              <button 
                onClick={handleClear}
                className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 hover:bg-pink-500/30 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !url}
          className="btn-primary py-5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Download size={24} />
              <span>Download Video</span>
            </>
          )}
        </button>
      </div>

      {/* Video Info Card (Conditional) */}
      <AnimatePresence>
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header Info */}
            <div className="flex flex-col gap-2 px-2">
              <h3 className="font-bold text-xl leading-tight text-white">{videoInfo.title}</h3>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>{videoInfo.duration}</span>
                <span>•</span>
                <span>Ready</span>
              </div>
            </div>

            {/* Quality Cards */}
            <div className="flex flex-col gap-5">
              {videoInfo.formats && videoInfo.formats.length > 0 ? (
                videoInfo.formats.map((format, index) => {
                  const isAudio = format.quality.toLowerCase().includes('audio') || format.quality.toLowerCase().includes('mp3');
                  const isHD = format.quality.toLowerCase().includes('high') || format.quality.toLowerCase().includes('hd') || format.quality.toLowerCase().includes('1080') || format.quality.toLowerCase().includes('720');
                  
                  let icon = <Video size={20} />;
                  let title = "Standard Quality";
                  let description = "Standard definition for mobile devices";
                  let badge1 = "MP4";
                  let badge2 = "360p";

                  if (isAudio) {
                    icon = <Music size={20} />;
                    title = "Audio Only";
                    description = "Download audio in MP3 format";
                    badge1 = "MP3";
                    badge2 = "320kbps";
                  } else if (isHD) {
                    icon = <Cloud size={20} />; // Using Cloud as a placeholder for "Monitor" style icon if needed, or stick to Video
                    title = "HD Quality";
                    description = "High definition video";
                    badge1 = "MP4";
                    badge2 = "HD";
                  }

                  return (
                    <div 
                      key={index}
                      className="bg-[#1a1b2e] rounded-[2rem] p-6 border border-white/5 flex flex-col gap-5 shadow-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                          {icon}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="font-bold text-lg text-white">{title}</h4>
                          <p className="text-xs text-slate-500 font-medium">{description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-blue-400 flex items-center gap-1.5">
                          <Scissors size={12} /> {badge1}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-blue-400 flex items-center gap-1.5">
                          <Video size={12} /> {badge2}
                        </div>
                      </div>

                      <button 
                        onClick={() => window.open(format.url, "_blank")}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Download size={18} />
                        <span>{format.quality}</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center glass-card">
                  <p className="text-slate-400">No download formats available for this video.</p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <button 
                onClick={handleClear}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
                Analyze Another Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlatformIcon({ icon: Icon, color, label }: { icon: any, color: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer", color)}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
