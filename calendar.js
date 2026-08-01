// Full Calendar View (the alternate, optional layout) plus the calendar
// "model" logic (which races belong to which date slot, done/pending state,
// custom ordering) that's shared with the inline per-card calendar rendered
// by standard-view.js.

import { DATABASE } from './data/database.js';
import { RACES } from './data/races.js';
import {
  state, saveState, uid, escapeHtml, gradeOf, iconHtml, blankIconHtml,
  aptGroupsHtml, wireChips, sortRowsByMode, raceDateLabel
} from './core.js';
import { addToMyList, removeFromMyList, toggleTrophy, findRaceByExactName, exportList, importList } from './standard-view.js';
import { applySettingsUI, renderMainView, closeSettingsPanel } from './main.js';

// 3 in-career years, 12 months x Early/Late = 24 date slots each.
// "Out-of-Bond" has no fixed date, so it isn't part of the grid.
export const CAL_YEAR_GROUPS = ["Junior", "Classic", "Senior"];
const CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CAL_TURNS = ["Early", "Late"];

export function raceAppliesToYear(race, yearGroup) {
  return race.year.split(",").map(s => s.trim()).includes(yearGroup);
}
export function calSlotKey(month, turn) { return `${month}|${turn}`; }
function racesForSlot(yearGroup, month, turn) {
  return RACES.filter(r => raceAppliesToYear(r, yearGroup) && r.month === month && r.turn === turn);
}
function trophyForRace(t, raceName) {
  return t.trophies.find(x => x.name.toLowerCase() === raceName.toLowerCase());
}
function isRaceDone(t, raceName) {
  const tr = trophyForRace(t, raceName);
  return !!(tr && tr.checked);
}
// Pending order for a slot: any saved custom order first, then remaining races in dataset order.
function pendingOrderForSlot(t, slotKey, pendingRaces) {
  if (!t.calendarOrder) t.calendarOrder = {};
  const saved = t.calendarOrder[slotKey] || [];
  const savedRaces = saved.map(n => pendingRaces.find(r => r.name === n)).filter(Boolean);
  const savedNames = new Set(savedRaces.map(r => r.name));
  const rest = pendingRaces.filter(r => !savedNames.has(r.name));
  return [...savedRaces, ...rest];
}
// Reorders a slot's pending list by moving draggedName to just before targetName
// (or to the end, if targetName is null — e.g. dropped on empty cell space).
function reorderRaceInSlot(t, slotKey, allSlotRaces, draggedName, targetName) {
  const pending = allSlotRaces.filter(r => !isRaceDone(t, r.name));
  let ordered = pendingOrderForSlot(t, slotKey, pending).map(r => r.name);
  ordered = ordered.filter(n => n !== draggedName);
  if (targetName && ordered.includes(targetName)) {
    ordered.splice(ordered.indexOf(targetName), 0, draggedName);
  } else {
    ordered.push(draggedName);
  }
  if (!t.calendarOrder) t.calendarOrder = {};
  t.calendarOrder[slotKey] = ordered;
  saveState();
}
let dragCtx = null;
function calendarToggleRace(t, race) {
  let tr = trophyForRace(t, race.name);
  if (!tr) {
    tr = { id: uid(), name: race.name, checked: true, grade: race.grade, track: race.track, distance: race.distance, year: race.year, turn: race.turn, month: race.month };
    t.trophies.push(tr);
  } else {
    tr.checked = !tr.checked;
  }
  saveState();
}

let calViewTab = "Junior";

let calTraineePanelOpen = false;
let calTraineeSearch = "";
let calTraineeSort = "default"; // default | az | za

// Placeholder shown in Calendar View when My List is empty — lets the grid
// render (greyed out) instead of just showing a wall of text.
const CAL_EMPTY_TRAINEE = {
  id: "__empty__",
  name: "Add Trainee Here...",
  aptitudes: { turf: "A", dirt: "A", sprint: "A", mile: "A", medium: "A", long: "A" },
  trophies: []
};

function sortTraineeRows(rows) {
  return sortRowsByMode(rows, calTraineeSort);
}

export function calGradeColor(grade) {
  if (grade === 'G1') return 'var(--g1)';
  if (grade === 'G2') return 'var(--g2)';
  return 'var(--g3)'; // G3
}
function calRaceRowHtml(r, opts) {
  const draggable = !!opts.draggable;
  const checked = !!opts.checked;
  return `
    <div class="cal-race-row${checked ? ' done' : ''}" ${draggable ? 'draggable="true"' : ''} data-race="${escapeHtml(r.name)}">
      ${draggable ? '<span class="drag-handle" title="Drag to reorder">⠿</span>' : ''}
      <input type="checkbox" class="cal-tick" data-race="${escapeHtml(r.name)}" ${checked ? 'checked' : ''}>
      <span class="cal-grade-tag" style="background:${calGradeColor(r.grade)}">${r.grade}</span>
      <span class="cal-race-info">
        <span class="cal-race-name">${escapeHtml(r.name)}</span>
        <span class="cal-race-sub">${r.track} · ${r.distance}</span>
      </span>
    </div>`;
}

// ---- Calendar rendering (shared by the full Calendar View and the inline per-card calendar) ----
function calCellHtml(t, yearGroup, month, turn) {
  const slotKey = calSlotKey(month, turn);
  const slotRaces = racesForSlot(yearGroup, month, turn);
  const done = slotRaces.filter(r => isRaceDone(t, r.name));
  const pending = pendingOrderForSlot(t, slotKey, slotRaces.filter(r => !isRaceDone(t, r.name)));
  const label = `<div class="cal-cell-label">${month.slice(0, 3)} · ${turn}</div>`;

  if (slotRaces.length === 0) {
    return `<div class="cal-cell cal-cell-empty" data-slot="${slotKey}" data-year="${yearGroup}">${label}</div>`;
  }

  const pendingHtml = pending.map(r => calRaceRowHtml(r, { draggable: true, checked: false })).join("");

  const doneHtml = done.length ? `<div class="cal-done-divider">${done.map(r => calRaceRowHtml(r, { draggable: false, checked: true })).join("")}</div>` : "";

  return `<div class="cal-cell" data-slot="${slotKey}" data-year="${yearGroup}">${label}${pendingHtml}${doneHtml}</div>`;
}

function calGridHtml(t, yearGroup) {
  const slots = [];
  CAL_MONTHS.forEach(month => CAL_TURNS.forEach(turn => slots.push({ month, turn })));
  const cellsHtml = slots.map(s => calCellHtml(t, yearGroup, s.month, s.turn)).join("");
  return `<div class="cal-grid-46">${cellsHtml}</div>`;
}

function calOobHtml(t) {
  const oob = t.trophies.filter(tr => !tr.track);
  if (oob.length === 0) {
    return `<div class="empty-note" style="margin-top:8px;">No custom (non-calendar) trophies logged for this trainee yet.</div>`;
  }
  return `<div class="cal-oob-list">${oob.map(tr => `
    <div class="trophy-item ${tr.checked ? 'checked' : ''}">
      <input type="checkbox" class="cal-oob-tick" data-tid="${tr.id}" ${tr.checked ? 'checked' : ''}>
      <span>${escapeHtml(tr.name)}</span>
    </div>`).join("")}</div>`;
}

export function calPageHtml(t, tab) {
  if (tab === "OoB") return calOobHtml(t);
  return calGridHtml(t, tab);
}

export function wireCalPage(root, t, onChange) {
  root.querySelectorAll('.cal-tick').forEach(cb => {
    cb.addEventListener('change', () => {
      const race = RACES.find(r => r.name === cb.dataset.race);
      if (race) { calendarToggleRace(t, race); onChange(); }
    });
  });

  root.querySelectorAll('.cal-race-row[draggable="true"]').forEach(row => {
    row.addEventListener('dragstart', (e) => {
      const cell = row.closest('.cal-cell');
      dragCtx = { slotKey: cell.dataset.slot, raceName: row.dataset.race };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.race);
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      root.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      dragCtx = null;
    });
    row.addEventListener('dragover', (e) => {
      if (!dragCtx) return;
      e.preventDefault();
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      row.classList.remove('drag-over');
      if (!dragCtx) return;
      const cell = row.closest('.cal-cell');
      const slotKey = cell.dataset.slot;
      if (slotKey !== dragCtx.slotKey) return; // reordering only makes sense within the same date slot
      const yearGroup = cell.dataset.year;
      const [month, turn] = slotKey.split('|');
      reorderRaceInSlot(t, slotKey, racesForSlot(yearGroup, month, turn), dragCtx.raceName, row.dataset.race);
      onChange();
    });
  });

  // Dropping on empty cell space (not on a specific row) sends the race to the end of the pending list.
  root.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('dragover', (e) => { if (dragCtx) e.preventDefault(); });
    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!dragCtx) return;
      const slotKey = cell.dataset.slot;
      if (slotKey !== dragCtx.slotKey) return;
      const yearGroup = cell.dataset.year;
      const [month, turn] = slotKey.split('|');
      reorderRaceInSlot(t, slotKey, racesForSlot(yearGroup, month, turn), dragCtx.raceName, null);
      onChange();
    });
  });

  root.querySelectorAll('.cal-oob-tick').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleTrophy(t.id, cb.dataset.tid);
      onChange();
    });
  });
}

function calTraineePanelHtml(activeTrainee) {
  const q = calTraineeSearch.trim().toLowerCase();
  const mineRows = sortTraineeRows(state.myList.filter(t => t.name.toLowerCase().includes(q)));
  const myNames = new Set(state.myList.map(t => t.name.toLowerCase()));
  const otherRows = sortTraineeRows(DATABASE.filter(d => !myNames.has(d.name.toLowerCase()) && d.name.toLowerCase().includes(q)));

  const mineHtml = mineRows.map(t => `
    <div class="cal-trainee-row ${t.id === activeTrainee.id ? 'active' : ''}" data-switch="${t.id}">
      ${iconHtml(t.name, 28)}
      <span class="cal-trainee-row-name">${escapeHtml(t.name)}</span>
      ${t.id === activeTrainee.id ? '<span class="cal-trainee-current">Current</span>' : ''}
      <button class="cal-trainee-remove" data-remove="${t.id}" title="Remove from My List" aria-label="Remove ${escapeHtml(t.name)} from My List">&times;</button>
    </div>`).join("") || `<div class="cal-trainee-empty">No matches in My List.</div>`;

  const otherHtml = otherRows.map(d => `
    <div class="cal-trainee-row" data-name="${escapeHtml(d.name)}">
      ${iconHtml(d.name, 28)}
      <span class="cal-trainee-row-name">${escapeHtml(d.name)}</span>
      <button class="btn small" data-addswitch="${escapeHtml(d.name)}">+ Add to my list</button>
    </div>`).join("") || `<div class="cal-trainee-empty">No matches.</div>`;

  return `
  <div class="cal-trainee-panel" id="cal-trainee-panel">
    <input type="text" class="search" id="cal-trainee-search" placeholder="Search trainees…" value="${escapeHtml(calTraineeSearch)}">
    <div class="cal-trainee-sort">
      <button class="sort-btn ${calTraineeSort === 'default' ? 'active' : ''}" data-sort="default">Default</button>
      <button class="sort-btn ${calTraineeSort === 'az' ? 'active' : ''}" data-sort="az">A–Z</button>
      <button class="sort-btn ${calTraineeSort === 'za' ? 'active' : ''}" data-sort="za">Z–A</button>
    </div>
    <div class="cal-trainee-group-label">In My List</div>
    <div class="cal-trainee-list">${mineHtml}</div>
    <div class="cal-trainee-group-label">All trainees</div>
    <div class="cal-trainee-list">${otherHtml}</div>
  </div>`;
}

function calSidebarHtml(activeTrainee, isEmpty) {
  const iconBlock = isEmpty ? blankIconHtml(96) : iconHtml(activeTrainee.name, 96);
  return `
  <div class="cal-sidebar${calTraineePanelOpen ? ' panel-open' : ''}">
    <div class="cal-trainee-box${calTraineePanelOpen ? ' panel-open' : ''}">
      ${iconBlock}
      <button class="cal-trainee-name-btn" id="cal-trainee-btn">
        <span class="cal-trainee-name">${escapeHtml(activeTrainee.name)}</span>
        <span class="cal-trainee-arrow">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      ${calTraineePanelOpen ? calTraineePanelHtml(activeTrainee) : ''}
    </div>
    ${!isEmpty ? `
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">Aptitude chips</div>
      ${aptGroupsHtml(activeTrainee.aptitudes)}
    </div>` : ''}
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">Find a race</div>
      <div class="cal-locate-wrap">
        <input type="text" class="search" id="cal-locate-input" placeholder="Search races…" autocomplete="off">
        <div class="race-suggest" id="cal-locate-suggest"></div>
      </div>
    </div>
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">More tools</div>
      <div class="cal-tool-list">
        <button class="btn small" id="cal-export-btn">Export list</button>
        <label class="btn small" for="cal-import-file">Import list</label>
        <input type="file" id="cal-import-file" accept=".json">
        <button class="btn small ghost" id="cal-exit-btn">Exit Calendar View</button>
      </div>
    </div>
  </div>`;
}

function wireCalLocate(host) {
  const input = document.getElementById('cal-locate-input');
  const box = document.getElementById('cal-locate-suggest');
  if (!input || !box) return;

  const showResults = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.classList.remove('show'); return; }
    const matches = RACES.filter(r => r.name.toLowerCase().includes(q)).slice(0, 20);
    box.innerHTML = matches.length === 0
      ? `<div class="race-suggest-empty">No matching race.</div>`
      : matches.map(r => `
        <div class="race-suggest-item" data-race="${escapeHtml(r.name)}">
          <span class="race-grade-tag" style="background:${calGradeColor(r.grade)}">${r.grade}</span>
          <span class="race-info">
            <span class="race-name">${escapeHtml(r.name)}</span>
            <span class="race-date">${escapeHtml(raceDateLabel(r))}</span>
          </span>
          <span class="race-meta">
            <span class="mini-tag" style="background:var(--panel-2);color:var(--ink-dim)">${r.track} · ${r.distance}</span>
          </span>
        </div>`).join("");
    box.classList.add('show');
  };

  input.addEventListener('input', showResults);
  input.addEventListener('focus', showResults);
  input.addEventListener('blur', () => setTimeout(() => box.classList.remove('show'), 150));
  box.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.race-suggest-item');
    if (!item) return;
    e.preventDefault();
    locateRaceInCalendar(item.dataset.race);
    input.value = "";
    box.classList.remove('show');
  });
}

function locateRaceInCalendar(name) {
  const race = findRaceByExactName(name);
  if (!race) return;
  if (!raceAppliesToYear(race, calViewTab)) {
    const groups = race.year.split(",").map(s => s.trim());
    calViewTab = groups[0];
  }
  const targetYear = calViewTab;
  renderCalendarView();
  requestAnimationFrame(() => {
    const slotKey = calSlotKey(race.month, race.turn);
    const cell = document.querySelector(`.cal-cell[data-slot="${CSS.escape(slotKey)}"][data-year="${targetYear}"]`);
    if (cell) {
      cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cell.classList.add('cal-cell-flash');
      setTimeout(() => cell.classList.remove('cal-cell-flash'), 1600);
    }
  });
}

function wireCalTraineePanel(host, activeTrainee) {
  const btn = document.getElementById('cal-trainee-btn');
  if (btn) btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSettingsPanel();

    if (calTraineePanelOpen) {
      // Closing: animate the arrow and panel back on their existing nodes
      // first (a real before/after state to transition between), then
      // rebuild once the transition has actually finished.
      calTraineePanelOpen = false;
      const arrow = btn.querySelector('.cal-trainee-arrow');
      const panel = document.getElementById('cal-trainee-panel');
      if (arrow) arrow.classList.remove('open');
      if (panel) panel.classList.remove('open');
      setTimeout(renderCalendarView, 250);
    } else {
      // Opening: rebuild immediately with the arrow/panel in their closed
      // visual state, force a reflow so the browser registers that state,
      // then flip both to "open" in the same frame so the rotation and the
      // panel's reveal animate together instead of one lagging the other.
      calTraineePanelOpen = true;
      renderCalendarView();
      const freshPanel = document.getElementById('cal-trainee-panel');
      const freshArrow = document.querySelector('#cal-trainee-btn .cal-trainee-arrow');
      if (freshPanel) freshPanel.getBoundingClientRect(); // force reflow
      requestAnimationFrame(() => {
        if (freshArrow) freshArrow.classList.add('open');
        if (freshPanel) freshPanel.classList.add('open');
      });
    }
  });

  const panel = document.getElementById('cal-trainee-panel');
  if (!panel) return;

  panel.addEventListener('click', e => e.stopPropagation());

  const searchInput = document.getElementById('cal-trainee-search');
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    searchInput.addEventListener('input', () => {
      calTraineeSearch = searchInput.value;
      renderCalendarView();
    });
  }

  panel.querySelectorAll('.sort-btn').forEach(b => {
    b.addEventListener('click', () => {
      calTraineeSort = b.dataset.sort;
      renderCalendarView();
    });
  });

  panel.querySelectorAll('[data-switch]').forEach(row => {
    row.addEventListener('click', () => {
      state.settings.activeTraineeId = row.dataset.switch;
      calTraineePanelOpen = false;
      saveState();
      renderCalendarView();
    });
  });

  panel.querySelectorAll('[data-addswitch]').forEach(b => {
    b.addEventListener('click', () => {
      const d = DATABASE.find(x => x.name === b.dataset.addswitch);
      if (!d) return;
      addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
      const added = state.myList[state.myList.length - 1];
      state.settings.activeTraineeId = added.id;
      calTraineePanelOpen = false;
      saveState();
      renderCalendarView();
    });
  });

  panel.querySelectorAll('[data-remove]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromMyList(b.dataset.remove);
      renderCalendarView();
    });
  });
}

export function closeCalTraineePanel() {
  if (calTraineePanelOpen) {
    calTraineePanelOpen = false;
    const arrow = document.querySelector('.cal-trainee-arrow');
    const panel = document.getElementById('cal-trainee-panel');
    if (arrow) arrow.classList.remove('open');
    if (panel) panel.classList.remove('open');
    setTimeout(renderCalendarView, 250);
  }
}

export function renderCalendarView() {
  const host = document.getElementById('calendar-view');
  if (!host) return;

  const isEmpty = state.myList.length === 0;
  let activeTrainee;
  if (isEmpty) {
    activeTrainee = CAL_EMPTY_TRAINEE;
  } else {
    activeTrainee = state.myList.find(t => t.id === state.settings.activeTraineeId);
    if (!activeTrainee) {
      activeTrainee = state.myList[0];
      state.settings.activeTraineeId = activeTrainee.id;
      saveState();
    }
  }

  if (calViewTab === "OoB" && !state.settings.allowCustomTrophies) calViewTab = "Junior";
  const mainTabs = [...CAL_YEAR_GROUPS, ...(state.settings.allowCustomTrophies ? ["OoB"] : [])];

  host.innerHTML = `
    <div class="calendar-layout">
      ${calSidebarHtml(activeTrainee, isEmpty)}
      <div class="cal-main${isEmpty ? ' cal-disabled' : ''}">
        <div class="cal-tabs cal-tabs-main" id="cal-main-tabs">
          ${mainTabs.map(tab => `<button class="cal-tab-btn ${calViewTab === tab ? 'active' : ''}" data-tab="${tab}">${tab === "OoB" ? "Out-of-Bond" : tab}</button>`).join("")}
        </div>
        <div class="cal-page" id="cal-main-page">${calPageHtml(activeTrainee, calViewTab)}</div>
      </div>
    </div>`;

  wireChips(host);
  wireCalTraineePanel(host, activeTrainee);
  wireCalLocate(host);

  document.getElementById('cal-main-tabs').querySelectorAll('.cal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      calViewTab = btn.dataset.tab;
      renderCalendarView();
    });
  });

  wireCalPage(document.getElementById('cal-main-page'), activeTrainee, renderCalendarView);

  const exportBtn = document.getElementById('cal-export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportList);
  const importFile = document.getElementById('cal-import-file');
  if (importFile) importFile.addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = "";
  });
  const exitBtn = document.getElementById('cal-exit-btn');
  if (exitBtn) exitBtn.addEventListener('click', () => {
    state.settings.calendarViewMode = false;
    saveState();
    applySettingsUI();
    renderMainView();
  });
}