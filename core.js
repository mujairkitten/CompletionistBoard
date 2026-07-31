// Shared constants, persistent state, and generic rendering helpers used by
// both the standard view (Trainee Database + My List) and Calendar View.

export const GRADES = ["S", "A", "B", "C", "D", "E", "F", "G"];
export const GRADE_INFO = {
  S: { pct: "+5%", tip: "Peak. Only reachable via sparks — base aptitude caps at A.", tier: "s" },
  A: { pct: "100%", tip: "Baseline. No penalty, safe to race here.", tier: "a" },
  B: { pct: "−10%", tip: "Minor drag. One matching spark usually bumps this to A.", tier: "b" },
  C: { pct: "−20%", tip: "Noticeable penalty. Worth 4-6 sparks before racing seriously.", tier: "c" },
  D: { pct: "−40%", tip: "Steep drop. Push through only if the trophy is required. Needs 7-9 sparks.", tier: "d" },
  E: { pct: "−60%", tip: "Severe — accel takes a hit too on distance. Avoid unless mandatory. Needs atleast 10 sparks.", tier: "e" },
  F: { pct: "−80%", tip: "Near-crippling. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "f" },
  G: { pct: "−90%", tip: "Worst case. Only for a must-have trophy. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "g" },
};
export const CATS = [
  { key: "turf", label: "Turf", group: "surface", stat: "Power / Acceleration" },
  { key: "dirt", label: "Dirt", group: "surface", stat: "Power / Acceleration" },
  { key: "short", label: "Short", group: "distance", stat: "Speed" },
  { key: "mile", label: "Mile", group: "distance", stat: "Speed" },
  { key: "medium", label: "Medium", group: "distance", stat: "Speed" },
  { key: "long", label: "Long", group: "distance", stat: "Speed" },
];
export const SURFACE_KEYS = ["turf", "dirt"];
export const DISTANCE_KEYS = ["short", "mile", "medium", "long"];

export let state = {
  myList: [],
  settings: {
    allowCustomTrainees: true,
    allowRaceSearch: true,
    allowCustomTrophies: true,
    calendarViewMode: false,
    lightMode: false,
    colorTheme: 'turf', // 'turf' (Emerald & Jade) | 'dirt' (Amber & Bronze)
    activeTraineeId: null
  }
};

export function uid() { return Math.random().toString(36).slice(2, 9); }

export async function loadState() {
  try {
    if (window.storage && typeof window.storage.get === 'function') {
      const res = await window.storage.get('mylist', false);
      if (res && res.value) { state = JSON.parse(res.value); }
    } else {
      const val = localStorage.getItem('mylist');
      if (val) { state = JSON.parse(val); }
    }
  } catch (e) { console.error("Storage load failed", e); }
  if (!state.settings) {
    state.settings = { allowCustomTrainees: true, allowCustomTrophies: true };
  }
  if (state.settings.calendarViewMode === undefined) state.settings.calendarViewMode = false;
  if (state.settings.lightMode === undefined) state.settings.lightMode = false;
  if (state.settings.colorTheme === undefined) state.settings.colorTheme = 'turf';
  if (state.settings.activeTraineeId === undefined) state.settings.activeTraineeId = null;
  if (state.settings.allowRaceSearch === undefined) state.settings.allowRaceSearch = true;
  // Custom trophies can't meaningfully be off when race search itself is off —
  // with no search, every entry is inherently a custom one.
  if (!state.settings.allowRaceSearch) state.settings.allowCustomTrophies = true;
  delete state.settings.inlineCalendar;
}

export async function saveState() {
  try {
    if (window.storage && typeof window.storage.set === 'function') {
      await window.storage.set('mylist', JSON.stringify(state), false);
    } else {
      localStorage.setItem('mylist', JSON.stringify(state));
    }
  }
  catch (e) { console.error("Storage save failed", e); }
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

  // Measure the box as actually rendered (varies with how many lines the tip wraps to)
  // rather than assuming a fixed height, so it always sits flush above the chip.
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
  return `<button class="chip" style="${style}"
            data-cat="${key}" data-json='${JSON.stringify(value)}'
          >${label}</button>`;
}
export function aptGroupsHtml(apt) {
  return `<div class="apt-groups">
    <div class="apt-container">${SURFACE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
    <div class="apt-container">${DISTANCE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
  </div>`;
}
export function wireChips(root) {
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
    <img src="icons/${slug}.png" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
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
  return CATS
    .map(c => ({ ...c, grade: gradeOf(apt[c.key]) }))
    .filter(c => GRADES.indexOf(c.grade) >= GRADES.indexOf("D"))
    .sort((a, b) => GRADES.indexOf(b.grade) - GRADES.indexOf(a.grade));
}

export function sortRowsByMode(rows, mode) {
  if (mode === "az") return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  if (mode === "za") return [...rows].sort((a, b) => b.name.localeCompare(a.name));
  return rows;
}