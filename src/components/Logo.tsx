import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Al Amin Edu Oasis Distinctive Islamic Geometric & Oasis Palm Emblem */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0E9F9A] to-[#0A726F] text-white shadow-md shadow-[#0E9F9A]/20 flex-shrink-0`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-sm"
        >
          {/* Islamic Arch & Modern Oasis Leaf Motif */}
          <path
            d="M20 5C14 10 10 16 10 24C10 29.5 14.5 34 20 34C25.5 34 30 29.5 30 24C30 16 26 10 20 5Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Internal Oasis Sprout / Pen Nib of Knowledge */}
          <path
            d="M20 12V27M16 19C18 21 20 23 20 23C20 23 22 21 24 19"
            stroke="#E3F6F5"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Star of Excellence */}
          <circle cx="20" cy="10" r="1.5" fill="#F59E0B" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-heading font-bold tracking-tight ${
              light ? 'text-white' : 'text-[#0A726F]'
            } ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}`}
          >
            Al Amin Edu Oasis
          </span>
          <span
            className={`text-[10px] uppercase font-semibold tracking-wider ${
              light ? 'text-emerald-100' : 'text-[#0E9F9A]'
            }`}
          >
            Marketing CMS & LMS
          </span>
        </div>
      )}
    </div>
  );
};
