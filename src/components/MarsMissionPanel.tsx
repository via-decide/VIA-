import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Orbit, Rocket, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { Game } from '../types';
import {
  fetchMarsNavigation,
  generateMarsEnvironment,
  registerMarsCoreBridge,
  requestMarsSession,
  type MarsLaunchSnapshot,
} from '../services/marsCoreService';

type MarsMissionPanelProps = {
  game: Game;
  onClose: () => void;
};

const MarsMissionPanel: React.FC<MarsMissionPanelProps> = ({ game, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState<MarsLaunchSnapshot | null>(null);
  const [frameSrc, setFrameSrc] = useState('');

  useEffect(() => {
    let cancelled = false;

    registerMarsCoreBridge();

    async function launchMars() {
      try {
        setLoading(true);
        setError('');

        const session = await requestMarsSession();
        const navigation = await fetchMarsNavigation(session.token);
        const environment = await generateMarsEnvironment(session.token);
        const nextSnapshot = { session, navigation, environment };

        if (cancelled) return;

        window.VIAMarsCore?.setLastLaunch(nextSnapshot);
        setSnapshot(nextSnapshot);

        const launchUrl = new URL(game.url, window.location.href);
        launchUrl.searchParams.set('sso', session.token);
        launchUrl.searchParams.set('via_uid', session.user.uid);
        launchUrl.searchParams.set('via_name', session.user.name || '');
        launchUrl.searchParams.set('via_quadrant', environment.quadrant);
        launchUrl.searchParams.set('via_seed', environment.seed);
        setFrameSrc(launchUrl.toString());
      } catch (launchError) {
        if (cancelled) return;
        setError(launchError instanceof Error ? launchError.message : 'Mars launch failed.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    launchMars();

    return () => {
      cancelled = true;
    };
  }, [game.url]);

  const telemetry = useMemo(() => {
    if (!snapshot) return [];
    return [
      {
        label: 'Velocity',
        value: `${snapshot.navigation.physics.velocityFractionC.toFixed(1)}c`,
      },
      {
        label: 'Lorentz γ',
        value: snapshot.navigation.physics.lorentzGamma.toFixed(6),
      },
      {
        label: 'Quadrant',
        value: snapshot.environment.quadrant,
      },
      {
        label: 'Mesh',
        value: `${snapshot.environment.mesh.triangleCount} tris`,
      },
    ];
  }, [snapshot]);

  return (
    <div className="fixed inset-0 z-[100] bg-via-dark flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center">
            <Orbit size={18} className="text-orange-300" />
          </div>
          <div>
            <div className="font-syne font-bold text-white">{game.title}</div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">
              Module #48 · authenticated bridge
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-xl glass-panel text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="grid md:grid-cols-[360px_1fr] h-full min-h-0">
        <aside className="border-r border-white/10 px-5 py-5 space-y-4 overflow-y-auto">
          <div className="rounded-3xl border border-orange-400/20 bg-orange-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-orange-300">
              <Rocket size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Launch Corridor</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              VIA mints a short-lived Mars session, syncs the Module #48 coordinate frame, then preloads the
              0.1c navigation envelope and seeded planetary mesh before the rover viewport opens.
            </p>
          </div>

          <div className="rounded-3xl glass-panel p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Session Status</span>
            </div>
            {loading && (
              <div className="flex items-center gap-3 text-white/70">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm">Synchronizing authenticated Mars runtime…</span>
              </div>
            )}
            {!loading && error && (
              <div className="flex items-start gap-3 text-red-300">
                <TriangleAlert size={18} className="mt-0.5" />
                <div>
                  <div className="font-semibold">Launch blocked</div>
                  <div className="text-sm text-red-200/80">{error}</div>
                </div>
              </div>
            )}
            {!loading && snapshot && (
              <div className="space-y-2 text-sm text-white/70">
                <div>Operator: <span className="text-white">{snapshot.session.user.name}</span></div>
                <div>Session TTL: <span className="text-white">{snapshot.session.expiresInSeconds}s</span></div>
                <div>Coordinate frame: <span className="text-white">{snapshot.navigation.coordinateSystem.frame}</span></div>
              </div>
            )}
          </div>

          {telemetry.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {telemetry.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{item.label}</div>
                  <div className="font-syne font-bold text-lg text-white mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <section className="min-h-0 bg-black/20">
          {frameSrc && !error ? (
            <iframe
              src={frameSrc}
              className="w-full h-full border-none"
              title={game.title}
              allow="fullscreen"
            />
          ) : (
            <div className="h-full flex items-center justify-center px-8 text-center text-white/50">
              {loading ? 'Preparing Mars mission viewport…' : 'Mars viewport unavailable until the session bridge succeeds.'}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MarsMissionPanel;
