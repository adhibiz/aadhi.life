import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { MapPin, GraduationCap, Laptop, BookOpen, Compass, Award, Sparkles } from 'lucide-react';
import { useDocument } from '../../hooks/useFirestore';

export const About = () => {
  const { document: profile, loading } = useDocument('site_meta', 'profile');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - (box.width / 2);
    const y = e.clientY - box.top - (box.height / 2);
    // Limit rotation to maximum 8 degrees for a subtle effect
    const tiltX = -(y / (box.height / 2)) * 8; 
    const tiltY = (x / (box.width / 2)) * 8; 
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  // Default values to fall back to if database document hasn't loaded or doesn't have the field
  const defaultStory = [
    "I left school after the 8th standard because I felt traditional education wasn't teaching me how things actually worked. I wanted to build, take things apart, and understand the systems behind them.",
    "My real education started on YouTube and through audiobooks. When my father bought me my first laptop in 2018, everything changed. I went deep into hardware, programming, and eventually earned a Diploma in Computer Engineering.",
    "Today, I'm in my final year of B.Tech IT in Chennai. I've overcome my stage fear, become Joint Secretary of a dev community, and built my first major project — a Digital Twin in Unreal Engine 5 for the Smart India Hackathon.",
    "I believe in learning by doing. Whether it's complex 3D environments or robust software systems, my goal is always to create tools and experiences that make an impact."
  ];

  const storyParagraphs = profile?.bio 
    ? profile.bio.split('\n').filter(p => p.trim()) 
    : defaultStory;

  const defaultBadges = [
    "Night owl 🦉",
    "Audiobook listener 🎧",
    "Builder in public 🛠️"
  ];

  const badges = profile?.badges || defaultBadges;
  const displayName = profile?.name || 'Aadhi';

  const chapters = [
    { id: 1, title: 'The Pivot', subtitle: 'Stepping Off the Path', icon: <Compass className="w-6 h-6" /> },
    { id: 2, title: 'Self-Learning', subtitle: 'Building the Foundation', icon: <BookOpen className="w-6 h-6" /> },
    { id: 3, title: 'Academia', subtitle: 'Growth & Collaboration', icon: <Award className="w-6 h-6" /> },
    { id: 4, title: 'Philosophy', subtitle: 'Learning by Doing', icon: <Sparkles className="w-6 h-6" /> }
  ];

  return (
    <section id="about" className="py-24 bg-bg bg-radial-glow relative overflow-hidden border-t border-line/30">
      {/* Drifting blurred glow spot */}
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-accent/3 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">About Me</h2>
          <div className="w-20 h-1 bg-accent rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Left Column - 3D Tilt Profiler Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-5"
          >
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="h-full glass-card hover:border-accent/40 shadow-xl rounded-2xl p-8 space-y-6 transition-all border border-line"
            >
              <h3 className="text-2xl font-display font-semibold text-accent mb-6">Who is {displayName}?</h3>
              
              {loading ? (
                <div className="space-y-5 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-bg-surface/40 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 select-text">
                  <div className="flex items-start space-x-4 group">
                    <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10 group-hover:bg-accent/15 group-hover:border-accent/35 transition-colors">
                      <MapPin className="text-accent w-4.5 h-4.5 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] text-ink-muted uppercase tracking-widest font-mono">Origin</p>
                      <p className="text-ink font-medium text-sm">{profile?.location_home || 'Tenkasi, TN'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group">
                    <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10 group-hover:bg-accent/15 group-hover:border-accent/35 transition-colors">
                      <GraduationCap className="text-accent w-4.5 h-4.5 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] text-ink-muted uppercase tracking-widest font-mono">Current</p>
                      <p className="text-ink font-medium text-sm leading-tight">{profile?.current_education || 'B.Tech IT lateral entry (final year)'}</p>
                      <p className="text-xs text-ink-muted mt-1 leading-normal">{profile?.current_college || 'Saveetha Engineering College, Chennai'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group">
                    <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10 group-hover:bg-accent/15 group-hover:border-accent/35 transition-colors">
                      <BookOpen className="text-accent w-4.5 h-4.5 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] text-ink-muted uppercase tracking-widest font-mono">Experience</p>
                      <p className="text-ink font-medium text-sm">{profile?.experience_years || '7+ years self-learning'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group">
                    <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/10 group-hover:bg-accent/15 group-hover:border-accent/35 transition-colors">
                      <Laptop className="text-accent w-4.5 h-4.5 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="text-[10px] text-ink-muted uppercase tracking-widest font-mono">Focus</p>
                      <p className="text-ink font-medium text-sm">{profile?.focus_area || 'Unreal Engine 5 & Systems'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Story tabs & Active chapter */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-7 flex flex-col justify-center"
          >
            <h3 className="text-2xl font-display font-semibold text-ink mb-6">My Journey</h3>
            
            {/* Horizontal chapter tab buttons */}
            <div className="flex flex-wrap gap-2 border-b border-line/40 pb-4 mb-6">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`px-3.5 py-2 text-xs font-mono border rounded-lg transition-all select-none ${
                    activeChapterIndex === idx
                      ? 'bg-accent/10 border-accent text-accent-light'
                      : 'border-line text-ink-muted hover:text-ink hover:border-line/80 bg-bg-surface/20'
                  }`}
                >
                  <span className="text-accent/60 mr-1">{String(ch.id).padStart(2, '0')}.</span>
                  {ch.title}
                </button>
              ))}
            </div>

            {/* Active Chapter Details Container */}
            <div className="relative overflow-hidden min-h-[220px]">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-5 bg-bg-surface/40 rounded w-full"></div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeChapterIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="relative p-6 rounded-xl border border-line bg-bg-surface/10 backdrop-blur-sm"
                  >
                    {/* Chapter Watermark Graphic */}
                    <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none transform scale-[3.5] text-accent">
                      {chapters[activeChapterIndex].icon}
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center space-x-2.5 mb-3.5">
                          <div className="p-2 rounded bg-accent/15 border border-accent/10 text-accent-light">
                            {chapters[activeChapterIndex].icon}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Chapter 0{activeChapterIndex + 1}</span>
                            <h4 className="text-lg font-display font-semibold text-ink leading-none mt-0.5">{chapters[activeChapterIndex].subtitle}</h4>
                          </div>
                        </div>

                        <p className="text-ink-muted text-base sm:text-lg leading-relaxed select-text">
                          {storyParagraphs[activeChapterIndex] || defaultStory[activeChapterIndex]}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Badges pills below the container */}
            <motion.div 
              className="flex flex-wrap gap-2 mt-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
              }}
            >
              {badges.map((badgeText, idx) => (
                <motion.div key={idx} variants={badgeVariants}>
                  <Badge variant="outline" className="px-3.5 py-1.5 text-xs font-medium bg-bg-surface/50 border-line text-ink-muted hover:text-ink hover:border-accent transition-all duration-300 rounded-full cursor-default select-none">
                    {badgeText}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
