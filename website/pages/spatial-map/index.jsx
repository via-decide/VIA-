import { useEffect, useState } from 'react';
import ToolLoader from '@/public/tools/loader';
import Link from 'next/link';

export default function SpatialMap() {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);

  useEffect(() => {
    const loader = new ToolLoader();
    loader.getAllTools().then(setTools);
  }, []);

  return (
    <div className="spatial-map-page">
      <h1>🗺️ Spatial Map</h1>
      <p>Discover the ViaDecide ecosystem</p>

      <svg className="spatial-svg" viewBox="0 0 1200 800">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#grid)" />

        {tools.map((tool, i) => {
          const angle = (i / tools.length) * Math.PI * 2;
          const x = 600 + Math.cos(angle) * 200;
          const y = 400 + Math.sin(angle) * 200;

          return (
            <g key={tool.id} onClick={() => setSelectedTool(tool)}>
              <circle cx={x} cy={y} r="30" fill="#007bff" opacity="0.7" cursor="pointer" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10">
                {tool.name.substring(0, 8)}
              </text>
            </g>
          );
        })}
      </svg>

      {selectedTool && (
        <div className="spatial-detail">
          <h3>{selectedTool.name}</h3>
          <p>{selectedTool.description}</p>
          <Link href={`/tools/${selectedTool.id}`}>View Tool</Link>
        </div>
      )}
    </div>
  );
}
