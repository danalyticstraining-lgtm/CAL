import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'action' | 'accent' | 'feature';
  className?: string;
  colSpan?: number;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'default', className = '', colSpan = 1 }) => {
  let baseStyles = "h-16 rounded-2xl text-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center shadow-lg select-none";
  
  const variants = {
    default: "bg-gray-800 text-white hover:bg-gray-700",
    operator: "bg-gray-700 text-indigo-400 text-2xl hover:bg-gray-600",
    action: "bg-gray-700 text-red-400 hover:bg-gray-600",
    accent: "bg-indigo-600 text-white text-2xl hover:bg-indigo-500 shadow-indigo-500/20",
    feature: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold tracking-wide hover:opacity-90 shadow-emerald-500/20"
  };

  const spanClass = colSpan > 1 ? `col-span-${colSpan}` : '';

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${spanClass} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;