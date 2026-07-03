import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Button } from '../ui/Button';
import { Send, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';

const FALLBACK_MESSAGES = [
  { id: '1', name: 'Marcus K.', message: 'Minimalist builder aesthetics are top tier. Really clean layout lines and beautiful typography scale.', date_str: 'Jun 29, 2026' },
  { id: '2', name: 'Sarah (dev.sh)', message: 'Awesome site Aadhi! The cursor trail is so smooth, I literally played with it for a full minute before reading.', date_str: 'Jun 30, 2026' }
];

/* Generate deterministic HSL colors based on the sender's name */
const getNameColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 40%)`;
};

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const Guestbook = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const charLimit = 300;

  useEffect(() => {
    if (!db) {
      setMessages(FALLBACK_MESSAGES);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'guestbook'), 
      where('approved', '==', true),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setMessages(FALLBACK_MESSAGES);
      } else {
        const docs = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const date = data.created_at ? new Date(data.created_at.toDate()) : new Date();
          const date_str = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          docs.push({ id: doc.id, ...data, date_str });
        });
        setMessages(docs);
      }
      setLoading(false);
    }, (error) => {
      console.error("Guestbook fetch error:", error);
      setMessages(FALLBACK_MESSAGES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !message.trim()) return;
    if (message.length > charLimit) {
      setErrorMsg(`Message exceeds the limit of ${charLimit} characters.`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, 'guestbook'), {
          name: name.trim(),
          message: message.trim(),
          approved: false,
          created_at: serverTimestamp()
        });
      }
      setSuccess(true);
      setName('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting to guestbook:", error);
      setErrorMsg("Failed to submit message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="guestbook" className="py-24 bg-bg relative overflow-hidden border-t border-line/60">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-accent/4 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">Guestbook</h2>
          <div className="w-20 h-1 bg-accent rounded-full mb-6" />
          <p className="text-ink-muted max-w-xl">
            Leave a mark. Share a thought, some feedback, or just say hello to the community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="bg-bg-surface border border-line rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-full mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-lg font-display font-bold text-ink mb-2">Message Submitted!</h3>
                    <p className="text-ink-muted text-xs leading-relaxed max-w-[240px]">
                      Your entry has been sent to queue. It will appear on the feed after moderation.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                  >
                    <div>
                      <label htmlFor="name" className="block text-xs uppercase tracking-wider font-bold text-ink-muted mb-2 font-mono">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-bg border border-line text-ink rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent transition-colors placeholder:text-ink-muted/50 text-sm"
                        placeholder="Your name or handle"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="message" className="block text-xs uppercase tracking-wider font-bold text-ink-muted font-mono">
                          Message
                        </label>
                        <span className={`text-[10px] font-mono ${message.length > charLimit ? 'text-red-400 font-bold' : 'text-ink-muted'}`}>
                          {message.length}/{charLimit}
                        </span>
                      </div>
                      <textarea
                        id="message"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-bg border border-line text-ink rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-ink-muted/50 text-sm leading-relaxed"
                        placeholder="Leave a message..."
                        disabled={isSubmitting}
                      />
                    </div>

                    {errorMsg && (
                      <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs items-center">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || message.length > charLimit || !name.trim() || !message.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider"
                    >
                      <span>{isSubmitting ? 'Submitting...' : 'Sign Guestbook'}</span>
                      {!isSubmitting && <Send size={13} />}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Messages list container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-7"
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-bg-surface border border-line rounded-xl animate-pulse" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 bg-bg-surface/30 rounded-2xl border border-line/60">
                <MessageSquare className="w-10 h-10 text-ink-muted/30 mx-auto mb-3" />
                <p className="text-ink-muted text-sm">No messages yet. Be the first to sign!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((msg) => (
                  <motion.div 
                    layout
                    key={msg.id} 
                    className="p-5 bg-bg-surface/40 hover:bg-bg-surface/70 border border-line rounded-xl transition-colors duration-150 flex gap-4 items-start"
                  >
                    {/* User Initials Avatar bubble */}
                    <div 
                      className="w-9 h-9 rounded-full text-bg font-display font-bold flex items-center justify-center text-xs shrink-0 select-none shadow-sm"
                      style={{ backgroundColor: getNameColor(msg.name) }}
                    >
                      {getInitials(msg.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-sm sm:text-base leading-relaxed mb-3 font-normal whitespace-pre-wrap break-words">
                        "{msg.message}"
                      </p>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-line/30">
                        <span className="font-display font-semibold text-accent">{msg.name}</span>
                        <span className="text-ink-muted font-mono text-[10px]">{msg.date_str}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
