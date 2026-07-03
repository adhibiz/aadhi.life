import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Timeline } from '../components/sections/Timeline';
import { Skills } from '../components/sections/Skills';
import { Projects } from '../components/sections/Projects';
import { Guestbook } from '../components/sections/Guestbook';
import { Contact } from '../components/sections/Contact';
import { SectionReveal } from '../components/ui/SectionReveal';
import { Toast } from '../components/ui/Toast';

// Konami code: Up Up Down Down Left Right Left Right B A
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const FALLBACK_POSTS = [
 {
 id: '1',
 slug: 'why-i-left-school',
 title: 'Why I Left School at 8th Standard and Never Looked Back',
 category: 'Personal',
 read_time: '5 min',
 published_date: 'Jun 28, 2026',
 },
 {
 id: '2',
 slug: 'how-i-learned-ue5',
 title: 'How I Learned Unreal Engine 5 Without a Teacher',
 category: 'Tech',
 read_time: '7 min',
 published_date: 'May 14, 2026',
 },
 {
 id: '3',
 slug: 'workshop-communication',
 title: 'What Running a Workshop Taught Me About Communication',
 category: 'Leadership',
 read_time: '4 min',
 published_date: 'Apr 02, 2026',
 }
];

export default function Home() {
 const [showToast, setShowToast] = useState(false);
 const konamiIndex = useRef(0);
 
 const [blogPosts, setBlogPosts] = useState([]);
 const [loadingBlog, setLoadingBlog] = useState(true);

 // Konami Code listener
 useEffect(() => {
 const handleKeyDown = (e) => {
  if (e.key === KONAMI_CODE[konamiIndex.current]) {
  konamiIndex.current++;
  if (konamiIndex.current === KONAMI_CODE.length) {
   setShowToast(true);
   konamiIndex.current = 0; // reset
  }
  } else {
  konamiIndex.current = 0; // reset on wrong key
  }
 };

 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, []);

 // Scroll to hash element on mount
 useEffect(() => {
 if (window.location.hash) {
  const id = window.location.hash.substring(1);
  setTimeout(() => {
  const element = document.getElementById(id);
  if (element) {
   element.scrollIntoView({ behavior: 'smooth' });
  }
  }, 150);
 }
 }, []);

 // Fetch latest 3 blog posts
 useEffect(() => {
 const fetchLatestPosts = async () => {
  try {
  if (!db) throw new Error("No DB");
  // Using limit(3) to just get the latest ones
  const q = query(
   collection(db, 'blog_posts'), 
   where('published', '==', true),
   limit(3)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
   setBlogPosts(FALLBACK_POSTS);
  } else {
   const fetchedPosts = [];
   snapshot.forEach(doc => fetchedPosts.push({ id: doc.id, ...doc.data() }));
   setBlogPosts(fetchedPosts);
  }
  } catch (error) {
  console.error("Error fetching latest blog posts:", error);
  setBlogPosts(FALLBACK_POSTS);
  } finally {
  setLoadingBlog(false);
  }
 };

 fetchLatestPosts();
 }, []);

 const blogImg = (url) => url?.replace('/upload/', '/upload/w_600,h_300,c_fill,q_auto,f_auto/');

 return (
 <div className="flex flex-col min-h-screen">
  
  <Toast 
  message="You found it. Keep building. 🛠️" 
  type="success" 
  isVisible={showToast} 
  onClose={() => setShowToast(false)} 
  duration={3000} 
  />

  <SectionReveal id="hero">
  <Hero />
  </SectionReveal>

  <SectionReveal id="about">
  <About />
  </SectionReveal>

  <SectionReveal id="timeline">
  <Timeline />
  </SectionReveal>

  <SectionReveal id="skills">
  <Skills />
  </SectionReveal>

  <SectionReveal id="projects">
  <Projects />
  </SectionReveal>

  {/* Blog Preview Section */}
  <SectionReveal id="blog" className="py-24 bg-bg-surface border-t border-line bg-radial-glow relative overflow-hidden">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
   <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
   <div>
    <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">Latest Writing</h2>
    <div className="w-20 h-1 bg-accent rounded-full"></div>
   </div>
   <Link to="/blog" className="text-accent hover:text-accent-light font-medium mt-6 md:mt-0 flex items-center group">
    View all posts <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
   </Link>
   </div>

   {loadingBlog ? (
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => (
    <div key={i} className="h-64 bg-bg-surface rounded-xl animate-pulse border border-line"></div>
    ))}
   </div>
   ) : (
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {blogPosts.map((post) => (
    <Link 
     key={post.id} 
     to={`/blog/${post.slug || post.id}`}
     className="group card overflow-hidden flex flex-col h-full"
    >

     {post.cover_image_url ? (
     <div className="h-40 w-full overflow-hidden bg-bg-surface">
      <img 
      src={blogImg(post.cover_image_url)} 
      alt={post.title} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
     </div>
     ) : (
     <div className="h-40 w-full bg-gradient-to-br from-bg-surface to-bg-nav flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
      <span className="font-display font-bold text-ink opacity-20 text-3xl">
       {post.category}
      </span>
     </div>
     )}
     
     <div className="p-6 flex-grow flex flex-col">
     <div className="flex items-center space-x-2 text-xs mb-3 text-ink-muted font-mono">
      <span className="text-accent">{post.category}</span>
      <span>&middot;</span>
      <span>{post.read_time}</span>
     </div>
     <h3 className="text-xl font-display font-bold text-ink mb-4 group-hover:text-accent transition-colors line-clamp-3">
      {post.title}
     </h3>
     <div className="mt-auto">
      <span className="text-sm text-ink-muted">{post.published_date}</span>
     </div>
     </div>
    </Link>
    ))}
   </div>
   )}
  </div>
  </SectionReveal>

  <SectionReveal id="guestbook">
  <Guestbook />
  </SectionReveal>

  <SectionReveal id="contact">
  <Contact />
  </SectionReveal>

 </div>
 );
}
