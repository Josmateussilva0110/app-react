import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast } from "@/components/ui/toast";

type ToastType = "success" | "error" | "info";

interface ToastContextData {
  show: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({ visible: false, type: "info" as ToastType, title: "", message: "" });

  const show = useCallback((type: ToastType, title: string, message?: string) => {
    setToast({ visible: true, type, title, message: message ?? "" });
  }, []);

  const hide = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast {...toast} onHide={hide} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
