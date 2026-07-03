import React from 'react';

export const AdminCard = ({ title, action, children, className = '' }) => {
 return (
 <div className={`glass-card rounded-2xl overflow-hidden shadow-md ${className}`}>
  {(title || action) && (
  <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-bg-surface/20">
   {title && <h3 className="font-semibold text-lg text-ink ">{title}</h3>}
   {action && <div>{action}</div>}
  </div>
  )}
  <div className="p-6">
  {children}
  </div>
 </div>
 );
};
