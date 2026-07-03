import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Moon, Sun } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useDocument } from '../../hooks/useFirestore';

export const Footer = () => {
  const { theme, toggleTheme } = useTheme();
  const { document: profile } = useDocument('site_meta', 'profile');

  const displayName = profile?.name?.toLowerCase() || 'aadhi';
  const tagline = profile?.hero_tagline || 'Learning. Building. Sharing.';
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-line bg-bg-nav pt-16 pb-8 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-16">
          {/* Column 1 */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="font-display font-bold text-2xl text-ink">
              <span className="text-ink">{displayName}</span>
              <span className="text-accent">.</span>
            </Link>
            <p className="text-ink-muted text-sm max-w-xs leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-2">Navigation</h3>
            <Link to="/#about" className="text-sm text-ink-muted hover:text-accent transition-colors">About</Link>
            <Link to="/#projects" className="text-sm text-ink-muted hover:text-accent transition-colors">Projects</Link>
            <Link to="/blog" className="text-sm text-ink-muted hover:text-accent transition-colors">Blog</Link>
            <Link to="/now" className="text-sm text-ink-muted hover:text-accent transition-colors">Now</Link>
            <Link to="/#contact" className="text-sm text-ink-muted hover:text-accent transition-colors">Contact</Link>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wider mb-2">Connect</h3>
            <div className="flex space-x-3">
              <a 
                href={profile?.github || '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 -ml-2 rounded-lg text-ink-muted hover:bg-accent-muted hover:text-ink transition-all border border-transparent hover:border-accent/10"
                title="GitHub"
              >
                <FaGithub size={18} />
              </a>
              <a 
                href={profile?.instagram || '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 rounded-lg text-ink-muted hover:bg-accent-muted hover:text-ink transition-all border border-transparent hover:border-accent/10"
                title="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a 
                href={profile?.linkedin || '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 rounded-lg text-ink-muted hover:bg-accent-muted hover:text-ink transition-all border border-transparent hover:border-accent/10"
                title="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a 
                href={`mailto:${profile?.email || '#'}`} 
                className="p-2 rounded-lg text-ink-muted hover:bg-accent-muted hover:text-ink transition-all border border-transparent hover:border-accent/10"
                title="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-line text-xs font-mono">
          <p className="text-ink-muted mb-4 sm:mb-0">
            &copy; {year} {profile?.name || 'Aadhi'} &middot; Made with ♥
          </p>
          <button 
            onClick={toggleTheme}
            className="flex items-center space-x-2 text-ink-muted hover:text-accent transition-colors bg-bg border border-line px-3 py-1.5 rounded-md"
            aria-label="Toggle Theme"
          >
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

      </div>
    </footer>
  );
};

