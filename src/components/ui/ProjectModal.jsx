import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Users, Clock, Tag, ArrowUpRight } from 'lucide-react';
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
  /* Close on Escape */
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">

          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* ── Modal shell ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.9 }}
            className="relative w-full sm:max-w-4xl max-h-[100dvh] sm:max-h-[90vh] bg-bg sm:rounded-2xl border border-line/60 shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
            style={{ willChange: 'transform' }}
          >

            {/* ══════════════════════════════════
                HERO BANNER
            ══════════════════════════════════ */}
            <div className="relative h-52 sm:h-72 shrink-0 overflow-hidden bg-bg-surface">
              {heroImg ? (
                <img
                  src={heroImg}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Gradient placeholder */
                <div className="w-full h-full bg-gradient-to-br from-accent/25 via-bg-surface to-bg flex items-center justify-center">
                  <span className="text-[6rem] font-display font-black text-ink/6 select-none tracking-tighter leading-none">
                    {project.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
              {/* Side fade */}
              <div className="absolute inset-0 bg-gradient-to-r from-bg/20 via-transparent to-transparent" />

              {/* Accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />

              {/* Status badge — top left */}
              <div className="absolute top-4 left-5">
                <Badge variant={statusVariant(project.status)} className="backdrop-blur-md shadow-lg">
                  {project.status}
                </Badge>
              </div>

              {/* Close button — top right */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all hover:scale-105"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* ══════════════════════════════════
                TITLE ROW  (overlaps hero bottom)
            ══════════════════════════════════ */}
            <div className="px-6 sm:px-8 -mt-8 relative z-10 mb-2 flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-tight">
                  {project.title}
                </h2>
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-ink-muted">
                  {project.team && (
                    <span className="flex items-center gap-1.5">
                      <Users size={12} className="text-accent/60" />
                      {project.team}
                    </span>
                  )}
                  {project.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-accent/60" />
                      {project.duration}
                    </span>
                  )}
                  {project.phase && (
                    <span className="px-2 py-0.5 rounded border border-line bg-bg-surface text-ink-muted text-[10px] font-mono">
                      {project.phase}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick-action links (desktop top-right) */}
              <div className="hidden sm:flex items-center gap-2 shrink-0 mb-1">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-bg-surface hover:bg-bg-hover text-ink text-xs transition-colors"
                  >
                    <FaGithub size={13} /> Source
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-light text-bg text-xs font-semibold transition-colors"
                  >
                    <ArrowUpRight size={13} /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════
                SCROLLABLE CONTENT
            ══════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 sm:px-8 pb-6">

              <div className="h-px bg-line/60 mb-6" />

              {/* Two-column grid on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 md:gap-8">

                {/* ── LEFT: main narrative ── */}
                <div className="space-y-7 min-w-0">

                  {/* About */}
                  {project.full_desc && (
                    <div>
                      <p className="text-[10px] font-mono font-semibold text-ink-muted/60 uppercase tracking-[0.18em] mb-2">
                        About the project
                      </p>
                      <p className="text-ink-muted leading-relaxed text-sm whitespace-pre-wrap break-words">
                        {project.full_desc}
                      </p>
                    </div>
                  )}

                  {/* Demo video */}
                  {project.video_url && (
                    <div>
                      <p className="text-[10px] font-mono font-semibold text-ink-muted/60 uppercase tracking-[0.18em] mb-3">
                        Demo video
                      </p>
                      <div className="w-full aspect-video rounded-xl overflow-hidden border border-line bg-black shadow-lg">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title="Project Demo"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <a
                              href={project.video_url}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-accent text-bg px-5 py-2 rounded-lg font-semibold text-sm hover:bg-accent-light transition-colors"
                            >
                              Watch Demo <ArrowUpRight size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Why I built this — callout */}
                  {project.why_built && (
                    <div className="relative pl-4 py-0.5">
                      {/* Accent left rail */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-accent via-accent/60 to-transparent" />
                      <p className="text-[10px] font-mono font-semibold text-accent/70 uppercase tracking-[0.18em] mb-2">
                        Why I built this
                      </p>
                      <p className="text-ink-muted leading-relaxed text-sm whitespace-pre-wrap break-words">
                        {project.why_built}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: sidebar ── */}
                <div className="space-y-6 shrink-0">

                  {/* Tech stack */}
                  {tech.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono font-semibold text-ink-muted/60 uppercase tracking-[0.18em] mb-2.5 flex items-center gap-1.5">
                        <Tag size={9} /> Tech stack
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tech.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[11px] font-mono rounded bg-bg-surface border border-line text-ink-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-150 cursor-default"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta — team, duration */}
                  {(project.team || project.duration) && (
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-mono font-semibold text-ink-muted/60 uppercase tracking-[0.18em] mb-2">
                        Details
                      </p>
                      {project.team && (
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          <Users size={12} className="text-accent/50 shrink-0" />
                          <span>{project.team}</span>
                        </div>
                      )}
                      {project.duration && (
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          <Clock size={12} className="text-accent/50 shrink-0" />
                          <span>{project.duration}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  {(project.github_url || project.demo_url) && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-semibold text-ink-muted/60 uppercase tracking-[0.18em] mb-2.5">
                        Links
                      </p>
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-line bg-bg-surface hover:bg-bg-hover text-ink text-xs transition-colors group w-full"
                        >
                          <span className="flex items-center gap-2">
                            <FaGithub size={13} /> View Source
                          </span>
                          <ArrowUpRight size={11} className="text-ink-muted group-hover:text-accent transition-colors" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-accent hover:bg-accent-light text-bg text-xs font-semibold transition-colors group w-full"
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink size={13} /> Live Demo
                          </span>
                          <ArrowUpRight size={11} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile-only link buttons */}
              {(project.github_url || project.demo_url) && (
                <div className="flex sm:hidden gap-3 mt-6 pt-5 border-t border-line/60">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-line bg-bg-surface hover:bg-bg-hover text-ink text-sm transition-colors"
                    >
                      <FaGithub size={15} /> Source
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-light text-bg text-sm font-semibold transition-colors"
                    >
                      <ExternalLink size={15} /> Live Demo
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
