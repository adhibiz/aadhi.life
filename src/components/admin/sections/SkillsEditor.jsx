import React, { useState, useEffect } from 'react';
import { collection, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../hooks/useFirestore';
import { AdminCard } from '../AdminCard';
import { ConfirmDialog } from '../ConfirmDialog';
import { Plus, Trash2, Loader2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export const SkillsEditor = ({ showToast }) => {
  const { documents: skills, loading } = useCollection('skills');
  const [localSkills, setLocalSkills] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [tagInputs, setTagInputs] = useState({});

  useEffect(() => {
    if (skills) {
      // Sort by order and clone for local editing
      const sorted = [...skills].sort((a, b) => (a.order || 0) - (b.order || 0));
      setLocalSkills(sorted);
    }
  }, [skills]);

  const handleAddCategory = () => {
    const newCategory = {
      id: `new_${Date.now()}`,
      category: 'New Category',
      items: [],
      is_learning: false,
      order: localSkills.length,
      isNew: true
    };
    setLocalSkills([...localSkills, newCategory]);
  };

  const handleUpdateCategory = (id, field, value) => {
    setLocalSkills(prev => 
      prev.map(skill => skill.id === id ? { ...skill, [field]: value } : skill)
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLocalSkills(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === localSkills.length - 1) return;
    setLocalSkills(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleAddTagButton = (id) => {
    const inputValue = tagInputs[id] || '';
    if (inputValue.trim()) {
      setLocalSkills(prev => prev.map(skill => {
        if (skill.id === id && !skill.items.includes(inputValue.trim())) {
          return { ...skill, items: [...skill.items, inputValue.trim()] };
        }
        return skill;
      }));
      setTagInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleTagKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTagButton(id);
    }
  };

  const handleRemoveTag = (id, tagToRemove) => {
    setLocalSkills(prev => prev.map(skill => {
      if (skill.id === id) {
        return { ...skill, items: skill.items.filter(t => t !== tagToRemove) };
      }
      return skill;
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      localSkills.forEach((skill, index) => {
        if (skill.isNew) {
          const newRef = doc(collection(db, 'skills'));
          const { id, isNew, ...data } = skill;
          batch.set(newRef, { ...data, order: index });
        } else {
          const docRef = doc(db, 'skills', skill.id);
          const { id, ...data } = skill;
          batch.update(docRef, { ...data, order: index });
        }
      });
      
      await batch.commit();
      showToast('All skills saved successfully');
    } catch (error) {
      console.error(error);
      showToast('Failed to save skills', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setConfirmDelete({ isOpen: false, id: null });
    
    // If it's a new unsaved category, just remove it from local state
    if (id.toString().startsWith('new_')) {
      setLocalSkills(prev => prev.filter(s => s.id !== id));
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'skills', id));
      setLocalSkills(prev => prev.filter(s => s.id !== id));
      showToast('Category deleted successfully');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete category', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-ink ">Manage Skills</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddCategory}
            className="bg-bg-surface text-ink px-4 py-2 rounded-lg font-medium hover:bg-bg-hover transition-colors flex items-center gap-2 border border-line"
          >
            <Plus size={18} /> Add Category
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-accent text-bg px-6 py-2 rounded-lg font-semibold hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localSkills.map((skill, index) => (
          <motion.div 
            key={skill.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AdminCard className={`h-full flex flex-col ${skill.is_learning ? 'border-accent/50 bg-accent/5' : ''}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <input
                  type="text"
                  value={skill.category}
                  onChange={(e) => handleUpdateCategory(skill.id, 'category', e.target.value)}
                  className="bg-transparent border-b border-line focus:border-accent outline-none text-lg font-semibold text-ink px-1 py-1 w-full"
                  placeholder="Category Name"
                />
                
                <div className="flex items-center gap-0.5 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-ink-muted hover:text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === localSkills.length - 1}
                    className="p-1 text-ink-muted hover:text-accent hover:bg-accent/10 rounded transition-colors disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ isOpen: true, id: skill.id })}
                    className="p-1 text-ink-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 mb-4 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={skill.is_learning}
                  onChange={(e) => handleUpdateCategory(skill.id, 'is_learning', e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-line bg-bg-surface"
                />
                <span className="text-sm text-ink-muted select-none">Currently learning this</span>
              </label>

              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-medium text-ink-muted uppercase tracking-wider mb-2 font-mono">Skills</label>
                  
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 bg-bg-surface border border-line rounded-lg p-2 min-h-[100px] focus-within:border-accent transition-colors flex flex-wrap gap-1.5 content-start">
                      {skill.items?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-bg-hover text-ink px-2 py-0.5 rounded text-xs group select-none">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(skill.id, tag)} 
                            className="text-ink-muted group-hover:text-red-400 transition-colors"
                            title="Remove Skill"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInputs[skill.id] || ''}
                        onChange={(e) => setTagInputs({ ...tagInputs, [skill.id]: e.target.value })}
                        onKeyDown={(e) => handleTagKeyDown(e, skill.id)}
                        placeholder={skill.items?.length === 0 ? "Add skill..." : ""}
                        className="bg-transparent border-none outline-none text-ink flex-1 min-w-[70px] text-xs p-0 focus:ring-0"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleAddTagButton(skill.id)}
                      className="p-2 border border-line bg-bg-surface text-ink-muted hover:text-accent hover:border-accent hover:bg-accent/5 rounded-lg transition-all shrink-0 h-9 w-9 flex items-center justify-center"
                      title="Add Skill Tag"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </AdminCard>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Category"
        message="Are you sure you want to delete this entire category and all its skills?"
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={() => handleDeleteConfirm(confirmDelete.id)}
      />
    </div>
  );
};
