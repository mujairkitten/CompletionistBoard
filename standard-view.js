// Trainee Database + My List (the default, non-Calendar-View layout) — plus
// all trophy/trainee CRUD, since both views trigger the same mutations.

import { DATABASE } from './data/database.js';
import { RACES, TRACK_TO_APT_KEY, DIST_TO_APT_KEY } from './data/races.js';
import {
  state, saveState, uid, escapeHtml, gradeOf, GRADE_INFO,
  aptGroupsHtml, wireChips, iconHtml, weakAptitudes, sortRowsByMode, raceDateLabel
} from './core.js';
import { calPageHtml, wireCalPage, calGradeColor, CAL_YEAR_GROUPS } from './calendar.js';

export let dbSort = "default"; // default | az | za

// Runtime-only UI state (not persisted): which My List cards have their inline
// calendar open, and which tab each currently shows.
const openInlineCals = new Set();
const inlineCalTab = {};

export function renderDatabase() {
  const grid = document.getElementById('db-grid');
  const filter = document.getElementById('db-search').value.trim().toLowerCase();
  const list = sortRowsByMode(DATABASE.filter(d => d.name.toLowerCase().includes(filter)), dbSort);
  document.getElementById('db-count').textContent = `${list.length} / ${DATABASE.length}`;
  document.getElementById('db-gate').textContent = DATABASE.length;

  const addedNames = new Set(state.myList.map(t => t.name.toLowerCase()));

  grid.innerHTML = list.map((d) => {
    const realIndex = DATABASE.indexOf(d);
    const already = addedNames.has(d.name.toLowerCase());
    return `
    <div class="db-card">
      <span class="db-num">${String(realIndex + 1).padStart(2, '0')}</span>
      <div class="db-card-top">
        ${iconHtml(d.name, 40)}
        <div class="db-name">${escapeHtml(d.name)}</div>
      </div>
      ${aptGroupsHtml(d.apt)}
      <button class="btn small add-btn" data-add="${realIndex}" ${already ? 'disabled' : ''}>${already ? '✓ In my list' : '+ Add to my list'}</button>
    </div>`;
  }).join("");

  wireChips(grid);
  grid.querySelectorAll('[data-add]:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = DATABASE[parseInt(btn.dataset.add, 10)];
      addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
    });
  });
}

export function addToMyList(name, apt) {
  state.myList.push({ id: uid(), name, aptitudes: apt, trophies: [] });
  saveState();
  renderMyList();
  renderDatabase();
}

export function renderMyList() {
  const wrap = document.getElementById('mylist');
  const emptyEl = document.getElementById('mylist-empty');
  document.getElementById('my-gate').textContent = state.myList.length;

  if (state.myList.length === 0) {
    emptyEl.style.display = "block";
    wrap.innerHTML = "";
    return;
  }
  emptyEl.style.display = "none";

  wrap.innerHTML = state.myList.map(t => myCardHtml(t)).join("");
  wireChips(wrap);

  state.myList.forEach(t => {
    const delBtn = document.getElementById(`del-${t.id}`);
    if (delBtn) delBtn.addEventListener('click', () => removeFromMyList(t.id));

    const addTBtn = document.getElementById(`addt-btn-${t.id}`);
    const addTInput = document.getElementById(`addt-input-${t.id}`);
    const suggestBox = document.getElementById(`addt-suggest-${t.id}`);

    if (addTBtn) addTBtn.addEventListener('click', () => {
      addTrophyFromInput(t.id, addTInput.value);
      addTInput.value = "";
      hideSuggestBox(suggestBox);
    });
    if (addTInput) {
      addTInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          addTrophyFromInput(t.id, addTInput.value);
          addTInput.value = "";
          hideSuggestBox(suggestBox);
        } else if (e.key === 'Escape') {
          hideSuggestBox(suggestBox);
        }
      });
      if (state.settings.allowRaceSearch) {
        addTInput.addEventListener('input', () => {
          renderRaceSuggestions(t, addTInput.value, suggestBox, addTInput);
        });
        addTInput.addEventListener('focus', () => {
          renderRaceSuggestions(t, addTInput.value, suggestBox, addTInput);
        });
        addTInput.addEventListener('blur', () => {
          // Delay so a click on a suggestion registers before the box hides.
          setTimeout(() => hideSuggestBox(suggestBox), 150);
        });
      }
    }

    t.trophies.forEach(tr => {
      const cb = document.getElementById(`cb-${t.id}-${tr.id}`);
      if (cb) cb.addEventListener('change', () => toggleTrophy(t.id, tr.id));
      const rm = document.getElementById(`rm-${t.id}-${tr.id}`);
      if (rm) rm.addEventListener('click', () => removeTrophy(t.id, tr.id));
    });

    const calBtn = document.getElementById(`calbtn-${t.id}`);
    if (calBtn) calBtn.addEventListener('click', () => {
      if (openInlineCals.has(t.id)) openInlineCals.delete(t.id); else openInlineCals.add(t.id);
      renderMyList();
    });
    const tabsBox = document.getElementById(`caltabs-${t.id}`);
    if (tabsBox) tabsBox.querySelectorAll('.cal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        inlineCalTab[t.id] = btn.dataset.tab;
        renderMyList();
      });
    });
    const pageBox = document.getElementById(`calpage-${t.id}`);
    if (pageBox) wireCalPage(pageBox, t, renderMyList);
  });
}

export function findRaceByExactName(name) {
  const q = (name || "").trim().toLowerCase();
  return RACES.find(r => r.name.toLowerCase() === q);
}

export function raceMeta(race) {
  return { grade: race.grade, track: race.track, distance: race.distance, year: race.year, turn: race.turn, month: race.month };
}

function hideSuggestBox(box) {
  if (box) box.classList.remove('show');
}

function renderRaceSuggestions(trainee, query, box, inputEl) {
  if (!box) return;
  const q = (query || "").trim().toLowerCase();
  const alreadyAdded = new Set(trainee.trophies.map(tr => tr.name.toLowerCase()));

  let matches = RACES.filter(r => !alreadyAdded.has(r.name.toLowerCase()));
  if (q) matches = matches.filter(r => r.name.toLowerCase().includes(q));

  if (matches.length === 0) {
    box.innerHTML = `<div class="race-suggest-empty">${q ? "No matching race — Enter adds it as a custom trophy." : "Type to search the race calendar."}</div>`;
  } else {
    box.innerHTML = matches.map(r => {
      const trackKey = TRACK_TO_APT_KEY[r.track];
      const distKey = DIST_TO_APT_KEY[r.distance];
      const trackGrade = gradeOf(trainee.aptitudes[trackKey]);
      const distGrade = gradeOf(trainee.aptitudes[distKey]);
      const trackTier = GRADE_INFO[trackGrade].tier;
      const distTier = GRADE_INFO[distGrade].tier;
      return `
      <div class="race-suggest-item" data-race="${escapeHtml(r.name)}">
        <span class="race-grade-tag" style="background:${calGradeColor(r.grade)}">${r.grade}</span>
        <span class="race-info">
          <span class="race-name">${escapeHtml(r.name)}</span>
          <span class="race-date">${escapeHtml(raceDateLabel(r))}</span>
        </span>
        <span class="race-meta">
          <span class="mini-tag" style="background:var(--${trackTier})">${r.track}</span>
          <span class="mini-tag" style="background:var(--${distTier})">${r.distance}</span>
        </span>
      </div>`;
    }).join("");
  }
  box.classList.add('show');

  box.querySelectorAll('.race-suggest-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault(); // keep focus so blur doesn't fire before click
      const race = findRaceByExactName(item.dataset.race);
      if (race) {
        addTrophy(trainee.id, race.name, raceMeta(race));
        inputEl.value = "";
        hideSuggestBox(box);
      }
    });
  });
}

export function addTrophyFromInput(tid, rawName) {
  const name = (rawName || "").trim();
  if (!name) return;
  if (!state.settings.allowRaceSearch) {
    addTrophy(tid, name, null);
    return;
  }
  const race = findRaceByExactName(name);
  if (!race && !state.settings.allowCustomTrophies) return;
  addTrophy(tid, name, race ? raceMeta(race) : null);
}

function myCardHtml(t) {
  const weak = weakAptitudes(t.aptitudes);
  const focusHtml = weak.length
    ? `<div class="focus-line"><b>Needs sparks:</b> ${weak.map(w => `${w.label} (${w.grade})`).join(", ")}</div>`
    : `<div class="focus-line clear"><b>Aptitudes clear</b> — nothing below C.</div>`;

  const total = t.trophies.length;
  const done = t.trophies.filter(x => x.checked).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const trophyHtml = total
    ? t.trophies.map(tr => {
      let metaHtml = "";
      if (tr.track && tr.distance) {
        const trackKey = TRACK_TO_APT_KEY[tr.track];
        const distKey = DIST_TO_APT_KEY[tr.distance];
        const trackGrade = gradeOf(t.aptitudes[trackKey]);
        const distGrade = gradeOf(t.aptitudes[distKey]);
        const dateHtml = tr.year ? `<span class="trophy-date">${escapeHtml(raceDateLabel(tr))}</span>` : "";
        metaHtml = `
          ${dateHtml}
          <span class="mini-tag" style="background:${calGradeColor(tr.grade)};color:#12141a">${tr.grade || ""}</span>
          <span class="mini-tag" style="background:var(--${GRADE_INFO[trackGrade].tier})" title="${tr.track} aptitude: ${trackGrade}">${tr.track}</span>
          <span class="mini-tag" style="background:var(--${GRADE_INFO[distGrade].tier})" title="${tr.distance} aptitude: ${distGrade}">${tr.distance}</span>
        `;
      }
      return `
      <div class="trophy-item ${tr.checked ? 'checked' : ''}">
        <input type="checkbox" id="cb-${t.id}-${tr.id}" ${tr.checked ? 'checked' : ''}>
        <span>${escapeHtml(tr.name)}</span>
        ${metaHtml}
        <button class="rm" id="rm-${t.id}-${tr.id}">&times;</button>
      </div>`;
    }).join("")
    : `<div style="font-size:12px;color:var(--ink-faint);font-style:italic;">No races logged yet.</div>`;

  const oobAllowed = !!state.settings.allowCustomTrophies;
  const inlineTabs = [...CAL_YEAR_GROUPS, ...(oobAllowed ? ["OoB"] : [])];
  let inlineActiveTab = inlineCalTab[t.id] || "Junior";
  if (inlineActiveTab === "OoB" && !oobAllowed) inlineActiveTab = "Junior";

  const inlineCalHtml = `
    <div class="inline-cal">
      <button class="inline-cal-toggle" id="calbtn-${t.id}">📅 Calendar <span class="chev">${openInlineCals.has(t.id) ? '▾' : '▸'}</span></button>
      <div class="inline-cal-body ${openInlineCals.has(t.id) ? 'open' : ''}" id="calbody-${t.id}">
        <div class="cal-tabs" id="caltabs-${t.id}">
          ${inlineTabs.map(tab => `<button class="cal-tab-btn ${inlineActiveTab === tab ? 'active' : ''}" data-tab="${tab}">${tab === "OoB" ? "Out-of-Bond" : tab}</button>`).join("")}
        </div>
        <div class="cal-page" id="calpage-${t.id}">${calPageHtml(t, inlineActiveTab)}</div>
      </div>
    </div>`;

  return `
  <div class="mycard">
    <div class="mycard-head">
      ${iconHtml(t.name, 48)}
      <div class="mycard-name">${escapeHtml(t.name)}</div>
      <button class="btn small ghost" id="del-${t.id}">Remove</button>
    </div>
    <div class="cats-row">${aptGroupsHtml(t.aptitudes)}</div>
    ${focusHtml}
    <div class="trophy-section">
      <div class="trophy-top">
        <span class="label">Completionist</span>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-pct">${done}/${total} · ${pct}%</span>
      </div>
      <div class="trophy-list">${trophyHtml}</div>
      <div class="add-trophy">
        <input type="text" id="addt-input-${t.id}" placeholder="${!state.settings.allowRaceSearch ? 'Add a custom trophy' : (state.settings.allowCustomTrophies ? 'Search races (G1–G3) or type a custom trophy' : 'Search races (G1–G3)')}" autocomplete="off">
        <button class="btn small" id="addt-btn-${t.id}">+ Add</button>
        ${state.settings.allowRaceSearch ? `<div class="race-suggest" id="addt-suggest-${t.id}"></div>` : ""}
      </div>
    </div>
    ${inlineCalHtml}
  </div>`;
}

export function removeFromMyList(id) {
  state.myList = state.myList.filter(t => t.id !== id);
  saveState(); renderMyList(); renderDatabase();
}
export function addTrophy(tid, name, meta) {
  name = (name || "").trim();
  if (!name) return;
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  const trophy = { id: uid(), name, checked: false };
  if (meta) {
    trophy.grade = meta.grade; trophy.track = meta.track; trophy.distance = meta.distance;
    trophy.year = meta.year; trophy.turn = meta.turn; trophy.month = meta.month;
  }
  t.trophies.push(trophy);
  saveState(); renderMyList();
}
export function toggleTrophy(tid, trid) {
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  const tr = t.trophies.find(x => x.id === trid);
  if (!tr) return;
  tr.checked = !tr.checked;
  saveState(); renderMyList();
}
export function removeTrophy(tid, trid) {
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  t.trophies = t.trophies.filter(x => x.id !== trid);
  saveState(); renderMyList();
}
export function addCustom() {
  if (!state.settings.allowCustomTrainees) return;
  const input = document.getElementById('custom-name');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  addToMyList(name, { turf: "A", dirt: "A", short: "A", mile: "A", medium: "A", long: "A" });
  input.value = "";
}

export function exportList() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = "completionist-list.json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
export function importList(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.myList)) throw new Error("bad format");
      const existingIds = new Set(state.myList.map(t => t.id));
      parsed.myList.forEach(t => {
        if (!t.id || existingIds.has(t.id)) t.id = uid();
        state.myList.push(t);
      });
      saveState(); renderMyList(); renderDatabase();
    } catch (e) {
      alert("Couldn't read that file — expected a Completionist Board export.");
    }
  };
  reader.readAsText(file);
}

// Wires the Trainee Database's search box, sort buttons, custom-trainee row,
// and the top-bar Export/Import buttons. Called once from main.js on init.
export function wireStandardViewControls() {
  document.getElementById('db-search').addEventListener('input', renderDatabase);
  document.getElementById('custom-add-btn').addEventListener('click', addCustom);
  document.getElementById('custom-name').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
  document.getElementById('export-btn').addEventListener('click', exportList);
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = "";
  });

  document.querySelectorAll('#db-sort .sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      dbSort = btn.dataset.sort;
      document.querySelectorAll('#db-sort .sort-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderDatabase();
    });
  });
}
