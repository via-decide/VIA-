import Link from 'next/link';
import ToolLoader from '@/public/tools/loader';
import { useEffect, useState } from 'react';

export default function Academy() {
  const [toolsByCategory, setToolsByCategory] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loader = new ToolLoader();
    loader.loadIndex().then(async (index) => {
      const grouped = {};
      for (const cat of index.categories || []) {
        // eslint-disable-next-line no-await-in-loop
        grouped[cat] = await loader.getToolsByCategory(cat);
      }
      setCategories(index.categories || []);
      setToolsByCategory(grouped);
    });
  }, []);

  return (
    <div className="academy-page">
      <h1>🧬 Logic Academy</h1>
      <p>44 professional decision tools organized by category</p>

      <section className="academy-categories">
        {categories.map((category) => (
          <div key={category} className="category-section">
            <h2>{category}</h2>
            <div className="tools-list">
              {toolsByCategory[category]?.map((tool) => (
                <div key={tool.id} className="academy-tool">
                  <h4>{tool.name}</h4>
                  <p>{tool.description}</p>
                  <Link href={`/tools/${tool.id}`}>Learn →</Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
