import React from 'react';

interface ChaudharyLogoProps {
  size?: number;
  className?: string;
}

export const ChaudharyLogo: React.FC<ChaudharyLogoProps> = ({ size = 42, className = '' }) => {
  return (
    <div 
      className={`relative rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-white shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/chaudhary_logo.png"
        alt="Chaudhary Health Care Center Logo"
        className="w-full h-full object-contain p-0.5"
      />
    </div>
  );
};
