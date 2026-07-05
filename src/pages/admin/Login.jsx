import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin/dashboard', { replace: true });
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0A0A0A',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '380px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: '700',
            color: '#F0EDE6',
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}>
            aadhi<span style={{ color: '#D4A853' }}>.</span>life
          </div>
          <div style={{ fontSize: '12px', color: '#555', letterSpacing: '0.06em' }}>
            Admin
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: '14px',
          padding: '28px 24px',
        }}>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', fontSize: '11px', color: '#666',
              marginBottom: '6px', letterSpacing: '0.04em',
            }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={onKey}
              placeholder="you@aadhi.life"
              autoComplete="email"
              style={{
                width: '100%', background: '#0A0A0A', border: '1px solid #2a2a2a',
                borderRadius: '8px', padding: '10px 12px', fontSize: '14px',
                color: '#F0EDE6', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.target.style.borderColor = '#D4A853'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', color: '#666',
              marginBottom: '6px', letterSpacing: '0.04em',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKey}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', background: '#0A0A0A', border: '1px solid #2a2a2a',
                  borderRadius: '8px', padding: '10px 40px 10px 12px', fontSize: '14px',
                  color: '#F0EDE6', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 200ms',
                }}
                onFocus={e => e.target.style.borderColor = '#D4A853'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  color: '#555', cursor: 'pointer', padding: '2px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 14 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: '12px', color: '#f87171',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '7px', padding: '9px 12px', overflow: 'hidden',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            id="login-submit"
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              background: loading || !email || !password ? '#1e1a10' : '#D4A853',
              color: loading || !email || !password ? '#555' : '#0A0A0A',
              border: 'none', borderRadius: '8px', padding: '11px',
              fontSize: '14px', fontWeight: '600',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              transition: 'opacity 180ms', fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { if (!loading && email && password) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading
              ? <Loader2 size={16} style={{ animation: 'sp 0.8s linear infinite' }} />
              : <><span>Sign in</span><ArrowRight size={15} /></>
            }
          </button>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a
            href="/"
            style={{ fontSize: '12px', color: '#444', textDecoration: 'none', transition: 'color 180ms' }}
            onMouseEnter={e => e.target.style.color = '#D4A853'}
            onMouseLeave={e => e.target.style.color = '#444'}
          >
            ← Back to site
          </a>
        </div>
      </motion.div>

      <style>{`@keyframes sp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};