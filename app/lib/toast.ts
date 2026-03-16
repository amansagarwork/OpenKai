import { toast } from "sonner";

// Simple toast functions without duplicate prevention
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  warning: (message: string) => {
    toast.warning(message);
  },
  
  info: (message: string) => {
    toast.info(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  }
};

// Clear all active toasts
export const clearAllToasts = () => {
  toast.dismiss();
};
