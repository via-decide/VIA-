export function handleDecision(choiceValue) {
  const app = window.SkillHex;
  const mission = app.missionIndex.get(app.state.currentMission);
  if (!mission) return { done: true, result: 'No mission loaded.' };

  const choice = mission.choices.find((c) => c.value === choiceValue);
  if (!choice) return { done: false, result: 'Invalid choice.' };

  app.state.score += Number(choice.score || 0);
  app.state.history.push({ missionId: mission.id, choice: choice.value, scoreDelta: choice.score || 0 });

  app.state.currentMission = choice.next;
  app.state.phase += 1;

  return {
    done: !choice.next,
    result: choice.result,
    nextMission: choice.next
  };
}

export function advanceMission() {
  const app = window.SkillHex;
  return app.missionIndex.get(app.state.currentMission) || null;
}

export function calculateScore() {
  return window.SkillHex.state.score;
}
