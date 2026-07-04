import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, AtSign, Download, ArrowRight, Globe } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Button } from '../ui/Button';

export const Contact = () => {
  const [profile, setProfile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');
  const [openToWork, setOpenToWork] = useState(true);
  const [availableFor, setAvailableFor] = useState([
    'Internships',
    'Freelance projects',
    'Workshop facilitation',
    'Collaborations',
    'Speaking / Guest sessions'
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!db) return;
        const docRef = doc(db, 'site_meta', 'profile');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          if (data.resume_url) setResumeUrl(data.resume_url);
          if (data.open_to_work !== undefined) setOpenToWork(data.open_to_work);
          if (data.available_for && data.available_for.length > 0) {
            setAvailableFor(data.available_for);
          }
        }
      } catch (error) {
        console.error("Error fetching profile details for contact:", error);
      }
    };

    fetchProfile();
  }, []);

  const [copied, setCopied] = useState(false);

  const emailVal = profile?.email || 'adhi2003@hotmail.com';
  const githubVal = profile?.github || 'https://github.com/adhibiz';
  const linkedinVal = profile?.linkedin || 'https://linkedin.com/in/adhibiz';
  const locationVal = profile?.location_current || 'Chennai / Tenkasi TN';
  const instagramVal = profile?.instagram || '#';

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(emailVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contactMethods = [
    { 
      icon: <Mail size={18} />, 
      label: 'Email', 
      value: emailVal, 
      href: `mailto:${emailVal}`,
      color: 'text-blue-400 border-blue-500/10 hover:border-blue-400/40 bg-blue-500/5',
      action: (
        <button 
          onClick={handleCopyEmail}
          className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors shrink-0"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )
    },
    { 
      icon: <FaGithub size={18} />, 
      label: 'GitHub', 
      value: githubVal.replace('https://', ''), 
      href: githubVal,
      color: 'text-ink border-line hover:border-ink/40 bg-bg-surface/40'
    },
    { 
      icon: <FaLinkedin size={18} />, 
      label: 'LinkedIn', 
      value: linkedinVal.replace('https://', '').replace('www.', ''), 
      href: linkedinVal,
      color: 'text-blue-500 border-blue-600/10 hover:border-blue-500/40 bg-blue-600/5'
    },
    { 
      icon: <FaInstagram size={18} />, 
      label: 'Instagram', 
      value: instagramVal !== '#' ? '@' + instagramVal.split('/').filter(Boolean).pop() : '@me_adhi.x', 
      href: instagramVal,
      color: 'text-pink-400 border-pink-500/10 hover:border-pink-400/40 bg-pink-500/5'
    },
    { 
      icon: <MapPin size={18} />, 
      label: 'Location', 
      value: locationVal, 
      href: null,
      color: 'text-accent border-accent/15 bg-accent/5'
    }
  ];

  return (
    <section id="contact" className="py-24 bg-bg relative overflow-hidden border-t border-line/60">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">Let's Connect</h2>
            <div className="w-20 h-1.5 bg-accent rounded-full mb-8" />
            
            <p className="text-base text-ink-muted mb-8 leading-relaxed">
              I'm open to collaborations, internships, workshops, and conversations about tech, game engines, and building things from scratch.
            </p>

            {openToWork && (
              <div className="border border-accent/20 bg-accent/5 backdrop-blur-md inline-flex items-center space-x-3 px-4.5 py-2.5 rounded-full mb-10 shadow-sm animate-pulse-subtle">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-mono font-bold tracking-wide uppercase text-ink">
                  Available for internships &middot; {new Date().getFullYear()}
                </span>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-[10px] font-mono font-bold text-ink-muted/50 uppercase tracking-[0.2em] mb-4">
                Availability Scope
              </h3>
              <ul className="space-y-3 text-ink font-medium text-sm">
                {availableFor.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-accent text-xs">✓</span> 
                    <span className="text-ink-muted/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {resumeUrl && (() => {
              const downloadUrl = resumeUrl.includes('cloudinary.com') 
                ? resumeUrl.replace('/upload/', '/upload/fl_attachment/') 
                : resumeUrl;
              return (
                <a href={downloadUrl} download="Resume.pdf" target="_blank" rel="noreferrer" className="inline-block w-full sm:w-auto">
                  <Button className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold shadow-lg shadow-accent/10 hover:shadow-accent/20 transition-all border border-accent/30 hover:border-accent">
                    <Download size={16} />
                    <span>Download Resume</span>
                  </Button>
                </a>
              );
            })()}
          </motion.div>

          {/* Right panel - Contacts list */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 space-y-4"
          >
            {contactMethods.map((method, idx) => (
              method.href ? (
                <a 
                  key={idx}
                  href={method.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center justify-between p-4 border rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${method.color}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg border border-line/40 text-accent group-hover:scale-105 transition-transform shrink-0">
                      {method.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-ink-muted/60 uppercase font-mono tracking-wider font-bold">{method.label}</p>
                      <p className="text-sm sm:text-base font-semibold text-ink group-hover:text-accent transition-colors truncate">{method.value}</p>
                    </div>
                  </div>
                  {method.action ? method.action : (
                    <ArrowRight size={14} className="text-ink-muted/50 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </a>
              ) : (
                <div 
                  key={idx}
                  className={`flex items-center p-4 border rounded-xl ${method.color}`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg border border-line/40 text-accent shrink-0 mr-4">
                    {method.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted/60 uppercase font-mono tracking-wider font-bold">{method.label}</p>
                    <p className="text-sm sm:text-base font-semibold text-ink">{method.value}</p>
                  </div>
                </div>
              )
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
