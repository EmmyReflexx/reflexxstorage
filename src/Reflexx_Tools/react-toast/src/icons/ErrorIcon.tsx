import React from 'react';

export const ErrorIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
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
      fill="#fee2e2"
      stroke="#dc2626"
      strokeWidth="1.5"
    />
    <path
      d="M7 7L13 13M13 7L7 13"
      stroke="#dc2626"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);
