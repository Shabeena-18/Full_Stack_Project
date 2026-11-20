import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
let nextId = 1;

/** Replaces Django's `messages` framework: small alerts that fade after a few seconds. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback((type, message) => {
    const id = nextId++;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (m) => show('success', m),
    error: (m) => show('danger', m),
    info: (m) => show('info', m),
    warning: (m) => show('warning', m),
  }), [show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`alert alert-${t.type} shadow toast-item`} role="alert">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
