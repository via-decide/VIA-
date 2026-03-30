import Link from 'next/link';

export default function MainNavigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/tools">Tools</Link>
    </nav>
  );
}
