import React, { useState } from 'react';
import { useCollection } from '../../../hooks/useFirestore';
import { updateGuestbookStatus, deleteGuestbookEntry } from '../../../firebase/collections';
import { AdminCard } from '../AdminCard';
import { ConfirmDialog } from '../ConfirmDialog';
import { Check, Trash2, Loader2, MessageSquare, Search, Eye, EyeOff } from 'lucide-react';

/* Generate deterministic HSL colors based on the sender's name */
const getNameColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 40%)`;
};

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const GuestbookEditor = ({ showToast }) => {
  const { documents: guestbook, loading } = useCollection('guestbook');
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [isUpdating, setIsUpdating] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedEntries = [...guestbook].sort((a, b) => {
    const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
    const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
    return timeB - timeA;
  });

  const filteredEntries = sortedEntries.filter(entry => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && !entry.approved) || 
      (filter === 'approved' && entry.approved);

    const matchesSearch = 
      (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (entry.message || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = guestbook.filter(e => !e.approved).length;

  const handleToggleStatus = async (id, currentStatus) => {
    setIsUpdating(true);
    try {
      await updateGuestbookStatus(id, !currentStatus);
      showToast(currentStatus ? 'Entry unapproved / hidden' : 'Entry approved and live');
    } catch (error) {
      console.error(error);
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setConfirmDelete({ isOpen: false, id: null });
    try {
      await deleteGuestbookEntry(id);
      showToast('Entry deleted successfully');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete entry', 'error');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-ink">Manage Guestbook</h2>
          <p className="text-sm text-ink-muted mt-1">
            {guestbook.length} total entries &middot;{' '}
            <span className={pendingCount > 0 ? 'text-accent font-semibold' : ''}>
              {pendingCount} pending
            </span>
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Keyword Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-surface border border-line rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent w-full"
            />
          </div>

          <div className="bg-bg-surface border border-line rounded-lg p-1 flex">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-bg-hover text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${filter === 'pending' ? 'bg-accent text-bg shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              Pending
              {pendingCount > 0 && filter !== 'pending' && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
            <button 
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${filter === 'approved' ? 'bg-bg-hover text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      <AdminCard className="!p-0 overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-muted bg-bg-surface/20">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-ink mb-1">No entries found</p>
            <p className="text-xs">
              {filter === 'pending' ? 'All caught up! No pending messages.' : 
               filter === 'approved' ? 'No approved messages yet.' : 
               'The guestbook is currently empty.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line/40">
            {filteredEntries.map(entry => (
              <div 
                key={entry.id} 
                className={`p-5 flex flex-col sm:flex-row gap-4 sm:items-start hover:bg-bg-surface/10 transition-colors ${
                  !entry.approved ? 'bg-accent/3 border-l-4 border-accent' : 'border-l-4 border-transparent'
                }`}
              >
                {/* User avatar bubble */}
                <div 
                  className="w-10 h-10 rounded-full text-bg font-display font-black flex items-center justify-center text-sm shrink-0 select-none shadow-sm"
                  style={{ backgroundColor: getNameColor(entry.name) }}
                >
                  {getInitials(entry.name)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink text-sm">{entry.name}</span>
                    <span className="text-[10px] text-ink-muted font-mono">{formatDate(entry.created_at)}</span>
                  </div>
                  
                  <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-wrap break-words pr-4">
                    "{entry.message}"
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    {/* Status Badge */}
                    {entry.approved ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-green-500/10 text-green-400 border-green-500/20">
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-accent/15 text-accent border-accent/25">
                        Pending Moderation
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleToggleStatus(entry.id, entry.approved)}
                    disabled={isUpdating}
                    className={`p-2 rounded-lg transition-colors border ${
                      entry.approved 
                        ? 'text-green-400 bg-green-500/5 hover:bg-green-500/10 border-green-500/20' 
                        : 'text-ink-muted bg-bg-surface hover:text-accent border-line'
                    }`}
                    title={entry.approved ? 'Unapprove / Draft' : 'Approve / Publish'}
                  >
                    {entry.approved ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ isOpen: true, id: entry.id })}
                    className="p-2 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-red-500/15 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Guestbook Entry"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmText="Delete"
        isDestructive
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={() => handleDeleteConfirm(confirmDelete.id)}
      />
    </div>
  );
};
