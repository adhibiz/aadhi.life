import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocument } from '../../hooks/useFirestore';
import { 
  Terminal, 
  FileCode, 
  Braces, 
  FileText, 
  ChevronRight, 
  Cpu, 
  Sparkles, 
  Code, 
  CheckCircle, 
  MapPin, 
  Award,
  ArrowRight,
  Monitor
} from 'lucide-react';

export const Hero = () => {
  const { document: profile } = useDocument('site_meta', 'profile');
  const [activeTab, setActiveTab] = useState('profile.json');
  const [cmdInput, setCmdInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'output', text: 'Welcome to Aadhi OS v1.2.0 (type "help" or click a shortcut below)' }
  ]);
  
  const terminalEndRef = useRef(null);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom of terminal when history changes
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // Fallback defaults from DB
  const heroName = profile?.hero_name || 'Aadhi';
  const heroTagline = profile?.hero_tagline || 'Learning. Building. Sharing.';
  const heroBio = profile?.hero_bio || 'Self-taught systems developer and game creator from Tenkasi. Over 7 years of crafting interactive experiences and engineering applications.';
  const heroStatus = profile?.hero_status || 'Available for new challenges';
  const heroCTA1 = profile?.hero_cta1 || 'See my work';
  const heroCTA2 = profile?.hero_cta2 || 'My story';
  const heroCodeName = profile?.name || 'Aadhi';
  const heroCodeLoc = profile?.location_home || 'Tenkasi, TN';
  const heroCodeEdu = profile?.experience_years || 'Self-Taught (7+ Years)';
  const heroCodeFocus = profile?.focus_area || 'Unreal Engine 5, Systems, React';
  const heroCodeTask = profile?.hero_code_task || 'Creating impact';

  const heroLanguages = profile?.hero_languages || ["C++", "C#", "Rust", "JS"];
  const heroEngines = profile?.hero_engines || ["Unreal Engine 5", "Unity"];
  const heroWeb = profile?.hero_web || ["React", "Tailwind", "Node.js"];
  const heroSystems = profile?.hero_systems || ["Multithreading", "Memory Management"];

  const files = [
    { name: 'profile.json', icon: <Braces className="w-3.5 h-3.5 text-yellow-500" /> },
    { name: 'stack.js', icon: <FileCode className="w-3.5 h-3.5 text-blue-400" /> },
    { name: 'bio.md', icon: <FileText className="w-3.5 h-3.5 text-emerald-400" /> },
    { name: 'terminal.sh', icon: <Terminal className="w-3.5 h-3.5 text-purple-400" /> }
  ];

  // Simulated terminal executor
  const executeCommand = (cmdText) => {
    const cleanCmd = cmdText.trim().toLowerCase();
    let response = [];

    if (cleanCmd === 'clear') {
      setTerminalHistory([]);
      return;
    }

    response.push({ type: 'command', text: cmdText });

    switch (cleanCmd) {
      case 'help':
        response.push({
          type: 'output',
          text: 'Available commands:\n  help         Display this menu\n  cat bio.md   Show short developer bio\n  npm run dev  Spin up development server\n  clear        Clear history'
        });
        break;
      case 'cat bio.md':
        response.push({
          type: 'output',
          text: `Biography:\n# ${heroCodeName}\nSelf-taught developer from ${heroCodeLoc}.\nYears Coding: ${heroCodeEdu}\nCurrent project focus: ${heroCodeFocus}`
        });
        break;
      case 'npm run dev':
        response.push({
          type: 'output',
          text: 'vite v8.1.1 dev server starting...\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose\n  ➜  Server initialized in 218ms!'
        });
        break;
      default:
        response.push({
          type: 'output',
          text: `aadhi-shell: command not found: "${cmdText}". Type "help" for a list of commands.`
        });
    }

    setTerminalHistory(prev => [...prev, ...response]);
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    executeCommand(cmdInput);
    setCmdInput('');
  };

  // Content rendering based on active file tab
  const renderEditorContent = () => {
    switch (activeTab) {
      case 'profile.json':
        return (
          <div className="space-y-1 font-mono text-xs md:text-sm text-[#c9d1d9] leading-relaxed">
            <div><span className="text-[#ff7b72]">{'{'}</span></div>
            <div className="pl-4"><span className="text-[#79c0ff]">"name"</span>: <span className="text-[#a5d6ff]">"{heroCodeName}"</span>,</div>
            <div className="pl-4"><span className="text-[#79c0ff]">"role"</span>: <span className="text-[#a5d6ff]">"Systems & Game Developer"</span>,</div>
            <div className="pl-4"><span className="text-[#79c0ff]">"location"</span>: <span className="text-[#a5d6ff]">"{heroCodeLoc}"</span>,</div>
            <div className="pl-4"><span className="text-[#79c0ff]">"education"</span>: <span className="text-[#a5d6ff]">"{heroCodeEdu}"</span>,</div>
            <div className="pl-4"><span className="text-[#79c0ff]">"status"</span>: <span className="text-[#a5d6ff]">"{heroStatus}"</span>,</div>
            <div className="pl-4"><span className="text-[#79c0ff]">"mission"</span>: <span className="text-[#a5d6ff]">"{heroCodeTask}"</span></div>
            <div><span className="text-[#ff7b72]">{'}'}</span></div>
          </div>
        );
      case 'stack.js':
        return (
          <div className="space-y-1 font-mono text-xs md:text-sm text-[#c9d1d9] leading-relaxed">
            <div><span className="text-[#ff7b72]">const</span> <span className="text-[#d2a6ff]">developer</span> = <span className="text-[#ff7b72]">{'{'}</span></div>
            <div className="pl-4">languages: <span className="text-[#ff7b72]">[</span>{heroLanguages.map((l, i) => <span key={i}><span className="text-[#a5d6ff]">"{l}"</span>{i < heroLanguages.length - 1 ? ', ' : ''}</span>)}<span className="text-[#ff7b72]">]</span>,</div>
            <div className="pl-4">engines: <span className="text-[#ff7b72]">[</span>{heroEngines.map((e, i) => <span key={i}><span className="text-[#a5d6ff]">"{e}"</span>{i < heroEngines.length - 1 ? ', ' : ''}</span>)}<span className="text-[#ff7b72]">]</span>,</div>
            <div className="pl-4">web: <span className="text-[#ff7b72]">[</span>{heroWeb.map((w, i) => <span key={i}><span className="text-[#a5d6ff]">"{w}"</span>{i < heroWeb.length - 1 ? ', ' : ''}</span>)}<span className="text-[#ff7b72]">]</span>,</div>
            <div className="pl-4">systems: <span className="text-[#ff7b72]">[</span>{heroSystems.map((s, i) => <span key={i}><span className="text-[#a5d6ff]">"{s}"</span>{i < heroSystems.length - 1 ? ', ' : ''}</span>)}<span className="text-[#ff7b72]">]</span></div>
            <div><span className="text-[#ff7b72]">{'}'}</span>;</div>
            <div className="pt-3 text-[#8b949e] font-mono italic">// Logging primary skills</div>
            <div><span className="text-[#79c0ff]">console</span>.<span className="text-[#d2a6ff]">log</span>(developer.engines[0]); <span className="text-[#8b949e]">// Output: "{heroEngines[0] || 'Unreal Engine 5'}"</span></div>
          </div>
        );
      case 'bio.md':
        return (
          <div className="space-y-2 font-mono text-xs md:text-sm text-[#c9d1d9] leading-relaxed">
            <h4 className="text-[#ff7b72] font-semibold border-b border-[#30363d] pb-1"># Biography</h4>
            <p className="text-[#8b949e] italic">{heroBio}</p>
            <h5 className="text-[#79c0ff] mt-4 font-semibold">## Mission</h5>
            <p className="text-[#c9d1d9]">To craft optimized backend architectures and immersive digital worlds.</p>
          </div>
        );
      case 'terminal.sh':
        return (
          <div className="flex flex-col h-[230px] justify-between font-mono text-xs">
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {terminalHistory.map((item, idx) => (
                <div key={idx} className="whitespace-pre-wrap">
                  {item.type === 'command' ? (
                    <div className="flex items-center text-[#ff7b72]">
                      <span className="text-[#79c0ff] mr-1.5 font-semibold">guest@aadhi ~ %</span>
                      <span>{item.text}</span>
                    </div>
                  ) : (
                    <div className="text-[#8b949e] leading-relaxed">{item.text}</div>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Input Prompt & Shortcut triggers */}
            <div className="mt-2 pt-2 border-t border-[#21262d]">
              <form onSubmit={handleTerminalSubmit} className="flex items-center text-[#c9d1d9] mb-1.5">
                <span className="text-[#79c0ff] mr-1.5 font-semibold">guest@aadhi ~ %</span>
                <input
                  type="text"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  className="bg-transparent border-none outline-none flex-grow text-[#c9d1d9] font-mono focus:ring-0 p-0 text-xs"
                  placeholder="type command..."
                  autoFocus
                />
              </form>

              {/* Quick shortcuts for user interaction */}
              <div className="flex flex-wrap gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => executeCommand('help')}
                  className="px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors border border-[#30363d] text-[10px]"
                >
                  help
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('cat bio.md')}
                  className="px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors border border-[#30363d] text-[10px]"
                >
                  cat bio.md
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('npm run dev')}
                  className="px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors border border-[#30363d] text-[10px]"
                >
                  npm run dev
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('clear')}
                  className="px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors border border-[#30363d] text-[10px]"
                >
                  clear
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-bg bg-grid-pattern bg-radial-glow-hero overflow-hidden pt-28 pb-16">
      {/* Dynamic drifting background ambient orbs */}
      <div className="absolute top-1/4 right-[10%] w-[380px] h-[380px] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 left-[15%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6000ms]"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Side: Gradient Typography & CTAs & Stats */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col items-start w-full lg:w-1/2 text-left"
        >
          {/* Availability Badges */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-accent/5 text-ink-accent border border-accent/15 mb-6 hover:border-accent/30 transition-all cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span>{heroStatus}</span>
          </motion.div>

          {/* Heading with text gradients */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }}
            className="text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-ink mb-4 leading-none"
          >
            I'm <span className="bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent">{heroName}</span>
          </motion.h1>

          {/* Tagline */}
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }}
            className="text-xl sm:text-2xl md:text-3xl font-body text-ink font-semibold opacity-90 mb-5"
          >
            {heroTagline}
          </motion.h2>

          {/* Bio paragraph */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }}
            className="text-base sm:text-lg text-ink-muted mb-8 max-w-md leading-relaxed"
          >
            {heroBio}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-12"
          >
            <button
              onClick={(e) => handleScroll(e, 'projects')}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-lg text-sm hover:bg-accent-light transition-all duration-300 shadow-md shadow-accent/10 active:scale-[0.98]"
            >
              <span>{heroCTA1}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={(e) => handleScroll(e, 'about')}
              className="px-6 py-3 border border-line bg-bg-surface/30 backdrop-blur-sm text-ink hover:text-accent font-medium rounded-lg text-sm hover:border-accent/45 hover:bg-bg-surface/50 transition-all duration-300 active:scale-[0.98]"
            >
              {heroCTA2}
            </button>
          </motion.div>

          {/* Quick Metrics / Stats Bar */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
            }}
            className="grid grid-cols-3 gap-6 w-full max-w-md border-t border-line/60 pt-6 font-mono"
          >
            <div>
              <div className="text-xl font-bold text-accent">7+ Yrs</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Self-Taught</div>
            </div>
            <div>
              <div className="text-xl font-bold text-accent">UE5 / C++</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Focus Tech</div>
            </div>
            <div>
              <div className="text-xl font-bold text-accent">20+</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Completed</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Interactive Mockup / Terminal IDE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end relative"
        >
          {/* Outer glowing border backdrop */}
          <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-[50px] pointer-events-none"></div>

          {/* IDE Window Frame (Always Dark Theme) */}
          <div className="relative w-full max-w-lg rounded-xl border border-[#21262d] bg-[#0d1117] text-[#c9d1d9] shadow-2xl overflow-hidden flex flex-col h-[380px]">
            
            {/* Header window control bar */}
            <div className="h-10 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between px-4 select-none shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
              </div>
              <div className="text-[11px] text-[#8b949e] font-mono flex items-center gap-1.5">
                <Monitor className="w-3 h-3" />
                <span>workspace - aadhi.life</span>
              </div>
              <div className="w-12"></div> {/* spacer */}
            </div>

            {/* Main IDE area (Sidebar + Editor Panel) */}
            <div className="flex flex-grow overflow-hidden">
              
              {/* IDE left sidebar file tree */}
              <div className="w-[125px] border-r border-[#21262d] bg-[#0d1117] hidden sm:flex flex-col py-3 select-none text-[11px] font-mono shrink-0">
                <span className="text-[#8b949e] uppercase text-[9px] px-4 font-bold tracking-wider mb-2.5">Explorer</span>
                <div className="px-3 py-1 text-[#c9d1d9] flex items-center gap-1.5 font-semibold text-[10px]">
                  <span>📁 workspace</span>
                </div>
                {files.map((file) => (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => setActiveTab(file.name)}
                    className={`pl-6 pr-3 py-1 flex items-center gap-1.5 w-full text-left transition-all ${
                      activeTab === file.name 
                        ? 'bg-[#21262d]/60 text-[#c9d1d9] border-l-2 border-accent' 
                        : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
                    }`}
                  >
                    {file.icon}
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>

              {/* Editor screen panel */}
              <div className="flex-grow flex flex-col bg-[#0d1117] overflow-hidden">
                
                {/* Horizontal Tab strip */}
                <div className="h-9 bg-[#161b22] flex items-end border-b border-[#21262d] overflow-x-auto select-none shrink-0 no-scrollbar">
                  {files.map((file) => (
                    <button
                      key={file.name}
                      type="button"
                      onClick={() => setActiveTab(file.name)}
                      className={`h-full px-3.5 flex items-center gap-1.5 text-[11px] font-mono border-r border-[#21262d] transition-all relative select-none ${
                        activeTab === file.name 
                          ? 'bg-[#0d1117] text-[#c9d1d9] font-medium' 
                          : 'bg-[#161b22] text-[#8b949e] hover:bg-[#161b22]/70 hover:text-[#c9d1d9]'
                      }`}
                    >
                      {file.icon}
                      <span>{file.name}</span>
                      {activeTab === file.name && (
                        <span className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#d4a853]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Editor core text canvas */}
                <div className="p-4 md:p-5 flex-grow overflow-auto select-text relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      {renderEditorContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Editor Footer information bar */}
            <div className="h-6 bg-[#161b22] border-t border-[#21262d] flex items-center justify-between px-3 select-none text-[10px] text-[#8b949e] font-mono shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[#3dd68c] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Prettier
                </span>
                <span>Ln 1, Col 1</span>
              </div>
              <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span>JavaScript</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
