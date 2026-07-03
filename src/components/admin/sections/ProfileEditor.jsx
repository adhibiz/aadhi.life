import React, { useState, useEffect, useRef } from 'react';
import { useDocument } from '../../../hooks/useFirestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { AdminCard } from '../AdminCard';
import { CloudinaryImage } from '../../ui/CloudinaryImage';
import { Camera, FileText, Trash2, Loader2, Link } from 'lucide-react';
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
  showToast("Profile saved");
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

  showToast("Resume uploaded");
 } catch (error) {
  console.error(error);
  showToast("Failed to upload resume", "error");
 } finally {
  setIsUploadingResume(false);
  setResumeProgress(0);
  if (resumeInputRef.current) resumeInputRef.current.value = '';
 }
 };

 const availableForOptions = [
 "Internships", "Freelance projects", "Workshop facilitation", "Collaborations", "Speaking / Guest sessions"
 ];

 return (
 <div className="space-y-6 max-w-4xl">
  <div className="flex items-center justify-between">
  <h2 className="text-2xl font-display font-bold text-ink ">Profile & Photo</h2>
  <button
   onClick={handleSave}
   disabled={isSaving}
   className="bg-accent text-bg px-6 py-2 rounded-lg font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
  >
   {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
  </button>
  </div>

  <AdminCard title="Profile Photo">
  <div className="flex flex-col items-center">
   <div className="w-32 h-32 rounded-full overflow-hidden bg-bg-surface border-4 border-line relative mb-6">
   {isUploadingPhoto ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
    <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
    <span className="text-xs font-medium text-ink ">{photoProgress}%</span>
    </div>
   ) : profile?.profile_image_url ? (
    <img 
    src={profile.profile_image_url}
    alt="Profile"
    className="w-full h-full object-cover"
    />
   ) : (
    <div className="w-full h-full flex items-center justify-center bg-accent text-bg font-display font-bold text-5xl">
    {formData.name?.charAt(0) || "A"}
    </div>
   )}
   </div>

   <div className="flex items-center gap-4">
   <button
    onClick={() => fileInputRef.current?.click()}
    className="flex items-center gap-2 bg-bg-surface hover:bg-bg-hover text-ink px-4 py-2 rounded-lg transition-colors border border-line"
   >
    <Camera size={18} />
    <span>Change Photo</span>
   </button>
   {profile?.profile_image_public_id && (
    <button
    onClick={handleRemovePhoto}
    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
    title="Remove photo"
    >
    <Trash2 size={20} />
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

  <AdminCard title="Basic Information">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Display Name</label>
   <input
    type="text"
    name="name"
    value={formData.name || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Tagline</label>
   <input
    type="text"
    name="tagline"
    value={formData.tagline || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div className="md:col-span-2">
   <label className="block text-sm font-medium text-ink-muted mb-2">Bio</label>
   <textarea
    name="bio"
    value={formData.bio || ''}
    onChange={handleChange}
    rows={4}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors resize-none"
   />
   </div>
  </div>
  </AdminCard>

  <AdminCard title="ÃƒÂ°Ã…Â¸Ã‚Â¦Ã‚Â¸ Hero Section">
  <p className="text-sm text-ink-muted mb-6">Controls the big headline section at the top of your homepage.</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Hero Name (Big Heading)</label>
   <input
    type="text"
    name="hero_name"
    value={formData.hero_name || ''}
    onChange={handleChange}
    placeholder="e.g. Aadhi"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Hero Tagline (Below Name)</label>
   <input
    type="text"
    name="hero_tagline"
    value={formData.hero_tagline || ''}
    onChange={handleChange}
    placeholder="e.g. Learning. Building. Sharing."
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div className="md:col-span-2">
   <label className="block text-sm font-medium text-ink-muted mb-2">Hero Bio (Short Description)</label>
   <textarea
    name="hero_bio"
    value={formData.hero_bio || ''}
    onChange={handleChange}
    rows={3}
    placeholder="e.g. Self-taught developer from Tenkasi..."
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors resize-none"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Status Badge Text</label>
   <input
    type="text"
    name="hero_status"
    value={formData.hero_status || ''}
    onChange={handleChange}
    placeholder="e.g. Available for new challenges"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Code Block Task Line</label>
   <input
    type="text"
    name="hero_code_task"
    value={formData.hero_code_task || ''}
    onChange={handleChange}
    placeholder="e.g. Creating impact"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Primary CTA Button</label>
   <input
    type="text"
    name="hero_cta1"
    value={formData.hero_cta1 || ''}
    onChange={handleChange}
    placeholder="e.g. See my work"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Secondary CTA Button</label>
   <input
    type="text"
    name="hero_cta2"
    value={formData.hero_cta2 || ''}
    onChange={handleChange}
    placeholder="e.g. My story"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
  </div>
  </AdminCard>

  <AdminCard title="ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬â€œ About Section">
  <p className="text-sm text-ink-muted mb-6">Controls the About Me section on the homepage. Bio text above (split by new lines) becomes paragraphs.</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Current Education</label>
   <input
    type="text"
    name="current_education"
    value={formData.current_education || ''}
    onChange={handleChange}
    placeholder="e.g. B.Tech IT lateral entry (final year)"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">College / Institution</label>
   <input
    type="text"
    name="current_college"
    value={formData.current_college || ''}
    onChange={handleChange}
    placeholder="e.g. Saveetha Engineering College, Chennai"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Experience Summary</label>
   <input
    type="text"
    name="experience_years"
    value={formData.experience_years || ''}
    onChange={handleChange}
    placeholder="e.g. 7+ years self-learning"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Focus Area</label>
   <input
    type="text"
    name="focus_area"
    value={formData.focus_area || ''}
    onChange={handleChange}
    placeholder="e.g. Unreal Engine 5 & Systems"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div className="md:col-span-2">
   <label className="block text-sm font-medium text-ink-muted mb-2">Personality Badges (comma-separated)</label>
   <input
    type="text"
    name="badges_raw"
    value={formData.badges ? formData.badges.join(', ') : ''}
    onChange={(e) => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, badges: arr }));
    }}
    placeholder="e.g. Night owl ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¢, Audiobook listener ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â§, Builder in public ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¨"
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   <p className="text-xs text-ink-muted mt-1">Separate each badge with a comma</p>
   </div>
  </div>
  </AdminCard>

  <AdminCard title="Contact & Social">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Email Address</label>
   <input
    type="email"
    name="email"
    value={formData.email || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Phone (Optional)</label>
   <input
    type="text"
    name="phone"
    value={formData.phone || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Current Location</label>
   <input
    type="text"
    name="location_current"
    value={formData.location_current || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Home Town</label>
   <input
    type="text"
    name="location_home"
    value={formData.location_home || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">GitHub URL</label>
   <input
    type="url"
    name="github"
    value={formData.github || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">LinkedIn URL</label>
   <input
    type="url"
    name="linkedin"
    value={formData.linkedin || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
   <div>
   <label className="block text-sm font-medium text-ink-muted mb-2">Instagram URL</label>
   <input
    type="url"
    name="instagram"
    value={formData.instagram || ''}
    onChange={handleChange}
    className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors"
   />
   </div>
  </div>
  </AdminCard>

  <AdminCard title="Status & Availability">
  <div className="space-y-6">
   <label className="flex items-center gap-3 p-4 bg-bg-surface border border-line rounded-lg cursor-pointer hover:bg-bg-hover/50 transition-colors">
   <input
    type="checkbox"
    name="open_to_work"
    checked={formData.open_to_work || false}
    onChange={handleChange}
    className="w-5 h-5 accent-accent rounded border-line bg-bg-surface"
   />
   <div>
    <p className="text-ink font-medium">Open to work / Internships</p>
    <p className="text-sm text-ink-muted">Show availability badge on contact page</p>
   </div>
   </label>

   <div>
   <label className="block text-sm font-medium text-ink-muted mb-4">Available For</label>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {availableForOptions.map(option => (
    <label key={option} className="flex items-center gap-3">
     <input
     type="checkbox"
     value={option}
     checked={(formData.available_for || []).includes(option)}
     onChange={(e) => handleArrayChange(e, 'available_for')}
     className="w-4 h-4 accent-accent rounded border-line"
     />
     <span className="text-ink-muted">{option}</span>
    </label>
    ))}
   </div>
   </div>
  </div>
  </AdminCard>

  <AdminCard title="Resume (PDF)">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg-surface border border-line rounded-lg">
   <div className="flex items-center gap-3">
   <div className="p-3 bg-bg-hover rounded-lg text-accent">
    <FileText size={24} />
   </div>
   <div>
    <p className="text-ink font-medium">Current Resume</p>
    {profile?.resume_url ? (
    <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1 mt-1">
     <Link size={14} /> View Document
    </a>
    ) : (
    <p className="text-sm text-ink-muted">No resume uploaded</p>
    )}
   </div>
   </div>
   
   <div className="flex items-center gap-3 w-full sm:w-auto">
   {isUploadingResume && (
    <span className="text-sm text-ink-muted font-medium mr-2">{resumeProgress}%</span>
   )}
   <button
    onClick={() => resumeInputRef.current?.click()}
    disabled={isUploadingResume}
    className="w-full sm:w-auto px-4 py-2 bg-bg-hover hover:bg-bg-hover text-ink font-medium rounded-lg transition-colors border border-line"
   >
    {isUploadingResume ? 'Uploading...' : (profile?.resume_url ? 'Replace File' : 'Upload File')}
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
   <div className="mt-6 border border-line rounded-xl overflow-hidden h-[600px] w-full bg-bg-surface relative shadow-inner">
   <object 
    data={profile.resume_url} 
    type="application/pdf" 
    className="w-full h-full rounded-xl"
   >
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
    <p className="text-ink-muted mb-4">Your browser or document does not support inline PDF viewing.</p>
    <a 
     href={profile.resume_url} 
     target="_blank" 
     rel="noreferrer" 
     className="bg-accent text-bg px-6 py-2.5 rounded-lg font-semibold hover:bg-accent-light transition-colors"
    >
     Open Resume PDF
    </a>
    </div>
   </object>
   </div>
  )}
  </AdminCard>
 </div>
 );
};
