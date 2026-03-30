import { useState } from 'react';

export default function SovereignDataPage() {
  const [privacy, setPrivacy] = useState({});

  const updatePrivacy = async (setting, value) => {
    await fetch('/api/user/privacy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setting, value })
    });
    setPrivacy((prev) => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="data-privacy-page">
      <h1>🌾 Your Sovereign Data</h1>

      <section>
        <h2>Privacy Settings</h2>

        <label>
          <input
            type="checkbox"
            checked={privacy.publicProfile || false}
            onChange={(e) => updatePrivacy('publicProfile', e.target.checked)}
          />
          Make profile public
        </label>

        <label>
          <input
            type="checkbox"
            checked={privacy.dataCollection || false}
            onChange={(e) => updatePrivacy('dataCollection', e.target.checked)}
          />
          Allow analytics
        </label>
      </section>

      <section>
        <h2>Export Your Data</h2>
        <button className="btn" type="button">📥 Download All Data</button>
      </section>

      <section>
        <h2>Delete Account</h2>
        <button className="btn btn-danger" type="button">🗑️ Permanently Delete</button>
      </section>
    </div>
  );
}
