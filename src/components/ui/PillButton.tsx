import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  children: React.ReactNode;
}

export function PillButton({ variant = 'solid', className = '', children, ...props }: PillButtonProps) {
  const base = "inline-flex items-center justify-center px-6 py-3 rounded-full font-mono text-sm tracking-[0.1em] uppercase transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-accent-pink text-white hover:bg-opacity-90",
    outline: "border-2 border-accent-pink text-accent-pink hover:bg-accent-pink hover:text-white"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
