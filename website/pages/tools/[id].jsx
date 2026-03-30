import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolLoader from '@/public/tools/loader';
import { marked } from 'marked';

export default function ToolPage() {
  const router = useRouter();
  const { id } = router.query;
  const [tool, setTool] = useState(null);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loader = new ToolLoader();
    loader.loadTool(id)
      .then(async (loadedTool) => {
        if (!loadedTool) {
          setLoading(false);
          return;
        }

        setTool(loadedTool);

        try {
          const htmlContent = marked.parse(loadedTool.markdown);
          setHtml(htmlContent);
        } catch (e) {
          setHtml(`<pre>${loadedTool.markdown}</pre>`);
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!tool) return <div>Tool not found</div>;

  return (
    <div className="tool-detail-page">
      <Link href="/tools/">← Back to Tools</Link>

      <h1>{tool.name}</h1>
      <p>{tool.description}</p>

      <div className="tool-meta">
        <span>v{tool.version}</span>
        <span>{tool.category}</span>
        <a href={tool.sourceUrl} target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
