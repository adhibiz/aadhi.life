import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Toast = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
 useEffect(() => {
 if (isVisible && duration) {
  const timer = setTimeout(onClose, duration);
  return () => clearTimeout(timer);
 }
 }, [isVisible, duration, onClose]);

  const colors = {
    info: 'bg-bg-surface/90 border-line text-ink backdrop-blur-md',
    success: 'bg-green-950/90 border-green-800/40 text-green-400 backdrop-blur-md',
    error: 'bg-red-950/90 border-red-800/40 text-red-400 backdrop-blur-md'
  };

  return (
  <AnimatePresence>
   {isVisible && (
   <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } }}
    className={`fixed bottom-4 right-4 flex items-center p-4 rounded-xl border shadow-2xl z-50 ${colors[type]}`}
   >
    <span className="mr-4 text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors shrink-0">
    <X size={16} />
    </button>
   </motion.div>
  )}
 </AnimatePresence>
 );
};
