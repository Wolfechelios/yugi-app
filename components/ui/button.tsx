import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button {...props} className={(props.className || '') + ' px-3 py-1 rounded bg-gray-800 text-white'}>
      {children}
    </button>
  );
};

export default Button;
