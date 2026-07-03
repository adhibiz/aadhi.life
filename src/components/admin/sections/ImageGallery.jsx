import React, { useState } from 'react';
import { useCollection, useDocument } from '../../../hooks/useFirestore';
import { AdminCard } from '../AdminCard';
import { Search, Filter, Eye, Link2, Calendar, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ImageGallery = () => {
 const { documents: projects, loading: loadingProjects } = useCollection('projects');
 const { documents: posts, loading: loadingPosts } = useCollection('blog_posts');
 const { document: profile, loading: loadingProfile } = useDocument('site_meta', 'profile');

 // Search and filter state
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedType, setSelectedType] = useState('All');
 const [selectedImage, setSelectedImage] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 const loading = loadingProjects || loadingPosts || loadingProfile;

 if (loading) {
 return (
  <div className="flex justify-center items-center h-64">
  <Loader2 className="w-8 h-8 text-accent animate-spin" />
  </div>
 );
 }

 // Aggregate used images
 const imagesMap = {};

 const addImage = (url, publicId, entityType, recordName, recordId, uploadDate) => {
 if (!url) return;
 const cleanUrl = url.trim();
 if (!cleanUrl) return;

 if (!imagesMap[cleanUrl]) {
  const filename = publicId ? publicId.split('/').pop() : cleanUrl.split('/').pop() || 'image';
  imagesMap[cleanUrl] = {
  url: cleanUrl,
  publicId: publicId || '',
  filename,
  uploadDate: uploadDate || new Date().toLocaleDateString(),
  usages: []
  };
 }
 // Prevent duplicate usages of the exact same entity/record association
 const isAlreadyUsages = imagesMap[cleanUrl].usages.some(
  u => u.entityType === entityType && u.recordId === recordId
 );
 if (!isAlreadyUsages) {
  imagesMap[cleanUrl].usages.push({
  entityType,
  recordName,
  recordId
  });
 }
 };

 // Add profile image
 if (profile?.profile_image_url) {
 addImage(
  profile.profile_image_url,
  profile.profile_image_public_id,
  'Profile',
  profile.name || 'Aadhi Profile',
  'profile',
  null
 );
 }

 // Add project images
 projects?.forEach(proj => {
 if (proj.cover_image_url) {
  addImage(
  proj.cover_image_url,
  proj.cover_image_public_id,
  'Project',
  proj.title,
  proj.id,
  proj.created_at?.toDate?.()?.toLocaleDateString() || null
  );
 }
 });

 // Add blog cover images
 posts?.forEach(post => {
 if (post.cover_image_url) {
  addImage(
  post.cover_image_url,
  post.cover_image_public_id,
  'Blog Post',
  post.title,
  post.id,
  post.created_at?.toDate?.()?.toLocaleDateString() || post.published_date || null
  );
 }
 });

 const allImages = Object.values(imagesMap);

 // Filter and Search logic
 const filteredImages = allImages.filter(img => {
 const matchesSearch = 
  img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
  img.usages.some(usage => usage.recordName.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesType = 
  selectedType === 'All' ||
  img.usages.some(usage => usage.entityType === selectedType);

 return matchesSearch && matchesType;
 });

 // Pagination logic
 const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentItems = filteredImages.slice(indexOfFirstItem, indexOfLastItem);

 const handlePageChange = (pageNumber) => {
 setCurrentPage(pageNumber);
 };

 return (
 <div className="space-y-8 max-w-5xl">
  <div className="flex items-center justify-between">
  <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
   <ImageIcon className="text-accent" size={24} />
   <span>Image Gallery</span>
  </h1>
  </div>

  {/* Search and Filters */}
  <div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1 relative">
   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
   <input
   type="text"
   placeholder="Search by file name or record name..."
   value={searchQuery}
   onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
   }}
   className="w-full bg-bg-surface border border-line rounded-lg pl-10 pr-4 py-2.5 text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
   />
  </div>

  <div className="flex items-center gap-2">
   <Filter className="text-ink-muted shrink-0" size={18} />
   <select
   value={selectedType}
   onChange={(e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
   }}
   className="bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-accent transition-colors cursor-pointer"
   >
   <option value="All">All Types</option>
   <option value="Profile">Profile</option>
   <option value="Project">Projects</option>
   <option value="Blog Post">Blog Posts</option>
   </select>
  </div>
  </div>

  {filteredImages.length === 0 ? (
  <div className="text-center py-20 bg-bg-surface border border-line rounded-2xl">
   <ImageIcon className="w-16 h-16 mx-auto mb-4 text-ink-muted opacity-30" />
   <p className="text-lg font-medium text-ink ">No used images found.</p>
   <p className="text-sm text-ink-muted mt-1">Images referenced in profile, projects, or blogs will appear here.</p>
  </div>
  ) : (
  <>
   {/* Gallery Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
   {currentItems.map((img, idx) => (
    <motion.div
    key={img.url}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: idx * 0.05 }}
    className="group relative bg-bg-surface border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-pointer flex flex-col h-full"
    onClick={() => setSelectedImage(img)}
    >
    {/* Thumbnail */}
    <div className="aspect-[4/3] w-full bg-bg-surface relative overflow-hidden">
     <img
     src={img.url}
     alt={img.filename}
     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
     />
     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
     <Eye className="text-ink w-8 h-8" />
     </div>
     {/* Usages Count Badge */}
     <div className="absolute top-3 left-3 bg-accent text-bg text-xs font-bold px-2 py-1 rounded-md shadow-md">
     Used in {img.usages.length} record{img.usages.length !== 1 ? 's' : ''}
     </div>
    </div>

    {/* Meta details */}
    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
     <div>
     <h3 className="font-medium text-ink truncate" title={img.filename}>
      {img.filename}
     </h3>
     <p className="text-xs text-ink-muted truncate mt-1">{img.url}</p>
     </div>

     <div className="space-y-1">
     <p className="text-[10px] text-ink-muted uppercase tracking-wider font-bold">First Used In</p>
     <div className="flex flex-wrap gap-1">
      {img.usages.map((u, i) => (
      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-bg-surface border border-line text-ink-muted">
       {u.entityType}: {u.recordName}
      </span>
      ))}
     </div>
     </div>
    </div>
    </motion.div>
   ))}
   </div>

   {/* Pagination */}
   {totalPages > 1 && (
   <div className="flex items-center justify-center gap-2 mt-8">
    <button
    disabled={currentPage === 1}
    onClick={() => handlePageChange(currentPage - 1)}
    className="px-4 py-2 border border-line rounded-lg text-sm text-ink disabled:opacity-50 hover:bg-bg-surface transition-colors"
    >
    Previous
    </button>
    {[...Array(totalPages)].map((_, index) => (
    <button
     key={index}
     onClick={() => handlePageChange(index + 1)}
     className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
     currentPage === index + 1
      ? 'bg-accent text-bg'
      : 'border border-line text-ink hover:bg-bg-surface'
     }`}
    >
     {index + 1}
    </button>
    ))}
    <button
    disabled={currentPage === totalPages}
    onClick={() => handlePageChange(currentPage + 1)}
    className="px-4 py-2 border border-line rounded-lg text-sm text-ink disabled:opacity-50 hover:bg-bg-surface transition-colors"
    >
    Next
    </button>
   </div>
   )}
  </>
  )}

  {/* Preview Modal */}
  <AnimatePresence>
  {selectedImage && (
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
    onClick={() => setSelectedImage(null)}
   />
   
   <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="relative w-full max-w-3xl bg-bg-surface border border-line rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
   >
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-line bg-bg-surface/20">
    <h3 className="font-semibold text-lg text-ink truncate pr-6">
     {selectedImage.filename}
    </h3>
    <button
     onClick={() => setSelectedImage(null)}
     className="p-1 rounded-lg text-ink-muted hover:text-ink transition-colors"
    >
     <X size={20} />
    </button>
    </div>

    {/* Body */}
    <div className="p-6 overflow-y-auto space-y-6 flex-1">
    {/* Full-size Image Container */}
    <div className="w-full aspect-video bg-black/20 rounded-xl overflow-hidden border border-line relative">
     <img
     src={selectedImage.url}
     alt={selectedImage.filename}
     className="w-full h-full object-contain"
     />
    </div>

    {/* Details info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     <div className="space-y-4">
     <div>
      <h4 className="text-xs text-ink-muted uppercase font-bold tracking-wider mb-1">Upload Date / First Linked</h4>
      <p className="text-ink flex items-center gap-2 text-sm font-medium">
      <Calendar size={16} className="text-accent" />
      {selectedImage.uploadDate}
      </p>
     </div>

     <div>
      <h4 className="text-xs text-ink-muted uppercase font-bold tracking-wider mb-1">Image URL</h4>
      <div className="flex items-center gap-2 p-2 bg-bg-surface rounded-lg border border-line">
      <input
       type="text"
       readOnly
       value={selectedImage.url}
       className="bg-transparent text-xs text-ink-muted w-full focus:outline-none"
      />
      <button
       onClick={() => {
       navigator.clipboard.writeText(selectedImage.url);
       }}
       className="text-accent hover:text-accent-light text-xs font-semibold shrink-0"
      >
       Copy
      </button>
      </div>
     </div>
     </div>

     {/* Usages Locations */}
     <div className="space-y-3">
     <h4 className="text-xs text-ink-muted uppercase font-bold tracking-wider">Used in {selectedImage.usages.length} record{selectedImage.usages.length !== 1 ? 's' : ''}</h4>
     <div className="space-y-2">
      {selectedImage.usages.map((usage, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-bg-surface rounded-xl border border-line">
       <div>
       <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent mr-2">
        {usage.entityType}
       </span>
       <span className="font-medium text-sm text-ink ">{usage.recordName}</span>
       </div>
       <span className="text-ink-muted/60"><Link2 size={16} /></span>
      </div>
      ))}
     </div>
     </div>
    </div>
    </div>
   </motion.div>
   </div>
  )}
  </AnimatePresence>
 </div>
 );
};
