import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../hooks/useFirestore';
import { AdminCard } from '../AdminCard';
import { ConfirmDialog } from '../ConfirmDialog';
import { FileUploader } from '../../ui/FileUploader';
import { deleteFile } from '../../../cloudinary/upload';
import {
  Plus, Edit2, Trash2, Loader2, X,
  ArrowUp, ArrowDown, Eye, EyeOff, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = [
  { value: 'concept',     label: 'Concept',     color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'in-progress', label: 'In Progress',  color: 'bg-accent/10 text-accent border-accent/20' },
  { value: 'completed',   label: 'Completed',    color: 'bg-green-500/10 text-green-400 border-green-500/20' },
];

const statusColor = (status) => {
  const found = STATUS_OPTIONS.find(s => s.value === status);
  return found ? found.color : 'bg-bg-hover text-ink-muted';
};

const statusLabel = (status) => {
  const found = STATUS_OPTIONS.find(s => s.value === status);
  return found ? found.label : status;
};

/* Mini thumbnail used in the list row */
const Thumb = ({ url, title }) => {
  const src = url?.replace('/upload/', '/upload/w_80,h_56,c_fill,q_auto,f_auto/');
  return src ? (
    <img src={src} alt={title} className="w-10 h-8 object-cover rounded border border-line shrink-0" />
  ) : (
    <div className="w-10 h-8 rounded border border-line bg-bg-surface flex items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-ink-muted/40 select-none">
        {title?.substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

const EMPTY_FORM = {
  title: '',
  short_desc: '',
  full_desc: '',
  why_built: '',
  status: 'concept',
  team: 'Solo',
  duration: '',
  tech_tags: [],
  featured: false,
  github_url: '',
  demo_url: '',
  video_url: '',
  published: true,
  cover_image_url: '',
  cover_image_public_id: '',
  order: 0,
};

export const ProjectsEditor = ({ showToast }) => {
  const { documents: projects, loading } = useCollection('projects');
  const [localProjects, setLocalProjects] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, publicId: null });

  /* Keep local sorted copy in sync */
  useEffect(() => {
    if (projects) {
      setLocalProjects([...projects].sort((a, b) => (a.order || 0) - (b.order || 0)));
    }
  }, [projects]);

  /* ── List actions ── */
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLocalProjects(prev => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === localProjects.length - 1) return;
    setLocalProjects(prev => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleSaveOrder = async () => {
    setIsReordering(true);
    try {
      const batch = writeBatch(db);
      localProjects.forEach((p, idx) => {
        batch.update(doc(db, 'projects', p.id), { order: idx + 1 });
      });
      await batch.commit();
      showToast('Order saved successfully');
    } catch (e) {
      console.error(e);
      showToast('Failed to save order', 'error');
    } finally {
      setIsReordering(false);
    }
  };

  const handleToggleFeatured = async (project) => {
    try {
      await updateDoc(doc(db, 'projects', project.id), { featured: !project.featured });
    } catch (e) {
      showToast('Failed to update featured', 'error');
    }
  };

  const handleTogglePublished = async (project) => {
    try {
      await updateDoc(doc(db, 'projects', project.id), { published: !project.published });
    } catch (e) {
      showToast('Failed to update publish status', 'error');
    }
  };

  /* ── Form actions ── */
  const handleAddNew = () => {
    setFormData({ ...EMPTY_FORM, order: (localProjects.length || 0) + 1 });
    setTagInput('');
    setIsEditing(true);
  };

  const handleEdit = (project) => {
    setFormData({ published: true, ...project });
    setTagInput('');
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tech_tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tech_tags: [...prev.tech_tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tech_tags: prev.tech_tags.filter(t => t !== tag) }));
  };

  const handleUploadComplete = ({ secureUrl, publicId }) => {
    setFormData(prev => ({ ...prev, cover_image_url: secureUrl, cover_image_public_id: publicId }));
  };

  const handleDeleteImage = async () => {
    if (formData.cover_image_public_id) {
      await deleteFile(formData.cover_image_public_id, 'image');
      setFormData(prev => ({ ...prev, cover_image_url: '', cover_image_public_id: '' }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) return showToast('Title is required', 'error');
    setIsSaving(true);
    try {
      if (formData.id) {
        const { id, ...data } = formData;
        await updateDoc(doc(db, 'projects', id), data);
        showToast('Project updated successfully');
      } else {
        await addDoc(collection(db, 'projects'), { ...formData, created_at: serverTimestamp() });
        showToast('Project created successfully');
      }
      setIsEditing(false);
      setFormData(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to save project', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (id, publicId) => {
    setConfirmDelete({ isOpen: false, id: null, publicId: null });
    try {
      if (publicId) await deleteFile(publicId, 'image');
      await deleteDoc(doc(db, 'projects', id));
      showToast('Project deleted successfully');
    } catch (e) {
      console.error(e);
      showToast('Failed to delete project', 'error');
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  /* ── List view ── */
  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-display font-bold text-ink">Manage Projects</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSaveOrder}
              disabled={isReordering}
              className="bg-bg-surface border border-line text-ink px-4 py-2 rounded-lg font-medium hover:bg-bg-hover transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isReordering ? <Loader2 size={15} className="animate-spin" /> : null}
              Save Order
            </button>
            <button
              onClick={handleAddNew}
              className="bg-accent text-bg px-4 py-2 rounded-lg font-semibold hover:bg-accent-light transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        </div>

        {/* Table */}
        <AdminCard className="overflow-hidden !p-0">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-line bg-bg-surface/40 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
            <div className="col-span-1" />
            <div className="col-span-1" />
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">★</div>
            <div className="col-span-1 text-center">Pub</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {localProjects.length === 0 && (
            <div className="py-12 text-center text-ink-muted text-sm">
              No projects yet. Click "Add Project" to get started.
            </div>
          )}

          {localProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-line/40 hover:bg-bg-surface/20 transition-colors last:border-b-0"
            >
              {/* Reorder */}
              <div className="col-span-1 flex flex-col items-center gap-0.5">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-0.5 text-ink-muted hover:text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-20"
                  title="Move Up"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === localProjects.length - 1}
                  className="p-0.5 text-ink-muted hover:text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-20"
                  title="Move Down"
                >
                  <ArrowDown size={13} />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="col-span-1 flex items-center">
                <Thumb url={project.cover_image_url} title={project.title} />
              </div>

              {/* Title */}
              <div className="col-span-4 font-medium text-ink text-sm truncate pr-2">
                {project.title}
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(project.status)}`}>
                  {statusLabel(project.status)}
                </span>
              </div>

              {/* Featured toggle */}
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleToggleFeatured(project)}
                  className={`p-1.5 rounded transition-colors ${project.featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-ink-muted hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                  title={project.featured ? 'Remove featured' : 'Mark featured'}
                >
                  <Star size={14} fill={project.featured ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Published toggle */}
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleTogglePublished(project)}
                  className={`p-1.5 rounded transition-colors ${
                    project.published !== false
                      ? 'text-green-400 bg-green-400/10'
                      : 'text-ink-muted hover:text-ink hover:bg-bg-hover'
                  }`}
                  title={project.published !== false ? 'Unpublish' : 'Publish'}
                >
                  {project.published !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete({ isOpen: true, id: project.id, publicId: project.cover_image_public_id })}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AdminCard>

        <ConfirmDialog
          isOpen={confirmDelete.isOpen}
          title="Delete Project"
          message="Are you sure you want to delete this project? This will permanently remove the record and any associated images."
          confirmText="Delete"
          isDestructive
          onCancel={() => setConfirmDelete({ isOpen: false, id: null, publicId: null })}
          onConfirm={() => handleDeleteConfirm(confirmDelete.id, confirmDelete.publicId)}
        />
      </div>
    );
  }

  /* ── Edit / Create form ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      {/* Form header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-ink">
          {formData.id ? 'Edit Project' : 'New Project'}
        </h2>
        <button
          onClick={() => { setIsEditing(false); setFormData(null); }}
          className="p-2 text-ink-muted hover:text-ink transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Cover image */}
        <AdminCard title="Cover Image">
          <FileUploader
            folder="projects"
            currentUrl={formData.cover_image_url}
            currentPublicId={formData.cover_image_public_id}
            onUploadComplete={handleUploadComplete}
            onDelete={handleDeleteImage}
            accept="image/*"
            label="Upload project cover image (16:9 recommended)"
          />
        </AdminCard>

        {/* Project details */}
        <AdminCard title="Project Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">
                Title *
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors appearance-none text-sm"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Team</label>
              <input
                type="text"
                name="team"
                value={formData.team}
                onChange={handleChange}
                placeholder="Solo, Team of 3…"
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder='e.g. "3 months"'
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Short desc */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">
                Short Description <span className="normal-case font-normal">(shown on card)</span>
              </label>
              <textarea
                name="short_desc"
                value={formData.short_desc}
                onChange={handleChange}
                rows={2}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors resize-none text-sm"
              />
            </div>

            {/* Full desc */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Full Description</label>
              <textarea
                name="full_desc"
                value={formData.full_desc}
                onChange={handleChange}
                rows={4}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors resize-y text-sm"
              />
            </div>

            {/* Why built */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">
                Why Built <span className="normal-case font-normal">(shown in modal callout)</span>
              </label>
              <textarea
                name="why_built"
                value={formData.why_built}
                onChange={handleChange}
                rows={3}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors resize-y text-sm"
              />
            </div>

            {/* Tech tags */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">
                Tech Tags <span className="normal-case font-normal">(Enter or + to add)</span>
              </label>
              <div className="flex gap-2 items-start">
                <div className="flex-1 bg-bg-surface border border-line rounded-lg p-2 focus-within:border-accent transition-colors flex flex-wrap gap-1.5 min-h-[42px]">
                  {formData.tech_tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-bg-hover text-ink px-2 py-0.5 rounded text-xs group select-none">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-ink-muted group-hover:text-red-400 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={formData.tech_tags.length === 0 ? 'Add a tag…' : ''}
                    className="bg-transparent border-none outline-none text-ink flex-1 min-w-[80px] text-xs p-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  className="p-2 border border-line bg-bg-surface text-ink-muted hover:text-accent hover:border-accent hover:bg-accent/5 rounded-lg transition-all shrink-0 h-9 w-9 flex items-center justify-center"
                  title="Add Tag"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </AdminCard>

        {/* Links & Settings */}
        <AdminCard title="Links & Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">GitHub URL</label>
              <input type="url" name="github_url" value={formData.github_url} onChange={handleChange}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Live Demo URL</label>
              <input type="url" name="demo_url" value={formData.demo_url} onChange={handleChange}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5 font-mono">Demo Video URL (YouTube / Vimeo)</label>
              <input type="url" name="video_url" value={formData.video_url || ''} onChange={handleChange}
                className="w-full bg-bg-surface border border-line rounded-lg px-4 py-2.5 text-ink focus:border-accent focus:outline-none transition-colors text-sm" />
            </div>

            {/* Checkboxes */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-line hover:border-accent/30 hover:bg-accent/3 transition-colors">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
                className="w-4 h-4 accent-accent rounded" />
              <div>
                <p className="text-sm font-medium text-ink">Featured Project</p>
                <p className="text-xs text-ink-muted">Show this project prominently</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-line hover:border-accent/30 hover:bg-accent/3 transition-colors">
              <input type="checkbox" name="published" checked={formData.published} onChange={handleChange}
                className="w-4 h-4 accent-accent rounded" />
              <div>
                <p className="text-sm font-medium text-ink">Published</p>
                <p className="text-xs text-ink-muted">Visible on the live portfolio</p>
              </div>
            </label>
          </div>
        </AdminCard>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { setIsEditing(false); setFormData(null); }}
            className="px-5 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-accent text-bg px-7 py-2 rounded-lg text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
