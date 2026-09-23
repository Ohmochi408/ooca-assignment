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
   - **🕒 Time Sky:** A chronological view reflecting real-time ambient lighting (Morning, Day, Sunset, Night).
   - **☁️ My Skies:** User-defined semantic spaces (🌙 Tonight, 💼 Work, ♡ People, 🌌 Things I Can’t Say).  
   *“The system provides the space. The user defines the meaning.”*
5. **Replay & Reflection:**  
   Users can tap any cloud to listen to their own voice at that specific moment in time (*“This is what you left here”*).

---

## 🛠️ Tech Stack & Engineering Highlights
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Glassmorphism + Responsive Mobile-First container
- **Audio Engine:** Web Audio API (`MediaRecorder` for real audio capture + Web Audio API harmonic oscillator fallback)
- **Design Tokens:** Mapped to OOCA Design System (OOCA Turquoise, OOCA Blue, Gotham Rounded / Nunito typography, 48px touch targets)
- **Sensory Polish:** Canvas Confetti particle burst upon sky placement

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
*Crafted with empathy and craft for OOCA by [Wittawin Archanuparb (Ohm)](https://github.com/Ohmochi408)*
