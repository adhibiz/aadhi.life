import React from 'react';
import { useCollection } from '../../../hooks/useFirestore';
import { db } from '../../../firebase/config';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { AdminCard } from '../AdminCard';
import { Heart, Share2, MessageSquare, Bell, Check, Trash2, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const Notifications = ({ showToast }) => {
 const { documents: notifications, loading } = useCollection('notifications');

 if (loading) {
 return (
  <div className="flex justify-center items-center h-64">
  <Loader2 className="w-8 h-8 text-accent animate-spin" />
  </div>
 );
 }

 // Sort by created_at descending
 const sortedNotifications = [...notifications].sort((a, b) => {
 const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
 const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
 return timeB - timeA;
 });

 const unreadCount = notifications.filter(n => !n.read).length;

 const handleMarkAsRead = async (id) => {
 try {
  await updateDoc(doc(db, 'notifications', id), { read: true });
 } catch (e) {
  console.error(e);
  showToast('Failed to update notification', 'error');
 }
 };

 const handleDelete = async (id) => {
 try {
  await deleteDoc(doc(db, 'notifications', id));
  showToast('Notification deleted');
 } catch (e) {
  console.error(e);
  showToast('Failed to delete notification', 'error');
 }
 };

 const handleMarkAllRead = async () => {
 const unread = notifications.filter(n => !n.read);
 if (unread.length === 0) return;

 try {
  // Update each sequentially
  await Promise.all(unread.map(n => 
  updateDoc(doc(db, 'notifications', n.id), { read: true })
  ));
  showToast('All notifications marked as read');
 } catch (e) {
  console.error(e);
  showToast('Failed to mark all as read', 'error');
 }
 };

 const getIcon = (type) => {
 switch (type) {
  case 'like':
  return <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl"><Heart size={18} className="fill-red-500" /></div>;
  case 'share':
  return <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl"><Share2 size={18} /></div>;
  case 'comment':
  return <div className="p-2.5 bg-accent/10 text-accent rounded-xl"><MessageSquare size={18} /></div>;
  default:
  return <div className="p-2.5 bg-bg-surface text-ink-muted rounded-xl"><Bell size={18} /></div>;
 }
 };

 return (
 <div className="space-y-6 max-w-4xl">
  <div className="flex items-center justify-between">
  <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
   <Bell className="text-accent" size={24} />
   <span>Activity Notifications</span>
   {unreadCount > 0 && (
   <span className="ml-2 bg-accent text-bg text-xs font-bold px-2 py-0.5 rounded-full">
    {unreadCount} new
   </span>
   )}
  </h1>

  {unreadCount > 0 && (
   <button
   onClick={handleMarkAllRead}
   className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-bg rounded-lg transition-all text-xs font-semibold"
   >
   <Check size={14} /> Mark all as read
   </button>
  )}
  </div>

  {sortedNotifications.length === 0 ? (
  <div className="text-center py-20 bg-bg-surface border border-line rounded-2xl">
   <Bell className="w-16 h-16 mx-auto mb-4 text-ink-muted opacity-30" />
   <p className="text-lg font-medium text-ink ">No activity notifications yet.</p>
   <p className="text-sm text-ink-muted mt-1">Notifications when readers like, share, or comment on your posts will appear here.</p>
  </div>
  ) : (
  <div className="space-y-3">
   {sortedNotifications.map((notif, idx) => (
   <motion.div
    key={notif.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: idx * 0.03 }}
    className={`flex items-center justify-between p-4 bg-bg-surface border rounded-xl transition-all ${
    notif.read ? 'border-line opacity-70' : 'border-accent/30 shadow-md bg-accent/5'
    }`}
   >
    <div className="flex items-center gap-4">
    {getIcon(notif.type)}
    <div>
     <p className="text-sm font-semibold text-ink ">
     {notif.message}
     </p>
     <p className="text-xs text-ink-muted flex items-center gap-1 mt-1">
     <Clock size={12} />
     {notif.created_at?.toDate ? notif.created_at.toDate().toLocaleString() : 'Just now'}
     </p>
    </div>
    </div>

    <div className="flex gap-1 shrink-0">
    {!notif.read && (
     <button
     onClick={() => handleMarkAsRead(notif.id)}
     className="p-2 text-accent hover:bg-accent/15 rounded-lg transition-colors"
     title="Mark as read"
     >
     <Check size={16} />
     </button>
    )}
    <button
     onClick={() => handleDelete(notif.id)}
     className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
     title="Delete"
    >
     <Trash2 size={16} />
    </button>
    </div>
   </motion.div>
   ))}
  </div>
  )}
 </div>
 );
};
