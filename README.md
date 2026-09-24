# OOCA — Thought Cloud ☁️
> **A 2-minute exploratory mental wellness experience that gives people a low-friction way to put thoughts outside their head using voice.**

Candidate: **Wittawin Archanuparb (Ohm)**  
Role: **UX/UI Product Designer (Design Engineer)**  
Topic: **The 2-Minute Mental Health Experience** (OOCA Assignment)  

---

## 🔗 Project Deliverables
- **GitHub Repository:** [https://github.com/Ohmochi408/ooca-assignment](https://github.com/Ohmochi408/ooca-assignment)
- **Figma Design & CI Source:** [`ooca CI for UX_UI Assignment (Copy).fig`](./ooca%20CI%20for%20UX_UI%20Assignment%20(Copy).fig) *(Import directly into Figma)*
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
2. **Thought Cloud Formation:**  
   The voice morphs into a visual cloud preserving the original recording, duration, and timestamp.
3. **Ethical AI Assistance (Not Interpretation):**  
   AI suggests a short label (e.g. *“Tomorrow’s presentation”*). It does **NOT** diagnose, predict emotional states, or infer mental health disorders. The user remains in full control to edit or leave it unnamed.
4. **The Sky Concept:**  
   - **🕒 Time Sky:** Clouds laid out by when they happened, under a sky that follows the real time of day (Dawn, Morning, Midday, Sunset, Night).
   - **☁️ My Skies:** User-defined semantic spaces (🌙 Tonight, 💼 Work, ♡ People, 🌌 Things I Can’t Say).  
   *“The system provides the space. The user defines the meaning.”*
5. **Replay & Reflection:**  
   Users can tap any cloud to listen to their own voice at that specific moment in time (*“This is what you left here”*).

---

## 🛠️ Tech Stack & Engineering Highlights
- **Framework:** React 19 + Vite 8
- **UX base:** Screen flow and visual language from the Figma Make prototype (`figma-make-export/`), rebuilt on the OOCA design system
- **Screens** (`src/screens/`): Widget → Sky (Time Sky / My Skies) → Record → Cloud created (AI label) → Place → Cloud detail
- **Styling:** Tailwind CSS v4, mobile-first with a phone frame on desktop; five time-of-day skies in `src/styles/sky.css` built only from OOCA color tokens
- **Audio Engine:** `MediaRecorder` capture with a live input-level waveform (Web Audio `AnalyserNode`), voice saved as a data URL in localStorage, soft synthesized chime when there is no recording
- **Design Tokens:** Generated straight from the OOCA CI `.fig` file (101 colors, 39 EN/TH text styles, 8 elevations, radii, Button variants) — see [Design System parity](#-design-system-parity)
- **Micro-interactions:** cloud pop when placed, floating cloud on replay, cross-fading skies (disabled under `prefers-reduced-motion`)

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
```

Open [http://localhost:5173](http://localhost:5173) in your browser to experience the interactive prototype.

---

## 🎨 Opening the Figma Design
1. Open [Figma](https://www.figma.com/).
2. On your dashboard / draft page, click **Import file**.
3. Select `ooca CI for UX_UI Assignment (Copy).fig` from this folder to view all original components, OOCA CI tokens, and layout guidelines.

---

## 📐 Design System Parity
The styles are not hand-copied: `scripts/figma-tokens.mjs` decodes the `.fig` file and writes `design-tokens/ooca.tokens.json` and `src/styles/ooca-tokens.css` (Tailwind v4 `@theme`, with Tailwind's default palette, font sizes, shadows and radii switched off so only OOCA values exist).

```bash
npm run tokens        # regenerate tokens after the Figma file changes
npm run tokens:check  # Figma → CSS coverage + audit of src/ for off-system values
npm run icons         # re-extract the DS icons used in the app (scripts/figma-icons.mjs → src/icons)
```

Icons are the OOCA "Icon/…" components converted to SVG paths — no emoji or third-party icon set (the audit flags both).

With `npm run dev`, open [http://localhost:5173/design-system.html](http://localhost:5173/design-system.html) — every color, text style, elevation, radius and button state is drawn from the generated CSS and marked ✔ when the browser's computed value equals the Figma value.

Fonts: Gotham Rounded is used via `local()` only (licensed, not bundled), falling back to Nunito; Thai glyphs use Prompt (bundled from `@fontsource/prompt`).

---
*Crafted with empathy and craft for OOCA by [Wittawin Archanuparb (Ohm)](https://github.com/Ohmochi408)*
