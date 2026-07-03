import React from 'react';
import { motion } from 'framer-motion';

export const SectionReveal = ({ children, id, className = "" }) => {
 return (
 <motion.div
  id={id}
  className={className}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.6, ease: "easeOut" }}
 >
  {children}
 </motion.div>
 );
};
