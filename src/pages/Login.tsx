import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple mock login logic
    // In a real app, this would be an API call or Firebase Auth
    setTimeout(() => {
      const storedPassword = localStorage.getItem("adminPassword") || "admin123";
      if (password === storedPassword) {
        localStorage.setItem("isAdminAuthenticated", "true");
        navigate("/admin");
      } else {
        setError("Invalid admin password. Please try again.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 flex flex-col gap-8"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Admin Access</h1>
          <p className="text-slate-400 text-sm">Please enter the admin password to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-5 py-4 outline-none focus:border-primary/50 transition-all text-sm"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                <span>Login to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate("/")}
            className="text-slate-500 text-xs hover:text-white transition-all"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
