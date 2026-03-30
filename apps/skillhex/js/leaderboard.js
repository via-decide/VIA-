export function syncLeaderboard(state) {
  const you = { name: 'You', score: state.score };
  const others = (state.leaderboard || []).filter((entry) => entry.name !== 'You');
  const merged = [...others, you].sort((a, b) => b.score - a.score).slice(0, 8);
  state.leaderboard = merged;
  return merged;
}
