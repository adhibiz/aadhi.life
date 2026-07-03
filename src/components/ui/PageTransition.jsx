import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDocument } from '../../hooks/useFirestore';

export const PageTransition = ({ children }) => {
 const location = useLocation();
 const [isLoading, setIsLoading] = useState(false);
 const [displayChildren, setDisplayChildren] = useState(children);
 const prevPathRef = useRef(location.pathname);
 const timerRef = useRef(null);
 const { document: profile } = useDocument('site_meta', 'profile');

 const displayName = profile?.name?.toLowerCase() || 'aadhi';

 useEffect(() => {
 if (prevPathRef.current === location.pathname) return;

 prevPathRef.current = location.pathname;
 setIsLoading(true);

 if (timerRef.current) clearTimeout(timerRef.current);

 timerRef.current = setTimeout(() => {
  setDisplayChildren(children);
  setIsLoading(false);
 }, 3000);

 return () => {
  if (timerRef.current) clearTimeout(timerRef.current);
 };
 }, [location.pathname]);

 useEffect(() => {
 if (!isLoading) {
  setDisplayChildren(children);
 }
 }, [children, isLoading]);

 return (
 <div className="relative">
  <AnimatePresence mode="wait">
  {isLoading ? (
   <motion.div
   key="page-loading"
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   exit={{ opacity: 0 }}
   transition={{ duration: 0.3, ease: 'easeInOut' }}
   className="min-h-[70vh] flex items-center justify-center bg-bg"
   >
   <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="flex flex-col items-center space-y-5"
   >
    {/* Same design as LoadingScreen ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â dynamic name */}
    <div className="relative w-16 h-16 flex items-center justify-center">
    <motion.div
     animate={{ scale: [1, 1.15, 1], rotate: 360 }}
     transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
     className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20 border-t-primary"
    />
    <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-display font-bold text-lg">
     {displayName.charAt(0).toUpperCase()}
    </div>
    </div>

    <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider">
    <span className="text-ink ">{displayName}</span>
    <span className="text-accent animate-pulse">.</span>
    <span className="text-ink-muted text-lg font-medium ml-1">life</span>
    </h1>
   </motion.div>
   </motion.div>
  ) : (
   <motion.div
   key={location.pathname}
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   transition={{ duration: 0.25 }}
   >
   {displayChildren}
   </motion.div>
  )}
  </AnimatePresence>
 </div>
 );
};
