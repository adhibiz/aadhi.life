import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuth = () => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (!auth) {
  setLoading(false);
  return;
 }
 const unsubscribe = onAuthStateChanged(auth, (user) => {
  setUser(user);
  setLoading(false);
 });
 return () => unsubscribe();
 }, []);

 const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
 const logout = () => signOut(auth);

 return { user, loading, login, logout };
};
