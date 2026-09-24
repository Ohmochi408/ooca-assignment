import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

// Bottom sheet over the whole phone frame (portals into #sheet-root in App)
export default function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sheet = (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-h-[90%] overflow-y-auto bg-white rounded-t-ooca-24 px-5 pt-5 pb-6 shadow-elevation-8 screen-fade" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 text-bluegray-800">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-bluegray-500 cursor-pointer">
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
  const root = document.getElementById('sheet-root');
  return root ? createPortal(sheet, root) : sheet;
}
