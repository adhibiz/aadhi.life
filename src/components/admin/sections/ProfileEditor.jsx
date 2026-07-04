import React, { useState, useEffect, useRef } from 'react';
import { useDocument } from '../../../hooks/useFirestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { AdminCard } from '../AdminCard';
import { 
  Camera, FileText, Trash2, Loader2, Link, User, Sparkles, 
  BookOpen, Briefcase, Mail, Phone, MapPin, Info
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
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
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
      await updateDoc(docRef, formData);
      showToast("Profile saved successfully");
    } catch (error) {
      console.error(error);
      showToast("Failed to save profile", "error");
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

  const tabs = [
    { id: 'basic', label: 'Basic Info & Photo', icon: <User size={16} /> },
    { id: 'hero', label: 'Hero Header Settings', icon: <Sparkles size={16} /> },
    { id: 'about', label: 'About & Journey', icon: <BookOpen size={16} /> },
    { id: 'resume', label: 'Resume & Career', icon: <Briefcase size={16} /> }
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
                <label className="flex items-start gap-3 p-4 bg-bg-surface border border-line rounded-2xl cursor-pointer hover:bg-bg-hover/20 transition-all select-none">
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

      </div>
    </div>
  );
};
