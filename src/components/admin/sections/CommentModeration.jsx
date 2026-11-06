import React, { useState } from 'react';
import { updateDoc, deleteDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCollection } from '../../../hooks/useFirestore';
import { Check, Trash2, Pin, Star, Send, Loader2, MessageSquare } from 'lucide-react';

const formatDate = (ts) => {
  const date = ts?.toDate ? ts.toDate() : null;
  if (!date) return '';
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const byNewest = (a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0);

// Visitor comments are written to blog_posts/{postId}/comments with approved=false.
// Only admins can approve, pin, feature, reply to or delete them (see firestore.rules).
export const CommentModeration = ({ postId, showToast }) => {
  const { documents, loading, error } = useCollection(`blog_posts/${postId}/comments`);
  const [replyInputs, setReplyInputs] = useState({});
  const [busyId, setBusyId] = useState(null);

  const pending = documents.filter(c => !c.approved).sort(byNewest);
  const approved = documents.filter(c => c.approved).sort(byNewest);

  const run = async (id, action, successMsg) => {
    setBusyId(id);
    try {
      await action();
      if (successMsg) showToast(successMsg);
    } catch (e) {
      console.error(e);
      showToast('Action failed', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const ref = (id) => doc(db, 'blog_posts', postId, 'comments', id);

  const approve = (c) => run(c.id, () => updateDoc(ref(c.id), { approved: true }), 'Comment approved');
  const toggle = (c, field) => run(c.id, () => updateDoc(ref(c.id), { [field]: !c[field] }));
  const remove = (c) => {
    if (!window.confirm(`Delete the comment from "${c.name}"? This cannot be undone.`)) return;
    run(c.id, () => deleteDoc(ref(c.id)), 'Comment deleted');
  };
  const reply = (c) => {
    const text = replyInputs[c.id]?.trim();
    if (!text) return;
    const entry = { id: `r-${Date.now()}`, name: 'Aadhi (Author)', comment: text, date: 'Just now' };
    run(c.id, async () => {
      await updateDoc(ref(c.id), { replies: arrayUnion(entry) });
      setReplyInputs(prev => ({ ...prev, [c.id]: '' }));
    }, 'Reply posted');
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>;
  }
  if (error) {
    return <p role="alert" className="text-sm text-red-400 text-center py-12">Couldn't load comments: {error}</p>;
  }

  const renderComment = (c) => (
    <div key={c.id} className="p-4 bg-bg-surface border border-line rounded-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">{c.name}</h4>
          <span className="text-[10px] text-ink-muted">{formatDate(c.created_at)}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!c.approved && (
            <button disabled={busyId === c.id} onClick={() => approve(c)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-accent text-bg disabled:opacity-50">
              <Check size={13} /> Approve
            </button>
          )}
          {c.approved && (
            <>
              <button disabled={busyId === c.id} onClick={() => toggle(c, 'pinned')} title={c.pinned ? 'Unpin' : 'Pin'} aria-label={c.pinned ? 'Unpin' : 'Pin'} className={`p-1.5 rounded-lg ${c.pinned ? 'text-accent' : 'text-ink-muted hover:text-ink'}`}>
                <Pin size={14} />
              </button>
              <button disabled={busyId === c.id} onClick={() => toggle(c, 'featured')} title={c.featured ? 'Unfeature' : 'Feature'} aria-label={c.featured ? 'Unfeature' : 'Feature'} className={`p-1.5 rounded-lg ${c.featured ? 'text-accent' : 'text-ink-muted hover:text-ink'}`}>
                <Star size={14} />
              </button>
            </>
          )}
          <button disabled={busyId === c.id} onClick={() => remove(c)} title="Delete" aria-label="Delete" className="p-1.5 rounded-lg text-ink-muted hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-ink-muted whitespace-pre-wrap break-words">{c.comment}</p>
      {(c.replies || []).map(r => (
        <div key={r.id} className="ml-4 p-2.5 border-l-2 border-accent bg-bg/40 rounded-lg text-xs">
          <span className="font-semibold text-accent">{r.name}</span>
          <p className="text-ink-muted">{r.comment}</p>
        </div>
      ))}
      {c.approved && (
        <div className="flex gap-2">
          <input
            type="text"
            value={replyInputs[c.id] || ''}
            onChange={(e) => setReplyInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') reply(c); }}
            placeholder="Write a reply…"
            className="flex-1 bg-bg border border-line rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
          />
          <button disabled={busyId === c.id} onClick={() => reply(c)} aria-label="Send reply" className="p-2 rounded-lg bg-accent/10 text-accent disabled:opacity-50">
            <Send size={13} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Awaiting approval ({pending.length})</h3>
        {pending.length === 0
          ? <p className="text-xs text-ink-muted italic">No comments waiting for review.</p>
          : pending.map(renderComment)}
      </section>
      <section className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted">Published ({approved.length})</h3>
        {approved.length === 0
          ? <p className="text-xs text-ink-muted italic flex items-center gap-2"><MessageSquare size={13} /> No published comments yet.</p>
          : approved.map(renderComment)}
      </section>
    </div>
  );
};
