# QA Checklist (לפני מסירה) — MANDATORY

No lomda ships without passing this. Run top to bottom. Anything unchecked is a blocker.

## Concept & content
- [ ] The concept (metaphor + tone + narrative) holds across **all** modules, not just the intro.
- [ ] Every screen passed Stage-2 editing: shortened, accessible, active.
- [ ] All compliance-locked wording is present and accurate; nothing legally required was paraphrased away.
- [ ] No typos / spacing errors in Hebrew or English; numbers and names verified against source.
- [ ] Reading order makes sense; one idea per screen.

## Interactions
- [ ] Every interaction works by **mouse, touch, and keyboard**.
- [ ] Drag & drop has a keyboard/tap fallback.
- [ ] Feedback (correct/incorrect/consequence) shows on every assessed interaction.
- [ ] Quiz scores correctly; pass threshold and retry policy behave as specified.
- [ ] Progress-gating interactions actually mark complete when finished.

## Navigation & structure
- [ ] Opening screen + navigation map present and functional.
- [ ] Forward/back and module jumps work; locked sequence (if any) enforced.
- [ ] **Forward is gated:** "Next" / next-chapter is disabled until the current block/chapter's required interactions are complete.
- [ ] **Backward is open:** completed chapters can be reopened for review without re-locking.
- [ ] Locked-ahead chapters show a lock indicator and unlock in sequence as prior ones complete.
- [ ] A blocked "Next" surfaces a clear message ("complete the interactions in this chapter") — never a silent dead button; message is announced for screen readers.
- [ ] Each required interaction's completion signal actually registers and unlocks progress (cards flipped, scenario answered, hotspots opened, click-to-continue, quiz submitted).
- [ ] Progress indicator reflects real state.
- [ ] Resume returns the learner to where they left off, preserving unlocked progress.
- [ ] All images and videos load from assets/ and are listed in imsmanifest.xml.

## Responsiveness & display
- [ ] Tested at 360px (mobile), tablet, and desktop widths.
- [ ] No horizontal scroll, no clipped text, no overlapping elements.
- [ ] Images scale; hotspot positions stay correct when resized.
- [ ] RTL (and LTR if bilingual) render cleanly.

## Accessibility (a11y) — target level set at Stage 0; see accessibility-spec.md
- [ ] Logical tab order; visible high-contrast focus on every focusable element.
- [ ] All interactive elements are real buttons/controls with labels (no bare divs).
- [ ] Screen-reader can follow content and interaction state (aria-live on dynamic feedback).
- [ ] Color contrast ≥ 4.5:1 (text) / 3:1 (large + UI); meaning never by color alone (icon/text too).
- [ ] **Drag & drop has a non-drag alternative** (WCAG 2.2 — mandatory).
- [ ] No "click here"; links/buttons describe their action.
- [ ] Narration (if present): play/pause/stop, no autoplay trap, + captions + transcript (+ audio description if needed).
- [ ] Respects prefers-reduced-motion; no essential info in motion only.
- [ ] Passed: automated scan + keyboard-only pass + screen-reader pass + 200%/320px reflow.

## Learning science & multimedia (תורת הלמידה)
- [ ] One idea per screen; content chunked (no wall of text).
- [ ] Effects, animation, and sound serve the content (or were requested) — anything that actively distracts from the point is removed; intentional/atmospheric/requested effects are fine.
- [ ] Key points signaled (headings, bold terms, cues).
- [ ] If narration exists: on-screen text is keywords, not the full script (redundancy principle).
- [ ] Labels sit next to the image part they describe (spatial contiguity); narration synced to visuals (temporal contiguity).
- [ ] Learner controls pace (segmenting); key terms introduced before the process that uses them.

## Microcopy (מיקרו-קופי)
- [ ] Buttons are action-oriented ("בדקי תשובה", not "שלח").
- [ ] Feedback teaches, not judges — wrong answers give a hint + why; right answers reinforce why.
- [ ] Tone empathetic and consistent with the concept's voice.
- [ ] Completion/success messages are specific ("ההתקדמות נשמרה").
- [ ] One term per concept throughout (no מודול/יחידה/פרק mixing).
- [ ] Bilingual microcopy translated for intent and warmth, not literally.

## SCORM / LMS (תלוי לקוח)
- [ ] `imsmanifest.xml` at zip root; every file referenced.
- [ ] Tested on the client's actual LMS (Blossom or other) or SCORM Cloud — not just locally.
- [ ] `lesson_status` posts: incomplete → completed (or passed/failed).
- [ ] `score.raw` posts for assessments.
- [ ] `progress` (suspend_data) saves and restores.
- [ ] `session_time` records; LMSFinish fires on exit.
- [ ] Course launches without console errors.

## Final
- [ ] All source images extracted into assets/ and wired in (no empty hotspots); any missing ones flagged to the client.
- [ ] Single-file *-PREVIEW.html produced and opens correctly for visual check.
- [ ] Package opens on a clean machine / fresh LMS attempt.
- [ ] File naming and version are correct for handoff.
- [ ] Delivered with a short note of what was built and any client decisions made.
