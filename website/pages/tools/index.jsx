import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolLoader from '@/public/tools/loader';

export default function ToolsCatalog() {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loader = new ToolLoader();

    Promise.all([
      loader.getAllTools(),
      loader.loadIndex()
    ])
      .then(([loadedTools, index]) => {
        setTools(loadedTools);
        setFilteredTools(loadedTools);
        setCategories(['all', ...(index.categories || [])]);
        setLoading(false);
      })
      .catch(() => {
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

  useEffect(() => {
    let result = tools;

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(q)
        || t.description.toLowerCase().includes(q)
      );
    }

    setFilteredTools(result);
  }, [selectedCategory, searchQuery, tools]);

  if (loading) return <div className="loading">⏳ Loading tools...</div>;

  return (
    <div className="tools-container">
      <header className="tools-header">
        <h1>Decision Tools Library</h1>
        <p>44 professional decision-making tools</p>
      </header>

      <div className="tools-controls">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              type="button"
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="tools-grid">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="tool-card">
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <span className="category">{tool.category}</span>
            <Link href={`/tools/${tool.id}`} className="btn btn-primary">
              View Details
            </Link>
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
