import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, AtSign, Download } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Button } from '../ui/Button';

export const Contact = () => {
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
   if (data.resume_url) setResumeUrl(data.resume_url);
   if (data.open_to_work !== undefined) setOpenToWork(data.open_to_work);
   if (data.available_for && data.available_for.length > 0) {
   setAvailableFor(data.available_for);
   }
  }
  } catch (error) {
  console.error("Error fetching resume URL:", error);
  }
 };

 fetchProfile();
 }, []);

 const contactMethods = [
 { icon: <Mail size={20} />, label: 'Email', value: 'adhi2003@hotmail.com', href: 'mailto:adhi2003@hotmail.com' },
 { icon: <FaGithub size={20} />, label: 'GitHub', value: 'github.com/adhibiz', href: 'https://github.com/adhibiz' },
 { icon: <FaLinkedin size={20} />, label: 'LinkedIn', value: 'linkedin.com/in/adhibiz', href: 'https://linkedin.com/in/adhibiz' },
 { icon: <AtSign size={20} />, label: 'Social', value: '@me_adhi.x', href: '#' },
 { icon: <MapPin size={20} />, label: 'Location', value: 'Chennai / Tenkasi TN', href: null },
 ];

 return (
 <section id="contact" className="py-24 bg-bg bg-radial-glow relative overflow-hidden">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
   
   <motion.div
   initial={{ opacity: 0, y: 30 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true }}
   transition={{ duration: 0.6 }}
   >
   <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">Let's Connect</h2>
   <div className="w-20 h-1 bg-accent rounded-full mb-8"></div>
   
   <p className="text-lg text-ink-muted mb-8 leading-relaxed max-w-md">
    I'm a final-year student open to collaborations, internships, workshops, and conversations about tech, games, and building things.
   </p>

   {openToWork && (
    <div className="border border-accent/20 bg-accent/5 backdrop-blur-md inline-flex items-center space-x-3 px-4 py-2 rounded-full mb-10">
    <span className="relative flex h-3 w-3">
     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
     <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </span>
    <span className="text-sm font-medium text-ink">Available for internships &middot; {new Date().getFullYear()}</span>
    </div>
   )}

   <div className="mb-10">
    <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-4">Open To</h3>
    <ul className="space-y-2 text-ink font-medium">
    {availableFor.map((item, idx) => (
     <li key={idx} className="flex items-center">
     <span className="text-accent mr-2">✓</span> {item}
     </li>
    ))}
    </ul>
   </div>

   {resumeUrl && (() => {
    const downloadUrl = resumeUrl.includes('cloudinary.com') 
    ? resumeUrl.replace('/upload/', '/upload/fl_attachment/') 
    : resumeUrl;
    return (
    <a href={downloadUrl} download="Resume.pdf" target="_blank" rel="noreferrer" className="inline-block">
     <Button className="flex items-center space-x-2 px-6 py-3 shadow-lg shadow-accent/10 hover:shadow-accent/20">
     <Download size={18} />
     <span>Download Resume</span>
     </Button>
    </a>
    );
   })()}
   </motion.div>

   <motion.div
   initial={{ opacity: 0, x: 30 }}
   whileInView={{ opacity: 1, x: 0 }}
   viewport={{ once: true }}
   transition={{ duration: 0.6, delay: 0.2 }}
   className="flex flex-col justify-center space-y-4"
   >
   {contactMethods.map((method, idx) => (
    method.href ? (
    <a 
     key={idx}
     href={method.href}
     target="_blank"
     rel="noreferrer"
     className="group flex items-center p-5 card rounded-xl"
    >
     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bg-surface text-accent group-hover:bg-accent group-hover:text-bg transition-colors mr-5 shrink-0">
     {method.icon}
     </div>
     <div>
     <p className="text-sm text-ink-muted font-medium mb-1">{method.label}</p>
     <p className="text-lg font-medium text-ink group-hover:text-accent transition-colors">{method.value}</p>
     </div>
    </a>
    ) : (
    <div 
     key={idx}
     className="flex items-center p-5 card rounded-xl"
    >
     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bg-surface text-accent mr-5 shrink-0">
     {method.icon}
     </div>
     <div>
     <p className="text-sm text-ink-muted font-medium mb-1">{method.label}</p>
     <p className="text-lg font-medium text-ink">{method.value}</p>
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
