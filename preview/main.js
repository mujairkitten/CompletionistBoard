import { state, loadState, saveState } from './core.js';
import { renderDatabase, renderMyList, addCustom, wireStandardViewControls } from './standard-view.js';
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
}

export function closeSettingsPanel() {
  const panel = document.getElementById('settings-panel');
  if (panel) panel.classList.remove('show');
}

async function init() {
  await loadState();
  applySettingsUI();
  renderMainView();

  wireStandardViewControls();

  const aboutBtn = document.getElementById('about-btn');
  const aboutOverlay = document.getElementById('about-overlay');
  const aboutClose = document.getElementById('about-close');
  if (aboutBtn && aboutOverlay) {
    aboutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSettingsPanel();
      aboutOverlay.classList.add('show');
    });
    aboutOverlay.addEventListener('click', (e) => {
      if (e.target === aboutOverlay) aboutOverlay.classList.remove('show');
    });
    if (aboutClose) aboutClose.addEventListener('click', () => aboutOverlay.classList.remove('show'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') aboutOverlay.classList.remove('show');
    });
  }

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

  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const trainToggle = document.getElementById('toggle-custom-trainee');
  const raceSearchToggle = document.getElementById('toggle-race-search');
  const trophyToggle = document.getElementById('toggle-custom-trophy');
  const calViewToggle = document.getElementById('toggle-calendar-view');

  if (modeToggleBtn) modeToggleBtn.addEventListener('click', () => {
    state.settings.lightMode = !state.settings.lightMode;
    saveState(); applySettingsUI();
  });
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => {
    state.settings.colorTheme = state.settings.colorTheme === 'dirt' ? 'turf' : 'dirt';
    saveState(); applySettingsUI();
  });
  if (trainToggle) trainToggle.addEventListener('change', () => {
    state.settings.allowCustomTrainees = trainToggle.checked;
    saveState(); applySettingsUI();
  });
  if (raceSearchToggle) raceSearchToggle.addEventListener('change', () => {
    state.settings.allowRaceSearch = raceSearchToggle.checked;
    saveState(); applySettingsUI(); renderMainView();
  });
  if (trophyToggle) trophyToggle.addEventListener('change', () => {
    if (!state.settings.allowRaceSearch) return;
    state.settings.allowCustomTrophies = trophyToggle.checked;
    saveState(); applySettingsUI(); renderMainView();
  });
  if (calViewToggle) calViewToggle.addEventListener('change', () => {
    state.settings.calendarViewMode = calViewToggle.checked;
    saveState(); applySettingsUI(); renderMainView();
    closeSettingsPanel();
  });

  document.addEventListener('click', () => {
    closeSettingsPanel();
    closeCalTraineePanel();
  });
}
init();