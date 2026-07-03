import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({ isOpen, title, message, confirmText = "Confirm", onConfirm, onCancel, isDestructive = false }) => {
 return (
 <AnimatePresence>
  {isOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
   <motion.div 
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   exit={{ opacity: 0 }}
   onClick={onCancel}
   className="absolute inset-0 bg-black/60 backdrop-blur-sm"
   />
   <motion.div
   initial={{ opacity: 0, scale: 0.95 }}
   animate={{ opacity: 1, scale: 1 }}
   exit={{ opacity: 0, scale: 0.95 }}
   className="relative bg-bg-surface border border-line rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
   >
   <div className="p-6">
    <div className="flex items-center gap-4 mb-4">
    <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>
     <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold text-ink ">{title}</h3>
    </div>
    <p className="text-ink-muted mb-8">{message}</p>
    
    <div className="flex gap-3 justify-end">
    <button 
     onClick={onCancel}
     className="px-4 py-2 rounded-lg font-medium text-ink-muted hover:text-ink hover:bg-bg-surface transition-colors"
    >
     Cancel
    </button>
    <button 
     onClick={onConfirm}
     className={`px-4 py-2 rounded-lg font-medium text-ink transition-colors ${
     isDestructive 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-accent hover:bg-accent-light text-bg'
     }`}
    >
     {confirmText}
    </button>
    </div>
   </div>
   </motion.div>
  </div>
  )}
 </AnimatePresence>
 );
};
