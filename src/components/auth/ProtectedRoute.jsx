import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
 const { user, loading } = useAuth();

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

 return children;
};
