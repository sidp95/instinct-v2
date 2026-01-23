import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((options) => {
    const id = ++toastId;
    const toast = {
      id,
      type: options.type || 'info',
      message: options.message,
      button: options.button,
      onButtonClick: options.onButtonClick,
      autoDismiss: options.autoDismiss !== false,
      duration: options.duration || 3000,
    };

    setToasts((prev) => [...prev, toast]);

    if (toast.autoDismiss) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return showToast({ ...options, type: 'success', message, duration: options.duration || 2000 });
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast({ ...options, type: 'error', message, autoDismiss: options.autoDismiss ?? false });
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast({ ...options, type: 'warning', message, duration: options.duration || 3000 });
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast({ ...options, type: 'info', message, duration: options.duration || 3000 });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
