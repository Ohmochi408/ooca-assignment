import React from 'react';
import Icon from './Icon';
import Sheet from './Sheet';
import { SESSION, sessionWhen } from '../data/session';

// Bring a sky to the next ooca session. ooca's Privacy Policy already lets providers see a user's data and share it
// "at your instruction" (§4), with consent withdrawable anytime (§8) — so one tap is enough; the sheet only says what
// they'll hear, and that they may not hear it right away (Terms §4ง: providers can't reply at once — emergencies: 1669).
export default function ShareSheet({ thoughts, shared, onShare, onClose }) {
  const kept = thoughts.filter((c) => c.private).length;
  const shown = thoughts.length - kept;
  const { provider } = SESSION;

  return (
    <Sheet title={shared ? `Shared with ${provider}` : 'Bring this sky to your session?'} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* The booked session */}
        <div className="flex items-center gap-3 rounded-ooca-16 bg-gray-100 p-3">
          <span className="w-11 h-11 shrink-0 rounded-full bg-white text-turquoise-900 flex items-center justify-center">
            <Icon name="calendar" size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-body2 text-black">{sessionWhen}</p>
            <p className="text-body3 text-bluegray-600">
              {provider} · {SESSION.role} · {SESSION.channel}
            </p>
          </div>
        </div>

        {shared ? (
          <p className="text-body3 text-bluegray-800">
            {provider} can see {shown} thought{shown === 1 ? '' : 's'} here{kept > 0 && ` (${kept} kept to yourself)`}. New thoughts you keep in this sky are
            shared too, until the session ends.
          </p>
        ) : (
          <p className="text-body3 text-bluegray-800">
            {provider} will hear the thoughts in this sky, and new ones you keep here, until the session ends. Any thought can stay just yours.
          </p>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onShare(!shared)}
            className={`ooca-btn ooca-btn-block ${shared ? 'ooca-btn-secondary ooca-btn-turquoise' : 'ooca-btn-primary ooca-btn-turquoise'}`}
          >
            {shared ? 'Stop sharing' : `Share with ${provider}`}
          </button>
          <p className="text-body5 text-bluegray-600 text-center">{shared ? `${provider} won't see this sky from now on.` : 'You can stop sharing anytime.'}</p>
        </div>

        {/* Shared isn't the same as heard: a thought left at 3 AM may wait until the session */}
        <p className="flex items-start gap-2 rounded-ooca-16 bg-gray-100 p-3 text-body5 text-bluegray-800">
          <Icon name="info" size={16} className="shrink-0 text-turquoise-900" />
          {provider} may listen just before your session. If you need help now, call 1669 or go to the nearest hospital.
        </p>
      </div>
    </Sheet>
  );
}
