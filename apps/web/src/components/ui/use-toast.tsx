import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useToast();

  const icons = {
    default: Info,
    success: CheckCircle2,
    destructive: AlertCircle,
    warning: AlertTriangle,
  };

  const variants = {
    default: "bg-white border-slate-100 text-slate-900",
    success: "bg-emerald-50 border-emerald-100 text-emerald-900",
    destructive: "bg-red-50 border-red-100 text-red-900",
    warning: "bg-amber-50 border-amber-100 text-amber-900",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.variant || 'default'];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={cn(
                "pointer-events-auto relative flex w-full items-start gap-4 rounded-md border p-4 shadow-lg shadow-slate-200/50 glass",
                variants[toast.variant || 'default']
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg flex-shrink-0",
                toast.variant === 'success' ? "bg-emerald-500 text-white" : 
                toast.variant === 'destructive' ? "bg-red-500 text-white" : 
                toast.variant === 'warning' ? "bg-amber-500 text-white" : "bg-primary text-white"
              )}>
                 <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                {toast.title && <h5 className="text-sm font-black leading-none tracking-tight">{toast.title}</h5>}
                {toast.description && <p className="text-xs font-medium opacity-80">{toast.description}</p>}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="hover:bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
