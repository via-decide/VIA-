import orchestrationProfilesRaw from '../../onboarding/depot/orchestration-profiles.json?raw';
import defaultModesRaw from '../../onboarding/depot/default-modes.json?raw';
import operationalPreferencesRaw from '../../onboarding/depot/operational-preferences.md?raw';

export type ProtocolCardOption = {
  id: string;
  label: string;
  summary: string;
  description: string;
  tags: string[];
  icon?: string;
  accent?: string;
  module?: string;
};

export type ProtocolPreferenceOption = {
  id: string;
  label: string;
  description: string;
};

export type ProtocolPreference = {
  id: string;
  label: string;
  kind: string;
  control: string;
  storageKey: string;
  summary: string;
  defaultValue: string;
  options: ProtocolPreferenceOption[];
};

export type ProtocolSchema = {
  version: string;
  headline: string;
  subheadline: string;
  sourceFiles: string[];
  steps: [
    {
      id: 'orchestration_profile';
      title: string;
      kind: 'card-select';
      options: ProtocolCardOption[];
    },
    {
      id: 'default_start_mode';
      title: string;
      kind: 'mode-select';
      options: ProtocolCardOption[];
    },
    {
      id: 'operational_preferences';
      title: string;
      kind: 'preference-group';
      options: ProtocolPreference[];
    }
  ];
  defaults: {
    orchestration_profile: string;
    default_start_mode: string;
    operational_preferences: Record<string, string>;
  };
};

export type SovereignProtocolSelection = {
  orchestrationProfile: string;
  defaultStartMode: string;
  operationalPreferences: Record<string, string>;
};

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function parsePreferenceBlocks(markdown: string): ProtocolPreference[] {
  const sections = markdown
    .split(/^##\s+/m)
    .map((section) => section.trim())
    .filter(Boolean)
    .slice(1);

  return sections
    .map((section) => {
      const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
      const id = lines.shift()?.trim() || '';
      if (!id) return null;

      const preference: ProtocolPreference = {
        id,
        label: id,
        kind: 'toggle',
        control: 'binary',
        storageKey: id,
        summary: '',
        defaultValue: '',
        options: [],
      };

      lines.forEach((line) => {
        if (line.startsWith('label:')) {
          preference.label = line.slice('label:'.length).trim();
          return;
        }
        if (line.startsWith('kind:')) {
          preference.kind = line.slice('kind:'.length).trim();
          return;
        }
        if (line.startsWith('control:')) {
          preference.control = line.slice('control:'.length).trim();
          return;
        }
        if (line.startsWith('storage_key:')) {
          preference.storageKey = line.slice('storage_key:'.length).trim();
          return;
        }
        if (line.startsWith('summary:')) {
          preference.summary = line.slice('summary:'.length).trim();
          return;
        }
        if (line.startsWith('default:')) {
          preference.defaultValue = line.slice('default:'.length).trim();
          return;
        }
        if (line.startsWith('option:')) {
          const [optionId, optionLabel, optionDescription] = line
            .slice('option:'.length)
            .split('|')
            .map((part) => part.trim());

          if (optionId && optionLabel) {
            preference.options.push({
              id: optionId,
              label: optionLabel,
              description: optionDescription || '',
            });
          }
        }
      });

      return preference;
    })
    .filter((preference): preference is ProtocolPreference => Boolean(preference));
}

const orchestrationProfiles = parseJson<ProtocolCardOption[]>(orchestrationProfilesRaw);
const defaultModes = parseJson<ProtocolCardOption[]>(defaultModesRaw);
const parsedPreferences = parsePreferenceBlocks(operationalPreferencesRaw);

const schema: ProtocolSchema = {
  version: '2026-03-22',
  headline: 'PROTOCOL INITIALIZATION :: WELCOME SOVEREIGN_',
  subheadline: 'Hydrate sovereign defaults from the onboarding depot before Mars or Orchade access is granted.',
  sourceFiles: [
    'onboarding/depot/orchestration-profiles.json',
    'onboarding/depot/default-modes.json',
    'onboarding/depot/operational-preferences.md',
  ],
  steps: [
    {
      id: 'orchestration_profile',
      title: 'Define Your Orchestration Profile',
      kind: 'card-select',
      options: orchestrationProfiles,
    },
    {
      id: 'default_start_mode',
      title: 'Default Starting Mode',
      kind: 'mode-select',
      options: defaultModes,
    },
    {
      id: 'operational_preferences',
      title: 'Operational Preferences',
      kind: 'preference-group',
      options: parsedPreferences,
    },
  ],
  defaults: {
    orchestration_profile: orchestrationProfiles[0]?.id || 'platform_architect',
    default_start_mode: defaultModes[0]?.id || 'mars_simulator',
    operational_preferences: parsedPreferences.reduce<Record<string, string>>((acc, preference) => {
      acc[preference.storageKey] = preference.defaultValue;
      return acc;
    }, {}),
  },
};

export async function loadOnboardingProtocolSchema(): Promise<ProtocolSchema> {
  try {
    const response = await fetch('/api/onboarding/protocol-schema', {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Protocol schema request failed with ${response.status}`);
    }
    return await response.json() as ProtocolSchema;
  } catch (error) {
    console.warn('Falling back to bundled onboarding protocol schema.', error);
    return schema;
  }
}

export function normalizeProtocolSelection(
  input: Partial<SovereignProtocolSelection>,
  protocolSchema: ProtocolSchema = schema,
): SovereignProtocolSelection {
  return {
    orchestrationProfile: input.orchestrationProfile || protocolSchema.defaults.orchestration_profile,
    defaultStartMode: input.defaultStartMode || protocolSchema.defaults.default_start_mode,
    operationalPreferences: {
      ...protocolSchema.defaults.operational_preferences,
      ...(input.operationalPreferences || {}),
    },
  };
}
