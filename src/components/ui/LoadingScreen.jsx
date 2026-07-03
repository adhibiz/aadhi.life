import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocument } from '../../hooks/useFirestore';

export const LoadingScreen = ({ onComplete }) => {
 const [isVisible, setIsVisible] = useState(false);
 const { document: profile } = useDocument('site_meta', 'profile');

 const displayName = profile?.name?.toLowerCase() || 'aadhi';

 useEffect(() => {
 const hasVisited = sessionStorage.getItem('visited');
 
 if (!hasVisited) {
  setIsVisible(true);
  sessionStorage.setItem('visited', 'true');
  
  const timer = setTimeout(() => {
  setIsVisible(false);
  if (onComplete) onComplete();
  }, 5000);
  
  return () => clearTimeout(timer);
 } else {
  if (onComplete) onComplete();
 }
 }, [onComplete]);

 return (
 <AnimatePresence>
  {isVisible && (
  <motion.div
   initial={{ opacity: 1 }}
   exit={{ opacity: 0 }}
   transition={{ duration: 0.5, ease: "easeInOut" }}
   className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
  >
   <motion.div
   initial={{ opacity: 0, scale: 0.9 }}
   animate={{ opacity: 1, scale: 1 }}
   exit={{ opacity: 0, scale: 1.05 }}
   transition={{ duration: 0.8, ease: "easeOut" }}
   className="flex flex-col items-center space-y-5"
   >
   {/* Spinning/Pulsing Logo Indicator */}
   <div className="relative w-16 h-16 flex items-center justify-center">
    <motion.div 
    animate={{ scale: [1, 1.15, 1], rotate: 360 }}
    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20 border-t-primary"
    />
    <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-display font-bold text-lg">
    {displayName.charAt(0).toUpperCase()}
    </div>
   </div>
   
   {/* Brand Logo Text — dynamic from admin */}
   <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">
    <span className="text-ink ">{displayName}</span>
    <span className="text-accent animate-pulse">.</span>
    <span className="text-ink-muted text-lg font-medium ml-1">life</span>
   </h1>
   </motion.div>
  </motion.div>
  )}
 </AnimatePresence>
 );
};
