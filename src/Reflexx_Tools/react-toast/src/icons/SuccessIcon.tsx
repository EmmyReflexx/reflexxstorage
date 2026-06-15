import React from 'react';

export const SuccessIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
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
      fill="#dcfce7"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <path
      d="M6.5 10.5L9 13L13.5 7.5"
      stroke="#16a34a"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
