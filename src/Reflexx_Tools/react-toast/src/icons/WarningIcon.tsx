import React from 'react';

export const WarningIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.5L18 17.5H2L10 2.5Z"
      fill="#fef9c3"
      stroke="#d97706"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="14.5" r="0.9" fill="#d97706" />
    <path
      d="M10 8.5V12"
      stroke="#d97706"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);
