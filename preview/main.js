import { state, loadState, saveState } from './core.js';
import { renderDatabase, renderMyList, addCustom, wireStandardViewControls, exportList, importList, importListFromText } from './standard-view.js';
import { renderCalendarView, closeCalTraineePanel } from './calendar.js';

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
  const raceSearchToggle = document.getElementById('toggle-race-search');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const calViewToggle = document.getElementById('toggle-calendar-view');
  const trainRow = document.getElementById('custom-trainee-row');
  const settingsBtn = document.getElementById('settings-btn');
  const backupBtn = document.getElementById('backup-btn');

  if (!state.settings.allowRaceSearch) state.settings.allowCustomTrophies = true;

  document.body.classList.toggle('light', !!state.settings.lightMode);
  document.body.classList.toggle('dirt', state.settings.colorTheme === 'dirt');

  if (trainToggle) trainToggle.checked = !!state.settings.allowCustomTrainees;
  if (raceSearchToggle) raceSearchToggle.checked = !!state.settings.allowRaceSearch;
  if (trophyToggle) {
    trophyToggle.checked = !!state.settings.allowCustomTrophies;
    trophyToggle.disabled = !state.settings.allowRaceSearch;
  }
  const trophyRow = document.getElementById('toggle-custom-trophy-row');
  if (trophyRow) trophyRow.classList.toggle('settings-row-disabled', !state.settings.allowRaceSearch);
  if (calViewToggle) calViewToggle.checked = !!state.settings.calendarViewMode;

  if (trainRow) {
    trainRow.style.display = state.settings.allowCustomTrainees ? '' : 'none';
  }

  if (settingsBtn) settingsBtn.style.display = state.settings.calendarViewMode ? 'none' : '';
  if (backupBtn) backupBtn.style.display = state.settings.calendarViewMode ? 'none' : '';
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
export function setAllowRaceSearch(value) {
  state.settings.allowRaceSearch = value;
  saveState(); applySettingsUI(); renderMainView();
}
export function setAllowCustomTrophies(value) {
  if (!state.settings.allowRaceSearch) return;
  state.settings.allowCustomTrophies = value;
  saveState(); applySettingsUI(); renderMainView();
}
export function setCalendarViewMode(value) {
  state.settings.calendarViewMode = value;
  saveState(); applySettingsUI(); renderMainView();
  closeSettingsPanel();
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

async function init() {
  await loadState();
  applySettingsUI();
  renderMainView();

  wireStandardViewControls();
  wireBackupModal();

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
  }

  const backupBtn = document.getElementById('backup-btn');
  if (backupBtn) backupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBackupModal();
  });

  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const raceSearchToggle = document.getElementById('toggle-race-search');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const calViewToggle = document.getElementById('toggle-calendar-view');

  if (modeToggleBtn) modeToggleBtn.addEventListener('click', toggleMode);
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleColorTheme);
  if (trainToggle) trainToggle.addEventListener('change', () => setAllowCustomTrainees(trainToggle.checked));
  if (raceSearchToggle) raceSearchToggle.addEventListener('change', () => setAllowRaceSearch(raceSearchToggle.checked));
  if (trophyToggle) trophyToggle.addEventListener('change', () => setAllowCustomTrophies(trophyToggle.checked));
  if (calViewToggle) calViewToggle.addEventListener('change', () => setCalendarViewMode(calViewToggle.checked));

  document.addEventListener('click', () => {
    closeSettingsPanel();
    closeCalTraineePanel();
  });
}
init();