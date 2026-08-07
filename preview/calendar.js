import { DATABASE } from './data/database.js';
import { RACES } from './data/races.js';
import {
  state, saveState, uid, escapeHtml, gradeOf, iconHtml, blankIconHtml,
  aptGroupsHtml, wireChips, sortRowsByMode, raceDateLabel, debounce
} from './core.js';
import { addToMyList, removeFromMyList, toggleTrophy, findRaceByExactName } from './standard-view.js';
import {
  closeSettingsPanel,
  toggleMode, toggleColorTheme, setAllowCustomTrainees, setAllowRaceSearch,
  setAllowCustomTrophies, setCalendarViewMode, openBackupModal, openAboutModal
} from './main.js';

export const CAL_YEAR_GROUPS = ["Junior", "Classic", "Senior"];
const CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CAL_TURNS = ["Early", "Late"];

export function raceAppliesToYear(race, yearGroup) {
  return race.year.split(",").map(s => s.trim()).includes(yearGroup);
}
export function calSlotKey(month, turn) { return `${month}|${turn}`; }

const SLOT_RACE_MAP = (() => {
  const map = new Map();
  for (const yearGroup of CAL_YEAR_GROUPS) {
    for (const month of CAL_MONTHS) {
      for (const turn of CAL_TURNS) {
        const key = `${yearGroup}|${calSlotKey(month, turn)}`;
        map.set(key, RACES.filter(r => raceAppliesToYear(r, yearGroup) && r.month === month && r.turn === turn));
      }
    }
  }
  return map;
})();

function racesForSlot(yearGroup, month, turn) {
  return SLOT_RACE_MAP.get(`${yearGroup}|${calSlotKey(month, turn)}`) || [];
}
function trophyForRace(t, raceName) {
  return t.trophies.find(x => x.name.toLowerCase() === raceName.toLowerCase());
}
function isRaceDone(t, raceName) {
  const tr = trophyForRace(t, raceName);
  return !!(tr && tr.checked);
}
function pendingOrderForSlot(t, slotKey, pendingRaces) {
  if (!t.calendarOrder) t.calendarOrder = {};
  const saved = t.calendarOrder[slotKey] || [];
  const savedRaces = saved.map(n => pendingRaces.find(r => r.name === n)).filter(Boolean);
  const savedNames = new Set(savedRaces.map(r => r.name));
  const rest = pendingRaces.filter(r => !savedNames.has(r.name));
  return [...savedRaces, ...rest];
}
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
let calTraineePanelRevealed = false;
let calTraineeSearch = "";
let calTraineeSort = "default";

let moreToolsOpen = null;
function moreToolsDefaultOpen() {
  return !window.matchMedia('(max-width: 720px)').matches;
}

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
  return 'var(--g3)';
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
      if (slotKey !== dragCtx.slotKey) return;
      const yearGroup = cell.dataset.year;
      const [month, turn] = slotKey.split('|');
      reorderRaceInSlot(t, slotKey, racesForSlot(yearGroup, month, turn), dragCtx.raceName, row.dataset.race);
      onChange();
    });
  });

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
      <button class="sort-btn ${calTraineeSort === 'az' ? 'active' : ''}" data-sort="az">A-Z</button>
      <button class="sort-btn ${calTraineeSort === 'za' ? 'active' : ''}" data-sort="za">Z-A</button>
    </div>
    <div class="cal-trainee-group-label">In My List</div>
    <div class="cal-trainee-list">${mineHtml}</div>
    <div class="cal-trainee-group-label">All trainees</div>
    <div class="cal-trainee-list">${otherHtml}</div>
  </div>`;
}

function calSidebarHtml(activeTrainee, isEmpty) {
  if (moreToolsOpen === null) moreToolsOpen = moreToolsDefaultOpen();
  const iconBlock = isEmpty ? blankIconHtml(72) : iconHtml(activeTrainee.name, 72);
  return `
  <div class="cal-sidebar${calTraineePanelOpen ? ' panel-open' : ''}">
    <div class="cal-trainee-card${calTraineePanelOpen ? ' panel-open' : ''}">
      <div class="cal-trainee-card-icon">${iconBlock}</div>
      <div class="cal-trainee-card-right">
        <div class="cal-trainee-card-name-row">
          <button class="cal-trainee-name-btn" id="cal-trainee-btn">
            <span class="cal-trainee-name">${escapeHtml(activeTrainee.name)}</span>
            <span class="cal-trainee-arrow">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
        ${!isEmpty ? `<div class="cal-trainee-card-chips">${aptGroupsHtml(activeTrainee.aptitudes)}</div>` : ''}
      </div>
      ${calTraineePanelOpen ? calTraineePanelHtml(activeTrainee) : ''}
    </div>
    <div class="cal-tool-box">
      <div class="cal-tool-box-title">Find a race</div>
      <div class="cal-locate-wrap">
        <input type="text" class="search" id="cal-locate-input" placeholder="Search races…" autocomplete="off">
        <div class="race-suggest" id="cal-locate-suggest"></div>
      </div>
    </div>
    <div class="cal-tool-box">
      <button class="cal-tool-box-toggle" id="cal-tools-toggle">
        <span class="cal-tool-box-title">More tools</span>
        <span class="cal-trainee-arrow${moreToolsOpen ? ' open' : ''}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      <div class="cal-tool-list${moreToolsOpen ? ' open' : ''}">
        <button class="btn small" id="cal-backup-btn">Backup</button>
        <div class="settings-divider"></div>
        <div class="settings-group-label">Appearance</div>
        <div class="settings-row settings-row-icons">
          <button class="icon-pill-btn" id="cal-mode-toggle-btn" aria-label="Toggle light/dark mode" title="Toggle mode">
            <svg class="icon-toggle-sun" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 2.5V5M12 19V21.5M4.2 4.2L6 6M18 18L19.8 19.8M2.5 12H5M19 12H21.5M4.2 19.8L6 18M18 6L19.8 4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg class="icon-toggle-moon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-pill-btn" id="cal-theme-toggle-btn" aria-label="Toggle Turf/Dirt color theme" title="Toggle color theme">
            <svg class="icon-toggle-turf" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 20V13C6 10 8 8 8 8C8 8 6 10 6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 20V10C12 7 14 5 14 5C14 5 12 7 12 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 20V13C18 10 20 8 20 8C20 8 18 10 18 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg class="icon-toggle-dirt" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18L8 9L12 15L15 10L21 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 20H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="settings-divider"></div>
        <div class="settings-group-label">Trainees</div>
        <div class="settings-row">
          <span>Custom trainees</span>
          <label class="switch"><input type="checkbox" id="cal-toggle-custom-trainee" ${state.settings.allowCustomTrainees ? 'checked' : ''}><span class="switch-slider"></span></label>
        </div>
        <div class="settings-divider"></div>
        <div class="settings-group-label">Trophies &amp; races</div>
        <div class="settings-row">
          <span>Race search</span>
          <label class="switch"><input type="checkbox" id="cal-toggle-race-search" ${state.settings.allowRaceSearch ? 'checked' : ''}><span class="switch-slider"></span></label>
        </div>
        <div class="settings-row settings-row-sub${state.settings.allowRaceSearch ? '' : ' settings-row-disabled'}" id="cal-toggle-custom-trophy-row">
          <span>Custom trophies</span>
          <label class="switch"><input type="checkbox" id="cal-toggle-custom-trophy" ${state.settings.allowCustomTrophies ? 'checked' : ''} ${state.settings.allowRaceSearch ? '' : 'disabled'}><span class="switch-slider"></span></label>
        </div>
        <div class="settings-divider"></div>
        <button class="btn small settings-about-btn" id="cal-about-btn">About Completionist Board</button>
        <div class="settings-divider"></div>
        <button class="btn small ghost" id="cal-exit-btn">Exit Calendar View</button>
      </div>
    </div>
  </div>`;
}

function wireCalLocate(host) {
  const input = document.getElementById('cal-locate-input');
  const box = document.getElementById('cal-locate-suggest');
  if (!input || !box) return;
  const toolBox = input.closest('.cal-tool-box');

  const setOpen = (open) => {
    box.classList.toggle('show', open);
    if (toolBox) toolBox.classList.toggle('suggest-open', open);
  };

  const showResults = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { setOpen(false); return; }
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
    setOpen(true);
  };

  input.addEventListener('input', showResults);
  input.addEventListener('focus', showResults);
  input.addEventListener('blur', () => setTimeout(() => setOpen(false), 150));
  box.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.race-suggest-item');
    if (!item) return;
    e.preventDefault();
    locateRaceInCalendar(item.dataset.race);
    input.value = "";
    setOpen(false);
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
      calTraineePanelOpen = false;
      calTraineePanelRevealed = false;
      const arrow = btn.querySelector('.cal-trainee-arrow');
      const panel = document.getElementById('cal-trainee-panel');
      if (arrow) arrow.classList.remove('open');
      if (panel) panel.classList.remove('open');
      setTimeout(renderCalendarView, 250);
    } else {
      calTraineePanelOpen = true;
      renderCalendarView();
      const freshPanel = document.getElementById('cal-trainee-panel');
      const freshArrow = document.querySelector('#cal-trainee-btn .cal-trainee-arrow');
      if (freshPanel) freshPanel.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (freshArrow) freshArrow.classList.add('open');
        if (freshPanel) freshPanel.classList.add('open');
        calTraineePanelRevealed = true;
      });
    }
  });

  const panel = document.getElementById('cal-trainee-panel');
  if (!panel) return;

  panel.addEventListener('click', e => e.stopPropagation());

  if (calTraineePanelOpen && calTraineePanelRevealed) {
    const arrow = document.querySelector('#cal-trainee-btn .cal-trainee-arrow');
    panel.classList.add('open');
    if (arrow) arrow.classList.add('open');
  }

  const searchInput = document.getElementById('cal-trainee-search');
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    searchInput.addEventListener('input', debounce(() => {
      calTraineeSearch = searchInput.value;
      renderCalendarView();
    }, 150));
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
      calTraineePanelRevealed = false;
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
      calTraineePanelRevealed = false;
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
    calTraineePanelRevealed = false;
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

  const toolsToggle = document.getElementById('cal-tools-toggle');
  if (toolsToggle) toolsToggle.addEventListener('click', () => {
    moreToolsOpen = !moreToolsOpen;
    renderCalendarView();
  });

  const calBackupBtn = document.getElementById('cal-backup-btn');
  if (calBackupBtn) calBackupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBackupModal();
  });
  const calAboutBtn = document.getElementById('cal-about-btn');
  if (calAboutBtn) calAboutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openAboutModal();
  });
  const calModeToggleBtn = document.getElementById('cal-mode-toggle-btn');
  if (calModeToggleBtn) calModeToggleBtn.addEventListener('click', toggleMode);
  const calThemeToggleBtn = document.getElementById('cal-theme-toggle-btn');
  if (calThemeToggleBtn) calThemeToggleBtn.addEventListener('click', toggleColorTheme);
  const calTrainToggle = document.getElementById('cal-toggle-custom-trainee');
  if (calTrainToggle) calTrainToggle.addEventListener('change', () => setAllowCustomTrainees(calTrainToggle.checked));
  const calRaceSearchToggle = document.getElementById('cal-toggle-race-search');
  if (calRaceSearchToggle) calRaceSearchToggle.addEventListener('change', () => setAllowRaceSearch(calRaceSearchToggle.checked));
  const calTrophyToggle = document.getElementById('cal-toggle-custom-trophy');
  if (calTrophyToggle) calTrophyToggle.addEventListener('change', () => setAllowCustomTrophies(calTrophyToggle.checked));

  const exitBtn = document.getElementById('cal-exit-btn');
  if (exitBtn) exitBtn.addEventListener('click', () => {
    setCalendarViewMode(false);
  });
}