import React from 'react';
import Icon from './Icon';
import Sheet from './Sheet';
import { SESSION, sessionWhen } from '../data/session';

// Bring a sky to the next ooca session: say plainly what the provider will see, and what they won't, before
// anything is shared. Sharing follows the sky until the session ends; any thought can stay private.
export default function ShareSheet({ sky, thoughts, shared, onShare, onClose }) {
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
          <div className="flex flex-col gap-3">
            <p className="text-body4 uppercase text-bluegray-600">What {provider} will see</p>
            <Line icon="check">The voice, name and key points of each thought in {sky.name}</Line>
            <Line icon="check">New thoughts you keep here, until the session ends</Line>
            <Line icon="lock">Not your other skies, or any thought you keep to yourself</Line>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onShare(!shared)}
            className={`ooca-btn ooca-btn-block ${shared ? 'ooca-btn-secondary ooca-btn-turquoise' : 'ooca-btn-primary ooca-btn-turquoise'}`}
          >
            {shared ? 'Stop sharing' : `Share with ${provider}`}
          </button>
          <p className="text-body5 text-bluegray-600 text-center">
            {shared ? `${provider} won't see this sky anymore.` : 'You can stop sharing anytime. Your thoughts stay confidential.'}
          </p>
        </div>
      </div>
    </Sheet>
  );
}

function Line({ icon, children }) {
  return (
    <p className="flex items-start gap-2 text-body3 text-bluegray-800">
      <Icon name={icon} size={18} className={`mt-px ${icon === 'lock' ? 'text-bluegray-600' : 'text-turquoise-900'}`} />
      {children}
    </p>
  );
}
