import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ChevronDown, GitCommit, GitBranch, GitMerge, GitPullRequest } from 'lucide-react';

const FALLBACK_TIMELINE = [
  { id: '1', year: "2013", title: "Left school after 8th standard", description: "Chose a different path. Enrolled in ITI to get hands-on experience." },
  { id: '2', year: "2015", title: "Discovered YouTube self-learning", description: "A senior showed me YouTube. That opened a doorway to software and global knowledge." },
  { id: '3', year: "2016", title: "Father's laptop — started building", description: "Taught myself OS installation, custom Android ROMs, and system troubleshooting." },
  { id: '4', year: "2018", title: "Diploma in Computer Engineering", description: "Only student in the batch for 3 years. Leveraged self-learning to master computing topics." },
  { id: '5', year: "2021", title: "B.Tech at Saveetha, Chennai", description: "Lateral entry. Left Tenkasi with big dreams and no connections." },
  { id: '6', year: "2022", title: "Broke stage fear, built network", description: "Joined Game and App Dev Community. Found peers to co-build tools." },
  { id: '7', year: "2023", title: "Became Joint Secretary", description: "Started leading workshops. Discovered that teaching is how I learn best." },
  { id: '8', year: "2024", title: "Campus Digital Twin in UE5", description: "Built an immersive 3D digital model of the Saveetha campus in Unreal Engine 5." },
  { id: '9', year: "2025", title: "Final year — building toward a company", description: "Developing leadership, project management, and final engineering releases." }
];

export const Timeline = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!db) {
      setEntries(FALLBACK_TIMELINE);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'timeline'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setEntries(FALLBACK_TIMELINE);
      } else {
        const docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        setEntries(docs);
      }
      setLoading(false);
    }, (error) => {
      console.error("Timeline fetch error:", error);
      setEntries(FALLBACK_TIMELINE);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleEntry = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Generate a deterministic 7-character commit hash based on year & id
  const getCommitHash = (year, id) => {
    const str = `${year}-${id}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 7);
  };

  // Determine label category from titles
  const getGitAction = (title) => {
    const t = title.toLowerCase();
    if (t.includes('diploma') || t.includes('school') || t.includes('b.tech') || t.includes('college')) {
      return { label: 'merge', color: 'text-purple-400 border-purple-500/35 bg-purple-500/10' };
    }
    if (t.includes('twin') || t.includes('ue5') || t.includes('android') || t.includes('project') || t.includes('unreal') || t.includes('building')) {
      return { label: 'release', color: 'text-emerald-400 border-emerald-500/35 bg-emerald-500/10' };
    }
    if (t.includes('secretary') || t.includes('workshops') || t.includes('network') || t.includes('fear') || t.includes('leading')) {
      return { label: 'deploy', color: 'text-blue-400 border-blue-500/35 bg-blue-500/10' };
    }
    if (t.includes('iti') || t.includes('first') || t.includes('started')) {
      return { label: 'init', color: 'text-amber-400 border-amber-500/35 bg-amber-500/10' };
    }
    return { label: 'commit', color: 'text-accent border-accent/35 bg-accent/10' };
  };

  return (
    <section id="timeline" className="py-24 bg-bg-surface border-t border-line bg-radial-glow relative overflow-hidden">
      {/* Ambient background particles/glows */}
      <div className="absolute top-1/4 right-[25%] w-[200px] h-[200px] bg-accent/3 rounded-full blur-[70px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">My Timeline</h2>
          <div className="w-20 h-1 bg-accent rounded-full mx-auto"></div>
        </motion.div>

        <div className="relative">
          {/* Vertical git branch line */}
          <div className="absolute left-[20px] sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-accent/30 to-transparent transform sm:-translate-x-1/2"></div>

          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center w-full sm:justify-between relative">
                  <div className="hidden sm:block w-[45%]"></div>
                  <div className="absolute left-[16px] sm:left-1/2 w-3 h-3 rounded-full bg-bg-hover transform sm:-translate-x-1/2 z-10 animate-pulse"></div>
                  <div className="w-full pl-14 sm:pl-0 sm:w-[45%]">
                    <div className="h-16 bg-bg/50 rounded-xl border border-line animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry, index) => {
                const isLast = index === entries.length - 1;
                const isOpen = openId === entry.id;
                const isEven = index % 2 === 0;
                const hash = getCommitHash(entry.year, entry.id);
                const gitAction = getGitAction(entry.title);

                return (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                    className={`flex flex-col sm:flex-row w-full relative group ${isEven ? 'sm:justify-start' : 'sm:justify-end'}`}
                  >
                    {/* Timeline Git Commit Node */}
                    <div className="absolute left-[5px] sm:left-1/2 top-5 flex items-center justify-center transform sm:-translate-x-1/2 z-10 select-none">
                      <button
                        type="button"
                        onClick={() => toggleEntry(entry.id)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isOpen 
                            ? 'bg-accent border-accent text-bg shadow-[0_0_15px_rgba(212,168,83,0.35)] scale-110' 
                            : 'bg-bg border-line text-accent group-hover:border-accent/60 group-hover:scale-105 shadow-md'
                        }`}
                      >
                        {isLast ? (
                          <GitPullRequest className="w-3.5 h-3.5 animate-pulse" />
                        ) : isEven ? (
                          <GitMerge className="w-3.5 h-3.5" />
                        ) : (
                          <GitCommit className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Content Card */}
                    <div className={`w-full pl-14 sm:pl-0 sm:w-[44%] ${!isEven && 'sm:ml-auto'}`}>
                      <div 
                        onClick={() => toggleEntry(entry.id)}
                        className={`glass-card hover:border-accent/40 rounded-xl p-5 cursor-pointer transition-all duration-300 border border-line/70 hover:shadow-lg ${
                          isOpen ? 'ring-1 ring-accent border-accent/40 bg-bg-surface/50 shadow-md' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 font-mono">
                          <div className="flex items-center space-x-1.5 select-none">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-line bg-bg-surface/60 text-ink-muted">
                              v{entry.year}
                            </span>
                            <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border ${gitAction.color}`}>
                              {gitAction.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-ink-muted">
                            <span className="text-[9px] font-mono opacity-80 select-all">ref:{hash}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
                          </div>
                        </div>
                        
                        <h3 className="text-ink font-display font-medium text-lg leading-snug group-hover:text-accent transition-colors">
                          {entry.title}
                        </h3>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-line font-mono text-xs text-ink-muted space-y-3 select-text">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-[#8b949e] select-none">
                                  <span>Author: Aadhi &lt;builder@aadhi.life&gt;</span>
                                  <span>Date: July 3, {entry.year}</span>
                                </div>
                                
                                {entry.description && (
                                  <p className="text-ink text-sm font-body leading-relaxed pl-1.5 border-l-2 border-accent/40 py-0.5">
                                    {entry.description}
                                  </p>
                                )}
                                
                                <div className="pt-2.5 border-t border-line/40 flex items-center justify-between text-[9px] text-[#8b949e] select-none">
                                  <span className="flex items-center gap-1">
                                    <GitBranch className="w-3 h-3 text-accent" /> branch: main
                                  </span>
                                  <span className="text-emerald-400 font-semibold">+1 file changed, {10 + (index * 4)} insertions(+)</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

