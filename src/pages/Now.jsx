import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sparkles, Hammer, BookOpen, Disc, Target, Activity, Clock } from 'lucide-react';

export default function Now() {
  const [nowData, setNowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNow = async () => {
      try {
        if (!db) return;
        const docRef = doc(db, 'now_page', 'current');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.last_updated && typeof data.last_updated.toDate === 'function') {
            data.last_updated = data.last_updated.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }
          setNowData(data);
        }
      } catch (error) {
        console.error("Error fetching Now data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNow();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-accent font-mono animate-pulse flex items-center gap-2">
          <Activity className="animate-spin text-accent" size={18} />
          Loading status...
        </div>
      </div>
    );
  }

  if (!nowData) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-ink-muted font-mono">No updates posted yet.</div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-light/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 border-b border-line/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                /now
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full text-green-500 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE UPDATES
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-ink tracking-tight">
              What I'm doing now
            </h1>
            <p className="text-sm text-ink-muted mt-3 max-w-xl">
              This is a personal status board showing my current focus, work direction, learning path, and goals.
            </p>
          </div>
          <div className="flex items-center gap-2 text-ink-muted text-xs font-mono bg-bg-surface/50 border border-line/40 px-3.5 py-2 rounded-xl shrink-0">
            <Clock size={14} className="text-accent" />
            <span>Updated: {nowData.last_updated}</span>
          </div>
        </motion.div>

        {/* Content Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Currently Card (Wide) */}
          {nowData.currently && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-12 group bg-bg-surface/30 border border-line/65 hover:border-line-strong rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-ink">Current Focus</h2>
              </div>
              <p className="text-lg text-ink-muted leading-relaxed pl-1">
                {nowData.currently}
              </p>
            </motion.div>
          )}

          {/* Building Card */}
          {nowData.building && nowData.building.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-6 group bg-bg-surface/30 border border-line/65 hover:border-line-strong rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Hammer size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-ink">Building</h2>
              </div>
              <ul className="space-y-4">
                {nowData.building.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-start gap-3 text-ink-muted hover:text-ink transition-colors duration-250"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="text-base leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Learning Card */}
          {nowData.learning && nowData.learning.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-6 group bg-bg-surface/30 border border-line/65 hover:border-line-strong rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-ink">Learning</h2>
              </div>
              <ul className="space-y-4">
                {nowData.learning.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-start gap-3 text-ink-muted hover:text-ink transition-colors duration-250"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light shrink-0" />
                    <span className="text-base leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Listening To Card */}
          {nowData.listening_to && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-6 group bg-bg-surface/30 border border-line/65 hover:border-line-strong rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Disc className="animate-[spin_10s_linear_infinite] text-accent" size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-ink">Listening To</h2>
              </div>
              <p className="text-base text-ink-muted leading-relaxed pl-1 italic">
                "{nowData.listening_to}"
              </p>
            </motion.div>
          )}

          {/* Goal Card */}
          {nowData.goal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="md:col-span-6 group bg-bg-surface/30 border border-line/65 hover:border-line-strong rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-accent/10 text-accent rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="animate-pulse text-accent" size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-ink">Primary Goal</h2>
              </div>
              <p className="text-base text-ink-muted leading-relaxed pl-1 font-medium">
                {nowData.goal}
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
