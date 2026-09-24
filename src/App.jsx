import React, { useCallback, useEffect, useState } from 'react';
import SkyBackground from './components/SkyBackground';
import AboutSheet from './components/AboutSheet';
import Toast from './components/Toast';
import WidgetScreen from './screens/WidgetScreen';
import SkyScreen from './screens/SkyScreen';
import RecordScreen from './screens/RecordScreen';
import CloudCreatedScreen from './screens/CloudCreatedScreen';
import PlaceScreen from './screens/PlaceScreen';
import CloudDetailScreen from './screens/CloudDetailScreen';
import { getStoredClouds, saveClouds, getStoredSkies, saveSkies, CUSTOM_SKY_COLORS } from './utils/storageHelper';
import { getSkyPeriod } from './utils/skyPeriods';
import { dateKey } from './utils/dates';

// Flow (PRODUCT_BRIEF §9): widget → sky → record → cloud created → place → sky → cloud detail
export default function App() {
  const [screen, setScreen] = useState('widget');
  const [clouds, setClouds] = useState(getStoredClouds);
  const [skies, setSkies] = useState(getStoredSkies);
  const [draft, setDraft] = useState(null); // recording waiting for a label + sky
  const [selectedId, setSelectedId] = useState(null);
  const [newCloudId, setNewCloudId] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (t) => setToast({ id: Date.now(), ...t });
  const hideToast = useCallback(() => setToast(null), []);
  const [detailSky, setDetailSky] = useState(null); // the sky a cloud was opened from

  // Sky → Record transition: foreground falls away (leaving), the sky stays as the record backdrop
  const [leaving, setLeaving] = useState(false);
  const [recordSky, setRecordSky] = useState(null);
  const [fadeScreens, setFadeScreens] = useState(true);
  // keepSky: the next screen sits on the same sky, so only its elements animate in (no flash)
  const goTo = (next, keepSky = false) => {
    setFadeScreens(!keepSky);
    setScreen(next);
  };
  const startRecording = (sky, fromSky = false) => {
    setRecordSky(sky ?? getSkyPeriod());
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fromSky || reduced) return goTo('record');
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      setFadeScreens(false); // background must not flash — only the new elements animate in
      setScreen('record');
    }, 700);
  };

  // Where the user is looking in the Sky screen (kept while visiting other screens)
  const [skyView, setSkyView] = useState('time');
  const [timeNav, setTimeNav] = useState(() => ({ date: dateKey(), period: getSkyPeriod() }));
  const [myIndex, setMyIndex] = useState(0);

  // Ambient sky (widget + desktop backdrop) follows the real time of day
  const [period, setPeriod] = useState(() => getSkyPeriod());
  useEffect(() => {
    const t = setInterval(() => setPeriod(getSkyPeriod()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => saveClouds(clouds), [clouds]);
  useEffect(() => saveSkies(skies), [skies]);

  const selected = clouds.find((c) => c.id === selectedId);

  const handleRecorded = (rec) => {
    setDraft({ ...rec, timestamp: Date.now() });
    goTo('created', true);
  };

  const handleLabel = (label) => {
    setDraft((d) => ({ ...d, label }));
    goTo('place', true);
  };

  const handlePlace = (skyId) => {
    const sky = skies.find((s) => s.id === skyId);
    const cloud = {
      id: `cloud-${Date.now()}`,
      label: draft.label || 'Unnamed thought',
      timestamp: draft.timestamp,
      duration: draft.duration,
      skyId,
      skyName: sky?.name,
      audioUrl: draft.audioUrl,
      frequency: draft.frequency,
    };
    setClouds((prev) => [...prev, cloud]);
    setNewCloudId(cloud.id);
    setTimeout(() => setNewCloudId((id) => (id === cloud.id ? null : id)), 2500); // arrive once, not on every visit
    setDraft(null);
    showToast({ icon: 'check', message: `Saved to ${sky?.name ?? 'your sky'}` });
    // Show the cloud landing in the sky the user chose
    setSkyView('mine');
    setMyIndex(Math.max(0, skies.findIndex((s) => s.id === skyId)));
    goTo('sky');
  };

  const handleCreateSky = ({ name, icon, style }) => {
    const sky = { id: `custom-${Date.now()}`, name, icon, style, color: CUSTOM_SKY_COLORS[skies.length % CUSTOM_SKY_COLORS.length], description: 'A personal space defined by you.' };
    setSkies((prev) => [...prev, sky]);
    return sky;
  };

  const handleUpdateSky = (skyId, data) => {
    setSkies((prev) => prev.map((s) => (s.id === skyId ? { ...s, ...data } : s)));
    setClouds((prev) => prev.map((c) => (c.skyId === skyId ? { ...c, skyName: data.name } : c)));
  };

  const handleMove = (cloudId, skyId) => {
    const sky = skies.find((s) => s.id === skyId);
    setClouds((prev) => prev.map((c) => (c.id === cloudId ? { ...c, skyId, skyName: sky?.name } : c)));
  };

  // Removing a voice is easy to regret — it goes at once, with Undo for a few seconds
  const handleDelete = (cloudId) => {
    const at = clouds.findIndex((c) => c.id === cloudId);
    const removed = clouds[at];
    setClouds((prev) => prev.filter((c) => c.id !== cloudId));
    goTo('sky', true);
    if (removed) {
      showToast({
        icon: 'bin',
        message: 'Thought removed',
        action: 'Undo',
        duration: 6000,
        onAction: () => setClouds((prev) => [...prev.slice(0, at), removed, ...prev.slice(at)]),
      });
    }
  };

  const openCloud = (cloud, backdrop) => {
    setSelectedId(cloud.id);
    setDetailSky(backdrop ?? getSkyPeriod(new Date(cloud.timestamp)));
    goTo('detail', true);
  };

  const screens = {
    widget: (
      <WidgetScreen
        period={period}
        clouds={clouds}
        onOpenSky={(p) => {
          // A period from "Today's skies" opens that sky of today in Time Sky
          if (p) {
            setSkyView('time');
            setTimeNav({ date: dateKey(), period: p });
          }
          goTo('sky');
        }}
        onAddThought={() => startRecording(period)}
      />
    ),
    sky: (
      <SkyScreen
        clouds={clouds}
        skies={skies}
        view={skyView}
        setView={setSkyView}
        timeNav={timeNav}
        setTimeNav={setTimeNav}
        myIndex={myIndex}
        setMyIndex={setMyIndex}
        newCloudId={newCloudId}
        onCreateSky={handleCreateSky}
        onUpdateSky={handleUpdateSky}
        leaving={leaving}
        onAddThought={(sky) => startRecording(sky, true)}
        onOpenCloud={openCloud}
        onOpenAbout={() => setAboutOpen(true)}
      />
    ),
    record: <RecordScreen sky={recordSky} onBack={() => goTo('sky')} onDone={handleRecorded} />,
    created: draft && (
      <CloudCreatedScreen
        draft={draft}
        sky={recordSky}
        onBack={() => {
          setDraft(null);
          goTo('record', true);
        }}
        onNext={handleLabel}
      />
    ),
    place: draft && <PlaceScreen clouds={clouds} skies={skies} sky={recordSky} onBack={() => goTo('created', true)} onChoose={handlePlace} onCreateSky={handleCreateSky} />,
    detail: selected && <CloudDetailScreen cloud={selected} skies={skies} backdrop={detailSky} onBack={() => goTo('sky', true)} onMove={handleMove} onDelete={handleDelete} />,
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center sm:p-6 bg-bluegray-900">
      {/* Desktop backdrop: the current sky behind the phone frame */}
      <SkyBackground period={period} className="hidden sm:block opacity-60" />

      {/* ds-allow: 40px radius is the phone-frame mock, not a UI surface */}
      <main className="relative w-full sm:max-w-[400px] h-[100dvh] sm:h-[820px] sm:rounded-[40px] overflow-hidden bg-gray-100 sm:shadow-elevation-8 sm:border-8 sm:border-bluegray-900">
        <div key={screen} className={`h-full ${fadeScreens ? 'screen-fade' : ''}`}>
          {screens[screen] ?? screens.sky}
        </div>
        <Toast toast={toast} onDismiss={hideToast} />
        {aboutOpen && <AboutSheet onClose={() => setAboutOpen(false)} />}
        <div id="sheet-root" />
      </main>
    </div>
  );
}
