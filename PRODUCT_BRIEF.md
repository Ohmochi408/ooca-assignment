# OOCA — Thought Cloud

> The original concept brief. The built prototype follows the Figma **Ideate2 → Main Design** screens — see the [README](./README.md) for what it does today (lock-screen shortcut, six-sky Time Sky, My Sky with Favorites, AI name + summary).

### Exploratory Product Concept / UX Design Assignment
**Role:** UX/UI Product Designer (Design Engineer)  
**Topic:** The 2-Minute Mental Health Experience  
**Candidate:** Wittawin Archanuparb (Ohm)  

---

## 1. Concept Overview

**Thought Cloud** is an exploratory mental wellness experience that gives people a low-friction way to put thoughts outside their head using their own voice.

Instead of asking users to explain, categorize, or analyze what they are thinking, the experience lets them **say it first**, turn it into a **Thought Cloud**, and then decide how they want to keep and view it.

### Core Experience Loop
> **Thought → Voice → Cloud → Sky → Meaning → Look back**

The experience is built around the idea that a thought does not always need to be solved or explained immediately. Sometimes, giving it a place is enough to make it easier to look at.

---

## 2. Why This Idea

The concept started from observing a type of user who:
* Has many things on their mind.
* Tends to keep thoughts inside their head rather than externalizing them.
* May repeatedly think about the same things.
* May not know exactly how to explain what they are feeling or thinking.
* May find typing or structured journaling too demanding in the moment.

The initial design question became:
> **“What if people didn't have to explain what's on their mind before they could put it somewhere?”**

This led to voice as the primary input.

Rather than asking:
* *“What are you feeling?”* or *“Please describe your problem.”*

The experience asks:
> **“What's on your mind?”**

And allows the user to speak, hum, sigh, or make a sound without requiring a perfectly structured answer.

---

## 3. Design Hypothesis

### Working Hypothesis
> **When thoughts feel difficult to hold in mind, giving people a low-effort way to externalize them—and a simple way to arrange them themselves—may help them notice their thoughts without requiring them to explain or interpret them.**

The concept does **not** claim that recording a voice treats mental-health conditions, reduces stress, or stops overthinking. The prototype explores whether the interaction itself can create a meaningful moment of externalization and reflection.

---

## 4. Core Design Principle

### “Don’t ask me to explain my thoughts. Let me put them somewhere first.”

The system should reduce the demand placed on the user before asking them to reflect:
* **No required journaling.**
* **No long forms.**
* **No requirement to explain feelings.**
* **No diagnosis or clinical claims.**
* **No system-generated emotional interpretation.**
* **No assumption that every thought needs to be solved.**
* **User decides what their thought means.**

---

## 5. Why Voice?

Voice allows the prototype to explore a more open, zero-cognitive-friction form of expression:
> **You don't have to organize the thought before putting it somewhere.**

The user can:
* Speak in complete sentences, fragments, or rambles.
* Hum, sigh, make sounds, or pause.
* Express something that does not yet make sense.

**Prototype Copy:**
> **What's on your mind?**  
> *Say it. Hum it. Sigh it. It doesn't have to make sense.*

---

## 6. Thought Cloud

After recording, the voice becomes a **Thought Cloud** — the visual representation of something previously held only inside the user's head.

**Contains:**
* Original voice recording (audio)
* Recording timestamp
* Duration
* User-defined label
* Optional AI-suggested label
* Sky space where it was placed

The Cloud does **not** represent a psychological state (e.g., ❌ *"This cloud means you are anxious"*).  
Instead: ☁️ *"Tomorrow's presentation"* — the user decides what that label means.

---

## 7. AI's Role: Assistance, Not Interpretation

### AI Can Help With:
* Transcribing the recording.
* Creating a short summary.
* Suggesting a label/name for the thought (e.g., User says: *"Tomorrow I have to present this thing and still don't know where to start..."* → AI suggests: **"Tomorrow's presentation"**).
* User can edit the label, accept it, or leave it unnamed.

### AI Should NOT:
* Diagnose or infer a mental-health condition.
* Tell the user what emotion they are experiencing.
* Analyze personality or label someone as "overwhelmed" or "depressed".
* Provide unsolicited clinical advice.

> **AI suggests. The user decides what the thought means.**

---

## 8. The Sky Concept

The Sky is the environment where Thought Clouds live — representing the user's way of seeing their thoughts.

### 8.1 Time Sky: “When did this thought exist?”
* Uses the actual creation time of the Thought Cloud.
* Ambient background shifts according to real time (Morning, Noon, Sunset, Dusk, Night).
* Creates a gentle visual timeline without judgment (*“What was on my mind throughout this day?”*).

### 8.2 My Skies: “One Sky = One Meaning Defined by User”
* **🌙 Tonight:** *“Things I want to leave here tonight.”*
* **💼 Work:** *“Things related to my work.”*
* **♡ People:** *“Thoughts about people in my life.”*
* **Custom Skies:** *“Things I Can't Say”*, *“Things I Want to Remember”*, *“Things I Don't Know Yet”*.
* **Philosophy:** The system provides the space. The user defines the meaning.

---

## 9. Core 2-Minute User Flow

```text
Widget / Entry
      ↓
Sky (Ambient Time View)
      ↓
+ Add a thought
      ↓
Voice Recording (Waveform & Micro-copy)
      ↓
Thought Cloud Created
      ↓
AI Suggested Label (Editable / Unnamed)
      ↓
“Where would you like to keep this?”
      ↓
Choose a Sky (Time Sky or My Skies)
      ↓
Cloud placed in Sky
      ↓
Tap Cloud → Replay original voice
```

> **Put it out → Give it a place → Come back to it**

---

## 10. Why Voice Recording Matters After Creation

The voice is not merely an input method; it is part of the artifact itself. Returning later, users can hear:
* **What I said**
* **How I sounded when I said it**

This supports personal reflection without requiring algorithmic emotion analysis.

---

## 11. Deliverable Scope & Technical Strategy

### Deliverables:
1. **Figma File:** OOCA Design System, mooca mascot, high-fidelity responsive screens.
2. **Working Web App:** Interactive Responsive Web Experience featuring real Web Audio recording, visual Thought Clouds, Time/My Skies toggle, and audio replay.
3. **GitHub Repository:** Clean code, documented architecture, and Design Engineer case study.

### Scope Boundaries:
* **Prioritize:** Core 2-minute loop, smooth audio capture, SVG/CSS micro-interactions, responsive mobile-first container.
* **Avoid overbuilding:** Full chatbot, clinical diagnosis, user accounts/database, complex calendar analytics.
