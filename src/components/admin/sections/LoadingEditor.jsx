import React, { useState, useEffect } from 'react';
import { useDocument } from '../../../hooks/useFirestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { AdminCard } from '../AdminCard';
import {
  Loader2, Monitor, ToggleLeft, ToggleRight, Clock, Type,
  Palette, Code2, Eye, EyeOff, RefreshCw, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CFG = {
  enabled:           true,
  title:             '',
  domain_suffix:     '.life',
  tagline:           'Builder · Learner · Creator',
  duration_seconds:  5,
  show_code_snippet: true,
  accent_hex:        '#6366f1',
  accent2_hex:       '#a855f7',
};

const ACCENT_PRESETS = [
  { label: 'Indigo / Purple',  a: '#6366f1', b: '#a855f7' },
  { label: 'Cyan / Blue',      a: '#06b6d4', b: '#3b82f6' },
  { label: 'Emerald / Teal',   a: '#10b981', b: '#0d9488' },
  { label: 'Rose / Pink',      a: '#f43f5e', b: '#ec4899' },
  { label: 'Amber / Orange',   a: '#f59e0b', b: '#f97316' },
  { label: 'White / Silver',   a: '#e2e8f0', b: '#94a3b8' },
];

export const LoadingEditor = ({ showToast }) => {
  const { document: profile }   = useDocument('site_meta', 'profile');
  const { document: loadingDoc } = useDocument('site_meta', 'loading_screen');
  const [form, setForm]         = useState(DEFAULT_CFG);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (loadingDoc) setForm(prev => ({ ...prev, ...loadingDoc }));
  }, [loadingDoc]);

  const inputCls = "w-full bg-bg border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-muted/40 focus:outline-none focus:border-accent/50 transition-colors";
  const labelCls = "block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5";

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'site_meta', 'loading_screen'), form, { merge: true });
      showToast('Loading screen saved!');
    } catch (err) {
      console.error(err);
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetDefaults = () => {
    setForm(DEFAULT_CFG);
    showToast('Reset to defaults — click Save to apply.', 'info');
  };

  /* ── Derived preview values ── */
  const previewName   = form.title  || profile?.name?.toLowerCase() || 'aadhi';
  const previewSuffix = form.domain_suffix || '.life';
  const previewFull   = `${previewName}${previewSuffix}`;
  const dotIdx        = previewFull.indexOf('.');
  const accent        = form.accent_hex  || '#6366f1';
  const accent2       = form.accent2_hex || '#a855f7';

  const tabs = [
    { id: 'appearance', label: 'Appearance',    icon: <Palette size={15} /> },
    { id: 'content',    label: 'Content',        icon: <Type size={15} /> },
    { id: 'behavior',   label: 'Behavior',       icon: <Clock size={15} /> },
    { id: 'preview',    label: 'Live Preview',   icon: <Eye size={15} /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/45 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-none flex items-center gap-2.5">
            <Monitor size={24} className="text-accent" />
            Loading Screen Editor
          </h2>
          <p className="text-xs text-ink-muted mt-2">
            Customise the cinematic intro animation shown to visitors on their first visit.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink-muted hover:bg-bg-hover hover:text-ink transition-colors"
          >
            <RefreshCw size={13} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-accent text-bg px-6 py-2.5 rounded-xl font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex flex-wrap gap-2 border-b border-line/40 pb-2">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                active ? 'bg-accent/10 border border-accent/25 text-accent shadow-sm' : 'border border-transparent text-ink-muted hover:bg-bg-hover hover:text-ink'
              }`}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1 — Appearance
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">

          {/* Enable toggle */}
          <AdminCard title="Visibility">
            <button type="button"
              onClick={() => set('enabled', !form.enabled)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all text-sm font-semibold ${
                form.enabled
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-bg-surface border-line text-ink-muted hover:border-accent/20'
              }`}
            >
              {form.enabled ? <ToggleRight size={22} className="text-accent" /> : <ToggleLeft size={22} />}
              {form.enabled ? 'Loading screen is ENABLED' : 'Loading screen is DISABLED'}
            </button>
            <p className="text-xs text-ink-muted mt-3">When disabled, visitors jump straight to the site — no intro animation.</p>
          </AdminCard>

          {/* Accent colours */}
          <AdminCard title="Color Scheme">
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ACCENT_PRESETS.map(p => {
                    const active = form.accent_hex === p.a && form.accent2_hex === p.b;
                    return (
                      <button key={p.label} type="button"
                        onClick={() => { set('accent_hex', p.a); setForm(prev => ({ ...prev, accent_hex: p.a, accent2_hex: p.b })); }}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          active ? 'border-accent/40 bg-accent/8 text-ink' : 'border-line bg-bg-surface text-ink-muted hover:border-line-strong hover:text-ink'
                        }`}
                      >
                        <div className="flex gap-1 shrink-0">
                          <div className="w-3 h-3 rounded-full" style={{ background: p.a }} />
                          <div className="w-3 h-3 rounded-full" style={{ background: p.b }} />
                        </div>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Primary Color (Hex)</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accent_hex} onChange={e => set('accent_hex', e.target.value)}
                      className="w-11 h-11 rounded-xl cursor-pointer border border-line bg-transparent p-0.5 shrink-0" />
                    <input type="text" value={form.accent_hex} onChange={e => set('accent_hex', e.target.value)}
                      placeholder="#6366f1" className={`${inputCls} font-mono`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Secondary Color (Hex)</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accent2_hex} onChange={e => set('accent2_hex', e.target.value)}
                      className="w-11 h-11 rounded-xl cursor-pointer border border-line bg-transparent p-0.5 shrink-0" />
                    <input type="text" value={form.accent2_hex} onChange={e => set('accent2_hex', e.target.value)}
                      placeholder="#a855f7" className={`${inputCls} font-mono`} />
                  </div>
                </div>
              </div>

              {/* Color preview strip */}
              <div className="h-3 rounded-full w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})`, boxShadow: `0 0 18px ${accent}55` }} />
            </div>
          </AdminCard>

          {/* Code snippet toggle */}
          <AdminCard title="Code Snippet Panel">
            <div className="flex items-start gap-4">
              <button type="button"
                onClick={() => set('show_code_snippet', !form.show_code_snippet)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all text-sm font-semibold shrink-0 ${
                  form.show_code_snippet
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-bg-surface border-line text-ink-muted hover:border-accent/20'
                }`}
              >
                {form.show_code_snippet ? <Code2 size={18} className="text-accent" /> : <EyeOff size={18} />}
                {form.show_code_snippet ? 'Code panel VISIBLE' : 'Code panel HIDDEN'}
              </button>
              <p className="text-xs text-ink-muted pt-1 leading-relaxed">Shows a floating code editor window on desktop screens that reveals after the typewriter finishes. Hidden on mobile regardless.</p>
            </div>
          </AdminCard>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2 — Content
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-6">

          <AdminCard title="Brand Name">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className={labelCls}>Display Name / Title</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder={profile?.name?.toLowerCase() || 'aadhi'} className={inputCls} />
                <p className="text-[11px] text-ink-muted">Typed out character-by-character. Leave empty to use your profile name.</p>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Domain Suffix</label>
                <input type="text" value={form.domain_suffix} onChange={e => set('domain_suffix', e.target.value)}
                  placeholder=".life" className={inputCls} />
                <p className="text-[11px] text-ink-muted">Appended to the name (the <strong>.</strong> glows). E.g. <code>.life</code> → <em>aadhi.life</em></p>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className={labelCls}>Tagline / Subtitle</label>
                <input type="text" value={form.tagline} onChange={e => set('tagline', e.target.value)}
                  placeholder="Builder · Learner · Creator" className={inputCls} />
                <p className="text-[11px] text-ink-muted">Appears below the name after typing completes. Use <code>·</code> as separator.</p>
              </div>
            </div>
          </AdminCard>

          {/* Live text preview */}
          <AdminCard title="Text Preview">
            <div className="rounded-2xl border border-line/40 bg-[#07070e] overflow-hidden py-10 flex flex-col items-center gap-4 px-6">
              <h1 className="font-display font-black leading-none select-none text-4xl" style={{ letterSpacing: '-0.03em' }}>
                <span style={{ color: '#e2e8f0' }}>{dotIdx >= 0 ? previewFull.slice(0, dotIdx) : previewFull}</span>
                {dotIdx >= 0 && (
                  <motion.span
                    animate={{ textShadow: [`0 0 0px ${accent}00`, `0 0 14px ${accent}ff, 0 0 30px ${accent2}cc`, `0 0 0px ${accent}00`] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    style={{ color: accent, display: 'inline-block' }}
                  >.</motion.span>
                )}
                <span style={{ color: '#94a3b8' }}>{dotIdx >= 0 ? previewFull.slice(dotIdx + 1) : ''}</span>
              </h1>
              <p className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: '#475569' }}>
                {form.tagline || 'Builder · Learner · Creator'}
              </p>
              <div className="w-48 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})`, boxShadow: `0 0 8px ${accent}77` }} />
            </div>
          </AdminCard>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3 — Behavior
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'behavior' && (
        <div className="space-y-6">

          <AdminCard title="Duration">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`${labelCls} mb-0`}>Screen Duration</label>
                <span className="text-base font-mono font-bold text-accent">{form.duration_seconds}s</span>
              </div>
              <input type="range" min={2} max={12} step={0.5} value={form.duration_seconds}
                onChange={e => set('duration_seconds', parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer" />
              <div className="flex justify-between text-[11px] text-ink-muted font-mono">
                <span>2s — instant</span>
                <span>6s — default</span>
                <span>12s — cinematic</span>
              </div>
              <p className="text-xs text-ink-muted pt-1">
                The screen auto-dismisses after this many seconds. The typewriter, particles, and code panel all play within this window.
              </p>
            </div>
          </AdminCard>

          <AdminCard title="Session Behaviour">
            <div className="flex items-start gap-4 p-4 bg-bg rounded-xl border border-line/50">
              <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink">Plays once per browser session</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  The loading screen is shown only on the visitor's first page load per session. 
                  Subsequent navigations go directly to the site. 
                  To preview it again, open an incognito window or clear <code className="bg-bg-surface px-1 py-0.5 rounded text-[11px]">sessionStorage</code> in DevTools.
                </p>
              </div>
            </div>
          </AdminCard>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 4 — Live Preview
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-muted">A miniature simulation of what visitors will see. Refresh to replay.</p>
            <button onClick={() => setPreviewKey(k => k + 1)}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border border-line hover:bg-bg-hover hover:text-ink text-ink-muted transition-colors">
              <RefreshCw size={13} /> Replay
            </button>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-line/50" style={{ height: 420, background: '#07070e' }}>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)', backgroundSize: '100% 3px' }} />

            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

            {/* Blobs */}
            <motion.div className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)` }}
              animate={{ scale: [1,1.15,1] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }} />
            <motion.div className="absolute -bottom-24 -right-24 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${accent2}18 0%, transparent 70%)` }}
              animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }} />

            {/* Central content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">

              {/* Rings */}
              <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                <motion.div className="absolute w-20 h-20 rounded-full border border-accent/15 pointer-events-none"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} />
                <motion.div className="absolute w-14 h-14 rounded-full border-dashed border border-accent/20 pointer-events-none"
                  animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }} />
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-lg"
                  style={{ background: `${accent}1a`, border: `1.5px solid ${accent}40`, color: accent }}
                  animate={{ boxShadow: [`0 0 0px ${accent}00`, `0 0 18px 4px ${accent}45`, `0 0 0px ${accent}00`] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                >
                  {previewName.charAt(0).toUpperCase()}
                </motion.div>
              </div>

              {/* Name */}
              <div className="text-center space-y-2">
                <p className="font-display font-black text-2xl leading-none select-none" style={{ letterSpacing: '-0.03em' }}>
                  <span style={{ color: '#e2e8f0' }}>{dotIdx >= 0 ? previewFull.slice(0, dotIdx) : previewFull}</span>
                  {dotIdx >= 0 && (
                    <motion.span key={previewKey}
                      animate={{ textShadow: [`0 0 0px ${accent}00`, `0 0 14px ${accent}ff, 0 0 28px ${accent2}cc`, `0 0 0px ${accent}00`] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      style={{ color: accent, display: 'inline-block' }}
                    >.</motion.span>
                  )}
                  <span style={{ color: '#94a3b8' }}>{dotIdx >= 0 ? previewFull.slice(dotIdx + 1) : ''}</span>
                </p>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: '#475569' }}>
                  {form.tagline || 'Builder · Learner · Creator'}
                </p>
              </div>

              {/* Progress */}
              <div className="w-40 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div key={previewKey} className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})` }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.5, ease: 'linear' }} />
              </div>
            </div>

            {/* Version stamp */}
            <div className="absolute bottom-3 right-4 text-[10px] font-mono" style={{ color: '#1e293b' }}>
              v{new Date().getFullYear()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
