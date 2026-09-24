import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Bottom sheet on phones, centred dialog on larger screens (portals into #sheet-root in App).
// Modal: focus moves in, Tab stays inside, Escape closes, focus returns to what opened it.
export default function Sheet({ title, subtitle, onClose, children }) {
  const panel = useRef(null);
  const closeRef = useRef(onClose); // the key handler always calls the latest onClose
  useLayoutEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement;
    const el = panel.current;
    // Let the sheet's own autoFocus field win; otherwise focus the panel itself
    if (!el.contains(document.activeElement)) el.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') return closeRef.current();
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!items.length) return e.preventDefault();
      const first = items[0];
      const last = items.at(-1);
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const sheet = (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end sm:items-center sm:justify-center sm:p-6" onClick={onClose}>
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-h-[90%] overflow-y-auto bg-white rounded-t-ooca-24 sm:max-w-[480px] sm:rounded-ooca-24 px-5 pt-4 pb-6 shadow-elevation-8 screen-fade outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="pt-2.5 min-w-0">
            <h2 className="text-h4 text-bluegray-800">{title}</h2>
            {subtitle && <p className="text-body3 text-bluegray-600 mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="-mr-2 w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-bluegray-500 hover:bg-gray-100 cursor-pointer">
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon name="close" size={18} />
            </span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
  const root = document.getElementById('sheet-root');
  return root ? createPortal(sheet, root) : sheet;
}
