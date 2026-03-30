(function () {
  function calculateDecisionMatrix(options, criteria) {
    return options.map((option) => {
      const score = criteria.reduce((total, criterion) => {
        const value = Number(option.scores?.[criterion.id] || 0);
        return total + value * Number(criterion.weight || 0);
      }, 0);

      return {
        ...option,
        totalScore: score
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  if (typeof window !== 'undefined') {
    window.DecisionMatrixTool = {
      calculateDecisionMatrix
    };
  }
})();
