import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import Files from "./pages/Files";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email === "ahamedemran60@gmail.com");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
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
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Admin view="dashboard" /></ProtectedRoute>} />
            <Route path="/admin/api" element={<ProtectedRoute><Admin view="api" /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><Admin view="reports" /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Admin view="settings" /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
