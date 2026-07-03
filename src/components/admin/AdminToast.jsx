import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export const AdminToast = ({ message, type = 'success', onClose, visible }) => {
 useEffect(() => {
 if (visible) {
  const timer = setTimeout(() => {
  onClose();
  }, 3000);
  return () => clearTimeout(timer);
 }
 }, [visible, onClose]);

 return (
 <AnimatePresence>
  {visible && (
  <motion.div
   initial={{ opacity: 0, y: 50, scale: 0.9 }}
   animate={{ opacity: 1, y: 0, scale: 1 }}
   exit={{ opacity: 0, scale: 0.9, y: 20 }}
   className="fixed bottom-6 right-6 z-50"
  >
   <div className="bg-bg-surface border border-line shadow-2xl rounded-lg px-4 py-3 flex items-center gap-3">
   {type === 'success' ? (
    <CheckCircle2 className="w-5 h-5 text-green-500" />
   ) : (
    <XCircle className="w-5 h-5 text-red-500" />
   )}
   <p className="text-sm font-medium text-ink ">{message}</p>
   <button 
    onClick={onClose}
    className="ml-4 text-ink-muted hover:text-ink transition-colors"
   >
    <X className="w-4 h-4" />
   </button>
   </div>
  </motion.div>
  )}
 </AnimatePresence>
 );
};
