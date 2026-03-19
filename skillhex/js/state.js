const STORAGE_KEY = 'skillhex-mission-control-v1';

const defaultState = {
  currentMission: null,
  phase: 0,
  score: 0,
  history: [],
  leaderboard: [
    { name: 'NovaPilot', score: 870 },
    { name: 'HexRanger', score: 810 },
    { name: 'OrbitMind', score: 760 }
  ]
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...defaultState, ...parsed };
  } catch (_err) {
    return { ...defaultState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export { STORAGE_KEY, defaultState, loadState, saveState };
