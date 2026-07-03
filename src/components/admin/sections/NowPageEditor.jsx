import React, { useState, useEffect } from 'react';
import { useDocument } from '../../../hooks/useFirestore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { AdminCard } from '../AdminCard';
import { Loader2 } from 'lucide-react';

export const NowPageEditor = ({ showToast }) => {
 const { document: nowPage, loading } = useDocument('now_page', 'current');
 const [formData, setFormData] = useState({
 currently: '',
 building: '',
 learning: '',
 listening_to: '',
 goal: ''
 });
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
 if (nowPage) {
  setFormData({
  currently: nowPage.currently || '',
  building: Array.isArray(nowPage.building) ? nowPage.building.join('\n') : (nowPage.building || ''),
  learning: Array.isArray(nowPage.learning) ? nowPage.learning.join('\n') : (nowPage.learning || ''),
  listening_to: nowPage.listening_to || '',
  goal: nowPage.goal || ''
  });
 }
 }, [nowPage]);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleSave = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 
 try {
  const docRef = doc(db, 'now_page', 'current');
  
  // Parse arrays from line breaks for building and learning
  const dataToSave = {
  currently: formData.currently,
  building: formData.building.split('\n').map(s => s.trim()).filter(Boolean),
  learning: formData.learning.split('\n').map(s => s.trim()).filter(Boolean),
  listening_to: formData.listening_to,
  goal: formData.goal,
  last_updated: serverTimestamp()
  };

  await setDoc(docRef, dataToSave);
  showToast('Now page updated successfully');
 } catch (error) {
  console.error(error);
  showToast('Failed to update Now page', 'error');
 } finally {
  setIsSaving(false);
 }
 };

 const formatDate = (timestamp) => {
 if (!timestamp) return 'Never';
 const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
 return new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
 }).format(date);
 };

 if (loading) {
 return (
  <div className="flex justify-center items-center h-64">
  <Loader2 className="w-8 h-8 text-accent animate-spin" />
  </div>
 );
 }

 return (
 <div className="space-y-6 max-w-3xl">
  <div className="flex items-center justify-between">
  <div>
   <h2 className="text-2xl font-display font-bold text-ink ">Manage /now Page</h2>
   <p className="text-sm text-ink-muted mt-1">
   Last updated: {formatDate(nowPage?.last_updated)}
   </p>
  </div>
  </div>

  <form onSubmit={handleSave} className="space-y-6">
  <AdminCard title="What I'm doing now">
   <div className="space-y-6">
   <div>
    <label className="flex justify-between text-sm font-medium text-ink-muted mb-2">
    <span>Currently (General overview)</span>
    <span>{formData.currently.length} chars</span>
    </label>
    <textarea
    name="currently"
    value={formData.currently}
    onChange={handleChange}
    rows={3}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-3 text-ink focus:border-accent focus:outline-none transition-colors resize-y leading-relaxed"
    placeholder="What is your main focus right now?"
    />
   </div>

   <div>
    <label className="flex justify-between text-sm font-medium text-ink-muted mb-2">
    <span>Building (One item per line)</span>
    <span>{formData.building.length} chars</span>
    </label>
    <textarea
    name="building"
    value={formData.building}
    onChange={handleChange}
    rows={3}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-3 text-ink focus:border-accent focus:outline-none transition-colors resize-y leading-relaxed"
    placeholder="Project 1&#10;Project 2"
    />
   </div>

   <div>
    <label className="flex justify-between text-sm font-medium text-ink-muted mb-2">
    <span>Learning (One item per line)</span>
    <span>{formData.learning.length} chars</span>
    </label>
    <textarea
    name="learning"
    value={formData.learning}
    onChange={handleChange}
    rows={3}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-3 text-ink focus:border-accent focus:outline-none transition-colors resize-y leading-relaxed"
    placeholder="Topic 1&#10;Topic 2"
    />
   </div>

   <div>
    <label className="flex justify-between text-sm font-medium text-ink-muted mb-2">
    <span>Listening To / Reading</span>
    <span>{formData.listening_to.length} chars</span>
    </label>
    <textarea
    name="listening_to"
    value={formData.listening_to}
    onChange={handleChange}
    rows={2}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-3 text-ink focus:border-accent focus:outline-none transition-colors resize-y leading-relaxed"
    />
   </div>

   <div>
    <label className="flex justify-between text-sm font-medium text-ink-muted mb-2">
    <span>Primary Goal</span>
    <span>{formData.goal.length} chars</span>
    </label>
    <textarea
    name="goal"
    value={formData.goal}
    onChange={handleChange}
    rows={2}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-3 text-ink focus:border-accent focus:outline-none transition-colors resize-y leading-relaxed"
    />
   </div>
   </div>
  </AdminCard>

  <div className="flex justify-end pt-2">
   <button
   type="submit"
   disabled={isSaving}
   className="bg-accent text-bg px-8 py-3 rounded-lg font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
   >
   {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save /now Page'}
   </button>
  </div>
  </form>
 </div>
 );
};
