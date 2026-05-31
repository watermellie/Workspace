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
All notes, lessons, and archives live in your browser's **localStorage**. They are *not* stored in
this repo. Two ways to keep them safe / move them between devices:

### 1. Backup & restore (manual, zero setup)
**Settings (⚙) → Backup & restore** → *export a `.json`* on one device, *import* it on another (or
after clearing your browser). Exported backups are git-ignored so personal notes never get committed.

### 2. Cloud sync (automatic, ~5-min one-time setup)
Auto-saves your workspace to a free **Supabase** database so the same data follows you to iPad and
phone. Credentials stay in your browser only — never in this repo.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run:
   ```sql
   create table if not exists workspaces (
     code text primary key,
     data jsonb not null,
     updated_at timestamptz not null default now()
   );
   alter table workspaces enable row level security;
   -- demo-simple policy: anyone with the anon key + a code can read/write that row.
   -- Your privacy comes from keeping the key + code secret and using a long, random code.
   create policy "anon rw" on workspaces for all
     to anon using (true) with check (true);
   ```
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. In the app: **Settings (⚙) → Cloud sync** → paste the URL + anon key, and invent a long random
   **sync code** (e.g. a passphrase — this is your real secret). Click **enable sync**.
5. On your iPad/phone, open the app and enter the **same** URL + key + code. Done — edits sync
   automatically (last edit wins; a colored dot in the top bar shows sync status).

> Security note: the policy above lets anyone who knows your anon key **and** your sync code touch
> that one row. Use a long, unguessable code and don't share it. For a single personal user this is
> fine; it is not multi-user hardened.
