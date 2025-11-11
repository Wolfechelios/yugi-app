import React from 'react';

export const Card: React.FC<React.PropsWithChildren<{className?: string}>> = ({ children, className }) => (
  <div className={(className || '') + ' border rounded p-2 bg-white shadow-sm'}>{children}</div>
);

export const CardHeader: React.FC<React.PropsWithChildren<{className?: string}>> = ({children, className}) => (
  <div className={(className || '') + ' mb-2'}>{children}</div>
);

export const CardTitle: React.FC<React.PropsWithChildren<{className?: string}>> = ({children, className}) => (
  <h3 className={(className || '') + ' font-semibold'}>{children}</h3>
);

export const CardContent: React.FC<React.PropsWithChildren<{className?: string}>> = ({children, className}) => (
  <div className={className || ''}>{children}</div>
);

export default Card;
