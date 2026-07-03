import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const FALLBACK_POSTS = [
  {
    id: '1',
    slug: 'why-i-left-school',
    title: 'Why I Left School at 8th Standard and Never Looked Back',
    category: 'Personal',
    read_time: '5 min',
    published_date: 'Jun 28, 2026',
    excerpt: 'The traditional education system felt disconnected from how things actually work. Taking control of my own learning path was the most terrifying and rewarding decision of my life.'
  },
  {
    id: '2',
    slug: 'how-i-learned-ue5',
    title: 'How I Learned Unreal Engine 5 Without a Teacher',
    category: 'Tech',
    read_time: '7 min',
    published_date: 'May 14, 2026',
    excerpt: 'Unreal Engine 5 is intimidating. Here is the exact roadmap, YouTube channels, and project-based approach I used to go from absolute beginner to building a Digital Twin.'
  },
  {
    id: '3',
    slug: 'workshop-communication',
    title: 'What Running a Workshop Taught Me About Communication',
    category: 'Leadership',
    read_time: '4 min',
    published_date: 'Apr 02, 2026',
    excerpt: 'I used to have severe stage fright. Standing in front of dozens of students to teach them UE5 Blueprints changed how I think about knowledge sharing and leadership.'
  }
];

const CATEGORIES = ['All', 'Personal', 'Tech', 'Leadership'];

const blogImg = (url, w = 1200, h = 600) => 
  url?.replace('/upload/', `/upload/w_${w},h_${h},c_fill,q_auto,f_auto/`);

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!db) throw new Error("No DB");
        const q = query(collection(db, 'blog_posts'), where('published', '==', true));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setPosts(FALLBACK_POSTS);
        } else {
          const fetchedPosts = [];
          snapshot.forEach(doc => fetchedPosts.push({ id: doc.id, ...doc.data() }));
          fetchedPosts.sort((a, b) => {
            const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.published_date || 0);
            const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.published_date || 0);
            return dateB - dateA;
          });
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => 
    selectedCategory === 'All' || (post.category || '').toLowerCase() === selectedCategory.toLowerCase()
  );

  const [featuredPost, ...gridPosts] = filteredPosts;

  return (
    <div className="bg-bg min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h1 className="text-4xl md:text-6xl font-display font-black text-ink tracking-tight mb-4">
            Writing
          </h1>
          <div className="w-24 h-1.5 bg-accent rounded-full mb-6" />
          <p className="text-xl text-ink-muted max-w-2xl leading-relaxed">
            Thoughts on self-learning, technology, and building things from scratch.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-12 border-b border-line pb-6"
        >
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedCategory === category
                  ? 'bg-accent text-bg shadow-lg shadow-accent/15'
                  : 'bg-bg-surface border border-line text-ink-muted hover:text-ink hover:bg-bg-hover'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="space-y-12 animate-pulse">
            <div className="h-96 bg-bg-surface rounded-2xl border border-line" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-bg-surface rounded-2xl border border-line" />
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-bg-surface/30 rounded-2xl border border-line/60">
            <p className="text-ink-muted text-lg">No articles found in this category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Featured Post Card */}
            {selectedCategory === 'All' && featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="group relative rounded-3xl overflow-hidden border border-line/80 hover:border-accent/40 bg-bg-surface shadow-lg hover:shadow-xl hover:shadow-accent/3 transition-all duration-300 cursor-pointer"
              >
                <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} className="block">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Image Area */}
                    <div className="lg:col-span-7 h-64 sm:h-80 md:h-[420px] overflow-hidden relative">
                      {featuredPost.cover_image_url ? (
                        <img 
                          src={blogImg(featuredPost.cover_image_url, 1200, 800)} 
                          alt={featuredPost.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-bg-nav flex items-center justify-center">
                          <span className="text-7xl font-display font-black text-ink/10 select-none">
                            {featuredPost.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-bg-surface/20 lg:to-bg-surface" />
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-3 text-xs text-ink-muted mb-4 font-mono">
                        <span className="text-accent font-bold tracking-wider uppercase">{featuredPost.category}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{featuredPost.read_time || '5 min'}</span>
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink mb-4 group-hover:text-accent transition-colors duration-200 leading-snug">
                        {featuredPost.title}
                      </h2>
                      
                      <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex items-center gap-2 text-accent text-sm font-bold mt-auto pt-4 border-t border-line/60">
                        <span>Read Full Story</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Grid Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory === 'All' ? gridPosts : filteredPosts).map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden border border-line bg-bg-surface hover:border-accent/40 hover:ring-1 hover:ring-accent/10 transition-all duration-300 hover:shadow-lg flex flex-col cursor-pointer"
                >
                  <Link to={`/blog/${post.slug || post.id}`} className="block flex flex-col h-full">
                    {/* Thumbnail */}
                    <div className="h-48 overflow-hidden relative shrink-0">
                      {post.cover_image_url ? (
                        <img 
                          src={blogImg(post.cover_image_url, 600, 400)} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-bg-surface to-bg-nav flex items-center justify-center">
                          <span className="text-4xl font-display font-black text-ink/10 select-none">
                            {post.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/90 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-[10px] text-ink-muted mb-3 font-mono">
                        <span className="text-accent font-bold tracking-wider uppercase">{post.category}</span>
                        <span>&bull;</span>
                        <span>{post.read_time || '5 min'}</span>
                      </div>

                      <h3 className="text-lg font-display font-bold text-ink mb-3 group-hover:text-accent transition-colors duration-200 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-ink-muted text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto pt-4 border-t border-line/50 flex items-center gap-1 text-accent text-xs font-semibold">
                        <span>Read Story</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
