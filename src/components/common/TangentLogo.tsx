import React from 'react';

interface TangentLogoProps {
  className?: string;
  size?: number | string;
}

export const TangentLogo: React.FC<TangentLogoProps> = ({ className = "w-6 h-6", size }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={className} 
      style={size ? { width: size, height: size } : undefined}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle Outer Teal Background */}
      <circle cx="250" cy="250" r="250" fill="#0D8A96" />
      
      {/* Curved Dark Charcoal/Grey Road Swoosh Element on Left */}
      <path 
        d="M 185 8 C 195 90 230 180 230 280 C 230 370 180 450 80 492 C 170 420 215 330 210 250 C 205 160 170 75 82 8 Z" 
        fill="#374151" 
      />
      
      {/* White Divider Curve 1 */}
      <path 
        d="M 185 8 C 195 90 230 180 230 280 C 230 370 180 450 80 492" 
        stroke="#FFFFFF" 
        strokeWidth="15" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* White Divider Curve 2 */}
      <path 
        d="M 82 8 C 170 75 205 160 210 250 C 215 330 170 420 80 492" 
        stroke="#FFFFFF" 
        strokeWidth="15" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* Horizontal White Stripes on Right Side */}
      <line x1="250" y1="135" x2="495" y2="135" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
      <line x1="255" y1="250" x2="500" y2="250" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
      <line x1="250" y1="365" x2="495" y2="365" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
};
