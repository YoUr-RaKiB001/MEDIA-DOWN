import React from "react";
import { Download, Pause, Play, X, CheckCircle, Clock, Trash2, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export default function Downloads() {
  const activeDownloads = [];

  const completedDownloads = [];

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">My Downloads</h1>
        </div>
      </div>

      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Active</h3>
          <div className="flex flex-col gap-3">
            {activeDownloads.map((item) => (
              <div key={item.id} className="glass-card p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800">
                      <img src={item.thumb} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{item.status} • {item.speed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      {item.status === "Downloading" ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      className="h-full bg-blue-500 glow-blue"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>{item.progress}%</span>
                    <span>{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Downloads */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Completed</h3>
        <div className="flex flex-col gap-3">
          {completedDownloads.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800">
                  <img src={item.thumb} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold line-clamp-1">{item.title}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{item.size} • {item.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                  <Play size={14} fill="currentColor" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
