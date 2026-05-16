import { useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "info",
    title: "",
  });

  const show = useCallback((type: ToastType, title: string, message?: string) => {
    setToast({ visible: true, type, title, message });
  }, []);

  const hide = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return { toast, show, hide };
}
