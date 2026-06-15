import { useState, useCallback } from 'react';
import { ToastOptions, ToastProps } from './types';

let toastCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${toastCounter++}`;
    const newToast: ToastProps = {
      id,
      message: options.message,
      type: options.type || 'default',
      duration: options.duration !== undefined ? options.duration : 3000,
      position: options.position || 'top-right',
      backgroundColor: options.backgroundColor,
      textColor: options.textColor,
      customIcon: options.customIcon,
      onClose: options.onClose,
      pauseOnHover: options.pauseOnHover !== false,
      showProgressBar: options.showProgressBar !== false,
      showCloseButton:
        options.showCloseButton !== undefined ? options.showCloseButton : true,
      width: options.width,
    };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback(
    (id: string, options: Partial<ToastOptions>) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, ...options } : toast,
        ),
      );
    },
    [],
  );

  // Convenience methods
  const success = useCallback(
    (message: string, options?: Partial<ToastOptions>) => {
      return addToast({ message, type: 'success', ...options });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, options?: Partial<ToastOptions>) => {
      return addToast({ message, type: 'error', ...options });
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, options?: Partial<ToastOptions>) => {
      return addToast({ message, type: 'warning', ...options });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, options?: Partial<ToastOptions>) => {
      return addToast({ message, type: 'info', ...options });
    },
    [addToast],
  );

  const show = useCallback(
    (message: string, options?: Partial<ToastOptions>) => {
      return addToast({ message, type: 'default', ...options });
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    updateToast,
    success,
    error,
    warning,
    info,
    show,
  };
};
