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

const AuthContext = createContext<AuthContextType>({ user: { email: "admin@example.com" }, loading: false, isAdmin: true });

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{ user: { email: "admin@example.com" }, loading: false, isAdmin: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
