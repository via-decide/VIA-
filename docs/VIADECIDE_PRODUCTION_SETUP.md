# ViaDedide Ecosystem — Production Implementation Guide

## ARCHITECTURE OVERVIEW

```
User Entry (Onboarding)
    ↓
    ├─ Learner → StudyOS (existing)
    ├─ Creator → Multi-Model Creator Suite
    └─ User → Structured Feed (existing, no new code)
    
Creator Suite Routes:
    Platform Selection (Instagram, LinkedIn, YouTube, X)
        ↓
    Creator Tools (powered by Universal Prompt Template)
        ├─ Claude (default fallback)
        ├─ Gemini 2.0
        └─ ChatGPT-4
```

---

## IMPLEMENTATION CHECKLIST — PHASE 1 (2-3 weeks)

### 1. Universal Prompt Template (COMPLETED)
- [x] Create `UNIVERSAL_PROMPT_TEMPLATE.md`
- [x] Define multi-model prompt structure
- [ ] Test with 4 AI providers
- [ ] Create fallback chain (Claude → Gemini → OpenAI)

### 2. Onboarding UI (COMPLETED)
- [x] Build 3-role selection (Learner, Creator, User)
- [x] Creator platform selector (4 platforms)
- [x] Creator tools grid (16 tools total)
- [ ] Connect to actual tool routes
- [ ] Add analytics tracking (role selection, platform preference)

### 3. Creator Tools Implementation
```javascript
// Priority order for MVP:
1. Prompt Alchemy (multi-platform, universal)
2. Caption Generator (Instagram-focused)
3. Script Writer (YouTube-focused)
4. Hook Writer (X-focused)

// Phase 2:
5. Article Generator (LinkedIn)
6. Thread Builder (X/LinkedIn)
7. Thumbnail Studio (YouTube/Instagram)
8. SEO Optimizer (YouTube)
```

### 4. Backend Integration
- [ ] User config storage (Firebase/Postgres)
  - user_id, role, platform, model_provider, created_at
- [ ] API endpoints for tools
- [ ] Multi-model routing logic
- [ ] Response caching (Redis)
- [ ] Usage tracking per model/user

### 5. Frontend Integration
- [ ] Connect onboarding to creator tools
- [ ] Tool-specific UI components
- [ ] Model selection dropdown (Claude/Gemini/ChatGPT)
- [ ] Output preview + variants
- [ ] Direct platform export (copy to clipboard)

---

## CODE SETUP (Day 1)

### Install Dependencies
```bash
# Frontend (React)
npm install react axios zustand

# API Client
npm install @anthropic-ai/sdk @google/generative-ai openai dotenv

# Utilities
npm install uuid date-fns
```

### Environment Variables (.env)
```
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...

FIREBASE_PROJECT_ID=...
FIREBASE_API_KEY=...

NODE_ENV=production
LOG_LEVEL=info
```

---

## FILE STRUCTURE

```
src/
├── components/
│   ├── Onboarding/
│   │   ├── RoleSelector.jsx
│   │   ├── PlatformSelector.jsx
│   │   └── ToolGrid.jsx
│   ├── CreatorTools/
│   │   ├── PromptAlchemy.jsx
│   │   ├── CaptionGenerator.jsx
│   │   ├── ScriptWriter.jsx
│   │   └── ToolWrapper.jsx
│   └── Shared/
│       ├── ModelSelector.jsx
│       └── OutputPreview.jsx
│
├── services/
│   ├── ai/
│   │   ├── claude.js
│   │   ├── gemini.js
│   │   ├── openai.js
│   │   └── promptRouter.js
│   ├── user/
│   │   └── configManager.js
│   └── platform/
│       └── exportFormatter.js
│
├── hooks/
│   ├── useCreatorTool.js
│   ├── useModelProvider.js
│   └── useConfig.js
│
├── utils/
│   ├── prompts/
│   │   ├── instagram.prompts.js
│   │   ├── linkedin.prompts.js
│   │   ├── youtube.prompts.js
│   │   └── x.prompts.js
│   └── constants.js
│
└── styles/
    └── tailwind.config.js
```

---

## CREATOR TOOL IMPLEMENTATION — PROMPT ALCHEMY (MVP)

### Component Structure
```javascript
// src/components/CreatorTools/PromptAlchemy.jsx

import React, { useState } from 'react';
import { useCreatorTool } from '../../hooks/useCreatorTool';
import ModelSelector from '../Shared/ModelSelector';
import OutputPreview from '../Shared/OutputPreview';

export default function PromptAlchemy({ platform }) {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('balanced');
  const [modelProvider, setModelProvider] = useState('claude');
  const { generate, loading, output, variants } = useCreatorTool('prompt-alchemy');

  const handleGenerate = async () => {
    await generate({
      platform,
      contentType: 'caption',
      content: input,
      tone,
      modelProvider
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Prompt Alchemy — {platform}</h1>
      
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your draft prompt or content..."
        style={{ width: '100%', height: '120px', marginBottom: '1rem' }}
      />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
          <option value="viral">Viral</option>
          <option value="educational">Educational</option>
        </select>

        <ModelSelector 
          value={modelProvider} 
          onChange={setModelProvider}
        />

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Optimize'}
        </button>
      </div>

      {output && (
        <OutputPreview 
          primary={output.generated}
          variants={variants}
          platform={platform}
          metadata={output.metadata}
        />
      )}
    </div>
  );
}
```

### Service Layer
```javascript
// src/services/ai/promptRouter.js

import { callClaude } from './claude';
import { callGemini } from './gemini';
import { callOpenAI } from './openai';

export async function generateContent(input) {
  const { platform, contentType, content, tone, modelProvider } = input;

  try {
    let response;

    switch (modelProvider) {
      case 'claude':
        response = await callClaude(input);
        break;
      case 'gemini':
        response = await callGemini(input);
        break;
      case 'openai':
        response = await callOpenAI(input);
        break;
      default:
        // Fallback chain: Claude → Gemini → OpenAI
        try {
          response = await callClaude(input);
        } catch {
          try {
            response = await callGemini(input);
          } catch {
            response = await callOpenAI(input);
          }
        }
    }

    return normalizeResponse(response, platform);
  } catch (error) {
    console.error('Content generation failed:', error);
    throw new Error('Failed to generate content. Try another model.');
  }
}

function normalizeResponse(response, platform) {
  return {
    generated: response.primary || response.text,
    variants: response.variants || response.alternatives || [],
    metadata: {
      platform,
      characterCount: (response.primary || '').length,
      hashtags: response.hashtags || [],
      engagementScore: response.score || 75,
      feedback: response.feedback || 'Ready to post'
    }
  };
}
```

---

## STRUCTURED SOCIAL ARCHITECTURE

**Core Principle:** ViaDedide is NOT another algorithm-driven social network.

### Design Decisions
| Aspect | Traditional Social | ViaDedide |
|--------|-------------------|-----------|
| **Feed** | Algorithmic, engagement-driven | Chronological, user-controlled |
| **Discovery** | Opaque recommendations | Framework-based categories |
| **Creator Economics** | Black-box revenue sharing | Transparent, multi-platform |
| **Content Focus** | Viral metrics | Decision frameworks, real value |

### Feed Architecture (REUSE EXISTING)
- No new social media UI needed
- Use existing ViaDedide feed component
- Add "structured" label/badge
- Show decision framework context per post

### Integration Point
```javascript
// src/routes/app.jsx

import { BrowserRouter } from 'react-router-dom';
import Onboarding from '../components/Onboarding/RoleSelector';
import CreatorSuite from '../components/CreatorTools/Suite';
import ViaDedideFeed from '../components/Social/Feed'; // EXISTING

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/creator/*" element={<CreatorSuite />} />
        <Route path="/feed" element={<ViaDedideFeed />} />
        <Route path="/learn" element={<StudyOS />} /> {/* Redirect */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## DEPLOYMENT — VERCEL + MULTI-MODEL ROUTING

### vercel.json
```json
{
  "version": 2,
  "env": [
    "ANTHROPIC_API_KEY",
    "GEMINI_API_KEY",
    "OPENAI_API_KEY"
  ],
  "builds": [
    { "src": "src/index.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### API Routes (serverless functions)
```javascript
// api/generate.js — routes to multi-model backend

export default async function handler(req, res) {
  const { input, modelProvider } = req.body;

  try {
    const response = await generateContent({
      ...input,
      modelProvider: modelProvider || 'claude'
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## TESTING CHECKLIST

### Unit Tests
- [ ] Prompt normalization (all 4 models)
- [ ] Output parsing consistency
- [ ] Fallback chain logic
- [ ] Platform-specific formatting

### Integration Tests
- [ ] Claude → API → Response
- [ ] Gemini → API → Response
- [ ] ChatGPT → API → Response
- [ ] Fallback chain (Claude fails, Gemini succeeds)

### E2E Tests
- [ ] Learner: Click → StudyOS loads
- [ ] Creator: Select platform → Tools load → Generate → Copy
- [ ] User: Click → Feed loads (no delays)

### Performance Tests
- [ ] Tool generation <2s (all models)
- [ ] First contentful paint <1s
- [ ] API response <1s (with cache)

---

## LAUNCH SEQUENCE (Week 3)

1. **Day 1**: Deploy MVP (Onboarding + Prompt Alchemy)
2. **Day 2**: Add Caption Generator + Script Writer
3. **Day 3**: Hook Writer + Thread Builder
4. **Day 4**: Analytics + A/B testing
5. **Day 5**: User feedback + iteration

---

## SUCCESS METRICS

| KPI | Target | Tool |
|-----|--------|------|
| **Onboarding completion** | >70% | Google Analytics |
| **Creator tool usage** | >40% of creators | Mixpanel |
| **Model preference** | Track per user | Custom events |
| **Generation speed** | <2s average | API logs |
| **User satisfaction** | 4.2+ / 5 | In-app survey |

---

## FAST EXECUTION PRINCIPLES

1. **Use existing components** (StudyOS, Feed) — don't rebuild
2. **Multi-model abstraction first** — switch providers without code changes
3. **API fallback chain** — never let user see "service down"
4. **Incremental launch** — 1 tool per day, not all at once
5. **Metrics from day 1** — track everything, iterate fast

---

## NEXT IMMEDIATE ACTIONS

### This Week:
- [x] Create universal prompt template ✓
- [x] Build onboarding UI ✓
- [ ] Implement Prompt Alchemy tool
- [ ] Setup multi-model routing
- [ ] Deploy to staging

### Next Week:
- [ ] Add 3 more creator tools
- [ ] Launch MVP (public beta)
- [ ] Gather user feedback
- [ ] Optimize API performance

### Ongoing:
- Monitor model performance metrics
- Iterate on tool UX based on usage
- Expand tool ecosystem
- Scale infrastructure
