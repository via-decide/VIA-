(function (global) {
  'use strict';

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'new-tool';
  }

  function parseOutputs(raw) {
    return String(raw || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function buildSpec({ prompt, title, category, outputs }) {
    const id = slugify(title || prompt.split(/[.\n]/)[0] || 'new-tool');
    const short = prompt.slice(0, 220);
    const primaryOutput = outputs[0] || 'result';

    return {
      id,
      name: title || id,
      description: short,
      category,
      inputs: ['user_prompt'],
      outputs: outputs.length ? outputs : [primaryOutput],
      relatedTools: ['code-generator', 'code-reviewer'],
      entry: `tools/${id}/index.html`,
      tags: ['generated', 'ai-tool-generator']
    };
  }

  function buildTemplate(spec) {
    return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${spec.name}</title>\n  <style>body{font-family:Inter,system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;background:#0b1220;color:#e5ecff}.card{background:#121a2d;border:1px solid #2c3858;border-radius:12px;padding:1rem}textarea{width:100%;min-height:160px;background:#0b1220;color:#e5ecff;border:1px solid #2c3858;border-radius:8px;padding:.8rem}button{margin-top:.7rem;background:#6ea8fe;color:#031327;border:0;border-radius:8px;padding:.5rem .8rem;font-weight:700}</style>\n</head>\n<body>\n  <h1>${spec.name}</h1>\n  <p>${spec.description}</p>\n  <div class="card">\n    <label>Input</label>\n    <textarea id="input" placeholder="Enter input"></textarea>\n    <button id="run" type="button">Run</button>\n    <pre id="output"></pre>\n  </div>\n  <script>document.getElementById('run').addEventListener('click',()=>{const v=document.getElementById('input').value;document.getElementById('output').textContent=JSON.stringify({tool:'${spec.id}',input:v,output:'${spec.outputs[0] || 'result'}'},null,2);});<\/script>\n</body>\n</html>`;
  }

  function registerPreviewPlugin(spec) {
    if (!global.ToolRegistry?.registerPlugin) return false;
    global.ToolRegistry.registerPlugin({ ...spec, toolDir: `tools/${spec.id}` });
    return true;
  }

  function init() {
    const form = document.getElementById('generator-form');
    if (!form) return;

    const specOutput = document.getElementById('generated-spec');
    const htmlOutput = document.getElementById('generated-html');
    const pluginOutput = document.getElementById('generated-plugin');
    const status = document.getElementById('generator-status');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const prompt = document.getElementById('tool-prompt').value.trim();
      const title = document.getElementById('tool-title').value.trim();
      const category = document.getElementById('tool-category').value;
      const outputs = parseOutputs(document.getElementById('tool-outputs').value);
      const autoRegister = document.getElementById('auto-register').checked;

      const spec = buildSpec({ prompt, title, category, outputs });
      const template = buildTemplate(spec);
      const pluginPayload = { ...spec, toolDir: `tools/${spec.id}` };

      specOutput.textContent = JSON.stringify(spec, null, 2);
      htmlOutput.textContent = template;
      pluginOutput.textContent = JSON.stringify(pluginPayload, null, 2);

      if (autoRegister) {
        const registered = registerPreviewPlugin(pluginPayload);
        status.textContent = registered
          ? `Registered ${spec.id} in runtime registry. Add folder + config and run manifest generation to persist.`
          : 'Runtime registry is unavailable on this page; copy payload and register from the hub.';
      } else {
        status.textContent = 'Spec generated. Copy payload to register manually.';
      }
    });
  }

  global.AiToolGenerator = { init, buildSpec, buildTemplate };
})(window);
