import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/user')
      .then((r) => r.json())
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (!user) return <div>Please log in</div>;

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user.name}!</h1>

      <section>
        <h2>🌾 Your Sovereign Data</h2>
        <p>Manage your personal information and privacy settings</p>
        <Link href="/dashboard/data/" className="btn">Manage Data</Link>
      </section>

      <section>
        <h2>Recent Tools</h2>
        <Link href="/tools/" className="btn">Browse Tools</Link>
      </section>
    </div>
  );
}
