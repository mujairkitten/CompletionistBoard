import { DATABASE } from '../data/database.js';
import { RACES, TRACK_TO_APT_KEY, DIST_TO_APT_KEY } from '../data/races.js';
import {
  state, escapeHtml, escapeAttr, gradeOf, GRADE_INFO,
  aptGroupsHtml, wireChips, iconHtml, weakAptitudes, sortRowsByMode, raceDateLabel, debounce,
  traineeNameKey, findRaceByExactName, raceMeta,
  addToMyList, removeFromMyList, addTrophy, removeTrophy, toggleTrophy, addTrophyFromInput
} from './core.js';
import { calPageHtml, wireCalPage, calGradeColor, CAL_YEAR_GROUPS } from './calendar.js';

let dbSort = "default";
const DB_PAGE_SIZE = 30;
let dbPage = 1;
const MY_PAGE_SIZE = 5;
let myPage = 1;

const openInlineCals = new Set();
const inlineCalTab = {};

const dbGridWired = new WeakSet();
function wireDbGridActions(grid) {
  if (dbGridWired.has(grid)) return;
  dbGridWired.add(grid);
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    const d = DATABASE[parseInt(btn.dataset.add, 10)];
    addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
  });
}

export function renderDatabase() {
  const grid = document.getElementById('db-grid');
  if (!grid) return;
  const filter = document.getElementById('db-search').value.trim().toLowerCase();
  const list = sortRowsByMode(DATABASE.filter(d => d.name.toLowerCase().includes(filter)), dbSort);
  document.getElementById('db-count').textContent = `${list.length}/${DATABASE.length}`;

  const totalPages = Math.max(1, Math.ceil(list.length / DB_PAGE_SIZE));
  if (dbPage > totalPages) dbPage = totalPages;
  if (dbPage < 1) dbPage = 1;
  const pageList = list.slice((dbPage - 1) * DB_PAGE_SIZE, dbPage * DB_PAGE_SIZE);

  const addedNames = new Set(state.myList.map(t => traineeNameKey(t.name)));
  const indexByName = new Map(DATABASE.map((d, i) => [d.name, i]));

  grid.innerHTML = pageList.map((d) => {
    const realIndex = indexByName.get(d.name);
    const already = addedNames.has(traineeNameKey(d.name));
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
  renderPagination('db-pagination-top', 'db-pagination-bottom', dbPage, totalPages, (nextPage) => {
    dbPage = nextPage;
    renderDatabase();
  });
}

function pageWindow(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  const list = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of list) {
    if (prev && p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

function renderPagination(topId, bottomId, page, totalPages, onGoToPage) {
  [topId, bottomId].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ""; return; }
    const pageButtons = pageWindow(page, totalPages).map(item => {
      if (item === '…') return `<span class="db-page-ellipsis" aria-hidden="true">…</span>`;
      const isCurrent = item === page;
      return `<button class="btn small page-number${isCurrent ? ' active' : ''}" data-page="${item}" aria-label="Go to page ${item}" ${isCurrent ? 'aria-current="page"' : ''}>${item}</button>`;
    }).join('');
    el.innerHTML = `
      <button class="btn small page-arrow" data-page-action="prev" aria-label="Previous page" title="Previous page" ${page <= 1 ? 'disabled' : ''}>‹</button>
      <span class="db-page-numbers">${pageButtons}</span>
      <button class="btn small page-arrow" data-page-action="next" aria-label="Next page" title="Next page" ${page >= totalPages ? 'disabled' : ''}>›</button>
    `;
    el.querySelectorAll('[data-page-action], [data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextPage = btn.dataset.page
          ? Number(btn.dataset.page)
          : page + (btn.dataset.pageAction === 'next' ? 1 : -1);
        onGoToPage(nextPage);
      });
    });
  });
}

export function renderMyList() {
  const wrap = document.getElementById('mylist');
  if (!wrap) return;
  const emptyEl = document.getElementById('mylist-empty');
  document.getElementById('my-count').textContent = `${state.myList.length}/${DATABASE.length}`;

  const liveIds = new Set(state.myList.map(t => t.id));
  for (const id of [...openInlineCals]) if (!liveIds.has(id)) openInlineCals.delete(id);
  for (const id of Object.keys(inlineCalTab)) if (!liveIds.has(id)) delete inlineCalTab[id];

  if (state.myList.length === 0) {
    emptyEl.style.display = "block";
    wrap.innerHTML = "";
    renderPagination('my-pagination-top', 'my-pagination-bottom', 1, 1, () => {});
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
      calBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
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

  renderPagination('my-pagination-top', 'my-pagination-bottom', myPage, totalPages, (nextPage) => {
    myPage = nextPage;
    renderMyList();
  });
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
      <div class="race-suggest-item" data-race="${escapeAttr(r.name)}">
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
        <input type="checkbox" id="cb-${t.id}-${tr.id}" aria-label="${escapeAttr(tr.name)}" ${tr.checked ? 'checked' : ''}>
        <span>${escapeHtml(tr.name)}</span>
        ${metaHtml}
        <button class="rm" id="rm-${t.id}-${tr.id}" aria-label="Remove ${escapeAttr(tr.name)}">&times;</button>
      </div>`;
    }).join("")
    : `<div style="font-size:12px;color:var(--ink-faint);font-style:italic;">No races logged yet.</div>`;

  const oobAllowed = !!state.settings.allowCustomTrophies;
  const inlineTabs = [...CAL_YEAR_GROUPS, ...(oobAllowed ? ["OoB"] : [])];
  let inlineActiveTab = inlineCalTab[t.id] || "Junior";
  if (inlineActiveTab === "OoB" && !oobAllowed) inlineActiveTab = "Junior";

  const inlineCalHtml = `
    <div class="inline-cal">
      <button class="inline-cal-toggle" id="calbtn-${t.id}" aria-expanded="${openInlineCals.has(t.id) ? 'true' : 'false'}" aria-controls="calbody-${t.id}">
        📅 Calendar
        <span class="cal-trainee-arrow${openInlineCals.has(t.id) ? ' open' : ''}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      <div class="inline-cal-body ${openInlineCals.has(t.id) ? 'open' : ''}" id="calbody-${t.id}">
        <div class="cal-tabs" id="caltabs-${t.id}" role="tablist" aria-label="Year group">
          ${inlineTabs.map(tab => `<button class="cal-tab-btn ${inlineActiveTab === tab ? 'active' : ''}" data-tab="${tab}" role="tab" aria-selected="${inlineActiveTab === tab ? 'true' : 'false'}">${tab === "OoB" ? "Out-of-Bond" : tab}</button>`).join("")}
        </div>
        <div class="cal-page" id="calpage-${t.id}" role="tabpanel">${calPageHtml(t, inlineActiveTab, { showAdd: true })}</div>
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
        <input type="text" id="addt-input-${t.id}" placeholder="Search races…" autocomplete="off" aria-label="Search races to add">
        <button class="btn small" id="addt-btn-${t.id}">+ Add</button>
        <div class="race-suggest" id="addt-suggest-${t.id}"></div>
      </div>
    </div>
    ${inlineCalHtml}
  </div>`;
}

export function addCustom() {
  if (!state.settings.allowCustomTrainees) return;
  const input = document.getElementById('custom-name');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  addToMyList(name, { turf: "A", dirt: "A", sprint: "A", mile: "A", medium: "A", long: "A" });
  input.value = "";
}

function wireBlockCollapse(toggleBtn, body) {
  if (!toggleBtn || !body) return;

  body.classList.add('open', 'overflow-visible');
  body.style.maxHeight = 'none';

  const setArrow = (open) => {
    const arrow = toggleBtn.querySelector('.cal-trainee-arrow');
    if (arrow) arrow.classList.toggle('open', open);
  };

  toggleBtn.addEventListener('click', () => {
    const willOpen = !body.classList.contains('open');
    body.classList.remove('overflow-visible');

    if (willOpen) {
      body.style.maxHeight = '0px';
      void body.offsetHeight;
      body.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    } else {
      body.style.maxHeight = body.scrollHeight + 'px';
      void body.offsetHeight;
      body.classList.remove('open');
      body.style.maxHeight = '0px';
    }
    setArrow(willOpen);
  });

  body.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'max-height') return;
    if (body.classList.contains('open')) {
      body.style.maxHeight = 'none';
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