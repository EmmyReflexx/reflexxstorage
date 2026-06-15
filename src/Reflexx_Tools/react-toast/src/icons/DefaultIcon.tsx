import React from 'react';

export const DefaultIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
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
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="1.5"
    />
    <path
      d="M10 6V10.5L13 12"
      stroke="#6b7280"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
