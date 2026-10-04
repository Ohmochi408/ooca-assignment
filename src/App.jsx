import React, { useCallback, useEffect, useState } from 'react';
import AboutSheet from './components/AboutSheet';
import Toast from './components/Toast';
import { randomMooca } from './data/moocas';
import LockScreen from './screens/LockScreen';
import SkyScreen from './screens/SkyScreen';
import RecordScreen from './screens/RecordScreen';
import CloudReadyScreen from './screens/CloudReadyScreen';
import {
  getStoredClouds,
  saveClouds,
  getStoredSkies,
  saveSkies,
  FAVORITES_ID,
  favoritesSky,
  getFavoritesStyle,
  saveFavoritesStyle,
} from './utils/storageHelper';
import { getSkyPeriod } from './utils/skyPeriods';
import { getAudioContext } from './utils/audioHelper';
import { dateKey } from './utils/dates';
import { prefersReducedMotion } from './utils/motion';
import { SESSIONS, whoOf } from './data/session';

// Flow (Ideate2 → Main Design): lock screen → Time Sky / My Sky → recording → Cloud ready → back to the sky
export default function App() {
  const [screen, setScreen] = useState('lock');
  const [clouds, setClouds] = useState(getStoredClouds);
  const [skies, setSkies] = useState(getStoredSkies);
  const [favStyle, setFavStyle] = useState(getFavoritesStyle);
  // My Sky shows Favorites first, then the user's skies (index 0 = Favorites)
  const mySkies = [favoritesSky(favStyle), ...skies];
  const [draft, setDraft] = useState(null); // new recording on "Cloud ready"
  const [editingId, setEditingId] = useState(null); // saved cloud reopened on "Cloud ready"
  const [newCloudId, setNewCloudId] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (t) => setToast({ id: Date.now(), ...t });
  const hideToast = useCallback(() => setToast(null), []);

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
    getAudioContext(); // unlock audio inside the tap itself, so the recorder can read the voice level later
    setRecordSky(sky ?? getSkyPeriod());
    if (!fromSky || prefersReducedMotion()) return goTo('record');
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

  // Ambient sky (lock screen + its backdrop on larger screens) follows the real time of day
  const [period, setPeriod] = useState(() => getSkyPeriod());
  useEffect(() => {
    const t = setInterval(() => setPeriod(getSkyPeriod()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => saveClouds(clouds), [clouds]);
  useEffect(() => saveSkies(skies), [skies]);
  useEffect(() => saveFavoritesStyle(favStyle), [favStyle]);

  const editing = clouds.find((c) => c.id === editingId);
  const skyStyleOf = (cloud) => skies.find((s) => s.id === cloud.skyId)?.style ?? getSkyPeriod(new Date(cloud.timestamp));

  const arrive = (id) => {
    setNewCloudId(id);
    setTimeout(() => setNewCloudId((cur) => (cur === id ? null : cur)), 2500);
  };

  // Land on the sky that now holds the cloud, and let it rise in
  const showCloud = (cloud) => {
    const k = skies.findIndex((s) => s.id === cloud.skyId);
    if (k >= 0) {
      setSkyView('mine');
      setMyIndex(k + 1); // +1: Favorites comes first in My Sky
    } else {
      setSkyView('time');
      setTimeNav({ date: dateKey(cloud.timestamp), period: getSkyPeriod(new Date(cloud.timestamp)) });
    }
    arrive(cloud.id);
  };

  const handleRecorded = (rec) => {
    const n = clouds.filter((c) => /^New (thought|Cloud) \d+$/.test(c.label)).length + 1;
    setDraft({
      id: `cloud-${Date.now()}`,
      label: `New thought ${n}`,
      timestamp: Date.now(),
      skyId: null,
      favorite: false,
      mooca: randomMooca([...clouds].sort((a, b) => b.timestamp - a.timestamp)[0]?.mooca),
      ...rec,
    });
    goTo('ready', true);
  };

  const createSky = ({ name, icon, style }) => {
    const sky = { id: `custom-${Date.now()}`, name, icon, style };
    setSkies((prev) => [...prev, sky]);
    return sky;
  };

  // "Done!" on Cloud ready — for a new recording or an edited cloud
  const handleReadyDone = (base, { label, favorite, summary, skyId, newSky }) => {
    const sky = newSky ? createSky(newSky) : skies.find((s) => s.id === skyId);
    const { transcript: _words, ...rest } = base; // the words themselves are not kept — only the name and key points
    const cloud = { ...rest, label, favorite, summary: summary ?? null, skyId: sky?.id ?? null };
    setClouds((prev) => (prev.some((c) => c.id === cloud.id) ? prev.map((c) => (c.id === cloud.id ? cloud : c)) : [...prev, cloud]));
    // showCloud needs the new sky's index: it is appended last
    if (newSky) {
      setSkyView('mine');
      setMyIndex(skies.length + 1); // the new sky is last, after Favorites + the existing ones
      arrive(cloud.id);
    } else showCloud(cloud);
    setDraft(null);
    setEditingId(null);
    showToast({ icon: 'check', message: sky ? `Kept in ${sky.name}` : 'Kept in your Time Sky' });
    goTo('sky');
  };

  // Removing a voice is easy to regret — it goes at once, with Undo for a few seconds
  const deleteCloud = (cloud) => {
    const at = clouds.findIndex((c) => c.id === cloud.id);
    setClouds((prev) => prev.filter((c) => c.id !== cloud.id));
    showToast({
      icon: 'bin',
      message: 'Thought deleted',
      action: 'Undo',
      duration: 6000,
      onAction: () => setClouds((prev) => [...prev.slice(0, at), cloud, ...prev.slice(at)]),
    });
  };

  // Deleting skies never deletes thoughts: the ones inside go back to Time Sky only. Undo puts both back.
  const deleteSkies = (ids) => {
    const removed = skies.filter((s) => ids.includes(s.id));
    if (!removed.length) return;
    const before = skies;
    const movedTo = Object.fromEntries(clouds.filter((c) => ids.includes(c.skyId)).map((c) => [c.id, c.skyId]));
    setSkies((prev) => prev.filter((s) => !ids.includes(s.id)));
    setClouds((prev) => prev.map((c) => (movedTo[c.id] ? { ...c, skyId: null } : c)));
    const what = removed.length === 1 ? 'Sky deleted' : `${removed.length} skies deleted`;
    showToast({
      icon: 'bin',
      message: Object.keys(movedTo).length ? `${what} · thoughts kept in Time Sky` : what,
      action: 'Undo',
      duration: 6000,
      onAction: () => {
        // the original order, keeping any edits or new skies made since
        setSkies((prev) => [
          ...before.map((s) => prev.find((p) => p.id === s.id) ?? (ids.includes(s.id) ? s : null)).filter(Boolean),
          ...prev.filter((p) => !before.some((s) => s.id === p.id)),
        ]);
        setClouds((prev) => prev.map((c) => (movedTo[c.id] && c.skyId === null ? { ...c, skyId: movedTo[c.id] } : c)));
      },
    });
  };

  // Bring a sky to the next session (or stop): the provider sees it until the session ends
  // ids: the sessions whose providers can listen; [] = only the user again
  const shareSky = (skyId, ids) => {
    setSkies((prev) => prev.map((s) => (s.id === skyId ? { ...s, sharedWith: ids } : s)));
    const { who, many, count } = whoOf(SESSIONS.filter((s) => ids.includes(s.id)));
    showToast({
      icon: ids.length ? 'check' : 'lock',
      message: ids.length ? `Shared with ${many ? `${count} providers` : who}` : 'This sky is just for you again',
    });
  };
  // Prototype edge: ooca's own provider list would open here, filtered by the topics picked
  const browseProviders = (topics) => showToast({ icon: 'user', message: `ooca's providers for ${topics.join(', ')}` });
  const togglePrivate = (cloud) => setClouds((prev) => prev.map((c) => (c.id === cloud.id ? { ...c, private: !c.private } : c)));

  const discardDraft = () => {
    const kept = draft;
    setDraft(null);
    goTo('sky');
    showToast({
      icon: 'bin',
      message: 'Thought discarded',
      action: 'Undo',
      duration: 6000,
      onAction: () => {
        setDraft(kept);
        goTo('ready');
      },
    });
  };

  // Opening ooca from the lock screen always lands on the sky of right now
  const openSkyNow = () => {
    setSkyView('time');
    setTimeNav({ date: dateKey(), period: getSkyPeriod() });
    goTo('sky');
  };

  const screens = {
    lock: <LockScreen period={period} onOpenSky={openSkyNow} onAddThought={() => startRecording(period)} onOpenAbout={() => setAboutOpen(true)} />,
    sky: (
      <SkyScreen
        clouds={clouds}
        skies={mySkies}
        view={skyView}
        setView={setSkyView}
        timeNav={timeNav}
        setTimeNav={setTimeNav}
        myIndex={myIndex}
        setMyIndex={setMyIndex}
        newCloudId={newCloudId}
        leaving={leaving}
        onAddThought={(sky) => startRecording(sky, true)}
        onEditCloud={(cloud) => {
          setEditingId(cloud.id);
          goTo('edit');
        }}
        onFavorite={(cloud) => setClouds((prev) => prev.map((c) => (c.id === cloud.id ? { ...c, favorite: !c.favorite } : c)))}
        onDeleteCloud={deleteCloud}
        onMoveCloud={(cloud, view, pos) => setClouds((prev) => prev.map((c) => (c.id === cloud.id ? { ...c, pos: { ...c.pos, [view]: pos } } : c)))}
        onCreateSky={createSky}
        onDeleteSkies={deleteSkies}
        onShareSky={shareSky}
        onBrowseProviders={browseProviders}
        onTogglePrivate={togglePrivate}
        onUpdateSky={(skyId, data) =>
          skyId === FAVORITES_ID ? setFavStyle(data.style) : setSkies((prev) => prev.map((s) => (s.id === skyId ? { ...s, ...data } : s)))
        }
      />
    ),
    record: <RecordScreen sky={recordSky} onDone={handleRecorded} />,
    ready: draft && (
      <CloudReadyScreen
        key={draft.id}
        cloud={draft}
        skies={skies}
        backdrop={recordSky ?? period}
        onDone={(v) => handleReadyDone(draft, v)}
        onDiscard={discardDraft}
      />
    ),
    edit: editing && (
      <CloudReadyScreen
        key={editing.id}
        mode="edit"
        cloud={editing}
        skies={skies}
        backdrop={skyStyleOf(editing)}
        onDone={(v) => handleReadyDone(editing, v)}
        onCancel={() => {
          setEditingId(null);
          goTo('sky', true); // nothing changed — back to the same sky, same spot
        }}
        onDiscard={() => {
          setEditingId(null);
          goTo('sky');
          deleteCloud(editing);
        }}
      />
    ),
  };

  return (
    // Full screen at every size, the lock screen included: the sky fills the window, each screen lays its content out
    // for the space it has.
    <main className="relative h-[100dvh] w-full overflow-hidden bg-bluegray-900">
      <div key={screen} className={`h-full ${fadeScreens ? 'screen-fade' : ''}`}>
        {screens[screen] ?? screens.sky}
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
      {aboutOpen && <AboutSheet onClose={() => setAboutOpen(false)} />}
      <div id="sheet-root" />
    </main>
  );
}
