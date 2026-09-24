import React from 'react';
import Icon from './Icon';
import SkyBackground from './SkyBackground';

// The lock screen is a phone idea, so on a tablet / computer it sits in a phone frame over the sky of right now,
// with a short intro and a way straight into the web app. On a phone (upright or sideways) it is simply the whole screen.
export default function LockStage({ period, onOpenWeb, onOpenAbout, children }) {
  return (
    <div className="relative h-full w-full flex flex-col lg:flex-row items-center justify-center framed:gap-6 lg:gap-16 framed:p-6">
      <SkyBackground period={period} className="hidden framed:block opacity-60" />

      {/* ds-allow: 40px radius is the phone-frame mock, not a UI surface */}
      <div className="relative w-full h-full shrink-0 overflow-hidden framed:w-[380px] framed:h-[min(820px,calc(100dvh-200px))] framed:lg:h-[min(820px,calc(100dvh-48px))] framed:rounded-[40px] framed:border-8 framed:border-bluegray-900 framed:shadow-elevation-8">
        {children}
      </div>

      <aside className="relative hidden framed:flex flex-col items-center lg:items-start text-center lg:text-left gap-3 max-w-[380px] text-white">
        <p className="hidden lg:block text-body4 uppercase text-turquoise-50">UX/UI assignment · working prototype</p>
        <h1 className="text-h4 lg:text-h2">ooca — Thought Cloud</h1>
        <p className="hidden lg:block text-body1 text-turquoise-50">
          A 2-minute way to put a thought outside your head: say it, and it becomes a small cloud in your sky.
        </p>
        <p className="hidden lg:flex items-start gap-2 text-body3 text-white">
          <Icon name="mic-bold" size={18} className="shrink-0 mt-0.5" />
          Tap “Leave a thought here?” on the phone to start recording — or open the sky full screen.
        </p>
        <div className="flex items-center gap-2 lg:mt-2">
          <button onClick={onOpenWeb} className="ooca-btn ooca-btn-primary ooca-btn-turquoise">
            Open on web
          </button>
          <button onClick={onOpenAbout} className="ooca-btn ooca-btn-secondary ooca-btn-turquoise">
            About
          </button>
        </div>
      </aside>
    </div>
  );
}
