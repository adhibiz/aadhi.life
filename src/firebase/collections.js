import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Ensure db is defined before calling firestore functions, 
// if not, return empty/dummy promises to avoid breaking SSR/build if db fails.

export const getProfile = async () => {
 if (!db) return null;
 try {
 const docRef = doc(db, 'site_meta', 'profile');
 const docSnap = await getDoc(docRef);
 return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
 } catch (e) {
 console.error(e);
 return null;
 }
};

export const getProjects = async () => {
 if (!db) return [];
 try {
 const querySnapshot = await getDocs(collection(db, 'projects'));
 const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
 } catch (e) {
 console.error(e);
 return [];
 }
};

export const getPublishedPosts = async () => {
 if (!db) return [];
 try {
 const querySnapshot = await getDocs(collection(db, 'blog_posts'));
 const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 return docs
  .filter(doc => doc.published === true)
  .sort((a, b) => {
  const tA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
  const tB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
  return tB - tA;
  });
 } catch (e) {
 console.error(e);
 return [];
 }
};

export const getSkills = async () => {
 if (!db) return [];
 try {
 const querySnapshot = await getDocs(collection(db, 'skills'));
 const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
 } catch (e) {
 console.error(e);
 return [];
 }
};

export const getTimeline = async () => {
 if (!db) return [];
 try {
 const querySnapshot = await getDocs(collection(db, 'timeline'));
 const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
 } catch (e) {
 console.error(e);
 return [];
 }
};

export const getApprovedGuestbook = async () => {
 if (!db) return [];
 try {
 const querySnapshot = await getDocs(collection(db, 'guestbook'));
 const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 return docs
  .filter(doc => doc.approved === true)
  .sort((a, b) => {
  const tA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
  const tB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
  return tB - tA;
  });
 } catch (e) {
 console.error(e);
 return [];
 }
};

export const getPendingGuestbook = async () => {
 if (!db) return [];
 try {
 const querySnapshot = await getDocs(collection(db, 'guestbook'));
 const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 return docs
  .filter(doc => doc.approved === false)
  .sort((a, b) => {
  const tA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
  const tB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
  return tB - tA;
  });
 } catch (e) {
 console.error(e);
 return [];
 }
};

export const updateGuestbookStatus = async (id, approved) => {
 if (!db) throw new Error("Database not initialized");
 const docRef = doc(db, 'guestbook', id);
 return await updateDoc(docRef, { approved });
};

export const deleteGuestbookEntry = async (id) => {
 if (!db) throw new Error("Database not initialized");
 const docRef = doc(db, 'guestbook', id);
 return await deleteDoc(docRef);
};

export const getNowPage = async () => {
 if (!db) return null;
 try {
 const docRef = doc(db, 'now_page', 'current');
 const docSnap = await getDoc(docRef);
 return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
 } catch (e) {
 console.error(e);
 return null;
 }
};

export const addGuestbookEntry = async (name, message) => {
 if (!db) throw new Error("Database not initialized");
 return await addDoc(collection(db, 'guestbook'), {
 name,
 message,
 approved: false,
 created_at: serverTimestamp()
 });
};
