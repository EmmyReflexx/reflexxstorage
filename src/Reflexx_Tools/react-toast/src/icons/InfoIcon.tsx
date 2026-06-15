import React from 'react';

export const InfoIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10"
      cy="10"
      r="9"
      fill="#dbeafe"
      stroke="#3b82f6"
      strokeWidth="1.5"
    />
    <circle cx="10" cy="6.5" r="0.9" fill="#3b82f6" />
    <path
      d="M10 9.5V14"
      stroke="#3b82f6"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);
