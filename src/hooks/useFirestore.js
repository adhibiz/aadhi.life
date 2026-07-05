import { useState, useEffect } from 'react';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirestore = (collectionRef) => {
 const [docs, setDocs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 if (!collectionRef) return;
 
 const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
  const documents = [];
  snapshot.forEach(doc => {
  documents.push({ id: doc.id, ...doc.data() });
  });
  setDocs(documents);
  setLoading(false);
 }, (err) => {
  setError(err.message);
  setLoading(false);
 });

 return () => unsubscribe();
 }, [collectionRef]);

 const addDocument = async (data) => {
 return await addDoc(collectionRef, data);
 };

 const updateDocument = async (id, data) => {
 const docRef = doc(db, collectionRef.id, id);
 return await updateDoc(docRef, data);
 };

 const deleteDocument = async (id) => {
 const docRef = doc(db, collectionRef.id, id);
 return await deleteDoc(docRef);
 };

 return { docs, loading, error, addDocument, updateDocument, deleteDocument };
};

export const useDocument = (collectionName, id) => {
 const [document, setDocument] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 if (!db || !id) return;
 
 const docRef = doc(db, collectionName, id);
 const unsubscribe = onSnapshot(docRef, (docSnap) => {
  if (docSnap.exists()) {
  setDocument({ id: docSnap.id, ...docSnap.data() });
  } else {
  setDocument(null);
  }
  setLoading(false);
 }, (err) => {
  setError(err.message);
  setLoading(false);
 });

 return () => unsubscribe();
 }, [collectionName, id]);

 return { document, loading, error };
};

export const useCollection = (collectionName, queryConstraints = []) => {
 const [documents, setDocuments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const queryKey = queryConstraints.map(c => c?.toString?.() || '').join(',');

 useEffect(() => {
 if (!db) return;

 const ref = collection(db, collectionName);
 const q = query(ref, ...queryConstraints);

 const unsubscribe = onSnapshot(q, (snapshot) => {
  const results = [];
  snapshot.forEach(doc => {
  results.push({ id: doc.id, ...doc.data() });
  });
  setDocuments(results);
  setLoading(false);
 }, (err) => {
  setError(err.message);
  setLoading(false);
 });

 return () => unsubscribe();
 }, [collectionName, queryKey]);

 return { documents, loading, error };
};
