import React from 'react';

// A quiet way to get help right now — always there, never popped up, nothing about what the user said.
// (Layer 1 of the safety plan; ooca's own urgent contact would be added with its clinical team.)
const HOTLINE = { name: 'Thai Mental Health Hotline', number: '1323' };

export default function HelpNow({ compact = false }) {
  const call = (
    <a href={`tel:${HOTLINE.number}`} className="rounded-ooca-8 text-turquoise-900 underline underline-offset-2 hover:bg-turquoise-50">
      call {HOTLINE.number}
    </a>
  );
  if (compact) return <p className="text-body5 text-bluegray-600 text-center">Need to talk to someone now? {call}, free, any time.</p>;
  return (
    <section className="p-4 rounded-ooca-16 bg-gray-100 mb-5">
      <h3 className="text-subheader1 text-bluegray-800 mb-1">Need to talk to someone now?</h3>
      <p className="text-body3 text-bluegray-600">
        The {HOTLINE.name} is free, any time — {call}.
      </p>
    </section>
  );
}
