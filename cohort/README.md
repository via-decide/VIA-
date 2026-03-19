# Branching Documentary Remotion Project

This project renders branching documentary episodes from `production.json` using a **single** Remotion composition: `EpisodeFromJson`.

## Run

```bash
npm install
npm run start
ts-node --esm render.ts V01
```

## CLI

```bash
# list ids
npm run render:list

# render one
npm run render -- V01

# render many
npm run render -- V01 V03 V08

# render all
npm run render:all
```

## Validation

```bash
npm run validate
```

Checks:
- video ids are unique
- branch targets exist
- `total_duration_frames = fps * duration_seconds`
- scene duration sum equals `total_duration_frames`

## Folder structure

```text
.
├── production.json
├── render.ts
├── scripts/
│   └── validate-production.ts
├── src/
│   ├── index.ts
│   ├── Root.tsx
│   ├── EpisodeFromJson.tsx
│   ├── types.ts
│   ├── data/load-production.ts
│   ├── components/
│   │   ├── SceneFrame.tsx
│   │   └── TextOverlays.tsx
│   └── scenes/
│       ├── IntroAnimationScene.tsx
│       ├── TalkingExplanationScene.tsx
│       ├── StoryScene.tsx
│       ├── RepoScreenCaptureScene.tsx
│       ├── DiagramAnimationScene.tsx
│       ├── DecisionOverlayScene.tsx
│       └── OutroScene.tsx
└── public/
    ├── screenshots/
    ├── diagrams/
    └── footage/
```

## Scene types supported

- `intro_animation`
- `talking_explanation`
- `story_scene`
- `repo_screen_capture`
- `diagram_animation`
- `decision_overlay`
- `outro`

> Legacy types in the current JSON are normalized internally:
> `talking_head`, `mixed_narration_broll`, `screen_capture_annotated`, `animated_diagram`.


## Voice integration notes

- Voice playback is now resolved through `src/voice/voiceResolver.ts` and consumed by `EpisodeFromJson` so Studio preview and final render share the same audio source path.
- If no scene-level audio source exists yet, the resolver falls back to transcript segments from `full_script` fields for deterministic debugging.
- Dev-only Voice Debug Panel appears in Remotion Studio and shows selected voice, source URL, generation status, playback status, transcript segment count, scene id, and latest response/error.
- No environment variables are currently required by this repo.
