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
      work: { lessons: {}, customLessons: [], entries: [] },
      meta: { catImage: '', focusPos: { x: 26, y: 20 }, weather: null, coords: null },
    };
    let data;
    try { data = JSON.parse(localStorage.getItem(LS_KEY)) || structuredClone(blank); }
    catch { data = structuredClone(blank); }

    data.canvas ||= {}; data.canvas.dashboard ||= {}; data.canvas.personal ||= {};
    data.work ||= {}; data.work.lessons ||= {}; data.work.customLessons ||= []; data.work.entries ||= [];
    data.meta ||= {}; data.meta.focusPos ||= { x: 26, y: 20 };
    if (!('catImage' in data.meta)) data.meta.catImage = '';

    for (const view of ['dashboard', 'personal']) {
      for (const k of Object.keys(data.canvas[view])) {
        data.canvas[view][k] = (data.canvas[view][k] || []).map(normalizeNote);
      }
    }
    function normalizeNote(n) {
      return {
        id: n.id || uid(),
        html: n.html != null ? n.html : (n.text ? esc(n.text).replace(/\n/g, '<br>') : ''),
        checklist: Array.isArray(n.checklist) ? n.checklist : null,
        images: Array.isArray(n.images) ? n.images : [],
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
      replaceAll(next) { data = next; localStorage.setItem(LS_KEY, JSON.stringify(data)); },
      notes(view, key) { return (data.canvas[view][key] ||= []); },
      datesWithNotes(view) {
        return Object.keys(data.canvas[view]).filter(k => (data.canvas[view][k] || []).length).sort((a,b) => b.localeCompare(a));
      },
      lesson(id) { return (data.work.lessons[id] ||= { stepsDone:{}, notes:'', shots:[], figmaLink:'', reflect:'', criteria:{}, submitted:false, complete:false, completedAt:null }); },
    };
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
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[name]||''}</svg>`;
  }
  const iconBtn = (name, label, onClick, cls = '') =>
    el('button', { class:'icon-btn' + (cls ? ' ' + cls : ''), title:label, 'aria-label':label, html:svg(name), onclick:onClick });

  /* floating + add-note button */
  const addFab = (onClick) => el('button', { class:'add-fab', title:'add note', 'aria-label':'add note', html: svg('plus'), onclick: onClick });

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

  function handlePaste(e, note, node) {
    const items = [...(e.clipboardData?.items || [])].filter(it => it.type.startsWith('image/'));
    if (!items.length) return;                 // let text paste through
    e.preventDefault();
    items.forEach(it => {
      const file = it.getAsFile(); if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        note.images.push({ src: rd.result, caption: '' });
        const body = node.querySelector('.note-body-scroll');
        const existing = body.querySelector('.note-images');
        if (existing) existing.replaceWith(renderImages(note, node, false));
        else (body.querySelector('.note-checklist') || body.querySelector('.note-rich')).after(renderImages(note, node, false));
        Store.save(true); toast('image pasted');
      };
      rd.readAsDataURL(file);
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
    function teardown() { active = null; }

    function build({ view, dateKey, readonly, tags = false, onChange = () => {}, tall = false }) {
      const surface = el('div', { class:'canvas-surface dotgrid' + (tall ? ' tall' : ''), role:'application', 'aria-label':`${view} canvas` });
      const ctx = { view, dateKey, readonly, tags, onChange, onArchive: archive, onDelete: remove, onDragStart: startDrag };
      active = { surface, ctx };
      paint();
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
    function remove(id) {
      const list = Store.notes(active.ctx.view, active.ctx.dateKey);
      const i = list.findIndex(x => x.id === id);
      if (i > -1) { list.splice(i, 1); Store.save(true); paint(); active.ctx.onChange(); }
    }
    function restore(id) { const n = findNote(id); if (!n) return; n.archived = false; Store.save(true); paint(); active.ctx.onChange(); toast('restored'); }

    return { build, paint, teardown, restore, spawn, addNote, get current() { return active; } };
  })();

  /* ==========================================================
     8 · Dashboard
     ========================================================== */
  const Dashboard = (() => {
    let panelOpen = false, panelTab = 'archive', viewDate = todayKey();
    function reset() { viewDate = todayKey(); }

    function mount(root) {
      const readonly = viewDate !== todayKey();
      const wrap = el('div', { class:'dash-wrap' });

      if (readonly) wrap.append(el('div', { class:'canvas-bar' }, el('span', { class:'read-only-flag', text:`● ${viewDate} · read-only` })));

      const body = el('div', { class:'dash-body' });
      const canvasCol = el('div', { class:'dash-canvas' });
      const surface = Canvas.build({ view:'dashboard', dateKey: viewDate, readonly, onChange: refreshPanel, tall: true });
      if (!readonly) surface.prepend(focusWidget());
      canvasCol.append(surface);

      const panel = el('aside', { class:'side-panel' + (panelOpen ? ' open':''), id:'dash-panel' });
      body.append(canvasCol, panel);
      wrap.append(body);
      root.append(wrap);

      // floating cluster: archive · history · + note
      wrap.append(el('div', { class:'fab-cluster' }, [
        el('button', { class:'fab-mini', title:'archived notes', 'aria-label':'archived notes', html: svg('archive'), onclick: () => togglePanel('archive') }),
        el('button', { class:'fab-mini', title:'history', 'aria-label':'history', html: svg('clock'), onclick: () => togglePanel('history') }),
        readonly ? null : addFab(() => Canvas.addNote()),
      ]));
      refreshPanel();
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

    function togglePanel(tab) {
      const p = $('#dash-panel');
      if (panelOpen && panelTab === tab) { panelOpen = false; p.classList.remove('open'); return; }
      panelOpen = true; panelTab = tab; p.classList.add('open'); refreshPanel();
    }
    function refreshPanel() {
      const p = $('#dash-panel'); if (!p) return;
      const inner = el('div', { class:'side-inner' });
      inner.append(el('div', { class:'side-tabs' }, [ tabBtn('archive','archived'), tabBtn('history','history') ]));
      inner.append(panelTab === 'archive' ? archiveList() : historyList());
      p.innerHTML = ''; p.append(inner);
    }
    const tabBtn = (id,label) => el('button', { class:'side-tab' + (panelTab===id?' active':''), text:label, onclick:() => { panelTab=id; refreshPanel(); } });
    function archiveList() {
      const box = el('div');
      const arch = Store.notes('dashboard', viewDate).filter(n => n.archived);
      if (!arch.length) { box.append(el('div', { class:'empty-line', text:'no archived notes.' })); return box; }
      arch.forEach(n => box.append(el('div', { class:'arch-item' }, [
        el('div', { class:'arch-text', html: n.html || '(empty)' }),
        el('div', { class:'arch-row' }, [ el('span', { text:new Date(n.timestamp).toLocaleDateString() }), iconBtn('restore','restore',() => Canvas.restore(n.id)) ]),
      ])));
      return box;
    }
    function historyList() {
      const box = el('div'); const dates = Store.datesWithNotes('dashboard'); const tk = todayKey();
      if (!dates.includes(tk)) dates.unshift(tk);
      dates.forEach(k => {
        const count = Store.notes('dashboard', k).filter(n => !n.archived).length;
        box.append(el('button', { class:'hist-item' + (k===viewDate?' active':''), onclick:() => {
          viewDate = k; panelOpen = true; panelTab = 'history';
          const r = $('#view'); r.innerHTML=''; Canvas.teardown(); mount(r);
        } }, [ el('span', { text: k===tk ? `${k} · today` : k }), el('span', { class:'count', text:`${count}` }) ]));
      });
      box.append(el('div', { class:'empty-line', style:'margin-top:8px', text:'past pages are read-only · new page at 3:00 am' }));
      return box;
    }
    return { mount, reset };
  })();

  function pickImage(done) {
    const input = el('input', { type:'file', accept:'image/*', style:'display:none' });
    document.body.append(input);
    input.addEventListener('change', () => {
      const f = input.files[0];
      if (f) { const rd = new FileReader(); rd.onload = () => { done(rd.result); input.remove(); }; rd.readAsDataURL(f); }
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
        st.complete = cb.checked; st.completedAt = cb.checked ? Date.now() : null; Store.save(true);
        pane.innerHTML=''; pane.append(lessonBody(L, st, pane)); pane.scrollTop = 0;
        $$('.ix-link').forEach(a => { if (a.getAttribute('href')===`#work/lesson/${L.id}`) a.classList.toggle('complete', st.complete); });
        toast(cb.checked ? 'lesson complete ✓' : 'reopened');
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
      const ingest = (files) => [...files].filter(f=>f.type.startsWith('image/')).forEach(f => { const rd=new FileReader(); rd.onload=() => { (st.shots||=[]).push({src:rd.result,caption:''}); Store.save(true); renderShots(); }; rd.readAsDataURL(f); });
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

    return { mount };
  })();

  /* ==========================================================
     10 · Personal
     ========================================================== */
  const Personal = (() => {
    let viewDate = todayKey();
    let calCursor = logicalDate();
    function reset() { viewDate = todayKey(); calCursor = logicalDate(); }
    function remount(root) { root.innerHTML=''; Canvas.teardown(); mount(root); }

    function mount(root) {
      const readonly = viewDate !== todayKey();
      if (!readonly) ensureJournal();

      const body = el('div', { class:'personal-body' });
      const drawer = el('aside', { class:'cal-drawer' }, [
        el('h2', { text:'history' }),
        el('div', { class:'sub', text:'pages auto-file at 3:00 am' }),
      ]);
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
      if (!readonly) body.append(addFab(() => { Canvas.addNote(); refreshCal(); }));
    }

    function quickTags() {
      const wrap = el('div', {});
      wrap.append(el('div', { class:'kicker', style:'margin-bottom:6px', text:'quick log' }));
      const tags = el('div', { class:'quick-tags' });
      PERSONAL_TAGS.forEach(t => tags.append(el('button', { dataset:{ t }, text:`+ ${t}`, onclick: () => {
        if (viewDate !== todayKey()) { toast('switch to today to add'); return; }
        const preset = { tag: t };
        if (t === 'gym') preset.checklist = GYM_CHECKLIST.map(x => ({ id: uid(), html: esc(x), done:false }));
        if (t === 'journal') preset.html = `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`;
        Canvas.addNote(preset); refreshCal();
      } })));
      wrap.append(tags);
      return wrap;
    }

    function ensureJournal() {
      const list = Store.notes('personal', todayKey());
      if (list.some(n => n.tag === 'journal' && !n.archived)) return;
      list.push(Store.normalizeNote({ id: uid(), x: 30, y: 30, tag:'journal',
        html: `<b>${esc(pick(JOURNAL_PROMPTS))}</b><br>`, timestamp: Date.now() }));
      Store.save(true);
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
    Canvas.teardown(); Fmt.hide(); $('.popover')?.remove();
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

  function boot() {
    $('#settings-btn').innerHTML = svg('gear');
    $('#settings-btn').addEventListener('click', () => Modal.open('Settings', (body, close) => {
      const meta = Store.get().meta;
      body.append(
        el('div', { class:'modal-row' }, el('div', { style:'font-size:13px;color:var(--ink-soft)', html:
          'all data is stored locally in this browser. it does <b>not</b> sync between devices automatically — use backup/restore below to move it to your iPad or phone.' })),

        el('div', { class:'modal-row' }, [ el('label', { text:'Backup & restore (move data between devices)' }),
          el('div', { style:'display:flex;gap:8px;flex-wrap:wrap' }, [
            el('button', { class:'btn blue sm', text:'export backup (.json)', onclick: exportData }),
            el('button', { class:'btn ghost sm', text:'import backup', onclick: () => importData(close) }),
          ]) ]),

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
    render();

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
