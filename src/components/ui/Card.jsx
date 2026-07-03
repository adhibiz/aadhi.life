import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 pb-6 ${className}`} {...props}>{children}</div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-xl text-ink ${className}`} {...props}>{children}</h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`pt-0 ${className}`} {...props}>{children}</div>
);
