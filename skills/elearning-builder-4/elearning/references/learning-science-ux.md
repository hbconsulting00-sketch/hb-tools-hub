# Learning Science, UX & Microcopy (תורת הלמידה, UX ומיקרו-קופי)

The "why" behind every editing and design choice. Apply these throughout — especially Stage 2 (editing), Stage 3 (interactions), and Stage 4 (build).

---

## Part 1 — Cognitive load (עומס קוגניטיבי) — the master principle

Working memory is limited. Every screen either spends that budget on learning or wastes it. Three loads:
- **Intrinsic (מהותי):** the inherent difficulty of the material. Manage by **chunking** — one idea per screen, build complexity gradually.
- **Extraneous (חיצוני):** effort spent on things that don't serve the objective — clutter, hard-to-find navigation, gratuitous effects that distract from the point. Keep this low *by default*. Note: animation, sound, and motion are **not inherently extraneous** — they become extraneous only when they don't support learning. When the user asks for effects/sound, or when they reinforce a learning point (signaling, feedback, atmosphere that fits the concept), they are welcome. Default to restrained; add richness on request.
- **Germane (רלוונטי):** the good effort of actually building understanding. **Maximize** via interactions that make the learner organize and apply (scenarios, drag & drop, sorting).

Rule of thumb: if an element doesn't reduce intrinsic load or increase germane load, it's extraneous — cut it.

## Part 2 — Mayer's multimedia principles (applied to לומדות)

Use these as concrete build rules:

1. **Coherence (קוהרנטיות):** by default, avoid elements that pull attention away from the goal. This is a default, not a ban — animation, sound effects, background audio, and motion are all available and welcome when the user requests them or when they serve the learning (atmosphere matching the concept, signaling, feedback, engagement). Start restrained; enrich on request.
2. **Signaling (סימון):** highlight what matters — headings, bold key terms, arrows/cues to the part of an image being discussed.
3. **Redundancy (יתירות):** don't narrate the *same* text that's on screen word-for-word. Narration + visuals beats narration + identical text. (If narration exists, on-screen text should be keywords, not the full script.)
4. **Spatial contiguity (סמיכות מרחבית):** put labels/text **next to** the image part they describe, not in a caption far away. Critical for hotspots and diagrams.
5. **Temporal contiguity (סמיכות זמנית):** sync narration with the matching visual — don't play animation then explain it afterward.
6. **Modality (מודאליות):** for complex visuals, prefer **narration over on-screen text** — it uses the audio channel and frees the visual channel. (Justifies offering narration as a real option, not decoration.)
7. **Segmenting (פילוח):** let the learner control pace — break content into learner-paced segments with next/continue, not one long autoplay.
8. **Pre-training (הכנה מקדימה):** introduce key terms/components *before* the process that uses them.
9. **Personalization (האנשה):** conversational, second-person tone ("you") beats formal lecturing — ties directly to the "active, human" voice.

When narration/video is in the project, check the build against principles 3–7 explicitly in QA.

## Part 3 — Engagement & retention mechanics

- **Microlearning:** bite-sized segments, each with one clear takeaway. Respects working memory and fits mobile.
- **Active recall over recognition:** make learners retrieve/decide, not just re-read. Scenarios and quizzes > passive screens.
- **Feedback loops:** immediate, specific feedback turns passive content into active learning. Every assessed interaction explains *why*, not just right/wrong.
- **Gamification — gently:** progress indicators, gentle nudges, optional points. Never let game mechanics undercut a serious topic's dignity (harassment, safety).
- **Effects, animation & sound (אפקטים, אנימציה וקול):** these are an available, encouraged part of the toolkit — not something to avoid. The default build is restrained (so it stays fast and accessible), but the user can ask for richer motion, transitions, sound effects, background audio, or narration at any time, and the assistant should add them readily. When added: keep them performant, respect `prefers-reduced-motion`, give audio a mute/stop control, and make sure they reinforce rather than distract. Ask the user about appetite for effects/sound at intake or when relevant, rather than assuming "less is more."
- **Spaced/segmented pacing:** don't front-load everything; distribute and let it breathe.

## Part 4 — UI/UX rules (every lomda)

- **Consistency:** one type system, one button style, one icon family, one color logic across all modules. Inconsistency = added extraneous load.
- **Visual hierarchy:** the eye should know instantly what's primary, secondary, interactive. Size, weight, color, spacing do the work.
- **Mobile-first:** design for 360px first, scale up. Touch targets ≥ 44px. (Mandatory — already in build rules.)
- **Performance:** optimize media; heavy images/video kill load time and the experience. Compress, lazy-load where possible.
- **Accessibility (WCAG):** color contrast ≥ 4.5:1 for text; never rely on color alone to convey meaning (add icon/text); visible focus; keyboard-operable everything; alt text on meaningful images; captions for video.
- **Navigation clarity:** the learner always knows where they are, what's done, and what's next. The nav map (mandatory) serves this.
- **Whitespace:** generous spacing reduces load and increases comprehension. Don't fill every pixel.

## Part 5 — Microcopy (מיקרו-קופי) — the small text that guides

Microcopy = button labels, hints, feedback, empty/loading states, tooltips, confirmations. In a lomda it shows up most at **interaction feedback** and **navigation**. Principles:

- **Clarity first, action-oriented:** buttons describe the action. "התחל מודול" / "Start module", not "אישור" / "OK". "בדקי תשובה" / "Check answer", not "שלח".
- **Be specific:** "נותרו 3 שאלות" beats "כמעט סיימת".
- **Feedback that teaches, not judges:** never "טעית". Instead: explain + guide. ✗ "לא נכון" → ✓ "לא בדיוק — שימי לב ש... נסי שוב." Correct answers reinforce *why*: "נכון! כי...".
- **Empathetic tone, steady voice:** gentle on mistakes; consistent with the concept's voice (a "case file" speaks calmly; never robotic).
- **Reassure at friction:** before a quiz — "אין לחץ, אפשר לחזור ולנסות שוב." On completion — specific success: "סיימת את המודול ✓ — ההתקדמות נשמרה."
- **No dead ends / empty states:** if a section is empty or locked, say why and what unlocks it.
- **Consistency of terms:** pick one word per concept and keep it (don't switch between "יחידה"/"מודול"/"פרק" for the same thing).
- **Bilingual:** microcopy must be translated with the same warmth and intent, not literally. Both languages get the same care.

### Microcopy quick-reference for interactions
| Moment | ✗ Avoid | ✓ Prefer |
|---|---|---|
| Submit answer | "שלח" | "בדקי תשובה" |
| Wrong answer | "טעית / לא נכון" | "לא בדיוק — [רמז]. נסי שוב." |
| Right answer | "נכון" | "נכון! [למה זה נכון]" |
| Next | "המשך" | "למסך הבא" / "למודול הבא" |
| Completion | "סיימת" | "כל הכבוד, סיימת את המודול ✓ ההתקדמות נשמרה." |
| Locked module | (greyed, no text) | "ייפתח אחרי שתסיימי את המודול הקודם." |

---

## How this maps to the workflow
- **Stage 2 (editing):** Parts 1–2 are the *why* behind shorten/accessible/active. Cut extraneous, chunk intrinsic, plan for germane.
- **Stage 3 (interactions):** Part 3 — choose mechanics that drive active recall and feedback.
- **Stage 4 (build):** Parts 4–5 — consistency, hierarchy, a11y, performance, and all microcopy.
- **Stage 6 (QA):** verify multimedia principles (esp. with narration/video), a11y contrast/keyboard, and microcopy tone.
