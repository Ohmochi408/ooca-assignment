import React, { useState } from 'react';
import Icon from '../../components/Icon';
import Tip from '../../components/Tip';
import RoundButton from '../../components/RoundButton';
import NavArrow from '../../components/NavArrow';
import SkyCarousel from '../../components/SkyCarousel';
import SkyPicker from '../../components/SkyPicker';
import CloudField from '../../components/CloudField';
import CalendarSheet from '../../components/CalendarSheet';
import { SKY_PERIODS, periodById, periodIndex, getSkyPeriod } from '../../utils/skyPeriods';
import { dateKey, addDays, formatLongDate } from '../../utils/dates';
import { cloudCount } from '../../utils/format';
import { HEADER, ARROWS } from './layout';

const hhmm = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

// Ideate2 → "Time Sky (Today/Past)": the six skies of one day.
// Up / down: the six skies, looping Night → Midnight. Left / right arrows: the day before / after.
export default function TimeSky({ clouds, nav, setNav, cloudProps, onMoveCloud, expandedId }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = dateKey();
  const period = periodById(nav.period);
  const atNow = nav.date === today && nav.period === getSkyPeriod();

  const cloudsIn = (pid) => clouds.filter((c) => dateKey(c.timestamp) === nav.date && getSkyPeriod(new Date(c.timestamp)) === pid);
  const go = (i) => setNav({ ...nav, period: SKY_PERIODS[(i + SKY_PERIODS.length) % SKY_PERIODS.length].id });
  const shiftDay = (n) => setNav({ ...nav, date: addDays(nav.date, n) });

  return (
    <>
      <SkyCarousel
        key={nav.date}
        vertical
        loop
        label="Time Sky — six skies of the day, swipe up or down"
        count={SKY_PERIODS.length}
        index={periodIndex(nav.period)}
        onIndexChange={go}
        renderPage={(i) => {
          const p = SKY_PERIODS[i];
          return (
            <>
              <div className={`sky-${p.id} absolute inset-0`} />
              <CloudField
                view="time"
                onMoveCloud={onMoveCloud}
                expandedId={expandedId}
                clouds={cloudsIn(p.id)}
                metaOf={(c) => hhmm(c.timestamp)}
                cloudProps={cloudProps}
              />
            </>
          );
        }}
      />

      <div className={HEADER} style={{ '--fg-delay': '180ms' }}>
        <button
          onClick={() => setCalendarOpen(true)}
          className="text-left min-w-0 cursor-pointer"
          aria-label={`${formatLongDate(nav.date)}, ${period.label} — choose another day`}
        >
          <h1 className="text-h4 text-white">{formatLongDate(nav.date)}</h1>
          <p className="text-body1 text-turquoise-50 mt-2">
            {period.range.replace('–', '-')} • {cloudCount(cloudsIn(period.id).length)}
          </p>
        </button>
        <div className="flex items-start gap-2">
          {/* Shown whenever this isn't the sky of right now; "Now" jumps back to it (same 40px row as the calendar) */}
          {!atNow && (
            <Tip label="Back to the sky of right now" side="bottom-end">
              <button onClick={() => setNav({ date: today, period: getSkyPeriod() })} className="ooca-btn ooca-btn-secondary ooca-btn-turquoise h-10 px-4">
                Now
              </button>
            </Tip>
          )}
          <div className="flex flex-col items-center gap-2">
            <RoundButton size={40} label="Choose a day" tip="Calendar" tipSide="left" onClick={() => setCalendarOpen(true)}>
              <Icon name="calendar" size={18} />
            </RoundButton>
            <SkyPicker current={nav.period} onPick={(p) => setNav({ ...nav, period: p })} />
          </div>
        </div>
      </div>

      <div className={ARROWS} style={{ '--fg-delay': '60ms' }}>
        <NavArrow dir="left" label="Previous day" onClick={() => shiftDay(-1)} />
        <NavArrow dir="right" label="Next day" onClick={() => shiftDay(1)} hidden={nav.date >= today} />
      </div>

      {calendarOpen && (
        <CalendarSheet
          date={nav.date}
          period={nav.period}
          clouds={clouds}
          onClose={() => setCalendarOpen(false)}
          onApply={(date, p) => {
            setNav({ date, period: p });
            setCalendarOpen(false);
          }}
        />
      )}
    </>
  );
}
