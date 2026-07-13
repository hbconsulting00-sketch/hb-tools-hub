# Narration & Video Scripting (סקריפט נארציה) — the standard

Used whenever a project has narration or instructional video. Built on Michal's preferred script structure. Narration is part of the storyboard (Stage 2), not an afterthought.

## Core structure (מבנה התסריט)
- **Natural work order (סדר עבודה טבעי):** disassemble before assemble (פירוק לפני הרכבה). Show the parts/context before the combined action.
- **Clear separation between stages (הפרדה ברורה בין שלבים):** each step is its own beat; don't blur transitions.
- **Cleaning/reset as its own step (שגרת ניקוי כשלב נפרד):** when a procedure ends, the cleanup/reset is an explicit, separate stage — never tacked on.
- **Safety & documentation cues woven in (דגשי בטיחות ותיעוד):** integrate them at the moment they're relevant, not as a closing dump.

## Voice & writing (קריינות נגישה ופעילה)
- **Accessible and active:** short sentences, present tense, second person, plain language.
- **Precise technical descriptions (תיאורים טכניים מדויקים):** name parts, actions, and quantities exactly — no vague "do the thing".
- Conversational and human (personalization principle) — speaks *to* the learner.
- One action per sentence where possible; the listener should be able to follow hands-free.

## Sync to visuals (Mayer's principles — mandatory)
- **Temporal contiguity:** narration plays *with* the matching visual, never "animation first, explanation later".
- **Modality:** for complex visuals, carry the load in narration; on-screen text stays as keywords.
- **Redundancy:** do **not** narrate the exact words shown on screen verbatim.
- **Signaling:** the narration points attention ("שימי לב ל...") to the part of the visual being shown.

## Format in the storyboard
For each narrated screen, write:
```
[מסך M2-04]
ויזואל: <what's on screen / which animation step>
קריינות: <the spoken text — active, precise, synced to the visual above>
דגש: <safety / documentation cue, if relevant here>
```

## Accessibility pairing (always)
Every narration ships with:
- **Captions** synced to the audio (speaker label + meaningful non-speech sound).
- A **transcript** of the full narration.
- **Audio description** if the visual shows essential info the narration doesn't say.
- Visible **play/pause/stop**; no autoplay trap. (See `accessibility-spec.md`.)

## Quick checklist before recording/finalizing
- [ ] Work order is natural (disassemble → assemble), stages clearly separated.
- [ ] Cleanup/reset is its own explicit step.
- [ ] Safety/documentation cues sit at the right moments.
- [ ] Language is active, present-tense, precise, hands-free-followable.
- [ ] Narration synced to visuals; on-screen text is keywords, not the script.
- [ ] Captions + transcript prepared; audio description where needed.
