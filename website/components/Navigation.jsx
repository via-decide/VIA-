import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="main-nav">
      <Link href="/">VIADECIDE</Link>
      <Link href="/tools/">Tools</Link>
      <Link href="/academy/">Academy</Link>
      <Link href="/spatial-map/">Spatial Map</Link>
      <Link href="/demos/">Demos</Link>
      <Link href="/docs/">Docs</Link>
      <Link href="/dashboard/">Dashboard</Link>
    </nav>
  );
}
