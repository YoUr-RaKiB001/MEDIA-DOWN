import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Download, Files, Settings, LayoutDashboard, Shield, Activity, FileText, Sun, Moon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useTheme } from "../App";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = location.pathname.startsWith("/admin");

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Download, label: "Downloads", path: "/downloads" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  if (isAdmin) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-900/50 border-r border-white/5 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg glow-blue">
              <Shield size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin</span>
          </div>
          
          <nav className="flex flex-col gap-2">
            <Link to="/admin" className={cn("flex items-center gap-3 p-3 rounded-xl transition-all", location.pathname === "/admin" ? "bg-primary/20 text-primary" : "hover:bg-glass")}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/api" className={cn("flex items-center gap-3 p-3 rounded-xl transition-all", location.pathname === "/admin/api" ? "bg-primary/20 text-primary" : "hover:bg-glass")}>
              <Activity size={20} />
              <span>API Settings</span>
            </Link>
            <Link to="/admin/reports" className={cn("flex items-center gap-3 p-3 rounded-xl transition-all", location.pathname === "/admin/reports" ? "bg-primary/20 text-primary" : "hover:bg-glass")}>
              <FileText size={20} />
              <span>Downloads</span>
            </Link>
            <Link to="/admin/settings" className={cn("flex items-center gap-3 p-3 rounded-xl transition-all", location.pathname === "/admin/settings" ? "bg-primary/20 text-primary" : "hover:bg-glass")}>
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-glass mt-auto">
              <Home size={20} />
              <span>Back to App</span>
            </Link>
          </nav>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Download size={18} />
          </div>
          <span className="font-bold tracking-tight">Vortex DL</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-20 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 nav-blur z-50">
        <div className="max-w-md mx-auto flex items-center justify-around py-4 px-6 relative">
          {/* Active Indicator Glow */}
          <div 
            className="absolute top-0 w-12 h-1 bg-blue-500 glow-blue transition-all duration-300 rounded-full"
            style={{ 
              left: `${(navItems.findIndex(item => item.path === location.pathname) * (100 / navItems.length)) + (100 / (navItems.length * 2))}%`,
              transform: 'translateX(-50%)'
            }}
          />
          
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                location.pathname === item.path ? "text-blue-500 scale-110" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
