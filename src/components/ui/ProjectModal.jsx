import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Users, Clock, Tag, ArrowUpRight, Terminal, Award } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Badge } from './Badge';

const statusVariant = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'in progress' || s === 'in-progress') return 'in-progress';
  return 'concept';
};

const projectImg = (url) =>
  url?.replace('/upload/', '/upload/w_1400,h_700,c_fill,q_auto,f_auto/');

/* ── Extract YouTube / Vimeo embed URL ── */
const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    if (match && match[2].length === 11)
      return `https://www.youtube.com/embed/${match[2]}`;
  }
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
};

export const ProjectModal = ({ isOpen, onClose, project }) => {
  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!project) return null;

  const tech = project.tech_tags || project.tech || [];
  const heroImg = project.cover_image_url ? projectImg(project.cover_image_url) : null;
  const embedUrl = getEmbedUrl(project.video_url);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <style>{`
            .pm-scrollbar::-webkit-scrollbar { width: 5px; }
            .pm-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .pm-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 99px; }
            .pm-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212, 168, 83, 0.4); }
            
            .pm-glow-card {
              position: relative;
              background: rgba(10, 10, 14, 0.95);
              backdrop-filter: blur(28px);
              -webkit-backdrop-filter: blur(28px);
              border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .pm-glow-card::before {
              content: '';
              position: absolute;
              top: 0; left: 15%; right: 15%; height: 1px;
              background: linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.5), transparent);
              pointer-events: none;
            }
            .pm-tag {
              background: rgba(255, 255, 255, 0.02);
              border: 0.5px solid rgba(255, 255, 255, 0.06);
              transition: all 200ms ease;
            }
            .pm-tag:hover {
              border-color: rgba(212, 168, 83, 0.35);
              background: rgba(212, 168, 83, 0.05);
              color: var(--accent);
            }
            .pm-terminal {
              background: rgba(0, 0, 0, 0.35);
              border: 1px solid rgba(212, 168, 83, 0.15);
              border-radius: 12px;
              padding: 16px;
              position: relative;
              overflow: hidden;
            }
            .pm-terminal::after {
              content: '';
              position: absolute;
              top: 0; right: 0; bottom: 0; width: 60px;
              background: linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.02));
              pointer-events: none;
            }
          `}</style>

          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* ── Modal Shell ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.95 }}
            className="relative w-full sm:max-w-4xl max-h-[100dvh] sm:max-h-[88vh] pm-glow-card sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* ══════════════════════════════════
                HERO BANNER
            ══════════════════════════════════ */}
            <div className="relative h-56 sm:h-80 shrink-0 overflow-hidden bg-black/40">
              {heroImg ? (
                <img
                  src={heroImg}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Cinematic placeholder */
                <div className="w-full h-full bg-gradient-to-br from-accent/15 via-[#0d0d12] to-black flex items-center justify-center">
                  <span className="text-[7rem] font-display font-black text-white/5 select-none tracking-tighter leading-none">
                    {project.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Gradient shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E] via-transparent to-black/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

              {/* Top banner status badge */}
              <div className="absolute top-5 left-6 z-10">
                <Badge variant={statusVariant(project.status)} className="backdrop-blur-md shadow-lg py-1 px-3 border border-white/10 text-xs tracking-wider uppercase font-mono">
                  {project.status}
                </Badge>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 p-2.5 bg-black/60 hover:bg-black/90 text-white/80 hover:text-white rounded-full border border-white/10 backdrop-blur-sm transition-all hover:scale-105 hover:rotate-90 duration-300"
                aria-label="Close Modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* ══════════════════════════════════
                TITLE ROW
            ══════════════════════════════════ */}
            <div className="px-6 sm:px-9 -mt-10 relative z-10 mb-2 flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3.5xl font-display font-bold text-white tracking-tight leading-tight drop-shadow-md text-balance">
                  {project.title}
                </h2>
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-ink-muted">
                  {project.team && (
                    <span className="flex items-center gap-2">
                      <Users size={13} className="text-accent" />
                      {project.team}
                    </span>
                  )}
                  {project.duration && (
                    <span className="flex items-center gap-2">
                      <Clock size={13} className="text-accent" />
                      {project.duration}
                    </span>
                  )}
                  {project.phase && (
                    <span className="px-2 py-0.5 rounded border border-line bg-black/30 text-ink-muted text-[10px] font-mono tracking-wider uppercase">
                      {project.phase}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick actions for desktop */}
              <div className="hidden sm:flex items-center gap-2.5 shrink-0 mb-1">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-bg-surface hover:bg-bg-hover text-ink text-xs font-semibold transition-all hover:border-accent/40"
                  >
                    <FaGithub size={14} /> Source
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-light text-bg text-xs font-bold transition-all shadow-md shadow-accent/20"
                  >
                    <ArrowUpRight size={14} /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════
                SCROLLABLE BODY CONTENT
            ══════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto pm-scrollbar px-6 sm:px-9 pb-8">
              <div className="h-px bg-line/50 my-6" />

              <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6 md:gap-9 items-start">
                
                {/* ── Left Column: Narrative ── */}
                <div className="space-y-8 min-w-0">
                  {/* Summary/Description */}
                  {project.full_desc && (
                    <div>
                      <p className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-2.5">
                        Overview
                      </p>
                      <p className="text-ink-muted leading-relaxed text-sm sm:text-[15px] whitespace-pre-wrap break-words">
                        {project.full_desc}
                      </p>
                    </div>
                  )}

                  {/* Demo Video Container */}
                  {project.video_url && (
                    <div>
                      <p className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-3">
                        Video Demonstration
                      </p>
                      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-line bg-black/45 shadow-xl relative group">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title="Demo player"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-bg-surface/50">
                            <a
                              href={project.video_url}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-accent text-bg px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-accent-light transition-all shadow-md shadow-accent/25"
                            >
                              Open Demo Player <ArrowUpRight size={15} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Terminal-style Callout */}
                  {project.why_built && (
                    <div className="pm-terminal">
                      <div className="flex items-center gap-2 text-accent/80 mb-3 border-b border-line/20 pb-2">
                        <Terminal size={14} className="shrink-0" />
                        <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">why_i_built_this.log</span>
                      </div>
                      <p className="text-ink-muted leading-relaxed text-sm whitespace-pre-wrap break-words font-sans">
                        {project.why_built}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Right Column: Sidebar ── */}
                <div className="space-y-6 md:pl-2">
                  {/* Tech stack tags */}
                  {tech.length > 0 && (
                    <div>
                      <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Tag size={10} className="text-accent" /> Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {tech.map((t, idx) => (
                          <span key={idx} className="pm-tag px-2.5 py-1 text-[11px] font-mono rounded-lg text-ink-muted cursor-default">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Details */}
                  {(project.team || project.duration) && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest mb-2">
                        Details
                      </h4>
                      {project.team && (
                        <div className="flex items-center gap-2.5 text-xs text-ink-muted">
                          <Users size={13} className="text-accent/60 shrink-0" />
                          <span>{project.team}</span>
                        </div>
                      )}
                      {project.duration && (
                        <div className="flex items-center gap-2.5 text-xs text-ink-muted">
                          <Clock size={13} className="text-accent/60 shrink-0" />
                          <span>{project.duration}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Link List */}
                  {(project.github_url || project.demo_url) && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest mb-3">
                        External Resources
                      </h4>
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-line bg-bg-surface hover:bg-bg-hover text-ink text-xs font-semibold transition-all group w-full hover:border-accent/40"
                        >
                          <span className="flex items-center gap-2">
                            <FaGithub size={14} className="text-ink-muted group-hover:text-accent" /> View Source
                          </span>
                          <ArrowUpRight size={13} className="text-ink-muted/50 group-hover:text-accent transition-colors" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-bg text-xs font-bold transition-all group w-full shadow-sm"
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink size={14} /> Launch Application
                          </span>
                          <ArrowUpRight size={13} className="opacity-75 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile-only action buttons footer */}
              {(project.github_url || project.demo_url) && (
                <div className="flex sm:hidden gap-3 mt-8 pt-5 border-t border-line/45">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line bg-bg-surface hover:bg-bg-hover text-ink text-xs font-bold transition-all"
                    >
                      <FaGithub size={14} /> Code
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent hover:bg-accent-light text-bg text-xs font-bold transition-all"
                    >
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

