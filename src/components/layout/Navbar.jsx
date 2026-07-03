import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useDocument } from '../../hooks/useFirestore';

export const Navbar = () => {
 const [isScrolled, setIsScrolled] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [activeSection, setActiveSection] = useState('');
 const { theme, toggleTheme } = useTheme();
 const location = useLocation();
 const { document: profile } = useDocument('site_meta', 'profile');

 // Display name from admin, fallback to 'aadhi'
 const displayName = profile?.name?.toLowerCase() || 'aadhi';

 const navLinks = [
 { name: 'About', path: '/#about', sectionId: 'about' },
 { name: 'Projects', path: '/#projects', sectionId: 'projects' },
 { name: 'Blog', path: '/blog' },
 { name: 'Now', path: '/now' },
 { name: 'Contact', path: '/#contact', sectionId: 'contact' },
 ];

 // Track scroll position to detect active section
 useEffect(() => {
 if (location.pathname !== '/') {
  setActiveSection('');
  return;
 }

 const sectionIds = ['about', 'projects', 'contact'];
 
 const handleScroll = () => {
  const scrollY = window.scrollY + 120;
  let current = '';
  for (const id of sectionIds) {
  const el = document.getElementById(id);
  if (el && el.offsetTop <= scrollY) {
   current = id;
  }
  }
  setActiveSection(current);
  setIsScrolled(window.scrollY > 60);
 };

 handleScroll();
 window.addEventListener('scroll', handleScroll, { passive: true });
 return () => window.removeEventListener('scroll', handleScroll);
 }, [location.pathname]);

 useEffect(() => {
 if (location.pathname === '/') return;
 const handleScroll = () => setIsScrolled(window.scrollY > 60);
 window.addEventListener('scroll', handleScroll, { passive: true });
 return () => window.removeEventListener('scroll', handleScroll);
 }, [location.pathname]);

 const handleNavClick = (e, path) => {
 setMobileMenuOpen(false);
 if (path.startsWith('/#')) {
  const targetId = path.substring(2);
  if (location.pathname === '/') {
  e.preventDefault();
  const element = document.getElementById(targetId);
  if (element) {
   element.scrollIntoView({ behavior: 'smooth' });
  }
  }
 }
 };

 const isActive = (link) => {
 if (link.sectionId) {
  if (location.pathname !== '/') return false;
  return activeSection === link.sectionId;
 }
 return location.pathname.startsWith(link.path);
 };

 const linkClass = (link, mobile = false) => {
 const active = isActive(link);
 if (mobile) {
  return `block px-3 py-3 rounded-md text-base font-medium transition-colors ${
  active
   ? 'text-accent bg-accent/10'
   : 'text-ink-muted hover:text-ink hover:bg-black/5 '
  }`;
 }
 return `relative text-sm font-medium transition-colors group ${
  active
  ? 'text-accent'
  : 'text-ink-muted hover:text-ink '
 }`;
 };

 return (
  <nav
   className={`navbar ${isScrolled ? 'scrolled' : ''}`}
  >
   <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
   <div className="flex items-center justify-between">
    <Link
    to="/"
    className="font-display font-bold text-2xl hover:opacity-80 transition-opacity"
    >
    <span className="text-ink ">{displayName}</span>
    <span className="text-accent">.</span>
    </Link>

    {/* Desktop Nav */}
    <div className="hidden md:flex items-center space-x-8">
    <div className="flex space-x-6">
     {navLinks.map((link) => (
     <Link
      key={link.name}
      to={link.path}
      onClick={(e) => handleNavClick(e, link.path)}
      className={linkClass(link)}
     >
      {link.name}
      <span
      className={`absolute -bottom-1 left-0 h-[2px] bg-accent rounded-full transition-all duration-300 ${
       isActive(link) ? 'w-full' : 'w-0 group-hover:w-full'
      }`}
      />
     </Link>
     ))}
    </div>

    <button
     onClick={toggleTheme}
     className="p-2 rounded-lg bg-bg-surface/10 hover:bg-bg-surface/20 border border-line/30 text-ink-muted hover:text-accent transition-all"
     aria-label="Toggle Theme"
    >
     {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
    </div>

    {/* Mobile controls */}
    <div className="md:hidden flex items-center space-x-3">
    <button
     onClick={toggleTheme}
     className="p-2 rounded-lg bg-bg-surface/10 hover:bg-bg-surface/25 border border-line/30 text-ink-muted hover:text-accent transition-all"
     aria-label="Toggle Theme"
    >
     {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
    <button
     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
     className="text-ink-muted p-2"
    >
     {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
    </div>
   </div>
   </div>

   {/* Mobile Nav */}
   <AnimatePresence>
   {mobileMenuOpen && (
    <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.2 }}
    className="absolute top-full left-0 w-full bg-bg-nav border-b border-line shadow-lg md:hidden"
    >
    <div className="px-4 pt-2 pb-6 space-y-1">
     {navLinks.map((link) => (
     <Link
      key={link.name}
      to={link.path}
      onClick={(e) => handleNavClick(e, link.path)}
      className={linkClass(link, true)}
     >
      {link.name}
     </Link>
     ))}
    </div>
    </motion.div>
   )}
   </AnimatePresence>
  </nav>
 );
};
