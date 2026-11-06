import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuth = () => {
 const [user, setUser] = useState(null);
 const [isAdmin, setIsAdmin] = useState(false);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (!auth) {
  setLoading(false);
  return;
 }
 const unsubscribe = onAuthStateChanged(auth, async (user) => {
  setUser(user);
  // Firestore rules only accept writes from accounts with the `admin` custom claim,
  // so the dashboard checks the same claim instead of "any signed-in user".
  let admin = false;
  if (user) {
   try {
    const token = await user.getIdTokenResult();
    admin = token.claims.admin === true;
   } catch (e) {
    console.error('Failed to read auth claims:', e);
   }
  }
  setIsAdmin(admin);
  setLoading(false);
 });
 return () => unsubscribe();
 }, []);

 const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
 const logout = () => signOut(auth);

 return { user, isAdmin, loading, login, logout };
};
