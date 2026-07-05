import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, GraduationCap, Laptop, BookOpen, Compass, Award,
  Sparkles, Mail, ExternalLink, User, Lock
} from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { useDocument } from "../../hooks/useFirestore";
import { Link } from "react-router-dom";

/* ── small helpers ──────────────────────────────────────────────── */
const StatRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 group">
    <div className="mt-0.5 p-2 rounded-lg bg-accent/8 border border-accent/12 group-hover:bg-accent/18 group-hover:border-accent/35 transition-all duration-200 flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-accent" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] text-ink-muted uppercase tracking-[0.14em] font-mono mb-0.5">{label}</p>
      <p className="text-ink font-medium text-sm leading-snug">{value}</p>
    </div>
  </div>
);

const chapters = [
  { id: 1, key: "The Pivot",     subtitle: "Stepping Off the Path",   icon: Compass  },
  { id: 2, key: "Self-Learning", subtitle: "Building the Foundation", icon: BookOpen },
  { id: 3, key: "Academia",      subtitle: "Growth & Collaboration",  icon: Award    },
  { id: 4, key: "Philosophy",    subtitle: "Learning by Doing",       icon: Sparkles },
];

const defaultStory = [
  "I left school after the 8th standard because I felt traditional education wasn't teaching me how things actually worked. I wanted to build, take things apart, and understand the systems behind them.",
  "My real education started on YouTube and through audiobooks. When my father bought me my first laptop in 2018, everything changed. I went deep into hardware, programming, and eventually earned a Diploma in Computer Engineering.",
  "Today, I'm in my final year of B.Tech IT in Chennai. I've overcome my stage fear, become Joint Secretary of a dev community, and built my first major project — a Digital Twin in Unreal Engine 5 for the Smart India Hackathon.",
  "I believe in learning by doing. Whether it's complex 3D environments or robust software systems, my goal is always to create tools and experiences that make an impact.",
];

const defaultBadges = ["Night owl 🦉", "Audiobook listener 🎧", "Builder in public 🛠️"];

export const About = () => {
  const { document: profile, loading } = useDocument("site_meta", "profile");
  const [activeChapter, setActiveChapter] = useState(0);

  const displayName  = profile?.name       || "Aadhi";
  const tagline      = profile?.tagline    || "Visual Engineer & Builder";
  const photoUrl     = profile?.about_image_url || profile?.profile_image_url || null;
  const badges       = profile?.badges     || defaultBadges;
  const storyParas   = profile?.bio
    ? profile.bio.split("\n").filter(p => p.trim())
    : defaultStory;

  const socials = [
    { icon: FaGithub,    href: profile?.github,    label: "GitHub"    },
    { icon: FaLinkedin,  href: profile?.linkedin,  label: "LinkedIn"  },
    { icon: FaInstagram, href: profile?.instagram, label: "Instagram" },
    { icon: Mail,      href: profile?.email ? `mailto:${profile.email}` : null, label: "Email" },
  ].filter(s => s.href);

  return (
    <section id="about" className="py-28 bg-bg relative overflow-hidden border-t border-line/30">
      {/* ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-accent/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <span className="section-label">01 · About</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4 leading-tight">
            The Person<br />
            <span className="text-accent">Behind the Code</span>
          </h2>
          <div className="w-16 h-0.5 bg-accent/60 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ══════════════════════════════════════════
              LEFT — Photo + quick stats
          ══════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-5"
          >
            {/* Photo card */}
            <div className="relative group mb-6">
              {/* Gold frame glow */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-accent/30 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

              <div className="relative rounded-2xl overflow-hidden border border-line/60 bg-bg-surface shadow-2xl aspect-[4/5] max-h-[440px]">
                {loading ? (
                  <div className="w-full h-full bg-bg-surface/50 animate-pulse" />
                ) : photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={displayName}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-bg-surface to-bg-nav gap-3">
                    <div className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent/30 flex items-center justify-center">
                      <span className="font-display font-black text-4xl text-accent">
                        {displayName.charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted font-mono">No photo uploaded</p>
                  </div>
                )}

                {/* Name overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                  <p className="font-display font-bold text-xl text-white leading-none">{displayName}</p>
                  <p className="text-xs text-white/60 mt-1 font-mono">{tagline}</p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-bg-surface/50 border border-line/50 rounded-xl p-5 space-y-4 backdrop-blur-sm">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3,4].map(i => <div key={i} className="h-8 bg-bg-surface/60 rounded-lg" />)}
                </div>
              ) : (
                <>
                  <StatRow icon={MapPin}        label="From"       value={profile?.location_home    || "Tenkasi, TN"} />
                  <StatRow icon={GraduationCap} label="Currently"  value={`${profile?.current_education || "B.Tech IT (Final Year)"} · ${profile?.current_college || "Saveetha EC, Chennai"}`} />
                  <StatRow icon={BookOpen}      label="Experience" value={profile?.experience_years || "7+ years self-learning"} />
                  <StatRow icon={Laptop}        label="Focus"      value={profile?.focus_area       || "Unreal Engine 5 & Systems"} />
                </>
              )}
            </div>

            {/* Social links & Admin panel lock link */}
            <div className="flex items-center gap-2 mt-4">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2.5 rounded-xl border border-line/60 text-ink-muted hover:text-accent hover:border-accent/40 hover:bg-accent/6 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
              <Link
                to="/admin/login"
                aria-label="Admin Access Portal"
                className="p-2.5 rounded-xl border border-line/40 text-ink-muted/30 hover:text-accent hover:border-accent/40 hover:bg-accent/6 transition-all duration-200 ml-auto"
              >
                <Lock size={15} />
              </Link>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════
              RIGHT — Journey chapters + badges
          ══════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-7 flex flex-col justify-start"
          >
            <h3 className="text-2xl font-display font-semibold text-ink mb-7">My Journey</h3>

            {/* Chapter tabs */}
            <div className="flex flex-wrap gap-2 pb-5 mb-5 border-b border-line/40">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(idx)}
                  className={`px-3.5 py-2 text-xs font-mono border rounded-lg transition-all duration-200 select-none ${
                    activeChapter === idx
                      ? "bg-accent/10 border-accent/60 text-accent shadow-sm"
                      : "border-line text-ink-muted hover:text-ink hover:border-line/80 bg-bg-surface/20"
                  }`}
                >
                  <span className="text-accent/50 mr-1.5">{String(ch.id).padStart(2,"0")}.</span>
                  {ch.key}
                </button>
              ))}
            </div>

            {/* Active chapter content */}
            <div className="relative min-h-[220px]">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-5 bg-bg-surface/40 rounded w-full" />)}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeChapter}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="relative p-6 rounded-xl border border-line/60 bg-bg-surface/20 backdrop-blur-sm overflow-hidden"
                  >
                    {/* Watermark icon */}
                    {React.createElement(chapters[activeChapter].icon, {
                      className: "absolute right-5 bottom-5 opacity-[0.04] text-accent w-24 h-24 pointer-events-none"
                    })}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-accent/12 border border-accent/15 text-accent">
                          {React.createElement(chapters[activeChapter].icon, { className: "w-5 h-5" })}
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-accent uppercase tracking-[0.16em]">
                            Chapter 0{activeChapter + 1}
                          </span>
                          <h4 className="text-base font-display font-semibold text-ink leading-tight">
                            {chapters[activeChapter].subtitle}
                          </h4>
                        </div>
                      </div>
                      <p className="text-ink-muted text-base leading-relaxed">
                        {storyParas[activeChapter] || defaultStory[activeChapter]}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Personality badges */}
            <motion.div
              className="flex flex-wrap gap-2 mt-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }}
            >
              <p className="w-full text-[10px] text-ink-muted uppercase tracking-widest font-mono mb-1">
                A bit about me
              </p>
              {badges.map((badge, idx) => (
                <motion.span
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, scale: 0.85 },
                    show:   { opacity: 1, scale: 1, transition: { duration: 0.25 } }
                  }}
                  className="px-3.5 py-1.5 text-xs rounded-full border border-line/60 bg-bg-surface/50 text-ink-muted hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-default select-none"
                >
                  {badge}
                </motion.span>
              ))}
            </motion.div>

            {/* Resume link if present */}
            {profile?.resume_url && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <ExternalLink size={14} />
                  View Résumé
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
