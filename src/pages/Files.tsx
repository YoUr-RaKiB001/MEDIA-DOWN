import React from "react";
import { Files, Play, Trash2, Share2, MoreVertical, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function FilesPage() {
  const downloadedFiles = [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold gradient-text">My Files</h1>
        <p className="text-slate-400 text-sm">View and manage your downloaded videos.</p>
      </div>

      <div className="flex flex-col gap-4">
        {downloadedFiles.length > 0 ? (
          downloadedFiles.map((file, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card flex items-center gap-4 p-3 group hover:bg-glass-border transition-all cursor-pointer"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img
                  src={file.thumbnail}
                  alt={file.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="text-white fill-white" size={20} />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <h3 className="font-bold text-sm line-clamp-1">{file.title}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="text-primary">{file.platform}</span>
                  <span>•</span>
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl hover:bg-glass-border transition-all text-slate-400 hover:text-white">
                  <Share2 size={18} />
                </button>
                <button className="p-2 rounded-xl hover:bg-glass-border transition-all text-slate-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Files size={48} className="text-slate-600" />
            <p className="text-slate-400 font-medium">No files downloaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
