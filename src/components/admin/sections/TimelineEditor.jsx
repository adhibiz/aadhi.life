import React, { useState, useEffect } from 'react';
import { collection, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../hooks/useFirestore';
import { AdminCard } from '../AdminCard';
import { ConfirmDialog } from '../ConfirmDialog';
import { Plus, Trash2, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimelineEditor = ({ showToast }) => {
 const { documents: timeline, loading } = useCollection('timeline');
 const [localTimeline, setLocalTimeline] = useState([]);
 const [isSaving, setIsSaving] = useState(false);
 const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

 useEffect(() => {
 if (timeline) {
  const sorted = [...timeline].sort((a, b) => (a.order || 0) - (b.order || 0));
  setLocalTimeline(sorted);
 }
 }, [timeline]);

 const handleAddEntry = () => {
 const newEntry = {
  id: `new_${Date.now()}`,
  year: new Date().getFullYear().toString(),
  title: 'New Milestone',
  description: '',
  order: localTimeline.length,
  isNew: true
 };
 setLocalTimeline([...localTimeline, newEntry]);
 };

 const handleUpdateEntry = (id, field, value) => {
 setLocalTimeline(prev => 
  prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry)
 );
 };

 const handleMove = (index, direction) => {
 const newTimeline = [...localTimeline];
 if (direction === 'up' && index > 0) {
  const temp = newTimeline[index];
  newTimeline[index] = newTimeline[index - 1];
  newTimeline[index - 1] = temp;
 } else if (direction === 'down' && index < newTimeline.length - 1) {
  const temp = newTimeline[index];
  newTimeline[index] = newTimeline[index + 1];
  newTimeline[index + 1] = temp;
 }
 
 // Update order property to match new array index
 const reordered = newTimeline.map((item, i) => ({ ...item, order: i }));
 setLocalTimeline(reordered);
 };

 const handleSaveAll = async () => {
 setIsSaving(true);
 try {
  const batch = writeBatch(db);
  
  localTimeline.forEach((entry, index) => {
  if (entry.isNew) {
   const newRef = doc(collection(db, 'timeline'));
   const { id, isNew, ...data } = entry;
   batch.set(newRef, { ...data, order: index });
  } else {
   const docRef = doc(db, 'timeline', entry.id);
   const { id, ...data } = entry;
   batch.update(docRef, { ...data, order: index });
  }
  });
  
  await batch.commit();
  showToast('Timeline saved successfully');
 } catch (error) {
  console.error(error);
  showToast('Failed to save timeline', 'error');
 } finally {
  setIsSaving(false);
 }
 };

 const handleDeleteConfirm = async (id) => {
 setConfirmDelete({ isOpen: false, id: null });
 
 if (id.toString().startsWith('new_')) {
  setLocalTimeline(prev => prev.filter(e => e.id !== id));
  return;
 }
 
 try {
  await deleteDoc(doc(db, 'timeline', id));
  setLocalTimeline(prev => prev.filter(e => e.id !== id));
  showToast('Entry deleted successfully');
 } catch (error) {
  console.error(error);
  showToast('Failed to delete entry', 'error');
 }
 };

 if (loading) {
 return (
  <div className="flex justify-center items-center h-64">
  <Loader2 className="w-8 h-8 text-accent animate-spin" />
  </div>
 );
 }

 return (
 <div className="space-y-6 max-w-4xl">
  <div className="flex items-center justify-between">
  <h2 className="text-2xl font-display font-bold text-ink ">Manage Timeline</h2>
  <div className="flex gap-3">
   <button
   onClick={handleAddEntry}
   className="bg-bg-surface text-ink px-4 py-2 rounded-lg font-medium hover:bg-bg-hover transition-colors flex items-center gap-2 border border-line"
   >
   <Plus size={18} /> Add Entry
   </button>
   <button
   onClick={handleSaveAll}
   disabled={isSaving}
   className="bg-accent text-bg px-6 py-2 rounded-lg font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
   >
   {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save All Changes'}
   </button>
  </div>
  </div>

  <AdminCard className="!p-0 overflow-hidden">
  <div className="divide-y divide-surface-2">
   <AnimatePresence>
   {localTimeline.map((entry, index) => (
    <motion.div
    key={entry.id}
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0 }}
    className="p-6 bg-bg-surface hover:bg-bg-surface/50 transition-colors"
    >
    <div className="flex items-start gap-4">
     {/* Order Controls */}
     <div className="flex flex-col gap-1 pt-1">
     <button 
      onClick={() => handleMove(index, 'up')}
      disabled={index === 0}
      className="p-1 text-ink-muted hover:text-ink disabled:opacity-30 disabled:hover:text-ink-muted transition-colors"
     >
      <ArrowUp size={16} />
     </button>
     <button 
      onClick={() => handleMove(index, 'down')}
      disabled={index === localTimeline.length - 1}
      className="p-1 text-ink-muted hover:text-ink disabled:opacity-30 disabled:hover:text-ink-muted transition-colors"
     >
      <ArrowDown size={16} />
     </button>
     </div>

     {/* Form Fields */}
     <div className="flex-1 space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
      <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">Year</label>
      <input
       type="text"
       value={entry.year}
       onChange={(e) => handleUpdateEntry(entry.id, 'year', e.target.value)}
       className="w-full bg-bg-surface border border-line rounded-lg px-3 py-2 text-accent font-mono font-bold focus:border-accent focus:outline-none transition-colors"
      />
      </div>
      <div className="md:col-span-3">
      <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">Title</label>
      <input
       type="text"
       value={entry.title}
       onChange={(e) => handleUpdateEntry(entry.id, 'title', e.target.value)}
       className="w-full bg-bg-surface border border-line rounded-lg px-3 py-2 text-ink font-semibold focus:border-accent focus:outline-none transition-colors"
      />
      </div>
     </div>
     <div>
      <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">Description</label>
      <textarea
      value={entry.description}
      onChange={(e) => handleUpdateEntry(entry.id, 'description', e.target.value)}
      rows={3}
      className="w-full bg-bg-surface border border-line rounded-lg px-3 py-2 text-ink-muted focus:border-accent focus:outline-none transition-colors resize-y"
      />
     </div>
     </div>

     {/* Delete Button */}
     <button
     onClick={() => setConfirmDelete({ isOpen: true, id: entry.id })}
     className="p-2 text-ink-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
     >
     <Trash2 size={20} />
     </button>
    </div>
    </motion.div>
   ))}
   </AnimatePresence>
   {localTimeline.length === 0 && (
   <div className="p-8 text-center text-ink-muted">
    No timeline entries yet. Add one to get started.
   </div>
   )}
  </div>
  </AdminCard>

  <ConfirmDialog
  isOpen={confirmDelete.isOpen}
  title="Delete Timeline Entry"
  message="Are you sure you want to delete this milestone?"
  confirmText="Delete"
  isDestructive={true}
  onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
  onConfirm={() => handleDeleteConfirm(confirmDelete.id)}
  />
 </div>
 );
};
