import React, { useState, useEffect, useRef } from 'react';
import { useDocument } from '../../../hooks/useFirestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { AdminCard } from '../AdminCard';
import { 
  Camera, FileText, Trash2, Loader2, Link, User, Sparkles, 
  BookOpen, Briefcase, Mail, Phone, MapPin, Info, Monitor, ToggleLeft, ToggleRight, Clock
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { uploadFile, deleteFile } from '../../../cloudinary/upload';
import { validateFileType, validateFileSize } from '../../../cloudinary/validate';

const availableForOptions = [
  'Internships',
  'Freelance projects',
  'Workshop facilitation',
  'Collaborations',
  'Speaking / Guest sessions'
];

export const ProfileEditor = ({ showToast }) => {
  const { document: profile, loading } = useDocument('site_meta', 'profile');
  const { document: loadingDoc } = useDocument('site_meta', 'loading_screen');
  const [formData, setFormData] = useState({});
  const [loadingForm, setLoadingForm] = useState({
    enabled: true,
    title: '',
    tagline: '',
    domain_suffix: '.life',
    duration_seconds: 4,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLoading, setIsSavingLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState('basic');

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (loadingDoc) {
      setLoadingForm(prev => ({ ...prev, ...loadingDoc }));
    }
  }, [loadingDoc]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const array = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...array, value] };
      } else {
        return { ...prev, [field]: array.filter(item => item !== value) };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'site_meta', 'profile');
      
      // Sanitize undefined fields from formData before saving
      const cleanedData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) {
          cleanedData[key] = formData[key];
        }
      });

      await setDoc(docRef, cleanedData, { merge: true });
      showToast("Profile saved successfully");
    } catch (error) {
      console.error(error);
      showToast(`Failed to save profile: ${error.message || error}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) return showToast(typeValidation.error, "error");

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) return showToast(sizeValidation.error, "error");

    setIsUploadingPhoto(true);
    try {
      const result = await uploadFile(file, 'profile', setPhotoProgress);
      
      const docRef = doc(db, 'site_meta', 'profile');
      await updateDoc(docRef, {
        profile_image_url: result.secureUrl,
        profile_image_public_id: result.publicId
      });

      if (profile.profile_image_public_id) {
        await deleteFile(profile.profile_image_public_id, 'image');
      }

      showToast("Profile photo updated");
    } catch (error) {
      console.error(error);
      showToast("Failed to upload photo", "error");
    } finally {
      setIsUploadingPhoto(false);
      setPhotoProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile.profile_image_public_id) return;
    
    try {
      await deleteFile(profile.profile_image_public_id, 'image');
      const docRef = doc(db, 'site_meta', 'profile');
      await updateDoc(docRef, {
        profile_image_url: "",
        profile_image_public_id: ""
      });
      showToast("Profile photo removed");
    } catch (error) {
      console.error(error);
      showToast("Failed to remove photo", "error");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) return showToast(sizeValidation.error, "error");

    setIsUploadingResume(true);
    try {
      const result = await uploadFile(file, 'resumes', setResumeProgress);
      
      const docRef = doc(db, 'site_meta', 'profile');
      await updateDoc(docRef, {
        resume_url: result.secureUrl,
        resume_public_id: result.publicId
      });

      if (profile.resume_public_id) {
        await deleteFile(profile.resume_public_id, 'raw');
      }

      showToast("Resume uploaded successfully");
    } catch (error) {
      console.error(error);
      showToast("Failed to upload resume", "error");
    } finally {
      setIsUploadingResume(false);
      setResumeProgress(0);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const handleSaveLoadingScreen = async () => {
    setIsSavingLoading(true);
    try {
      const docRef = doc(db, 'site_meta', 'loading_screen');
      await setDoc(docRef, loadingForm, { merge: true });
      showToast('Loading screen settings saved!');
    } catch (error) {
      console.error(error);
      showToast(`Failed to save: ${error.message}`, 'error');
    } finally {
      setIsSavingLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info & Photo', icon: <User size={16} /> },
    { id: 'hero', label: 'Hero Header Settings', icon: <Sparkles size={16} /> },
    { id: 'about', label: 'About & Journey', icon: <BookOpen size={16} /> },
    { id: 'resume', label: 'Resume & Career', icon: <Briefcase size={16} /> },
    { id: 'loading', label: 'Loading Screen', icon: <Monitor size={16} /> }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Title section with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/45 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-none">Profile & Branding Editor</h2>
          <p className="text-xs text-ink-muted mt-2">Manage the text, social handles, images, and resume displayed on the homepage.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-accent text-bg px-6 py-2.5 rounded-xl font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </div>

      {/* Sub-tabs Nav */}
      <div className="flex flex-wrap gap-2 border-b border-line/40 pb-2">
        {tabs.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
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

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* Tab 1: Basic Info & Photo */}
        {activeSubTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Photo Upload */}
            <div className="lg:col-span-4">
              <AdminCard title="Avatar Image">
                <div className="flex flex-col items-center py-4">
                  <div className="w-36 h-36 rounded-full overflow-hidden bg-bg-surface border-4 border-line/70 relative mb-6 group shadow-inner">
                    {isUploadingPhoto ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
                        <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
                        <span className="text-xs font-mono font-bold text-ink">{photoProgress}%</span>
                      </div>
                    ) : profile?.profile_image_url ? (
                      <img 
                        src={profile.profile_image_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent font-display font-black text-5xl">
                        {formData.name?.charAt(0) || "A"}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-bg-surface hover:bg-bg-hover text-ink text-xs font-semibold px-4 py-2 rounded-xl transition-colors border border-line"
                    >
                      <Camera size={14} className="text-accent" />
                      <span>Upload Photo</span>
                    </button>
                    {profile?.profile_image_public_id && (
                      <button
                        onClick={handleRemovePhoto}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </AdminCard>
            </div>

            {/* Right: Info fields */}
            <div className="lg:col-span-8 space-y-6">
              <AdminCard title="General Identity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      placeholder="e.g. Aadhi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Tagline</label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline || ''}
                      onChange={handleChange}
                      className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      placeholder="e.g. Visual Engineer"
                    />
                  </div>
                </div>
              </AdminCard>

              <AdminCard title="Contact Coordinates">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Current Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="text"
                        name="location_current"
                        value={formData.location_current || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                        placeholder="e.g. Chennai, India"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Hometown</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="text"
                        name="location_home"
                        value={formData.location_home || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                        placeholder="e.g. Tenkasi, TN"
                      />
                    </div>
                  </div>
                </div>
              </AdminCard>

              <AdminCard title="Social Handles">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">GitHub</label>
                    <div className="relative">
                      <FaGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="url"
                        name="github"
                        value={formData.github || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">LinkedIn</label>
                    <div className="relative">
                      <FaLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Instagram</label>
                    <div className="relative">
                      <FaInstagram className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/50" size={16} />
                      <input
                        type="url"
                        name="instagram"
                        value={formData.instagram || ''}
                        onChange={handleChange}
                        className="w-full bg-bg-surface border border-line rounded-xl pl-11 pr-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>
              </AdminCard>
            </div>
          </div>
        )}

        {/* Tab 2: Hero Header Settings */}
        {activeSubTab === 'hero' && (
          <div className="space-y-6">
            <AdminCard title="Hero Text Overlay">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Hero Header Name (Big title)</label>
                  <input
                    type="text"
                    name="hero_name"
                    value={formData.hero_name || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Aadhi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Hero Tagline</label>
                  <input
                    type="text"
                    name="hero_tagline"
                    value={formData.hero_tagline || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Learning. Building. Sharing."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Hero Description Paragraph</label>
                <textarea
                  name="hero_bio"
                  value={formData.hero_bio || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm resize-none leading-relaxed"
                  placeholder="Tell a brief summary of who you are and what you craft..."
                />
              </div>
            </AdminCard>

            <AdminCard title="Status Badge & Code Mockup settings">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Availability Badge Status</label>
                  <input
                    type="text"
                    name="hero_status"
                    value={formData.hero_status || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Available for new challenges"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Code Block - Mission Line</label>
                  <input
                    type="text"
                    name="hero_code_task"
                    value={formData.hero_code_task || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Creating impact"
                  />
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Call-To-Action Button Labels">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Primary Button Text (Scrolls to Projects)</label>
                  <input
                    type="text"
                    name="hero_cta1"
                    value={formData.hero_cta1 || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. See my work"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Secondary Button Text (Scrolls to About)</label>
                  <input
                    type="text"
                    name="hero_cta2"
                    value={formData.hero_cta2 || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. My story"
                  />
                </div>
              </div>
            </AdminCard>
            <AdminCard title="Hero Mockup IDE Tech Stack (stack.js)">
              <p className="text-xs text-ink-muted mb-4">Customize the array contents shown in the interactive IDE window's <code>stack.js</code> tab.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Languages (comma-separated)</label>
                  <input
                    type="text"
                    name="hero_languages_raw"
                    value={formData.hero_languages ? formData.hero_languages.join(', ') : ''}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, hero_languages: arr }));
                    }}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. C++, C#, Rust, JS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Engines (comma-separated)</label>
                  <input
                    type="text"
                    name="hero_engines_raw"
                    value={formData.hero_engines ? formData.hero_engines.join(', ') : ''}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, hero_engines: arr }));
                    }}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Unreal Engine 5, Unity"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Web Stack (comma-separated)</label>
                  <input
                    type="text"
                    name="hero_web_raw"
                    value={formData.hero_web ? formData.hero_web.join(', ') : ''}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, hero_web: arr }));
                    }}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. React, Tailwind, Node.js"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Systems concepts (comma-separated)</label>
                  <input
                    type="text"
                    name="hero_systems_raw"
                    value={formData.hero_systems ? formData.hero_systems.join(', ') : ''}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, hero_systems: arr }));
                    }}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Multithreading, Memory Management"
                  />
                </div>
              </div>
            </AdminCard>
          </div>
        )}

        {/* Tab 3: About & Journey */}
        {activeSubTab === 'about' && (
          <div className="space-y-6">
            <AdminCard title="About Story Biography">
              <div className="flex items-center gap-2 mb-4 bg-accent/5 border border-accent/15 p-3 rounded-xl text-ink-muted text-xs leading-relaxed">
                <Info size={16} className="text-accent shrink-0" />
                <p>Divide your bio story using new line breaks. Each paragraph will map to one of the tabs in your **My Journey** chronological viewer (The Pivot, Self-Learning, Academia, Philosophy).</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Story Paragraphs (separate by newline)</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows={8}
                  className="w-full bg-bg-surface border border-line rounded-xl px-4 py-3 text-ink focus:border-accent focus:outline-none transition-colors text-sm resize-y leading-relaxed font-mono"
                  placeholder="Enter 4 paragraphs for the 4 journey tabs..."
                />
              </div>
            </AdminCard>

            <AdminCard title="Chronological Stats Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Current Education Degree</label>
                  <input
                    type="text"
                    name="current_education"
                    value={formData.current_education || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. B.Tech IT lateral entry (final year)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">College / Institution</label>
                  <input
                    type="text"
                    name="current_college"
                    value={formData.current_college || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Saveetha Engineering College, Chennai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Self-Learning / Coding Experience</label>
                  <input
                    type="text"
                    name="experience_years"
                    value={formData.experience_years || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. 7+ years self-learning"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Main Tech Focus Area</label>
                  <input
                    type="text"
                    name="focus_area"
                    value={formData.focus_area || ''}
                    onChange={handleChange}
                    className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                    placeholder="e.g. Unreal Engine 5 & Systems"
                  />
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Personality Badge Pill Tags">
              <div>
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Badges list (comma-separated)</label>
                <input
                  type="text"
                  name="badges_raw"
                  value={formData.badges ? formData.badges.join(', ') : ''}
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, badges: arr }));
                  }}
                  className="w-full bg-bg-surface border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                  placeholder="e.g. Night owl 🦉, Audiobook listener 🎧, Builder in public 🛠️"
                />
                <p className="text-[10px] text-ink-muted mt-2 font-mono">Use comma (,) to split each badge. Badges will display nicely with emojis.</p>
              </div>
            </AdminCard>
          </div>
        )}

        {/* Tab 4: Resume & Career */}
        {activeSubTab === 'resume' && (
          <div className="space-y-6">
            <AdminCard title="Career Open Status">
              <div className="space-y-6">
                <div className="p-4 bg-bg-surface border border-line rounded-2xl transition-all space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="open_to_work"
                      checked={formData.open_to_work || false}
                      onChange={handleChange}
                      className="w-5 h-5 accent-accent rounded border-line bg-bg-surface mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink leading-tight">Open to Work / Internships</p>
                      <p className="text-xs text-ink-muted mt-1 leading-normal">Adds a live Green availability badge indicator on your Contact/Footer pages.</p>
                    </div>
                  </label>

                  {formData.open_to_work && (
                    <div className="pl-8 pt-2 border-t border-line/40">
                      <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Availability Badge Text</label>
                      <input
                        type="text"
                        name="open_to_work_text"
                        value={formData.open_to_work_text || ''}
                        onChange={handleChange}
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                        placeholder="e.g. Available for internships"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Available For Roles:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
                    {availableForOptions.map(option => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          value={option}
                          checked={(formData.available_for || []).includes(option)}
                          onChange={(e) => handleArrayChange(e, 'available_for')}
                          className="w-4 h-4 accent-accent rounded border-line"
                        />
                        <span className="text-sm text-ink-muted hover:text-ink transition-colors">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Resume (PDF File Manager)">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg-surface border border-line rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink leading-none">Your Resume PDF</p>
                    {profile?.resume_url ? (
                      <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 mt-2">
                        <Link size={12} /> View uploaded document
                      </a>
                    ) : (
                      <p className="text-xs text-ink-muted mt-1.5">No document uploaded yet</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {isUploadingResume && (
                    <span className="text-xs font-mono font-bold text-ink-muted mr-1">{resumeProgress}%</span>
                  )}
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="w-full sm:w-auto px-4 py-2 bg-bg-surface hover:bg-bg-hover text-ink text-xs font-semibold rounded-xl transition-colors border border-line shadow-sm"
                  >
                    {isUploadingResume ? 'Uploading...' : (profile?.resume_url ? 'Replace PDF' : 'Upload PDF')}
                  </button>
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>
              </div>

              {profile?.resume_url && (
                <div className="mt-6 border border-line rounded-2xl overflow-hidden h-[500px] w-full bg-bg-surface relative shadow-sm">
                  <object 
                    data={profile.resume_url} 
                    type="application/pdf" 
                    className="w-full h-full"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <p className="text-ink-muted text-sm mb-4">Your browser does not support inline PDF viewing.</p>
                      <a 
                        href={profile.resume_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-accent text-bg px-5 py-2 rounded-xl text-xs font-semibold hover:bg-accent-light transition-colors"
                      >
                        Open Resume PDF in New Tab
                      </a>
                    </div>
                  </object>
                </div>
              )}
            </AdminCard>
          </div>
        )}

        {/* Tab 5: Loading Screen */}
        {activeSubTab === 'loading' && (
          <div className="space-y-6">

            {/* Header row with its own save button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-bg-surface border border-line/50 rounded-2xl">
              <div>
                <h3 className="font-display font-bold text-ink text-lg leading-none">Intro Loading Screen</h3>
                <p className="text-xs text-ink-muted mt-1.5">Controls the cinematic splash that plays on the user's first visit. Changes take effect on reload.</p>
              </div>
              <button
                onClick={handleSaveLoadingScreen}
                disabled={isSavingLoading}
                className="bg-accent text-bg px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                {isSavingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Loading Screen'}
              </button>
            </div>

            {/* Enable / Disable toggle */}
            <AdminCard title="Visibility">
              <button
                type="button"
                onClick={() => setLoadingForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all text-sm font-semibold ${
                  loadingForm.enabled
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-bg-surface border-line text-ink-muted hover:border-accent/20'
                }`}
              >
                {loadingForm.enabled
                  ? <ToggleRight size={22} className="text-accent" />
                  : <ToggleLeft size={22} />}
                {loadingForm.enabled ? 'Loading screen is ENABLED' : 'Loading screen is DISABLED'}
              </button>
              <p className="text-xs text-ink-muted mt-3">When disabled, visitors go straight to the site without seeing the intro animation.</p>
            </AdminCard>

            {/* Text content */}
            <AdminCard title="Content & Text">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">Display Name / Title</label>
                  <input
                    type="text"
                    value={loadingForm.title}
                    onChange={e => setLoadingForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={profile?.name?.toLowerCase() || 'aadhi'}
                    className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <p className="text-[11px] text-ink-muted">Typed out character by character on screen. Defaults to your profile name.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">Domain Suffix</label>
                  <input
                    type="text"
                    value={loadingForm.domain_suffix}
                    onChange={e => setLoadingForm(prev => ({ ...prev, domain_suffix: e.target.value }))}
                    placeholder=".life"
                    className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <p className="text-[11px] text-ink-muted">Appended to the title (e.g. <code>.life</code> → <em>aadhi.life</em>).</p>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={loadingForm.tagline}
                    onChange={e => setLoadingForm(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Builder · Learner · Creator"
                    className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <p className="text-[11px] text-ink-muted">Short subtitle shown beneath the name after typing finishes.</p>
                </div>
              </div>
            </AdminCard>

            {/* Duration */}
            <AdminCard title="Duration">
              <div className="flex items-center gap-4">
                <Clock size={18} className="text-ink-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">Screen Duration</label>
                    <span className="text-sm font-mono font-bold text-accent">{loadingForm.duration_seconds}s</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={0.5}
                    value={loadingForm.duration_seconds}
                    onChange={e => setLoadingForm(prev => ({ ...prev, duration_seconds: parseFloat(e.target.value) }))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-ink-muted">
                    <span>2s (fast)</span>
                    <span>10s (cinematic)</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-ink-muted mt-3">The loading screen auto-dismisses after this many seconds. The typewriter + particles play within this window.</p>
            </AdminCard>

            {/* Live mini-preview */}
            <AdminCard title="Preview (miniature)">
              <div className="relative h-52 rounded-2xl overflow-hidden border border-line/50 bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
                {/* Ambient blobs */}
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)' }} />
                {/* Rings */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute w-9 h-9 rounded-full border border-indigo-500/50 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
                  <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
                    {(loadingForm.title || profile?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                </div>
                {/* Title */}
                <div className="text-center">
                  <p className="font-display font-black text-white text-lg leading-none">
                    {loadingForm.title || profile?.name?.toLowerCase() || 'aadhi'}
                    <span style={{ color: '#6366f1' }}>{loadingForm.domain_suffix || '.life'}</span>
                    <span className="text-indigo-400 ml-0.5 animate-pulse">|</span>
                  </p>
                  <p className="text-[10px] mt-1.5 uppercase tracking-widest font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {loadingForm.tagline || 'Builder · Learner · Creator'}
                  </p>
                </div>
                {/* Mini progress bar */}
                <div className="w-28 h-[2px] rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full w-2/3" style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7)' }} />
                </div>
              </div>
            </AdminCard>

          </div>
        )}

      </div>
    </div>
  );
};
