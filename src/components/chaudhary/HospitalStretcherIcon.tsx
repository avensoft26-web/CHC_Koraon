import React from 'react';

interface HospitalStretcherIconProps {
  className?: string;
}

export const HospitalStretcherIcon: React.FC<HospitalStretcherIconProps> = ({
  className = 'w-5 h-5',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. Medical Cross in Circle Badge */}
      <circle cx="50" cy="21" r="14" fill="#E2E8F0" />
      {/* Red Cross */}
      <path
        d="M47 13h6v5h5v6h-5v5h-6v-5h-5v-6h5v-5z"
        fill="#EF4444"
      />

      {/* 2. Inclined Backrest Strut */}
      <line
        x1="12"
        y1="61"
        x2="21"
        y2="46"
        stroke="#475569"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 3. Blue Mattress with Raised Backrest */}
      {/* Raised Headrest (Left) */}
      <path
        d="M8.5 37.5C7.2 35.8 7.8 33.3 9.7 32.2l8.8-5.3c1.8-1.1 4.2-.5 5.3 1.3l10.2 16.5c.7 1.1 1.9 1.7 3.2 1.7H92c2.2 0 4 1.8 4 4v3.5c0 1.1-.9 2-2 2H33c-1.4 0-2.7-.7-3.4-1.9L8.5 37.5z"
        fill="#4F6FD4"
      />
      {/* Top soft highlight on mattress */}
      <path
        d="M10.8 33.2l8.5-5.1c1.2-.7 2.8-.3 3.5.9l9.6 15.5H94v-2c0-1.1-.9-2-2-2H36.2c-1.3 0-2.5-.6-3.2-1.7L12 28.5"
        fill="#6889EA"
        opacity="0.4"
      />

      {/* 4. Side Guard Rail (Dark Slate with 3 window cutouts) */}
      <rect x="42" y="41" width="44" height="20" rx="6" fill="#334155" />
      {/* 3 Cutout Windows */}
      <rect x="48.5" y="47" width="8" height="6.5" rx="1.5" fill="#E2E8F0" />
      <rect x="60" y="47" width="8" height="6.5" rx="1.5" fill="#E2E8F0" />
      <rect x="71.5" y="47" width="8" height="6.5" rx="1.5" fill="#E2E8F0" />

      {/* 5. Stretcher Base Bar (Silver/Gray) */}
      <rect x="6" y="61" width="88" height="7.5" rx="2" fill="#CBD5E1" />

      {/* 6. Vertical Wheel Legs */}
      <rect x="14" y="68.5" width="3.5" height="11" fill="#CBD5E1" />
      <rect x="82.5" y="68.5" width="3.5" height="11" fill="#CBD5E1" />

      {/* 7. Bottom Wheel Axle */}
      <line
        x1="15"
        y1="85.5"
        x2="85"
        y2="85.5"
        stroke="#CBD5E1"
        strokeWidth="2.5"
      />

      {/* 8. Wheels */}
      {/* Left Wheel */}
      <circle cx="15.7" cy="85.5" r="8.5" fill="#475569" />
      <circle cx="15.7" cy="85.5" r="3.2" fill="#1E293B" />
      {/* Right Wheel */}
      <circle cx="84.3" cy="85.5" r="8.5" fill="#475569" />
      <circle cx="84.3" cy="85.5" r="3.2" fill="#1E293B" />
    </svg>
  );
};
