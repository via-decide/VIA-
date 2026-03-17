export function renderMission(mission) {
  const title = document.getElementById('mission-title');
  const text = document.getElementById('mission-text');
  if (!mission) {
    title.textContent = 'Mission Complete';
    text.textContent = 'Great run. You can restart to play again.';
    return;
  }
  title.textContent = mission.title;
  text.textContent = mission.text;
}

export function renderChoices(choices) {
  const wrap = document.getElementById('choices');
  wrap.innerHTML = (choices || [])
    .map(
      (choice) =>
        `<button class="choice-btn" data-choice="${choice.value}">${choice.label}</button>`
    )
    .join('');
}

export function renderResult(result) {
  document.getElementById('result').textContent = result || '';
}

export function updateLeaderboard(data) {
  const board = document.getElementById('leaderboard');
  const rows = (data || [])
    .map(
      (entry, idx) =>
        `<div class="lb-row"><strong>#${idx + 1} ${entry.name}</strong><span>${entry.score}</span></div>`
    )
    .join('');

  board.innerHTML = `
    <h3 style="margin:0 0 8px;">Leaderboard</h3>
    ${rows}
  `;
}
