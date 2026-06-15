import React from 'react';
import { ToastProps, ToastPosition } from './types';
import { Toast } from './Toast';
import './src/styles/toast.css';

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  // Group toasts by position
  const groupedToasts = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || 'top-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, ToastProps[]>,
  );

  // Render containers only for positions that have toasts
  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`toast-container ${position}`}
          aria-live="polite"
          aria-label="Notifications"
        >
          {positionToasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onRemove={() => onRemove(toast.id)}
            />
          ))}
        </div>
      ))}
    </>
  );
};
