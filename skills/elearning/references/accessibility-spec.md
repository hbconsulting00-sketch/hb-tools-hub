# Accessibility Spec (נגישות) — a design input, not an end-of-line audit

Set the target level at **Stage 0** and build to it from the first screen. WCAG treated as a design input produces a structurally sound course; treated as a final audit, it produces costly rework. Default target: **WCAG 2.1 AA**, or **2.2 AA** if the client requires.

## The POUR framework (מסגרת POUR)
Every screen must be:
- **Perceivable (ניתן לתפיסה):** text alternatives, captions, contrast, not color-alone.
- **Operable (ניתן להפעלה):** keyboard for everything, no traps, enough time, visible focus.
- **Understandable (ניתן להבנה):** plain language, predictable behavior, helpful errors.
- **Robust (יציב):** works with screen readers and assistive tech; valid, semantic markup.

## Concrete requirements per area

### Visual
- Text contrast ≥ **4.5:1** (normal), ≥ **3:1** (large text and UI components).
- **Never color alone** to convey meaning — pair with icon, text, or pattern (e.g. correct/incorrect shows ✓/✗ + words, not just green/red).
- Real text, not text baked into images. Resizable to 200% without breaking layout.
- Respect `prefers-reduced-motion` — offer a reduced-motion path; no essential info in motion only.

### Keyboard & motor
- Every interactive element reachable and operable by keyboard (Tab/Shift-Tab/Enter/Space/arrows).
- **Visible, high-contrast focus indicator** on every focusable element (WCAG 2.2 strengthened this).
- **Drag & drop must have a non-drag alternative** (WCAG 2.2, 2.5.7) — click/tap-to-place or select-then-target. This is mandatory, not optional, for any drag interaction.
- Touch targets ≥ 44×44px.
- No keyboard traps; logical, predictable tab order matching visual order.

### Auditory (narration / video)
- **Captions** synchronized with audio, including speaker labels and meaningful non-speech sound.
- **Transcript** available for audio/video.
- **Audio description** when visuals carry essential information the narration doesn't state.
- Narration has visible **play/pause/stop** and never autoplay-traps the learner.

### Cognitive
- One idea per screen; consistent, predictable navigation and layout.
- Plain language; define terms; learner controls pace.
- Clear, specific error/feedback messages (ties to microcopy in `learning-science-ux.md`).
- Skip-to-content link; logical heading hierarchy (one H1, nested H2/H3).

### Structure / robustness (screen reader)
- Semantic HTML: real `<button>`, `<nav>`, headings, lists — never clickable bare `<div>`.
- `lang` attribute set (and switched on language toggle for bilingual).
- ARIA only where semantics fall short; `aria-live` for dynamic feedback; `aria-expanded` on accordions; labeled controls.
- Meaningful `alt` text on informative images; `alt=""` on decorative ones.

## Testing workflow (blended)
1. **Automated scan** (axe / Lighthouse) — catches contrast, missing labels, structure.
2. **Keyboard-only pass** — unplug the mouse; complete the whole lomda.
3. **Screen-reader pass** — NVDA/VoiceOver; confirm content and interaction state are announced.
4. **Zoom/reflow** — 200% and 320px width; nothing lost or clipped.
Automated tools catch ~30–40%; the manual passes catch the rest. Both are required.

## Maps to the workflow
- **Stage 0:** set the level, make it a design input.
- **Stages 2–4:** build to it (semantic markup, contrast, keyboard, drag alternatives, captions).
- **Stage 6:** the QA a11y section verifies it — but if built right, that's refinement, not rescue.
