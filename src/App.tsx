import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import Files from "./pages/Files";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
}

interface ThemeContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: { email: "admin@example.com" }, loading: false, isAdmin: true });
const ThemeContext = createContext<ThemeContextType>({ theme: "dark", toggleTheme: () => {} });

export const useAuth = () => useContext(AuthContext);
export const useTheme = () => useContext(ThemeContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{ user: { email: "admin@example.com" }, loading: false, isAdmin: true }}>
      {children}
    </AuthContext.Provider>
  );
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "dark" | "light") || "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/files" element={<Files />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin view="dashboard" />} />
            <Route path="/admin/api" element={<Admin view="api" />} />
            <Route path="/admin/reports" element={<Admin view="reports" />} />
            <Route path="/admin/settings" element={<Admin view="settings" />} />
          </Routes>
        </Layout>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
