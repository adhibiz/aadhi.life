import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'badge bg-bg-surface text-ink border border-line',
    primary: 'badge bg-accent text-bg',
    completed: 'badge badge-completed',
    'in-progress': 'badge badge-in-progress',
    concept: 'badge badge-concept',
    outline: 'badge border border-line text-ink'
  };

  return (
    <span className={`${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

