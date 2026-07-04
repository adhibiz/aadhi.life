import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocument } from '../../hooks/useFirestore';

/* ─── Orbital Ring ──────────────────────────────────────────────────────── */
const Ring = ({ size, duration, delay, opacity }) => (
  <motion.div
    className="absolute rounded-full border border-accent/20"
    style={{ width: size, height: size }}
    animate={{ rotate: 360, scale: [1, 1.04, 1] }}
    transition={{ repeat: Infinity, duration, delay, ease: 'linear' }}
  />
);

/* ─── Floating Particle ─────────────────────────────────────────────────── */
const Particle = ({ x, y, delay, size }) => (
  <motion.div
    className="absolute rounded-full bg-accent"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, filter: 'blur(0.5px)' }}
    animate={{ y: [0, -18, 0], opacity: [0, 0.7, 0] }}
    transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, delay, ease: 'easeInOut' }}
  />
);

/* ─── Static particle seed so particles don't re-randomise on render ────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 5 + (i * 37 + i * 11) % 90,
  y: 5 + (i * 53 + i * 7) % 90,
  delay: (i * 0.35) % 3,
  size: 2 + (i % 3),
}));

/* ─── Typewriter hook ───────────────────────────────────────────────────── */
const useTypewriter = (text, speed = 80, startDelay = 600) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
};

/* ─── Main Component ────────────────────────────────────────────────────── */
export const LoadingScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { document: profile } = useDocument('site_meta', 'profile');
  const { document: loadingConfig } = useDocument('site_meta', 'loading_screen');

  /* Config pulled from Firestore (with sensible defaults) */
  const enabled = loadingConfig?.enabled ?? true;
  const durationMs = (loadingConfig?.duration_seconds ?? 4) * 1000;
  const displayName = loadingConfig?.title || profile?.name?.toLowerCase() || 'aadhi';
  const tagline = loadingConfig?.tagline || 'Builder · Learner · Creator';
  const domainSuffix = loadingConfig?.domain_suffix || '.life';

  const typedText = `${displayName}${domainSuffix}`;
  const { displayed, done: typingDone } = useTypewriter(typedText, 70, 400);

  // Split displayed text at the dot so we can animate it separately
  const dotIdx    = typedText.indexOf('.');
  const beforeDot = dotIdx >= 0 ? displayed.slice(0, dotIdx) : displayed;
  const dotChar   = dotIdx >= 0 && displayed.length > dotIdx ? typedText[dotIdx] : '';
  const afterDot  = dotIdx >= 0 && displayed.length > dotIdx + 1 ? displayed.slice(dotIdx + 1) : '';


  /* Show once per session */
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('visited');
    if (!hasVisited && enabled) {
      setIsVisible(true);
      sessionStorage.setItem('visited', 'true');

      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, durationMs + 800); // extra 800 ms for exit animation

      return () => clearTimeout(timer);
    } else {
      if (onComplete) onComplete();
    }
  }, [onComplete, enabled, durationMs]);

  /* Progress bar */
  useEffect(() => {
    if (!isVisible) return;
    const tick = 50;
    const steps = durationMs / tick;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress(Math.min(100, (current / steps) * 100));
      if (current >= steps) clearInterval(interval);
    }, tick);
    return () => clearInterval(interval);
  }, [isVisible, durationMs]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'var(--color-bg, #0a0a0f)' }}
        >
          {/* ── Ambient gradient blobs ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }}
            />
          </div>

          {/* ── Floating particles ── */}
          <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
          </div>

          {/* ── Central content ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="relative flex flex-col items-center gap-8 px-6"
          >
            {/* Orbital rings + logo glyph */}
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <Ring size={120} duration={8}  delay={0}   opacity={0.3} />
              <Ring size={90}  duration={5}  delay={0.5} opacity={0.5} />
              <Ring size={62}  duration={3}  delay={1}   opacity={0.8} />

              {/* Inner glowing avatar */}
              <motion.div
                animate={{ boxShadow: ['0 0 0px 0px rgba(99,102,241,0)', '0 0 32px 8px rgba(99,102,241,0.35)', '0 0 0px 0px rgba(99,102,241,0)'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-display font-black text-2xl relative z-10"
              >
                {displayName.charAt(0).toUpperCase()}
              </motion.div>
            </div>

            {/* Typewriter brand name */}
            <div className="text-center space-y-2">
              <h1
                className="font-display font-black tracking-tight leading-none select-none"
                style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.02em' }}
              >
                {/* Name part before the dot */}
                <span className="text-ink">{beforeDot}</span>

                {/* The glowing dot — animates once typewriter reaches it */}
                {dotChar && (
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 0px rgba(99,102,241,0)',
                        '0 0 10px rgba(99,102,241,1), 0 0 24px rgba(168,85,247,0.9), 0 0 44px rgba(99,102,241,0.55)',
                        '0 0 6px rgba(99,102,241,0.5), 0 0 14px rgba(168,85,247,0.35)',
                        '0 0 12px rgba(99,102,241,1), 0 0 30px rgba(168,85,247,1), 0 0 52px rgba(99,102,241,0.7)',
                        '0 0 0px rgba(99,102,241,0)',
                      ],
                      scale: [1, 1.2, 1.05, 1.25, 1],
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    style={{ color: '#818cf8', display: 'inline-block', transformOrigin: 'center' }}
                  >
                    {dotChar}
                  </motion.span>
                )}

                {/* Suffix after the dot — e.g. "life" */}
                <span className="text-ink">{afterDot}</span>

                {/* Blinking cursor — visible only while still typing */}
                {!typingDone && (
                  <motion.span
                    className="text-accent"
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'steps(1)' }}
                  >
                    |
                  </motion.span>
                )}
              </h1>


              {/* Tagline fades in once typing completes */}
              <AnimatePresence>
                {typingDone && (
                  <motion.p
                    key="tagline"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-ink-muted text-sm font-mono tracking-widest uppercase"
                  >
                    {tagline}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-48 sm:w-64 h-[3px] rounded-full overflow-hidden bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>

          {/* ── Corner grid overlay (decorative) ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
