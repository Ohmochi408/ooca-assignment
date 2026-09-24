import { useState, useEffect, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen = 'widget' | 'sky' | 'record' | 'cloud-created' | 'place' | 'cloud-detail'
type SkyView = 'time' | 'mine'

interface ThoughtCloud {
  id: string
  durationSec: number
  timeMs: number
  label: string
  sky: string
  x: number // % from left in sky canvas
  y: number // % from top in sky canvas
}

// ── Static Data ───────────────────────────────────────────────────────────────
const NOW = Date.now()

const INITIAL_CLOUDS: ThoughtCloud[] = [
  {
    id: 'a',
    durationSec: 23,
    timeMs: NOW - 7 * 3600000,
    label: 'Morning commute',
    sky: 'Work',
    x: 16,
    y: 20,
  },
  {
    id: 'b',
    durationSec: 47,
    timeMs: NOW - 4 * 3600000,
    label: "Tomorrow's presentation",
    sky: 'Work',
    x: 60,
    y: 14,
  },
  {
    id: 'c',
    durationSec: 15,
    timeMs: NOW - 1.5 * 3600000,
    label: 'Call with Mom',
    sky: 'People',
    x: 38,
    y: 48,
  },
]

const SKIES = ['Tonight', 'Work', 'People']

const SKY_META: Record<string, { icon: string; color: string; desc: string }> = {
  Tonight: { icon: '🌙', color: '#8B5CF6', desc: 'Personal & evening' },
  Work:    { icon: '💼', color: '#1BCECC', desc: 'Job, projects, tasks' },
  People:  { icon: '🤍', color: '#F59E0B', desc: 'Relationships, friends, family' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDur(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function nowStr(): string {
  const d = new Date()
  return (
    d.toLocaleDateString([], { weekday: 'long' }) +
    ' · ' +
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  )
}

// ── Cloud SVG ─────────────────────────────────────────────────────────────────
// Returns a cloud-shaped SVG path group; callers control fill/filter
function CloudSVGGroup() {
  return (
    <>
      <ellipse cx="110" cy="118" rx="92" ry="24" />
      <circle cx="48" cy="90" r="36" />
      <circle cx="100" cy="66" r="46" />
      <circle cx="158" cy="76" r="40" />
    </>
  )
}

// ── Sky Cloud Button ──────────────────────────────────────────────────────────
function SkyCloud({
  cloud,
  onClick,
  highlight = false,
}: {
  cloud: ThoughtCloud
  onClick: () => void
  highlight?: boolean
}) {
  const dotColor = SKY_META[cloud.sky]?.color ?? '#1BCECC'
  return (
    <button
      onClick={onClick}
      style={{ left: `${cloud.x}%`, top: `${cloud.y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
    >
      <div
        className={`relative group-hover:-translate-y-1.5 transition-transform duration-300
          ${highlight ? 'cloud-pop' : ''}`}
      >
        <svg
          width="128"
          height="84"
          viewBox="0 0 220 142"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 5px 16px rgba(0,0,0,0.11))' }}
        >
          <CloudSVGGroup />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pb-3 px-2">
          <p className="text-[11px] font-extrabold text-[#2D3748] max-w-[88px] text-center leading-tight line-clamp-2">
            {cloud.label}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
            <p className="text-[9px] text-[#718096] font-semibold">{fmtDur(cloud.durationSec)}</p>
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Small Cloud for My Skies ──────────────────────────────────────────────────
function MiniCloud({ cloud, onClick }: { cloud: ThoughtCloud; onClick: () => void }) {
  return (
    <button onClick={onClick} className="cursor-pointer group flex-shrink-0">
      <div className="relative group-hover:-translate-y-1 transition-transform duration-300">
        <svg
          width="86"
          height="56"
          viewBox="0 0 220 142"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.10))' }}
        >
          <CloudSVGGroup />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 pb-2 px-1">
          <p className="text-[9px] font-extrabold text-[#2D3748] max-w-[66px] text-center leading-tight line-clamp-2">
            {cloud.label}
          </p>
          <p className="text-[8px] text-[#718096] mt-0.5">{fmtDur(cloud.durationSec)}</p>
        </div>
      </div>
    </button>
  )
}

// ── Shared Buttons ────────────────────────────────────────────────────────────
function PrimaryBtn({
  children,
  onClick,
  className = '',
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-full bg-[#1BCECC] text-white font-extrabold text-base
        shadow-[0_4px_20px_rgba(27,206,204,0.35)] hover:bg-[#0FA8A6]
        hover:shadow-[0_6px_26px_rgba(27,206,204,0.42)] active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-200 cursor-pointer ${className}`}
    >
      {children}
    </button>
  )
}

function Wordmark() {
  return (
    <span className="text-[#1BCECC] font-extrabold text-xl tracking-tight select-none">
      ooca
    </span>
  )
}

// ── WIDGET / HOME SCREEN ──────────────────────────────────────────────────────
function WidgetScreen({ onTap }: { onTap: () => void }) {
  const [tapped, setTapped] = useState(false)
  const now = new Date()
  const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateDisplay = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  const handleTap = () => {
    setTapped(true)
    setTimeout(onTap, 320)
  }

  // Fake app icon grid row
  const fakeIcons = [
    { bg: '#4A90D9', label: '📱' },
    { bg: '#E85D4A', label: '📷' },
    { bg: '#50C878', label: '💬' },
    { bg: '#F5A623', label: '🎵' },
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      }}
    >
      {/* Blurred wallpaper glow blobs */}
      <div
        className="absolute top-20 left-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(27,206,204,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-32 right-8 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }}
      />

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-6 pb-2">
        <span className="text-white/70 text-sm font-semibold">{timeDisplay}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 items-end">
            {[3, 5, 7, 9].map((h, i) => (
              <div key={i} className="w-1 rounded-sm bg-white/60" style={{ height: h }} />
            ))}
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5C10 2.5 11.8 3.3 13.1 4.6L14.5 3.2C12.8 1.5 10.5 0.5 8 0.5C5.5 0.5 3.2 1.5 1.5 3.2L2.9 4.6C4.2 3.3 6 2.5 8 2.5Z" fill="white" opacity="0.7"/>
            <path d="M8 5.5C9.3 5.5 10.5 6 11.4 6.9L12.8 5.5C11.5 4.2 9.8 3.5 8 3.5C6.2 3.5 4.5 4.2 3.2 5.5L4.6 6.9C5.5 6 6.7 5.5 8 5.5Z" fill="white" opacity="0.7"/>
            <circle cx="8" cy="10" r="1.5" fill="white" opacity="0.7"/>
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-3 rounded-sm border border-white/50 p-px">
              <div className="w-4 h-full bg-white/70 rounded-[2px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Clock */}
      <div className="absolute top-16 left-0 right-0 flex flex-col items-center gap-0.5">
        <p className="text-white text-[4.5rem] font-extralight tracking-tight leading-none" style={{ fontWeight: 200 }}>
          {timeDisplay}
        </p>
        <p className="text-white/60 text-base font-medium">{dateDisplay}</p>
      </div>

      {/* Widget */}
      <div className="mt-16 w-full max-w-[340px] px-4">
        <button
          onClick={handleTap}
          className={`w-full cursor-pointer transition-all duration-300
            ${tapped ? 'scale-[0.96] opacity-70' : 'hover:scale-[1.02] active:scale-[0.97]'}`}
        >
          {/* Widget card */}
          <div
            className="w-full rounded-[28px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            style={{
              background: 'linear-gradient(145deg, #A8D8E8 0%, #B8E5EE 35%, #CCF0EE 70%, #D4F5F2 100%)',
            }}
          >
            {/* Widget inner */}
            <div className="p-5 pb-4">
              {/* Widget header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Mini cloud icon */}
                  <svg width="26" height="17" viewBox="0 0 220 142" fill="white" opacity="0.9">
                    <CloudSVGGroup />
                  </svg>
                  <span className="text-[#0FA8A6] font-extrabold text-base tracking-tight">
                    ooca
                  </span>
                </div>
                <span className="text-[#4A8A9A] text-[11px] font-bold">
                  {INITIAL_CLOUDS.length} thoughts
                </span>
              </div>

              {/* Mini sky with sample clouds */}
              <div
                className="relative w-full rounded-2xl overflow-hidden mb-3"
                style={{
                  height: 96,
                  background: 'linear-gradient(180deg, #A2CEE0 0%, #BAE5EE 50%, #D4F4F2 100%)',
                }}
              >
                {/* Mini ambient glow */}
                <div
                  className="absolute top-2 right-4 w-10 h-10 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,248,186,0.5) 0%, transparent 70%)' }}
                />
                {/* Sample mini clouds in widget */}
                {[
                  { x: '18%', label: 'Morning commute', dur: '0:23' },
                  { x: '55%', label: "Tomorrow's pres…", dur: '0:47' },
                  { x: '80%', label: 'Call with Mom', dur: '0:15' },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="absolute top-3"
                    style={{ left: c.x, transform: 'translateX(-50%)' }}
                  >
                    <svg width="54" height="35" viewBox="0 0 220 142" fill="white" opacity="0.92">
                      <CloudSVGGroup />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                      <p className="text-[7px] font-extrabold text-[#2D3748] text-center max-w-[46px] leading-tight truncate px-1">
                        {c.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="flex items-center justify-between">
                <p className="text-[#4A8090] text-[11px] font-semibold leading-snug">
                  What's on your mind?
                </p>
                <div
                  className="flex items-center gap-1.5 bg-[#1BCECC] text-white px-3 py-1.5 rounded-full
                    shadow-[0_3px_12px_rgba(27,206,204,0.45)]"
                >
                  <span className="text-xs font-extrabold">+ Add</span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Tap hint */}
        <p className="text-white/30 text-xs font-semibold text-center mt-4 tracking-wide">
          tap the widget to add a thought
        </p>
      </div>

      {/* Fake dock */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div
          className="flex gap-4 px-6 py-3 rounded-[24px]"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)' }}
        >
          {fakeIcons.map((icon, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-[14px] flex items-center justify-center text-xl"
              style={{ background: icon.bg, opacity: 0.7 }}
            >
              {icon.label}
            </div>
          ))}
        </div>
      </div>

      {/* Prototype label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <span className="text-white/25 text-[10px] font-semibold tracking-widest uppercase">
          prototype
        </span>
      </div>
    </div>
  )
}

// ── SKY ───────────────────────────────────────────────────────────────────────
function SkyScreen({
  clouds,
  onAddThought,
  onCloudTap,
  newCloudId,
}: {
  clouds: ThoughtCloud[]
  onAddThought: () => void
  onCloudTap: (cloud: ThoughtCloud) => void
  newCloudId?: string
}) {
  const [view, setView] = useState<SkyView>('time')
  const [timeStr, setTimeStr] = useState(nowStr())

  useEffect(() => {
    const t = setInterval(() => setTimeStr(nowStr()), 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sky canvas */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #A8D8E8 0%, #B8E2EE 20%, #CCECEf 45%, #DBF0F0 70%, #EAF8F7 100%)',
          minHeight: '65vh',
        }}
      >
        {/* Ambient sun glow */}
        <div
          className="absolute top-6 right-10 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,248,186,0.55) 0%, transparent 70%)',
          }}
        />

        {/* Time display */}
        <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
          <span className="text-[#4A7C8C] text-xs font-bold bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full tracking-wide">
            {timeStr}
          </span>
        </div>

        {/* Prototype label */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="text-[10px] text-white/50 font-semibold bg-black/10 px-2 py-0.5 rounded-full">
            prototype
          </span>
        </div>

        {/* TIME SKY view */}
        {view === 'time' && (
          <>
            {clouds.map((cloud) => (
              <SkyCloud
                key={cloud.id}
                cloud={cloud}
                onClick={() => onCloudTap(cloud)}
                highlight={cloud.id === newCloudId}
              />
            ))}
            {clouds.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/60 text-sm font-semibold">
                  Your sky is empty. Add a thought.
                </p>
              </div>
            )}
          </>
        )}

        {/* MY SKIES view */}
        {view === 'mine' && (
          <div className="absolute inset-0 flex pt-12">
            {SKIES.map((sky, i) => {
              const skyClouds = clouds.filter((c) => c.sky === sky)
              const meta = SKY_META[sky]
              return (
                <div
                  key={sky}
                  className="flex-1 flex flex-col items-center pt-4 gap-3 relative px-2"
                  style={{
                    borderRight:
                      i < SKIES.length - 1 ? '1px dashed rgba(255,255,255,0.5)' : 'none',
                  }}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="text-xs">{meta.icon}</span>
                    <span className="text-[11px] font-extrabold text-[#2D3748]">{sky}</span>
                  </div>

                  {/* Clouds */}
                  <div className="flex flex-col items-center gap-2">
                    {skyClouds.map((cloud) => (
                      <MiniCloud key={cloud.id} cloud={cloud} onClick={() => onCloudTap(cloud)} />
                    ))}
                    {skyClouds.length === 0 && (
                      <p className="text-white/55 text-[10px] font-semibold mt-2 text-center">
                        empty
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-[#F7FFFE] px-6 py-5 flex flex-col items-center gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        {/* Toggle */}
        <div className="flex bg-[#E6FAF9] rounded-full p-1">
          {(['time', 'mine'] as SkyView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2 rounded-full text-sm font-extrabold transition-all duration-200 cursor-pointer
                ${view === v ? 'bg-[#1BCECC] text-white shadow-sm' : 'text-[#718096] hover:text-[#2D3748]'}`}
            >
              {v === 'time' ? 'Time Sky' : 'My Skies'}
            </button>
          ))}
        </div>

        <PrimaryBtn onClick={onAddThought} className="text-base px-10">
          + Add a thought
        </PrimaryBtn>
      </div>
    </div>
  )
}

// ── RECORD ────────────────────────────────────────────────────────────────────
function RecordScreen({
  onDone,
  onBack,
}: {
  onDone: (durationSec: number) => void
  onBack: () => void
}) {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'saved'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const start = () => {
    setPhase('recording')
    setElapsed(0)
    intervalRef.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e >= 120) {
          stop()
          return e
        }
        return e + 1
      })
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase('saved')
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-sm mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[#A0AEC0] hover:text-[#718096] font-semibold text-sm cursor-pointer transition-colors"
        >
          ← Back
        </button>
        <Wordmark />
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full">
        <div className="text-center space-y-2">
          <h1 className="text-[#2D3748] text-2xl font-extrabold tracking-tight">
            What's on your mind?
          </h1>
          <p className="text-[#718096] text-sm leading-relaxed font-medium">
            Say it. Hum it. Sigh it.
            <br />
            It doesn't have to make sense.
          </p>
        </div>

        {/* Mic interaction */}
        <div className="relative flex items-center justify-center" style={{ width: 168, height: 168 }}>
          {/* Pulse rings */}
          {phase === 'recording' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-[#1BCECC]/25 animate-ping" />
              <div
                className="absolute rounded-full border-2 border-[#1BCECC]/15 animate-ping"
                style={{ inset: 16, animationDelay: '0.4s' }}
              />
            </>
          )}

          {/* Button */}
          <button
            onClick={phase === 'idle' ? start : phase === 'recording' ? stop : undefined}
            disabled={phase === 'saved'}
            className={`relative flex items-center justify-center rounded-full transition-all duration-300
              cursor-pointer select-none
              ${
                phase === 'recording'
                  ? 'bg-[#1BCECC] shadow-[0_0_44px_rgba(27,206,204,0.5)] scale-110'
                  : phase === 'saved'
                  ? 'bg-[#E6FAF9] border-4 border-[#1BCECC] cursor-default'
                  : 'bg-[#E6FAF9] border-4 border-[#1BCECC]/40 hover:border-[#1BCECC] hover:bg-[#D0F5F4]'
              }`}
            style={{ width: 112, height: 112 }}
          >
            {phase === 'saved' ? (
              /* Checkmark */
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1BCECC"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : phase === 'recording' ? (
              /* Stop */
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <rect x="5" y="5" width="14" height="14" rx="3" />
              </svg>
            ) : (
              /* Mic */
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1BCECC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        </div>

        {/* Status area */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center gap-3">
          {phase === 'idle' && (
            <p className="text-[#A0AEC0] text-sm font-semibold">Tap to start recording</p>
          )}
          {phase === 'recording' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[#2D3748] font-bold text-3xl font-mono tracking-tight">
                  {fmtDur(elapsed)}
                </span>
              </div>
              <p className="text-[#718096] text-sm font-medium">Tap to stop</p>
            </>
          )}
          {phase === 'saved' && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-[#718096] text-sm font-semibold">
                Saved · {fmtDur(elapsed)}
              </p>
              <PrimaryBtn onClick={() => onDone(elapsed)}>See your cloud →</PrimaryBtn>
            </div>
          )}
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}

// ── CLOUD CREATED ─────────────────────────────────────────────────────────────
function CloudCreatedScreen({
  durationSec,
  onNext,
}: {
  durationSec: number
  onNext: (label: string) => void
}) {
  const [loadingAI, setLoadingAI] = useState(true)
  const suggestedLabel = "Tomorrow's presentation"
  const [label, setLabel] = useState('')
  const [editing, setEditing] = useState(false)
  const [playing, setPlaying] = useState(false)
  const timeMs = useRef(Date.now()).current
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoadingAI(false), 1600)
    return () => clearTimeout(t)
  }, [])

  const handlePlay = () => {
    if (playing) return
    setPlaying(true)
    setTimeout(() => setPlaying(false), Math.min(durationSec, 8) * 1000 + 200)
  }

  const finalLabel = label.trim() || suggestedLabel

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-sm mx-auto">
      <div className="flex justify-center w-full">
        <Wordmark />
      </div>

      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full">
        <div className="text-center">
          <p className="text-[#A0AEC0] text-xs font-bold uppercase tracking-widest mb-1">
            Your thought cloud
          </p>
          <h1 className="text-[#2D3748] text-2xl font-extrabold">It's saved.</h1>
        </div>

        {/* Large cloud with play button */}
        <div className="relative">
          <svg
            width="220"
            height="143"
            viewBox="0 0 220 142"
            fill="#E6FAF9"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 10px 32px rgba(27,206,204,0.18))' }}
          >
            <CloudSVGGroup />
            {/* Shine */}
            <ellipse cx="86" cy="58" rx="22" ry="12" fill="white" opacity="0.5" />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-5">
            {/* Play button */}
            <button
              onClick={handlePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer
                shadow-[0_4px_18px_rgba(27,206,204,0.38)]
                ${playing ? 'bg-[#0FA8A6] scale-95' : 'bg-[#1BCECC] hover:scale-105'}`}
            >
              {playing ? (
                <div className="flex gap-1 items-center">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-bounce"
                      style={{ height: `${10 + i * 3}px`, animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            <p className="text-[#718096] text-[11px] font-bold">
              {fmtDur(durationSec)} · {fmtTime(timeMs)}
            </p>
          </div>
        </div>

        {/* Label section */}
        <div className="w-full space-y-3 bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${loadingAI ? 'bg-[#A0AEC0]' : 'bg-[#1BCECC]'}`}
            />
            <p className="text-[#A0AEC0] text-xs font-bold uppercase tracking-widest">
              {loadingAI ? 'Finding a label…' : 'Suggested label'}
            </p>
            {!loadingAI && (
              <span className="ml-auto text-[10px] text-[#A0AEC0] font-semibold bg-[#F0FFFE] px-2 py-0.5 rounded-full">
                AI suggested
              </span>
            )}
          </div>

          {loadingAI ? (
            <div className="h-8 bg-[#E6FAF9] rounded-xl animate-pulse w-52" />
          ) : editing ? (
            <input
              ref={inputRef}
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={suggestedLabel}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false) }}
              className="w-full text-[#2D3748] text-lg font-extrabold bg-transparent border-b-2
                border-[#1BCECC] outline-none pb-1 placeholder-[#CBD5E0]"
            />
          ) : (
            <p className="text-[#2D3748] text-xl font-extrabold leading-tight">
              {finalLabel}
            </p>
          )}

          <div className="flex gap-4 pt-1">
            {!editing && !loadingAI && (
              <button
                onClick={() => {
                  setEditing(true)
                  setTimeout(() => inputRef.current?.focus(), 50)
                }}
                className="text-[#1BCECC] text-sm font-bold underline underline-offset-2 cursor-pointer"
              >
                Edit label
              </button>
            )}
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="text-[#1BCECC] text-sm font-bold cursor-pointer"
              >
                Save
              </button>
            )}
            {!editing && !loadingAI && (
              <button
                onClick={() => onNext('')}
                className="text-[#718096] text-sm font-semibold cursor-pointer hover:text-[#2D3748] transition-colors"
              >
                Leave unnamed
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full pt-4">
        <PrimaryBtn
          onClick={() => !loadingAI && onNext(finalLabel)}
          disabled={loadingAI}
          className="w-full"
        >
          Give it a place →
        </PrimaryBtn>
      </div>
    </div>
  )
}

// ── PLACE ─────────────────────────────────────────────────────────────────────
function PlaceScreen({
  clouds,
  onChoose,
  onCreateNew,
}: {
  clouds: ThoughtCloud[]
  onChoose: (sky: string) => void
  onCreateNew: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-sm mx-auto">
      <div className="flex justify-center w-full">
        <Wordmark />
      </div>

      <div className="flex flex-col gap-8 flex-1 justify-center w-full">
        <div className="text-center">
          <h1 className="text-[#2D3748] text-2xl font-extrabold leading-snug">
            Where would you like
            <br />
            to keep this?
          </h1>
          <p className="text-[#718096] text-sm mt-2 font-semibold">
            You decide what each space means.
          </p>
        </div>

        <div className="space-y-3">
          {SKIES.map((sky) => {
            const meta = SKY_META[sky]
            const count = clouds.filter((c) => c.sky === sky).length
            const isSelected = selected === sky
            return (
              <button
                key={sky}
                onClick={() => setSelected(sky)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 font-bold
                  transition-all duration-200 cursor-pointer text-left
                  ${
                    isSelected
                      ? 'border-[#1BCECC] bg-[#E6FAF9] shadow-[0_2px_12px_rgba(27,206,204,0.18)]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#1BCECC]/40 hover:bg-[#F7FFFE]'
                  }`}
              >
                <span className="text-2xl">{meta.icon}</span>
                <div className="flex-1">
                  <p className="text-[#2D3748] font-extrabold text-base">{sky}</p>
                  <p className="text-[#718096] text-xs font-medium mt-0.5">
                    {count} thought{count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected ? 'bg-[#1BCECC] border-[#1BCECC]' : 'border-[#CBD5E0]'}`}
                >
                  {isSelected && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}

          <button
            onClick={onCreateNew}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed
              border-[#1BCECC]/35 text-[#1BCECC] font-extrabold text-base
              hover:border-[#1BCECC] hover:bg-[#E6FAF9]
              transition-all duration-200 cursor-pointer"
          >
            <span className="text-xl font-light">＋</span>
            <span>Create your own</span>
          </button>
        </div>
      </div>

      <div className="w-full pt-4">
        <PrimaryBtn
          onClick={() => selected && onChoose(selected)}
          disabled={!selected}
          className="w-full"
        >
          {selected ? `Save to ${selected}` : 'Choose a sky first'}
        </PrimaryBtn>
      </div>
    </div>
  )
}

// ── CLOUD DETAIL ──────────────────────────────────────────────────────────────
function CloudDetailScreen({
  cloud,
  onBack,
}: {
  cloud: ThoughtCloud
  onBack: () => void
}) {
  const [playing, setPlaying] = useState(false)
  const meta = SKY_META[cloud.sky]

  const handlePlay = () => {
    if (playing) return
    setPlaying(true)
    setTimeout(() => setPlaying(false), Math.min(cloud.durationSec, 10) * 1000 + 200)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-sm mx-auto">
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[#A0AEC0] hover:text-[#718096] font-semibold text-sm cursor-pointer transition-colors"
        >
          ← Sky
        </button>
        <Wordmark />
        <div className="w-16" />
      </div>

      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full text-center">
        {/* Large cloud */}
        <div className="relative cloud-float">
          <svg
            width="240"
            height="156"
            viewBox="0 0 220 142"
            fill="#E6FAF9"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 12px 36px rgba(27,206,204,0.15))' }}
          >
            <CloudSVGGroup />
            <ellipse cx="86" cy="58" rx="22" ry="12" fill="white" opacity="0.45" />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-6">
            <button
              onClick={handlePlay}
              className={`flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer
                shadow-[0_4px_20px_rgba(27,206,204,0.4)]
                ${playing ? 'bg-[#0FA8A6] scale-95' : 'bg-[#1BCECC] hover:scale-105'}`}
              style={{ width: 56, height: 56 }}
            >
              {playing ? (
                <div className="flex gap-1 items-center">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-bounce"
                      style={{ height: `${10 + i * 3}px`, animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
            <p className="text-[#718096] text-[11px] font-bold">{fmtDur(cloud.durationSec)}</p>
          </div>
        </div>

        {/* Metadata card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] space-y-5 text-left">
          <div>
            <p className="text-[#A0AEC0] text-xs font-bold uppercase tracking-widest mb-1">Label</p>
            <p className="text-[#2D3748] text-xl font-extrabold leading-tight">{cloud.label}</p>
          </div>

          <div className="flex gap-8">
            <div>
              <p className="text-[#A0AEC0] text-xs font-bold uppercase tracking-widest mb-1">
                Saved to
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{meta?.icon}</span>
                <p className="text-[#2D3748] font-extrabold text-sm">{cloud.sky}</p>
              </div>
            </div>
            <div>
              <p className="text-[#A0AEC0] text-xs font-bold uppercase tracking-widest mb-1">When</p>
              <p className="text-[#2D3748] font-extrabold text-sm">{fmtTime(cloud.timeMs)}</p>
            </div>
            <div>
              <p className="text-[#A0AEC0] text-xs font-bold uppercase tracking-widest mb-1">
                Duration
              </p>
              <p className="text-[#2D3748] font-extrabold text-sm">{fmtDur(cloud.durationSec)}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F4F8]">
            <p className="text-[#A0AEC0] text-sm font-medium italic">This is what you left here.</p>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('widget')
  const [clouds, setClouds] = useState<ThoughtCloud[]>(INITIAL_CLOUDS)
  const [pendingDuration, setPendingDuration] = useState(0)
  const [pendingLabel, setPendingLabel] = useState('')
  const [selectedCloud, setSelectedCloud] = useState<ThoughtCloud | null>(null)
  const [newCloudId, setNewCloudId] = useState<string | undefined>()

  const handleRecordDone = (dur: number) => {
    setPendingDuration(dur)
    setScreen('cloud-created')
  }

  const handleLabelDone = (label: string) => {
    setPendingLabel(label)
    setScreen('place')
  }

  const handlePlace = (sky: string) => {
    const newCloud: ThoughtCloud = {
      id: `new-${Date.now()}`,
      durationSec: pendingDuration,
      timeMs: Date.now(),
      label: pendingLabel || 'Unnamed thought',
      sky,
      x: 12 + Math.random() * 68,
      y: 12 + Math.random() * 50,
    }
    setClouds((prev) => [...prev, newCloud])
    setNewCloudId(newCloud.id)
    setScreen('sky')
  }

  const handleCloudTap = (cloud: ThoughtCloud) => {
    setSelectedCloud(cloud)
    setScreen('cloud-detail')
  }

  const screens: Record<Screen, React.ReactNode> = {
    widget: <WidgetScreen onTap={() => setScreen('record')} />,
    sky: (
      <SkyScreen
        clouds={clouds}
        onAddThought={() => setScreen('record')}
        onCloudTap={handleCloudTap}
        newCloudId={newCloudId}
      />
    ),
    record: <RecordScreen onDone={handleRecordDone} onBack={() => setScreen('sky')} />,
    'cloud-created': (
      <CloudCreatedScreen durationSec={pendingDuration} onNext={handleLabelDone} />
    ),
    place: (
      <PlaceScreen clouds={clouds} onChoose={handlePlace} onCreateNew={() => handlePlace('Tonight')} />
    ),
    'cloud-detail': selectedCloud ? (
      <CloudDetailScreen cloud={selectedCloud} onBack={() => setScreen('sky')} />
    ) : null,
  }

  return (
    <div className="min-h-screen bg-[#F7FFFE]">
      <div key={screen} className="screen-fade">
        {screens[screen]}
      </div>
    </div>
  )
}
