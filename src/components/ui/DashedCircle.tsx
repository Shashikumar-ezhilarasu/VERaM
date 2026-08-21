import React from 'react';

interface DashedCircleProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function DashedCircle({ size = 100, className = '', ...props }: DashedCircleProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`overflow-visible ${className}`}
      {...props}
    >
      <circle 
        cx="50" 
        cy="50" 
        r={radius} 
        fill="none" 
        stroke="var(--accent-pink)" 
        strokeWidth="2"
        strokeDasharray="6 8" // 6px dash, 8px gap
      />
    </svg>
  );
}
