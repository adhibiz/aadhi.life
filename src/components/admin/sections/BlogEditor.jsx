import React, { useState, useEffect, useRef } from 'react';
import { collection, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../hooks/useFirestore';
import { AdminCard } from '../AdminCard';
import { ConfirmDialog } from '../ConfirmDialog';
import { FileUploader } from '../../ui/FileUploader';
import { deleteFile } from '../../../cloudinary/upload';
import { 
  Bold, Italic, Underline, List, Heading, Code, Quote, Link as LinkIcon, Image as ImageIcon, 
  Maximize2, Minimize2, Sparkles, TrendingUp, Eye, Settings, MessageSquare, Heart, Share2, 
  RotateCcw, History, User, Search, Trash2, Pin, Star, Check, AlertCircle, ArrowLeft, BookOpen, Send, Loader2, Edit2, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';

const CATEGORIES = ['Personal', 'Tech', 'Leadership'];

/* Cloudinary transformations for mini thumbnail image preview */
const Thumb = ({ url, title }) => {
  const src = url?.replace('/upload/', '/upload/w_80,h_45,c_fill,q_auto,f_auto/');
  return src ? (
    <img src={src} alt={title} className="w-10 h-7 object-cover rounded border border-line shrink-0" />
  ) : (
    <div className="w-10 h-7 rounded border border-line bg-bg-surface flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-ink-muted/40 select-none">
        {title?.substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

const EMPTY_POST = {
  title: '',
  slug: '',
  category: 'Personal',
  read_time: '5 min',
  published_date: '',
  excerpt: '',
  body: '',
  cover_image_url: '',
  cover_image_public_id: '',
  published: false,
  views: 0,
  likes: 0,
  shares: 0,
  comments: []
};

export const BlogEditor = ({ showToast }) => {
  const { documents: posts, loading } = useCollection('blog_posts');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
  
  // Custom CMS Editor States
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [searchComment, setSearchComment] = useState('');
  const [sortCommentOrder, setSortCommentOrder] = useState('newest');
  const [replyInputs, setReplyInputs] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, publicId: null });
  
  const textareaRef = useRef(null);

  // Auto-save logic simulator
  useEffect(() => {
    if (!isEditing || !isDirty) return;
    
    setAutoSaveStatus('Saving...');
    const timer = setTimeout(() => {
      setAutoSaveStatus('Saved locally');
      setIsDirty(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData?.body, formData?.title, formData?.slug, isDirty, isEditing]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
    const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
    return timeB - timeA;
  });

  const handleAddNew = () => {
    setFormData({
      ...EMPTY_POST,
      published_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setIsEditing(true);
    setIsDirty(false);
    setAutoSaveStatus('Saved');
  };

  const handleEdit = (post) => {
    setFormData({
      views: post.views || 0,
      likes: post.likes || 0,
      shares: post.shares || 0,
      comments: post.comments || [],
      published: post.published ?? false,
      ...post
    });
    setIsEditing(true);
    setIsDirty(false);
    setAutoSaveStatus('Saved');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const handleUploadComplete = ({ secureUrl, publicId }) => {
    setFormData(prev => ({
      ...prev,
      cover_image_url: secureUrl,
      cover_image_public_id: publicId
    }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const handleDeleteImage = async () => {
    if (formData.cover_image_public_id) {
      await deleteFile(formData.cover_image_public_id, 'image');
    }
    setFormData(prev => ({
      ...prev,
      cover_image_url: '',
      cover_image_public_id: ''
    }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.slug) return showToast('Title and Slug are required', 'error');

    setIsSaving(true);
    try {
      if (formData.id) {
        // Edit
        const docRef = doc(db, 'blog_posts', formData.id);
        const { id, ...dataToSave } = formData;
        await updateDoc(docRef, dataToSave);
        showToast('Changes saved successfully');
      } else {
        // Create new
        await addDoc(collection(db, 'blog_posts'), {
          ...formData,
          created_at: serverTimestamp()
        });
        showToast('Blog post created successfully');
      }
      setIsEditing(false);
      setFormData(null);
      setIsDirty(false);
      setAutoSaveStatus('Saved');
    } catch (error) {
      console.error(error);
      showToast('Failed to save blog post', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (id, publicId) => {
    setConfirmDelete({ isOpen: false, id: null, publicId: null });
    try {
      if (publicId) await deleteFile(publicId, 'image');
      await deleteDoc(doc(db, 'blog_posts', id));
      showToast('Blog post deleted successfully');
    } catch (e) {
      console.error(e);
      showToast('Failed to delete post', 'error');
    }
  };

  const insertFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    setFormData(prev => ({
      ...prev,
      body: text.substring(0, start) + replacement + text.substring(end)
    }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const textBody = formData?.body || '';
  const charCount = textBody.length;
  const wordCount = textBody.split(/\s+/).filter(Boolean).length;
  const readTimeEst = `${Math.max(1, Math.ceil(wordCount / 200))} min`;

  // Comment Actions
  const handlePinComment = async (commentId) => {
    const updatedComments = formData.comments.map(c => 
      c.id === commentId ? { ...c, pinned: !c.pinned } : c
    );
    setFormData(prev => ({ ...prev, comments: updatedComments }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const handleFeatureComment = async (commentId) => {
    const updatedComments = formData.comments.map(c => 
      c.id === commentId ? { ...c, featured: !c.featured } : c
    );
    setFormData(prev => ({ ...prev, comments: updatedComments }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const handleDeleteComment = async (commentId) => {
    const updatedComments = formData.comments.filter(c => c.id !== commentId);
    setFormData(prev => ({ ...prev, comments: updatedComments }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const handleSendReply = (commentId) => {
    const replyText = replyInputs[commentId];
    if (!replyText?.trim()) return;

    const updatedComments = formData.comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...(c.replies || []),
            {
              id: `r-${Date.now()}`,
              name: 'Aadhi (Author)',
              comment: replyText,
              date: 'Just now'
            }
          ]
        };
      }
      return c;
    });

    setFormData(prev => ({ ...prev, comments: updatedComments }));
    setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
    setIsDirty(true);
    setAutoSaveStatus('Unsaved Changes');
  };

  const filteredComments = (formData?.comments || [])
    .filter(c => 
      c.name.toLowerCase().includes(searchComment.toLowerCase()) ||
      c.comment.toLowerCase().includes(searchComment.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-ink">Blog Editor Panel</h2>
            <button
              onClick={handleAddNew}
              className="bg-accent text-bg px-4 py-2 rounded-lg font-semibold hover:bg-accent-light transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> New Post
            </button>
          </div>

          <AdminCard className="overflow-hidden p-0">
            <div className="w-full">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-line bg-bg-surface/30 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                <div className="col-span-1" />
                <div className="col-span-5">Post Title</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {sortedPosts.length === 0 && (
                <div className="p-8 text-center text-ink-muted text-sm">
                  No blog posts yet. Click "New Post" to start writing.
                </div>
              )}

              {sortedPosts.map((post) => (
                <div key={post.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-line/50 hover:bg-bg-surface/20 transition-colors last:border-b-0">
                  <div className="col-span-1">
                    <Thumb url={post.cover_image_url} title={post.title} />
                  </div>
                  <div className="col-span-5 font-medium text-ink truncate pr-4">
                    {post.title}
                  </div>
                  <div className="col-span-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-bg-hover/30 text-ink-muted border-line">
                      {post.category || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {post.published ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-green-500/10 text-green-400 border-green-500/20">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-bg-hover text-ink-muted">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ isOpen: true, id: post.id, publicId: post.cover_image_public_id })}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <ConfirmDialog
            isOpen={confirmDelete.isOpen}
            title="Delete Post"
            message="Are you sure you want to delete this blog post? This will permanently delete the post and its cover image."
            confirmText="Delete"
            isDestructive
            onCancel={() => setConfirmDelete({ isOpen: false, id: null, publicId: null })}
            onConfirm={() => handleDeleteConfirm(confirmDelete.id, confirmDelete.publicId)}
          />
        </>
      ) : (
        <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-bg p-6 overflow-y-auto' : ''}`}>
          
          {/* STICKY EDITOR HEADER */}
          <div className="sticky top-0 bg-bg/85 backdrop-blur-md z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-line">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to go back?')) return;
                  setIsEditing(false);
                  setFormData(null);
                }} 
                className="p-2 rounded-lg hover:bg-bg-surface text-ink-muted hover:text-ink transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-display font-bold text-ink truncate max-w-xs md:max-w-md">
                  {formData.title || 'Untitled Post'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${autoSaveStatus === 'Saved' || autoSaveStatus === 'Saved locally' ? 'bg-green-500' : autoSaveStatus === 'Saving...' ? 'bg-accent animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs text-ink-muted font-medium">{autoSaveStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVersionHistory(true)}
                className="px-4 py-2 border border-line hover:bg-bg-surface text-ink rounded-lg transition-colors font-semibold text-sm flex items-center gap-2"
              >
                <History size={16} />
                <span>History</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 border border-line hover:bg-bg-surface text-ink rounded-lg transition-colors"
                title="Fullscreen Toggle"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <select
                name="published"
                value={formData.published ? 'true' : 'false'}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, published: e.target.value === 'true' }));
                  setIsDirty(true);
                  setAutoSaveStatus('Unsaved Changes');
                }}
                className="bg-bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent cursor-pointer font-semibold"
              >
                <option value="false">📁 Draft</option>
                <option value="true">🌐 Published</option>
              </select>
              <button
                onClick={handleSave}
                className="bg-accent text-bg px-6 py-2 rounded-lg font-semibold hover:bg-accent-light transition-all flex items-center gap-2 text-sm shadow-lg shadow-accent/15"
              >
                <Check size={16} />
                <span>Save Post</span>
              </button>
            </div>
          </div>

          {/* TWO COLUMN CMS LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN - ADVANCED EDITOR */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cover Image Upload Card */}
              <AdminCard title="Cover Image">
                <FileUploader 
                  folder="blog"
                  currentUrl={formData.cover_image_url}
                  currentPublicId={formData.cover_image_public_id}
                  onUploadComplete={handleUploadComplete}
                  onDelete={handleDeleteImage}
                  accept="image/*"
                  label="Upload blog cover image (16:9 recommended)"
                />
              </AdminCard>

              {/* Title & Slug */}
              <AdminCard title="Identity">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">Blog Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter a compelling title..."
                      className="w-full bg-bg-surface/40 border border-line rounded-lg px-4 py-3 text-lg font-semibold text-ink focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">URL Slug</label>
                    <div className="flex rounded-lg overflow-hidden border border-line">
                      <span className="bg-bg-surface px-3 py-2 text-sm text-ink-muted flex items-center border-r border-line font-mono select-none">
                        aadhi.life/blog/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="why-i-left-school"
                        className="w-full bg-bg-surface/40 px-4 py-2 text-sm text-ink focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">Read Time</label>
                      <input
                        type="text"
                        name="read_time"
                        value={formData.read_time}
                        onChange={handleChange}
                        placeholder="5 min"
                        className="w-full bg-bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">Excerpt / Short Description</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Brief excerpt summing up the post..."
                      className="w-full bg-bg-surface/40 border border-line rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent resize-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">Demo Video URL (optional)</label>
                    <input
                      type="url"
                      name="video_url"
                      value={formData.video_url || ''}
                      onChange={handleChange}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-bg-surface/40 border border-line rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </AdminCard>

              {/* Markdown Rich Editor Card */}
              <div className="glass-card rounded-2xl border border-line overflow-hidden shadow-md flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-bg-surface/20 flex-wrap gap-4">
                  <h3 className="font-semibold text-lg text-ink flex items-center gap-2">
                    <BookOpen size={18} className="text-accent" />
                    <span>Story Content</span>
                  </h3>
                  <div className="flex items-center gap-2 bg-bg-surface p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!showPreview ? 'bg-accent text-bg shadow-sm' : 'text-ink-muted'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${showPreview ? 'bg-accent text-bg shadow-sm' : 'text-ink-muted'}`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {!showPreview ? (
                  <div className="flex flex-col">
                    {/* Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-2 bg-bg-surface/30 border-b border-line overflow-x-auto">
                      <button type="button" onClick={() => insertFormatting('# ')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="H1"><Heading size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('## ')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink font-bold text-xs" title="H2">H2</button>
                      <div className="w-[1px] h-6 bg-bg-hover mx-1" />
                      <button type="button" onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Bold"><Bold size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Italic"><Italic size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('<u>', '</u>')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Underline"><Underline size={16} /></button>
                      <div className="w-[1px] h-6 bg-bg-hover mx-1" />
                      <button type="button" onClick={() => insertFormatting('- ')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Bullet List"><List size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1 | Cell 2 |\n')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink font-bold text-xs" title="Table">Table</button>
                      <div className="w-[1px] h-6 bg-bg-hover mx-1" />
                      <button type="button" onClick={() => insertFormatting('\n```javascript\n', '\n```\n')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Code Block"><Code size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('> ')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Blockquote"><Quote size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('[', '](https://)')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Hyperlink"><LinkIcon size={16} /></button>
                      <button type="button" onClick={() => insertFormatting('![Image Description](', ')')} className="p-2 hover:bg-bg-surface rounded text-ink-muted hover:text-ink " title="Image Tag"><ImageIcon size={16} /></button>
                    </div>
                    {/* Textarea */}
                    <textarea
                      ref={textareaRef}
                      name="body"
                      value={formData.body}
                      onChange={handleChange}
                      rows={22}
                      placeholder="Start writing in Markdown..."
                      className="w-full bg-transparent px-6 py-6 text-ink focus:outline-none font-mono text-sm leading-relaxed resize-y min-h-[300px]"
                    />
                  </div>
                ) : (
                  <div className="p-8 prose dark:prose-invert prose-accent max-w-none max-h-[600px] overflow-y-auto bg-bg-surface">
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(formData.body || '*No content yet. Start writing!*') }} />
                  </div>
                )}

                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between px-6 py-3 border-t border-line bg-bg-surface/10 text-xs text-ink-muted font-medium gap-4">
                  <div className="flex gap-4">
                    <span><strong>Words:</strong> {wordCount}</span>
                    <span><strong>Characters:</strong> {charCount}</span>
                    <span><strong>Est. Read Time:</strong> {readTimeEst}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-accent">Markdown Mode Enabled</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - ANALYTICS & COMMENTS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-surface border border-line p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Eye size={20} /></div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Views</p>
                    <p className="text-xl font-bold text-ink mt-0.5">{formData.views}</p>
                  </div>
                </div>

                <div className="bg-bg-surface border border-line p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500"><Heart size={20} /></div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Likes</p>
                    <p className="text-xl font-bold text-ink mt-0.5">{formData.likes}</p>
                  </div>
                </div>

                <div className="bg-bg-surface border border-line p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-500"><Share2 size={20} /></div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Shares</p>
                    <p className="text-xl font-bold text-ink mt-0.5">{formData.shares}</p>
                  </div>
                </div>

                <div className="bg-bg-surface border border-line p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent"><MessageSquare size={20} /></div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Comments</p>
                    <p className="text-xl font-bold text-ink mt-0.5">{formData.comments?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* COMMENTS MANAGEMENT */}
              <div className="glass-card rounded-2xl border border-line overflow-hidden shadow-md flex flex-col">
                <div className="px-6 py-4 border-b border-line bg-bg-surface/20 space-y-4">
                  <h3 className="font-semibold text-lg text-ink flex items-center gap-2">
                    <MessageSquare size={18} className="text-accent" />
                    <span>Manage Comments</span>
                  </h3>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
                      <input
                        type="text"
                        placeholder="Search comments..."
                        value={searchComment}
                        onChange={(e) => setSearchComment(e.target.value)}
                        className="w-full bg-bg-surface/60 border border-line rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink focus:outline-none"
                      />
                    </div>
                    <select
                      value={sortCommentOrder}
                      onChange={(e) => setSortCommentOrder(e.target.value)}
                      className="bg-bg-surface/60 border border-line rounded-lg px-2 py-1.5 text-xs text-ink cursor-pointer focus:outline-none"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>

                {/* Comments List */}
                <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
                  {filteredComments.length === 0 ? (
                    <p className="text-xs text-ink-muted text-center py-8">No comments found.</p>
                  ) : (
                    filteredComments.map(comment => (
                      <div key={comment.id} className="p-3 bg-bg-surface/30 border border-line rounded-xl space-y-2 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center font-bold text-xs">
                              {comment.avatar}
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-ink flex items-center gap-1.5">
                                <span>{comment.name}</span>
                                {comment.pinned && <Pin size={10} className="text-accent rotate-45" />}
                                {comment.featured && <Star size={10} className="text-yellow-500 fill-yellow-500" />}
                              </h4>
                              <span className="text-[9px] text-ink-muted">{comment.date}</span>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button 
                              onClick={() => handlePinComment(comment.id)} 
                              className={`p-1 rounded hover:bg-bg-hover text-ink-muted ${comment.pinned ? 'text-accent' : ''}`}
                              title={comment.pinned ? 'Unpin' : 'Pin to Top'}
                            >
                              <Pin size={12} className={comment.pinned ? 'rotate-45' : ''} />
                            </button>
                            <button 
                              onClick={() => handleFeatureComment(comment.id)} 
                              className={`p-1 rounded hover:bg-bg-hover text-ink-muted ${comment.featured ? 'text-yellow-500' : ''}`}
                              title={comment.featured ? 'Remove Featured' : 'Mark as Featured'}
                            >
                              <Star size={12} className={comment.featured ? 'fill-yellow-500 text-yellow-500' : ''} />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)} 
                              className="p-1 rounded hover:bg-red-500/10 text-ink-muted hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-ink/80 leading-relaxed font-body pl-9">
                          {comment.comment}
                        </p>

                        {comment.replies?.map(r => (
                          <div key={r.id} className="ml-9 p-2.5 bg-bg-surface/60 border-l-2 border-accent rounded-lg text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[10px] text-accent">{r.name}</span>
                              <span className="text-[8px] text-ink-muted">{r.date}</span>
                            </div>
                            <p className="text-ink-muted/90 font-body">{r.comment}</p>
                          </div>
                        ))}

                        <div className="pl-9 pt-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a reply..."
                            value={replyInputs[comment.id] || ''}
                            onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment.id]: e.target.value }))}
                            className="w-full bg-bg-surface border border-line rounded px-2.5 py-1 text-xs text-ink focus:outline-none"
                          />
                          <button
                            onClick={() => handleSendReply(comment.id)}
                            className="bg-accent text-bg px-2 py-1 rounded hover:bg-accent-light transition-colors"
                          >
                            <Send size={10} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VERSION HISTORY DIALOG */}
      <AnimatePresence>
        {showVersionHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setShowVersionHistory(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-bg-surface border border-line rounded-2xl overflow-hidden shadow-2xl z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-line bg-bg-surface/20">
                <h3 className="font-semibold text-lg text-ink flex items-center gap-2">
                  <History className="text-accent" size={18} />
                  <span>Version History</span>
                </h3>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink "
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
                <div className="flex items-start gap-3 p-3 bg-accent/5 border border-accent/30 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ink ">Draft 3 (Current Version)</h4>
                    <p className="text-xs text-ink-muted mt-0.5">Last saved locally just now by Aadhi</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-bg-surface/30 border border-line rounded-xl cursor-pointer transition-colors">
                  <span className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ink ">Draft 2 (Stable Build)</h4>
                    <p className="text-xs text-ink-muted mt-0.5">Saved on Jul 1, 2026, 4:50 PM by Aadhi</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
