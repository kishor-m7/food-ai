import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { Donate } from './pages/Donate';
import { Marketplace } from './pages/Marketplace';
import { History } from './pages/History';
import { Admin } from './pages/Admin';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
