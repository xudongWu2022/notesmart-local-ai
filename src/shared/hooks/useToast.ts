import { useState } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastState {
  message: string;
  type: ToastType;
}

interface UseToastReturn {
  toast: ToastState | null;
  showToast: (message: string | ToastState, type?: ToastType) => void;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string | ToastState, type: ToastType = 'info') => {
    if (typeof message === 'string') {
      setToast({ message, type });
    } else {
      setToast(message);
    }

    if (message) {
      setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };

  return { toast, showToast };
}
