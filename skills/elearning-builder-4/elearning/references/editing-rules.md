# Editing & Rewriting Playbook (עריכה — Stage 2, the critical stage)

Source text is **never** converted straight into an interaction. It first passes through editing. This is where a Word document or a policy becomes learning. Treat this as a real rewriting pass, not a formatting pass.

## The three operations on every passage

### 1. Shorten (קיצור)
- On-screen text is read, not lectured. Cut by 40–70% from most source documents.
- Remove: legalese padding, repetition, throat-clearing intros, "as mentioned above", filler adjectives.
- One idea per screen. If a paragraph holds three ideas, it becomes three beats.
- Prefer a sentence over a paragraph, a phrase over a sentence, a label over a phrase.

### 2. Make accessible (הנגשה)
- Plain language. Short sentences. Active voice.
- Define jargon inline on first use, then use it freely.
- Replace abstract nouns with concrete verbs ("the implementation of reporting" → "report it").
- Numbers and rules as scannable lists, not buried in prose.
- Accessibility also means a11y: text that a screen reader can follow, meaningful order, no "click here".

### 3. Make active (הפיכה לפעיל)
This is what turns content into *interactive* content. Rewrite passive declarations into something the learner does, decides, or discovers.
- "The employee must report harassment to a supervisor" → a scenario: *"A colleague tells you something happened. What do you do?"* with choices and consequences.
- "There are four types of hazard" → a drag & drop that makes the learner sort them.
- "The process has five stages" → a timeline the learner advances through.
- A fact that could be a flip card should be a flip card, not a paragraph.
- Ask of every passage: **what could the learner DO here instead of read?**

## Compliance guardrail (חובה)
- Some passages are legally mandated and must appear verbatim or near-verbatim (regulatory definitions, statutory rights, exact procedures).
- **Flag these** before editing so they are not over-simplified or paraphrased into legal inaccuracy.
- The pattern: present the mandated wording faithfully, then *also* give the active/accessible version around it. Compliance and learning are not in conflict if layered.

## Output of this stage
A screen-by-screen script: for each screen — the edited text, the chosen interaction type (handed to Stage 3), and a flag for any compliance-locked wording. This script is what the build is based on.

## Quick test before moving on
- Could the learner skim each screen in seconds? (shorten)
- Would a newcomer understand every word? (accessible)
- Is the learner doing something, not just reading? (active)
- Is every legally-required phrase intact and flagged? (compliance)

## The science behind this stage
Shortening, accessibility, and active rewriting are not stylistic preferences — they are cognitive load management. See `learning-science-ux.md` (Parts 1–2): cut **extraneous load**, chunk **intrinsic load** (one idea per screen), and design for **germane load** (effort that builds understanding). When narration is planned, apply Mayer's redundancy and modality principles — on-screen text becomes keywords, not the full script.
