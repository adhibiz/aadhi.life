import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';



export default function Now() {
 const [nowData, setNowData] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchNow = async () => {
  try {
  if (!db) return;
  const docRef = doc(db, 'now_page', 'current');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
   const data = docSnap.data();
   if (data.last_updated && typeof data.last_updated.toDate === 'function') {
   data.last_updated = data.last_updated.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
   }
   setNowData(data);
  }
  } catch (error) {
  console.error("Error fetching Now data:", error);
  } finally {
  setLoading(false);
  }
 };

 fetchNow();
 }, []);

 if (loading) {
  return (
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center justify-center">
   <div className="text-ink-muted font-mono animate-pulse">Loading...</div>
   </div>
  );
 }

 if (!nowData) {
  return (
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center justify-center">
   <div className="text-ink-muted font-mono">No updates posted yet.</div>
   </div>
  );
 }

 return (
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen">
  <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  >
  <div className="mb-16">
   <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">What I'm doing now</h1>
   <div className="w-20 h-1 bg-accent rounded-full mb-6"></div>
   <p className="text-ink-muted text-sm font-mono flex items-center">
   <span className="relative flex h-2.5 w-2.5 mr-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
   </span>
   Last updated: {nowData.last_updated}
   </p>
  </div>

  <div className="space-y-12">
   {nowData.currently && (
   <section>
    <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center">
    <span className="text-accent mr-3">&rarr;</span> Currently
    </h2>
    <p className="text-lg text-ink-muted leading-relaxed pl-8 border-l-2 border-line ml-2 whitespace-pre-wrap">
    {nowData.currently}
    </p>
   </section>
   )}

   {nowData.building && nowData.building.length > 0 && (
   <section>
    <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center">
    <span className="text-accent mr-3">&rarr;</span> Building
    </h2>
    <ul className="text-lg text-ink-muted leading-relaxed pl-8 border-l-2 border-line ml-2 space-y-3">
    {nowData.building.map((item, idx) => (
     <li key={idx}>{item}</li>
    ))}
    </ul>
   </section>
   )}

   {nowData.learning && nowData.learning.length > 0 && (
   <section>
    <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center">
    <span className="text-accent mr-3">&rarr;</span> Learning
    </h2>
    <ul className="text-lg text-ink-muted leading-relaxed pl-8 border-l-2 border-line ml-2 space-y-3">
    {nowData.learning.map((item, idx) => (
     <li key={idx}>{item}</li>
    ))}
    </ul>
   </section>
   )}

   {nowData.listening_to && (
   <section>
    <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center">
    <span className="text-accent mr-3">&rarr;</span> Listening to
    </h2>
    <p className="text-lg text-ink-muted leading-relaxed pl-8 border-l-2 border-line ml-2 whitespace-pre-wrap">
    {nowData.listening_to}
    </p>
   </section>
   )}

   {nowData.goal && (
   <section>
    <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center">
    <span className="text-accent mr-3">&rarr;</span> Goal
    </h2>
    <p className="text-lg text-ink-muted leading-relaxed pl-8 border-l-2 border-line ml-2 whitespace-pre-wrap">
    {nowData.goal}
    </p>
   </section>
   )}
  </div>

  </motion.div>
 </div>
 );
}
