/* ============================================================
   watermellie // workspace  —  app.js
   Vanilla ES6+ SPA · hash routing · localStorage single source.
   Routes:  #dashboard   #work[/lesson/<id>|/journal/<id>]   #personal
   ============================================================ */

(() => {
  'use strict';

  /* ==========================================================
     0 · Constants
     ========================================================== */
  const LS_KEY = 'wsi_intern_workspace';
  const ROLLOVER_HOUR = 3;                 // canvases compile fresh at 3:00 AM
  const PERSONAL_TAGS = ['gym', 'journal', 'breakfast', 'lunch', 'dinner', 'snack'];
  const GYM_CHECKLIST = ['stairmaster', 'treadmill', 'arm workout', 'core', 'glutes', 'legs'];
  const SF = { lat: 37.7749, lon: -122.4194, city: 'san francisco' };
  const WEATHER_TTL = 10 * 60 * 1000;      // refresh weather every 10 min

  const JOURNAL_PROMPTS = [
    'how are you feeling today?',
    'anything on your mind?',
    'any progress on personal projects?',
    'what are you focusing on today?',
    "what's one thing you're grateful for right now?",
    'what drained you today, and what restored you?',
    'what would make today feel meaningful?',
    'where did you grow this week?',
    'what are you avoiding, and why?',
    "what's a small win you can acknowledge?",
    'who or what are you thankful for today?',
    'what does your future self need you to do right now?',
    'what is within your control today, and what isn’t?',
    'what gave you a sense of purpose recently?',
  ];

  const CURRICULUM_BASE = [
    { day:1, week:1, title:'Brand Deconstruction & The Phygital Experience',
      coreConcept:'Understand the distinct brand identities and spatial footprints of WSI vs its competitors.',
      output:'A 3-slide comparative teardown deck mapping store atmosphere to web UI tone for WSI’s core three brands.' },
    { day:2, week:1, title:'Advanced AI Prompt Engineering & WSI Context',
      coreConcept:'Move from AI as a search tool to AI as a collaborative design co-pilot.',
      output:'A personalized Prompt Library markdown file with 5 specialized prompts for retail UX ideation & synthesis.' },
    { day:3, week:1, title:'Conversational UI & Deconstructing “Olive”',
      coreConcept:'Map user experience within conversational agents.',
      output:'A user-flow diagram of ideal vs failed conversation loops for an AI culinary assistant.' },
    { day:4, week:1, title:'High-Ticket Checkout & Cart Mechanics',
      coreConcept:'Audit the multi-brand unified cart (buy West Elm + Williams Sonoma in one checkout).',
      output:'2 clear UX micro-frictions in the multi-brand checkout flow + wireframe alternatives.' },
    { day:5, week:1, title:'Figma Component Systems & Design System Operations',
      coreConcept:'Design for scale using rigid, tokenized design systems.',
      output:'A Figma file demonstrating auto-layout 5.0 and component variables (a tokenized product card).' },
    { day:6, week:2, title:'Cross-Brand Navigation Systems',
      coreConcept:'Design a global header that anchors multiple distinct retail brands under one umbrella.',
      output:'A hi-fi UI redesign of the WSI cross-brand navigation bar optimized for mobile web.' },
    { day:7, week:2, title:'Design Services 3.0 & AR Space Planning',
      coreConcept:'Design interfaces that bridge the physical home with digital spatial-planning tools.',
      output:'A wireframed dashboard where a customer’s style profile is pre-synthesized by an AI agent.' },
    { day:8, week:2, title:'Data-Driven Design & The Metrics Workshop',
      coreConcept:'Translate user pain points into quantifiable business problems.',
      output:'A reusable performance-focused design brief template (ties changes to CR / AOV / abandonment).' },
    { day:9, week:2, title:'The Final Pitch Prep & Portfolio Scaffolding',
      coreConcept:'Set up your documentation framework before day one.',
      output:'An empty, ready-to-fill case-study layout (Problem, Research, Constraints, Iterations, Metrics).' },
    { day:10, week:2, title:'Interface Compilation & Code Integration',
      coreConcept:'Integrate habits, prep tracking, and summer logs into your local dev environment.',
      output:'A live, functional internal tracking interface (this workspace) pushed to GitHub.' },
  ];

  /* ==========================================================
     1 · Helpers
     ========================================================== */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
    }
    (Array.isArray(kids) ? kids : [kids]).forEach(c => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
    return n;
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function logicalDate(d = new Date()) {
    const x = new Date(d);
    if (x.getHours() < ROLLOVER_HOUR) x.setDate(x.getDate() - 1);
    return x;
  }
  const dKey = (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  };
  const todayKey = () => dKey(logicalDate());

  const ORD = (n) => { const s=['th','st','nd','rd'], v=n%100; return n + (s[(v-20)%10] || s[v] || s[0]); };
  const DOW  = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const DOWS = ['s','m','t','w','t','f','s'];
  const MON  = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const prettyDate = (d = logicalDate()) => `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${ORD(d.getDate())}, ${d.getFullYear()}`;
  const prettyTime = (d = new Date()) => {
    let h = d.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    const p = (x) => String(x).padStart(2, '0');
    return `${h}:${p(d.getMinutes())}:${p(d.getSeconds())} ${ap}`;
  };

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1900);
  }

  /* small popover anchored under a button */
  function popover(anchor, items) {
    $('.popover')?.remove();
    const r = anchor.getBoundingClientRect();
    const pop = el('div', { class:'popover', style:`top:${r.bottom + window.scrollY + 6}px; left:${Math.max(8, r.right + window.scrollX - 172)}px` });
    items.forEach(it => pop.append(el('button', { html: svg(it.icon) + esc(it.label), onclick: () => { pop.remove(); it.onClick(); } })));
    document.body.append(pop);
    const off = (e) => { if (!pop.contains(e.target) && e.target !== anchor) { pop.remove(); document.removeEventListener('mousedown', off); } };
    setTimeout(() => document.addEventListener('mousedown', off), 0);
  }

  /* ==========================================================
     2 · Store (single source of truth + debounced persistence)
     ========================================================== */
  const Store = (() => {
    const blank = {
      version: 2,
      canvas: { dashboard: {}, personal: {} },     // { [dateKey]: [note] }
      doodles: { dashboard: {}, personal: {} },    // { [dateKey]: [stroke] }
      stickers: { dashboard: {}, personal: {} },   // { [dateKey]: [sticker] }
      work: { lessons: {}, customLessons: [], entries: [] },
      meta: {
        catImage: '', focusPos: { x: 26, y: 20 }, weather: null, coords: null,
        recurring: ['gym', 'breakfast', 'lunch', 'dinner'], mealsSeeded: true,
        mood: {}, delight: true, collected: [], digestPos: null,
        calPos: null, calUrl: '',
        name: 'neli', nicknames: ['dani', 'dania', 'neli', 'nellie'],
        theme: 'cream', accent: '',
        pets: [
          { id: 'cat', emoji: '🐱', name: 'mochi', on: true },
          { id: 'bun', emoji: '🐰', name: 'pancake', on: false },
          { id: 'mel', emoji: '🍉', name: 'melly', on: false },
          { id: 'duck', emoji: '🐥', name: 'pip', on: false },
        ],
        affirmations: [], affirmVibe: ['gentle', 'hype'],
      },
    };

    /* shape-guard ANY payload (fresh / localStorage / synced / imported) so older
       or partial data never crashes newer code. Run on load AND in replaceAll(). */
    function guard(d) {
      d = d || structuredClone(blank);
      d.canvas ||= {}; d.canvas.dashboard ||= {}; d.canvas.personal ||= {};
      d.doodles ||= {}; d.doodles.dashboard ||= {}; d.doodles.personal ||= {};
      d.stickers ||= {}; d.stickers.dashboard ||= {}; d.stickers.personal ||= {};
      d.work ||= {}; d.work.lessons ||= {}; d.work.customLessons ||= []; d.work.entries ||= [];
      d.meta ||= {}; d.meta.focusPos ||= { x: 26, y: 20 };
      if (!('catImage' in d.meta)) d.meta.catImage = '';
      if (!Array.isArray(d.meta.recurring)) d.meta.recurring = ['gym', 'breakfast', 'lunch', 'dinner'];
      // one-time: fold breakfast/lunch/dinner into existing users' recurring set
      if (!d.meta.mealsSeeded) { d.meta.recurring = [...new Set([...d.meta.recurring, 'breakfast', 'lunch', 'dinner'])]; d.meta.mealsSeeded = true; }
      d.meta.mood ||= {};
      if (d.meta.delight === undefined) d.meta.delight = true;
      if (!Array.isArray(d.meta.collected)) d.meta.collected = [];
      d.meta.digestPos ||= null;
      d.meta.calPos ||= null;
      if (typeof d.meta.calUrl !== 'string') d.meta.calUrl = '';
      // personalization
      d.meta.name ||= 'neli';
      if (!Array.isArray(d.meta.nicknames) || !d.meta.nicknames.length) d.meta.nicknames = ['dani', 'dania', 'neli', 'nellie'];
      d.meta.theme ||= 'cream';
      if (typeof d.meta.accent !== 'string') d.meta.accent = '';
      if (!Array.isArray(d.meta.pets) || !d.meta.pets.length) d.meta.pets = structuredClone(blank.meta.pets);
      if (!Array.isArray(d.meta.affirmations)) d.meta.affirmations = [];
      if (!Array.isArray(d.meta.affirmVibe)) d.meta.affirmVibe = ['gentle', 'hype'];
      for (const view of ['dashboard', 'personal']) {
        for (const k of Object.keys(d.canvas[view])) {
          d.canvas[view][k] = (d.canvas[view][k] || []).map(normalizeNote);
        }
      }
      // dashboard notes now live under a fixed 'board' key (no daily reset);
      // fold any older date-keyed dashboard notes into it once.
      const board = d.canvas.dashboard;
      board.board ||= [];
      for (const k of Object.keys(board)) {
        if (k === 'board' || !/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
        board.board.push(...board[k]);
        delete board[k];
      }
      // same fold for dashboard doodles + stickers
      for (const bucket of [d.doodles.dashboard, d.stickers.dashboard]) {
        bucket.board ||= [];
        for (const k of Object.keys(bucket)) {
          if (k === 'board' || !/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
          bucket.board.push(...bucket[k]); delete bucket[k];
        }
      }
      return d;
    }

    let data;
    try { data = JSON.parse(localStorage.getItem(LS_KEY)) || structuredClone(blank); }
    catch { data = structuredClone(blank); }
    data = guard(data);

    function normalizeNote(n) {
      return {
        id: n.id || uid(),
        html: n.html != null ? n.html : (n.text ? esc(n.text).replace(/\n/g, '<br>') : ''),
        checklist: Array.isArray(n.checklist) ? n.checklist : null,
        images: Array.isArray(n.images) ? n.images : [],
        doodle: Array.isArray(n.doodle) ? n.doodle : [],   // pen strokes drawn on this note
        x: n.x ?? 40, y: n.y ?? 40,
        w: n.w ?? null, h: n.h ?? null,        // null = auto-size
        tag: n.tag ?? null,
        timestamp: n.timestamp || Date.now(),
        archived: !!n.archived,
      };
    }

    let timer, afterSave = null;
    const flush = () => {
      data.meta.updatedAt = Date.now();
      try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { console.error(e); toast('storage full — could not save'); }
      try { afterSave && afterSave(); } catch (e) { console.error(e); }
    };
    const save = (immediate = false) => {
      if (immediate) { clearTimeout(timer); flush(); return; }
      clearTimeout(timer); timer = setTimeout(flush, 300);
    };

    return {
      get: () => data, save, normalizeNote,
      onSave(fn) { afterSave = fn; },
      replaceAll(next) { data = guard(next); localStorage.setItem(LS_KEY, JSON.stringify(data)); },
      notes(view, key) { return (data.canvas[view][key] ||= []); },
      doodles(view, key) { return (data.doodles[view][key] ||= []); },
      stickers(view, key) { return (data.stickers[view][key] ||= []); },
      datesWithNotes(view) {
        return Object.keys(data.canvas[view]).filter(k => (data.canvas[view][k] || []).length).sort((a,b) => b.localeCompare(a));
      },
      lesson(id) { return (data.work.lessons[id] ||= { stepsDone:{}, notes:'', shots:[], figmaLink:'', reflect:'', criteria:{}, submitted:false, complete:false, completedAt:null }); },
    };
  })();

  /* ==========================================================
     2b · Cloud sync (optional, bring-your-own Supabase)
     ---------------------------------------------------------
     Credentials live ONLY in this browser's localStorage —
     never in the repo. Every device that enters the same
     url + key + code shares one workspace row. Last write wins.
     ========================================================== */
  const Sync = (() => {
    const CFG_KEY = 'wsi_sync_config';
    let cfg = (() => { try { return JSON.parse(localStorage.getItem(CFG_KEY)) || null; } catch { return null; } })();
    let pushTimer = null, status = 'idle', lastError = '', dirty = false, autopush = (cfg ? cfg.autopush !== false : true);

    const enabled = () => !!(cfg && cfg.url && cfg.key && cfg.code);
    const get = () => cfg;
    const isAuto = () => autopush;
    function set(next) {
      cfg = next && next.url ? { url: next.url.replace(/\/+$/, ''), key: next.key.trim(), code: next.code.trim(), autopush } : null;
      if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      else localStorage.removeItem(CFG_KEY);
    }
    function setAuto(on) { autopush = !!on; if (cfg) { cfg.autopush = autopush; localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } updateBtn(); }
    const endpoint = () => `${cfg.url}/rest/v1/workspaces`;
    const headers = () => ({ 'apikey': cfg.key, 'Authorization': `Bearer ${cfg.key}`, 'Content-Type': 'application/json' });

    async function push() {
      if (!enabled()) return;
      status = 'syncing'; updateBtn();
      try {
        const body = [{ code: cfg.code, data: Store.get(), updated_at: new Date(Store.get().meta.updatedAt || Date.now()).toISOString() }];
        const r = await fetch(`${endpoint()}?on_conflict=code`, {
          method: 'POST',
          headers: { ...headers(), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(`push ${r.status}: ${(await r.text()).slice(0,120)}`);
        status = 'ok'; lastError = ''; dirty = false;
      } catch (e) { status = 'error'; lastError = e.message; console.error('sync push', e); }
      updateBtn();
    }
    async function pull() {
      if (!enabled()) return null;
      status = 'syncing'; updateBtn();
      try {
        const r = await fetch(`${endpoint()}?code=eq.${encodeURIComponent(cfg.code)}&select=data,updated_at`, { headers: headers() });
        if (!r.ok) throw new Error(`pull ${r.status}: ${(await r.text()).slice(0,120)}`);
        const rows = await r.json();
        status = 'ok'; lastError = ''; updateBtn();
        return rows && rows[0] ? rows[0] : null;
      } catch (e) { status = 'error'; lastError = e.message; console.error('sync pull', e); updateBtn(); return null; }
    }

    /* manual "save to cloud" — what the corner button does */
    async function pushNow() {
      if (!enabled()) { toast('cloud sync is off — set it up in settings'); return; }
      await push();
      toast(status === 'ok' ? 'saved to cloud ✓' : `save failed: ${lastError}`);
    }

    /* on load: if another device saved newer changes while this one was idle,
       WARN once and let the user choose — don't silently overwrite either side. */
    async function syncOnLoad() {
      if (!enabled()) return;
      const remote = await pull();
      if (!remote || !remote.data) { push(); return; }              // cloud empty → seed it
      const localTs = Store.get().meta.updatedAt || 0;
      const remoteTs = remote.data.meta?.updatedAt || Date.parse(remote.updated_at) || 0;
      if (remoteTs > localTs + 1500) warnStale(remote, remoteTs, localTs);  // this device is behind
      else if (localTs > remoteTs + 1500) { if (autopush) push(); else { dirty = true; updateBtn(); } }
    }

    function warnStale(remote, remoteTs, localTs) {
      $('#sync-warn')?.remove();
      const ago = (ts) => { const m = Math.round((Date.now()-ts)/60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m/60)} hr ago`; };
      const bar = el('div', { id:'sync-warn' }, [
        el('span', { html: `☁️ <b>Another device has newer changes</b> (cloud saved ${ago(remoteTs)}; this device ${localTs?('last edited '+ago(localTs)):'has no local edits'}).` }),
        el('div', { class:'sw-actions' }, [
          el('button', { class:'btn primary sm', text:'load latest', onclick: () => { Store.replaceAll(remote.data); toast('loaded latest from cloud'); bar.remove(); render(); } }),
          el('button', { class:'btn ghost sm', text:'keep this device', onclick: () => { bar.remove(); push(); toast('kept this device — uploaded to cloud'); } }),
        ]),
      ]);
      document.body.append(bar);
    }

    function markDirty() {
      if (!enabled()) return;
      dirty = true; updateBtn();
      if (autopush) { clearTimeout(pushTimer); pushTimer = setTimeout(push, 2500); }
    }

    /* the corner cloud button reflects state: synced / unsaved / syncing / error */
    function updateBtn() {
      const b = $('#sync-btn'); if (!b) return;
      b.hidden = !enabled();
      const state = !enabled() ? 'off' : status === 'syncing' ? 'syncing' : status === 'error' ? 'error' : dirty ? 'dirty' : 'ok';
      b.dataset.status = state;
      b.title = state === 'error' ? `sync error: ${lastError} — tap to retry`
        : state === 'syncing' ? 'saving…'
        : state === 'dirty' ? 'unsaved changes — tap to save to cloud'
        : 'saved to cloud — tap to save now';
      b.innerHTML = svg('cloud') + '<span class="sync-dot"></span>';
    }

    return { enabled, get, set, isAuto, setAuto, push, pull, pushNow, syncOnLoad, markDirty, updateBtn,
      get status() { return status; }, get lastError() { return lastError; }, get dirty() { return dirty; } };
  })();

  /* ==========================================================
     3 · Icons
     ========================================================== */
  function svg(name) {
    const P = {
      archive:'<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>',
      x:'<path d="M18 6 6 18M6 6l12 12"/>',
      restore:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"/>',
      check:'<path d="M20 6 9 17l-5-5"/>',
      checklist:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
      chevL:'<path d="m15 18-6-6 6-6"/>', chevR:'<path d="m9 6 6 6-6 6"/>',
      panel:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M15 3v18"/>',
      upload:'<path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
      trash:'<path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"/>',
      shuffle:'<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
      gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      cloud:'<path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z"/>',
      rain:'<path d="M17.5 16a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 16M8 19v2M12 19v2M16 19v2"/>',
      snow:'<path d="M17.5 16a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 16M8 20h.01M12 20h.01M16 20h.01"/>',
      fog:'<path d="M17.5 14a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 14M4 18h16M7 22h13"/>',
      thunder:'<path d="M17.5 14a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 14M13 12l-3 5h4l-3 5"/>',
      ext:'<path d="M7 17 17 7M7 7h10v10"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M14 20v-4h4"/>',
      book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      sticker:'<path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l6-6V5a2 2 0 0 0-2-2z"/><path d="M15 21v-4a2 2 0 0 1 2-2h4"/>',
      pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
      eraser:'<path d="M20 20H7L3 16a2 2 0 0 1 0-3L13 3a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-9 9"/>',
      undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12H8"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[name]||''}</svg>`;
  }
  const iconBtn = (name, label, onClick, cls = '') =>
    el('button', { class:'icon-btn' + (cls ? ' ' + cls : ''), title:label, 'aria-label':label, html:svg(name), onclick:onClick });

  /* floating + add-note button */
  const addFab = (onClick) => el('button', { class:'add-fab', title:'add note', 'aria-label':'add note', html: svg('plus'), onclick: onClick });
  const penFab = () => { const b = el('button', { class:'fab-mini', title:'draw', 'aria-label':'draw', html: svg('pen'), onclick: () => b.classList.toggle('on', Draw.toggle()) }); return b; };
  const stickerFab = () => { const b = el('button', { class:'fab-mini', title:'stickers', 'aria-label':'stickers', html: svg('sticker'), onclick: () => b.classList.toggle('on', Stickers.toggle()) }); return b; };

  /* ==========================================================
     4 · Weather (Open-Meteo + reverse geocode, cached & auto-refresh)
     ========================================================== */
  const Weather = (() => {
    const codeIcon = (c) => {
      if (c === 0) return 'sun';
      if (c <= 3) return 'cloud';
      if (c === 45 || c === 48) return 'fog';
      if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
      if (c >= 71 && c <= 77) return 'snow';
      if (c >= 95) return 'thunder';
      return 'cloud';
    };
    const codeLabel = (c) => {
      if (c === 0) return 'clear'; if (c <= 3) return 'cloudy';
      if (c === 45 || c === 48) return 'fog';
      if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
      if (c >= 71 && c <= 77) return 'snow'; if (c >= 95) return 'storm'; return 'cloudy';
    };
    async function coords() {
      const cached = Store.get().meta.coords;
      if (cached) return cached;
      const got = await new Promise((res) => {
        if (!navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition(
          p => res({ lat: p.coords.latitude, lon: p.coords.longitude }),
          () => res(null), { timeout: 6000, maximumAge: 3.6e6 }
        );
      });
      const c = got || { lat: SF.lat, lon: SF.lon };
      Store.get().meta.coords = c; Store.save(true);
      return c;
    }
    async function cityName(lat, lon) {
      try {
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const j = await r.json();
        return (j.city || j.locality || j.principalSubdivision || SF.city).toLowerCase();
      } catch { return SF.city; }
    }
    async function fetch7(force = false) {
      const meta = Store.get().meta;
      if (!force && meta.weather && (Date.now() - meta.weather.ts) < WEATHER_TTL) return meta.weather;
      try {
        const c = await coords();
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}`
          + `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min`
          + `&temperature_unit=fahrenheit&timezone=auto`;
        const r = await fetch(url); const j = await r.json();
        const city = meta.weather?.city && !force ? meta.weather.city : await cityName(c.lat, c.lon);
        const w = {
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          hi: Math.round(j.daily.temperature_2m_max[0]),
          lo: Math.round(j.daily.temperature_2m_min[0]),
          city, ts: Date.now(),
        };
        meta.weather = w; Store.save(true);
        return w;
      } catch (e) { console.error('weather', e); return meta.weather; }
    }
    function renderInto(elm, w) {
      if (!w) { elm.innerHTML = `<span class="loc">${SF.city}</span> · loading…`; return; }
      elm.innerHTML =
        `<span class="loc">${esc(w.city)}</span> <span class="temp">${w.temp}°</span> ${svg(codeIcon(w.code))} `
        + `<span>${codeLabel(w.code)}</span> <span>H: ${w.hi}</span> <span class="lo">L: ${w.lo}</span>`;
    }
    async function mount(elm) {
      renderInto(elm, Store.get().meta.weather);
      renderInto(elm, await fetch7());
    }
    return { mount, fetch7, renderInto };
  })();

  /* ==========================================================
     5 · Format toolbar (bold / italic / underline / highlight / color)
     ========================================================== */
  const Fmt = (() => {
    let bar, currentEditable = null;
    function ensure() {
      if (bar) return bar;
      bar = el('div', { id:'fmt-bar' });
      const exec = (cmd, val) => (e) => {
        e.preventDefault();
        document.execCommand(cmd, false, val);
        currentEditable?.dispatchEvent(new Event('input', { bubbles: true }));
      };
      bar.append(
        el('button', { title:'Bold', onmousedown: exec('bold'), html:'<b>B</b>' }),
        el('button', { title:'Italic', onmousedown: exec('italic'), html:'<i>I</i>' }),
        el('button', { title:'Underline', onmousedown: exec('underline'), html:'<u>U</u>' }),
        el('button', { title:'Highlight', onmousedown: exec('hiliteColor', '#ffd84d'), html:'<span style="background:#ffd84d;color:#1c1c1e;padding:0 2px;border-radius:2px">H</span>' }),
        el('button', { title:'Red', onmousedown: exec('foreColor', '#d6453d'), html:'<span class="swatch" style="background:#d6453d"></span>' }),
        el('button', { title:'Blue', onmousedown: exec('foreColor', '#2f6df0'), html:'<span class="swatch" style="background:#2f6df0"></span>' }),
        el('button', { title:'Green', onmousedown: exec('foreColor', '#1f9d57'), html:'<span class="swatch" style="background:#1f9d57"></span>' }),
        el('button', { title:'Ink', onmousedown: exec('foreColor', '#1c1c1e'), html:'<span class="swatch" style="background:#1c1c1e"></span>' }),
        el('button', { title:'Clear', onmousedown: exec('removeFormat'), html:'✕' }),
      );
      document.body.append(bar);
      return bar;
    }
    function place() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { hide(); return; }
      const anchor = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
      const editable = anchor?.closest?.('[contenteditable="true"]');
      if (!editable) { hide(); return; }
      currentEditable = editable;
      const r = sel.getRangeAt(0).getBoundingClientRect();
      const b = ensure(); b.classList.add('show');
      b.style.left = clamp(r.left + r.width/2 - b.offsetWidth/2, 6, window.innerWidth - b.offsetWidth - 6) + 'px';
      b.style.top = Math.max(6, r.top - b.offsetHeight - 8) + 'px';
    }
    function hide() { bar?.classList.remove('show'); }
    document.addEventListener('selectionchange', () => { if (bar?.classList.contains('show') || window.getSelection()?.toString()) place(); });
    document.addEventListener('mouseup', () => setTimeout(place, 0));
    document.addEventListener('scroll', hide, true);
    return { hide };
  })();

  /* ==========================================================
     6 · Note rendering (rich, shared by canvas)
     ========================================================== */
  function makeChecklistItem(item, ctx, readonly, listEl, note) {
    const row = el('div', { class:'chk-row' + (item.done ? ' done' : '') });
    const cb = el('input', { type:'checkbox' });
    cb.checked = item.done; cb.disabled = readonly;
    cb.addEventListener('change', () => { item.done = cb.checked; row.classList.toggle('done', cb.checked); Store.save(true); });
    const txt = el('div', { class:'chk-text', contenteditable: readonly ? 'false' : 'true', html: item.html || '' });
    if (!readonly) {
      txt.addEventListener('input', () => { item.html = txt.innerHTML; Store.save(); });
      txt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault();
          const ni = { id: uid(), html:'', done:false };
          note.checklist.splice(note.checklist.indexOf(item) + 1, 0, ni);
          const nr = makeChecklistItem(ni, ctx, readonly, listEl, note);
          row.after(nr); nr.querySelector('.chk-text').focus(); Store.save();
        }
        if (e.key === 'Backspace' && txt.textContent === '' && note.checklist.length > 1) {
          e.preventDefault();
          note.checklist.splice(note.checklist.indexOf(item), 1); row.remove(); Store.save();
        }
      });
    }
    row.append(cb, txt);
    if (!readonly) row.append(iconBtn('x', 'remove', () => {
      note.checklist.splice(note.checklist.indexOf(item), 1); row.remove();
      if (!note.checklist.length) note.checklist = null;
      Store.save();
    }, 'chk-del'));
    return row;
  }

  function renderChecklist(note, node, ctx) {
    const wrap = el('div', { class:'note-checklist' });
    note.checklist.forEach(item => wrap.append(makeChecklistItem(item, ctx, ctx.readonly, wrap, note)));
    if (!ctx.readonly) wrap.append(el('button', { class:'chk-add', text:'+ add item', onclick: () => {
      const ni = { id: uid(), html:'', done:false }; note.checklist.push(ni);
      const nr = makeChecklistItem(ni, ctx, false, wrap, note);
      wrap.querySelector('.chk-add').before(nr); nr.querySelector('.chk-text').focus(); Store.save();
    } }));
    return wrap;
  }
  function addChecklist(note, node) {
    if (!note.checklist) note.checklist = [{ id: uid(), html:'', done:false }];
    node.querySelector('.note-checklist')?.remove();
    node.querySelector('.note-rich').after(renderChecklist(note, node, node._ctx));
    node.querySelector('.note-checklist .chk-text')?.focus();
    Store.save(true);
  }

  function renderImages(note, node, readonly) {
    const wrap = el('div', { class:'note-images' });
    note.images.forEach((img, i) => {
      const box = el('div', { class:'note-img' }, [ el('img', { src: img.src, alt: img.caption || `image ${i+1}` }) ]);
      const cap = el('div', { class:'cap', contenteditable: readonly ? 'false' : 'true', text: img.caption || '' });
      if (!readonly) cap.addEventListener('input', () => { img.caption = cap.textContent; Store.save(); });
      box.append(cap);
      if (!readonly) box.append(el('div', { class:'img-bar' }, iconBtn('trash', 'remove image', () => {
        note.images.splice(i, 1); Store.save(true);
        const repl = note.images.length ? renderImages(note, node, readonly) : document.createComment('no-img');
        wrap.replaceWith(repl);
      })));
      wrap.append(box);
    });
    return wrap;
  }

  /* downscale + recompress images so months of photos don't blow the storage budget */
  function compressImage(dataURL, done, maxEdge = 1400, quality = 0.82) {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const scale = Math.min(1, maxEdge / Math.max(w, h));
      w = Math.round(w * scale); h = Math.round(h * scale);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      try { done(c.toDataURL('image/jpeg', quality)); } catch { done(dataURL); }
    };
    img.onerror = () => done(dataURL);
    img.src = dataURL;
  }
  function fileToImage(file, done) {
    const rd = new FileReader();
    rd.onload = () => compressImage(rd.result, done);
    rd.readAsDataURL(file);
  }

  function handlePaste(e, note, node) {
    const items = [...(e.clipboardData?.items || [])].filter(it => it.type.startsWith('image/'));
    if (!items.length) return;                 // let text paste through
    e.preventDefault();
    items.forEach(it => {
      const file = it.getAsFile(); if (!file) return;
      fileToImage(file, (src) => {
        note.images.push({ src, caption: '' });
        const body = node.querySelector('.note-body-scroll');
        const existing = body.querySelector('.note-images');
        if (existing) existing.replaceWith(renderImages(note, node, false));
        else (body.querySelector('.note-checklist') || body.querySelector('.note-rich')).after(renderImages(note, node, false));
        Store.save(true); toast('image pasted');
      });
    });
  }

  function placeCaret(elm) {
    elm.focus();
    const r = document.createRange(); r.selectNodeContents(elm); r.collapse(false);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  function buildNote(note, ctx) {
    const { readonly, tags } = ctx;
    const stamp = new Date(note.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const sizeStyle = (note.w ? `width:${note.w}px;` : '') + (note.h ? `height:${note.h}px;` : '');
    const node = el('div', { class:'note', dataset:{ id: note.id, readonly:String(readonly), tag: note.tag || '' }, style:`left:${note.x}px; top:${note.y}px; ${sizeStyle}` });

    /* head */
    const head = el('div', { class:'note-head' }, [ el('span', { class:'stamp', text: stamp }) ]);
    if (!readonly) {
      const tools = el('div', { class:'tools' });
      if (note.tag === 'journal') tools.append(iconBtn('shuffle', 'new prompt', () => {
        const rich = node.querySelector('.note-rich');
        rich.innerHTML = `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`;
        note.html = rich.innerHTML; Store.save(true); placeCaret(rich);
      }));
      tools.append(iconBtn('checklist', 'add checklist', () => addChecklist(note, node)));
      tools.append(iconBtn('archive', 'archive', () => ctx.onArchive(note.id)));
      tools.append(iconBtn('x', 'delete', () => ctx.onDelete(note.id), 'danger'));
      head.append(tools);
      head.addEventListener('pointerdown', (e) => ctx.onDragStart(e, node, note));
    }
    node.append(head);

    /* scrollable body wrapper (so a fixed height clips/scrolls gracefully) */
    const body = el('div', { class:'note-body-scroll' });

    const rich = el('div', { class:'note-rich', contenteditable: readonly ? 'false' : 'true',
      'data-placeholder':'type…  (try /todo)', html: note.html || '' });
    if (!readonly) {
      rich.addEventListener('input', () => {
        if (rich.textContent.trim() === '/todo') {
          rich.innerHTML = ''; note.html = '';
          addChecklist(note, node); Store.save(true); return;
        }
        note.html = rich.innerHTML; Store.save();
      });
      rich.addEventListener('paste', (e) => handlePaste(e, note, node));
    }
    body.append(rich);

    if (note.checklist) body.append(renderChecklist(note, node, ctx));
    if (note.images?.length) body.append(renderImages(note, node, readonly));

    if (tags) {
      const foot = el('div', { class:'note-foot' });
      if (readonly) foot.append(el('span', { class:'tagchip', text: note.tag ? `#${note.tag}` : 'untagged' }));
      else {
        const sel = el('select');
        sel.append(el('option', { value:'', text:'+ tag' }));
        PERSONAL_TAGS.forEach(t => sel.append(el('option', { value:t, text:`#${t}`, selected: note.tag === t ? 'selected' : null })));
        sel.value = note.tag || '';
        sel.addEventListener('change', () => {
          note.tag = sel.value || null;
          node.dataset.tag = note.tag || '';
          if (note.tag === 'gym' && !note.checklist) {
            note.checklist = GYM_CHECKLIST.map(t => ({ id: uid(), html: esc(t), done: false }));
            node.querySelector('.note-checklist')?.remove();
            node.querySelector('.note-rich').after(renderChecklist(note, node, ctx));
            toast('gym checklist added');
          }
          Store.save(true);
        });
        foot.append(sel);
      }
      body.append(foot);
    }
    node.append(body);

    /* resize handle */
    if (!readonly) {
      const rz = el('div', { class:'note-resize', title:'resize' });
      rz.addEventListener('pointerdown', (e) => startResize(e, node, note));
      node.append(rz);
    }
    node.append(Draw.layerFor(note, readonly));   // pen overlay — inert until pen mode
    return node;
  }

  function startResize(e, node, note) {
    e.preventDefault(); e.stopPropagation();
    node.classList.add('resizing'); node.setPointerCapture?.(e.pointerId);
    const startX = e.clientX, startY = e.clientY, startW = node.offsetWidth, startH = node.offsetHeight;
    const move = (ev) => {
      note.w = Math.round(clamp(startW + (ev.clientX - startX), 150, 720));
      note.h = Math.round(clamp(startH + (ev.clientY - startY), 90, 900));
      node.style.width = note.w + 'px'; node.style.height = note.h + 'px';
    };
    const up = () => {
      node.classList.remove('resizing');
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      Store.save(true);
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  }

  /* ==========================================================
     7 · Canvas engine (shared by Dashboard + Personal)
     ========================================================== */
  const Canvas = (() => {
    let active = null;
    function teardown() { active = null; Draw.teardown(); Stickers.teardown(); }

    function build({ view, dateKey, readonly, tags = false, onChange = () => {}, tall = false }) {
      const surface = el('div', { class:'canvas-surface dotgrid' + (tall ? ' tall' : ''), role:'application', 'aria-label':`${view} canvas` });
      const ctx = { view, dateKey, readonly, tags, onChange, onArchive: archive, onDelete: remove, onDragStart: startDrag };
      active = { surface, ctx };
      paint();
      Stickers.attach(surface, view, dateKey, readonly); // emoji decorations behind notes
      return surface;
    }

    function paint() {
      if (!active) return;
      const { surface, ctx } = active;
      [...surface.querySelectorAll('.note')].forEach(n => n.remove());
      surface.querySelector('.empty-line')?.remove();
      const list = Store.notes(ctx.view, ctx.dateKey).filter(n => !n.archived);
      if (!list.length && ctx.readonly && !surface.querySelector('.focus-widget'))
        surface.append(el('div', { class:'empty-line', style:'position:absolute;left:22px;top:18px', text:'empty page — nothing was logged on this date.' }));
      list.forEach(n => { const node = buildNote(n, ctx); node._ctx = ctx; surface.append(node); });
    }

    function spawn(x, y, preset = {}) {
      const { ctx, surface } = active;
      const note = Store.normalizeNote({ id: uid(), x: Math.round(x), y: Math.round(y), tag: ctx.tags ? (preset.tag || '') : null, timestamp: Date.now(), ...preset });
      Store.notes(ctx.view, ctx.dateKey).push(note);
      Store.save(true);
      const node = buildNote(note, ctx); node._ctx = ctx; surface.append(node);
      node.querySelector('.note-rich').focus();
      ctx.onChange();
      return note;
    }

    /* spawn from the + button — cascade near the visible top-left */
    function addNote(preset = {}) {
      if (!active || active.ctx.readonly) { toast('switch to today to add'); return; }
      const r = active.surface.getBoundingClientRect();
      const n = Store.notes(active.ctx.view, active.ctx.dateKey).filter(x => !x.archived).length;
      const x = clamp(40 + (n % 6) * 26, 0, Math.max(0, r.width - 240));
      const y = 40 + (n % 6) * 26 + window.scrollY;
      return spawn(x, y, preset);
    }

    function startDrag(e, node, n) {
      if (e.target.closest('.icon-btn') || e.target.closest('[contenteditable="true"]')) return;
      e.preventDefault();
      const surface = active.surface, r = surface.getBoundingClientRect();
      const offX = e.clientX - r.left - n.x, offY = e.clientY - r.top - n.y;
      node.classList.add('dragging'); node.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        n.x = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 30));
        n.y = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        node.style.left = n.x + 'px'; node.style.top = n.y + 'px';
      };
      const up = () => {
        node.classList.remove('dragging');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        Store.save(true);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    const findNote = (id) => Store.notes(active.ctx.view, active.ctx.dateKey).find(x => x.id === id);
    function archive(id) { const n = findNote(id); if (!n) return; n.archived = true; Store.save(true); paint(); active.ctx.onChange(); toast('archived'); }
    function noteHasContent(n) {
      if (n.images && n.images.length) return true;
      if (n.checklist && n.checklist.some(c => stripHtml(c.html).trim())) return true;
      // ignore an auto-filled journal prompt (just a bold question) as "empty"
      const t = stripHtml(n.html).replace(/\?.*$/, '').trim();
      return t.length > 0 && !(n.tag === 'journal' && stripHtml(n.html).trim().endsWith('?'));
    }
    function remove(id) {
      const list = Store.notes(active.ctx.view, active.ctx.dateKey);
      const i = list.findIndex(x => x.id === id);
      if (i < 0) return;
      if (noteHasContent(list[i]) && !confirm('Delete this note? This can’t be undone. (Tip: archive it instead to keep it.)')) return;
      list.splice(i, 1); Store.save(true); paint(); active.ctx.onChange();
    }
    function restore(id) { const n = findNote(id); if (!n) return; n.archived = false; Store.save(true); paint(); active.ctx.onChange(); toast('restored'); }

    return { build, paint, teardown, restore, spawn, addNote, get current() { return active; } };
  })();

  /* ==========================================================
     7b · Draw — pen strokes drawn ON individual sticky notes
       Each note carries its own `doodle` array; a transparent SVG
       overlay sits on the note, inert until pen mode is toggled on.
     ========================================================== */
  const Draw = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const COLORS = ['#1c1c1e', '#d6453d', '#2f6df0', '#1f9d57', '#ffd84d'];
    let enabled = false, color = '#1c1c1e', tool = 'pen';
    const history = [];                       // [{ note, id }] — per-session undo stack

    const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    const toD = (p) => p.length ? 'M' + p.map(q => q[0] + ',' + q[1]).join(' L') : '';
    const rel = (layer, e) => { const r = layer.getBoundingClientRect(); return [Math.round(e.clientX - r.left), Math.round(e.clientY - r.top)]; };

    /* build a note's drawing overlay (called from buildNote); always shows
       existing strokes, only captures input when not read-only */
    function layerFor(note, readonly) {
      const layer = mk('svg', { class: 'note-doodle' });
      render(layer, note);
      if (!readonly) wire(layer, note);
      return layer;
    }
    function render(layer, note) {
      layer.innerHTML = '';
      (note.doodle || []).forEach(s => {
        const p = mk('path', { d: toD(s.points), stroke: s.color, 'stroke-width': s.width || 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        p.dataset.id = s.id; layer.appendChild(p);
      });
    }
    function rerenderNote(note) {
      document.querySelectorAll(`.note[data-id="${note.id}"] .note-doodle`).forEach(l => render(l, note));
    }

    function wire(layer, note) {
      let pts = null, strokeEl = null;
      const move = (e) => { pts.push(rel(layer, e)); strokeEl.setAttribute('d', toD(pts)); };
      const up = () => {
        layer.removeEventListener('pointermove', move); layer.removeEventListener('pointerup', up);
        if (pts && pts.length > 1) {
          const s = { id: uid(), color, width: 3, points: pts };
          (note.doodle ||= []).push(s); history.push({ note, id: s.id }); Store.save(true);
          strokeEl.dataset.id = s.id;
        } else strokeEl?.remove();
        pts = null; strokeEl = null;
      };
      const erMove = (e) => eraseAt(layer, note, e);
      const erUp = () => { layer.removeEventListener('pointermove', erMove); layer.removeEventListener('pointerup', erUp); };
      layer.addEventListener('pointerdown', (e) => {
        if (!enabled) return;
        e.preventDefault(); e.stopPropagation(); layer.setPointerCapture?.(e.pointerId);
        if (tool === 'eraser') { eraseAt(layer, note, e); layer.addEventListener('pointermove', erMove); layer.addEventListener('pointerup', erUp); return; }
        pts = [rel(layer, e)];
        strokeEl = mk('path', { stroke: color, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: '' });
        layer.appendChild(strokeEl);
        layer.addEventListener('pointermove', move); layer.addEventListener('pointerup', up);
      });
    }
    function eraseAt(layer, note, e) {
      const [x, y] = rel(layer, e); const list = note.doodle || [];
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].points.some(p => Math.hypot(p[0] - x, p[1] - y) < 16)) {
          const id = list[i].id; list.splice(i, 1);
          layer.querySelector(`[data-id="${id}"]`)?.remove(); Store.save(true); break;
        }
      }
    }
    function undo() {
      const last = history.pop();
      if (!last) { toast('nothing to undo'); return; }
      const list = last.note.doodle || [];
      const i = list.findIndex(s => s.id === last.id);
      if (i >= 0) { list.splice(i, 1); Store.save(true); rerenderNote(last.note); }
    }
    function clearAll() {
      const c = Canvas.current; if (!c) return;
      if (!confirm('Clear all pen drawings on this page?')) return;
      Store.notes(c.ctx.view, c.ctx.dateKey).forEach(n => { n.doodle = []; });
      Store.save(true); history.length = 0;
      document.querySelectorAll('.note-doodle').forEach(l => { l.innerHTML = ''; });
    }

    /* toggle pen mode (page-wide) + floating toolbar */
    function toggle() {
      enabled = !enabled;
      document.body.classList.toggle('pen-mode', enabled);
      if (enabled) showBar(); else $('#draw-bar')?.remove();
      return enabled;
    }
    function showBar() {
      $('#draw-bar')?.remove();
      const bar = el('div', { id: 'draw-bar' });
      const swEls = COLORS.map(c => el('button', { class: 'draw-sw', style: `background:${c}`, dataset: { c }, title: 'pen' }));
      const eraser = el('button', { class: 'draw-tool', html: svg('eraser'), title: 'eraser' });
      const undoBtn = el('button', { class: 'draw-tool', html: svg('undo'), title: 'undo last stroke', onclick: () => undo() });
      const clear = el('button', { class: 'draw-tool', html: svg('trash'), title: 'clear page drawings', onclick: () => clearAll() });
      const done = el('button', { class: 'btn primary sm', text: 'done', onclick: () => toggle() });
      const mark = () => {
        swEls.forEach(b => b.classList.toggle('on', tool === 'pen' && b.dataset.c === color));
        eraser.classList.toggle('on', tool === 'eraser');
      };
      swEls.forEach(b => b.addEventListener('click', () => { color = b.dataset.c; tool = 'pen'; mark(); }));
      eraser.addEventListener('click', () => { tool = 'eraser'; mark(); });
      bar.append(el('span', { class: 'draw-hint', text: '✏️ draw on notes' }), el('div', { class: 'draw-swatches' }, swEls), eraser, undoBtn, clear, done);
      document.body.append(bar);
      mark();
    }

    function teardown() { enabled = false; document.body.classList.remove('pen-mode'); $('#draw-bar')?.remove(); history.length = 0; }

    return { layerFor, toggle, teardown, get enabled() { return enabled; } };
  })();

  /* ==========================================================
     7c · Stickers — placeable emoji decorations on a canvas
     ========================================================== */
  const Stickers = (() => {
    const PALETTE = ['🍉','🍓','🌸','🌷','🌿','⭐','✨','🩷','💛','☀️','🌙','☁️','🦋','🐾','🧸','🎀','☕','📌','🌈','🍄'];
    let layer = null, view = null, key = null;

    function attach(surf, v, k, readonly) {
      view = v; key = k;
      layer = el('div', { class:'sticker-layer' });
      surf.appendChild(layer);
      renderAll(readonly);
    }
    function renderAll(readonly) {
      if (!layer) return;
      layer.innerHTML = '';
      Store.stickers(view, key).forEach(s => layer.appendChild(makeEl(s, readonly)));
    }
    function makeEl(s, readonly) {
      const w = el('button', { class:'sticker', style:`left:${s.x}px; top:${s.y}px; font-size:${(s.scale || 1) * 38}px`, text: s.emoji });
      if (!readonly) {
        w.addEventListener('pointerdown', (e) => drag(e, w, s));
        w.appendChild(el('span', { class:'sticker-x', text:'✕', title:'remove',
          onclick: (e) => { e.stopPropagation(); removeOne(s.id, readonly); } }));
      }
      return w;
    }
    function drag(e, w, s) {
      if (e.target.classList?.contains('sticker-x')) return;
      e.preventDefault(); e.stopPropagation();
      const r = layer.getBoundingClientRect();
      const offX = e.clientX - r.left - s.x, offY = e.clientY - r.top - s.y;
      w.setPointerCapture?.(e.pointerId); w.classList.add('grab');
      const move = (ev) => {
        s.x = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 20));
        s.y = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        w.style.left = s.x + 'px'; w.style.top = s.y + 'px';
      };
      const up = () => { w.classList.remove('grab'); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); Store.save(true); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }
    function add(emoji) {
      if (!layer) return;
      const r = layer.getBoundingClientRect();
      const s = { id: uid(), emoji, x: Math.round(clamp(r.width / 2 - 20 + (Math.random() * 80 - 40), 0, r.width - 40)), y: Math.round(110 + Math.random() * 90), scale: 1 };
      Store.stickers(view, key).push(s); Store.save(true);
      layer.appendChild(makeEl(s, false));
    }
    function removeOne(id) {
      const list = Store.stickers(view, key);
      const i = list.findIndex(x => x.id === id);
      if (i >= 0) { list.splice(i, 1); Store.save(true); renderAll(false); layer.classList.add('editing'); }
    }
    function openTray() {
      if (!layer) return false;
      $('#sticker-bar')?.remove();
      layer.classList.add('editing');
      const grid = el('div', { class:'sticker-grid' }, PALETTE.map(em =>
        el('button', { class:'sticker-pick', text: em, onclick: () => add(em) })));
      const done = el('button', { class:'btn primary sm', text:'done', onclick: () => closeTray() });
      document.body.append(el('div', { id:'sticker-bar' }, [
        el('div', { class:'sticker-bar-hint', text:'tap to place · drag to move · ✕ to remove' }), grid, done ]));
      return true;
    }
    function closeTray() { $('#sticker-bar')?.remove(); layer?.classList.remove('editing'); return false; }
    function toggle() { return $('#sticker-bar') ? closeTray() : openTray(); }
    function teardown() { $('#sticker-bar')?.remove(); layer = null; }

    return { attach, toggle, teardown };
  })();

  /* ==========================================================
     8 · Dashboard
     ========================================================== */
  const Dashboard = (() => {
    let panelOpen = false;
    const KEY = 'board';                 // fixed key — dashboard notes persist (no 3am reset)
    function reset() {}

    function mount(root) {
      const wrap = el('div', { class:'dash-wrap' });

      const body = el('div', { class:'dash-body' });
      const canvasCol = el('div', { class:'dash-canvas' });
      const surface = Canvas.build({ view:'dashboard', dateKey: KEY, readonly: false, onChange: refreshPanel, tall: true });
      surface.prepend(focusWidget()); surface.prepend(digestCard()); surface.prepend(calendarWidget());
      Pets.mount(surface);
      canvasCol.append(surface);

      const panel = el('aside', { class:'side-panel' + (panelOpen ? ' open':''), id:'dash-panel' });
      body.append(canvasCol, panel);
      wrap.append(body);
      root.append(wrap);

      // floating cluster: draw · archive · + note  (dashboard notes persist; no daily reset)
      wrap.append(el('div', { class:'fab-cluster' }, [
        stickerFab(),
        penFab(),
        el('button', { class:'fab-mini', title:'archived notes', 'aria-label':'archived notes', html: svg('archive'), onclick: () => togglePanel() }),
        addFab(() => Canvas.addNote()),
      ]));
      refreshPanel();
    }

    /* auto-pinned "today" digest: curriculum next-up, gym, journal, mood — draggable */
    function greeting() {
      const h = new Date().getHours();
      const part = h < 5 ? 'still up' : h < 12 ? 'good morning' : h < 17 ? 'good afternoon' : h < 21 ? 'good evening' : 'good night';
      const m = Store.get().meta;
      const who = m.name || (m.nicknames && pick(m.nicknames)) || '';
      return `${part}, ${who} ✨`;
    }
    function digestCard() {
      const d = Store.get();
      const tk = todayKey();
      const pos = d.meta.digestPos;
      const card = el('div', { class:'digest-card' + (pos ? ' pinned' : ''), style: pos ? `left:${pos.x}px; top:${pos.y}px` : '' });
      const head = el('div', { class:'digest-head' }, [
        el('span', { class:'kicker', text: `today · ${prettyDate()}` }),
        el('span', { class:'digest-grip', title:'drag', text:'⠿' }),
      ]);
      head.addEventListener('pointerdown', (e) => dragDigest(e, card));
      card.append(el('div', { class:'digest-greet', text: greeting() }));
      card.append(head);
      const rows = el('div', { class:'digest-rows' });

      const lessons = Work.allLessons();
      const done = lessons.reduce((a, L) => a + (Store.lesson(L.id).complete ? 1 : 0), 0);
      const next = lessons.find(L => !Store.lesson(L.id).complete);
      rows.append(digestRow('📘', next ? `next: ${next.builtin ? 'day '+next.day+' — ' : ''}${next.title}` : 'curriculum complete 🎉',
        `${done}/${lessons.length}`, next ? `#work/lesson/${next.id}` : '#work'));

      const todayNotes = ((d.canvas.personal || {})[tk] || []).filter(n => !n.archived);
      const gym = todayNotes.find(n => n.tag === 'gym');
      if (gym && gym.checklist) {
        const leftN = gym.checklist.filter(c => !c.done).length;
        rows.append(digestRow('🏋️', leftN ? `gym: ${leftN} left` : 'gym: done ✓', `${gym.checklist.length-leftN}/${gym.checklist.length}`, '#personal'));
      }
      const jr = todayNotes.find(n => n.tag === 'journal');
      const journaled = jr && stripHtml(jr.html).replace(/^.*?\?/, '').trim().length > 0;
      rows.append(digestRow('✍️', journaled ? 'journal: written ✓' : 'journal: not yet', '', '#personal'));

      const mood = (d.meta.mood || {})[tk];
      rows.append(digestRow('🌤️', mood ? `mood: ${['','low','meh','ok','good','great'][mood]}` : 'mood: not logged', '', '#personal'));

      card.append(rows);
      return card;
    }
    function digestRow(icon, label, badge, hash) {
      return el('a', { class:'digest-row', href: hash }, [
        el('span', { class:'dg-ico', text: icon }),
        el('span', { class:'dg-label', text: label }),
        badge ? el('span', { class:'dg-badge', text: badge }) : el('span'),
      ]);
    }
    function dragDigest(e, card) {
      e.preventDefault();
      const surface = card.parentElement, r = surface.getBoundingClientRect();
      const meta = Store.get().meta;
      const start = card.getBoundingClientRect();
      let px = start.left - r.left, py = start.top - r.top;
      const offX = e.clientX - r.left - px, offY = e.clientY - r.top - py;
      card.classList.add('pinned', 'dragging'); card.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        px = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 60));
        py = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        card.style.left = px + 'px'; card.style.top = py + 'px';
      };
      const up = () => {
        card.classList.remove('dragging');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        meta.digestPos = { x: px, y: py }; Store.save(true);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    function focusWidget() {
      const meta = Store.get().meta;
      const w = el('div', { class:'focus-widget', style:`left:${meta.focusPos.x}px; top:${meta.focusPos.y}px` });
      const head = el('div', { class:'fw-head' }, [ el('span', { class:'stamp', text:'focus' }), el('span', { class:'stamp', text:'drag' }) ]);
      head.addEventListener('pointerdown', (e) => dragWidget(e, w));
      w.append(head);

      const frame = el('div', { class:'media-frame', title:'click to set a local photo' });
      const repaint = () => {
        frame.innerHTML = '';
        if (meta.catImage) frame.append(el('img', { src: meta.catImage, alt:'focus photo' }));
        else frame.append(el('div', { class:'media-placeholder' }, [ el('div', { class:'cat', text:'🐱' }), el('div', { text:'click to load a local photo' }) ]));
        frame.append(el('div', { class:'media-overlay', text:'better days ahead twin' }));
      };
      repaint();
      frame.addEventListener('click', () => { if (w._dragged) { w._dragged = false; return; } pickImage((src) => { meta.catImage = src; Store.save(true); repaint(); toast('photo set'); }); });
      w.append(frame);

      const weather = el('div', { class:'weather-badge' });
      Weather.mount(weather);
      w.append(weather);
      return w;
    }
    function dragWidget(e, w) {
      if (e.target.closest('.icon-btn')) return;
      e.preventDefault();
      const surface = w.parentElement, r = surface.getBoundingClientRect();
      const meta = Store.get().meta;
      const offX = e.clientX - r.left - meta.focusPos.x, offY = e.clientY - r.top - meta.focusPos.y;
      w.classList.add('dragging'); w.setPointerCapture?.(e.pointerId); let moved = false;
      const move = (ev) => {
        moved = true;
        meta.focusPos.x = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 40));
        meta.focusPos.y = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        w.style.left = meta.focusPos.x + 'px'; w.style.top = meta.focusPos.y + 'px';
      };
      const up = () => { w.classList.remove('dragging'); if (moved) w._dragged = true;
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); Store.save(true); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    /* ── Google Calendar embed (draggable, pinnable widget) ── */
    function buildCalEmbedUrl(raw) {
      raw = (raw || '').trim();
      if (!raw) return '';
      const tag = raw.match(/src="([^"]+)"/i);                 // pasted a full <iframe …> tag
      if (tag) return tag[1];
      if (/^https?:\/\//i.test(raw)) return raw;               // already an embed URL
      return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(raw)}` +
             `&ctz=America/Los_Angeles&mode=AGENDA&showTitle=0&showPrint=0&showCalendars=0&showTz=0`;
    }
    function calendarWidget() {
      const meta = Store.get().meta;
      const pos = meta.calPos || { x: 26, y: 372 };
      const w = el('div', { class:'cal-widget', style:`left:${pos.x}px; top:${pos.y}px` });
      const head = el('div', { class:'cal-head' }, [
        el('span', { class:'stamp', text:'📅 calendar' }),
        el('span', { class:'stamp cal-grip', text:'drag' }),
      ]);
      head.addEventListener('pointerdown', (e) => dragCal(e, w));
      w.append(head);
      const body = el('div', { class:'cal-body' });
      renderCal(body, w);
      w.append(body);
      return w;
    }
    function renderCal(body) {
      const meta = Store.get().meta;
      body.innerHTML = '';
      const url = buildCalEmbedUrl(meta.calUrl);
      if (url) {
        body.append(el('iframe', { class:'cal-frame', src: url, loading:'lazy', title:'Google Calendar' }));
        body.append(el('button', { class:'cal-edit', title:'change calendar', html: svg('gear'), onclick: () => editCal(body) }));
      } else {
        const inp = el('input', { class:'field cal-input', placeholder:'you@gmail.com  or  embed URL' });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
        const save = () => { meta.calUrl = inp.value.trim(); Store.save(true); renderCal(body); };
        body.append(el('div', { class:'cal-setup' }, [
          el('div', { class:'cal-setup-title', text:'connect Google Calendar' }),
          el('div', { class:'cal-setup-hint', html:'paste your calendar address (e.g. <b>you@gmail.com</b>) or a full embed URL from Google Calendar → Settings → “Integrate calendar”. it shows when you’re signed in to that account here, or if the calendar is public.' }),
          inp,
          el('button', { class:'btn primary sm', text:'show calendar', onclick: save }),
        ]));
      }
    }
    function editCal(body) {
      const meta = Store.get().meta;
      body.innerHTML = '';
      const inp = el('input', { class:'field cal-input', value: meta.calUrl || '', placeholder:'you@gmail.com  or  embed URL' });
      body.append(el('div', { class:'cal-setup' }, [
        el('div', { class:'cal-setup-title', text:'calendar address or embed URL' }),
        inp,
        el('div', { style:'display:flex; gap:6px' }, [
          el('button', { class:'btn primary sm', text:'save', onclick: () => { meta.calUrl = inp.value.trim(); Store.save(true); renderCal(body); } }),
          el('button', { class:'btn ghost sm', text:'cancel', onclick: () => renderCal(body) }),
        ]),
      ]));
    }
    function dragCal(e, w) {
      if (e.target.closest('button') || e.target.closest('input')) return;
      e.preventDefault();
      const surface = w.parentElement, r = surface.getBoundingClientRect();
      const meta = Store.get().meta;
      const start = w.getBoundingClientRect();
      let px = start.left - r.left, py = start.top - r.top;
      const offX = e.clientX - r.left - px, offY = e.clientY - r.top - py;
      w.classList.add('dragging'); w.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        px = Math.round(clamp(ev.clientX - r.left - offX, 0, r.width - 80));
        py = Math.round(clamp(ev.clientY - r.top - offY, 0, 6000));
        w.style.left = px + 'px'; w.style.top = py + 'px';
      };
      const up = () => {
        w.classList.remove('dragging');
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        meta.calPos = { x: px, y: py }; Store.save(true);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    function togglePanel() {
      const p = $('#dash-panel');
      if (panelOpen) { panelOpen = false; p.classList.remove('open'); return; }
      panelOpen = true; p.classList.add('open'); refreshPanel();
    }
    function refreshPanel() {
      const p = $('#dash-panel'); if (!p) return;
      const inner = el('div', { class:'side-inner' });
      inner.append(el('div', { class:'side-phead' }, [
        el('span', { class:'kicker', text:'archived notes' }),
        iconBtn('x', 'close panel', () => { panelOpen = false; p.classList.remove('open'); }),
      ]));
      inner.append(archiveList());
      p.innerHTML = ''; p.append(inner);
    }
    function archiveList() {
      const box = el('div');
      const arch = Store.notes('dashboard', KEY).filter(n => n.archived);
      if (!arch.length) { box.append(el('div', { class:'empty-line', text:'no archived notes.' })); return box; }
      arch.forEach(n => box.append(el('div', { class:'arch-item' }, [
        el('div', { class:'arch-text', html: n.html || '(empty)' }),
        el('div', { class:'arch-row' }, [ el('span', { text:new Date(n.timestamp).toLocaleDateString() }), iconBtn('restore','restore',() => Canvas.restore(n.id)) ]),
      ])));
      return box;
    }
    return { mount, reset };
  })();

  function pickImage(done) {
    const input = el('input', { type:'file', accept:'image/*', style:'display:none' });
    document.body.append(input);
    input.addEventListener('change', () => {
      const f = input.files[0];
      if (f) fileToImage(f, (src) => { done(src); input.remove(); });
      else input.remove();
    });
    input.click();
  }

  /* ==========================================================
     9 · Work hub  (curriculum + journal feed, sort, detail, feedback)
     ========================================================== */
  const Work = (() => {
    let sort = 'all';
    const lessonId = (i) => `c${i}`;
    const allLessons = () => [
      ...CURRICULUM_BASE.map((L, i) => ({ ...L, id: lessonId(i), builtin: true })),
      ...Store.get().work.customLessons.map(L => ({ ...L, builtin: false })),
    ];
    const findLesson = (id) => allLessons().find(L => L.id === id);

    function mount(root, sub = []) {
      if (sub[0] === 'lesson' && sub[1]) return mountLesson(root, sub[1]);
      if (sub[0] === 'journal' && sub[1]) return mountJournal(root, sub[1]);
      mountFeed(root);
    }

    /* ---------- feed ---------- */
    function mountFeed(root) {
      const wrap = el('div', { class:'work-wrap' });
      const lessons = allLessons();
      const done = lessons.reduce((a, L) => a + (Store.lesson(L.id).complete ? 1 : 0), 0);

      wrap.append(el('div', { class:'work-head' }, [
        el('div', { class:'kicker', text:'curriculum // williams-sonoma internship prep' }),
        el('h1', { text:'work hub' }),
        progressTrack(done, lessons.length),
      ]));

      const addBtn = el('button', { class:'btn primary icon-only', html: svg('plus'), title:'add lesson or journal entry', 'aria-label':'add lesson or journal entry' });
      addBtn.addEventListener('click', () => popover(addBtn, [
        { icon:'book', label:'curriculum lesson', onClick: addLesson },
        { icon:'note', label:'journal entry', onClick: addEntry },
      ]));
      wrap.append(el('div', { class:'work-toolbar' }, [
        el('div', { class:'sortseg' }, [ segBtn('all','all'), segBtn('curriculum','curriculum'), segBtn('journal','journal') ]),
        addBtn,
      ]));

      const feed = el('div', { class:'feed' });
      const items = [];
      if (sort !== 'journal') lessons.forEach(L => items.push({ kind:'lesson', L }));
      if (sort !== 'curriculum') Store.get().work.entries.slice().sort((a,b)=>b.ts-a.ts).forEach(e => items.push({ kind:'journal', e }));
      if (!items.length) feed.append(el('div', { class:'empty-line', text:'nothing here yet.' }));
      items.forEach(it => feed.append(it.kind === 'lesson' ? lessonCard(it.L) : journalCard(it.e)));
      wrap.append(feed);
      root.append(wrap);
    }
    const segBtn = (id,label) => el('button', { class: sort===id?'active':'', text:label, onclick:() => { sort=id; const r=$('#view'); r.innerHTML=''; mountFeed(r); } });

    function progressTrack(done, total) {
      const pct = total ? Math.round(done/total*100) : 0;
      return el('div', { class:'progress-track' }, [
        el('div', { class:'progress-rail' }, el('div', { class:'progress-fill', style:`width:${pct}%` })),
        el('div', { class:'progress-label', text:`${done}/${total} complete · ${pct}%` }),
      ]);
    }

    function lessonCard(L) {
      const st = Store.lesson(L.id);
      return el('a', { class:'feed-card' + (st.complete?' done':''), href:`#work/lesson/${L.id}` }, [
        el('div', { class:'feed-thumb', text: L.builtin ? String(L.day).padStart(2,'0') : '✎' }, el('span', { class:'feed-badge', text:'lesson' })),
        el('div', { class:'feed-meta' }, [
          el('div', { class:'lnum', text: (L.builtin ? `day ${L.day}` : 'custom') + (L.week?` · week ${L.week}`:'') }),
          el('h3', { text: L.title }),
          el('div', { class:'lstatus' + (st.complete?' ok':'') }, [ el('span', { class:'dot-mark'+(st.complete?' fill':'') }), el('span', { text: st.complete?'complete':(st.submitted?'submitted':'not started') }) ]),
        ]),
      ]);
    }
    function journalCard(e) {
      return el('a', { class:'feed-card journal', href:`#work/journal/${e.id}` }, [
        el('div', { class:'feed-thumb', text:'✍' }, el('span', { class:'feed-badge', text:'journal' })),
        el('div', { class:'feed-meta' }, [
          el('div', { class:'lnum', text:new Date(e.ts).toLocaleDateString(undefined,{month:'short',day:'numeric'}) }),
          el('h3', { text: e.title || 'untitled entry' }),
          el('div', { class:'lstatus', text:(e.body||'').slice(0,60) || '—' }),
        ]),
      ]);
    }

    /* ---------- add entry / lesson (modal) ---------- */
    const row = (label, ctrl) => el('div', { class:'modal-row' }, [ el('label', { text:label }), ctrl ]);
    function addEntry() {
      Modal.open('New journal entry', (body, close) => {
        const title = el('input', { class:'field', placeholder:'title (e.g. Friday Intern Log — Week 1)' });
        const ta = el('textarea', { class:'field', style:'min-height:200px', placeholder:'raw brain-dump — wins, blockers, iterations, feedback…' });
        body.append(row('Title', title), row('Entry', ta),
          el('div', { class:'modal-actions' }, [
            el('button', { class:'btn ghost', text:'cancel', onclick: close }),
            el('button', { class:'btn primary', text:'save entry', onclick: () => {
              Store.get().work.entries.push({ id: uid(), title: title.value.trim(), body: ta.value, ts: Date.now() });
              Store.save(true); close(); const r=$('#view'); r.innerHTML=''; mountFeed(r); toast('entry saved');
            } }),
          ]));
        setTimeout(() => title.focus(), 50);
      });
    }
    function addLesson() {
      Modal.open('New custom lesson', (body, close) => {
        const title = el('input', { class:'field', placeholder:'lesson title' });
        const concept = el('textarea', { class:'field', placeholder:'core concept', style:'min-height:70px' });
        const output = el('input', { class:'field', placeholder:'target output / deliverable' });
        body.append(row('Title', title), row('Core concept', concept), row('Output', output),
          el('div', { class:'modal-actions' }, [
            el('button', { class:'btn ghost', text:'cancel', onclick: close }),
            el('button', { class:'btn primary', text:'create', onclick: () => {
              Store.get().work.customLessons.push({ id:'x'+uid(), title:title.value.trim()||'Untitled lesson', coreConcept:concept.value.trim(), output:output.value.trim(), steps:[], objectives:[], feedbackCriteria:[], figmaExercise:null, week:null, day:null });
              Store.save(true); close(); const r=$('#view'); r.innerHTML=''; mountFeed(r); toast('lesson created');
            } }),
          ]));
        setTimeout(() => title.focus(), 50);
      });
    }

    /* ---------- journal detail ---------- */
    function mountJournal(root, id) {
      const e = Store.get().work.entries.find(x => x.id === id);
      if (!e) { location.hash = '#work'; return; }
      const wrap = el('div', { class:'work-wrap' });
      wrap.append(el('div', { style:'margin-bottom:12px' }, el('a', { class:'btn ghost sm', href:'#work', text:'← all' })));
      const card = el('div', { class:'journal-detail' });
      const title = el('input', { class:'field', value:e.title, placeholder:'title' });
      title.addEventListener('input', () => { e.title = title.value; Store.save(); });
      const ta = el('textarea', { class:'field' }); ta.value = e.body;
      ta.addEventListener('input', () => { e.body = ta.value; Store.save(); });
      card.append(el('div', { class:'kicker', text:`journal · ${new Date(e.ts).toLocaleString()}` }),
        el('div', { style:'height:8px' }), title, el('div', { style:'height:10px' }), ta,
        el('div', { class:'complete-bar' }, el('button', { class:'btn red sm', text:'delete entry', onclick: () => {
          if (!confirm('Delete this entry?')) return;
          const arr = Store.get().work.entries; arr.splice(arr.findIndex(x=>x.id===id),1); Store.save(true); location.hash='#work';
        } })));
      wrap.append(card); root.append(wrap);
    }

    /* ---------- lesson detail ---------- */
    function mountLesson(root, id) {
      const L = findLesson(id);
      if (!L) { location.hash = '#work'; return; }
      const wrap = el('div', { class:'work-wrap' });
      wrap.append(el('div', { style:'margin-bottom:12px' }, el('a', { class:'btn ghost sm', href:'#work', text:'← all lessons' })));

      const index = el('aside', { class:'lesson-index' }, el('div', { class:'ix-title', text:'quick jump' }));
      allLessons().forEach(item => {
        const s = Store.lesson(item.id);
        index.append(el('a', { class:'ix-link' + (item.id===id?' active':'') + (s.complete?' complete':''), href:`#work/lesson/${item.id}` },
          [ el('span', { class:'ix-n', text: item.builtin ? String(item.day).padStart(2,'0') : '✎' }), el('span', { text:item.title }) ]));
      });

      const pane = el('div', { class:'lesson-pane' });
      pane.append(lessonBody(L, Store.lesson(L.id), pane));
      wrap.append(el('div', { class:'lesson-split' }, [ index, pane ]));
      root.append(wrap);
    }

    /* lesson body: carousel while in-progress, full scroll once complete */
    function lessonBody(L, st, pane) {
      if (st.complete) return archiveCard(L, st, pane);
      const box = el('div');
      box.append(el('div', { class:'kicker', text: L.builtin ? `day ${L.day} · week ${L.week}` : 'custom lesson' }));
      box.append(el('h2', { text: L.title }));
      box.append(el('p', { class:'concept', text: L.coreConcept }));
      if (L.wsiContext) box.append(el('div', { class:'wsi-context', text: L.wsiContext }));

      if (L.objectives?.length) {
        box.append(el('div', { class:'section-label', text:'objectives' }));
        box.append(el('ul', { class:'obj-list' }, L.objectives.map(o => el('li', { text:o }))));
      }

      /* steps — one at a time via carousel */
      if (L.steps?.length) {
        box.append(el('div', { class:'section-label', text:'step-by-step  ·  ~3–4 hrs' }));
        box.append(stepCarousel(L, st));
      } else {
        box.append(el('div', { class:'section-label', text:'plan' }));
        box.append(el('div', { class:'empty-line', text:'detailed steps are being compiled — or add your own with “new” on the work page.' }));
      }

      /* figma exercise + submission */
      box.append(el('div', { class:'section-label', text:'figma exercise' }));
      if (L.figmaExercise) box.append(el('div', { class:'exercise-box' }, [
        el('div', { class:'ex-brief', text: L.figmaExercise.brief }),
        el('div', { class:'ex-deliv', text: '→ ' + L.figmaExercise.deliverable }),
      ]));
      else box.append(el('div', { class:'exercise-box' }, el('div', { class:'ex-brief', text: 'Produce: ' + (L.output || 'the lesson deliverable') })));
      box.append(submitZone(L, st, pane));

      /* notes */
      box.append(el('div', { class:'section-label', text:'your notes' }));
      const notes = el('textarea', { class:'lesson-notes', placeholder:'takeaways, questions, decisions…' });
      notes.value = st.notes; notes.addEventListener('input', () => { st.notes = notes.value; Store.save(); });
      box.append(notes);

      /* feedback */
      box.append(el('div', { class:'section-label', text:'feedback & self-review' }));
      box.append(feedbackCard(L, st, pane));

      /* complete */
      const bar = el('div', { class:'complete-bar' });
      const toggle = el('label', { class:'complete-toggle' });
      const cb = el('input', { type:'checkbox' });
      cb.addEventListener('change', () => {
        const done = cb.checked, r = cb.getBoundingClientRect();
        st.complete = done; st.completedAt = done ? Date.now() : null; Store.save(true);
        pane.innerHTML=''; pane.append(lessonBody(L, st, pane)); pane.scrollTop = 0;
        $$('.ix-link').forEach(a => { if (a.getAttribute('href')===`#work/lesson/${L.id}`) a.classList.toggle('complete', done); });
        toast(done ? 'lesson complete ✓' : 'reopened');
        if (done) { Pets.celebrate(); Confetti.burst(r.left + r.width/2, r.top); }
      });
      toggle.append(cb, el('span', { text:'mark “Lesson Complete” → lock as read-only reference' }));
      bar.append(toggle);
      if (!L.builtin) bar.append(el('button', { class:'btn red sm', text:'delete lesson', onclick: () => {
        if (!confirm('Delete this custom lesson?')) return;
        const arr = Store.get().work.customLessons; arr.splice(arr.findIndex(x=>x.id===L.id),1); Store.save(true); location.hash='#work';
      } }));
      box.append(bar);
      return box;
    }

    /* one-step-at-a-time carousel with dot progress */
    function stepCarousel(L, st) {
      let idx = 0;
      // start on first not-done step
      for (let i = 0; i < L.steps.length; i++) { if (!st.stepsDone[i]) { idx = i; break; } }
      const carousel = el('div', { class:'carousel' });
      const stage = el('div', { class:'carousel-stage' });
      const dotsWrap = el('div', { class:'carousel-dots' });
      const count = el('div', { class:'carousel-count' });
      const prevBtn = iconBtn('chevL', 'previous step', () => go(idx - 1));
      const nextBtn = iconBtn('chevR', 'next step', () => go(idx + 1));

      function renderDots() {
        dotsWrap.innerHTML = '';
        L.steps.forEach((_, i) => {
          const d = el('button', { class:'cdot' + (i===idx?' active':'') + (st.stepsDone[i]?' done':''), title:`step ${i+1}`, onclick:() => go(i) });
          dotsWrap.append(d);
        });
      }
      function render() {
        stage.innerHTML = ''; stage.append(stepCard(L, st, idx, renderDots));
        count.textContent = `${idx+1} / ${L.steps.length}`;
        prevBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
        nextBtn.style.visibility = idx === L.steps.length - 1 ? 'hidden' : 'visible';
        renderDots();
      }
      function go(i) { idx = clamp(i, 0, L.steps.length - 1); render(); }

      carousel.append(stage, el('div', { class:'carousel-nav' }, [ prevBtn, dotsWrap, count, nextBtn ]));
      render();
      return carousel;
    }

    function stepCard(L, st, i, onToggle) {
      const s = L.steps[i];
      const wrap = el('div', { class:'step' + (st.stepsDone[i] ? ' done':'') });
      const main = el('div', { class:'step-main' }, [
        el('div', {}, [ el('span', { class:'st-title', text: s.title }), el('span', { class:'st-time', text: s.time }) ]),
        el('div', { class:'st-detail', text: s.detail }),
      ]);
      if (s.resources?.length) {
        const res = el('div', { class:'step-res' });
        s.resources.forEach(r => {
          const isYt = /youtu/.test(r.url || '');
          res.append(el('a', { class:'res-link' + (isYt?' yt':''), href:r.url, target:'_blank', rel:'noopener', title:r.title },
            [ el('span', { class:'res-icon', html: svg(isYt ? 'ext' : 'ext') }), el('span', { class:'res-t', text: r.title }) ]));
        });
        main.append(res);
      }
      wrap.append(el('div', { class:'step-head' }, [ el('span', { class:'step-num', text:String(i+1) }), main ]));

      const doneRow = el('label', { class:'step-done-row' });
      const cb = el('input', { type:'checkbox' }); cb.checked = !!st.stepsDone[i];
      cb.addEventListener('change', () => { st.stepsDone[i] = cb.checked; wrap.classList.toggle('done', cb.checked); Store.save(true); onToggle && onToggle(); });
      doneRow.append(cb, el('span', { text:'mark this step done' }));
      wrap.append(doneRow);
      return wrap;
    }

    /* compact submit zone: small dropzone, full-width screenshots, figma link */
    function submitZone(L, st, pane) {
      const zone = el('div', { class:'submit-zone' });
      const dz = el('div', { class:'dropzone', html: svg('upload') + '<div>paste a screenshot (Ctrl/Cmd+V) of your Figma work · or click to browse</div>', tabindex:'0' });
      const grid = el('div', { class:'shot-grid' });
      const renderShots = () => {
        grid.innerHTML='';
        (st.shots||[]).forEach((s,i) => {
          const box = el('div', { class:'shot' }, el('img', { src:s.src||s, alt:`shot ${i+1}` }));
          const cap = el('div', { class:'cap', contenteditable:'true', text:(s.caption||'') });
          cap.addEventListener('input', () => { if (typeof st.shots[i]==='string') st.shots[i]={src:st.shots[i],caption:''}; st.shots[i].caption=cap.textContent; Store.save(); });
          box.append(cap, iconBtn('trash','remove',() => { st.shots.splice(i,1); Store.save(true); renderShots(); }, 'danger'));
          grid.append(box);
        });
      };
      const ingest = (files) => [...files].filter(f=>f.type.startsWith('image/')).forEach(f => fileToImage(f, (src) => { (st.shots||=[]).push({src,caption:''}); Store.save(true); renderShots(); }));
      dz.addEventListener('click', () => pickImage((src) => { (st.shots||=[]).push({src,caption:''}); Store.save(true); renderShots(); }));
      dz.addEventListener('paste', (e) => { const imgs=[...(e.clipboardData?.items||[])].filter(i=>i.type.startsWith('image/')); if(imgs.length){e.preventDefault(); ingest(imgs.map(i=>i.getAsFile()));}});
      ['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('over');}));
      ['dragleave','dragend'].forEach(ev=>dz.addEventListener(ev,()=>dz.classList.remove('over')));
      dz.addEventListener('drop', e=>{e.preventDefault();dz.classList.remove('over');ingest(e.dataTransfer.files);});
      zone.append(dz, grid);

      const linkRow = el('div', { class:'figma-link-row' });
      const link = el('input', { class:'field', placeholder:'paste your Figma share link…', value: st.figmaLink||'' });
      link.addEventListener('input', () => { st.figmaLink = link.value; Store.save(); });
      linkRow.append(link);
      if (st.figmaLink) linkRow.append(el('a', { class:'btn ghost sm', href:st.figmaLink, target:'_blank', rel:'noopener', html: svg('ext') + ' open' }));
      zone.append(linkRow);

      const submitBtn = el('button', { class:'btn primary', style:'margin-top:12px', text: st.submitted ? '✓ submitted — refresh feedback' : 'submit activity', onclick: () => {
        st.submitted = true; Store.save(true);
        pane.innerHTML=''; pane.append(lessonBody(L, st, pane));
        pane.querySelector('.feedback-card')?.scrollIntoView({ behavior:'smooth', block:'center' });
        toast('submitted — see feedback below');
      } });
      zone.append(submitBtn);
      renderShots();
      return zone;
    }

    /* AI-assisted feedback: a copy-pasteable prompt + a self-review rubric */
    function aiPrompt(L, st) {
      const crit = (L.feedbackCriteria?.length ? L.feedbackCriteria : ['matches the deliverable','grounded in WSI/user context','clear & presentation-ready']);
      return [
        `You are a senior UX design mentor at Williams-Sonoma, Inc. reviewing an intern's prep work.`,
        ``,
        `LESSON: ${L.title}`,
        `GOAL: ${L.coreConcept}`,
        `DELIVERABLE: ${L.figmaExercise?.deliverable || L.output || '(see lesson)'}`,
        ``,
        `I'm attaching a screenshot of my work${st.figmaLink ? ` (Figma: ${st.figmaLink})` : ''}.`,
        `Please give me specific, honest feedback:`,
        `1. Score my work against each criterion and explain why:`,
        ...crit.map(c => `   - ${c}`),
        `2. The 3 highest-impact things to improve, most important first.`,
        `3. One thing I did well that I should keep doing.`,
        `4. A sharper version of my design rationale I could tell my manager.`,
      ].join('\n');
    }

    function feedbackCard(L, st, pane) {
      if (!st.submitted) return el('div', { class:'feedback-card locked' }, el('div', { class:'empty-line', text:'submit your activity above to unlock AI feedback + the self-review rubric.' }));
      const card = el('div', { class:'feedback-card' });

      /* copy-pasteable AI prompt */
      const promptText = aiPrompt(L, st);
      const apBox = el('div', { class:'ai-prompt-box' });
      const copyBtn = iconBtn('copy', 'copy prompt', () => {
        navigator.clipboard?.writeText(promptText).then(() => toast('prompt copied — paste into Claude/ChatGPT with your screenshot'), () => toast('copy failed'));
      });
      apBox.append(
        el('div', { class:'ap-head' }, [ el('span', { class:'kicker', text:'ask an AI for feedback' }), copyBtn ]),
        el('pre', { text: promptText }),
        el('div', { style:'font-size:12px;color:var(--ink-soft);margin-top:8px', text:'copy this and paste it into Claude or ChatGPT with the screenshot you uploaded above.' }),
      );
      card.append(apBox);

      /* self-review rubric */
      const crit = L.feedbackCriteria?.length ? L.feedbackCriteria : ['Output matches the stated deliverable', 'Decisions are grounded in WSI / user context', 'Work is clear and presentation-ready'];
      card.append(el('div', { class:'section-label', style:'margin-top:4px', text:'self-review rubric' }));
      let scoreEl;
      const recompute = () => { const d = crit.filter((_,i)=>st.criteria[i]).length; scoreEl.innerHTML = `<b>${d}/${crit.length}</b> criteria met`; };
      crit.forEach((c,i) => {
        const rowEl = el('label', { class:'fc-crit' });
        const cb = el('input', { type:'checkbox' }); cb.checked = !!st.criteria[i];
        cb.addEventListener('change', () => { st.criteria[i]=cb.checked; Store.save(true); recompute(); });
        rowEl.append(cb, el('span', { text:c })); card.append(rowEl);
      });
      scoreEl = el('div', { class:'fc-score' }); card.append(scoreEl); recompute();

      const reflect = el('textarea', { class:'reflect', placeholder:'reflection: what worked, what you’d iterate, what to ask your mentor…' });
      reflect.value = st.reflect; reflect.addEventListener('input', () => { st.reflect = reflect.value; Store.save(); });
      card.append(el('div', { class:'section-label', style:'margin-top:14px', text:'reflection' }), reflect);
      return card;
    }

    /* read-only reference: keep a summary of the key info + the user's own work */
    function archiveCard(L, st, pane) {
      const when = st.completedAt ? new Date(st.completedAt).toLocaleString() : '—';
      const crit = L.feedbackCriteria?.length ? L.feedbackCriteria : [];
      const card = el('div', { class:'archive-card' });
      card.append(el('div', { class:'ac-head' }, [
        el('div', {}, [ el('div', { class:'kicker', text:(L.builtin?`day ${L.day} · `:'')+'complete' }), el('h2', { style:'margin:4px 0 0', text:L.title }) ]),
        el('span', { class:'read-only-flag', text:'● read-only reference' }),
      ]));
      card.append(el('div', { class:'ac-stamp', text:`completed ${when}` }));

      /* summary of the most important information from the lesson */
      const summary = el('div', { class:'summary-block' });
      summary.append(el('div', {}, [ el('b', { text:'Goal. ' }), document.createTextNode(L.coreConcept) ]));
      if (L.figmaExercise?.deliverable || L.output)
        summary.append(el('div', { style:'margin-top:6px' }, [ el('b', { text:'Deliverable. ' }), document.createTextNode(L.figmaExercise?.deliverable || L.output) ]));
      if (L.objectives?.length) summary.append(el('ul', {}, L.objectives.map(o => el('li', { text:o }))));
      card.append(el('div', { class:'section-label', text:'summary' }), summary);

      if (crit.length) {
        card.append(el('div', { class:'section-label', text:'self-review' }));
        card.append(el('pre', { class:'ac-notes', text: crit.map((c,i)=>`${st.criteria[i]?'☑':'☐'} ${c}`).join('\n') }));
      }
      card.append(el('div', { class:'section-label', text:'your notes' }), el('pre', { class:'ac-notes', text: st.notes || '(none)' }));
      if (st.reflect) card.append(el('div', { class:'section-label', text:'reflection' }), el('pre', { class:'ac-notes', text: st.reflect }));

      if ((st.shots||[]).length) {
        card.append(el('div', { class:'section-label', text:'submission' }));
        const grid = el('div', { class:'shot-grid' });
        st.shots.forEach((s,i)=>{ const src=s.src||s; const b=el('div',{class:'shot'},el('img',{src,alt:`shot ${i+1}`})); if(s.caption)b.append(el('div',{class:'cap',text:s.caption})); grid.append(b); });
        card.append(grid);
      }
      if (st.figmaLink) card.append(el('div', { style:'margin-top:10px' }, el('a', { class:'res-link yt', href:st.figmaLink, target:'_blank', rel:'noopener' }, [ el('span', { html: svg('ext') }), el('span', { class:'res-t', text:'figma file' }) ])));

      card.append(el('div', { class:'complete-bar' }, el('button', { class:'btn ghost sm', text:'reopen lesson', onclick: () => {
        st.complete=false; st.completedAt=null; Store.save(true); pane.innerHTML=''; pane.append(lessonBody(L, st, pane)); pane.scrollTop = 0;
        $$('.ix-link').forEach(a => { if (a.getAttribute('href')===`#work/lesson/${L.id}`) a.classList.remove('complete'); });
      } })));
      return card;
    }

    return { mount, allLessons };
  })();

  /* ==========================================================
     10 · Personal
     ========================================================== */
  const Personal = (() => {
    let viewDate = todayKey();
    let calCursor = logicalDate();
    function reset() { viewDate = todayKey(); calCursor = logicalDate(); }
    function remount(root) { root.innerHTML=''; Canvas.teardown(); mount(root); }

    function mount(root, sub = []) {
      if (sub[0] && DATE_RE.test(sub[0]) && sub[0] <= todayKey()) { viewDate = sub[0]; calCursor = new Date(sub[0] + 'T12:00:00'); }
      const readonly = viewDate !== todayKey();
      if (!readonly) ensureDailyNotes();

      const body = el('div', { class:'personal-body' });
      const drawer = el('aside', { class:'cal-drawer' }, [
        el('h2', { text:'history' }),
        el('div', { class:'sub', text:'pages auto-file at 3:00 am' }),
      ]);
      if (!readonly) drawer.append(moodStrip());
      drawer.append(quickTags());
      drawer.append(calendar());
      drawer.append(el('button', { class:'btn ghost sm', style:'width:100%;margin-top:6px', text:'→ jump to today',
        onclick:() => { viewDate = todayKey(); calCursor = logicalDate(); remount(root); } }));

      const right = el('div', { class:'personal-canvas' });
      right.append(el('div', { class:'canvas-bar' }, [
        readonly ? el('span', { class:'read-only-flag', text:`● ${viewDate} · read-only` }) : el('span', { class:'spacer' }),
      ]));
      right.append(Canvas.build({ view:'personal', dateKey: viewDate, readonly, tags:true, onChange: refreshCal, tall:true }));
      body.append(drawer, right);
      root.append(body);
      if (!readonly) body.append(el('div', { class:'fab-cluster' }, [
        stickerFab(),
        penFab(),
        addFab(() => { Canvas.addNote(); refreshCal(); }),
      ]));
    }

    /* mood / energy quick-log — one tap, trends stored in meta.mood */
    const MOODS = [['😞',1],['😕',2],['😐',3],['🙂',4],['😄',5]];
    function moodStrip() {
      const wrap = el('div', { class:'mood-strip' });
      wrap.append(el('div', { class:'kicker', style:'margin-bottom:6px', text:'today’s mood' }));
      const row = el('div', { class:'mood-row' });
      const cur = Store.get().meta.mood[todayKey()];
      MOODS.forEach(([emoji, val]) => {
        row.append(el('button', { class:'mood-btn' + (cur===val?' on':''), text:emoji, title:`mood ${val}/5`, onclick: () => {
          Store.get().meta.mood[todayKey()] = val; Store.save(true);
          [...row.children].forEach((c,i) => c.classList.toggle('on', MOODS[i][1]===val));
          toast('mood logged');
        } }));
      });
      wrap.append(row);
      return wrap;
    }

    const MEAL_LABELS = { breakfast: '🍳 breakfast', lunch: '🥗 lunch', dinner: '🍝 dinner' };
    const presetFor = (t) => {
      const preset = { tag: t };
      if (t === 'gym') preset.checklist = GYM_CHECKLIST.map(x => ({ id: uid(), html: esc(x), done:false }));
      if (t === 'journal') preset.html = `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`;
      if (MEAL_LABELS[t]) preset.html = `<b>${MEAL_LABELS[t]}</b><br>`;
      return preset;
    };

    function quickTags() {
      const wrap = el('div', {});
      wrap.append(el('div', { class:'kicker', style:'margin-bottom:6px', text:'quick log' }));
      const tags = el('div', { class:'quick-tags' });
      PERSONAL_TAGS.forEach(t => tags.append(el('button', { dataset:{ t }, text:`+ ${t}`, onclick: () => {
        if (viewDate !== todayKey()) { toast('switch to today to add'); return; }
        Canvas.addNote(presetFor(t)); refreshCal();
      } })));
      wrap.append(tags);
      const recWrap = el('div', { class:'recurring-wrap' });
      recWrap.append(el('div', { class:'kicker', style:'margin:10px 0 5px', text:'auto-add each day' }));
      ['gym', 'breakfast', 'lunch', 'dinner'].forEach(tag => {
        const row = el('label', { class:'recurring-row' });
        const cb = el('input', { type:'checkbox' }); cb.checked = (Store.get().meta.recurring || []).includes(tag);
        cb.addEventListener('change', () => {
          const m = Store.get().meta;
          m.recurring = cb.checked ? [...new Set([...(m.recurring||[]), tag])] : (m.recurring||[]).filter(x => x!==tag);
          Store.save(true);
          if (cb.checked && viewDate === todayKey()) { ensureDailyNotes(); Canvas.paint(); refreshCal(); }
          toast(cb.checked ? `${tag} auto-adds each day` : `${tag} auto-add off`);
        });
        row.append(cb, el('span', { text:`#${tag}` }));
        recWrap.append(row);
      });
      wrap.append(recWrap);
      return wrap;
    }

    /* always-on journal + any recurring checklists (e.g. gym), once per day */
    function ensureDailyNotes() {
      const tk = todayKey();
      const list = Store.notes('personal', tk);
      let changed = false;
      if (!list.some(n => n.tag === 'journal' && !n.archived)) {
        list.push(Store.normalizeNote({ id: uid(), x: 30, y: 30, tag:'journal',
          html: `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`, timestamp: Date.now() }));
        changed = true;
      }
      (Store.get().meta.recurring || []).forEach((t, i) => {
        if (!PERSONAL_TAGS.includes(t)) return;
        if (!list.some(n => n.tag === t && !n.archived)) {
          list.push(Store.normalizeNote({ id: uid(), x: 30 + (i+1)*30, y: 30 + (i+1)*30, ...presetFor(t), timestamp: Date.now() }));
          changed = true;
        }
      });
      if (changed) Store.save(true);
    }

    function refreshCal() { const old = $('.cal-drawer .cal-wrap'); if (old) old.replaceWith(calendar()); }

    function calendar() {
      const wrap = el('div', { class:'cal-wrap' });
      const y = calCursor.getFullYear(), m = calCursor.getMonth();
      wrap.append(el('div', { class:'cal-month' }, [
        iconBtn('chevL','prev',() => { calCursor=new Date(y,m-1,1); refreshCal(); }),
        el('span', { class:'mlabel', text:`${MON[m]} ${y}` }),
        iconBtn('chevR','next',() => { calCursor=new Date(y,m+1,1); refreshCal(); }),
      ]));
      const grid = el('div', { class:'cal-grid' });
      DOWS.forEach(d => grid.append(el('div', { class:'cal-dow', text:d })));
      const first = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate(), tk = todayKey();
      for (let i=0;i<first;i++) grid.append(el('div', { class:'cal-cell pad' }));
      for (let d=1; d<=days; d++) {
        const key = dKey(new Date(y,m,d));
        const has = (Store.get().canvas.personal[key]||[]).some(n=>!n.archived);
        const cls=['cal-cell']; if(has)cls.push('has'); if(key===tk)cls.push('today'); if(key===viewDate)cls.push('active');
        grid.append(el('button', { class:cls.join(' '), text:String(d), disabled: key>tk?'true':null, title: has?`${key} · has notes`:key,
          onclick:() => { viewDate=key; remount($('#view')); } }));
      }
      wrap.append(grid);
      wrap.append(el('div', { class:'empty-line', text: viewDate===tk?'editing today':'read-only · select today to edit' }));
      return wrap;
    }
    return { mount, reset };
  })();

  /* ==========================================================
     11 · Modal
     ========================================================== */
  const Modal = (() => {
    const root = $('#modal');
    function open(title, build) {
      $('#modal-title').textContent = title;
      const bodyEl = $('#modal-body'); bodyEl.innerHTML = '';
      build(bodyEl, close);
      root.hidden = false;
    }
    function close() { root.hidden = true; $('#modal-body').innerHTML = ''; }
    root.addEventListener('click', (e) => { if (e.target.matches('[data-close]') || e.target.classList.contains('modal-scrim')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !root.hidden) close(); });
    return { open, close };
  })();

  /* ==========================================================
     12 · Friday Intern-Log banner
     ========================================================== */
  function fridayBanner() {
    const now = new Date();
    const isFriAfternoon = now.getDay() === 5 && now.getHours() >= 12 && now.getHours() < 18;
    if (!isFriAfternoon || sessionStorage.getItem('friday-dismissed') === dKey(now)) return null;
    return el('div', { class:'friday-banner' }, [
      el('span', { html:'🗓 <b>Friday afternoon — Intern Log time.</b> Brain-dump this week’s wins & blockers, then synthesize with X-Y-Z.' }),
      el('div', { style:'display:flex;gap:8px' }, [
        el('button', { class:'btn primary sm', text:'write log', onclick: () => { location.hash = '#work'; setTimeout(() => $('.work-toolbar .btn.primary')?.click(), 80); } }),
        el('button', { class:'btn ghost sm', text:'dismiss', onclick: (e) => { sessionStorage.setItem('friday-dismissed', dKey(new Date())); e.target.closest('.friday-banner').remove(); } }),
      ]),
    ]);
  }

  /* ==========================================================
     12b · Search (notes · journal · lessons)
     ========================================================== */
  const stripHtml = (h) => { const d = el('div', { html: h || '' }); return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const Search = (() => {
    function buildIndex() {
      const items = [];
      const d = Store.get();
      for (const view of ['dashboard', 'personal']) {
        for (const [date, notes] of Object.entries(d.canvas[view])) {
          (notes || []).forEach(n => {
            if (n.archived) return;
            const txt = [stripHtml(n.html), ...(n.checklist || []).map(c => stripHtml(c.html)), ...(n.images || []).map(im => im.caption)].filter(Boolean).join(' · ');
            if (txt) items.push({ kind: view === 'dashboard' ? 'dashboard note' : `#${n.tag || 'note'}`, text: txt, hash: `#${view}/${date}`, date });
          });
        }
      }
      (d.work.entries || []).forEach(e => items.push({ kind: 'journal', text: `${e.title || 'untitled'} — ${e.body || ''}`, hash: `#work/journal/${e.id}`, date: dKey(e.ts) }));
      Work.allLessons().forEach(L => {
        const st = Store.lesson(L.id);
        items.push({ kind: 'lesson', text: [L.title, L.coreConcept, st.notes, st.reflect].filter(Boolean).join(' — '), hash: `#work/lesson/${L.id}` });
      });
      return items;
    }
    function open() {
      Modal.open('Search', (body, close) => {
        const input = el('input', { class:'field', placeholder:'search notes, journal, lessons…', autocomplete:'off' });
        const results = el('div', { class:'search-results' });
        body.append(input, results);
        const index = buildIndex();
        const run = () => {
          const q = input.value.trim().toLowerCase();
          results.innerHTML = '';
          if (!q) { results.append(el('div', { class:'empty-line', text:`type to search ${index.length} items` })); return; }
          const hits = index.filter(it => it.text.toLowerCase().includes(q)).slice(0, 40);
          if (!hits.length) { results.append(el('div', { class:'empty-line', text:'no matches' })); return; }
          hits.forEach(it => {
            const i = it.text.toLowerCase().indexOf(q);
            const start = Math.max(0, i - 30);
            const snip = (start > 0 ? '…' : '') + it.text.slice(start, start + 90) + (it.text.length > start + 90 ? '…' : '');
            results.append(el('button', { class:'search-hit', onclick: () => { close(); location.hash = it.hash; } }, [
              el('span', { class:'sh-kind', text: it.kind + (it.date ? ` · ${it.date}` : '') }),
              el('span', { class:'sh-text', text: snip }),
            ]));
          });
        };
        input.addEventListener('input', run); run();
        setTimeout(() => input.focus(), 60);
      });
    }
    return { open };
  })();

  /* ==========================================================
     13 · Router + boot
     ========================================================== */
  const ROUTES = ['dashboard','work','personal'];
  function parseHash() {
    const seg = location.hash.replace(/^#/,'').split('/').filter(Boolean);
    const route = ROUTES.includes(seg[0]) ? seg[0] : 'dashboard';
    return { route, sub: seg.slice(1) };
  }

  function render() {
    const { route, sub } = parseHash();
    $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.route === route));
    const view = $('#view'); view.innerHTML = '';
    Canvas.teardown(); Pets.teardown(); Fmt.hide(); $('.popover')?.remove();
    Dashboard.reset(); Personal.reset();

    const fb = fridayBanner();
    if (fb) view.append(el('div', { style:'padding:16px 0 0' }, fb));

    if (route === 'dashboard') Dashboard.mount(view);
    else if (route === 'work') Work.mount(view, sub);
    else Personal.mount(view);
  }

  function startClock() {
    const tick = () => { $('#topdate').innerHTML = `${prettyDate()} <span class="clock">· ${prettyTime()}</span>`; };
    tick(); setInterval(tick, 1000);
  }

  /* personalization: name, theme, pets */
  function personalizeSettings() {
    const meta = Store.get().meta;
    const wrap = el('div', { class:'modal-row' });
    wrap.append(el('label', { text:'Make it yours' }));

    // name
    const nameRow = el('div', { style:'display:flex;align-items:center;gap:8px;margin-bottom:10px' });
    const nameInput = el('input', { class:'field', value: meta.name || '', placeholder:'your name (for greetings)' });
    nameInput.addEventListener('input', () => { meta.name = nameInput.value.trim(); Store.save(); });
    nameRow.append(el('span', { style:'font-size:13px;color:var(--ink-soft);white-space:nowrap', text:'call me' }), nameInput);
    wrap.append(nameRow);

    // theme
    wrap.append(el('div', { class:'kicker', style:'margin:4px 0 6px', text:'theme' }));
    const themes = [['cream','🍦 cream'],['pink','🌸 pink'],['mint','🌿 mint'],['lavender','💜 lavender'],['dark','🌙 dark']];
    const tRow = el('div', { class:'theme-row' });
    themes.forEach(([id,label]) => {
      const b = el('button', { class:'theme-chip' + (meta.theme===id?' on':''), dataset:{ id }, text: label, onclick: () => {
        meta.theme = id; Store.save(true); applyTheme();
        [...tRow.children].forEach(c => c.classList.toggle('on', c.dataset.id===id));
      } });
      tRow.append(b);
    });
    wrap.append(tRow);

    // pets
    wrap.append(el('div', { class:'kicker', style:'margin:12px 0 6px', text:'pet pals' }));
    const petWrap = el('div', { class:'pet-settings' });
    (meta.pets || []).forEach(p => {
      const row = el('label', { class:'pet-row' });
      const cb = el('input', { type:'checkbox' }); cb.checked = !!p.on;
      cb.addEventListener('change', () => { p.on = cb.checked; Store.save(true); });
      const name = el('input', { class:'field pet-name', value: p.name, maxlength:'14' });
      name.addEventListener('input', () => { p.name = name.value.trim() || p.id; Store.save(); });
      row.append(cb, el('span', { class:'pet-emoji', text: p.emoji }), name);
      petWrap.append(row);
    });
    wrap.append(petWrap);
    wrap.append(el('div', { style:'font-size:11.5px;color:var(--ink-faint);margin-top:6px', text:'pets wander your dashboard — tap one to pet it ♡ (refresh dashboard after toggling)' }));
    return wrap;
  }

  /* backup / restore — the no-backend way to move data across devices */
  function exportData() {
    const blob = new Blob([JSON.stringify(Store.get(), null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `watermellie-backup-${todayKey()}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('backup downloaded');
  }
  function importData(close) {
    const input = el('input', { type:'file', accept:'application/json,.json', style:'display:none' });
    document.body.append(input);
    input.addEventListener('change', () => {
      const f = input.files[0]; if (!f) { input.remove(); return; }
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const data = JSON.parse(rd.result);
          if (!data || !data.canvas || !data.work) throw new Error('not a workspace backup');
          if (!confirm('Replace ALL current data with this backup? (export first if unsure)')) { input.remove(); return; }
          localStorage.setItem(LS_KEY, JSON.stringify(data));
          toast('backup restored — reloading'); setTimeout(() => location.reload(), 600);
        } catch (e) { console.error(e); toast('invalid backup file'); }
        input.remove();
      };
      rd.readAsText(f);
    });
    input.click();
  }

  /* ---- cloud-sync settings block (bring-your-own Supabase) ---- */
  function syncSettings() {
    const cfg = Sync.get() || { url:'', key:'', code:'' };
    const wrap = el('div', { class:'modal-row sync-block' });
    wrap.append(el('label', { text:'Cloud sync (optional — auto-sync across devices)' }));

    const on = Sync.enabled();
    const statusLine = el('div', { class:'sync-status ' + (on ? Sync.status : 'off'), text:
      on ? `● sync on · ${Sync.status}${Sync.lastError ? ' · ' + Sync.lastError : ''}` : '○ sync off — data stays on this device only' });
    wrap.append(statusLine);

    const url = el('input', { class:'field', placeholder:'Supabase Project URL (https://xxxx.supabase.co)', value: cfg.url || '' });
    const key = el('input', { class:'field', placeholder:'Supabase anon public key', value: cfg.key || '' });
    const code = el('input', { class:'field', placeholder:'sync code (a long secret you reuse on every device)', value: cfg.code || '' });
    [url, key, code].forEach(i => { i.style.marginTop = '6px'; });
    wrap.append(url, key, code);

    const actions = el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:8px' }, [
      el('button', { class:'btn primary sm', text: on ? 'save & sync now' : 'enable sync', onclick: async () => {
        if (!url.value.trim() || !key.value.trim() || !code.value.trim()) { toast('fill url, key, and code'); return; }
        Sync.set({ url: url.value, key: key.value, code: code.value });
        toast('checking cloud…');
        const remote = await Sync.pull();
        if (Sync.status === 'error') { statusLine.textContent = '● error · ' + Sync.lastError; statusLine.className = 'sync-status error'; return; }
        if (remote && remote.data && confirm('Found existing cloud data. Load it onto THIS device? (Cancel = upload this device’s data instead)')) {
          Store.replaceAll(remote.data); toast('synced from cloud'); location.reload();
        } else { await Sync.push(); toast('this device uploaded to cloud'); statusLine.textContent = '● sync on · ok'; statusLine.className = 'sync-status ok'; }
      } }),
      on ? el('button', { class:'btn ghost sm', text:'pull now', onclick: async () => {
        const remote = await Sync.pull();
        if (remote?.data && confirm('Replace this device’s data with the cloud copy?')) { Store.replaceAll(remote.data); location.reload(); }
        else toast(remote ? 'kept local' : 'nothing in cloud yet');
      } }) : null,
      on ? el('button', { class:'btn ghost sm', text:'turn off', onclick: () => { Sync.set(null); toast('sync turned off'); statusLine.textContent='○ sync off'; statusLine.className='sync-status off'; Sync.updateBtn(); } }) : null,
    ]);
    wrap.append(actions);

    if (on) {
      const auto = el('label', { class:'sync-auto' });
      const cb = el('input', { type:'checkbox' }); cb.checked = Sync.isAuto();
      cb.addEventListener('change', () => { Sync.setAuto(cb.checked); toast(cb.checked ? 'auto-save on' : 'manual save — tap the cloud button'); });
      auto.append(cb, el('span', { text:'auto-save to cloud as I work (off = save only when I tap the cloud button)' }));
      wrap.append(auto);
    }

    wrap.append(el('div', { style:'font-size:11.5px;color:var(--ink-faint);margin-top:8px', html:
      'one-time setup (~5 min): create a free <b>Supabase</b> project → SQL editor → run the snippet in <b>README</b> → paste your Project URL + anon key here, and make up a long sync code. use the same three on every device. ' +
      'the <b>☁ cloud button</b> in the top-right saves on tap and shows status. <b>last edit wins</b>, so if you switch devices, load the latest before editing. keep your key + code private.' }));
    return wrap;
  }

  /* keyboard shortcuts (laptop): n = new note · 1/2/3 = pages · / = search */
  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === '/' && !typing) { e.preventDefault(); Search.open(); return; }
      if (typing || !$('#modal').hidden) return;
      if (e.key === '1') location.hash = '#dashboard';
      else if (e.key === '2') location.hash = '#work';
      else if (e.key === '3') location.hash = '#personal';
      else if (e.key === 'n' || e.key === 'N') {
        const r = parseHash().route;
        if (r === 'dashboard' || r === 'personal') Canvas.addNote();
      }
    });
  }

  /* PWA: register the service worker so it installs + works offline.
     Auto-reload once when a new version takes control, so updates land
     without manual cache-clearing on any device. */
  function initPWA() {
    if (!('serviceWorker' in navigator)) return;
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener?.('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) nw.postMessage?.('skip-waiting');
        });
      });
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);  // hourly update check
    }).catch(e => console.warn('sw', e));
  }

  /* ==========================================================
     14 · Delight — click sparkles + collectible floating phrases
     ========================================================== */
  const Delight = (() => {
    const BASE_PHRASES = [
      // gentle
      'better days ahead','you are growing','you’re doing enough','be proud of you','rest is productive',
      'breathe','bloom slowly','good things take time',
      // hype
      'you’ve got this','make it happen','keep going','create boldly','shine',
      // mindful
      'one day at a time','stay present','small steps count','trust the process',
      // career / design
      'design with heart','progress over perfection','ship it, then refine','your taste is leveling up',
      'great designers were once beginners','your portfolio is growing','future you says thanks',
      'curiosity is your edge','你可以的',
    ];
    const PHRASES = () => [...BASE_PHRASES, ...(Store.get().meta.affirmations || [])];
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let phraseTimer = null;
    const on = () => Store.get().meta.delight && !reduced;

    /* sparkles on click/tap */
    function sparkle(x, y) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const s = el('div', { class:'spark' });
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        const dist = 18 + Math.random() * 26;
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        s.style.setProperty('--delay', (Math.random() * 60) + 'ms');
        document.body.append(s);
        setTimeout(() => s.remove(), 700);
      }
    }
    function onPointer(e) {
      if (!on()) return;
      // skip while dragging notes/widgets to avoid clutter
      if (e.target.closest?.('.dragging')) return;
      sparkle(e.clientX, e.clientY);
    }

    /* a phrase drifts across; tap to collect it */
    function floatOne() {
      if (!on()) { schedule(); return; }
      if (document.hidden || $('.floatie')) { schedule(); return; }   // one at a time
      const txt = pick(PHRASES());
      const fromLeft = Math.random() < 0.5;
      const top = 90 + Math.random() * (window.innerHeight - 220);
      const f = el('button', { class:'floatie', text: '✦ ' + txt, title:'tap to collect' });
      f.style.top = top + 'px';
      f.style.setProperty('--from', fromLeft ? '-30vw' : '110vw');
      f.style.setProperty('--to', fromLeft ? '110vw' : '-30vw');
      f.addEventListener('click', (e) => {
        e.stopPropagation();
        const r = f.getBoundingClientRect();
        sparkle(r.left + r.width/2, r.top + r.height/2);
        const col = Store.get().meta.collected;
        if (!col.includes(txt)) { col.push(txt); Store.save(); }
        toast(`collected “${txt}” ✨  (${col.length})`);
        f.remove();
      });
      f.addEventListener('animationend', () => f.remove());
      document.body.append(f);
      schedule();
    }
    function schedule() {
      clearTimeout(phraseTimer);
      phraseTimer = setTimeout(floatOne, 18000 + Math.random() * 22000);  // every ~18–40s
    }

    function init() {
      document.addEventListener('pointerdown', onPointer);
      schedule();
    }

    /* little collection viewer for Settings */
    function collectionView() {
      const col = Store.get().meta.collected || [];
      const wrap = el('div', { class:'modal-row' });
      wrap.append(el('label', { text:`Collected phrases (${col.length})` }));
      if (!col.length) wrap.append(el('div', { class:'empty-line', text:'none yet — catch the floating ✦ phrases as they drift by' }));
      else wrap.append(el('div', { class:'collected-wrap' }, col.map(p => el('span', { class:'collected-chip', text: p }))));
      const toggle = el('label', { class:'recurring-row' });
      const cb = el('input', { type:'checkbox' }); cb.checked = !!Store.get().meta.delight;
      cb.addEventListener('change', () => { Store.get().meta.delight = cb.checked; Store.save(true); toast(cb.checked ? 'delight on ✨' : 'delight off'); });
      toggle.append(cb, el('span', { text:'sparkles & floating phrases' }));
      wrap.append(toggle);

      // your own affirmations
      const af = Store.get().meta.affirmations;
      wrap.append(el('div', { class:'kicker', style:'margin:12px 0 6px', text:'your own affirmations' }));
      const inp = el('input', { class:'field', placeholder:'add a phrase to float around…', maxlength:'60' });
      const mine = el('div', { class:'collected-wrap', style:'margin-top:8px' });
      const renderMine = () => { mine.innerHTML = ''; af.forEach((p, i) => mine.append(el('span', { class:'collected-chip mine', text: p }, iconBtn('x', 'remove', () => { af.splice(i,1); Store.save(true); renderMine(); })))); };
      const addIt = () => { const v = inp.value.trim(); if (!v) return; af.push(v); Store.save(true); inp.value=''; renderMine(); };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addIt(); } });
      wrap.append(el('div', { style:'display:flex;gap:6px' }, [ inp, el('button', { class:'btn primary sm', text:'add', onclick: addIt }) ]));
      renderMine(); wrap.append(mine);
      return wrap;
    }

    return { init, collectionView };
  })();

  /* ==========================================================
     Confetti — a little celebration burst (lesson complete!)
     ========================================================== */
  const Confetti = (() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const COLORS = ['#d6453d', '#2f6df0', '#1f9d57', '#ffd84d', '#e0577a', '#7a5fe0'];
    const EMOJI = ['✨', '🎉', '⭐', '🍉', '🌸', '🎀'];
    function burst(x, y) {
      if (reduced) return;
      const cx = x == null ? window.innerWidth / 2 : x;
      const cy = y == null ? window.innerHeight / 3 : y;
      const layer = el('div', { class: 'confetti-layer' });
      document.body.appendChild(layer);
      const N = 34;
      for (let i = 0; i < N; i++) {
        const ang = (Math.PI * 2 * i) / N + Math.random() * 0.5;
        const dist = 80 + Math.random() * 180;
        const useEmoji = i % 5 === 0;
        const p = el('div', { class: 'confetti' + (useEmoji ? ' emoji' : ''),
          text: useEmoji ? pick(EMOJI) : '' });
        if (!useEmoji) {
          p.style.background = pick(COLORS);
          p.style.width = p.style.height = (6 + Math.random() * 7) + 'px';
          if (Math.random() < 0.5) p.style.borderRadius = '50%';
        }
        p.style.left = cx + 'px'; p.style.top = cy + 'px';
        p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        p.style.animationDelay = Math.round(Math.random() * 70) + 'ms';
        layer.appendChild(p);
      }
      setTimeout(() => layer.remove(), 1400);
    }
    return { burst };
  })();

  /* ==========================================================
     Pets — cozy companions that wander a canvas surface
     ========================================================== */
  const Pets = (() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let layer = null, walkers = [], timer = null;
    const active = () => (Store.get().meta.pets || []).filter(p => p.on);

    function mount(surface) {
      teardown();
      const list = active();
      if (!list.length) return;
      layer = el('div', { class:'pets-layer' });
      surface.appendChild(layer);
      walkers = list.map(spawn);
      if (!reduced) { setTimeout(wander, 800); timer = setInterval(wander, 4200); }
    }
    function teardown() { clearInterval(timer); timer = null; layer?.remove(); layer = null; walkers = []; }

    function spawn(pet) {
      const r = layer.getBoundingClientRect();
      const x = 40 + Math.random() * Math.max(60, r.width - 120);
      const y = 90 + Math.random() * 220;
      const w = el('button', { class:'pet', title: pet.name, style:`left:${x}px; top:${y}px`, text: pet.emoji });
      w._pet = pet;
      w.addEventListener('click', (e) => { e.stopPropagation(); petIt(w); });
      layer.appendChild(w);
      return w;
    }
    function wander() {
      if (!layer) return;
      const r = layer.getBoundingClientRect();
      walkers.forEach(w => {
        if (Math.random() < 0.25) return;
        const nx = 20 + Math.random() * Math.max(60, r.width - 100);
        const ny = 80 + Math.random() * Math.max(120, Math.min(r.height, 600) - 160);
        w.style.setProperty('--face', nx < parseFloat(w.style.left) ? -1 : 1);
        w.style.left = Math.round(nx) + 'px';
        w.style.top = Math.round(ny) + 'px';
      });
    }
    function petIt(w) { w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); heart(w); toast(`${w._pet.name} ♡`); }
    function heart(w) {
      const r = w.getBoundingClientRect();
      const h = el('div', { class:'pet-heart', text:'♡', style:`left:${r.left + r.width/2}px; top:${r.top}px` });
      document.body.appendChild(h); setTimeout(() => h.remove(), 900);
    }
    function celebrate() { walkers.forEach((w, i) => setTimeout(() => { w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); heart(w); }, i * 120)); }

    return { mount, teardown, celebrate };
  })();

  function applyTheme() {
    document.body.dataset.theme = Store.get().meta.theme || 'cream';
  }

  function boot() {
    applyTheme();
    $('#settings-btn').innerHTML = svg('gear');
    $('#search-btn').innerHTML = svg('search');
    $('#search-btn').addEventListener('click', () => Search.open());
    // corner cloud button → tap to save to cloud now
    $('#sync-btn').addEventListener('click', () => Sync.pushNow());
    $('#settings-btn').addEventListener('click', () => Modal.open('Settings', (body, close) => {
      const meta = Store.get().meta;
      body.append(
        el('div', { class:'modal-row' }, el('div', { style:'font-size:13px;color:var(--ink-soft)', html:
          'data is stored locally in this browser. use <b>backup/restore</b> or turn on <b>cloud sync</b> below to move it to your iPad or phone.' })),

        personalizeSettings(),

        el('div', { class:'modal-row' }, [ el('label', { text:'Backup & restore (move data between devices)' }),
          el('div', { style:'display:flex;gap:8px;flex-wrap:wrap' }, [
            el('button', { class:'btn blue sm', text:'export backup (.json)', onclick: exportData }),
            el('button', { class:'btn ghost sm', text:'import backup', onclick: () => importData(close) }),
          ]) ]),

        syncSettings(),

        Delight.collectionView(),

        el('div', { class:'modal-row' }, [ el('label', { text:'Weather location' }),
          el('div', { style:'display:flex;gap:8px;flex-wrap:wrap' }, [
            el('button', { class:'btn ghost sm', text:'use my location', onclick: async () => { meta.coords=null; meta.weather=null; Store.save(true); await Weather.fetch7(true); toast('weather refreshed'); close(); render(); } }),
            el('button', { class:'btn ghost sm', text:'reset to SF', onclick: async () => { meta.coords={lat:SF.lat,lon:SF.lon}; meta.weather=null; Store.save(true); await Weather.fetch7(true); close(); render(); } }),
          ]) ]),

        el('div', { class:'modal-actions' }, [
          el('button', { class:'btn red', text:'erase all data', onclick: () => { if (confirm('Erase ALL workspace data? This cannot be undone.')) { localStorage.removeItem(LS_KEY); location.reload(); } } }),
          el('button', { class:'btn primary', text:'close', onclick: close }),
        ]),
      );
    }));

    if (!location.hash) location.replace('#dashboard');
    window.addEventListener('hashchange', render);
    startClock();
    initShortcuts();
    initPWA();
    Delight.init();
    render();

    // cloud sync: mark unsaved on change (auto-pushes if enabled), warn-on-load if behind
    Store.onSave(() => Sync.markDirty());
    Sync.updateBtn();
    Sync.syncOnLoad();

    let lastDay = todayKey();
    setInterval(async () => {
      await Weather.fetch7();
      const w = $('.weather-badge'); if (w) Weather.renderInto(w, Store.get().meta.weather);
      const now = todayKey();
      if (now !== lastDay) { lastDay = now; render(); toast('new page compiled'); }
    }, WEATHER_TTL);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ==========================================================
     CURRICULUM_RICH override — injected by curriculum.js
     ========================================================== */
  window.__applyCurriculum = (rich) => {
    if (!Array.isArray(rich)) return;
    rich.forEach(r => { const i = r.day - 1; if (CURRICULUM_BASE[i]) Object.assign(CURRICULUM_BASE[i], r); });
    window.__curriculumApplied = true;
    if (parseHash().route === 'work') render();
  };
  if (Array.isArray(window.__pendingCurriculum)) window.__applyCurriculum(window.__pendingCurriculum);
})();
