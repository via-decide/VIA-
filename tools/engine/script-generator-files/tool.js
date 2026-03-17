const briefEl = document.getElementById('brief');
const formatEl = document.getElementById('format');
const lengthEl = document.getElementById('length');
const toneEl = document.getElementById('tone');
const packEl = document.getElementById('pack');
const statusEl = document.getElementById('status');

const STORE_KEY = 'engine.script-generator-files.draft';

const FLOWS = {
  video: 'Hook → Context → Value → CTA',
  demo: 'Problem → Walkthrough → Outcome → CTA',
  sales: 'Pain → Proof → Offer → Close'
};

function sectionTemplate(title, text, id) {
  return `
    <div class="segment" data-id="${id}">
      <div class="segment-head">
        <h3 class="segment-title">${title}</h3>
        <button type="button" data-copy="${id}">Copy</button>
      </div>
      <textarea readonly id="${id}">${text}</textarea>
    </div>
  `;
}

function buildPack(brief, format, length, tone) {
  const flow = FLOWS[format] || FLOWS.video;
  const safeBrief = brief || '(no brief provided)';
  const safeLength = length || '60 seconds';
  const safeTone = tone || 'clear';

  return {
    opener: `You are watching a ${safeLength} ${format} script in a ${safeTone} tone.\n${safeBrief.split('\n')[0] || safeBrief}`,
    structure: `Flow: ${flow}\nLength Target: ${safeLength}\nTone: ${safeTone}`,
    body: [
      '1) Opening hook that states the core problem.',
      '2) Clarify the context in plain language.',
      '3) Show one concrete example with a clear benefit.',
      '4) Transition to next step and desired action.'
    ].join('\n'),
    cta: `Call to action: Take the next step now and apply this in your workflow today.`,
    shortPost: `Quick summary (${format}): ${safeBrief.slice(0, 150)}${safeBrief.length > 150 ? '…' : ''}`
  };
}

function renderPack(pack) {
  packEl.innerHTML = [
    sectionTemplate('Opener', pack.opener, 'seg-opener'),
    sectionTemplate('Structure', pack.structure, 'seg-structure'),
    sectionTemplate('Main Body', pack.body, 'seg-body'),
    sectionTemplate('CTA', pack.cta, 'seg-cta'),
    sectionTemplate('Short Post', pack.shortPost, 'seg-post')
  ].join('');

  packEl.querySelectorAll('button[data-copy]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.copy);
      navigator.clipboard.writeText(target.value || '');
      statusEl.textContent = `Copied ${button.dataset.copy.replace('seg-', '')}.`;
    });
  });
}

function getAllText() {
  const blocks = [...packEl.querySelectorAll('textarea')].map((el) => el.value.trim()).filter(Boolean);
  return blocks.join('\n\n---\n\n');
}

function saveDraft(payload) {
  ToolStorage.write(STORE_KEY, payload);
}

function generate() {
  const brief = briefEl.value.trim();
  const format = formatEl.value;
  const length = lengthEl.value.trim();
  const tone = toneEl.value.trim();

  const pack = buildPack(brief, format, length, tone);
  renderPack(pack);

  saveDraft({ brief, format, length, tone, pack });
  statusEl.textContent = 'Generated script pack.';
}

document.getElementById('generate').addEventListener('click', generate);
document.getElementById('copyAll').addEventListener('click', () => {
  const allText = getAllText();
  navigator.clipboard.writeText(allText);
  statusEl.textContent = 'Copied full script pack.';
});

document.getElementById('download').addEventListener('click', () => {
  const allText = getAllText();
  const blob = new Blob([allText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'script-generator-files.txt';
  link.click();
});

const saved = ToolStorage.read(STORE_KEY, null);
if (saved) {
  briefEl.value = saved.brief || '';
  formatEl.value = saved.format || 'video';
  lengthEl.value = saved.length || '';
  toneEl.value = saved.tone || '';
  if (saved.pack) renderPack(saved.pack);
  statusEl.textContent = 'Draft restored.';
} else {
  generate();
}
