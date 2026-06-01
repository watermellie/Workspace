# CLAUDE.md

Guidance for Claude Code (and any AI agent) working in this repository.

## What this is

**watermellie // workspace** — a local, single-page personal + professional dashboard built for a
UX design intern preparing for and working through a Williams-Sonoma, Inc. (WSI) internship
(summer 2026). It is a **zero-build, zero-dependency** static site: three files, opened directly
in a browser. No bundler, no framework, no package manager, no server.

- `index.html` — app shell only (top bar, `#view` mount point, modal, toast). All UI is built in JS.
- `styles.css` — hand-written CSS. Design language: **clean modern Notion-meets-Muji** — mostly
  white/ink, thin hairline borders, soft `4–6px` radius, dot-grid backgrounds, and *sparse* pops of
  red (`--red`), blue (`--blue`), green (`--green`) plus highlighter-yellow (`--yellow`). Single
  font family throughout: **Helvetica** (`--sans`); `--mono` is reserved for the AI-prompt code box
  only — avoid spreading monospace around. Transitions are subtle (`--t` ≈ 140ms, `--ease`); keep
  them understated, not flashy. All tokens are CSS custom properties in `:root`.
- `app.js` — the whole application, one IIFE, no exports/globals (except `window.__applyCurriculum`,
  see below). ES6+, runs directly in the browser.

Supporting folders:
- `docs/` — generated Markdown: the WSI ecosystem/UX audit, retail-metrics primer, return-offer playbook.
- `research/` — raw research artifacts (JSON) backing the curriculum content.

## Running / testing

There is **no build and no test runner**. To run: open `index.html` in a browser (or use the
`/run` skill). To "verify", open it and watch the DevTools console.

> ⚠️ Node is **not installed** in this environment, so `node --check` is unavailable. Validate JS
> by reading + bracket-balance (PowerShell regex count of `{}`/`()`/`[]`) before declaring done.
> Don't claim a syntax check passed when it didn't.

## Architecture (app.js, in order)

The file is organized into numbered sections:

1. **Constants** — `LS_KEY`, `ROLLOVER_HOUR` (3 AM), tag lists, `GYM_CHECKLIST`,
   `JOURNAL_PROMPTS`, `CURRICULUM_BASE` (the WSI track: Day 0 orientation + Days 1–11; Day 9 is User
   Research & Usability Testing; Day 11 is a capstone), and `FINANCE_BASE` (a separate, fully-inline
   financial-literacy track).
2. **Helpers** — `$`/`$$`, `el()` (declarative DOM builder — learn this, it's used everywhere),
   `dKey`/`todayKey`/`logicalDate` (the 3 AM rollover lives here), date math
   (`addDays`/`daysBetween`/`parseKey`), date/time formatters.
3. **Store** + **Plan** — Store is the single source of truth. One `localStorage` key, `wsi_intern_workspace`.
   Debounced writes (`save()`); pass `save(true)` for an immediate flush (used for structural
   changes: spawn, move, archive, delete). Includes a v1→v2 note migration + shape-guards. **All
   persistence goes through Store — never touch `localStorage` directly elsewhere.** `Plan` (section
   2c) layers the time-management model on top: `meta.startDate` (internship day 1, default
   2026-06-10), `meta.lessonDates` (per-lesson schedule), a countdown, and `assign()` which spreads
   unfinished **curriculum-track** lessons across the remaining prep days. A `Timer` module (near
   Pets) is a floating focus/pomodoro pill.
4. **Icons** — inline SVG via `svg(name)` + `iconBtn()`.
5. **Weather** — Open-Meteo (no API key) + BigDataCloud reverse-geocode. Browser geolocation with
   a San-Francisco fallback. Cached in `meta.weather`, refreshed every `WEATHER_TTL` (10 min).
6. **Fmt** — floating format toolbar (bold / highlight / color) for `contenteditable` rich notes,
   via `document.execCommand`.
7. **Note rendering** — rich notes: a `contenteditable` body, optional checklist, pasted images
   with captions. `/todo` typed into a note converts it to a checklist. Images via clipboard paste.
8. **Canvas engine** — shared by Dashboard + Personal. Click empty space to spawn a note; drag
   note headers to reposition (position auto-saves immediately). One `active` context at a time.
9. **Dashboard** — the focus widget (photo + weather + "better days ahead twin" overlay) is itself
   a draggable pinned widget on the canvas, so the **entire page is one pinnable canvas**. Side
   panel = archived notes + date history.
10. **Work hub** — combined feed of lessons + journal entries, with a **track** sort segment
    (all / curriculum / finance / journal) + a prep bar (countdown · pace · "plan my prep").
    Lessons carry a `track` ('curriculum' | 'finance'); builtin lesson ids are **stable**
    (`d{day}` for curriculum, `f-{slug}` for finance) — never array-index (a prepend once shifted
    saved state). Lesson detail = split view with a schedule date + focus-timer launcher, steps
    (each with a ▶ per-step timer), an exercise (label from `exerciseLabel`, defaults to "figma
    exercise"), screenshot+link submission, a self-review rubric (`feedbackCriteria`), and a
    prev/next footer that navigates **within the same track**. Users can add custom lessons (with a
    track picker) + a full structured editor (`editLesson`: objectives, steps, resources, exercise,
    rubric), and journal entries.
11. **Personal** — per-day tagged canvas. `journal` tag is auto-pinned daily (mindful prompt,
    shuffleable). `gym` tag auto-loads a preset checklist. Calendar drawer archives past days.
12. **Modal**, **Friday banner** (in-app Intern-Log nudge, Fri 12–6pm), **Router + boot**.

## State model (one localStorage object)

```
wsi_intern_workspace = {
  version, 
  canvas: { dashboard: {[dateKey]: Note[]}, personal: {[dateKey]: Note[]} },
  work:   { lessons: {[lessonId]: LessonState}, customLessons: Lesson[], entries: JournalEntry[] },
  meta:   { catImage, focusPos:{x,y}, weather, coords },
}
Note = { id, html, checklist:[{id,html,done}]|null, images:[{src,caption}], x, y, tag, timestamp, archived }
```

- **Chronological isolation:** canvas views are keyed by `dateKey`. A new blank page compiles at
  3:00 AM (`logicalDate` shifts pre-3AM timestamps to the previous day). Past dates render
  read-only; today is editable. This is core behavior — preserve it.

## Curriculum content pipeline

`CURRICULUM_BASE` (in `app.js`) holds the WSI track — Day 0 orientation + Days 1–11 — as
titles/concepts/outputs. The rich content (step-by-step plans with time estimates, real YouTube/doc
resources, Figma exercises, feedback criteria, WSI context) for the curriculum.js-backed days lives in **`curriculum.js`**
— an auto-generated file loaded by `index.html` right after `app.js`. It calls
`window.__applyCurriculum(richArray)`, which merges each entry into `CURRICULUM_BASE` **by matching
`day` value** (not array index — so prepending Day 0 was safe). Load order is handled both ways: if
`curriculum.js` runs first it parks data on `window.__pendingCurriculum` and `app.js` drains it at
the end of its IIFE.

Some lessons are authored **fully inline in `app.js`** instead of `curriculum.js`: **Day 0**
(orientation/landscape), **Day 9** (user research & usability testing), and the **entire
`FINANCE_BASE` finance track** (5 lessons). Edit those directly in `CURRICULUM_BASE` / `FINANCE_BASE`.
Day 11 is a capstone (portfolio story + return-offer pitch), not the old "code integration" lesson.
When inserting a WSI lesson, renumber `day` in BOTH `CURRICULUM_BASE` and the matching `curriculum.js`
entries (merge is by `day` value), and keep ids stable for already-saved state.

`curriculum.js` was produced by the `wsi-internship-research` workflow (see `research/research.json`
for the raw source data and `docs/` for the synthesized audit/primer/playbook). To regenerate:
re-run that research, then write the lessons array into `curriculum.js` using the same
`window.__applyCurriculum([...])` (or pending-buffer) contract. Don't hand-edit `curriculum.js` for
content you want to keep — edit the generator or `CURRICULUM_BASE` instead.

`docs/`:
- `ecosystem-audit.md` — WSI + West Elm + Pottery Barn UX teardown, competitive landscape, friction.
- `metrics-primer.md` — retail metrics (CR/AOV/abandonment…) mapped to UX levers, X-Y-Z phrasing.
- `return-offer-playbook.md` — the Friday Intern-Log ritual and how it compounds into a case study.

## Conventions

- Build DOM with `el(tag, props, children)`, not string templates, **except** trusted static
  markup. **Always `esc()` user-derived strings** placed via `html:`. Rich-note bodies are
  intentionally `innerHTML` (user's own content, same-origin, local-only).
- Match the existing terse, lowercase, mono-accented visual voice. Keep radius `≤2px`; accents
  limited to red + yellow + ink greys.
- Keep it dependency-free and build-free. Do not add npm, a framework, or a CDN script without
  asking — it breaks the "open the file and it works" guarantee.
- Per the user's standing request: **prompt them every Friday afternoon to write their Intern Log**
  (raw wins/blockers → X-Y-Z synthesis). The in-app banner covers this; a scheduled reminder may
  also be configured.
