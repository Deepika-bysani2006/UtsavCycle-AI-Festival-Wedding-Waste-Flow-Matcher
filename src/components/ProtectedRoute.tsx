import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf5]">
      <div className="text-center">
        <img
          src="/utsavcycle-logo.png"
          alt="UtsavCycle AI"
          className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        />
        <p className="text-[#1a6b2f] font-medium text-sm">Loading…</p>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
