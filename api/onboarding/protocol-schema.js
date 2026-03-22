const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '../..');
const depotRoot = path.join(repoRoot, 'onboarding', 'depot');

function readDepotFile(fileName) {
  return fs.readFileSync(path.join(depotRoot, fileName), 'utf8');
}

function parsePreferenceBlocks(markdown) {
  return markdown
    .split(/^##\s+/m)
    .map((section) => section.trim())
    .filter(Boolean)
    .slice(1)
    .map((section) => {
      const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
      const id = lines.shift();
      const record = {
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
        if (line.startsWith('label:')) record.label = line.slice(6).trim();
        else if (line.startsWith('kind:')) record.kind = line.slice(5).trim();
        else if (line.startsWith('control:')) record.control = line.slice(8).trim();
        else if (line.startsWith('storage_key:')) record.storageKey = line.slice(12).trim();
        else if (line.startsWith('summary:')) record.summary = line.slice(8).trim();
        else if (line.startsWith('default:')) record.defaultValue = line.slice(8).trim();
        else if (line.startsWith('option:')) {
          const [optionId, optionLabel, optionDescription] = line.slice(7).split('|').map((part) => part.trim());
          if (optionId && optionLabel) {
            record.options.push({ id: optionId, label: optionLabel, description: optionDescription || '' });
          }
        }
      });

      return record;
    });
}

function buildProtocolSchema() {
  const orchestrationProfiles = JSON.parse(readDepotFile('orchestration-profiles.json'));
  const defaultModes = JSON.parse(readDepotFile('default-modes.json'));
  const preferences = parsePreferenceBlocks(readDepotFile('operational-preferences.md'));

  return {
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
        options: preferences,
      },
    ],
    defaults: {
      orchestration_profile: orchestrationProfiles[0] ? orchestrationProfiles[0].id : 'platform_architect',
      default_start_mode: defaultModes[0] ? defaultModes[0].id : 'mars_simulator',
      operational_preferences: preferences.reduce((acc, preference) => {
        acc[preference.storageKey] = preference.defaultValue;
        return acc;
      }, {}),
    },
  };
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  try {
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.status(200).json(buildProtocolSchema());
  } catch (error) {
    res.status(500).json({ error: 'protocol_schema_unavailable', detail: error instanceof Error ? error.message : String(error) });
  }
};

module.exports.buildProtocolSchema = buildProtocolSchema;
