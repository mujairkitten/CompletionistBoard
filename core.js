import { RACES } from './data/races.js';

export const GRADES = ["A", "B", "C", "D", "E", "F", "G"];
export const GRADE_INFO = {
  A: { pct: "100%", tip: "Baseline. No penalty, safe to race here.", tier: "a" },
  B: { pct: "-10%", tip: "Minor drag. One matching spark usually bumps this to A.", tier: "b" },
  C: { pct: "-20%", tip: "Noticeable penalty. Worth 4-6 sparks before racing seriously.", tier: "c" },
  D: { pct: "-40%", tip: "Steep drop. Push through only if the trophy is required. Needs 7-9 sparks.", tier: "d" },
  E: { pct: "-60%", tip: "Severe — accel takes a hit too on distance. Avoid unless mandatory. Needs atleast 10 sparks.", tier: "e" },
  F: { pct: "-80%", tip: "Near-crippling. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "f" },
  G: { pct: "-90%", tip: "Worst case. Only for a must-have trophy. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "g" },
};
export const CATS = [
  { key: "turf", label: "Turf", group: "surface", stat: "Power / Acceleration" },
  { key: "dirt", label: "Dirt", group: "surface", stat: "Power / Acceleration" },
  { key: "sprint", label: "Sprint", group: "distance", stat: "Speed" },
  { key: "mile", label: "Mile", group: "distance", stat: "Speed" },
  { key: "medium", label: "Medium", group: "distance", stat: "Speed" },
  { key: "long", label: "Long", group: "distance", stat: "Speed" },
];
export const SURFACE_KEYS = ["turf", "dirt"];
export const DISTANCE_KEYS = ["sprint", "mile", "medium", "long"];

const SAFE_ID = /^[a-z0-9]{7}$/;
const MAX_NAME_LENGTH = 120;
const MAX_NOTE_LENGTH = 500;
const MAX_TROPHIES_PER_TRAINEE = 300;

function defaultSettings() {
  return {
    allowCustomTrainees: true,
    allowRaceSearch: true,
    allowCustomTrophies: true,
    calendarViewMode: false,
    lightMode: false,
    colorTheme: 'turf',
    activeTraineeId: null
  };
}

export let state = {
  myList: [],
  settings: defaultSettings()
};

let saveQueue = Promise.resolve();

export function uid() { return Math.random().toString(36).slice(2, 9); }

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function nextId(usedIds) {
  let id;
  do { id = uid(); } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

function normalizedId(value, usedIds) {
  if (typeof value === 'string' && SAFE_ID.test(value) && !usedIds.has(value)) {
    usedIds.add(value);
    return value;
  }
  return nextId(usedIds);
}

function normalizeAptitude(value) {
  if (typeof value === 'string') return GRADE_INFO[value] ? value : null;
  if (!isPlainObject(value) || !GRADE_INFO[value.base] || !GRADE_INFO[value.alt]) return null;
  return {
    base: value.base,
    alt: value.alt,
    note: safeText(value.note, MAX_NOTE_LENGTH)
  };
}

function normalizeAptitudes(value) {
  if (!isPlainObject(value)) return null;
  const aptitudes = {};
  for (const { key } of CATS) {
    const aptitude = normalizeAptitude(value[key]);
    if (!aptitude) return null;
    aptitudes[key] = aptitude;
  }
  return aptitudes;
}

function normalizeTrophy(value, usedIds) {
  if (!isPlainObject(value)) return null;
  const name = safeText(value.name, MAX_NAME_LENGTH);
  if (!name) return null;
  const trophy = {
    id: normalizedId(value.id, usedIds),
    name,
    checked: value.checked === true
  };
  const race = RACES.find(item => item.name.toLowerCase() === name.toLowerCase());
  if (race) {
    trophy.grade = race.grade;
    trophy.track = race.track;
    trophy.distance = race.distance;
    trophy.year = race.year;
    trophy.turn = race.turn;
    trophy.month = race.month;
  }
  return trophy;
}

function normalizeCalendarOrder(value) {
  if (!isPlainObject(value)) return {};
  const validRaceNames = new Set(RACES.map(race => race.name));
  const order = {};
  for (const [slotKey, names] of Object.entries(value)) {
    if (!Array.isArray(names) || !/^[A-Z][a-z]+\|(Early|Late)$/.test(slotKey)) continue;
    order[slotKey] = names
      .filter(name => typeof name === 'string' && validRaceNames.has(name))
      .slice(0, RACES.length);
  }
  return order;
}

function normalizeTrainee(value, usedTraineeIds) {
  if (!isPlainObject(value)) return null;
  const name = safeText(value.name, MAX_NAME_LENGTH);
  const aptitudes = normalizeAptitudes(value.aptitudes);
  if (!name || !aptitudes) return null;

  const usedTrophyIds = new Set();
  const trophies = Array.isArray(value.trophies)
    ? value.trophies.slice(0, MAX_TROPHIES_PER_TRAINEE)
      .map(trophy => normalizeTrophy(trophy, usedTrophyIds))
      .filter(Boolean)
    : [];

  return {
    id: normalizedId(value.id, usedTraineeIds),
    name,
    aptitudes,
    trophies,
    calendarOrder: normalizeCalendarOrder(value.calendarOrder)
  };
}

function normalizeSettings(value, trainees) {
  const raw = isPlainObject(value) ? value : {};
  const settings = defaultSettings();
  for (const key of ['allowCustomTrainees', 'allowRaceSearch', 'allowCustomTrophies', 'calendarViewMode', 'lightMode']) {
    if (typeof raw[key] === 'boolean') settings[key] = raw[key];
  }
  settings.colorTheme = raw.colorTheme === 'dirt' ? 'dirt' : 'turf';
  if (!settings.allowRaceSearch) settings.allowCustomTrophies = true;
  if (typeof raw.activeTraineeId === 'string' && trainees.some(t => t.id === raw.activeTraineeId)) {
    settings.activeTraineeId = raw.activeTraineeId;
  }
  return settings;
}

function normalizeTraineeList(value, usedTraineeIds = new Set()) {
  if (!Array.isArray(value)) return [];
  return value
    .map(trainee => normalizeTrainee(trainee, usedTraineeIds))
    .filter(Boolean);
}

export function normalizeImportedTrainees(value, existingTrainees = []) {
  const usedTraineeIds = new Set(
    Array.isArray(existingTrainees) ? existingTrainees.map(t => t.id).filter(id => SAFE_ID.test(id)) : []
  );
  return normalizeTraineeList(value, usedTraineeIds);
}

function normalizeState(value) {
  const raw = isPlainObject(value) ? value : {};
  const myList = normalizeTraineeList(raw.myList);
  return { myList, settings: normalizeSettings(raw.settings, myList) };
}

export async function loadState() {
  try {
    if (window.storage && typeof window.storage.get === 'function') {
      const res = await window.storage.get('mylist', false);
      if (res && res.value) { state = normalizeState(JSON.parse(res.value)); }
    } else {
      const val = localStorage.getItem('mylist');
      if (val) { state = normalizeState(JSON.parse(val)); }
    }
  } catch (e) { console.error("Storage load failed", e); }
  state = normalizeState(state);
}

export function saveState() {
  let snapshot;
  try {
    snapshot = JSON.stringify(state);
  } catch (e) {
    console.error("Storage serialization failed", e);
    return Promise.resolve();
  }

  saveQueue = saveQueue.catch(() => {}).then(async () => {
    try {
      if (window.storage && typeof window.storage.set === 'function') {
        await window.storage.set('mylist', snapshot, false);
      } else {
        localStorage.setItem('mylist', snapshot);
      }
    } catch (e) {
      console.error("Storage save failed", e);
    }
  });
  return saveQueue;
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
export function gradeOf(v) { return typeof v === 'string' ? v : v.base; }
export function altOf(v) { return typeof v === 'string' ? null : v; }

export const tooltipEl = document.getElementById('tooltip');
export function showTooltip(target, catKey, aptValue) {
  const cat = CATS.find(c => c.key === catKey);
  const grade = gradeOf(aptValue);
  const alt = altOf(aptValue);
  const info = GRADE_INFO[grade];
  let html = `
    <div class="tt-head" style="color:var(--${info.tier})">${cat.label} — ${grade}${alt ? ' / ' + alt.alt : ''}</div>
    <div class="tt-stat">${cat.stat} · ${info.pct}</div>
    <div>${info.tip}</div>
  `;
  if (alt) {
    html += `<div class="tt-variant">${escapeHtml(alt.note)}</div>`;
  }
  tooltipEl.innerHTML = html;

  const rect = target.getBoundingClientRect();
  tooltipEl.style.left = Math.min(rect.left, window.innerWidth - 236) + "px";

  const gap = 8;
  const tooltipHeight = tooltipEl.getBoundingClientRect().height;
  let top = rect.top - tooltipHeight - gap;
  if (top < gap) top = rect.bottom + gap;
  tooltipEl.style.top = top + "px";
  tooltipEl.classList.add('show');
}
export function hideTooltip() { tooltipEl.classList.remove('show'); }

export function chipHtml(apt, key) {
  const cat = CATS.find(c => c.key === key);
  const value = apt[key];
  const grade = gradeOf(value);
  const alt = altOf(value);
  const tier = GRADE_INFO[grade].tier;
  const label = `${cat.label} ${grade}${alt ? '/' + alt.alt : ''}`;
  const borderMix = `color-mix(in srgb, var(--${tier}) 55%, transparent)`;
  const glowMix = `color-mix(in srgb, var(--${tier}) 80%, transparent)`;
  let bg = `color-mix(in srgb, var(--${tier}) 24%, transparent)`;
  if (alt) {
    const altTier = GRADE_INFO[alt.alt].tier;
    bg = `linear-gradient(90deg, color-mix(in srgb, var(--${tier}) 26%, transparent) 50%, color-mix(in srgb, var(--${altTier}) 26%, transparent) 50%)`;
  }
  const style = `--chip-bg:${bg};--chip-border:${borderMix};--chip-glow:${glowMix};`;
  const safeJson = JSON.stringify(value).replace(/'/g, '&#39;');
  return `<button class="chip" style="${style}"
            data-cat="${key}" data-json='${safeJson}'
          >${label}</button>`;
}
export function aptGroupsHtml(apt) {
  return `<div class="apt-groups">
    <div class="apt-container">${SURFACE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
    <div class="apt-container">${DISTANCE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
  </div>`;
}
export function wireChips(root) {
  root.querySelectorAll('.trainee-icon img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = img.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
    });
  });
  root.querySelectorAll('.chip').forEach(p => {
    const value = JSON.parse(p.dataset.json);
    p.addEventListener('mouseenter', () => showTooltip(p, p.dataset.cat, value));
    p.addEventListener('mouseleave', hideTooltip);
    p.addEventListener('focus', () => showTooltip(p, p.dataset.cat, value));
    p.addEventListener('blur', hideTooltip);
  });
}

export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
export function iconHtml(name, size) {
  const slug = slugify(name);
  const initial = (name.trim()[0] || '?').toUpperCase();
  return `<div class="trainee-icon" style="--icon-size:${size}px">
    <img src="icons/${slug}.png" alt="" loading="lazy">
    <span class="icon-fallback">${initial}</span>
  </div>`;
}
export function blankIconHtml(size) {
  return `<div class="trainee-icon trainee-icon-blank" style="--icon-size:${size}px"></div>`;
}
export function raceDateLabel(r) {
  const yearLabel = r.year.replace(/,\s*/g, '/');
  return `${yearLabel} ${r.turn} ${r.month}`;
}

export function weakAptitudes(apt) {
  const dThreshold = GRADES.indexOf("D");
  return CATS
    .map(c => ({ ...c, grade: gradeOf(apt[c.key]) }))
    .filter(c => GRADES.indexOf(c.grade) >= dThreshold)
    .sort((a, b) => GRADES.indexOf(b.grade) - GRADES.indexOf(a.grade));
}

export function sortRowsByMode(rows, mode) {
  if (mode === "az") return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  if (mode === "za") return [...rows].sort((a, b) => b.name.localeCompare(a.name));
  return rows;
}
