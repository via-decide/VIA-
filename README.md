# VIA-OS / ViaDecide Platform

This repository contains the ViaDecide web platform and tool ecosystem entry points.

## What is here

- `index.html` — root kinetic landing page wired to existing app subpages.
- `apps/` — browser-native app surfaces (Viaco, SkillHex, Mars, Alchemist).
- `decide.engine-tools/` — tool index and tool package structure.
- `website/` — website scaffold and dynamic tool loader work.

## Local usage

This repo currently includes static browser pages (root + `apps/`) and additional website scaffolding under `website/`.

To run static pages quickly:

```bash
python3 -m http.server 8080
# open http://localhost:8080/
```

## License

Licensed under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE).
