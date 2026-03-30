import { loadState, saveState } from './state.js';
import { renderMission, renderChoices, renderResult, updateLeaderboard } from './ui.js';
import { handleDecision, advanceMission, calculateScore } from './missionEngine.js';
import { syncLeaderboard } from './leaderboard.js';

async function loadMissions() {
  const response = await fetch('./missions.json');
  if (!response.ok) throw new Error('Failed to load missions.json');
  return response.json();
}

function attachChoiceListeners() {
  document.querySelectorAll('.choice-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const result = handleDecision(button.dataset.choice);
      renderCycle(result.result);
    });
  });
}

function renderCycle(latestResult = '') {
  const current = advanceMission();
  renderMission(current);
  renderChoices(current?.choices || []);
  renderResult(latestResult || `Current score: ${calculateScore()}`);
  updateLeaderboard(syncLeaderboard(window.SkillHex.state));
  saveState(window.SkillHex.state);

  const prev = window.SkillHex._lastSyncedScore || 0;
  const delta = window.SkillHex.state.score - prev;
  if (delta > 0 && window.VDWallet) {
    VDWallet.earn('missionXP', delta, 'skillhex');
    if (Math.floor(window.SkillHex.state.score / 100) > Math.floor(prev / 100)) {
      VDWallet.earn('focusDrops', 1, 'skillhex-milestone');
    }
    window.SkillHex._lastSyncedScore = window.SkillHex.state.score;
  }

  if (window.ToolStorage) {
    ToolStorage.set('skillhex', 'session', {
      score: window.SkillHex.state.score,
      phase: window.SkillHex.state.phase
    });
  }

  if (window.ToolBridge) {
    ToolBridge.sendContext('skillhex-mission-control', 'eco-engine-test', {
      game: 'skillhex',
      score: window.SkillHex.state.score,
      missionXP: window.VDWallet ? VDWallet.balance('missionXP') : 0
    });
  }

  attachChoiceListeners();
}

async function initApp() {
  const missions = await loadMissions();
  window.SkillHex = {
    version: '0.1',
    state: loadState(),
    missions,
    missionIndex: new Map(missions.map((mission) => [mission.id, mission]))
  };

  if (!window.SkillHex.state.currentMission && missions.length) {
    window.SkillHex.state.currentMission = missions[0].id;
  }

  renderCycle();
}

document.addEventListener('DOMContentLoaded', () => {
  initApp().catch((err) => {
    console.error(err);
    renderResult('Failed to initialize app. Check missions.json');
  });
});


window.SkillHex_reset = function() {
  import('./state.js').then(({ resetState }) => {
    window.SkillHex.state = resetState();
    window.SkillHex._lastSyncedScore = 0;
    renderCycle();
  });
};
