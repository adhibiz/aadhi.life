import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ProjectModal } from '../ui/ProjectModal';
import { Badge } from '../ui/Badge';
import { ArrowRight, ExternalLink } from 'lucide-react';

const FALLBACK_PROJECTS = [
  {
    id: '1',
    title: "Saveetha Campus Digital Twin",
    status: "In Progress",
    team: "Solo",
    short_desc: "A massive undertaking to recreate the entire Saveetha Engineering College campus in Unreal Engine 5.",
    tech: ["UE5.5", "Blueprint", "Nanite", "Lumen"],
    full_desc: "A massive undertaking to recreate the entire Saveetha Engineering College campus in Unreal Engine 5. Leveraging Nanite for high-fidelity geometry and Lumen for dynamic global illumination.",
    why_built: "To test the limits of UE5's architectural visualization capabilities and provide an interactive exploration tool for students and visitors.",
    order: 1
  },
  {
    id: '2',
    title: "Lost Lab — VR Escape Room",
    status: "In Progress",
    team: "Solo",
    short_desc: "An immersive VR escape room for the Meta Quest with physics-based puzzles.",
    tech: ["UE5.5", "Meta Quest VR", "Blueprint"],
    full_desc: "An immersive virtual reality escape room experience designed specifically for the Meta Quest headset. Players must solve physics-based puzzles and interact with complex machinery to escape.",
    why_built: "VR development requires a completely different approach to user experience and optimization. I wanted to master VR interaction mechanics in Unreal Engine.",
    order: 2
  },
  {
    id: '3',
    title: "Smart QR Canteen Booking",
    status: "Concept",
    team: "Solo",
    short_desc: "Pre-booking system for college canteen via QR scanning and digital tokens.",
    tech: ["QR Code", "Web App", "App integration"],
    full_desc: "A conceptual application aimed at solving the long queues in college canteens by allowing pre-booking via QR code scanning and digital tokens.",
    why_built: "Born out of the frustration of wasting lunch breaks waiting in lines.",
    order: 3
  },
  {
    id: '4',
    title: "UE5 Blueprint Workshop",
    status: "Completed",
    team: "Solo Facilitator",
    short_desc: "A workshop series teaching game logic visually using Unreal Engine's Blueprint system.",
    tech: ["UE5.5", "Blueprint", "Education"],
    full_desc: "A comprehensive workshop series designed to teach absolute beginners how to program game logic visually using Unreal Engine's Blueprint system.",
    why_built: "I realized the best way to solidify my own knowledge was to teach it to others.",
    order: 4
  }
];

const statusVariant = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'in progress' || s === 'in-progress') return 'in-progress';
  return 'concept';
};

/* ── Placeholder cover when no image ── */
const PlaceholderCover = ({ title, accent = false }) => (
  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
    accent
      ? 'from-accent/20 via-bg-surface to-bg'
      : 'from-bg-surface via-bg to-bg-nav'
  }`}>
    <span className="text-5xl md:text-7xl font-display font-black text-ink/10 select-none tracking-tight">
      {title.substring(0, 2).toUpperCase()}
    </span>
  </div>
);

const projectImg = (url, w = 800, h = 600) =>
  url?.replace('/upload/', `/upload/w_${w},h_${h},c_fill,q_auto,f_auto/`);

/* ── Hero (first) card — full width ── */
const HeroCard = ({ project, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55 }}
    onClick={onClick}
    className="group col-span-1 md:col-span-2 relative rounded-2xl overflow-hidden cursor-pointer border border-line hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 bg-bg-surface"
  >
    {/* Image */}
    <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
      {project.cover_image_url ? (
        <img
          src={projectImg(project.cover_image_url, 1200, 800)}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      ) : (
        <PlaceholderCover title={project.title} accent />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

      {/* Status badge top-left */}
      <div className="absolute top-4 left-4">
        <Badge variant={statusVariant(project.status)} className="backdrop-blur-md shadow-lg">
          {project.status}
        </Badge>
      </div>

      {/* Featured accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>

    {/* Content overlay at the bottom */}
    <div className="p-6 md:p-8 -mt-2 relative z-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-ink mb-2 group-hover:text-accent transition-colors duration-200 truncate-wrap leading-tight">
            {project.title}
          </h3>
          <p className="text-ink-muted text-sm md:text-base leading-relaxed line-clamp-2 mb-4 max-w-xl">
            {project.short_desc || project.full_desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {(project.tech_tags || project.tech || []).slice(0, 5).map((t, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-bg-surface/80 border border-line/60 text-ink-muted text-xs rounded-md font-mono backdrop-blur-sm">
                {t}
              </span>
            ))}
            {(project.tech_tags || project.tech || []).length > 5 && (
              <span className="px-2.5 py-1 bg-bg-surface/80 border border-line/60 text-ink-muted text-xs rounded-md">
                +{(project.tech_tags || project.tech).length - 5}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-accent font-semibold text-sm mt-1 whitespace-nowrap">
          <span className="hidden sm:inline">View Project</span>
          <span className="p-2 rounded-full bg-accent/10 border border-accent/20 group-hover:bg-accent group-hover:text-bg transition-all duration-200">
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Compact card ── */
const CompactCard = ({ project, onClick, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay }}
    onClick={onClick}
    className="group relative rounded-2xl overflow-hidden cursor-pointer border border-line hover:border-accent/40 hover:ring-1 hover:ring-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 bg-bg-surface flex flex-col"
  >
    {/* Image */}
    <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
      {project.cover_image_url ? (
        <img
          src={projectImg(project.cover_image_url, 600, 400)}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      ) : (
        <PlaceholderCover title={project.title} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/90 to-transparent" />
      <div className="absolute top-3 left-3">
        <Badge variant={statusVariant(project.status)} className="backdrop-blur-md text-[10px] shadow">
          {project.status}
        </Badge>
      </div>
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-display font-bold text-ink mb-1.5 group-hover:text-accent transition-colors duration-200 line-clamp-2 leading-snug">
        {project.title}
      </h3>
      {project.team && (
        <p className="text-ink-muted text-xs mb-3">{project.team}</p>
      )}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(project.tech_tags || project.tech || []).slice(0, 3).map((t, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-bg/60 border border-line/50 text-ink-muted text-[11px] rounded font-mono">
            {t}
          </span>
        ))}
        {(project.tech_tags || project.tech || []).length > 3 && (
          <span className="px-2 py-0.5 bg-bg/60 border border-line/50 text-ink-muted text-[11px] rounded">
            +{(project.tech_tags || project.tech).length - 3}
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center text-accent text-xs font-medium gap-1">
        <span>View Project</span>
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </motion.div>
);

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (!db) {
      setProjects(FALLBACK_PROJECTS);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (snapshot.empty) {
        setProjects(FALLBACK_PROJECTS);
      } else {
        const docs = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.published !== false) {
            docs.push({ id: doc.id, ...data });
          }
        });
        docs.sort((a, b) => (a.order || 0) - (b.order || 0));
        setProjects(docs);
      }
      setLoading(false);
    }, (error) => {
      console.error("Projects fetch error:", error);
      setProjects(FALLBACK_PROJECTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [heroProject, ...restProjects] = projects;

  return (
    <section id="projects" className="py-24 bg-bg relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/4 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">Things I've built</h2>
            <div className="w-20 h-1 bg-accent rounded-full" />
          </div>
          <p className="text-ink-muted max-w-sm md:text-right text-sm leading-relaxed">
            A collection of things I've built — from physical systems to virtual worlds.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 h-96 bg-bg-surface rounded-2xl animate-pulse border border-line" />
            {[1, 2].map(i => (
              <div key={i} className="h-72 bg-bg-surface rounded-2xl animate-pulse border border-line" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero card */}
            {heroProject && (
              <HeroCard
                project={heroProject}
                onClick={() => setSelectedProject(heroProject)}
              />
            )}

            {/* Compact cards */}
            {restProjects.map((project, idx) => (
              <CompactCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                delay={idx * 0.08}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <p className="text-ink-muted italic text-xs">More projects coming. I build, then I share.</p>
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </section>
  );
};
