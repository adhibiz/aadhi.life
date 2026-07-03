import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 
 const { user, login } = useAuth();
 const navigate = useNavigate();

 useEffect(() => {
 if (user) {
  navigate('/admin/dashboard', { replace: true });
 }
 }, [user, navigate]);

 const handleLogin = async () => {
 if (!email || !password) return;
 
 setError('');
 setIsSubmitting(true);
 
 try {
  await login(email, password);
  navigate('/admin/dashboard', { replace: true });
 } catch (err) {
  setError('Wrong email or password. Try again.');
 } finally {
  setIsSubmitting(false);
 }
 };

 const handleKeyDown = (e) => {
 if (e.key === 'Enter') {
  handleLogin();
 }
 };

 return (
 <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
  <motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="w-full max-w-[400px]"
  >
  <div className="text-center mb-8">
   <h1 className="text-3xl font-display font-bold text-ink tracking-tight">aadhi.life</h1>
   <p className="text-sm text-ink-muted uppercase tracking-widest mt-2 font-medium">Admin Panel</p>
  </div>

  <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 shadow-xl">
   <div>
   <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    onKeyDown={handleKeyDown}
    className="w-full bg-bg-surface/40 border border-line rounded-lg px-4 py-3 text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
   />
   </div>

   <div className="relative">
   <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    onKeyDown={handleKeyDown}
    className="w-full bg-bg-surface/40 border border-line rounded-lg px-4 py-3 text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
   />
   <button
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
   >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
   </button>
   </div>

   <button
   onClick={handleLogin}
   disabled={isSubmitting || !email || !password}
   className="w-full bg-accent text-bg font-semibold py-3 rounded-lg hover:bg-accent-light hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-12 shadow-lg shadow-accent/10"
   >
   {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
   </button>
   
   {error && (
   <p className="text-red-500 text-sm text-center mt-2 font-medium">{error}</p>
   )}
  </div>
  </motion.div>
 </div>
 );
};
