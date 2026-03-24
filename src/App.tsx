import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import Files from "./pages/Files";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdminAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
  if (!isAdminAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/files" element={<Files />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Admin view="dashboard" /></ProtectedRoute>} />
          <Route path="/admin/api" element={<ProtectedRoute><Admin view="api" /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><Admin view="reports" /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Admin view="settings" /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}
