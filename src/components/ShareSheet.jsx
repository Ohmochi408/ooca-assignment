import React, { useState } from 'react';
import Icon from './Icon';
import Sheet from './Sheet';
import HelpNow from './HelpNow';
import { SESSIONS, TOPICS, whenOf, whoOf } from '../data/session';

// Bring a sky to the next ooca session(s). ooca's Privacy Policy already lets providers see a user's data and share it
// "at your instruction" (§4), withdrawable anytime (§8) — so choosing who and one tap is enough. The sheet says who
// can listen, and that it's not right away (Terms §4ง). Terms §4ค: users may always seek another provider's view —
// so "Browse providers" is here too, by topics the user picks (never guessed from their voice).
// sharedIds: the sessions this sky is shared with now. onShare(ids): [] stops sharing.
export default function ShareSheet({ thoughts, sharedIds, onShare, onBrowse, onClose }) {
  const one = SESSIONS.length === 1;
  const [picked, setPicked] = useState(sharedIds.length ? sharedIds : one ? [SESSIONS[0].id] : []);
  const [browsing, setBrowsing] = useState(SESSIONS.length === 0);
  const [topics, setTopics] = useState([]);
  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  if (browsing) {
    return (
      <Sheet
        title={SESSIONS.length ? 'Find someone for this' : 'No session booked yet'}
        subtitle={SESSIONS.length ? undefined : 'When you book one, you can bring this sky to it.'}
        onClose={onClose}
      >
        <div className="flex flex-col gap-4">
          <p className="text-body3 text-bluegray-800">What would you like to talk about? Pick as many as you like.</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => toggle(topics, setTopics, t)}
                aria-pressed={topics.includes(t)}
                className={`min-h-10 px-4 rounded-ooca-pill text-body3 border-2 cursor-pointer ${topics.includes(t) ? 'border-turquoise-900 bg-turquoise-900 text-white' : 'border-gray-200 text-bluegray-800 hover:border-turquoise-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => onBrowse(topics)} disabled={!topics.length} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block">
            See providers
          </button>
          {SESSIONS.length > 0 && (
            <button
              onClick={() => setBrowsing(false)}
              className="self-center min-h-8 px-2 rounded-ooca-pill text-body5 text-turquoise-900 underline underline-offset-2 cursor-pointer"
            >
              Back to sharing
            </button>
          )}
          <HelpNow compact />
        </div>
      </Sheet>
    );
  }

  const shared = sharedIds.length > 0;
  const { who, many, count } = whoOf(SESSIONS.filter((s) => picked.includes(s.id)));
  const now = whoOf(SESSIONS.filter((s) => sharedIds.includes(s.id)));
  const sameAsNow = picked.length === sharedIds.length && picked.every((id) => sharedIds.includes(id));
  const kept = thoughts.filter((c) => c.private).length;
  const shown = thoughts.length - kept;

  let action = { label: many ? `Share with ${count} providers` : `Share with ${who}`, ids: picked, primary: true };
  if (shared && (sameAsNow || !picked.length)) action = { label: 'Stop sharing', ids: [], primary: false };
  else if (!picked.length) action = { label: 'Share', ids: [], primary: true, disabled: true };
  else if (shared) action = { label: 'Save', ids: picked, primary: true };

  let line = 'Choose who can listen to this sky.';
  if (shared && sameAsNow)
    line = `${now.who} can listen to ${shown} thought${shown === 1 ? '' : 's'} here${kept ? ` · ${kept} just for you` : ''}. New thoughts you add are shared too, until ${now.many ? 'each session' : 'the session'}.`;
  else if (picked.length)
    line = `${who} can listen to this sky, and anything new you add, until ${many ? 'each session' : 'your session'}, not right away. You can keep any thought to yourself.`;

  return (
    <Sheet title={shared ? `Shared with ${now.many ? `${now.count} providers` : now.who}` : 'Bring this sky to your session?'} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* The booked sessions: one is simply shown; with more, the user chooses who can listen */}
        <div className="flex flex-col gap-2" role={one ? undefined : 'group'} aria-label={one ? undefined : 'Who can listen'}>
          {!one && <p className="text-body4 uppercase text-bluegray-600">Who can listen</p>}
          {SESSIONS.map((s) => {
            const on = picked.includes(s.id);
            const Tag = one ? 'div' : 'button';
            return (
              <Tag
                key={s.id}
                {...(one ? {} : { onClick: () => toggle(picked, setPicked, s.id), role: 'checkbox', 'aria-checked': on })}
                className={`flex items-center gap-3 rounded-ooca-16 bg-gray-100 p-3 text-left border-2 ${one ? 'border-transparent' : `cursor-pointer ${on ? 'border-turquoise-900' : 'border-transparent hover:border-turquoise-300'}`}`}
              >
                <span className="w-11 h-11 shrink-0 rounded-full bg-white text-turquoise-900 flex items-center justify-center">
                  <Icon name="calendar" size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body2 text-black truncate">{s.provider}</span>
                  <span className="block text-body3 text-bluegray-600 truncate">{s.role}</span>
                  <span className="block text-body3 text-bluegray-600">{whenOf(s)}</span>
                </span>
                {!one &&
                  (on ? (
                    <Icon name="check" size={24} className="text-turquoise-900" />
                  ) : (
                    <span className="w-6 h-6 shrink-0 rounded-full border-2 border-gray-300" aria-hidden="true" />
                  ))}
              </Tag>
            );
          })}
        </div>

        <p className="text-body3 text-bluegray-800">{line}</p>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onShare(action.ids)}
            disabled={action.disabled}
            className={`ooca-btn ooca-btn-block ooca-btn-turquoise ${action.primary ? 'ooca-btn-primary' : 'ooca-btn-secondary'}`}
          >
            {action.label}
          </button>
          <p className="text-body5 text-bluegray-600 text-center">
            {action.label === 'Stop sharing' ? `${now.many ? 'They' : now.who} can't listen to this sky from now on.` : 'You can stop sharing anytime.'}
          </p>
        </div>

        <p className="text-body5 text-bluegray-600 text-center border-t border-gray-300 pt-4">
          Looking for someone else for this?{' '}
          <button onClick={() => setBrowsing(true)} className="min-h-8 px-1 rounded-ooca-pill text-turquoise-900 underline underline-offset-2 cursor-pointer">
            Browse providers
          </button>
        </p>
        <HelpNow compact />
      </div>
    </Sheet>
  );
}
