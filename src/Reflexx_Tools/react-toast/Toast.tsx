import React, { useEffect, useRef, useState } from 'react';
import { ToastProps } from './types';
import { SuccessIcon } from './src/icons/SuccessIcon';
import { ErrorIcon } from './src/icons/ErrorIcon';
import { WarningIcon } from './src/icons/WarningIcon';
import { InfoIcon } from './src/icons/InfoIcon';
import { DefaultIcon } from './src/icons/DefaultIcon';
import './src/styles/toast.css';

const getIcon = (type: string, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <DefaultIcon />;
  }
};

export const Toast: React.FC<ToastProps & { onRemove: () => void }> = ({
  message,
  type = 'default',
  duration = 3000,
  position = 'top-right',
  backgroundColor,
  textColor,
  customIcon,
  onClose,
  onRemove,
  pauseOnHover = true,
  showProgressBar = true,
  showCloseButton = true,
  width,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const dismissedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onRemove();
      onClose?.();
    }, 210);
  };

  useEffect(() => {
    if (duration === 0) return;

    let elapsed = 0;
    let lastTick = Date.now();

    const tick = () => {
      const now = Date.now();

      if (!isPausedRef.current) {
        elapsed += now - lastTick;
      }
      lastTick = now;

      const pct = Math.max(0, 100 - (elapsed / duration) * 100);

      if (barRef.current) {
        barRef.current.style.width = `${pct}%`;
      }

      if (pct <= 0) {
        dismiss();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  if (!isVisible) return null;

  const inlineStyle: React.CSSProperties = {};
  if (backgroundColor) inlineStyle.backgroundColor = backgroundColor;
  if (textColor) inlineStyle.color = textColor;
  if (width) {
    inlineStyle.minWidth = typeof width === 'number' ? `${width}px` : width;
    inlineStyle.maxWidth = typeof width === 'number' ? `${width}px` : width;
    inlineStyle.width = typeof width === 'number' ? `${width}px` : width;
  }

  return (
    <div
      className={`toast ${type} ${position}${isFadingOut ? ' fade-out' : ''}`}
      style={inlineStyle}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => {
        if (pauseOnHover) isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) isPausedRef.current = false;
      }}
    >
      <div className="toast-icon">{getIcon(type, customIcon)}</div>

      <div className="toast-content">
        <p>{message}</p>
      </div>

      {showCloseButton === true && (
        <button
          className="toast-close"
          aria-label="Close notification"
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
        >
          ✕
        </button>
      )}

      {duration > 0 && showProgressBar && (
        <div
          ref={barRef}
          className="toast-progress-bar"
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
};
