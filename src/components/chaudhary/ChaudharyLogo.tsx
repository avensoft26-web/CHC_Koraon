import React, { useState } from 'react';
import logoImg from '../../assets/chaudhary_logo.png';

interface ChaudharyLogoProps {
  size?: number;
  className?: string;
}

export const ChaudharyLogo: React.FC<ChaudharyLogoProps> = ({ size = 42, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className={`relative rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-white shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      {!hasError ? (
        <img
          src={logoImg}
          alt="Chaudhary Health Care Center Logo"
          className="w-full h-full object-contain p-0.5"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs select-none">
          CHC
        </div>
      )}
    </div>
  );
};
