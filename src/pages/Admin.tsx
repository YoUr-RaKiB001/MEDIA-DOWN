import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Download, Shield, Settings, Bell, 
  TrendingUp, Activity, Globe, Zap, FileText, MoreVertical, 
  CheckCircle, XCircle, Clock, Search, Filter, ChevronDown,
  ArrowUpRight, ArrowDownRight, Database, LogOut, Lock, Eye, EyeOff, Loader2, Plus, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from "recharts";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import axios from "axios";

const data = [
  { name: "Mon", downloads: 450 },
  { name: "Tue", downloads: 620 },
  { name: "Wed", downloads: 580 },
  { name: "Thu", downloads: 840 },
  { name: "Fri", downloads: 920 },
  { name: "Sat", downloads: 1100 },
  { name: "Sun", downloads: 980 },
];

const platformData = [
  { name: "TikTok", value: 45 },
  { name: "YouTube", value: 25 },
  { name: "Facebook", value: 15 },
  { name: "Instagram", value: 10 },
  { name: "Other", value: 5 },
];

interface AdminProps {
  view: "dashboard" | "api" | "reports" | "settings";
}

export default function Admin({ view }: AdminProps) {
  const navigate = useNavigate();

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <DashboardView />;
      case "api":
        return <ApiSettingsView />;
      case "reports":
        return <DownloadReportsView />;
      case "settings":
        return <AdminSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold capitalize text-text">{view === "reports" ? "Download Reports" : view === "api" ? "API Settings" : view}</h1>
          <p className="text-slate-400">Manage your application and monitor performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass-card p-2 hover:bg-glass-border transition-all relative">
            <Bell size={20} className="text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background" />
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

function DashboardView() {
  const stats = [
    { label: "Total Downloads", value: "12,482", change: "+18.5%", icon: Download, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "API Calls Today", value: "2,840", change: "+12.2%", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Success Rate", value: "98.4%", change: "+0.5%", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Avg. Speed", value: "4.2 MB/s", change: "+5.4%", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Users", value: "154", change: "+24", icon: Globe, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold", 
                stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
              )}>
                {stat.change.startsWith("+") ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              <span className="text-2xl font-bold text-text">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text">Download Statistics</h2>
            <div className="flex items-center gap-2">
              <button className="text-xs font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">Weekly</button>
              <button className="text-xs font-bold px-3 py-1 rounded-lg hover:bg-glass transition-all text-slate-400">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="downloads" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDownloads)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Usage */}
        <div className="glass-card flex flex-col gap-6">
          <h2 className="text-xl font-bold text-text">Platform Usage</h2>
          <div className="flex flex-col gap-5">
            {platformData.map((platform, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-300">{platform.name}</span>
                  <span className="font-bold text-primary">{platform.value}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${platform.value}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={cn(
                      "h-full rounded-full",
                      platform.name === "TikTok" ? "bg-pink-500" :
                      platform.name === "YouTube" ? "bg-red-500" :
                      platform.name === "Facebook" ? "bg-blue-500" :
                      platform.name === "Instagram" ? "bg-purple-500" : "bg-slate-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Downloads */}
      <div className="glass-card flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">Recent Downloads</h2>
          <button className="text-primary text-xs font-bold hover:underline">View All</button>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { title: "Funny Cat Video", platform: "TikTok", size: "12MB", date: "2 mins ago", url: "https://tiktok.com/v/123", color: "text-pink-500" },
            { title: "Cooking Tutorial", platform: "YouTube", size: "45MB", date: "15 mins ago", url: "https://youtube.com/watch?v=456", color: "text-red-500" },
            { title: "Travel Vlog", platform: "Instagram", size: "28MB", date: "1 hour ago", url: "https://instagram.com/reels/789", color: "text-purple-500" },
            { title: "Tech Review", platform: "Twitter", size: "8MB", date: "3 hours ago", url: "https://twitter.com/i/status/012", color: "text-blue-400" },
          ].map((download, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-glass transition-all group">
              <div className={cn("w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0", download.color)}>
                <Globe size={20} />
              </div>
              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <h3 className="font-bold text-sm line-clamp-1 text-text">{download.title}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span className={download.color}>{download.platform}</span>
                  <span>•</span>
                  <span>{download.size}</span>
                  <span>•</span>
                  <span>{download.date}</span>
                </div>
              </div>
              <a 
                href={download.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
              >
                <ArrowUpRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiSettingsView() {
  const [config, setConfig] = useState({
    apiUrl: "",
    fbApi: "",
    instaApi: "",
    tiktokApi: "",
    capcutApi: "",
    teraboxApi: "",
    youtubeApi: "",
    titleKey: "",
    linksKey: "",
    failoverUrl: "",
    autoFailover: true,
    notice: "",
    showNotice: true,
    customRules: [] as { pattern: string; apiUrl: string }[]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get("/api/admin/config");
      setConfig(response.data);
    } catch (error) {
      toast.error("Failed to fetch API configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post("/api/admin/config", config);
      toast.success("API configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save API configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const apiFields = [
    { key: "apiUrl", label: "General API (v1/alldown)" },
    { key: "fbApi", label: "Facebook API (v2/fb)" },
    { key: "instaApi", label: "Instagram API (v3/insta)" },
    { key: "tiktokApi", label: "TikTok API (v4/tiktok)" },
    { key: "capcutApi", label: "CapCut API (v5/capcut)" },
    { key: "teraboxApi", label: "TeraBox API (v6/terabox)" },
    { key: "youtubeApi", label: "YouTube API (v7/youtube)" },
  ];

  const addCustomRule = () => {
    setConfig({
      ...config,
      customRules: [...(config.customRules || []), { pattern: "", apiUrl: "" }]
    });
  };

  const removeCustomRule = (index: number) => {
    const newRules = [...(config.customRules || [])];
    newRules.splice(index, 1);
    setConfig({ ...config, customRules: newRules });
  };

  const updateCustomRule = (index: number, field: "pattern" | "apiUrl", value: string) => {
    const newRules = [...(config.customRules || [])];
    newRules[index] = { ...newRules[index], [field]: value };
    setConfig({ ...config, customRules: newRules });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-card flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Notice Management</h2>
            <div 
              onClick={() => setConfig({ ...config, showNotice: !config.showNotice })}
              className={cn(
                "w-10 h-5 rounded-full relative flex items-center px-1 cursor-pointer transition-all",
                config.showNotice ? "bg-primary" : "bg-slate-700"
              )}
            >
              <div className={cn(
                "w-3 h-3 bg-white rounded-full transition-all",
                config.showNotice ? "ml-auto" : "ml-0"
              )} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Notice Text</label>
              <textarea 
                value={config.notice}
                onChange={(e) => setConfig({ ...config, notice: e.target.value })}
                className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all min-h-[100px] text-sm"
                placeholder="Enter notice message for users..."
              />
            </div>
            <div className="flex items-center justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Notice
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">API Configuration</h2>
            <button 
              onClick={addCustomRule}
              className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Custom Rule</span>
            </button>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Title Tag (JSON Key)</label>
                <input 
                  type="text" 
                  value={config.titleKey}
                  onChange={(e) => setConfig({ ...config, titleKey: e.target.value })}
                  className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
                  placeholder="e.g. title, video_title"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Links Tag (JSON Key)</label>
                <input 
                  type="text" 
                  value={config.linksKey}
                  onChange={(e) => setConfig({ ...config, linksKey: e.target.value })}
                  className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
                  placeholder="e.g. links, medias, formats"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{field.label}</label>
                  <input 
                    type="text" 
                    value={(config as any)[field.key]}
                    onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                    className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all text-sm"
                    placeholder={`https://imran.bro.bd/...`}
                  />
                </div>
              ))}
            </div>

            {/* Custom Rules Section */}
            {config.customRules && config.customRules.length > 0 && (
              <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Custom Routing Rules</h3>
                {config.customRules.map((rule, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Domain Pattern (e.g. twitter.com)</label>
                      <input 
                        type="text" 
                        value={rule.pattern}
                        onChange={(e) => updateCustomRule(idx, "pattern", e.target.value)}
                        className="bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-primary/50 transition-all text-xs"
                      />
                    </div>
                    <div className="flex-[2] flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">API URL</label>
                      <input 
                        type="text" 
                        value={rule.apiUrl}
                        onChange={(e) => updateCustomRule(idx, "apiUrl", e.target.value)}
                        className="bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-primary/50 transition-all text-xs"
                      />
                    </div>
                    <button 
                      onClick={() => removeCustomRule(idx)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Failover API URL (Backup)</label>
              <input 
                type="text" 
                value={config.failoverUrl}
                onChange={(e) => setConfig({ ...config, failoverUrl: e.target.value })}
                className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold">Auto Failover</span>
                <span className="text-[10px] text-slate-500">Switch to backup API on error</span>
              </div>
              <div 
                onClick={() => setConfig({ ...config, autoFailover: !config.autoFailover })}
                className={cn(
                  "w-10 h-5 rounded-full relative flex items-center px-1 cursor-pointer transition-all",
                  config.autoFailover ? "bg-primary" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full transition-all",
                  config.autoFailover ? "ml-auto" : "ml-0"
                )} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Connection Status:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-bold text-green-500">Connected</span>
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Configuration
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-6">
          <h2 className="text-xl font-bold">API Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Endpoint</th>
                  <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { date: "21:05:12", endpoint: "/analyze", status: "200 OK", calls: "1" },
                  { date: "21:04:45", endpoint: "/download", status: "200 OK", calls: "1" },
                  { date: "20:58:30", endpoint: "/analyze", status: "403 Forbidden", calls: "3" },
                  { date: "20:45:10", endpoint: "/analyze", status: "200 OK", calls: "1" },
                ].map((log, idx) => (
                  <tr key={idx} className="hover:bg-glass transition-all">
                    <td className="py-4 text-xs text-slate-400">{log.date}</td>
                    <td className="py-4 text-xs font-mono text-slate-300">{log.endpoint}</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        log.status === "200 OK" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-400">{log.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-card flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">API Limits</h2>
            <button className="text-primary text-xs font-bold hover:underline">Edit Limits</button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Limit</span>
                <span className="text-sm font-bold">20,000 Calls</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rate Limit</span>
                <span className="text-sm font-bold">100 Calls/min</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[20%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-6">
          <h2 className="text-xl font-bold">API Log History</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <p className="text-xs text-slate-500">No log history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadReportsView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-white/5 cursor-pointer hover:bg-glass transition-all">
            <Clock size={16} className="text-slate-500" />
            <span className="text-sm font-medium">Date Range</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-white/5 cursor-pointer hover:bg-glass transition-all">
            <Globe size={16} className="text-slate-500" />
            <span className="text-sm font-medium">Platform: All Platforms</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-white/5 cursor-pointer hover:bg-glass transition-all">
            <CheckCircle size={16} className="text-slate-500" />
            <span className="text-sm font-medium">Status: All Statuses</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
        <button className="btn-primary py-2 px-6 text-sm">Generate Report</button>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Video Title</th>
              <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Platform</th>
              <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Size</th>
              <th className="pb-4 text-xs font-bold text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { title: "Funny Cat Video", platform: "TikTok", status: "Completed", size: "12MB", date: "2026-03-24 21:00" },
              { title: "Cooking Tutorial", platform: "YouTube", status: "Completed", size: "45MB", date: "2026-03-24 20:45" },
              { title: "Travel Vlog", platform: "Instagram", status: "Completed", size: "28MB", date: "2026-03-24 20:00" },
              { title: "Tech Review", platform: "Twitter", status: "Failed", size: "8MB", date: "2026-03-24 18:00" },
              { title: "Music Video", platform: "YouTube", status: "Completed", size: "120MB", date: "2026-03-24 17:30" },
            ].map((report, idx) => (
              <tr key={idx} className="hover:bg-glass transition-all group">
                <td className="py-4 text-sm font-medium line-clamp-1 max-w-[200px]">{report.title}</td>
                <td className="py-4 text-sm text-slate-400">{report.platform}</td>
                <td className="py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                    report.status === "Completed" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {report.status}
                  </span>
                </td>
                <td className="py-4 text-sm text-slate-400">{report.size}</td>
                <td className="py-4 text-sm text-slate-400">{report.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSettingsView() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    const storedPassword = localStorage.getItem("adminPassword") || "admin123";
    
    if (currentPassword !== storedPassword) {
      toast.error("Incorrect current password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    localStorage.setItem("adminPassword", newPassword);
    toast.success("Password updated successfully");
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <div className="glass-card flex flex-col gap-6">
          <h2 className="text-xl font-bold">General Settings</h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold">Maintenance Mode</span>
                <span className="text-xs text-slate-500">Disable app access</span>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full relative flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-6">
          <h2 className="text-xl font-bold">Security Settings</h2>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
              <input 
                type="email" 
                defaultValue="admin@vortex.com" 
                className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Session Timeout (minutes)</label>
              <input 
                type="number" 
                defaultValue="60" 
                className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <button className="btn-primary py-3">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="glass-card flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Change Password</h2>
          <button 
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-slate-500 hover:text-white transition-all"
          >
            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
            <input 
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
            <input 
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Confirm New Password</label>
            <input 
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all"
              required
            />
          </div>
          <button type="submit" className="btn-primary py-3 flex items-center justify-center gap-2">
            <Lock size={18} />
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
