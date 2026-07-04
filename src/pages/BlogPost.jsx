import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { collection, query, where, getDocs, updateDoc, doc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ArrowLeft, Heart, Share2, MessageSquare, Clock, Send, Check, Eye } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { marked } from 'marked';



export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [toc, setToc] = useState([]);

  const contentRef = useRef(null);

  // Reading progress bar setup
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const fetchPost = async () => {
    try {
      if (!db) throw new Error("No DB");
      const q = query(collection(db, 'blog_posts'), where('slug', '==', id), where('published', '==', true));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setPost({ id: docSnap.id, ...data });
      } else {
        setPost(null);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Track view increment
  useEffect(() => {
    if (post && post.id && post.id !== '1') {
      const updateViews = async () => {
        try {
          const docRef = doc(db, 'blog_posts', post.id);
          await updateDoc(docRef, { views: increment(1) });
        } catch (e) {
          console.error("Error updating views count:", e);
        }
      };
      updateViews();
    }
  }, [post?.id]);

  // Generate Table of Contents from content
  useEffect(() => {
    if (post) {
      const markdown = post.content || post.body || '';
      const regex = /^##\s+(.+)$/gm;
      const headers = [];
      let match;
      while ((match = regex.exec(markdown)) !== null) {
        const title = match[1].trim();
        const idStr = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        headers.push({ title, id: idStr });
      }
      setToc(headers);
    }
  }, [post]);

  const handleLike = async () => {
    if (liked || !post || post.id === '1') return;
    try {
      const docRef = doc(db, 'blog_posts', post.id);
      await updateDoc(docRef, { likes: increment(1) });
      
      await addDoc(collection(db, 'notifications'), {
        type: 'like',
        postTitle: post.title,
        postSlug: post.slug,
        message: `Someone liked your post "${post.title}"`,
        read: false,
        created_at: serverTimestamp()
      });

      setLiked(true);
      setPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    } catch (e) {
      console.error("Error liking post:", e);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
      
      if (post.id !== '1') {
        const docRef = doc(db, 'blog_posts', post.id);
        await updateDoc(docRef, { shares: increment(1) });
        setPost(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
      }
    } catch (e) {
      console.error("Error sharing post:", e);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !post || post.id === '1') return;

    setIsSubmittingComment(true);
    try {
      const newComment = {
        id: `c-${Date.now()}`,
        name: commentName.trim(),
        avatar: commentName.trim().charAt(0).toUpperCase(),
        comment: commentText.trim(),
        date: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        pinned: false,
        featured: false,
        replies: []
      };

      const docRef = doc(db, 'blog_posts', post.id);
      const updatedComments = [...(post.comments || []), newComment];
      
      await updateDoc(docRef, { comments: updatedComments });

      await addDoc(collection(db, 'notifications'), {
        type: 'comment',
        postTitle: post.title,
        postSlug: post.slug,
        message: `${commentName.trim()} commented on "${post.title}": "${commentText.trim().substring(0, 45)}..."`,
        read: false,
        created_at: serverTimestamp()
      });

      setPost(prev => ({ ...prev, comments: updatedComments }));
      setCommentText('');
      setCommentName('');
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const blogImg = (url) => url?.replace('/upload/', '/upload/w_1600,h_800,c_fill,q_auto,f_auto/');

  // Replace Markdown headers with anchored versions for scrolling
  const getRenderedHtml = (markdown) => {
    let html = marked.parse(markdown || '');
    toc.forEach(item => {
      const target = `<h2>${item.title}</h2>`;
      const replacement = `<h2 id="${item.id}" class="scroll-mt-24">${item.title}</h2>`;
      html = html.replace(target, replacement);
    });
    return { __html: html };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-bg-surface w-24 rounded" />
          <div className="h-14 bg-bg-surface w-3/4 rounded" />
          <div className="h-96 bg-bg-surface w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 min-h-screen text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-display font-bold mb-4">Post not found</h1>
        <p className="text-ink-muted mb-8">The article you are looking for doesn't exist or isn't published yet.</p>
        <Link to="/blog" className="text-accent hover:text-accent-light flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );
  }

  const sortedComments = [...(post.comments || [])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="bg-bg min-h-screen pb-24 relative">
      {/* Top Scroll Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-accent origin-[0%] z-[110]" style={{ scaleX }} />

      {/* ── Hero Banner Section (Full-bleed concept) ── */}
      <div className="relative w-full h-[50vh] min-h-[350px] md:h-[60vh] bg-bg-surface overflow-hidden">
        {post.cover_image_url ? (
          <img 
            src={blogImg(post.cover_image_url)} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-bg-nav" />
        )}
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        
        {/* Text Container aligned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 z-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-light transition-colors mb-6">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 text-xs text-ink-muted mb-4 font-mono">
            <span className="px-3 py-1 bg-accent/15 border border-accent/20 text-accent rounded-full font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1"><Clock size={12} />{post.read_time || '5 min'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-ink leading-tight tracking-tight max-w-4xl">
            {post.title}
          </h1>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 items-start">
          
          {/* Sticky left panel (TOC & engagement shortcuts) */}
          <aside className="hidden lg:block sticky top-28 space-y-8">
            {toc.length > 0 && (
              <div>
                <p className="text-[10px] font-mono font-bold text-ink-muted/50 uppercase tracking-[0.2em] mb-4">
                  Table of Contents
                </p>
                <ul className="space-y-3 border-l border-line/60 pl-3">
                  {toc.map(item => (
                    <li key={item.id}>
                      <a 
                        href={`#${item.id}`} 
                        className="text-xs text-ink-muted hover:text-accent transition-colors block py-0.5"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-[10px] font-mono font-bold text-ink-muted/50 uppercase tracking-[0.2em] mb-4">
                Engagement
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold w-full transition-all ${
                    liked 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                      : 'bg-bg-surface border-line text-ink-muted hover:text-ink'
                  }`}
                >
                  <Heart size={14} className={liked ? 'fill-red-500' : ''} />
                  <span>{post.likes || 0} Likes</span>
                </button>

                <button 
                  onClick={handleShare}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold w-full transition-all ${
                    shared 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : 'bg-bg-surface border-line text-ink-muted hover:text-ink'
                  }`}
                >
                  {shared ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{shared ? 'Copied URL!' : 'Share Post'}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main article body */}
          <div className="min-w-0">
            {/* Embedded video optionally shown above content */}
            {post.video_url && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-line shadow-lg mb-10">
                {(() => {
                  const url = post.video_url;
                  let embedUrl = null;
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                    if (match && match[2].length === 11)
                      embedUrl = `https://www.youtube.com/embed/${match[2]}`;
                  } else if (url.includes('vimeo.com')) {
                    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
                    if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
                  }
                  return embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title="Post Video Embed"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-2.5 rounded-lg font-semibold text-sm">
                        Watch video
                      </a>
                    </div>
                  );
                })()}
              </div>
            )}

            <div 
              ref={contentRef}
              className="prose dark:prose-invert prose-accent max-w-none prose-img:rounded-2xl prose-headings:font-display prose-a:text-accent hover:prose-a:text-accent-light leading-relaxed mb-16 text-base sm:text-lg text-ink-muted/90"
              dangerouslySetInnerHTML={getRenderedHtml(post.content || post.body)}
            />

            {/* Mobile engagement icons */}
            <div className="flex lg:hidden flex-wrap items-center gap-3 border border-line bg-bg-surface p-4 rounded-xl mb-12">
              <button 
                onClick={handleLike} 
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-semibold border ${liked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-bg/40 border-line text-ink-muted'}`}
              >
                <Heart size={16} className={liked ? 'fill-red-500' : ''} /> {post.likes || 0}
              </button>
              <button 
                onClick={handleShare} 
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-semibold border ${shared ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-bg/40 border-line text-ink-muted'}`}
              >
                {shared ? <Check size={16} /> : <Share2 size={16} />} Share
              </button>
            </div>

            {/* Comments block */}
            <div className="space-y-8 border-t border-line/60 pt-12">
              <h3 className="text-xl md:text-2xl font-display font-bold text-ink flex items-center gap-2">
                <MessageSquare className="text-accent" size={20} />
                <span>Comments ({post.comments?.length || 0})</span>
              </h3>

              {/* Submit Comment */}
              {post.id !== '1' && (
                <form onSubmit={handleSubmitComment} className="bg-bg-surface border border-line p-5 rounded-xl space-y-4">
                  <p className="text-[10px] font-mono font-bold text-ink-muted/60 uppercase tracking-wider">Leave a response</p>
                  <input
                    required
                    type="text"
                    placeholder="Your Name"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-bg border border-line rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="What are your thoughts?"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-bg border border-line rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="bg-accent text-bg px-5 py-2 rounded-lg font-semibold hover:bg-accent-light transition-colors text-xs disabled:opacity-50"
                  >
                    {isSubmittingComment ? 'Submitting...' : 'Post comment'}
                  </button>
                </form>
              )}

              {/* Comments rendering */}
              <div className="space-y-4">
                {sortedComments.length === 0 ? (
                  <p className="text-xs text-ink-muted text-center py-4 italic">No comments yet.</p>
                ) : (
                  sortedComments.map(comment => (
                    <div key={comment.id} className="p-4 bg-bg-surface/30 border border-line rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent text-bg flex items-center justify-center font-bold text-xs select-none">
                          {comment.avatar}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-ink">{comment.name}</h4>
                          <span className="text-[9px] text-ink-muted">{comment.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed pl-11">{comment.comment}</p>
                      
                      {/* Replies */}
                      {comment.replies?.map(r => (
                        <div key={r.id} className="ml-11 p-2.5 bg-bg-surface/50 border-l-2 border-accent rounded-lg text-xs space-y-0.5">
                          <span className="font-semibold text-accent text-[10px]">{r.name}</span>
                          <p className="text-ink-muted/90 font-body">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
