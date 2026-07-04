import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCollection } from '../../hooks/useFirestore';
import { useTheme } from '../../context/ThemeContext';
import { 
  getProjects, 
  getPublishedPosts, 
  getSkills, 
  getPendingGuestbook,
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
  Check, Trash2, Image, Bell, Sun, Moon, ArrowRight, Activity, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'profile', label: 'Profile & Photo', icon: <User size={18} /> },
    { id: 'projects', label: 'Projects', icon: <Folder size={18} /> },
    { id: 'blog', label: 'Blog Posts', icon: <FileText size={18} /> },
    { id: 'skills', label: 'Skills', icon: <Layers size={18} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={18} /> },
    { 
      id: 'guestbook', 
      label: 'Guestbook', 
      icon: <MessageSquare size={18} />,
      badge: stats.pending > 0 ? stats.pending : null
    },
    { id: 'now', label: 'Now Page', icon: <Radio size={18} /> },
    { id: 'gallery', label: 'Image Gallery', icon: <Image size={18} /> },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: <Bell size={18} />,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-bg-surface text-ink-muted border-r border-line/60">
      
      {/* Branding Header */}
      <div className="p-6 border-b border-line/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-accent-light flex items-center justify-center text-bg font-display font-black text-lg select-none shadow-md shadow-accent/10">
            A
          </div>
          <div>
            <h1 className="text-ink font-display font-bold text-base leading-none">aadhi.life</h1>
            <span className="text-[9px] font-mono text-accent uppercase tracking-wider font-semibold">CMS Panel</span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold border ${
                isActive 
                  ? 'bg-accent/10 border-accent/20 text-accent shadow-sm' 
                  : 'border-transparent hover:bg-bg-hover hover:text-ink text-ink-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-accent' : 'text-ink-muted/70 group-hover:text-ink transition-colors'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-accent text-bg text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-line/50 space-y-2 shrink-0 bg-bg-surface/50">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-bg-hover hover:text-ink transition-colors text-xs font-semibold"
        >
          {theme === 'dark' ? <Sun size={16} className="text-accent" /> : <Moon size={16} className="text-accent" />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-bg-hover hover:text-ink transition-colors text-xs font-semibold"
        >
          <ExternalLink size={16} className="text-ink-muted/60" />
          <span>Live Portfolio</span>
        </a>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/5 hover:text-red-500 transition-colors text-xs font-semibold border border-transparent hover:border-red-500/10"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-tight">Welcome, Aadhi</h2>
        <p className="text-sm text-ink-muted mt-1 leading-relaxed">Here's a snapshot of your portfolio metrics and pending updates.</p>
      </div>
      
      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: stats.projects, icon: <Folder size={20} />, col: 'text-blue-400 bg-blue-500/5' },
          { label: 'Blog Posts', value: stats.posts, icon: <FileText size={20} />, col: 'text-emerald-400 bg-emerald-500/5' },
          { label: 'Skills', value: stats.skills, icon: <Layers size={20} />, col: 'text-amber-400 bg-amber-500/5' },
          { label: 'Pending Messages', value: stats.pending, icon: <MessageSquare size={20} />, col: stats.pending > 0 ? 'text-accent bg-accent/10 border border-accent/20 animate-pulse' : 'text-ink-muted bg-bg-surface' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-bg-surface border border-line rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-line-strong transition-all duration-200 shadow-sm">
            <div className={`p-2.5 rounded-xl shrink-0 ${stat.col}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider font-mono">{stat.label}</p>
              <p className="text-2xl font-bold text-ink mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main split row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Pending comments */}
        <div className="lg:col-span-8">
          <AdminCard title="Pending Guestbook Entries">
            {pendingGuestbook.length === 0 ? (
              <div className="text-center py-10 text-ink-muted">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs">No pending messages to moderate.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingGuestbook.map(entry => (
                  <div key={entry.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 bg-bg rounded-xl border border-line hover:border-line-strong transition-colors">
                    <div>
                      <h4 className="font-bold text-ink text-sm mb-1">{entry.name}</h4>
                      <p className="text-ink-muted text-xs leading-relaxed">"{entry.message}"</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleApproveGuestbook(entry.id)}
                        className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-ink rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setConfirmDialog({ isOpen: true, id: entry.id, action: 'delete' })}
                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-ink rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>

        {/* Right: Quick actions */}
        <div className="lg:col-span-4 space-y-6">
          <AdminCard title="Quick Actions">
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('blog')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-bg border border-line hover:bg-bg-hover hover:border-accent/40 text-left text-xs font-semibold transition-all group"
              >
                <span className="flex items-center gap-2 text-ink">
                  <Plus size={14} className="text-accent" /> Create New Blog Post
                </span>
                <ArrowRight size={12} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={() => setActiveTab('projects')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-bg border border-line hover:bg-bg-hover hover:border-accent/40 text-left text-xs font-semibold transition-all group"
              >
                <span className="flex items-center gap-2 text-ink">
                  <Plus size={14} className="text-accent" /> Add Project Card
                </span>
                <ArrowRight size={12} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={() => setActiveTab('gallery')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-bg border border-line hover:bg-bg-hover hover:border-accent/40 text-left text-xs font-semibold transition-all group"
              >
                <span className="flex items-center gap-2 text-ink">
                  <Image size={14} className="text-accent" /> Upload Media Gallery
                </span>
                <ArrowRight size={12} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex font-body">
      
      {/* Mobile Top Nav bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-bg-surface border-b border-line/60 z-40 flex items-center justify-between px-4 shadow-sm">
        <span className="font-display font-black text-lg text-ink">
          aadhi<span className="text-accent">.</span>life <span className="text-accent text-[9px] font-mono font-semibold uppercase tracking-wider ml-1.5 bg-accent/15 px-2 py-0.5 rounded">CMS</span>
        </span>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 text-ink-muted hover:text-ink transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Sliding Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-64 relative bg-bg-surface z-10"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:block w-[240px] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Content wrapper */}
      <main className="flex-1 md:ml-[240px] p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-bg relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
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
          </motion.div>
        </AnimatePresence>
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
        isDestructive
        onCancel={() => setConfirmDialog({ isOpen: false, id: null, action: null })}
        onConfirm={() => handleDeleteGuestbook(confirmDialog.id)}
      />
    </div>
  );
}
