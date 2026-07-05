import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Download, ArrowUpRight, Copy, CheckCheck, Send } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

/* ── Floating ambient orb ─────────────────────────────────────────────── */
const Orb = ({ className, style }) => (
  <div className={`absolute rounded-full blur-[120px] pointer-events-none select-none ${className}`} style={style} />
);

/* ── Contact card ─────────────────────────────────────────────────────── */
const ContactCard = ({ icon, label, value, href, accent, delay, action }) => {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, scale: 1.012 }}
      className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-line/60 bg-bg-surface/60 backdrop-blur-sm overflow-hidden cursor-pointer transition-colors duration-300 hover:border-line-strong"
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 50%, ${accent}18 0%, transparent 60%)` }} />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110"
        style={{ background: `${accent}15`, borderColor: `${accent}30`, color: accent }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-ink-muted/60 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate">{value}</p>
      </div>

      {/* Right action / arrow */}
      <div className="shrink-0">
        {action ?? <ArrowUpRight size={15} className="text-ink-muted/40 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />}
      </div>
    </motion.div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">{inner}</a>
  ) : (
    <div className="block">{inner}</div>
  );
};

export const Contact = () => {
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);

  const openToWork      = profile?.open_to_work ?? true;
  const openToWorkText  = profile?.open_to_work_text || 'Available for internships';
  const availableFor    = profile?.available_for?.length
    ? profile.available_for
    : ['Internships', 'Freelance projects', 'Workshop facilitation', 'Collaborations', 'Speaking / Guest sessions'];

  const heading     = profile?.contact_heading    || "Let's Connect";
  const subheading  = profile?.contact_subheading || "I'm open to collaborations, internships, workshops, and conversations about tech, game engines, and building things from scratch.";
  const resumeUrl   = profile?.resume_url || '';

  useEffect(() => {
    if (!db) return;
    getDoc(doc(db, 'site_meta', 'profile')).then(snap => {
      if (snap.exists()) setProfile(snap.data());
    }).catch(console.error);
  }, []);

  const emailVal    = profile?.email    || 'adhi2003@hotmail.com';
  const githubVal   = profile?.github   || 'https://github.com/adhibiz';
  const linkedinVal = profile?.linkedin || 'https://linkedin.com/in/adhibiz';
  const instagramVal= profile?.instagram|| '#';
  const locationVal = profile?.location_current || 'Chennai / Tenkasi, TN';

  const handleCopy = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(emailVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const downloadUrl = resumeUrl?.includes('cloudinary.com')
    ? resumeUrl.replace('/upload/', '/upload/fl_attachment/')
    : resumeUrl;

  const contactCards = [
    {
      icon: <Mail size={18} />,
      label: 'Email',
      value: emailVal,
      href: `mailto:${emailVal}`,
      accent: '#6366f1',
      action: (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg transition-all duration-200"
          style={{
            background: copied ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
            color: copied ? '#6366f1' : '#6b7280',
            border: `1px solid ${copied ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)'}`,
          }}
        >
          {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )
    },
    {
      icon: <FaGithub size={18} />,
      label: 'GitHub',
      value: githubVal.replace('https://', ''),
      href: githubVal,
      accent: '#e2e8f0',
    },
    {
      icon: <FaLinkedin size={18} />,
      label: 'LinkedIn',
      value: linkedinVal.replace('https://', '').replace('www.', ''),
      href: linkedinVal,
      accent: '#3b82f6',
    },
    {
      icon: <FaInstagram size={18} />,
      label: 'Instagram',
      value: instagramVal !== '#' ? '@' + instagramVal.split('/').filter(Boolean).pop() : '@me_adhi.x',
      href: instagramVal,
      accent: '#ec4899',
    },
    {
      icon: <MapPin size={18} />,
      label: 'Location',
      value: locationVal,
      href: null,
      accent: '#a78bfa',
    },
  ];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  });

  return (
    <section id="contact" className="relative py-28 sm:py-36 bg-bg overflow-hidden border-t border-line/50">

      {/* Ambient orbs */}
      <Orb className="w-[500px] h-[500px] -top-32 -left-40 opacity-30" style={{ background: 'radial-gradient(circle, #6366f160 0%, transparent 70%)' }} />
      <Orb className="w-[400px] h-[400px] bottom-0 right-0 opacity-25" style={{ background: 'radial-gradient(circle, #a855f750 0%, transparent 70%)' }} />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Label ── */}
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/25 bg-accent/8 text-accent text-[10px] font-mono font-bold uppercase tracking-widest">
            <Send size={10} />
            Contact
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent max-w-[120px]" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── LEFT ── */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div {...fadeUp(0.05)}>
              <h2
                className="font-display font-black text-ink leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', letterSpacing: '-0.03em' }}
              >
                {heading}
                <span className="text-accent">.</span>
              </h2>
              <p className="text-base text-ink-muted leading-relaxed max-w-md">
                {subheading}
              </p>
            </motion.div>

            {/* Open to work badge */}
            <AnimatePresence>
              {openToWork && (
                <motion.div
                  key="otw"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-green-500/25 bg-gradient-to-r from-green-500/8 to-emerald-500/5 backdrop-blur-sm shadow-sm shadow-green-500/5"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wide text-green-400">
                    {openToWorkText}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted/50 border-l border-line/40 pl-3">
                    {new Date().getFullYear()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* ── RIGHT — contact cards ── */}
          <div className="lg:col-span-7 space-y-3">
            {contactCards.map((card, i) => (
              <ContactCard key={i} {...card} delay={0.08 + i * 0.07} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
