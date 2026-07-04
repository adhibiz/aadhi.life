import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Gamepad2, 
  Network, 
  Code, 
  Cpu, 
  Video, 
  Users, 
  BookOpen, 
  Layers 
} from 'lucide-react';



export const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setSkills([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'skills'), (snapshot) => {
      if (snapshot.empty) {
        setSkills([]);
      } else {
        const docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        // Sort client-side to avoid Firestore index requirement
        docs.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSkills(docs);
      }
      setLoading(false);
    }, (error) => {
      console.error("Skills fetch error:", error);
      setSkills([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getCategoryIcon = (category) => {
    const c = category.toLowerCase();
    if (c.includes('game')) return <Gamepad2 className="w-4 h-4 text-accent" />;
    if (c.includes('network') || c.includes('system') || c.includes('hardware')) return <Network className="w-4 h-4 text-accent" />;
    if (c.includes('program') || c.includes('web') || c.includes('code') || c.includes('dev')) return <Code className="w-4 h-4 text-accent" />;
    if (c.includes('ai') || c.includes('tool') || c.includes('prompt')) return <Cpu className="w-4 h-4 text-accent" />;
    if (c.includes('content') || c.includes('design') || c.includes('video') || c.includes('media')) return <Video className="w-4 h-4 text-accent" />;
    if (c.includes('lead') || c.includes('soft') || c.includes('comm') || c.includes('speak') || c.includes('mentor') || c.includes('community')) return <Users className="w-4 h-4 text-accent" />;
    if (c.includes('learning') || c.includes('learn')) return <BookOpen className="w-4 h-4 text-accent" />;
    return <Layers className="w-4 h-4 text-accent" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section id="skills" className="py-24 bg-bg border-t border-line/30 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-accent/3 rounded-full blur-[110px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">What I work with</h2>
          <div className="w-20 h-1 bg-accent rounded-full mx-auto"></div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-bg-surface/50 border border-line rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-grid"
          >
            {skills.map((skillGroup) => (
              <motion.div 
                key={skillGroup.id} 
                variants={itemVariants}
                className={`p-6 relative overflow-hidden transition-all duration-300 border border-line bg-bg-surface/20 hover:border-accent/40 hover:shadow-md rounded-xl select-none group ${
                  skillGroup.is_learning 
                    ? 'ring-1 ring-accent border-accent/40 shadow-lg shadow-accent/5' 
                    : ''
                }`}
              >
                {skillGroup.is_learning && (
                  <div className="absolute top-5 right-5 flex h-2 w-2 select-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </div>
                )}

                <div className="flex items-center space-x-2.5 mb-5 select-none">
                  <div className="p-2 rounded bg-accent/5 border border-accent/15 group-hover:bg-accent/15 group-hover:border-accent/35 transition-colors">
                    {getCategoryIcon(skillGroup.category)}
                  </div>
                  <h3 className={`text-base font-display font-bold leading-tight ${skillGroup.is_learning ? 'text-accent pr-6' : 'text-ink'}`}>
                    {skillGroup.category}
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-1.5 select-text">
                  {skillGroup.items?.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-bg-surface/60 border border-line/80 text-ink-muted hover:text-accent hover:border-accent/35 hover:bg-accent/5 transition-all duration-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center select-none"
        >
          <p className="text-ink-muted italic text-xs">7+ years of self-teaching. Still learning every day.</p>
        </motion.div>

      </div>
    </section>
  );
};
