import Link from 'next/link';
import ToolLoader from '@/public/tools/loader';
import { useEffect, useState } from 'react';

export default function DemosPage() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    const loader = new ToolLoader();
    loader.getAllTools().then(setTools);
  }, []);

  return (
    <div className="demos-page">
      <h1>Interactive Demos</h1>
      <div className="demos-grid">
        {tools.map((tool) => (
          <div key={tool.id} className="demo-card">
            <h3>{tool.name}</h3>
            <Link href={`/demos/${tool.id}/`} className="btn">
              Launch Demo
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
