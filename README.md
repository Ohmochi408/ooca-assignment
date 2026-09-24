# OOCA — Thought Cloud ☁️
> **A 2-minute exploratory mental wellness experience that gives people a low-friction way to put thoughts outside their head using voice.**

Candidate: **Wittawin Archanuparb (Ohm)**  
Role: **UX/UI Product Designer (Design Engineer)**  
Topic: **The 2-Minute Mental Health Experience** (OOCA Assignment)  

---

## 🔗 Project Deliverables
- **GitHub Repository:** [https://github.com/Ohmochi408/ooca-assignment](https://github.com/Ohmochi408/ooca-assignment)
- **Figma Design:** [`ooca CI for UX_UI Assignment_Latest Ver..fig`](./ooca%20CI%20for%20UX_UI%20Assignment_Latest%20Ver..fig) *(Import directly into Figma)* — the app follows the **Ideate2 → Main Design** frames
- **OOCA CI source for the design tokens:** [`ooca CI for UX_UI Assignment (Copy).fig`](./ooca%20CI%20for%20UX_UI%20Assignment%20(Copy).fig)
- **Product Brief / Source of Truth:** [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md)

---

## 🌟 The Core Experience Loop
```text
Thought → Voice → Cloud → Sky → Meaning → Look back
```

### Core Design Principle
> **“Don’t ask me to explain my thoughts. Let me put them somewhere first.”**

1. **Low-Friction Voice Input:**  
   *“Say it. Hum it. Sigh it. It doesn’t have to make sense.”*  
   Eliminates the cognitive friction of typing full sentences when feeling overwhelmed.
2. **A thought becomes a cloud:**  
   While the person speaks, the thought is *“Condensing”* (rings pulse out with their voice). Each thought becomes a **Mooca** — one of five cloud characters — keeping the original recording, its length and time.
3. **Ethical AI Assistance (Not Interpretation):**  
   AI suggests a short name (e.g. *“Tomorrow’s presentation”*) and, for voices of 5 seconds or more, sums up what was said in a few plain points — useful for people who talk a lot. It does **NOT** diagnose, predict emotional states, or name an emotion. The name can always be changed and the summary folds away. *(In the prototype the AI is a stand-in with sample answers: `src/utils/aiSummary.js`.)*
4. **The Sky Concept:**  
   - **🕒 Time Sky:** Thoughts laid out by when they happened. A day has six 4-hour skies (Midnight, Dawn, Morning, Afternoon, Sunset, Night) — swipe up/down through them, arrows for the day before/after, a calendar, and **Now**.
   - **☁️ My Sky:** Spaces the user names and styles (e.g. *3AM Thoughts*, *Just wanna vent out!*), plus a **Favorites** sky that gathers every hearted thought.  
   *“The system provides the space. The user defines the meaning.”*
5. **Replay & Reflection:**  
   Tap a thought to listen again — the Mooca talks while its voice plays, and the timeline can be dragged to any moment. Thoughts can be dragged anywhere in their sky; each keeps its own space.
6. **Lock-screen shortcut:**  
   The flow starts where a thought happens: a lock-screen shortcut (*“Leave a thought here?”*) starts recording at once; swipe up opens the sky.

---

## 🛠️ Tech Stack & Engineering Highlights
- **Framework:** React 19 + Vite 8
- **Design:** Figma **Ideate2 → Main Design** (the Latest `.fig`), built on the OOCA design system
- **Screens** (`src/screens/`): Lock screen → Sky (Time Sky / My Sky) → Record → Cloud ready (listen back, AI name + summary, pick a sky) → back to the sky
- **Styling:** Tailwind CSS v4, six time-of-day skies in `src/styles/sky.css` built only from OOCA color tokens
- **Responsive:** full screen at every size — the sky fills the window and thoughts spread into 1–4 staggered columns as it widens; Cloud ready becomes two columns (listen | decide) on large screens; sheets become centred dialogs; a phone turned sideways gets a compact layout. Only the lock screen, a phone idea, sits in a phone frame on larger screens (with “Open on web”)
- **Audio Engine:** `MediaRecorder` capture with a live input level (Web Audio `AnalyserNode`) driving the voice rings, voice saved as a data URL in localStorage, soft synthesized chime when there is no recording
- **Accessibility:** every icon button has a label and a tooltip, keyboard focus rings, modal sheets trap focus, sliders and pagers work with the keyboard, reduced-motion respected
- **Design Tokens:** Generated straight from the OOCA CI `.fig` file (101 colors, 39 EN/TH text styles, 8 elevations, radii, Button variants) — see [Design System parity](#-design-system-parity)
- **Micro-interactions:** the sky falls away into the record screen, a new thought rises into its sky, floating and talking Mooca, cross-fading skies (all disabled under `prefers-reduced-motion`)

### Project structure
```text
src/
  App.jsx          flow + app state (thoughts, skies, where the user is)
  screens/         LockScreen · SkyScreen (sky/TimeSky, sky/MySkies) · RecordScreen · CloudReadyScreen
  components/      UI pieces: CloudField (layout + drag), MoocaCloud, SkyCarousel, RoundButton, Tip, sheets…
  data/            demo content (samples.js) and the Mooca table (moocas.js)
  utils/           recorder / playback hooks, storage, dates, sky periods, motion, AI stand-in
  styles/          generated OOCA tokens + the six sky gradients
  icons/           OOCA DS icons (generated)
```

---

## 🚀 How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Ohmochi408/ooca-assignment.git
cd ooca-assignment

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Lint (ESLint + React Hooks rules)
npm run lint
```

Open [http://localhost:5173](http://localhost:5173) in your browser to experience the interactive prototype.

---

## 🎨 Opening the Figma Design
1. Open [Figma](https://www.figma.com/).
2. On your dashboard / draft page, click **Import file**.
3. Select `ooca CI for UX_UI Assignment_Latest Ver..fig` from this folder to view the design (Ideate2 → Main Design), the OOCA CI components and tokens.

---

## 📐 Design System Parity
The styles are not hand-copied: `scripts/figma-tokens.mjs` decodes the OOCA CI `.fig` file (the `(Copy)` file, which holds the published text styles) and writes `design-tokens/ooca.tokens.json` and `src/styles/ooca-tokens.css` (Tailwind v4 `@theme`, with Tailwind's default palette, font sizes, shadows and radii switched off so only OOCA values exist).

```bash
npm run tokens        # regenerate tokens after the Figma file changes
npm run tokens:check  # Figma → CSS coverage + audit of src/ for off-system values
npm run icons         # re-extract the DS icons used in the app from the Latest .fig (scripts/figma-icons.mjs → src/icons)
```

Icons are the OOCA "Icon/…" components converted to SVG paths — no emoji or third-party icon set (the audit flags both).

With `npm run dev`, open [http://localhost:5173/design-system.html](http://localhost:5173/design-system.html) — every color, text style, elevation, radius and button state is drawn from the generated CSS and marked ✔ when the browser's computed value equals the Figma value.

Fonts: Gotham Rounded is used via `local()` only (licensed, not bundled), falling back to Nunito; Thai glyphs use Prompt (bundled from `@fontsource/prompt`).

---
*Crafted with empathy and craft for OOCA by [Wittawin Archanuparb (Ohm)](https://github.com/Ohmochi408)*
