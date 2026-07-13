# Interaction Patterns (אינטראקציות) — code-ready specs

Each pattern below: when to use, the content shape it needs, and build notes. All interactions must be keyboard-accessible, mobile-responsive, and report state to the SCORM wrapper where they gate progress.

---

## 1. Flip cards (כרטיסי היפוך)
**Use for:** term/definition, myth/fact, before/after, question/answer.
**Content shape:** pairs (front, back).
**Build notes:** CSS 3D flip on click *and* on Enter/Space (focusable). Front and back both readable by screen reader (aria-live on flip, or both faces in DOM). Track "all cards viewed" for progress.

## 2. Drag & drop (גרור ושחרר)
**Use for:** categorization, matching, sequencing/ordering.
**Content shape:** items + target buckets (or correct order).
**Build notes:** must have a keyboard fallback (select item → select target) — pointer drag alone fails a11y and breaks on mobile. Provide feedback on drop (correct/incorrect) and a check/submit. Report score if assessed.

## 3. Scenarios / branching choices (תרחישים / תרחישי בחירה)
**Use for:** judgment, decision-making, consequences. The backbone of active learning.
**Content shape:** situation → 2–4 choices → consequence per choice → (optional) branch.
**Build notes:** show the outcome of the chosen path, not just "correct/wrong". Allow retry or reflection. This is where edited-to-active content (Stage 2) pays off most.

## 4. Timeline / stages (טיימליין / שלבים)
**Use for:** processes, procedures, chronology, "do this in order".
**Content shape:** ordered steps, each with title + short body + optional image.
**Build notes:** bidirectional navigation (forward/back), current-step indicator, progress fills as learner advances. Mark complete when last step reached.

## 5. Image hotspots (hotspots על תמונה)
**Use for:** equipment, environments, "spot the hazard", anatomy of a thing.
**Content shape:** one image + N positioned markers, each with a popover.
**Build notes:** markers are buttons (focusable, labeled), not bare divs. Popover dismissible by Esc. Positions in % so they survive responsive scaling. Track "all hotspots opened".

## 6. Mixed quiz / assessment (שאלון מערב)
**Use for:** knowledge check, gating, scored assessment.
**Content shape:** mixed question types — single choice, multiple choice, true/false, match.
**Build notes:** randomize order optionally, immediate or end feedback (decide per client), pass threshold, report **score** to SCORM. Show result screen with retry policy.

## 7. Accordion / progressive reveal (אקורדיון / חשיפה הדרגתית)
**Use for:** dense reference content, FAQs, drill-down where not everything is needed at once.
**Content shape:** sections, each header + collapsible body.
**Build notes:** headers are buttons with aria-expanded; one-open or many-open mode. Good for the compliance-locked text that must be present but shouldn't dominate the screen.

---

## Choosing the right interaction
Map from the **edited script** (Stage 2), not from the raw source:
- A fact pair → flip card.
- "Sort / categorize / order these" → drag & drop.
- A judgment call → scenario.
- A sequence of steps → timeline.
- A visual to explore → hotspots.
- A rule-heavy reference block → accordion.
- A check for understanding → quiz.

Don't over-interact: not every screen needs a mechanic. A clean, well-edited content screen is fine between interactions. Pace it.

## Feedback & microcopy in interactions
Every assessed interaction must give feedback that **teaches, not judges** — explain *why*, never just "wrong". Button and state text follows the microcopy rules in `learning-science-ux.md` (Part 5): action-oriented labels ("בדקי תשובה" not "שלח"), empathetic tone on mistakes, specific success messages. Interactions drive **active recall** (Part 3) — that's their pedagogical purpose, not decoration.

### Retry, explanatory feedback & answer reveal (required for ALL assessed interactions)
This principle applies to **every interaction type that can be answered right or wrong** — drag & drop, scenarios, quizzes, sequencing, matching, hotspot-identification, and any future assessed type. (Interactions with no wrong state — flip cards, accordions, "click to read" — gate simply on being viewed/opened, and naturally need no retry.) A learner who makes a mistake must always have a clear way to recover; never leave them stuck having answered wrong with no path forward. Each assessed interaction must provide:
- **A reset / "try again" control** that appears once a wrong attempt is made. It must be **smart: return only the *incorrect* items to the starting pool and keep the correct ones in place** — never wipe out work the learner already got right. (For single-answer interactions like a scenario step or quiz item, "try again" simply re-enables selection.)
- **Explanatory feedback on every wrong answer** — not just "incorrect". Name *what* is wrong and point toward the reasoning ("3 items are misplaced: X, Y, Z — think about how each one ranks"). For scenarios and quizzes, each wrong choice explains why it's wrong; quizzes show an answer review naming the correct answer (and why) for every missed question.
- **Answer reveal after repeated attempts** — after **3 wrong tries** (not 2), offer to reveal/highlight the correct answer (a "Show correct answer" control for drag & drop; highlighting the correct choice in a scenario) so the learner is never permanently blocked. Revealing still lets them see the right answer and continue.
- **Gating counts only correct completion.** A wrong answer must **not** satisfy a gate. Forward-unlock happens only when the interaction is actually solved (or the correct answer was revealed and acknowledged) — never on merely *attempting* it. (Real bug source: answering a scenario step wrongly must not count as "done".)

## Progress gating & locked navigation (נעילת התקדמות — required behavior)
Learners must not be able to skip past required interactions. The lomda enforces completion, both within a chapter and between chapters.

### Forward locked, backward open (קדימה נעול, אחורה פתוח)
- **Forward is gated:** the learner cannot advance to the next block or the next chapter until the required interactions of the current one are completed. The "Next" / "next chapter" control is **disabled** until then.
- **Backward is always open:** any chapter the learner has already completed can be reopened freely — for review, with no re-gating. Navigation never traps; it only prevents *skipping ahead*.
- The navigation map reflects this: completed chapters are open and revisitable; the current chapter is available; chapters ahead of the furthest-unlocked point are locked (shown with a lock indicator), and unlock in sequence as each prior chapter is completed.

### Two levels of gating
1. **Within a chapter (block → block):** if a block contains a required interaction (a card set that must all be viewed, a drag&drop that must be solved, a scenario that must be answered, a hotspot set that must all be opened, a "click to read/continue" action), the next block / the chapter's "complete" control stays disabled until that interaction registers completion.
2. **Between chapters (chapter → chapter):** a chapter is only marked complete once all its required interactions are done. The next chapter unlocks only when the current one is complete.

### Required vs. optional interactions
- Mark each interaction in the storyboard as **required** (gates progress) or **optional** (enriches, doesn't block). Not everything must gate — pace it — but anything essential to the learning objective should be required.
- **"View-all" interactions gate too.** A required flip-card set, accordion, or hotspot group blocks forward progress *exactly like* an answered drag&drop or scenario: the learner must open/flip/visit **every** item before the chapter unlocks. Show per-item progress as the learner goes (e.g. a ✓ on each card once flipped, each accordion panel once opened) so they can see what's left, and don't unlock until the count is complete.
- Each required interaction must expose a clear **completion signal** the engine can track:
  - flip cards → all cards flipped at least once (each shows ✓ when done)
  - accordion → all required panels opened (each shows ✓ when opened)
  - drag & drop → placed correctly (solved)
  - scenario → the correct choice made on each step
  - hotspots → all hotspots opened
  - "click to read / acknowledge / continue" → the explicit action taken
  - quiz → submitted (and passed, where it gates)
- Persist completion in `suspend_data` so a returning learner keeps their unlocked progress (see `scorm-structure.md`).

### The blocked-button message (הודעת חסימה — required)
When the learner hasn't finished the required interactions, the forward control must clearly **look locked** and must not advance. "Clean" here means **no text clutter** — don't write the destination chapter's name on the button, don't put a "finish the required interactions" note under it, and don't stamp a "required" badge on the interactions. But the button absolutely **should carry visual state**: a locked/disabled look (dimmed or greyed, e.g. via `aria-disabled`), a lock affordance and/or the arrow, hover/shimmer/animation — all of that is welcome. The locked state is the primary signal that there's something left to do. When the learner taps the still-locked control, also surface a **floating toast/message** explaining what's left — e.g. *"כדי להמשיך, יש להשלים את האינטראקציות בפרק הזה."* / "To continue, complete the interactions in this chapter," pointing to specifics where possible ("2 of 4 cards still to review"). Once all required interactions register complete, the button **visibly changes to its active/colored state** and advances normally. Tone of the message follows the microcopy rules — guiding, not scolding.

### Prev/Next navigation buttons (כפתורי ניווט — arrows, not labels)
The footer prev/next controls should be **arrows only** (← →), not the destination chapter's title. Long titles overflow and clutter small screens. The destination is still discoverable via the persistent chapter menu (which shows the current chapter) and the full nav map, and via a descriptive `aria-label` on each arrow (e.g. "Next: Hierarchy of Safety Controls") so screen-reader users still hear where it goes.

### Accessibility of gating
- The floating message is announced (e.g. `aria-live="polite"`/`role="status"`) so screen-reader and keyboard users learn why they can't proceed yet — never a silent failure. The button stays a real, focusable control (clicking it triggers the announced message rather than navigating).
- Keep the completion requirement achievable by keyboard and touch (ties to the drag&drop keyboard fallback).
