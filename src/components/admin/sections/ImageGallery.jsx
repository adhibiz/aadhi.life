import React, { useState, useCallback } from 'react';
import { useCollection, useDocument } from '../../../hooks/useFirestore';
import {
  Search, Grid3X3, LayoutList, Eye, Link2, Calendar,
  Loader2, X, Image as ImageIcon, Copy, Check, ChevronLeft,
  ChevronRight, Layers, User, FileText, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Type badge colors ────────────────────────────────────────── */
const TYPE_META = {
  Profile:    { bg: 'rgba(139, 92, 246, 0.08)', text: 'text-violet-400', border: 'border-violet-500/20', icon: User },
  Project:    { bg: 'rgba(59, 130, 246, 0.08)',   text: 'text-blue-400',   border: 'border-blue-500/20',   icon: Layers },
  'Blog Post':{ bg: 'rgba(16, 185, 129, 0.08)', text: 'text-emerald-400',border: 'border-emerald-500/20',icon: FileText },
};

const TypeBadge = ({ type }) => {
  const meta = TYPE_META[type] || { bg: 'rgba(212, 168, 83, 0.08)', text: 'text-accent', border: 'border-accent/20', icon: ImageIcon };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
      <Icon size={9} />
      {type}
    </span>
  );
};

/* ── Copy-URL button with tick feedback ─────────────────────── */
const CopyButton = ({ url }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-200 ${
        copied
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
          : 'bg-[#111] text-ink-muted border-line hover:text-accent hover:border-accent/30'
      }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied to Clipboard!' : 'Copy Direct Link'}
    </button>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
export const ImageGallery = () => {
  const { documents: projects,  loading: loadingProjects } = useCollection('projects');
  const { documents: posts,     loading: loadingPosts }    = useCollection('blog_posts');
  const { document: profile,    loading: loadingProfile }  = useDocument('site_meta', 'profile');

  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedType,   setSelectedType]   = useState('All');
  const [viewMode,       setViewMode]       = useState('grid'); // 'grid' | 'list'
  const [selectedImage,  setSelectedImage]  = useState(null);
  const [lightboxIndex,  setLightboxIndex]  = useState(0);
  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 12;

  const loading = loadingProjects || loadingPosts || loadingProfile;

  /* ── Aggregate images ───────────────────────────────────────── */
  const imagesMap = {};
  const addImage = (url, publicId, entityType, recordName, recordId, uploadDate) => {
    if (!url?.trim()) return;
    const cleanUrl = url.trim();
    if (!imagesMap[cleanUrl]) {
      const filename = publicId ? publicId.split('/').pop() : cleanUrl.split('/').pop() || 'image';
      imagesMap[cleanUrl] = { url: cleanUrl, publicId: publicId || '', filename, uploadDate: uploadDate || '—', usages: [] };
    }
    const exists = imagesMap[cleanUrl].usages.some(u => u.entityType === entityType && u.recordId === recordId);
    if (!exists) imagesMap[cleanUrl].usages.push({ entityType, recordName, recordId });
  };

  if (profile?.profile_image_url) {
    addImage(profile.profile_image_url, profile.profile_image_public_id, 'Profile', `${profile.name || 'Profile'} (Avatar)`, 'profile', null);
  }
  if (profile?.about_image_url) {
    addImage(profile.about_image_url, profile.about_image_public_id, 'Profile', `${profile.name || 'Profile'} (About Portrait)`, 'about_profile', null);
  }

  projects?.forEach(proj => {
    if (proj.cover_image_url)
      addImage(proj.cover_image_url, proj.cover_image_public_id, 'Project', proj.title, proj.id,
        proj.created_at?.toDate?.()?.toLocaleDateString() || null);
  });

  posts?.forEach(post => {
    if (post.cover_image_url)
      addImage(post.cover_image_url, post.cover_image_public_id, 'Blog Post', post.title, post.id,
        post.created_at?.toDate?.()?.toLocaleDateString() || post.published_date || null);
  });

  const allImages = Object.values(imagesMap);

  /* ── Filter ─────────────────────────────────────────────────── */
  const filteredImages = allImages.filter(img => {
    const q = searchQuery.toLowerCase();
    const matchSearch = img.filename.toLowerCase().includes(q) ||
      img.usages.some(u => u.recordName.toLowerCase().includes(q));
    const matchType = selectedType === 'All' || img.usages.some(u => u.entityType === selectedType);
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const currentItems = filteredImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ── Lightbox navigation ───────────────────────────────────── */
  const openLightbox = useCallback((img) => {
    const idx = filteredImages.findIndex(i => i.url === img.url);
    setLightboxIndex(idx);
    setSelectedImage(img);
  }, [filteredImages]);

  const lightboxPrev = () => {
    const prev = (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    setLightboxIndex(prev);
    setSelectedImage(filteredImages[prev]);
  };
  const lightboxNext = () => {
    const next = (lightboxIndex + 1) % filteredImages.length;
    setLightboxIndex(next);
    setSelectedImage(filteredImages[next]);
  };

  /* ── Stat counts ─────────────────────────────────────────────── */
  const counts = { All: allImages.length, Profile: 0, Project: 0, 'Blog Post': 0 };
  allImages.forEach(img => img.usages.forEach(u => { if (counts[u.entityType] !== undefined) counts[u.entityType]++; }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-accent/15 animate-spin border-t-accent" />
        <ImageIcon size={22} className="absolute inset-0 m-auto text-accent/60" />
      </div>
      <p className="text-xs font-mono text-ink-muted">Loading asset library…</p>
    </div>
  );

  const FILTERS = ['All', 'Profile', 'Project', 'Blog Post'];

  return (
    <div className="space-y-6 max-w-6xl">
      <style>{`
        .ig-card {
          background: rgba(255, 255, 255, 0.02);
          border: 0.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          transition: all 300ms ease;
        }
        .ig-card:hover {
          border-color: rgba(212, 168, 83, 0.25);
          background: rgba(255, 255, 255, 0.035);
        }
        .ig-thumb-glow {
          box-shadow: inset 0 0 40px rgba(0,0,0,0.8);
        }
        .ig-lightbox {
          background: rgba(10, 10, 14, 0.96);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div>
          <h2 className="text-2xl font-display font-bold text-ink flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-accent/8 border border-accent/18">
              <ImageIcon size={20} className="text-accent" />
            </span>
            Asset Library
          </h2>
          <p className="text-xs font-mono text-ink-muted mt-1.5 ml-1">
            Displaying {allImages.length} image{allImages.length !== 1 ? 's' : ''} hosted on Cloudinary
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-line rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-accent text-bg shadow-sm font-semibold' : 'text-ink-muted hover:text-ink'}`}
            title="Grid View"
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-accent text-bg shadow-sm font-semibold' : 'text-ink-muted hover:text-ink'}`}
            title="List View"
          >
            <LayoutList size={15} />
          </button>
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col md:flex-row gap-3 p-3.5 bg-bg-surface border border-line rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by filename or record name…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-bg border border-line rounded-xl pl-10 pr-9 py-2.5 text-sm text-ink placeholder-ink-muted/30 focus:outline-none focus:border-accent/60 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type pills */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setSelectedType(f); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
                selectedType === f
                  ? 'bg-accent text-bg border-accent shadow-sm shadow-accent/15'
                  : 'bg-bg border-line text-ink-muted hover:border-accent/30 hover:text-ink'
              }`}
            >
              {f} <span className="opacity-60 ml-0.5 font-mono">({counts[f] ?? filteredImages.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredImages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border border-dashed border-line rounded-2xl bg-bg-surface/30 text-center gap-4"
        >
          <div className="p-4 rounded-xl bg-bg-surface border border-line">
            <ImageIcon size={28} className="text-ink-muted/30" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">No assets found</p>
            <p className="text-xs text-ink-muted mt-1 max-w-xs leading-relaxed">
              {searchQuery || selectedType !== 'All'
                ? 'Try modifying your search query or switching category filters.'
                : 'Any images uploaded to projects, blogs, or profiles will display here.'}
            </p>
          </div>
          {(searchQuery || selectedType !== 'All') && (
            <button onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
              className="text-xs font-semibold text-accent hover:underline">
              Reset Filters
            </button>
          )}
        </motion.div>
      ) : (
        <>
          {/* ── GRID VIEW ── */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {currentItems.map((img, idx) => (
                  <motion.div
                    key={img.url}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    onClick={() => openLightbox(img)}
                    className="ig-card group relative overflow-hidden cursor-pointer shadow-md bg-bg-surface"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-black/20">
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        loading="lazy"
                      />

                      {/* Hover details overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3.5 gap-1.5">
                        <div className="flex items-center justify-center absolute inset-0">
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                        <p className="text-white text-[11px] font-mono truncate leading-none">{img.filename}</p>
                        <div className="flex flex-wrap gap-1">
                          {img.usages.slice(0, 2).map((u, i) => (
                            <TypeBadge key={i} type={u.entityType} />
                          ))}
                        </div>
                      </div>

                      {/* Usage count bubble */}
                      <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/5 flex items-center justify-center text-[9px] font-mono text-white/90">
                        {img.usages.length} reference{img.usages.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {currentItems.map((img, idx) => (
                  <motion.div
                    key={img.url}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    onClick={() => openLightbox(img)}
                    className="ig-card flex items-center gap-4 p-3 shadow-sm bg-bg-surface cursor-pointer"
                  >
                    {/* Thumb */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-line bg-black/10">
                      <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate font-mono">{img.filename}</p>
                      <p className="text-[10px] text-ink-muted truncate font-mono mt-1">{img.url.replace(/^https?:\/\//, '')}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {img.usages.slice(0, 3).map((u, i) => <TypeBadge key={i} type={u.entityType} />)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {img.uploadDate !== '—' && (
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-ink-muted font-mono">
                          <Calendar size={13} />
                          {img.uploadDate}
                        </div>
                      )}
                      <div className="p-2 rounded-xl text-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all duration-200 bg-accent/5 border border-accent/15">
                        <Eye size={15} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-line/40">
              <p className="text-xs text-ink-muted font-mono">
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredImages.length)} of {filteredImages.length} items
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-xl border border-line text-ink-muted hover:text-ink hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      currentPage === i + 1
                        ? 'bg-accent text-bg border-accent shadow-sm'
                        : 'border-line text-ink-muted hover:border-accent/30 hover:text-ink'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-xl border border-line text-ink-muted hover:text-ink hover:border-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
              onClick={() => setSelectedImage(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-2xl ig-lightbox"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-7 rounded overflow-hidden shrink-0 border border-white/10">
                    <img src={selectedImage.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate font-mono">{selectedImage.filename}</p>
                    <p className="text-[10px] text-white/40 font-mono">
                      Image {lightboxIndex + 1} of {filteredImages.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={selectedImage.url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
                    title="Open original resource"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto grid md:grid-cols-[1fr_320px]">
                {/* Image panel */}
                <div className="relative flex items-center justify-center p-6 bg-black/40 min-h-[300px]">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.filename}
                    className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-2xl border border-white/5"
                  />

                  {/* Navigation keys */}
                  {filteredImages.length > 1 && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); lightboxPrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 flex items-center justify-center transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); lightboxNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 flex items-center justify-center transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Details panel */}
                <div className="p-6 space-y-6 border-t md:border-t-0 md:border-l border-white/5 bg-black/25">
                  {/* URL */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">Resource URL</h4>
                    <div className="bg-white/3 rounded-xl border border-white/5 p-3">
                      <p className="text-[10px] font-mono text-white/40 break-all leading-normal line-clamp-3">
                        {selectedImage.url}
                      </p>
                    </div>
                    <CopyButton url={selectedImage.url} />
                  </div>

                  {/* Metadata */}
                  {selectedImage.uploadDate !== '—' && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">Registered</h4>
                      <div className="flex items-center gap-2 text-xs text-white/70 font-mono">
                        <Calendar size={13} className="text-accent" />
                        {selectedImage.uploadDate}
                      </div>
                    </div>
                  )}

                  {/* Usages list */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">
                      Usage References ({selectedImage.usages.length})
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedImage.usages.map((u, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5">
                          <TypeBadge type={u.entityType} />
                          <p className="text-xs text-white/80 font-medium truncate flex-1 font-mono">{u.recordName}</p>
                          <Link2 size={12} className="text-white/20 shrink-0" />
                        </div>
                      ))}
                    </div>
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

