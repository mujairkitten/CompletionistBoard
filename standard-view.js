import { DATABASE } from './data/database.js';
import { RACES, TRACK_TO_APT_KEY, DIST_TO_APT_KEY } from './data/races.js';
import {
  state, saveState, uid, escapeHtml, gradeOf, GRADE_INFO, normalizeImportedTrainees,
  aptGroupsHtml, wireChips, iconHtml, weakAptitudes, sortRowsByMode, raceDateLabel, debounce
} from './core.js';
import { calPageHtml, wireCalPage, calGradeColor, CAL_YEAR_GROUPS } from './calendar.js';
import { renderMainView } from './main.js';

export let dbSort = "default";
export const DB_PAGE_SIZE = 30;
let dbPage = 1;
export const MY_PAGE_SIZE = 5;
let myPage = 1;

const openInlineCals = new Set();
const inlineCalTab = {};

let dbGridActionsWired = false;
function wireDbGridActions(grid) {
  if (dbGridActionsWired) return;
  dbGridActionsWired = true;
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    const d = DATABASE[parseInt(btn.dataset.add, 10)];
    addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
  });
}

export function renderDatabase() {
  const grid = document.getElementById('db-grid');
  const filter = document.getElementById('db-search').value.trim().toLowerCase();
  const list = sortRowsByMode(DATABASE.filter(d => d.name.toLowerCase().includes(filter)), dbSort);
  document.getElementById('db-count').textContent = `${list.length}/${DATABASE.length}`;

  const totalPages = Math.max(1, Math.ceil(list.length / DB_PAGE_SIZE));
  if (dbPage > totalPages) dbPage = totalPages;
  if (dbPage < 1) dbPage = 1;
  const pageList = list.slice((dbPage - 1) * DB_PAGE_SIZE, dbPage * DB_PAGE_SIZE);

  const addedNames = new Set(state.myList.map(t => t.name.toLowerCase()));
  const indexByName = new Map(DATABASE.map((d, i) => [d.name, i]));

  grid.innerHTML = pageList.map((d) => {
    const realIndex = indexByName.get(d.name);
    const already = addedNames.has(d.name.toLowerCase());
    return `
    <div class="db-card">
      ${filter ? '' : `<span class="db-num">${String(realIndex + 1).padStart(2, '0')}</span>`}
      <div class="db-card-top${filter ? ' no-num' : ''}">
        ${iconHtml(d.name, 40)}
        <div class="db-name">${escapeHtml(d.name)}</div>
      </div>
      ${aptGroupsHtml(d.apt)}
      <button class="btn small add-btn" data-add="${realIndex}" ${already ? 'disabled' : ''}>${already ? '✓ In my list' : '+ Add to my list'}</button>
    </div>`;
  }).join("");

  wireChips(grid);
  wireDbGridActions(grid);
  renderPagination('db-pagination-top', 'db-pagination-bottom', dbPage, totalPages, (delta) => {
    dbPage += delta;
    renderDatabase();
  }, 'db-grid');
}

function renderPagination(topId, bottomId, page, totalPages, onGoToPage, scrollTargetId) {
  [topId, bottomId].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    el.innerHTML = `
      <button class="btn small" data-page-action="prev" ${page <= 1 ? 'disabled' : ''}>‹ Prev</button>
      <span class="db-page-info">Page ${page} of ${totalPages}</span>
      <button class="btn small" data-page-action="next" ${page >= totalPages ? 'disabled' : ''}>Next ›</button>
    `;
    el.querySelectorAll('[data-page-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        onGoToPage(btn.dataset.pageAction === 'next' ? 1 : -1);
        const target = document.getElementById(scrollTargetId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
  document.getElementById('my-count').textContent = `${state.myList.length}/${DATABASE.length}`;

  if (state.myList.length === 0) {
    emptyEl.style.display = "block";
    wrap.innerHTML = "";
    renderPagination('my-pagination-top', 'my-pagination-bottom', 1, 1, () => {}, 'mylist');
    return;
  }
  emptyEl.style.display = "none";

  const totalPages = Math.max(1, Math.ceil(state.myList.length / MY_PAGE_SIZE));
  if (myPage > totalPages) myPage = totalPages;
  if (myPage < 1) myPage = 1;
  const pageList = state.myList.slice((myPage - 1) * MY_PAGE_SIZE, myPage * MY_PAGE_SIZE);

  wrap.innerHTML = pageList.map(t => myCardHtml(t)).join("");
  wireChips(wrap);

  pageList.forEach(t => {
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
      addTInput.addEventListener('input', () => {
        renderRaceSuggestions(t, addTInput.value, suggestBox, addTInput);
      });
      addTInput.addEventListener('focus', () => {
        renderRaceSuggestions(t, addTInput.value, suggestBox, addTInput);
      });
      addTInput.addEventListener('blur', () => {
        setTimeout(() => hideSuggestBox(suggestBox), 150);
      });
    }

    t.trophies.forEach(tr => {
      const cb = document.getElementById(`cb-${t.id}-${tr.id}`);
      if (cb) cb.addEventListener('change', () => toggleTrophy(t.id, tr.id));
      const rm = document.getElementById(`rm-${t.id}-${tr.id}`);
      if (rm) rm.addEventListener('click', () => removeTrophy(t.id, tr.id));
    });

    const calBtn = document.getElementById(`calbtn-${t.id}`);
    if (calBtn) calBtn.addEventListener('click', () => {
      const willOpen = !openInlineCals.has(t.id);
      if (willOpen) openInlineCals.add(t.id); else openInlineCals.delete(t.id);
      const calBody = document.getElementById(`calbody-${t.id}`);
      const calChev = calBtn.querySelector('.cal-trainee-arrow');
      if (calBody) calBody.classList.toggle('open', willOpen);
      if (calChev) calChev.classList.toggle('open', willOpen);
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

  renderPagination('my-pagination-top', 'my-pagination-bottom', myPage, totalPages, (delta) => {
    myPage += delta;
    renderMyList();
  }, 'mylist');
}

export function findRaceByExactName(name) {
  const q = (name || "").trim().toLowerCase();
  return RACES.find(r => r.name.toLowerCase() === q);
}

export function raceMeta(race) {
  return { grade: race.grade, track: race.track, distance: race.distance, year: race.year, turn: race.turn, month: race.month };
}

function hideSuggestBox(box) {
  if (!box) return;
  box.classList.remove('show');
  const card = box.closest('.mycard');
  if (card) card.classList.remove('suggest-open');
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
  const openCard = box.closest('.mycard');
  if (openCard) openCard.classList.add('suggest-open');

  box.querySelectorAll('.race-suggest-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
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
      <button class="inline-cal-toggle" id="calbtn-${t.id}">
        📅 Calendar
        <span class="cal-trainee-arrow${openInlineCals.has(t.id) ? ' open' : ''}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      <div class="inline-cal-body ${openInlineCals.has(t.id) ? 'open' : ''}" id="calbody-${t.id}">
        <div class="cal-tabs" id="caltabs-${t.id}">
          ${inlineTabs.map(tab => `<button class="cal-tab-btn ${inlineActiveTab === tab ? 'active' : ''}" data-tab="${tab}">${tab === "OoB" ? "Out-of-Bond" : tab}</button>`).join("")}
        </div>
        <div class="cal-page" id="calpage-${t.id}">${calPageHtml(t, inlineActiveTab, { showAdd: true })}</div>
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
        <input type="text" id="addt-input-${t.id}" placeholder="Search races…" autocomplete="off">
        <button class="btn small" id="addt-btn-${t.id}">+ Add</button>
        <div class="race-suggest" id="addt-suggest-${t.id}"></div>
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
  addToMyList(name, { turf: "A", dirt: "A", sprint: "A", mile: "A", medium: "A", long: "A" });
  input.value = "";
}

function backupFilename() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const yy = pad(d.getFullYear() % 100);
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `CompBoard-${yy}${mm}${dd}-${hh}${mi}${ss}.json`;
}
export function exportList() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = backupFilename();
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importListFromJsonText(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.myList)) throw new Error("bad format");
    const knownNames = new Set(state.myList.map(trainee => trainee.name.toLocaleLowerCase()));
    const trainees = normalizeImportedTrainees(parsed.myList, state.myList).filter(trainee => {
      const key = trainee.name.toLocaleLowerCase();
      if (knownNames.has(key)) return false;
      knownNames.add(key);
      return true;
    });
    state.myList.push(...trainees);
    saveState(); renderMainView();
    if (trainees.length !== parsed.myList.length) {
      alert(`Imported ${trainees.length} trainee${trainees.length === 1 ? '' : 's'}. Duplicate or invalid entries were skipped.`);
    }
    return true;
  } catch (e) {
    alert("Couldn't read that — expected a Completionist Board export.");
    return false;
  }
}
export function importListFromText(text) {
  return importListFromJsonText(text);
}
export function importList(file) {
  const reader = new FileReader();
  reader.onload = () => { importListFromJsonText(reader.result); };
  reader.readAsText(file);
}

function wireBlockCollapse(toggleBtn, body) {
  if (!toggleBtn || !body) return;
  toggleBtn.addEventListener('click', () => {
    const willOpen = !body.classList.contains('open');
    if (!willOpen) {
      body.classList.remove('overflow-visible');
    }
    body.classList.toggle('open', willOpen);
    const arrow = toggleBtn.querySelector('.cal-trainee-arrow');
    if (arrow) arrow.classList.toggle('open', willOpen);
  });
  body.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'max-height') return;
    if (body.classList.contains('open')) {
      body.classList.add('overflow-visible');
    }
  });
}

export function wireStandardViewControls() {
  document.getElementById('db-search').addEventListener('input', debounce(() => {
    dbPage = 1;
    renderDatabase();
  }, 120));
  document.getElementById('custom-add-btn').addEventListener('click', addCustom);
  document.getElementById('custom-name').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });

  document.querySelectorAll('#db-sort .sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      dbSort = btn.dataset.sort;
      dbPage = 1;
      document.querySelectorAll('#db-sort .sort-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderDatabase();
    });
  });

  wireBlockCollapse(document.getElementById('db-collapse-btn'), document.getElementById('db-block-body'));
  wireBlockCollapse(document.getElementById('my-collapse-btn'), document.getElementById('my-block-body'));
}