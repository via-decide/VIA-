(function () {
  function buildAdjacency(nodes, edges) {
    const map = new Map(nodes.map((node) => [node.id, []]));

    edges.forEach((edge) => {
      if (!map.has(edge.from)) {
        map.set(edge.from, []);
      }

      map.get(edge.from).push(edge.to);
    });

    return map;
  }

  if (typeof window !== 'undefined') {
    window.LogicMapperTool = {
      buildAdjacency
    };
  }
})();
