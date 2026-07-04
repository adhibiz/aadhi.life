import React, { useState, useEffect } from 'react';
import { useDocument } from '../../../hooks/useFirestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { AdminCard } from '../AdminCard';
import {
  Loader2, Send, ToggleLeft, ToggleRight, Plus, Trash2,
  Mail, MapPin, Globe, User, AlignLeft, CheckSquare
} from 'lucide-react';

const AVAILABLE_FOR_PRESETS = [
  'Internships',
  'Freelance projects',
  'Workshop facilitation',
  'Collaborations',
  'Speaking / Guest sessions',
  'Open source contributions',
  'Mentoring',
];

export const ContactEditor = ({ showToast }) => {
  const { document: profile, loading } = useDocument('site_meta', 'profile');
  const [form, setForm] = useState({
    contact_heading: '',
    contact_subheading: '',
    open_to_work: true,
    open_to_work_text: '',
    available_for: [],
    email: '',
    github: '',
    linkedin: '',
    instagram: '',
    location_current: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        contact_heading:    profile.contact_heading    ?? '',
        contact_subheading: profile.contact_subheading ?? '',
        open_to_work:       profile.open_to_work       ?? true,
        open_to_work_text:  profile.open_to_work_text  ?? '',
        available_for:      profile.available_for      ?? [],
        email:              profile.email              ?? '',
        github:             profile.github             ?? '',
        linkedin:           profile.linkedin           ?? '',
        instagram:          profile.instagram          ?? '',
        location_current:   profile.location_current   ?? '',
      }));
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'site_meta', 'profile');
      const cleaned = {};
      Object.keys(form).forEach(k => {
        if (form[k] !== undefined) cleaned[k] = form[k];
      });
      await setDoc(docRef, cleaned, { merge: true });
      showToast('Contact page saved successfully!');
    } catch (err) {
      console.error(err);
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    const val = newItem.trim();
    if (!val || form.available_for.includes(val)) return;
    setForm(prev => ({ ...prev, available_for: [...prev.available_for, val] }));
    setNewItem('');
  };

  const removeItem = (item) => {
    setForm(prev => ({ ...prev, available_for: prev.available_for.filter(i => i !== item) }));
  };

  const togglePreset = (preset) => {
    setForm(prev => {
      const has = prev.available_for.includes(preset);
      return {
        ...prev,
        available_for: has
          ? prev.available_for.filter(i => i !== preset)
          : [...prev.available_for, preset],
      };
    });
  };

  const tabs = [
    { id: 'content',  label: 'Page Content',    icon: <AlignLeft size={15} /> },
    { id: 'status',   label: 'Career Status',   icon: <CheckSquare size={15} /> },
    { id: 'contacts', label: 'Contact Details', icon: <Mail size={15} /> },
  ];

  const inputCls = "w-full bg-bg border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-muted/40 focus:outline-none focus:border-accent/50 transition-colors";
  const labelCls = "block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header + Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/45 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-none flex items-center gap-2">
            <Send size={22} className="text-accent" />
            Contact Page Editor
          </h2>
          <p className="text-xs text-ink-muted mt-2">
            Manage the contact section heading, open-to-work status, availability scope, and contact links.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-accent text-bg px-6 py-2.5 rounded-xl font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-sm"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line/40 pb-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 border border-accent/25 text-accent shadow-sm'
                  : 'border border-transparent text-ink-muted hover:bg-bg-hover hover:text-ink'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Page Content ── */}
      {activeTab === 'content' && (
        <div className="space-y-6">

          <AdminCard title="Section Headline">
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Heading</label>
                <input
                  type="text"
                  name="contact_heading"
                  value={form.contact_heading}
                  onChange={handleChange}
                  placeholder="Let's Connect"
                  className={inputCls}
                />
                <p className="text-[11px] text-ink-muted mt-1.5">Displayed as the large title. A <strong>.</strong> is automatically appended.</p>
              </div>
              <div>
                <label className={labelCls}>Subheading / Description</label>
                <textarea
                  name="contact_subheading"
                  value={form.contact_subheading}
                  onChange={handleChange}
                  placeholder="I'm open to collaborations, internships, workshops..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-[11px] text-ink-muted mt-1.5">Short paragraph under the heading that describes your collaboration intent.</p>
              </div>
            </div>
          </AdminCard>

          {/* Live mini-preview */}
          <AdminCard title="Preview">
            <div className="relative rounded-2xl border border-line/40 bg-bg overflow-hidden p-8">
              <div className="absolute inset-0 opacity-[0.025]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative space-y-3">
                <p className="text-[10px] font-mono text-accent uppercase tracking-widest border border-accent/20 bg-accent/8 inline-block px-2.5 py-1 rounded-full">Contact</p>
                <h3 className="font-display font-black text-ink text-3xl leading-tight" style={{ letterSpacing: '-0.025em' }}>
                  {form.contact_heading || 'Let\'s Connect'}
                  <span className="text-accent">.</span>
                </h3>
                <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
                  {form.contact_subheading || 'I\'m open to collaborations, internships, workshops...'}
                </p>
              </div>
            </div>
          </AdminCard>

        </div>
      )}

      {/* ── Tab 2: Career Status ── */}
      {activeTab === 'status' && (
        <div className="space-y-6">

          <AdminCard title="Open to Work Status">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, open_to_work: !prev.open_to_work }))}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all text-sm font-semibold ${
                  form.open_to_work
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-bg-surface border-line text-ink-muted hover:border-accent/20'
                }`}
              >
                {form.open_to_work
                  ? <ToggleRight size={22} className="text-green-400" />
                  : <ToggleLeft size={22} />}
                {form.open_to_work ? 'Status: OPEN to opportunities' : 'Status: NOT open currently'}
              </button>
              {form.open_to_work && (
                <div>
                  <label className={labelCls}>Badge Text</label>
                  <input
                    type="text"
                    name="open_to_work_text"
                    value={form.open_to_work_text}
                    onChange={handleChange}
                    placeholder="Available for internships"
                    className={inputCls}
                  />
                  <p className="text-[11px] text-ink-muted mt-1.5">Short text shown on the pulsing green badge in the contact section.</p>
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard title="Availability Scope">
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Preset Options (click to toggle)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AVAILABLE_FOR_PRESETS.map(p => {
                    const active = form.available_for.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePreset(p)}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                          active
                            ? 'bg-accent/12 border-accent/35 text-accent'
                            : 'bg-bg-surface border-line text-ink-muted hover:border-accent/20 hover:text-ink'
                        }`}
                      >
                        {active ? '✓ ' : ''}{p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Add Custom Item</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    placeholder="e.g. Research partnerships"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2.5 bg-accent text-bg rounded-xl text-sm font-bold hover:bg-accent-light transition-colors shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {form.available_for.length > 0 && (
                <div>
                  <label className={labelCls}>Current List</label>
                  <div className="space-y-2">
                    {form.available_for.map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-bg-surface rounded-xl border border-line group hover:border-line-strong transition-colors">
                        <span className="text-sm text-ink flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          className="text-ink-muted/40 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/8"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AdminCard>

        </div>
      )}

      {/* ── Tab 3: Contact Details ── */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">

          <AdminCard title="Contact Links">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="adhi2003@hotmail.com" className={`${inputCls} pl-10`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>GitHub URL</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" />
                  <input type="url" name="github" value={form.github} onChange={handleChange}
                    placeholder="https://github.com/adhibiz" className={`${inputCls} pl-10`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>LinkedIn URL</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" />
                  <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange}
                    placeholder="https://linkedin.com/in/..." className={`${inputCls} pl-10`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Instagram URL</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" />
                  <input type="url" name="instagram" value={form.instagram} onChange={handleChange}
                    placeholder="https://instagram.com/..." className={`${inputCls} pl-10`} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Location</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" />
                  <input type="text" name="location_current" value={form.location_current} onChange={handleChange}
                    placeholder="Chennai / Tenkasi, TN" className={`${inputCls} pl-10`} />
                </div>
              </div>

            </div>
          </AdminCard>

          {/* Contact cards mini-preview */}
          <AdminCard title="Live Card Preview">
            <div className="space-y-2.5">
              {[
                { icon: <Mail size={14} />, label: 'Email',     value: form.email     || '—', accent: '#6366f1' },
                { icon: <Globe size={14} />, label: 'GitHub',   value: form.github    || '—', accent: '#e2e8f0' },
                { icon: <Globe size={14} />, label: 'LinkedIn', value: form.linkedin  || '—', accent: '#3b82f6' },
                { icon: <Globe size={14} />, label: 'Instagram',value: form.instagram || '—', accent: '#ec4899' },
                { icon: <MapPin size={14} />,label: 'Location', value: form.location_current || '—', accent: '#a78bfa' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line/50 bg-bg-surface/60">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${c.accent}15`, color: c.accent }}>
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono font-bold text-ink-muted/50 uppercase tracking-wider">{c.label}</p>
                    <p className="text-xs font-semibold text-ink truncate">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

        </div>
      )}

    </div>
  );
};
