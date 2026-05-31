# watermellie // workspace

A local, zero-build personal + professional dashboard for a Williams-Sonoma UX internship —
**dashboard** (pinnable note canvas + photo + live weather), **work** (a researched 10-day
prep curriculum + journal), and **personal** (tagged daily canvas with a calendar archive).

Pure vanilla HTML/CSS/JS. No build step, no dependencies. Open `index.html` in any browser.

## Files
- `index.html` · `styles.css` · `app.js` — the app
- `curriculum.js` — generated 10-day curriculum content
- `docs/` — WSI ecosystem audit, retail-metrics primer, return-offer playbook
- `research/` — raw research JSON behind the curriculum

## Your data
All notes, lessons, and archives live in your browser's **localStorage** — they are *not* stored
in this repo and do **not** sync between devices automatically. To move data between your laptop,
iPad, and phone, use **Settings → Backup & restore** (export a `.json` on one device, import it on
another). Exported backups are git-ignored so personal notes never get committed.
