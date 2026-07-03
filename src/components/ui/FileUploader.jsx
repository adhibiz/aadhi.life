import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, Link as LinkIcon, HardDrive, Images } from 'lucide-react';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { useCollection, useDocument } from '../../hooks/useFirestore';
import { validateFileType, validateFileSize } from '../../cloudinary/validate';

export const FileUploader = ({ 
 folder, 
 accept = "*", 
 maxSizeMB = 10,
 currentUrl, 
 currentPublicId, 
 onUploadComplete, 
 onDelete, 
 label = "Upload File" 
}) => {
 const fileInputRef = useRef(null);
 const [dragActive, setDragActive] = useState(false);
 const [localError, setLocalError] = useState(null);
 
 // Option: 'upload', 'url', or 'gallery'
 const [sourceOption, setSourceOption] = useState('upload');
 const [urlInput, setUrlInput] = useState('');

 // Fetch collections for option 3 (Gallery Reuse)
 const { documents: projects } = useCollection('projects');
 const { documents: posts } = useCollection('blog_posts');
 const { document: profile } = useDocument('site_meta', 'profile');

 const { upload, isUploading, progress, error: uploadError } = useCloudinaryUpload();

 const handleFile = async (file) => {
 if (!file) return;
 setLocalError(null);

 const typeValidation = validateFileType(file);
 if (!typeValidation.valid) {
  setLocalError(typeValidation.error);
  return;
 }

 const sizeValidation = validateFileSize(file);
 if (!sizeValidation.valid) {
  setLocalError(sizeValidation.error);
  return;
 }

 try {
  const result = await upload(file, folder);
  if (onUploadComplete) onUploadComplete({ secureUrl: result.secureUrl, publicId: result.publicId });
 } catch (err) {
  console.error(err);
 }
 };

 const handleChange = (e) => {
 e.preventDefault();
 if (e.target.files && e.target.files[0]) {
  handleFile(e.target.files[0]);
 }
 };

 const handleDrop = useCallback((e) => {
 e.preventDefault();
 e.stopPropagation();
 setDragActive(false);
 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
  handleFile(e.dataTransfer.files[0]);
 }
 }, []);

 const handleDrag = useCallback((e) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.type === "dragenter" || e.type === "dragover") {
  setDragActive(true);
 } else if (e.type === "dragleave") {
  setDragActive(false);
 }
 }, []);

 const handleDelete = async (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (onDelete) {
  onDelete();
 }
 setUrlInput('');
 };

 const handleUrlSubmit = (e) => {
 e.preventDefault();
 setLocalError(null);
 if (!urlInput.trim()) return;

 if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
  setLocalError('Please enter a valid URL starting with http:// or https://');
  return;
 }

 if (onUploadComplete) {
  onUploadComplete({ secureUrl: urlInput.trim(), publicId: "" });
 }
 };

 // Build list of unique reusable gallery images
 const getGalleryImages = () => {
 const imagesMap = {};

 const addImg = (url, publicId) => {
  if (!url) return;
  const clean = url.trim();
  if (!clean) return;
  if (!imagesMap[clean]) {
  imagesMap[clean] = { url: clean, publicId: publicId || '' };
  }
 };

 if (profile?.profile_image_url) {
  addImg(profile.profile_image_url, profile.profile_image_public_id);
 }
 projects?.forEach(p => addImg(p.cover_image_url, p.cover_image_public_id));
 posts?.forEach(p => addImg(p.cover_image_url, p.cover_image_public_id));

 return Object.values(imagesMap);
 };

 const galleryImages = getGalleryImages();
 const displayError = localError || uploadError;

 return (
 <div className="w-full space-y-3">
  {/* Source Option Selection Buttons (Only show when there is no current image) */}
  {!currentUrl && (
  <div className="flex border border-line rounded-lg overflow-hidden bg-bg-surface/40 w-fit flex-wrap">
   <button
   type="button"
   onClick={() => { setSourceOption('upload'); setLocalError(null); }}
   className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
    sourceOption === 'upload' 
    ? 'bg-accent text-bg' 
    : 'text-ink-muted hover:text-ink '
   }`}
   >
   <HardDrive size={16} />
   <span>Upload Image</span>
   </button>
   <button
   type="button"
   onClick={() => { setSourceOption('url'); setLocalError(null); }}
   className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
    sourceOption === 'url' 
    ? 'bg-accent text-bg' 
    : 'text-ink-muted hover:text-ink '
   }`}
   >
   <LinkIcon size={16} />
   <span>Image URL</span>
   </button>
   <button
   type="button"
   onClick={() => { setSourceOption('gallery'); setLocalError(null); }}
   className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
    sourceOption === 'gallery' 
    ? 'bg-accent text-bg' 
    : 'text-ink-muted hover:text-ink '
   }`}
   >
   <Images size={16} />
   <span>Gallery Reuse</span>
   </button>
  </div>
  )}

  {currentUrl ? (
  <div className="relative rounded-xl overflow-hidden bg-bg-surface border border-line group">
   <div className="aspect-video w-full flex items-center justify-center bg-black/10">
   <img 
    src={currentUrl} 
    alt="Preview" 
    className="w-full h-full object-cover"
    onError={(e) => {
    e.target.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60";
    }}
   />
   </div>
   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
   <button
    onClick={(e) => {
    e.preventDefault();
    if (onDelete) onDelete();
    setUrlInput('');
    }}
    className="px-4 py-2 bg-bg-surface hover:bg-bg-hover text-ink rounded-lg transition-colors font-medium flex items-center gap-2"
   >
    <ImageIcon size={18} /> Replace
   </button>
   <button
    onClick={handleDelete}
    className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-ink rounded-lg transition-colors"
   >
    <X size={20} />
   </button>
   </div>
   <input 
   ref={fileInputRef}
   type="file" 
   className="hidden" 
   accept={accept}
   onChange={handleChange}
   />
  </div>
  ) : (
  <>
   {sourceOption === 'upload' && (
   <label 
    className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl cursor-pointer transition-colors relative overflow-hidden
    ${dragActive ? 'border-accent bg-accent/5' : 'border-line bg-bg-surface hover:bg-bg-surface'}
    ${isUploading ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''}
    ${displayError ? 'border-red-500/50 bg-red-500/5' : ''}
    `}
    onDragEnter={handleDrag}
    onDragLeave={handleDrag}
    onDragOver={handleDrag}
    onDrop={handleDrop}
   >
    {isUploading ? (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full bg-bg-surface/50 backdrop-blur-sm">
     <Loader2 className="w-8 h-8 mb-4 text-accent animate-spin" />
     <div className="w-full max-w-xs bg-bg-hover rounded-full h-2 mb-2">
     <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
     </div>
     <p className="text-sm font-medium text-ink ">{progress}% Uploading...</p>
    </div>
    ) : (
    <div className="flex flex-col items-center justify-center pt-6 pb-6 px-4 text-center">
     <UploadCloud className={`w-10 h-10 mb-4 ${dragActive ? 'text-accent' : 'text-ink-muted'}`} />
     <p className="mb-2 text-sm text-ink-muted">
     <span className="font-semibold text-ink ">Click to upload</span> or drag and drop
     </p>
     <p className="text-xs text-ink-muted">{label} (Max {maxSizeMB}MB)</p>
    </div>
    )}
    
    <input 
    ref={fileInputRef}
    type="file" 
    className="hidden" 
    accept={accept}
    onChange={handleChange}
    disabled={isUploading}
    />
   </label>
   )}

   {sourceOption === 'url' && (
   <form onSubmit={handleUrlSubmit} className="flex gap-2">
    <input
    type="text"
    placeholder="Paste direct image link (https://...)"
    value={urlInput}
    onChange={(e) => setUrlInput(e.target.value)}
    className="flex-1 bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
    />
    <button
    type="submit"
    className="bg-accent text-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-light transition-colors"
    >
    Apply
    </button>
   </form>
   )}

   {sourceOption === 'gallery' && (
   <div className="border border-line rounded-xl p-4 bg-bg-surface space-y-3">
    <p className="text-xs text-ink-muted uppercase font-bold tracking-wider">Select an image to reuse</p>
    {galleryImages.length === 0 ? (
    <p className="text-sm text-ink-muted py-4 text-center">No images found in your gallery.</p>
    ) : (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-1">
     {galleryImages.map((img, idx) => (
     <div 
      key={idx}
      onClick={() => {
      if (onUploadComplete) {
       onUploadComplete({ secureUrl: img.url, publicId: img.publicId });
      }
      }}
      className="aspect-square bg-bg-surface rounded-lg overflow-hidden border border-line hover:border-accent cursor-pointer transition-colors relative group"
     >
      <img 
      src={img.url} 
      alt="Gallery" 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <span className="text-[10px] text-ink font-bold bg-accent/90 px-1.5 py-0.5 rounded">Select</span>
      </div>
     </div>
     ))}
    </div>
    )}
   </div>
   )}
  </>
  )}
  
  {displayError && (
  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
   <X size={14} /> {displayError}
  </p>
  )}
 </div>
 );
};
