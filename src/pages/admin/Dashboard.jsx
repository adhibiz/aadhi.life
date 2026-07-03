import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCollection } from '../../hooks/useFirestore';
import { useTheme } from '../../context/ThemeContext';
import { 
 getProjects, 
 getPublishedPosts, 
 getSkills, 
 getPendingGuestbook,
 getApprovedGuestbook,
 updateGuestbookStatus,
 deleteGuestbookEntry
} from '../../firebase/collections';
import { AdminCard } from '../../components/admin/AdminCard';
import { AdminToast } from '../../components/admin/AdminToast';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ProfileEditor } from '../../components/admin/sections/ProfileEditor';
import { ProjectsEditor } from '../../components/admin/sections/ProjectsEditor';
import { BlogEditor } from '../../components/admin/sections/BlogEditor';
import { SkillsEditor } from '../../components/admin/sections/SkillsEditor';
import { TimelineEditor } from '../../components/admin/sections/TimelineEditor';
import { GuestbookEditor } from '../../components/admin/sections/GuestbookEditor';
import { NowPageEditor } from '../../components/admin/sections/NowPageEditor';
import { ImageGallery } from '../../components/admin/sections/ImageGallery';
import { Notifications } from '../../components/admin/sections/Notifications';
import { 
 LayoutDashboard, User, Folder, FileText, Layers, Clock, 
 MessageSquare, Radio, LogOut, Menu, ExternalLink, X,
 Check, Trash2, Image, Bell, Sun, Moon
} from 'lucide-react';

export default function Dashboard() {
 const { logout } = useAuth();
 const { theme, toggleTheme } = useTheme();
 const { documents: notifications } = useCollection('notifications');
 const unreadNotifCount = notifications ? notifications.filter(n => !n.read).length : 0;
 const [activeTab, setActiveTab] = useState('overview');
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
 // Data state
 const [stats, setStats] = useState({ projects: 0, posts: 0, pending: 0, skills: 0 });
 const [pendingGuestbook, setPendingGuestbook] = useState([]);
 
 // UI state
 const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
 const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, action: null });

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 try {
  const [projects, posts, skills, pending] = await Promise.all([
  getProjects(),
  getPublishedPosts(),
  getSkills(),
  getPendingGuestbook()
  ]);
  
  setStats({
  projects: projects.length,
  posts: posts.length,
  skills: skills.length,
  pending: pending.length
  });
  
  // Get up to 5 pending entries
  setPendingGuestbook(pending.slice(0, 5));
 } catch (error) {
  showToast("Error loading data", "error");
 }
 };

 const showToast = (message, type = 'success') => {
 setToast({ visible: true, message, type });
 };

 const handleApproveGuestbook = async (id) => {
 try {
  await updateGuestbookStatus(id, true);
  showToast("Entry approved successfully");
  loadData();
 } catch (error) {
  showToast("Failed to approve entry", "error");
 }
 };

 const handleDeleteGuestbook = async (id) => {
 setConfirmDialog({ isOpen: false, id: null, action: null });
 try {
  await deleteGuestbookEntry(id);
  showToast("Entry deleted successfully");
  loadData();
 } catch (error) {
  showToast("Failed to delete entry", "error");
 }
 };

 const navItems = [
 { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
 { id: 'profile', label: 'Profile & Photo', icon: <User size={20} /> },
 { id: 'projects', label: 'Projects', icon: <Folder size={20} /> },
 { id: 'blog', label: 'Blog Posts', icon: <FileText size={20} /> },
 { id: 'skills', label: 'Skills', icon: <Layers size={20} /> },
 { id: 'timeline', label: 'Timeline', icon: <Clock size={20} /> },
 { 
  id: 'guestbook', 
  label: 'Guestbook', 
  icon: <MessageSquare size={20} />,
  badge: stats.pending > 0 ? stats.pending : null
 },
 { id: 'now', label: 'Now Page', icon: <Radio size={20} /> },
 { id: 'gallery', label: 'Image Gallery', icon: <Image size={20} /> },
 { 
  id: 'notifications', 
  label: 'Notifications', 
  icon: <Bell size={20} />,
  badge: unreadNotifCount > 0 ? unreadNotifCount : null
 }
 ];

 const SidebarContent = () => (
 <div className="flex flex-col h-full bg-bg-surface text-ink-muted">
  <div className="p-6">
  <div className="flex items-center gap-4 mb-8">
   <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg font-display font-bold text-xl">
   A
   </div>
   <div>
   <h2 className="text-ink font-semibold">Aadhi</h2>
   <span className="text-xs px-2 py-0.5 rounded-full bg-bg-surface text-ink-muted uppercase tracking-wider font-medium">Admin</span>
   </div>
  </div>

  <nav className="space-y-1">
   {navItems.map((item) => (
   <button
    key={item.id}
    onClick={() => {
    setActiveTab(item.id);
    setIsMobileMenuOpen(false);
    }}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
    activeTab === item.id 
     ? 'bg-accent/10 text-accent border-l-2 border-accent' 
     : 'hover:bg-bg-surface hover:text-ink border-l-2 border-transparent'
    }`}
   >
    <div className="flex items-center gap-3">
    {item.icon}
    <span className="font-medium">{item.label}</span>
    </div>
    {item.badge && (
    <span className="bg-accent text-bg text-xs font-bold px-2 py-0.5 rounded-full">
     {item.badge}
    </span>
    )}
   </button>
   ))}
  </nav>
  </div>

  <div className="mt-auto p-6 space-y-2 border-t border-line">
  <button 
   onClick={toggleTheme}
   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-surface hover:text-ink transition-colors"
  >
   {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
   <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
  </button>
  <a 
   href="/" 
   target="_blank" 
   rel="noopener noreferrer"
   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-surface hover:text-ink transition-colors"
  >
   <ExternalLink size={20} />
   <span className="font-medium">View live site</span>
  </a>
  <button 
   onClick={logout}
   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
  >
   <LogOut size={20} />
   <span className="font-medium">Sign out</span>
  </button>
  </div>
 </div>
 );

 const renderOverview = () => (
 <div className="space-y-8 max-w-5xl">
  <h1 className="text-3xl font-display font-bold text-ink ">Dashboard Overview</h1>
  
  {/* Stat Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <AdminCard className="!p-6">
   <div className="flex items-center gap-4">
   <div className="p-3 bg-bg-surface rounded-lg text-accent"><Folder size={24} /></div>
   <div>
    <p className="text-sm text-ink-muted font-medium uppercase tracking-wider">Projects</p>
    <p className="text-3xl font-bold text-ink ">{stats.projects}</p>
   </div>
   </div>
  </AdminCard>
  
  <AdminCard className="!p-6">
   <div className="flex items-center gap-4">
   <div className="p-3 bg-bg-surface rounded-lg text-accent"><FileText size={24} /></div>
   <div>
    <p className="text-sm text-ink-muted font-medium uppercase tracking-wider">Published Posts</p>
    <p className="text-3xl font-bold text-ink ">{stats.posts}</p>
   </div>
   </div>
  </AdminCard>

  <AdminCard className={`!p-6 ${stats.pending > 0 ? 'border-accent/30 bg-accent/5' : ''}`}>
   <div className="flex items-center gap-4">
   <div className={`p-3 rounded-lg ${stats.pending > 0 ? 'bg-accent/20 text-accent' : 'bg-bg-surface text-ink-muted'}`}>
    <MessageSquare size={24} />
   </div>
   <div>
    <p className="text-sm text-ink-muted font-medium uppercase tracking-wider">Pending Entries</p>
    <p className={`text-3xl font-bold ${stats.pending > 0 ? 'text-accent' : 'text-ink '}`}>{stats.pending}</p>
   </div>
   </div>
  </AdminCard>

  <AdminCard className="!p-6">
   <div className="flex items-center gap-4">
   <div className="p-3 bg-bg-surface rounded-lg text-accent"><Layers size={24} /></div>
   <div>
    <p className="text-sm text-ink-muted font-medium uppercase tracking-wider">Skill Categories</p>
    <p className="text-3xl font-bold text-ink ">{stats.skills}</p>
   </div>
   </div>
  </AdminCard>
  </div>

  {/* Recent Guestbook */}
  <AdminCard title="Recent Pending Guestbook Entries">
  {pendingGuestbook.length === 0 ? (
   <div className="text-center py-8 text-ink-muted">
   <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
   <p>No pending entries to review.</p>
   </div>
  ) : (
   <div className="space-y-4">
   {pendingGuestbook.map(entry => (
    <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-bg-surface rounded-lg border border-line">
    <div>
     <h4 className="font-bold text-ink mb-1">{entry.name}</h4>
     <p className="text-ink-muted text-sm">{entry.message}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
     <button 
     onClick={() => handleApproveGuestbook(entry.id)}
     className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-ink rounded-lg transition-colors"
     title="Approve"
     >
     <Check size={18} />
     </button>
     <button 
     onClick={() => setConfirmDialog({ isOpen: true, id: entry.id, action: 'delete' })}
     className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-ink rounded-lg transition-colors"
     title="Delete"
     >
     <Trash2 size={18} />
     </button>
    </div>
    </div>
   ))}
   </div>
  )}
  </AdminCard>
 </div>
 );

 return (
 <div className="min-h-screen bg-bg flex">
  {/* Mobile Header & Overlay */}
  <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-bg-surface border-b border-line z-40 flex items-center justify-between px-4">
  <span className="font-display font-bold text-xl text-ink ">
   aadhi<span className="text-accent">.</span>life <span className="text-accent text-xs font-semibold uppercase tracking-wider ml-1 bg-accent/10 px-2 py-0.5 rounded-md">admin</span>
  </span>
  <div className="flex items-center gap-2">
   <button 
   onClick={toggleTheme} 
   className="p-2 text-ink-muted hover:text-ink transition-colors"
   aria-label="Toggle Theme"
   >
   {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
   </button>
   <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-ink-muted ">
   <Menu size={24} />
   </button>
  </div>
  </div>

  {isMobileMenuOpen && (
  <div className="md:hidden fixed inset-0 z-50 flex">
   <div className="w-64 relative bg-bg-surface border-r border-line">
   <button 
    onClick={() => setIsMobileMenuOpen(false)}
    className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink "
   >
    <X size={24} />
   </button>
   <SidebarContent />
   </div>
   <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
  </div>
  )}

  {/* Desktop Sidebar */}
  <aside className="hidden md:block w-[240px] fixed inset-y-0 left-0 border-r border-line z-30">
  <SidebarContent />
  </aside>

  {/* Main Content Area */}
  <main className="flex-1 md:ml-[240px] p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
  {activeTab === 'overview' && renderOverview()}
  {activeTab === 'profile' && <ProfileEditor showToast={showToast} />}
  {activeTab === 'projects' && <ProjectsEditor showToast={showToast} />}
  {activeTab === 'blog' && <BlogEditor showToast={showToast} />}
  {activeTab === 'skills' && <SkillsEditor showToast={showToast} />}
  {activeTab === 'timeline' && <TimelineEditor showToast={showToast} />}
  {activeTab === 'guestbook' && <GuestbookEditor showToast={showToast} />}
  {activeTab === 'now' && <NowPageEditor showToast={showToast} />}
  {activeTab === 'gallery' && <ImageGallery />}
  {activeTab === 'notifications' && <Notifications showToast={showToast} />}
  
  {![
   'overview', 'profile', 'projects', 'blog', 
   'skills', 'timeline', 'guestbook', 'now', 'gallery', 'notifications'
  ].includes(activeTab) && (
   <div className="text-center py-20 text-ink-muted">
   <h2 className="text-2xl font-bold text-ink mb-2 capitalize">{activeTab} Management</h2>
   <p>This module is coming in the next build phase.</p>
   </div>
  )}
  </main>

  <AdminToast 
  visible={toast.visible} 
  message={toast.message} 
  type={toast.type} 
  onClose={() => setToast({ ...toast, visible: false })} 
  />

  <ConfirmDialog
  isOpen={confirmDialog.isOpen}
  title="Delete Guestbook Entry"
  message="Are you sure you want to delete this message? This action cannot be undone."
  confirmText="Delete"
  isDestructive={true}
  onCancel={() => setConfirmDialog({ isOpen: false, id: null, action: null })}
  onConfirm={() => handleDeleteGuestbook(confirmDialog.id)}
  />
 </div>
 );
}
