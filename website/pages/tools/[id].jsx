import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import ToolLoader from '@/public/tools/loader';

export default function ToolPage() {
  const router = useRouter();
  const { id } = router.query;
  const [tool, setTool] = useState(null);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loader = new ToolLoader();

    loader.loadTool(id)
      .then((loadedTool) => {
        if (!loadedTool) {
          setError(`Tool "${id}" not found`);
          setLoading(false);
          return;
        }

        setTool(loadedTool);
        setHtml(marked.parse(loadedTool.markdown || ''));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tool) return <div>Tool not found</div>;

  return (
    <div className="tool-page">
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>
      <div className="meta">
        <span>v{tool.version}</span>
        <a href={tool.sourceUrl} target="_blank" rel="noreferrer">GitHub →</a>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
