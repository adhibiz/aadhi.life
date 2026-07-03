import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
 return (
 <AnimatePresence>
  {isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
   <motion.div
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   exit={{ opacity: 0 }}
   className="absolute inset-0 bg-black/60 backdrop-blur-sm"
   onClick={onClose}
   />
   <motion.div
   initial={{ opacity: 0, scale: 0.95, y: 20 }}
   animate={{ opacity: 1, scale: 1, y: 0 }}
   exit={{ opacity: 0, scale: 0.95, y: 20 }}
   className="relative w-full max-w-lg rounded-2xl border border-line bg-bg-surface p-6 shadow-2xl z-10"
   >
   <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-display font-semibold text-ink ">{title}</h2>
    <button
    onClick={onClose}
    className="rounded-full p-2 text-ink-muted hover:bg-bg-surface hover:text-ink transition-colors"
    >
    <X size={20} />
    </button>
   </div>
   <div className="text-ink ">
    {children}
   </div>
   </motion.div>
  </div>
  )}
 </AnimatePresence>
 );
};
