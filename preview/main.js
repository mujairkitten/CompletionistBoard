import { state, loadState, saveState, debounce, wireChips } from './core.js';
import { renderDatabase, renderMyList, addCustom, wireStandardViewControls, exportList, importList, importListFromText } from './standard-view.js';
import { renderCalendarView, closeCalTraineePanel } from './calendar.js';

const NAVBAR_POSITIONS = ['left', 'bottom', 'right', 'top'];
const NAVBAR_POSITIONS_MOBILE = ['top', 'bottom'];

function isDesktopViewport() {
  return window.matchMedia('(min-width: 960px)').matches;
}

function updateRailViewButton() {
  const button = document.getElementById('rail-view-btn');
  if (!button) return;
  const isCalendar = !!state.settings.calendarViewMode;
  const label = isCalendar ? 'Database' : 'Calendar View';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.dataset.tooltip = label;
  button.innerHTML = isCalendar
    ? `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="5" rx="7.5" ry="3" stroke="currentColor" stroke-width="2"/><path d="M4.5 5v7c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V5M4.5 12v7c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-7" stroke="currentColor" stroke-width="2"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10H21M8 3V7M16 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function updateNavbarPositionButton() {
  const button = document.getElementById('nav-position-btn');
  if (!button) return;
  const positions = isDesktopViewport() ? NAVBAR_POSITIONS : NAVBAR_POSITIONS_MOBILE;
  const current = state.settings.navbarPosition || 'right';
  const idx = positions.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  const next = positions[(safeIdx + positions.length - 1) % positions.length];
  button.setAttribute('aria-label', `Move navbar to ${next}`);
  button.dataset.tooltip = `Move navbar to ${next}`;
}

export function renderMainView() {
  const standard = document.getElementById('standard-view');
  const calView = document.getElementById('calendar-view');
  if (state.settings.calendarViewMode) {
    if (standard) standard.style.display = 'none';
    if (calView) calView.style.display = '';
    renderCalendarView();
  } else {
    if (standard) standard.style.display = '';
    if (calView) calView.style.display = 'none';
    renderDatabase();
    renderMyList();
  }
}

export function applySettingsUI() {
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const trainRow = document.getElementById('custom-trainee-row');
  const settingsBtn = document.getElementById('settings-btn');
  const backupBtn = document.getElementById('backup-btn');

  document.body.classList.toggle('light', !!state.settings.lightMode);
  document.body.classList.toggle('dirt', state.settings.colorTheme === 'dirt');

  if (trainToggle) trainToggle.checked = !!state.settings.allowCustomTrainees;
  if (trophyToggle) trophyToggle.checked = !!state.settings.allowCustomTrophies;

  if (trainRow) {
    trainRow.style.display = state.settings.allowCustomTrainees ? '' : 'none';
  }

  if (settingsBtn) settingsBtn.style.display = '';
  if (backupBtn) backupBtn.style.display = '';
  updateRailViewButton();
  updateNavbarPositionButton();
  document.body.classList.remove('nav-left', 'nav-bottom', 'nav-right', 'nav-top');
  document.body.classList.add(`nav-${state.settings.navbarPosition || 'right'}`);
}

export function closeSettingsPanel() {
  const panel = document.getElementById('settings-panel');
  if (panel) panel.classList.remove('show');
}

export function openAboutModal() {
  closeSettingsPanel();
  closeCalTraineePanel();
  const aboutOverlay = document.getElementById('about-overlay');
  if (aboutOverlay) aboutOverlay.classList.add('show');
}

function refreshBackupExportText() {
  const textarea = document.getElementById('backup-export-text');
  if (textarea) textarea.value = JSON.stringify(state, null, 2);
}

export function openBackupModal() {
  closeSettingsPanel();
  closeCalTraineePanel();
  const backupOverlay = document.getElementById('backup-overlay');
  const exportPanel = document.getElementById('backup-export-panel');
  const importPanel = document.getElementById('backup-import-panel');
  const tabs = document.querySelectorAll('#backup-tabs .cal-tab-btn');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'export'));
  if (exportPanel) exportPanel.style.display = '';
  if (importPanel) importPanel.style.display = 'none';
  refreshBackupExportText();
  if (backupOverlay) backupOverlay.classList.add('show');
}

function closeBackupModal() {
  const backupOverlay = document.getElementById('backup-overlay');
  if (backupOverlay) backupOverlay.classList.remove('show');
}

export function toggleMode() {
  state.settings.lightMode = !state.settings.lightMode;
  saveState(); applySettingsUI();
}
export function toggleColorTheme() {
  state.settings.colorTheme = state.settings.colorTheme === 'dirt' ? 'turf' : 'dirt';
  saveState(); applySettingsUI();
}
export function setAllowCustomTrainees(value) {
  state.settings.allowCustomTrainees = value;
  saveState(); applySettingsUI();
}
export function setAllowCustomTrophies(value) {
  state.settings.allowCustomTrophies = value;
  saveState(); applySettingsUI(); renderMainView();
}
export function setCalendarViewMode(value) {
  state.settings.calendarViewMode = value;
  saveState(); applySettingsUI(); renderMainView();
  closeSettingsPanel();
}
export function cycleNavbarPosition() {
  const positions = isDesktopViewport() ? NAVBAR_POSITIONS : NAVBAR_POSITIONS_MOBILE;
  const current = state.settings.navbarPosition || 'right';
  const idx = positions.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  state.settings.navbarPosition = positions[(safeIdx + positions.length - 1) % positions.length];
  saveState();
  applySettingsUI();
  syncTopbarHeight();
}

let exportCooldownUntil = 0;
let exportCooldownInterval = null;

function updateExportButtonState() {
  const btn = document.getElementById('backup-export-file-btn');
  if (!btn) return;
  const remaining = Math.ceil((exportCooldownUntil - Date.now()) / 1000);
  if (remaining > 0) {
    btn.disabled = true;
    btn.textContent = `Export file (${remaining}s)`;
  } else {
    btn.disabled = false;
    btn.textContent = 'Export file';
  }
}

function startExportCooldown() {
  exportCooldownUntil = Date.now() + 10000;
  updateExportButtonState();
  if (exportCooldownInterval) clearInterval(exportCooldownInterval);
  exportCooldownInterval = setInterval(() => {
    updateExportButtonState();
    if (Date.now() >= exportCooldownUntil) {
      clearInterval(exportCooldownInterval);
      exportCooldownInterval = null;
    }
  }, 500);
}

function wireBackupModal() {
  const backupOverlay = document.getElementById('backup-overlay');
  const backupClose = document.getElementById('backup-close');
  const tabs = document.querySelectorAll('#backup-tabs .cal-tab-btn');
  const exportPanel = document.getElementById('backup-export-panel');
  const importPanel = document.getElementById('backup-import-panel');
  const exportFileBtn = document.getElementById('backup-export-file-btn');
  const importTextBtn = document.getElementById('backup-import-text-btn');
  const importTextarea = document.getElementById('backup-import-text');
  const importFileInput = document.getElementById('backup-import-file');

  if (backupOverlay) {
    backupOverlay.addEventListener('click', (e) => {
      if (e.target === backupOverlay) closeBackupModal();
    });
  }
  if (backupClose) backupClose.addEventListener('click', closeBackupModal);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      const isExport = tab.dataset.tab === 'export';
      if (exportPanel) exportPanel.style.display = isExport ? '' : 'none';
      if (importPanel) importPanel.style.display = isExport ? 'none' : '';
      if (isExport) refreshBackupExportText();
    });
  });

  if (exportFileBtn) exportFileBtn.addEventListener('click', () => {
    if (Date.now() < exportCooldownUntil) return;
    exportList();
    startExportCooldown();
  });

  if (importTextBtn) importTextBtn.addEventListener('click', () => {
    if (!importTextarea) return;
    const text = importTextarea.value.trim();
    if (!text) return;
    if (importListFromText(text)) importTextarea.value = '';
  });

  if (importFileInput) importFileInput.addEventListener('change', e => {
    if (e.target.files[0]) importList(e.target.files[0]);
    e.target.value = '';
  });
}

function syncTopbarHeight() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  const height = topbar.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--topbar-h', `${height}px`);
}

async function init() {
  await loadState();
  applySettingsUI();
  renderMainView();

  wireStandardViewControls();
  wireBackupModal();
  syncTopbarHeight();
  window.addEventListener('resize', debounce(syncTopbarHeight, 150));

  const aboutBtn = document.getElementById('about-btn');
  const aboutOverlay = document.getElementById('about-overlay');
  const aboutClose = document.getElementById('about-close');
  if (aboutBtn) aboutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openAboutModal();
  });
  if (aboutOverlay) {
    aboutOverlay.addEventListener('click', (e) => {
      if (e.target === aboutOverlay) aboutOverlay.classList.remove('show');
    });
  }
  if (aboutClose) aboutClose.addEventListener('click', () => aboutOverlay.classList.remove('show'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (aboutOverlay) aboutOverlay.classList.remove('show');
      closeBackupModal();
    }
  });

  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCalTraineePanel();
      settingsPanel.classList.toggle('show');
    });
    settingsPanel.addEventListener('click', e => e.stopPropagation());
    wireChips(settingsPanel);
  }

  const backupBtn = document.getElementById('backup-btn');
  if (backupBtn) backupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBackupModal();
  });

  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const navPositionBtn = document.getElementById('nav-position-btn');
  const caroteneBtn = document.getElementById('carotene-btn');
  const railViewBtn = document.getElementById('rail-view-btn');
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const trophyToggle = document.getElementById('toggle-custom-trophy');

  if (modeToggleBtn) modeToggleBtn.addEventListener('click', toggleMode);
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleColorTheme);
  if (navPositionBtn) navPositionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cycleNavbarPosition();
  });
  if (caroteneBtn) caroteneBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = document.getElementById('carotene-panel');
    if (!panel) return;
    const isShown = panel.style.display === '' || panel.style.display === 'block';
    panel.style.display = isShown ? 'none' : 'block';
    panel.setAttribute('aria-hidden', isShown ? 'true' : 'false');
  });
  if (railViewBtn) railViewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const showCalendar = !state.settings.calendarViewMode;
    setCalendarViewMode(showCalendar);
    if (!showCalendar) requestAnimationFrame(() => document.getElementById('db-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });
  if (trainToggle) trainToggle.addEventListener('change', () => setAllowCustomTrainees(trainToggle.checked));
  if (trophyToggle) trophyToggle.addEventListener('change', () => setAllowCustomTrophies(trophyToggle.checked));

  document.addEventListener('click', (e) => {
    // Close carotene panel when clicking outside
    const panel = document.getElementById('carotene-panel');
    const btn = document.getElementById('carotene-btn');
    if (panel && btn) {
      const target = e.target;
      if (!panel.contains(target) && !btn.contains(target)) {
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
      }
    }
    closeSettingsPanel();
    closeCalTraineePanel();
  });

  // Close carotene panel on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('carotene-panel');
      if (panel) {
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
      }
    }
  });
}
init();