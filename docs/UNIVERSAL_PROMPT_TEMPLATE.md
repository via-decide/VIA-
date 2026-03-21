# Universal AI Prompt Template — ViaDedide Creator Suite

## MULTI-MODEL COMPATIBILITY
Works with: Claude 3.x, Gemini 2.0, ChatGPT-4, Claude Code, Anthropic API

---

## TEMPLATE STRUCTURE

```
=== SYSTEM CONTEXT ===
Role: [ROLE]
Product: ViaDedide Creator Suite
Task: [TASK_NAME]
Output Format: [JSON/HTML/Text/Code]

=== INPUT DATA ===
Platform: [instagram|linkedin|youtube|x|general]
ContentType: [caption|script|article|title|thread|hook]
Tone: [casual|professional|viral|educational]
Length: [short|medium|long]
UserInput: [USER_CONTENT]

=== PROCESSING RULES ===
1. Preserve brand voice (structured, decision-focused, no hype)
2. Optimize for platform (hashtags, length, formatting)
3. Include engagement hooks (questions, CTAs, storytelling)
4. Validate output (grammar, brand alignment, platform limits)

=== OUTPUT SCHEMA ===
{
  "generated": "[PRIMARY_OUTPUT]",
  "variants": ["variant_1", "variant_2", "variant_3"],
  "metadata": {
    "characterCount": 0,
    "platform": "[platform]",
    "tone": "[tone]",
    "engagementScore": 0-100,
    "hashtags": ["tag1", "tag2"]
  },
  "feedback": "[suggestions_for_improvement]"
}

=== EXAMPLES ===
[Model-specific examples below]
```

---

## MODEL-SPECIFIC IMPLEMENTATIONS

### CLAUDE (Claude 3.5 Sonnet / Opus)
```javascript
const claudePrompt = {
  system: `You are a social media strategist for ViaDedide Creator Suite.
    Focus on: structured content, decision-making narrative, engagement.
    Never use hype language or fake urgency.`,
  
  userMessage: (input) => `
    Platform: ${input.platform}
    Content Type: ${input.contentType}
    User Input: "${input.content}"
    
    Generate:
    1. Optimized post/caption
    2. 2 alternative versions (A/B test variants)
    3. Platform-specific hashtags (max 5)
    4. Estimated engagement hooks
    5. Feedback for improvement`,
  
  config: { temperature: 0.7, maxTokens: 1000 }
};
```

### GEMINI 2.0
```javascript
const geminiPrompt = {
  systemInstruction: `You are a content optimization expert for ViaDedide.
    Specialize in: structured social media, creator economics, decision narratives.`,
  
  prompt: (input) => `
    TASK: ${input.contentType}
    PLATFORM: ${input.platform}
    INPUT: ${input.content}
    
    OUTPUT REQUIREMENTS:
    - Primary version (optimized)
    - Variant A (more conversational)
    - Variant B (more data-driven)
    - SEO/Hashtag recommendations
    - Engagement prediction`,
  
  config: { temperature: 0.8, topP: 0.95 }
};
```

### CHATGPT-4 / OpenAI
```javascript
const openaiPrompt = {
  system: `You create structured, data-driven social content for ViaDedide Creator Suite.
    Brand voice: Professional, decision-focused, no manipulation.`,
  
  userMessage: (input) => `
    Create ${input.contentType} for ${input.platform}:
    "${input.content}"
    
    Response format (JSON):
    {
      "primary": "main_version",
      "variants": ["alt_1", "alt_2"],
      "hashtags": [...],
      "platformNotes": "specific_constraints",
      "engagementTips": ["tip1", "tip2"]
    }`,
  
  config: { temperature: 0.7, maxTokens: 1200 }
};
```

### CLAUDE CODE / ANTHROPIC API
```javascript
const anthropicAPIPrompt = {
  model: "claude-opus-4-20250514",
  maxTokens: 1024,
  system: `System: Creator Content Optimizer
    Input: User content + platform
    Output: Structured JSON with generated content`,
  
  messages: [
    {
      role: "user",
      content: `Platform: ${platform}\nContent: ${userInput}\nGenerate: ${task}`
    }
  ]
};
```

---

## UNIVERSAL USAGE PATTERN

```javascript
class CreatorPromptEngine {
  async generate(input) {
    const { platform, contentType, content, modelProvider } = input;
    
    // Normalize input across models
    const normalizedInput = {
      platform: this.validatePlatform(platform),
      contentType: this.validateType(contentType),
      content: this.sanitize(content),
      tone: input.tone || 'balanced'
    };
    
    // Route to appropriate model
    let response;
    switch (modelProvider) {
      case 'claude':
        response = await this.generateViaAnthropic(normalizedInput);
        break;
      case 'gemini':
        response = await this.generateViaGemini(normalizedInput);
        break;
      case 'openai':
        response = await this.generateViaOpenAI(normalizedInput);
        break;
      default:
        response = await this.generateViaAnthropic(normalizedInput);
    }
    
    // Standardize output format
    return this.normalizeOutput(response);
  }
  
  normalizeOutput(response) {
    return {
      generated: response.primary || response.generated,
      variants: response.variants || response.alternatives || [],
      metadata: {
        characterCount: (response.primary || '').length,
        hashtags: response.hashtags || response.tags || [],
        engagementScore: response.score || 75,
        feedback: response.feedback || 'Ready to post'
      }
    };
  }
}
```

---

## INTEGRATION CHECKLIST

- [ ] Add API keys for all 4 providers to `.env`
- [ ] Test output consistency across models
- [ ] Implement fallback (Claude default, then Gemini, then OpenAI)
- [ ] Cache responses to reduce API calls
- [ ] Add model-selection toggle in creator UI
- [ ] Monitor token usage per provider
- [ ] A/B test generated content quality by model

---

## BRAND VOICE RULES (All Models)

✅ **DO:**
- Structured, data-driven language
- Clear value propositions
- Platform-native formatting
- Decision frameworks
- Real statistics when available

❌ **DON'T:**
- Hype language ("GAME-CHANGER", "MUST-READ")
- Urgency tactics ("HURRY", "LIMITED TIME")
- Fake engagement bait
- Overuse of emojis
- Clickbait headers

---

## PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| Response time (all models) | <2 seconds |
| Output consistency | >95% semantic match |
| User satisfaction | 4.2+ / 5 |
| Model preference | Track per-user |
