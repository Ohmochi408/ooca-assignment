import React, { useState } from 'react';
import Icon from './Icon';
import Sheet from './Sheet';
import { SKY_PERIODS } from '../utils/skyPeriods';
import { SKY_ICON_CHOICES } from '../utils/storageHelper';

// Create a new sky, or edit one: name first (required), then its icon and which of the six skies it looks like.
export default function SkyFormSheet({ sky, onSave, onClose }) {
  const editing = Boolean(sky);
  const [name, setName] = useState(sky?.name ?? '');
  const [icon, setIcon] = useState(sky?.icon ?? 'star');
  const [style, setStyle] = useState(sky?.style ?? 'morning');
  const valid = name.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (valid) onSave({ name: name.trim(), icon, style });
  };

  return (
    <Sheet title={editing ? 'Edit sky' : 'Create new sky'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {/* Live preview */}
        <div className={`sky-${style} relative h-28 rounded-ooca-16 overflow-hidden flex items-end p-3 transition-all`}>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-ooca-pill pl-2 pr-3 py-1 text-bluegray-800">
            <Icon name={icon} size={18} />
            <span className="text-subheader1 truncate max-w-[220px]">{name.trim() || 'Your sky'}</span>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-body4 text-bluegray-500">
            Sky name <span className="text-flamingo-500">*</span>
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Things I Want to Remember"
            className="w-full text-title3 text-bluegray-800 bg-gray-100 rounded-ooca-8 px-3 py-3 outline-none border-2 border-transparent focus:border-turquoise-500 placeholder:text-bluegray-300"
          />
        </label>

        <fieldset>
          <legend className="text-body4 text-bluegray-500 mb-2">Icon</legend>
          <div className="grid grid-cols-6 gap-2">
            {SKY_ICON_CHOICES.map((n) => (
              <button key={n} type="button" onClick={() => setIcon(n)} aria-pressed={icon === n} aria-label={n} className={`h-11 rounded-ooca-8 flex items-center justify-center border-2 cursor-pointer ${icon === n ? 'border-turquoise-500 bg-turquoise-50 text-turquoise-500' : 'border-gray-200 text-bluegray-600 hover:border-turquoise-300'}`}>
                <Icon name={n} size={22} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-body4 text-bluegray-500 mb-2">Sky</legend>
          <div className="grid grid-cols-6 gap-1.5">
            {SKY_PERIODS.map((p) => (
              <button key={p.id} type="button" onClick={() => setStyle(p.id)} aria-pressed={style === p.id} className={`flex flex-col items-center gap-1 p-1 rounded-ooca-8 border-2 cursor-pointer ${style === p.id ? 'border-turquoise-500' : 'border-transparent'}`}>
                <span className={`sky-${p.id} w-full h-12 rounded-ooca-8`} />
                <span className="text-small text-bluegray-700">{p.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="ooca-btn ooca-btn-secondary ooca-btn-turquoise flex-1">Cancel</button>
          <button type="submit" disabled={!valid} className="ooca-btn ooca-btn-primary ooca-btn-turquoise flex-[2]">
            {editing ? 'Save changes' : 'Create sky'}
          </button>
        </div>
        {!valid && <p className="text-body5 text-bluegray-600 -mt-2 text-center">Give your sky a name to create it.</p>}
      </form>
    </Sheet>
  );
}
