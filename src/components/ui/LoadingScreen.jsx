import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocument } from '../../hooks/useFirestore';

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

/* Orbital ring */
const Ring = ({ r, dur, delay, ccw = false, dashed = false }) => (
  <motion.div
    className={`absolute rounded-full ${dashed ? 'border-dashed' : 'border'} border-accent/15 pointer-events-none`}
    style={{ width: r * 2, height: r * 2, top: '50%', left: '50%', marginTop: -r, marginLeft: -r }}
    animate={{ rotate: ccw ? -360 : 360 }}
    transition={{ repeat: Infinity, duration: dur, delay, ease: 'linear' }}
  />
);

/* Static particle seed */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 3 + (i * 41 + i * 13) % 94,
  y: 3 + (i * 57 + i * 9)  % 94,
  delay: (i * 0.28) % 3.5,
  size: 1.5 + (i % 4) * 0.8,
  opacity: 0.3 + (i % 3) * 0.2,
}));

const Particle = ({ x, y, delay, size, opacity }) => (
  <motion.div
    className="absolute rounded-full bg-accent pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, filter: 'blur(0.4px)' }}
    animate={{ y: [0, -22, 0], opacity: [0, opacity, 0] }}
    transition={{ repeat: Infinity, duration: 3.5 + (size % 2), delay, ease: 'easeInOut' }}
  />
);

/* Scanline overlay */
const Scanlines = () => (
  <div
    className="absolute inset-0 pointer-events-none z-20 opacity-[0.028]"
    style={{
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.35) 2px, rgba(255,255,255,0.35) 3px)',
      backgroundSize: '100% 3px',
    }}
  />
);

/* Typewriter hook */
const useTypewriter = (text, speed = 65, startDelay = 350) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const t0 = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t0);
  }, [text, speed, startDelay]);

  return { displayed, done };
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export const LoadingScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible]   = useState(false);
  const [progress,  setProgress]    = useState(0);
  const [phase,     setPhase]       = useState(0); // 0=logo in, 1=typing, 2=tagline

  const { document: profile }       = useDocument('site_meta', 'profile');
  const { document: cfg }           = useDocument('site_meta', 'loading_screen');

  /* ── Config with defaults ─────────────────────────────── */
  const enabled       = cfg?.enabled        ?? true;
  const durationMs    = (cfg?.duration_seconds ?? 5) * 1000;
  const displayName   = cfg?.title           || profile?.name?.toLowerCase() || 'aadhi';
  const domainSuffix  = cfg?.domain_suffix   || '.life';
  const tagline       = cfg?.tagline         || 'Builder · Learner · Creator';
  const showCode      = cfg?.show_code_snippet ?? true;
  const accentColor   = cfg?.accent_hex      || '#6366f1';
  const accentColor2  = cfg?.accent2_hex     || '#a855f7';

  const fullText  = `${displayName}${domainSuffix}`;
  const dotIdx    = fullText.indexOf('.');
  const { displayed, done: typingDone } = useTypewriter(fullText, 62, 600);
  const beforeDot = dotIdx >= 0 ? displayed.slice(0, dotIdx) : displayed;
  const dotChar   = dotIdx >= 0 && displayed.length > dotIdx ? fullText[dotIdx] : '';
  const afterDot  = dotIdx >= 0 && displayed.length > dotIdx + 1 ? displayed.slice(dotIdx + 1) : '';

  /* ── Session logic ─────────────────────────────────────── */
  useEffect(() => {
    const seen = sessionStorage.getItem('ls_visited');
    if (!seen && enabled) {
      setIsVisible(true);
      sessionStorage.setItem('ls_visited', '1');
      const t = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, durationMs + 900);
      return () => clearTimeout(t);
    } else {
      onComplete?.();
    }
  }, [onComplete, enabled, durationMs]);

  /* ── Progress ticker ───────────────────────────────────── */
  useEffect(() => {
    if (!isVisible) return;
    const tick = 40;
    const steps = durationMs / tick;
    let n = 0;
    const iv = setInterval(() => {
      n++;
      setProgress(Math.min(100, (n / steps) * 100));
      if (n >= steps) clearInterval(iv);
    }, tick);
    return () => clearInterval(iv);
  }, [isVisible, durationMs]);

  /* ── Phase transitions ─────────────────────────────────── */
  useEffect(() => {
    if (!isVisible) return;
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isVisible]);

  /* ── Mini code snippet lines ─────────────────────────────── */
  const codeLines = [
    { text: `const dev = {`,        color: '#c792ea' },
    { text: `  name: "${displayName}",`, color: '#82aaff' },
    { text: `  stack: ["UE5","React"],`, color: '#c3e88d' },
    { text: `  loading: true`,       color: '#ffcb6b' },
    { text: `};`,                    color: '#c792ea' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="ls"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[200] overflow-hidden flex items-center justify-center"
          style={{ background: `#07070e` }}
        >
          {/* ── Scanlines ── */}
          <Scanlines />

          {/* ── Grid overlay ── */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.032] z-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '52px 52px',
            }}
          />

          {/* ── Ambient blobs ── */}
          <motion.div
            className="absolute -top-52 -left-52 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 68%)` }}
            animate={{ scale: [1, 1.12, 1], x: [0, 25, 0], y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-52 -right-52 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accentColor2}14 0%, transparent 68%)` }}
            animate={{ scale: [1, 1.18, 1], x: [0, -18, 0], y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut', delay: 2 }}
          />

          {/* ── Particles ── */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
          </div>

          {/* ── Main layout: left brand / right code ── */}
          <div className="relative z-30 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 w-full max-w-5xl">

            {/* LEFT — logo + name + tagline + progress */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: phase >= 0 ? 1 : 0, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
              className="flex flex-col items-center lg:items-start gap-7"
            >
              {/* Orbital rings + glyph */}
              <div className="relative flex items-center justify-center" style={{ width: 136, height: 136 }}>
                <Ring r={68} dur={10} delay={0}   />
                <Ring r={52} dur={6.5} delay={0.4} ccw dashed />
                <Ring r={36} dur={4}   delay={0.8} />

                {/* Pulsing core */}
                <motion.div
                  className="absolute w-16 h-16 rounded-full z-10 flex items-center justify-center font-display font-black text-3xl"
                  style={{
                    background: `${accentColor}1a`,
                    border: `1.5px solid ${accentColor}40`,
                    color: accentColor,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 0px 0px ${accentColor}00`,
                      `0 0 28px 6px ${accentColor}45`,
                      `0 0 0px 0px ${accentColor}00`,
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </motion.div>
              </div>

              {/* Typewriter name */}
              <div className="text-center lg:text-left space-y-3">
                <h1
                  className="font-display font-black leading-none select-none"
                  style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', letterSpacing: '-0.03em' }}
                >
                  <span style={{ color: '#e2e8f0' }}>{beforeDot}</span>

                  {/* Glowing dot */}
                  {dotChar && (
                    <motion.span
                      animate={{
                        textShadow: [
                          `0 0 0px ${accentColor}00`,
                          `0 0 12px ${accentColor}ff, 0 0 28px ${accentColor2}dd, 0 0 52px ${accentColor}77`,
                          `0 0 8px ${accentColor}88, 0 0 18px ${accentColor2}55`,
                          `0 0 16px ${accentColor}ff, 0 0 36px ${accentColor2}ff, 0 0 60px ${accentColor}88`,
                          `0 0 0px ${accentColor}00`,
                        ],
                        scale: [1, 1.22, 1.08, 1.28, 1],
                      }}
                      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                      style={{ color: accentColor, display: 'inline-block', transformOrigin: 'center' }}
                    >
                      {dotChar}
                    </motion.span>
                  )}

                  <span style={{ color: '#94a3b8' }}>{afterDot}</span>

                  {/* Cursor */}
                  {!typingDone && (
                    <motion.span
                      style={{ color: accentColor }}
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.55, ease: 'steps(1)' }}
                    >_</motion.span>
                  )}
                </h1>

                {/* Tagline */}
                <AnimatePresence>
                  {typingDone && (
                    <motion.p
                      key="tl"
                      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.55, delay: 0.1 }}
                      className="text-xs font-mono tracking-[0.22em] uppercase"
                      style={{ color: '#64748b' }}
                    >
                      {tagline}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="w-52 sm:w-72">
                <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${accentColor}, ${accentColor2})`,
                      boxShadow: `0 0 8px ${accentColor}88`,
                    }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <motion.p
                  className="text-right text-[10px] font-mono mt-1.5"
                  style={{ color: `${accentColor}99` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {Math.round(progress)}%
                </motion.p>
              </div>
            </motion.div>

            {/* RIGHT — mini code snippet (optional) */}
            {showCode && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : 40 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="hidden lg:block"
              >
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    background: '#0d1117',
                    borderColor: `${accentColor}22`,
                    boxShadow: `0 0 40px ${accentColor}12, 0 24px 64px rgba(0,0,0,0.6)`,
                    minWidth: 300,
                  }}
                >
                  {/* Titlebar */}
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: `${accentColor}18` }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-[10px] font-mono" style={{ color: '#475569' }}>portfolio.js</span>
                  </div>

                  {/* Lines */}
                  <div className="px-5 py-5 space-y-1.5">
                    {codeLines.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: phase >= 2 ? 1 : 0, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.12 }}
                        className="text-sm font-mono whitespace-pre"
                        style={{ color: line.color }}
                      >
                        {line.text}
                      </motion.p>
                    ))}

                    {/* Blinking cursor after code */}
                    <motion.p
                      className="text-sm font-mono"
                      style={{ color: accentColor }}
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.7, ease: 'steps(1)', delay: 0.8 }}
                    >
                      ▌
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* ── Corner version stamp ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-6 right-6 text-[10px] font-mono z-30"
            style={{ color: '#334155' }}
          >
            v{new Date().getFullYear()}
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
