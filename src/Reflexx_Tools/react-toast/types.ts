export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  backgroundColor?: string;
  textColor?: string;
  customIcon?: React.ReactNode;
  onClose?: () => void;
  pauseOnHover?: boolean;
  showProgressBar?: boolean;
  showCloseButton?: boolean;
  width?: string | number; // New option for custom width
}

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  backgroundColor?: string;
  textColor?: string;
  customIcon?: React.ReactNode;
  onClose?: () => void;
  pauseOnHover?: boolean;
  showProgressBar?: boolean;
  showCloseButton?: boolean;
  width?: string | number; // New option for custom width
}

export interface ToastContextType {
  toasts: ToastProps[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}
