// Temporary localStorage approval flow for demo
// Toast notification component for post actions

// @ts-ignore
import { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
// @ts-ignore
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
// @ts-ignore
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
// @ts-ignore
import Info from 'lucide-react/dist/esm/icons/info';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
}

let toastCallback: ((message: string, type?: ToastType) => void) | null = null;

export const showGlobalToast = (message: string, type: ToastType = 'info') => {
  if (toastCallback) {
    toastCallback(message, type);
  }
};

export function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    toastCallback = showToast;
    return () => {
      toastCallback = null;
    };
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-600" />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${getToastStyles(toast.type)}`}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;