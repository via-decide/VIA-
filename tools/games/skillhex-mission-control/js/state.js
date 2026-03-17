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
  const you = state.leaderboard?.find((e) => e.name === 'You');
  if (!you || state.score > (you.score || 0)) {
    state.leaderboard = (state.leaderboard || [])
      .filter((e) => e.name !== 'You')
      .concat([{ name: 'You', score: state.score }])
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  const fresh = { ...defaultState };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export { STORAGE_KEY, defaultState, loadState, saveState, resetState };
