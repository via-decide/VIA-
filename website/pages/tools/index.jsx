import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolLoader from '@/public/tools/loader';

export default function ToolsCatalog() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loader = new ToolLoader();

    loader.loadToolIndex()
      .then((index) => {
        setTools(index);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading tools...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="tools-catalog">
      <h1>Decision Tools</h1>
      <div className="tools-grid">
        {tools.map((tool) => (
          <div key={tool.id} className="tool-card">
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <div className="tags">
              {tool.tags?.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="links">
              <Link href={`/tools/${tool.id}`}>Open Tool →</Link>
              <a href={tool.sourceUrl} target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
