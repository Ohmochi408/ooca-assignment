import React, { useMemo, useState } from 'react';
import Icon from './Icon';
import Sheet from './Sheet';
import { SKY_PERIODS, getSkyPeriod } from '../utils/skyPeriods';
import { dateKey, fromKey } from '../utils/dates';
import { cloudCount } from '../utils/format';

// Pick a day (days with clouds are marked) and one of the six skies of that day.
export default function CalendarSheet({ date, period, clouds, onApply, onClose }) {
  const today = dateKey();
  const [month, setMonth] = useState(() => {
    const d = fromKey(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [day, setDay] = useState(date);
  const [sky, setSky] = useState(period);

  const byDay = useMemo(() => {
    const m = {};
    for (const c of clouds) {
      const k = dateKey(c.timestamp);
      m[k] ??= {};
      const p = getSkyPeriod(new Date(c.timestamp));
      m[k][p] = (m[k][p] ?? 0) + 1;
    }
    return m;
  }, [clouds]);

  const first = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => dateKey(new Date(month.getFullYear(), month.getMonth(), i + 1)))];
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString([], { weekday: 'narrow' }));
  const shiftMonth = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const nextDisabled = new Date(month.getFullYear(), month.getMonth() + 1, 1) > new Date();

  return (
    <Sheet title="Choose a day and sky" onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shiftMonth(-1)} className="w-11 h-11 rounded-full flex items-center justify-center text-bluegray-600 hover:bg-gray-100 cursor-pointer" aria-label="Previous month">
          <Icon name="back" size={20} />
        </button>
        <p className="text-title3 text-bluegray-800">{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
        <button onClick={() => shiftMonth(1)} disabled={nextDisabled} className="w-11 h-11 rounded-full flex items-center justify-center text-bluegray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer" aria-label="Next month">
          <Icon name="next" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-5">
        {weekdays.map((w, i) => (
          <span key={i} className="text-body5 text-bluegray-600 py-1">{w}</span>
        ))}
        {cells.map((k, i) =>
          k ? (
            <button
              key={k}
              onClick={() => setDay(k)}
              disabled={k > today}
              aria-pressed={day === k}
              className={`relative h-10 rounded-ooca-8 text-body3 transition-colors cursor-pointer disabled:text-bluegray-200 disabled:cursor-default ${
                day === k ? 'bg-turquoise-500 text-white' : k === today ? 'border-2 border-turquoise-300 text-bluegray-800' : 'text-bluegray-800 hover:bg-turquoise-50'
              }`}
            >
              {Number(k.slice(-2))}
              {byDay[k] && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${day === k ? 'bg-white' : 'bg-turquoise-500'}`} />}
            </button>
          ) : (
            <span key={`e${i}`} />
          ),
        )}
      </div>

      <p className="text-body4 uppercase text-bluegray-600 mb-2">Sky</p>
      <div className="grid grid-cols-6 gap-1.5 mb-6">
        {SKY_PERIODS.map((p) => {
          const n = byDay[day]?.[p.id] ?? 0;
          return (
            <button key={p.id} onClick={() => setSky(p.id)} aria-pressed={sky === p.id} className={`flex flex-col items-center gap-1 p-1.5 rounded-ooca-8 border-2 cursor-pointer ${sky === p.id ? 'border-turquoise-500 bg-turquoise-50' : 'border-transparent hover:bg-gray-100'}`}>
              <span className={`sky-${p.id} w-9 h-9 rounded-full`} />
              <span className="text-small text-bluegray-700">{p.label}</span>
              <span className="text-small text-bluegray-600">{n ? cloudCount(n) : '–'}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => onApply(today, getSkyPeriod())} className="ooca-btn ooca-btn-secondary ooca-btn-turquoise flex-1">Now</button>
        <button onClick={() => onApply(day, sky)} className="ooca-btn ooca-btn-primary ooca-btn-turquoise flex-[2]">Show this sky</button>
      </div>
    </Sheet>
  );
}
