import { auth } from '../firebase';

export type MarsSessionEnvelope = {
  token: string;
  target: 'mars';
  moduleId: string;
  expiresInSeconds: number;
  user: {
    uid: string;
    name: string;
    email: string | null;
    picture: string | null;
    provider: string;
  };
};

export type MarsNavigationEnvelope = {
  moduleId: string;
  target: 'mars';
  version: string;
  coordinateSystem: {
    frame: string;
    referenceEpoch: string;
    axes: Record<string, string>;
    originMeters: Record<string, number>;
    localOffsetMeters: Record<string, number>;
    commandStepMeters: number;
  };
  physics: {
    velocityFractionC: number;
    velocityMetersPerSecond: number;
    lorentzGamma: number;
    properTimeScale: number;
    speedOfLightMetersPerSecond: number;
    recommendedLatencyMs: number;
    bridgeMode: string;
  };
};

export type MarsEnvironmentEnvelope = {
  moduleId: string;
  generator: string;
  target: 'mars';
  quadrant: string;
  seed: string;
  detail: number;
  mesh: {
    quadrant: string;
    seed: string;
    resolution: {
      columns: number;
      rows: number;
    };
    vertexCount: number;
    triangleCount: number;
    vertices: [number, number, number][];
    indices: [number, number, number][];
    heights: number[];
  };
  terrainCatalog: Array<{
    id: number;
    name: string;
    complex: number;
    success: number;
    quadrant: string;
  }>;
};

export type MarsLaunchSnapshot = {
  session: MarsSessionEnvelope;
  navigation: MarsNavigationEnvelope;
  environment: MarsEnvironmentEnvelope;
};

declare global {
  interface Window {
    VIAMarsCore?: {
      requestSession: () => Promise<MarsSessionEnvelope>;
      getNavigation: (token: string) => Promise<MarsNavigationEnvelope>;
      generateEnvironment: (token: string, quadrant?: string) => Promise<MarsEnvironmentEnvelope>;
      getLastLaunch: () => MarsLaunchSnapshot | null;
      setLastLaunch: (snapshot: MarsLaunchSnapshot) => void;
    };
  }
}

let lastLaunchSnapshot: MarsLaunchSnapshot | null = null;

function buildApiPath(path: string): string {
  return path.startsWith('./') ? path : `./${path.replace(/^\//, '')}`;
}

async function buildAuthHeaders(tokenOverride?: string): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const currentUser = auth.currentUser;
  if (tokenOverride) {
    headers.Authorization = `Bearer ${tokenOverride}`;
    return headers;
  }

  if (!currentUser) {
    throw new Error('Mars launch requires an authenticated VIA session.');
  }

  const firebaseToken = await currentUser.getIdToken();
  headers.Authorization = `Bearer ${firebaseToken}`;
  headers['X-VIA-UID'] = currentUser.uid;
  headers['X-VIA-Name'] = currentUser.displayName || 'VIA Operator';
  headers['X-VIA-Email'] = currentUser.email || '';
  headers['X-VIA-Photo'] = currentUser.photoURL || '';

  return headers;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = (payload as { detail?: string }).detail || response.statusText;
    throw new Error(detail || 'Mars bridge request failed.');
  }
  return payload as T;
}

export async function requestMarsSession(): Promise<MarsSessionEnvelope> {
  const response = await fetch(buildApiPath('./api/auth/session-token'), {
    method: 'POST',
    headers: {
      ...(await buildAuthHeaders()),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target: 'mars' }),
  });

  return readJson<MarsSessionEnvelope>(response);
}

export async function fetchMarsNavigation(token: string): Promise<MarsNavigationEnvelope> {
  const response = await fetch(buildApiPath('./api/mars/navigation'), {
    method: 'GET',
    headers: await buildAuthHeaders(token),
  });

  return readJson<MarsNavigationEnvelope>(response);
}

export async function generateMarsEnvironment(
  token: string,
  quadrant = 'A3-07',
): Promise<MarsEnvironmentEnvelope> {
  const environmentUrl = new URL(buildApiPath('./api/mars/environment'), window.location.href);
  environmentUrl.searchParams.set('quadrant', quadrant);
  environmentUrl.searchParams.set('detail', '20');
  environmentUrl.searchParams.set('seed', `via-core-${quadrant}`);

  const response = await fetch(environmentUrl.toString(), {
    method: 'GET',
    headers: await buildAuthHeaders(token),
  });

  return readJson<MarsEnvironmentEnvelope>(response);
}

export function registerMarsCoreBridge(): void {
  if (typeof window === 'undefined' || window.VIAMarsCore) return;

  window.VIAMarsCore = {
    requestSession: requestMarsSession,
    getNavigation: fetchMarsNavigation,
    generateEnvironment: generateMarsEnvironment,
    getLastLaunch: () => lastLaunchSnapshot,
    setLastLaunch: (snapshot: MarsLaunchSnapshot) => {
      lastLaunchSnapshot = snapshot;
    },
  };
}
