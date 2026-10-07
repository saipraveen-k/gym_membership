import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
  error: 'border-red-500/40 bg-red-950/90 text-red-100',
  info: 'border-sky-500/40 bg-sky-950/90 text-sky-100',
  warning: 'border-amber-500/40 bg-amber-950/90 text-amber-100',
};

/**
 * Lightweight toast notification system.
 * showToast('Membership created', 'success')
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur transition animate-fadeUp ${STYLES[toast.type] || STYLES.info}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded p-1 opacity-70 transition hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
