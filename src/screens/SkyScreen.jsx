import React, { useRef, useState } from 'react';
import Icon from '../components/Icon';
import SkyCarousel from '../components/SkyCarousel';
import SkyBackground from '../components/SkyBackground';
import CloudField from '../components/CloudField';
import { MiniCloud } from '../components/Cloud';
import CalendarSheet from '../components/CalendarSheet';
import SkyFormSheet from '../components/SkyFormSheet';
import { SKY_PERIODS, periodById, periodIndex, getSkyPeriod, fractionInPeriod } from '../utils/skyPeriods';
import { skyColor } from '../utils/storageHelper';
import { dateKey, addDays, formatLongDate } from '../utils/dates';

const glass = 'bg-white/75 backdrop-blur-sm text-bluegray-800';

function Arrow({ dir, onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{ '--fg-delay': '60ms' }}
      className={`fg absolute top-[calc(50%-68px)] -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-elevation-3 transition-opacity cursor-pointer disabled:opacity-0 disabled:pointer-events-none ${glass} ${dir === 'left' ? 'left-2' : 'right-2'}`}
    >
      <Icon name={dir === 'left' ? 'back' : 'next'} size={20} />
    </button>
  );
}

function Dots({ count, index, onPick, labels }) {
  return (
    <div className="fg absolute bottom-[152px] inset-x-0 z-20 flex justify-center gap-1.5" style={{ '--fg-delay': '60ms' }}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          aria-label={labels?.[i] ?? `Page ${i + 1}`}
          aria-current={i === index}
          className={`h-2 rounded-full transition-all cursor-pointer ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
        />
      ))}
    </div>
  );
}

// ── Time Sky: the five skies of one day ──────────────────────────────────────
function TimeSky({ clouds, colorOf, nav, setNav, onOpenCloud, newCloudId, onOpenAbout }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = dateKey();
  const idx = periodIndex(nav.period);
  const period = periodById(nav.period);
  const isNow = nav.date === today && nav.period === getSkyPeriod();

  const cloudsIn = (pid) => clouds.filter((c) => dateKey(c.timestamp) === nav.date && getSkyPeriod(new Date(c.timestamp)) === pid);
  const go = (i) => {
    if (i < 0) return setNav({ date: addDays(nav.date, -1), period: 'night' });
    if (i >= SKY_PERIODS.length) return setNav({ date: addDays(nav.date, 1), period: 'dawn' });
    setNav({ ...nav, period: SKY_PERIODS[i].id });
  };
  const atLatest = nav.date >= today && idx === SKY_PERIODS.length - 1;

  return (
    <>
      <SkyCarousel
        key={nav.date}
        label="Time Sky — five skies of the day"
        count={SKY_PERIODS.length}
        index={idx}
        onIndexChange={go}
        renderPage={(i) => {
          const p = SKY_PERIODS[i];
          return (
            <>
              <div className={`sky-${p.id} absolute inset-0`} />
              <CloudField
                clouds={cloudsIn(p.id)}
                colorOf={colorOf}
                onOpenCloud={onOpenCloud}
                newCloudId={newCloudId}
                xOf={(c) => 18 + fractionInPeriod(new Date(c.timestamp)) * 64}
                empty={`No thoughts this ${p.label.toLowerCase()}.`}
              />
            </>
          );
        }}
      />

      {/* Date + period header */}
      <div className="fg absolute top-3 inset-x-3 z-30 flex items-start gap-2" style={{ '--fg-delay': '180ms' }}>
        <button onClick={() => setCalendarOpen(true)} className={`flex-1 min-w-0 flex items-center gap-2 rounded-ooca-16 px-3 py-2 text-left shadow-elevation-3 cursor-pointer ${glass}`} aria-label="Choose a day and sky">
          <Icon name="calendar" size={22} className="text-turquoise-500" />
          <span className="min-w-0">
            <span className="block text-subheader1 truncate">{formatLongDate(nav.date)}</span>
            <span className="flex items-center gap-1.5 text-body5 text-bluegray-600">
              <span className={`sky-${period.id} w-3 h-3 rounded-full`} />
              {period.label} · {period.range}
            </span>
          </span>
        </button>
        {!isNow && (
          <button onClick={() => setNav({ date: today, period: getSkyPeriod() })} className="ooca-btn ooca-btn-primary ooca-btn-turquoise px-4 shadow-elevation-3">
            Today
          </button>
        )}
        <button onClick={onOpenAbout} className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-elevation-3 cursor-pointer ${glass}`} aria-label="About this concept">
          <Icon name="info" size={20} />
        </button>
      </div>

      <Arrow dir="left" label="Earlier sky" onClick={() => go(idx - 1)} />
      <Arrow dir="right" label="Later sky" onClick={() => go(idx + 1)} disabled={atLatest} />
      <Dots count={SKY_PERIODS.length} index={idx} onPick={go} labels={SKY_PERIODS.map((p) => p.label)} />

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

// ── My Skies: one sky per space the user defined ─────────────────────────────
function MySkies({ clouds, skies, colorOf, index, setIndex, onOpenCloud, newCloudId, onCreateSky, onUpdateSky }) {
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState(null); // null | 'new' | sky
  const carousel = useRef(null);
  const i = Math.min(index, skies.length - 1);
  const sky = skies[i];
  const inSky = (s) => clouds.filter((c) => c.skyId === s.id);

  const sheet = form && (
    <SkyFormSheet
      sky={form === 'new' ? null : form}
      onClose={() => setForm(null)}
      onSave={(data) => {
        if (form === 'new') {
          onCreateSky(data);
          setIndex(skies.length);
          setShowAll(false);
        } else onUpdateSky(form.id, data);
        setForm(null);
      }}
    />
  );

  if (showAll) {
    return (
      <div className="absolute inset-0 bg-gray-100 overflow-y-auto pb-36">
        <div className="sticky top-0 z-10 bg-gray-100/90 backdrop-blur-sm flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h2 className="text-h4 text-bluegray-800">All skies</h2>
            <p className="text-body5 text-bluegray-500">{skies.length} spaces · {clouds.length} thoughts</p>
          </div>
          <button onClick={() => setShowAll(false)} className="ooca-btn ooca-btn-secondary ooca-btn-turquoise px-4 gap-1">
            <Icon name="list" size={18} /> One by one
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          {skies.map((s, k) => {
            const list = inSky(s);
            return (
              <button key={s.id} onClick={() => { setIndex(k); setShowAll(false); }} className="relative h-40 rounded-ooca-16 overflow-hidden text-left shadow-elevation-3 cursor-pointer group">
                <div className={`sky-${s.style} absolute inset-0 transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute inset-x-0 top-6 flex justify-center -space-x-6 pointer-events-none">
                  {list.slice(-3).map((c) => (
                    <div key={c.id} className="scale-75"><MiniCloud cloud={c} /></div>
                  ))}
                </div>
                <div className="absolute bottom-2 inset-x-2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-ooca-pill pl-2 pr-2.5 py-1 text-bluegray-800">
                  <Icon name={s.icon} size={16} />
                  <span className="text-body4 truncate flex-1">{s.name}</span>
                  <span className="text-small text-bluegray-500">{list.length}</span>
                </div>
              </button>
            );
          })}
          <button onClick={() => setForm('new')} className="h-40 rounded-ooca-16 border-2 border-dashed border-turquoise-300 text-turquoise-500 flex flex-col items-center justify-center gap-2 hover:bg-turquoise-50 cursor-pointer">
            <Icon name="add" size={28} />
            <span className="text-subheader1">Create new sky</span>
          </button>
        </div>
        {sheet}
      </div>
    );
  }

  return (
    <>
      <SkyCarousel
        ref={carousel}
        loop
        label="My Skies"
        count={skies.length}
        index={i}
        onIndexChange={setIndex}
        renderPage={(k) => {
          const s = skies[k];
          return (
            <>
              <SkyBackground period={s.style} />
              <CloudField clouds={inSky(s)} colorOf={colorOf} onOpenCloud={onOpenCloud} newCloudId={newCloudId} top={150} empty="Nothing here yet. Leave a thought in this sky." />
            </>
          );
        }}
      />

      {/* Sky header */}
      <div className="fg absolute top-3 inset-x-3 z-30 flex items-start gap-2" style={{ '--fg-delay': '180ms' }}>
        <div className={`flex-1 min-w-0 rounded-ooca-16 px-3 py-2 shadow-elevation-3 ${glass}`}>
          <div className="flex items-center gap-2">
            <Icon name={sky.icon} size={22} className="text-turquoise-500" />
            <span className="text-subheader1 truncate flex-1">{sky.name}</span>
            <span className="text-body5 text-bluegray-500 shrink-0">{inSky(sky).length} thoughts</span>
          </div>
          <p className="text-body5 text-bluegray-600 truncate mt-0.5">{sky.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowAll(true)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-elevation-3 cursor-pointer ${glass}`} aria-label="Show all skies">
            <Icon name="grid" size={20} />
          </button>
          <button onClick={() => setForm(sky)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-elevation-3 cursor-pointer ${glass}`} aria-label={`Edit ${sky.name}`}>
            <Icon name="edit" size={18} />
          </button>
        </div>
      </div>

      {/* Loops: after the last sky comes the first again */}
      <Arrow dir="left" label="Previous sky" onClick={() => carousel.current?.step(-1)} disabled={skies.length < 2} />
      <Arrow dir="right" label="Next sky" onClick={() => carousel.current?.step(1)} disabled={skies.length < 2} />
      <Dots count={skies.length} index={i} onPick={setIndex} labels={skies.map((s) => s.name)} />
      {sheet}
    </>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function SkyScreen({ clouds, skies, view, setView, timeNav, setTimeNav, myIndex, setMyIndex, newCloudId, leaving, onAddThought, onOpenCloud, onOpenAbout, onCreateSky, onUpdateSky }) {
  const colorOf = (cloud) => {
    const k = skies.findIndex((s) => s.id === cloud.skyId);
    return skyColor(skies[k], k);
  };
  const shared = { clouds, colorOf, onOpenCloud, newCloudId };
  // The sky currently on screen — the record screen keeps it as its background
  const currentSky = view === 'time' ? timeNav.period : skies[Math.min(myIndex, skies.length - 1)]?.style;

  return (
    <div className={`relative h-full overflow-hidden ${leaving ? 'sky-leaving' : ''}`}>
      {/* The sky runs full height behind the bottom bar, so nothing changes underneath when the bar falls away */}
      <div className="absolute inset-0">
        {view === 'time' ? (
          <TimeSky {...shared} nav={timeNav} setNav={setTimeNav} onOpenAbout={onOpenAbout} />
        ) : (
          <MySkies {...shared} skies={skies} index={myIndex} setIndex={setMyIndex} onCreateSky={onCreateSky} onUpdateSky={onUpdateSky} />
        )}
      </div>

      {/* Bottom bar */}
      <div className="fg absolute bottom-0 inset-x-0 z-40 bg-white px-6 pt-4 pb-6 flex flex-col items-center gap-4 shadow-elevation-2">
        <div className="flex bg-turquoise-50 rounded-ooca-pill p-1" role="tablist">
          {[['time', 'Time Sky', 'time'], ['mine', 'My Skies', 'grid']].map(([v, label, icon]) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-ooca-pill text-subheader1 transition-colors cursor-pointer ${view === v ? 'bg-turquoise-500 text-white shadow-elevation-1' : 'text-bluegray-500 hover:text-bluegray-800'}`}
            >
              <Icon name={icon} size={18} />
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => onAddThought(currentSky)} disabled={leaving} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block">
          <Icon name="mic" size={20} />
          Add a thought
        </button>
      </div>
    </div>
  );
}
