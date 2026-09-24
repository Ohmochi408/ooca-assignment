import React, { useEffect } from 'react';
import Icon from './Icon';

// Short confirmation above the bottom bar, with an optional action (e.g. Undo). Announced politely.
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, toast.duration ?? 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div role="status" aria-live="polite" className="absolute inset-x-4 bottom-[204px] z-45 flex justify-center pointer-events-none">
      {toast && (
        <div key={toast.id} className="toast-in pointer-events-auto flex items-center gap-3 max-w-full pl-4 pr-1 min-h-12 rounded-ooca-pill bg-bluegray-900 text-white shadow-elevation-6">
          {toast.icon && <Icon name={toast.icon} size={18} className="shrink-0 text-turquoise-300" />}
          <span className="text-body4 truncate">{toast.message}</span>
          {toast.action ? (
            <button
              onClick={() => {
                toast.onAction();
                onDismiss();
              }}
              className="shrink-0 min-h-11 px-4 rounded-ooca-pill text-subheader1 text-turquoise-300 hover:bg-white/10 cursor-pointer"
            >
              {toast.action}
            </button>
          ) : (
            <span className="w-3" />
          )}
        </div>
      )}
    </div>
  );
}
