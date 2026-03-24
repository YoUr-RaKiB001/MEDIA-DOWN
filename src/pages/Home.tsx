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
  const [selectedQuality, setSelectedQuality] = useState<string>("High Quality");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await axios.get(`/api/analyze?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
      if (response.data.formats && response.data.formats.length > 0) {
        setSelectedQuality(response.data.formats[0].quality);
      }
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
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
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
            <div className="glass-card p-0 overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold">
                  {videoInfo.duration}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg line-clamp-2 leading-tight">{videoInfo.title}</h3>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {videoInfo.formats.map((format) => (
                <button
                  key={format.quality}
                  onClick={() => setSelectedQuality(format.quality)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    selectedQuality === format.quality
                      ? "bg-purple-500/10 border-purple-500/50 text-white"
                      : "bg-white/5 border-white/5 text-slate-400"
                  )}
                >
                  <span className="font-bold">{format.quality}</span>
                  <span className="text-xs opacity-50">{format.size}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleDownload}
              className="btn-primary py-5 text-lg glow-blue"
            >
              Download Now
            </button>
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
