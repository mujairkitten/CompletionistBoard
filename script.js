const GRADES = ["S", "A", "B", "C", "D", "E", "F", "G"];
const GRADE_INFO = {
  S: { pct: "+5%", tip: "Peak. Only reachable via sparks — base aptitude caps at A.", tier: "s" },
  A: { pct: "100%", tip: "Baseline. No penalty, safe to race here.", tier: "a" },
  B: { pct: "−10%", tip: "Minor drag. One matching spark usually bumps this to A.", tier: "b" },
  C: { pct: "−20%", tip: "Noticeable penalty. Worth 4-6 sparks before racing seriously.", tier: "c" },
  D: { pct: "−40%", tip: "Steep drop. Push through only if the trophy is required. Needs 7-9 sparks.", tier: "d" },
  E: { pct: "−60%", tip: "Severe — accel takes a hit too on distance. Avoid unless mandatory. Needs atleast 10 sparks.", tier: "e" },
  F: { pct: "−80%", tip: "Near-crippling. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "f" },
  G: { pct: "−90%", tip: "Worst case. Only for a must-have trophy. Even max sparks (12) only gives you to C. Hope that Inspiration sessions gives you more.", tier: "g" },
};
const CATS = [
  { key: "turf", label: "Turf", group: "surface", stat: "Power / Acceleration" },
  { key: "dirt", label: "Dirt", group: "surface", stat: "Power / Acceleration" },
  { key: "short", label: "Short", group: "distance", stat: "Speed" },
  { key: "mile", label: "Mile", group: "distance", stat: "Speed" },
  { key: "medium", label: "Medium", group: "distance", stat: "Speed" },
  { key: "long", label: "Long", group: "distance", stat: "Speed" },
];
const SURFACE_KEYS = ["turf", "dirt"];
const DISTANCE_KEYS = ["short", "mile", "medium", "long"];

// One entry per character, consolidated across all Global costumes.
// Where costumes disagree, the value is {base, alt, note}.
const DATABASE = [
  { name: "Special Week", apt: { turf: "A", dirt: "G", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Silence Suzuka", apt: { turf: "A", dirt: "G", short: "D", mile: "A", medium: "A", long: "E" } },
  { name: "Tokai Teio", apt: { turf: "A", dirt: "G", short: "F", mile: "E", medium: "A", long: "B" } },
  { name: "Maruzensky", apt: { turf: "A", dirt: "D", short: "B", mile: "A", medium: "B", long: "C" } },
  { name: "Oguri Cap", apt: { turf: "A", dirt: "B", short: "E", mile: "A", medium: "A", long: "B" } },
  { name: "Gold Ship", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "Vodka", apt: { turf: "A", dirt: "G", short: "F", mile: "A", medium: "A", long: "F" } },
  { name: "Daiwa Scarlet", apt: { turf: "A", dirt: "G", short: "F", mile: "A", medium: "A", long: "B" } },
  { name: "Taiki Shuttle", apt: { turf: "A", dirt: "B", short: "A", mile: "A", medium: "E", long: "G" } },
  { name: "Grass Wonder", apt: { turf: "A", dirt: "G", short: "G", mile: "A", medium: "B", long: "A" } },
  { name: "Mejiro McQueen", apt: { turf: "A", dirt: "E", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "El Condor Pasa", apt: { turf: "A", dirt: "B", short: "F", mile: "A", medium: "A", long: "B" } },
  { name: "T.M. Opera O", apt: { turf: "A", dirt: "E", short: "G", mile: "E", medium: "A", long: "A" } },
  { name: "Symboli Rudolf", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "A" } },
  { name: "Air Groove", apt: { turf: "A", dirt: "G", short: "C", mile: "B", medium: "A", long: "E" } },
  { name: "Mayano Top Gun", apt: { turf: "A", dirt: "E", short: "D", mile: "D", medium: "A", long: "A" } },
  { name: "Mejiro Ryan", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "B" } },
  { name: "Rice Shower", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "A" } },
  { name: "Agnes Tachyon", apt: { turf: "A", dirt: "G", short: "G", mile: "D", medium: "A", long: "B" } },
  { name: "Winning Ticket", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "B" } },
  { name: "Sakura Bakushin O", apt: { turf: "A", dirt: "G", short: "A", mile: "B", medium: "G", long: "G" } },
  { name: "Super Creek", apt: { turf: "A", dirt: "G", short: "G", mile: "G", medium: "A", long: "A" } },
  {
    name: "Haru Urara", apt: {
      turf: "G", dirt: "A", short: "A",
      mile: { base: "B", alt: "A", note: "B on base costume — her \"New Year ♪ New Urara!\" costume raises this to A." },
      medium: "G", long: "G"
    }
  },
  { name: "Matikanefukukitaru", apt: { turf: "A", dirt: "F", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Nice Nature", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "King Halo", apt: { turf: "A", dirt: "G", short: "A", mile: "B", medium: "B", long: "C" } },
  { name: "Mihono Bourbon", apt: { turf: "A", dirt: "G", short: "C", mile: "B", medium: "A", long: "B" } },
  { name: "Biwa Hayahide", apt: { turf: "A", dirt: "F", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Curren Chan", apt: { turf: "A", dirt: "F", short: "A", mile: "D", medium: "G", long: "G" } },
  { name: "Narita Taishin", apt: { turf: "A", dirt: "G", short: "F", mile: "D", medium: "A", long: "A" } },
  { name: "Smart Falcon", apt: { turf: "E", dirt: "A", short: "B", mile: "A", medium: "A", long: "E" } },
  { name: "Narita Brian", apt: { turf: "A", dirt: "G", short: "F", mile: "B", medium: "A", long: "A" } },
  { name: "Seiun Sky", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "Hishi Amazon", apt: { turf: "A", dirt: "E", short: "D", mile: "A", medium: "A", long: "B" } },
  { name: "Fuji Kiseki", apt: { turf: "A", dirt: "F", short: "B", mile: "A", medium: "B", long: "E" } },
  { name: "Gold City", apt: { turf: "A", dirt: "D", short: "F", mile: "A", medium: "B", long: "B" } },
  { name: "Meisho Doto", apt: { turf: "A", dirt: "E", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "Eishin Flash", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "Hishi Akebono", apt: { turf: "A", dirt: "F", short: "A", mile: "B", medium: "F", long: "G" } },
  { name: "Agnes Digital", apt: { turf: "A", dirt: "A", short: "F", mile: "A", medium: "A", long: "G" } },
  { name: "Kawakami Princess", apt: { turf: "A", dirt: "G", short: "D", mile: "B", medium: "A", long: "F" } },
  { name: "Manhattan Cafe", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "B", long: "A" } },
  { name: "Tosen Jordan", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "B" } },
  { name: "Mejiro Dober", apt: { turf: "A", dirt: "G", short: "E", mile: "A", medium: "A", long: "F" } },
  { name: "Fine Motion", apt: { turf: "A", dirt: "G", short: "F", mile: "A", medium: "A", long: "C" } },
  { name: "Tamamo Cross", apt: { turf: "A", dirt: "F", short: "G", mile: "E", medium: "A", long: "A" } },
  { name: "Sakura Chiyono O", apt: { turf: "A", dirt: "G", short: "E", mile: "A", medium: "A", long: "E" } },
  { name: "Mejiro Ardan", apt: { turf: "A", dirt: "F", short: "E", mile: "B", medium: "A", long: "D" } },
  { name: "Admire Vega", apt: { turf: "A", dirt: "G", short: "F", mile: "C", medium: "A", long: "C" } },
  { name: "Matikanetannhauser", apt: { turf: "A", dirt: "G", short: "G", mile: "D", medium: "A", long: "A" } },
  { name: "Kitasan Black", apt: { turf: "A", dirt: "G", short: "E", mile: "C", medium: "A", long: "A" } },
  { name: "Satono Diamond", apt: { turf: "A", dirt: "G", short: "G", mile: "C", medium: "A", long: "A" } },
  { name: "Mejiro Bright", apt: { turf: "A", dirt: "G", short: "F", mile: "C", medium: "A", long: "A" } },
  { name: "Nishino Flower", apt: { turf: "A", dirt: "F", short: "A", mile: "A", medium: "E", long: "G" } },
  { name: "Yaeno Muteki", apt: { turf: "A", dirt: "E", short: "G", mile: "B", medium: "A", long: "E" } },
  { name: "Ines Fujin", apt: { turf: "A", dirt: "G", short: "G", mile: "A", medium: "A", long: "C" } },
  { name: "Mejiro Palmer", apt: { turf: "A", dirt: "G", short: "G", mile: "F", medium: "A", long: "A" } },
  { name: "Inari One", apt: { turf: "A", dirt: "A", short: "F", mile: "B", medium: "A", long: "A" } },
  { name: "Sweep Tosho", apt: { turf: "A", dirt: "G", short: "E", mile: "A", medium: "A", long: "D" } },
  { name: "Air Shakur", apt: { turf: "A", dirt: "G", short: "G", mile: "E", medium: "A", long: "A" } },
  { name: "Bamboo Memory", apt: { turf: "A", dirt: "D", short: "A", mile: "A", medium: "C", long: "G" } },
  { name: "Copano Rickey", apt: { turf: "F", dirt: "A", short: "C", mile: "A", medium: "A", long: "G" } },
];

let state = { myList: [] };
function uid() { return Math.random().toString(36).slice(2, 9); }

async function loadState() {
  try {
    if (window.storage && typeof window.storage.get === 'function') {
      const res = await window.storage.get('mylist', false);
      if (res && res.value) { state = JSON.parse(res.value); }
    } else {
      const val = localStorage.getItem('mylist');
      if (val) { state = JSON.parse(val); }
    }
  } catch (e) { console.error("Storage load failed", e); }
}

async function saveState() {
  try {
    if (window.storage && typeof window.storage.set === 'function') {
      await window.storage.set('mylist', JSON.stringify(state), false);
    } else {
      localStorage.setItem('mylist', JSON.stringify(state));
    }
  }
  catch (e) { console.error("Storage save failed", e); }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function gradeOf(v) { return typeof v === 'string' ? v : v.base; }
function altOf(v) { return typeof v === 'string' ? null : v; }

const tooltipEl = document.getElementById('tooltip');
function showTooltip(target, catKey, aptValue) {
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
  let top = rect.top - (alt ? 118 : 96);
  if (top < 8) top = rect.bottom + 8;
  tooltipEl.style.top = top + "px";
  tooltipEl.classList.add('show');
}
function hideTooltip() { tooltipEl.classList.remove('show'); }

function chipHtml(apt, key) {
  const cat = CATS.find(c => c.key === key);
  const value = apt[key];
  const grade = gradeOf(value);
  const alt = altOf(value);
  const tier = GRADE_INFO[grade].tier;
  const label = `${cat.label} ${grade}${alt ? '/' + alt.alt : ''}`;
  let style = `background:var(--${tier});--chip-glow:color-mix(in srgb, var(--${tier}) 55%, transparent);`;
  if (alt) {
    style = `--split-a:var(--${tier});--split-b:var(--${GRADE_INFO[alt.alt].tier});--chip-glow:color-mix(in srgb, var(--${tier}) 45%, transparent);`;
  }
  return `<button class="chip${alt ? ' split' : ''}" style="${style}"
            data-cat="${key}" data-json='${JSON.stringify(value)}'
          >${label}</button>`;
}
function aptGroupsHtml(apt) {
  return `<div class="apt-groups">
    <div class="apt-group">${SURFACE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
    <div class="apt-divider"></div>
    <div class="apt-group">${DISTANCE_KEYS.map(k => chipHtml(apt, k)).join("")}</div>
  </div>`;
}
function wireChips(root) {
  root.querySelectorAll('.chip').forEach(p => {
    const value = JSON.parse(p.dataset.json);
    p.addEventListener('mouseenter', () => showTooltip(p, p.dataset.cat, value));
    p.addEventListener('mouseleave', hideTooltip);
    p.addEventListener('focus', () => showTooltip(p, p.dataset.cat, value));
    p.addEventListener('blur', hideTooltip);
  });
}

function renderDatabase() {
  const grid = document.getElementById('db-grid');
  const filter = document.getElementById('db-search').value.trim().toLowerCase();
  const list = DATABASE.filter(d => d.name.toLowerCase().includes(filter));
  document.getElementById('db-count').textContent = `${list.length} / ${DATABASE.length}`;
  document.getElementById('db-gate').textContent = DATABASE.length;

  grid.innerHTML = list.map((d) => {
    const realIndex = DATABASE.indexOf(d);
    return `
    <div class="db-card">
      <div class="db-card-top">
        <span class="db-num">${String(realIndex + 1).padStart(2, '0')}</span>
        <div class="db-name">${escapeHtml(d.name)}</div>
      </div>
      ${aptGroupsHtml(d.apt)}
      <button class="btn small add-btn" data-add="${realIndex}">+ Add to my list</button>
    </div>`;
  }).join("");

  wireChips(grid);
  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = DATABASE[parseInt(btn.dataset.add, 10)];
      addToMyList(d.name, JSON.parse(JSON.stringify(d.apt)));
    });
  });
}

function weakAptitudes(apt) {
  return CATS
    .map(c => ({ ...c, grade: gradeOf(apt[c.key]) }))
    .filter(c => GRADES.indexOf(c.grade) >= GRADES.indexOf("D"))
    .sort((a, b) => GRADES.indexOf(b.grade) - GRADES.indexOf(a.grade));
}

function addToMyList(name, apt) {
  state.myList.push({ id: uid(), name, aptitudes: apt, trophies: [] });
  saveState();
  renderMyList();
}

function renderMyList() {
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
    if (addTBtn) addTBtn.addEventListener('click', () => addTrophy(t.id, addTInput.value));
    if (addTInput) addTInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTrophy(t.id, addTInput.value); });
    t.trophies.forEach(tr => {
      const cb = document.getElementById(`cb-${t.id}-${tr.id}`);
      if (cb) cb.addEventListener('change', () => toggleTrophy(t.id, tr.id));
      const rm = document.getElementById(`rm-${t.id}-${tr.id}`);
      if (rm) rm.addEventListener('click', () => removeTrophy(t.id, tr.id));
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
    ? t.trophies.map(tr => `
      <div class="trophy-item ${tr.checked ? 'checked' : ''}">
        <input type="checkbox" id="cb-${t.id}-${tr.id}" ${tr.checked ? 'checked' : ''}>
        <span>${escapeHtml(tr.name)}</span>
        <button class="rm" id="rm-${t.id}-${tr.id}">&times;</button>
      </div>`).join("")
    : `<div style="font-size:12px;color:var(--ink-faint);font-style:italic;">No races logged yet.</div>`;

  return `
  <div class="mycard">
    <div class="mycard-head">
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
        <input type="text" id="addt-input-${t.id}" placeholder="Add a race / trophy">
        <button class="btn small" id="addt-btn-${t.id}">+ Add</button>
      </div>
    </div>
  </div>`;
}

function removeFromMyList(id) {
  state.myList = state.myList.filter(t => t.id !== id);
  saveState(); renderMyList();
}
function addTrophy(tid, name) {
  name = (name || "").trim();
  if (!name) return;
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  t.trophies.push({ id: uid(), name, checked: false });
  saveState(); renderMyList();
}
function toggleTrophy(tid, trid) {
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  const tr = t.trophies.find(x => x.id === trid);
  if (!tr) return;
  tr.checked = !tr.checked;
  saveState(); renderMyList();
}
function removeTrophy(tid, trid) {
  const t = state.myList.find(x => x.id === tid);
  if (!t) return;
  t.trophies = t.trophies.filter(x => x.id !== trid);
  saveState(); renderMyList();
}
function addCustom() {
  const input = document.getElementById('custom-name');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  addToMyList(name, { turf: "A", dirt: "A", short: "A", mile: "A", medium: "A", long: "A" });
  input.value = "";
}

function exportList() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = "completionist-list.json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importList(file) {
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
      saveState(); renderMyList();
    } catch (e) {
      alert("Couldn't read that file — expected a Completionist Board export.");
    }
  };
  reader.readAsText(file);
}

async function init() {
  await loadState();
  renderDatabase();
  renderMyList();

  document.getElementById('db-search').addEventListener('input', renderDatabase);
  document.getElementById('custom-add-btn').addEventListener('click', addCustom);
  document.getElementById('custom-name').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
  document.getElementById('export-btn').addEventListener('click', exportList);
  document.getElementById('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = "";
  });
}
init();
