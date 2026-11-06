import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
 const { user, isAdmin, loading, logout } = useAuth();

 if (loading) {
 return (
  <div className="min-h-screen bg-bg flex items-center justify-center">
  <Loader2 className="w-8 h-8 text-accent animate-spin" />
  </div>
 );
 }

 if (!user) {
 return <Navigate to="/admin/login" replace />;
 }

 if (!isAdmin) {
 return (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
  <p className="text-ink">This account doesn't have admin access.</p>
  <button onClick={logout} className="text-sm text-accent hover:text-accent-light">Sign out</button>
  </div>
 );
 }

 return children;
};
