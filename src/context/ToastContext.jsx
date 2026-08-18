import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Toast from "../components/ui/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    setToast(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    ({ type = "success", title, message, duration = 3000 }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        type,
        title,
        message,
      });

      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, duration);
    },
    []
  );

  const success = useCallback(
    (message, options = {}) => {
      showToast({
        type: "success",
        message,
        ...options,
      });
    },
    [showToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      showToast({
        type: "error",
        message,
        ...options,
      });
    },
    [showToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      showToast({
        type: "warning",
        message,
        ...options,
      });
    },
    [showToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      showToast({
        type: "info",
        message,
        ...options,
      });
    },
    [showToast]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        hideToast,
      }}
    >
      {children}

      <Toast
        open={Boolean(toast)}
        type={toast?.type}
        title={toast?.title}
        message={toast?.message}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider.");
  }

  return context;
}
