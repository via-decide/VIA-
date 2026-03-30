import Link from 'next/link';
import { useEffect, useState } from 'react';
import ToolLoader from '@/public/tools/loader';

export default function Home() {
  const [featuredTools, setFeaturedTools] = useState([]);

  useEffect(() => {
    const loader = new ToolLoader();
    loader.getFeaturedTools().then(setFeaturedTools);
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Sovereign Kinetic OS</h1>
        <p>The Bharat-first digital ecosystem built for decision engineering, spatial mathematics, and tactile sovereign tools.</p>

        <div className="hero-cta">
          <Link href="/tools/" className="btn btn-primary btn-lg">
            Explore 44 Tools →
          </Link>
          <Link href="/academy/" className="btn btn-secondary btn-lg">
            Enter Academy
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>🧬 Decision Logic</h3>
          <p>44 professional decision tools mapped into an interactive academy.</p>
          <Link href="/academy/">Explore →</Link>
        </div>

        <div className="feature">
          <h3>🗺️ Spatial World</h3>
          <p>Discover the ViaDecide ecosystem through an interactive spatial map.</p>
          <Link href="/spatial-map/">View Map →</Link>
        </div>

        <div className="feature">
          <h3>🌾 Sovereign Data</h3>
          <p>Your profile, your data. A private, secure personal environment.</p>
          <Link href="/dashboard/">Dashboard →</Link>
        </div>
      </section>

      <section className="featured-tools">
        <h2>Featured Tools</h2>
        <div className="tools-preview">
          {featuredTools.map((tool) => (
            <div key={tool.id} className="tool-preview">
              <h4>{tool.name}</h4>
              <p>{tool.description}</p>
              <Link href={`/tools/${tool.id}`}>View →</Link>
            </div>
          ))}
        </div>
        <Link href="/tools/" className="btn btn-primary btn-lg">
          View All Tools →
        </Link>
      </section>
    </div>
  );
}
