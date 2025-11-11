import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
  return <input {...props} className={(props.className || '') + ' border px-2 py-1 rounded'} />;
};

export default Input;
