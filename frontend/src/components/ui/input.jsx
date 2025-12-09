import React from 'react';

export const Input = ({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  className = '',
  error = false,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'w-full border rounded p-2 transition-colors';
  const stateStyles = error 
    ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-200' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
      {...props}
    />
  );
};

export default Input;
