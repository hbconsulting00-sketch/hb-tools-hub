# Storyboard Template (תבנית storyboard) — the Stage 2 output

Every project produces a storyboard in this fixed format before any build. It is the single source of truth the build follows, and what the user approves. One row per screen.

## The fields (per screen)

| Field | What goes here |
|---|---|
| **# מסך** | Screen number / ID (e.g. M1-03 = module 1, screen 3). |
| **מודול** | Which module/section. |
| **כותרת** | Screen title (learner-facing). |
| **טקסט ערוך** | The final on-screen text — already shortened, accessible, active (Track A). In Track B: the client's text as-is, only segmented. |
| **סוג אינטראקציה** | flip cards / drag & drop / scenario / timeline / hotspots / quiz / accordion / content-only. |
| **תוכן האינטראקציה** | The actual items: card pairs, drag items + buckets, scenario choices + consequences, quiz Q+answers, hotspot points, etc. |
| **נארציה** | Narration text for this screen, if any (script per `narration-script.md`). Keywords on screen, full text in narration (modality principle). |
| **ויזואל / מדיה** | Image/video needed + its `assets/` path (use a placeholder path even before the file arrives). Note alt text. |
| **דגל תאימות** | ⚖️ if any wording here is compliance-locked and must not be over-edited. |
| **מעקב SCORM** | What this screen reports: viewed / completed / scored (+ points). |
| **נעילה (gating)** | Is the interaction **required** (gates forward progress) or **optional**? If required, the completion signal that unlocks "Next" (e.g. all cards flipped, scenario answered, all hotspots opened, click-to-continue). |
| **הערות נגישות** | Anything screen-specific: drag alternative, contrast note, caption needed, focus order. |

## Markdown table form (copy-paste skeleton)

```
| # מסך | מודול | כותרת | טקסט ערוך | סוג אינטראקציה | תוכן האינטראקציה | נארציה | ויזואל / מדיה (assets/path + alt) | דגל תאימות | מעקב SCORM | הערות נגישות |
|---|---|---|---|---|---|---|---|---|---|---|
| M1-01 | פתיחה | ... | ... | content-only | — | ... | assets/images/intro.jpg — "תיאור" | | viewed | — |
| M1-02 | ... | ... | ... | scenario | בחירה א'/ב'/ג' + תוצאה לכל אחת | ... | — | ⚖️ | scored (10) | משוב ב-aria-live |
```

## Rules
- **One idea per screen** — if a row is overloaded, split it into two screens.
- **Pacing:** don't make every screen an interaction; interleave content-only screens. Aim for a rhythm.
- **Compliance flags first:** mark ⚖️ rows before editing so locked wording survives.
- **Media paths up front:** fill the `assets/` path even with placeholders, so build = swap files.
- **Narration vs. on-screen text:** never duplicate verbatim — on screen = keywords, narration = full (redundancy/modality principles).
- The **opening screen + navigation map** and the **completion/score screen** are always rows in the storyboard.

## Approval gate
Present the full storyboard to the user. Do not start building until it's approved. Changes are cheap here and expensive after build.
