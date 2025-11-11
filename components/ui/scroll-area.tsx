import React from 'react';

export const ScrollArea: React.FC<React.PropsWithChildren<{className?: string, style?: React.CSSProperties}>> = ({children, className, style}) => (
  <div className={(className || '') + ' overflow-auto'} style={style}>{children}</div>
);

export default ScrollArea;
