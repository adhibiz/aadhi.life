import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { PageTransition } from './components/ui/PageTransition';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Now from './pages/Now';
import { Login } from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// A component to calculate and display scroll progress
const ScrollProgressBar = () => {
 const { scrollYProgress } = useScroll();
 const scaleX = useSpring(scrollYProgress, {
 stiffness: 100,
 damping: 30,
 restDelta: 0.001
 });

 return (
 <motion.div
  className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[60] origin-left"
  style={{ scaleX }}
 />
 );
};

// Wrapper to handle layout and routing
const AppContent = () => {
 const location = useLocation();
 const isAdminHost = window.location.hostname === 'admin.aadhi.life';
 const isAdminRoute = isAdminHost || location.pathname.startsWith('/admin');

 return (
 <div className="min-h-screen flex flex-col bg-bg font-body text-ink selection:bg-accent/30 selection:text-accent-light">
  <ScrollProgressBar />
  {!isAdminRoute && <Navbar />}
  <main className="flex-grow">
  <PageTransition>
   <Routes>
   <Route path="/" element={isAdminHost ? <Navigate to="/admin/dashboard" replace /> : <Home />} />
   <Route path="/blog" element={<Blog />} />
   <Route path="/blog/:id" element={<BlogPost />} />
   <Route path="/now" element={<Now />} />
   <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
   <Route path="/admin/login" element={<Login />} />
   <Route path="/admin/dashboard" element={
    <ProtectedRoute>
    <Dashboard />
    </ProtectedRoute>
   } />
   </Routes>
  </PageTransition>
  </main>
  {!isAdminRoute && <Footer />}
 </div>
 );
};

function App() {
 return (
 <ThemeProvider>
  <LoadingScreen />
  <Router>
  <AppContent />
  </Router>
  <SpeedInsights />
 </ThemeProvider>
 );
}

export default App;
