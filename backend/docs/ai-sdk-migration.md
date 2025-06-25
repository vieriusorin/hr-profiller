# AI SDK Migration Guide

## Why Migrate to AI SDK?

Using `@ai-sdk/openai` instead of the direct `openai` package provides several key advantages:

### 🔄 **Provider Flexibility**
- Easy switching between OpenAI, Anthropic, Google, Mistral, Cohere, etc.
- Same API interface across all providers
- Reduces vendor lock-in

### 🚀 **Modern Features**
- Built-in retry logic with exponential backoff
- Timeout handling and abort signals
- Streaming support out of the box
- Better error handling

### 🛠️ **Developer Experience**
- Excellent TypeScript support
- Consistent API patterns
- Built-in utilities (e.g., `cosineSimilarity`)
- More idiomatic modern JavaScript/TypeScript

### 📊 **Enhanced Functionality**
- Structured output generation
- Advanced streaming capabilities
- Better token usage tracking
- Provider-agnostic abstractions

## Installation

```bash
npm install @ai-sdk/openai ai
# or
yarn add @ai-sdk/openai ai
```

## Migration Steps

### 1. Basic Setup Comparison

**Current (OpenAI SDK):**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
});
```

**With AI SDK:**
```typescript
import { openai } from '@ai-sdk/openai';

const provider = openai({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict',
});
```

### 2. Embeddings Migration

**Current:**
```typescript
async generateEmbeddings(text: string) {
  const response = await this.openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });
  
  return {
    embedding: response.data[0].embedding,
    usage: response.usage,
  };
}
```

**With AI SDK:**
```typescript
import { embed } from 'ai';

async generateEmbeddings(text: string) {
  const { embedding, usage } = await embed({
    model: provider.embedding('text-embedding-3-small'),
    value: text,
    maxRetries: 3,
    abortSignal: AbortSignal.timeout(30000),
  });
  
  return { embedding, usage };
}
```

### 3. Chat Completions Migration

**Current:**
```typescript
async generateChatCompletion(messages: any[]) {
  const response = await this.openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  });
  
  return {
    content: response.choices[0]?.message?.content || '',
    usage: response.usage,
  };
}
```

**With AI SDK:**
```typescript
import { generateText } from 'ai';

async generateChatCompletion(messages: any[]) {
  const { text, usage } = await generateText({
    model: provider('gpt-4-turbo-preview'),
    messages,
    temperature: 0.7,
    maxTokens: 2000,
    maxRetries: 3,
  });
  
  return {
    content: text,
    usage,
  };
}
```

### 4. Provider Switching Examples

**Switch to Anthropic:**
```typescript
import { anthropic } from '@ai-sdk/anthropic';

const claude = anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Same API, different provider!
const { text } = await generateText({
  model: claude('claude-3-sonnet-20240229'),
  messages,
});
```

**Switch to Google:**
```typescript
import { google } from '@ai-sdk/google';

const gemini = google({
  apiKey: process.env.GOOGLE_API_KEY,
});

const { text } = await generateText({
  model: gemini('gemini-pro'),
  messages,
});
```

## Key Benefits Demonstrated

### 1. Built-in Utilities
```typescript
import { cosineSimilarity } from 'ai';

// Calculate similarity between embeddings
const similarity = cosineSimilarity(embedding1, embedding2);
```

### 2. Better Error Handling
```typescript
try {
  const result = await generateText({
    model: provider('gpt-4'),
    messages,
    maxRetries: 3,
    abortSignal: AbortSignal.timeout(30000),
  });
} catch (error) {
  // AI SDK provides better error context
  console.error('Generation failed:', error);
}
```

### 3. Streaming Support
```typescript
import { streamText } from 'ai';

const { textStream } = streamText({
  model: provider('gpt-4'),
  messages,
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

## Migration Strategy

### Phase 1: Gradual Migration (Recommended)
1. Install AI SDK packages
2. Create new service alongside existing one
3. Test with non-critical features first
4. Gradually migrate endpoints

### Phase 2: Full Migration
1. Replace all OpenAI SDK calls
2. Update dependency injection
3. Update tests
4. Remove old OpenAI SDK dependency

### Phase 3: Leverage Advanced Features
1. Add streaming where beneficial
2. Implement provider switching
3. Use structured outputs
4. Add better error handling

## Provider Support Matrix

| Provider | Chat | Embeddings | Streaming | Models |
|----------|------|------------|-----------|---------|
| OpenAI | ✅ | ✅ | ✅ | GPT-4, GPT-3.5 |
| Anthropic | ✅ | ❌ | ✅ | Claude 3 |
| Google | ✅ | ✅ | ✅ | Gemini |
| Mistral | ✅ | ✅ | ✅ | Mistral |
| Cohere | ✅ | ✅ | ✅ | Command |

## Considerations

### Pros:
- **Future-proof**: Easy to switch providers
- **Modern**: Better DX and TypeScript support
- **Robust**: Built-in retry, timeout, error handling
- **Efficient**: Better batching and streaming

### Cons:
- **Migration effort**: Need to refactor existing code
- **Learning curve**: New API patterns to learn
- **Dependencies**: Additional packages to manage

## Recommendation

**Yes, migrate to AI SDK!** The benefits significantly outweigh the migration costs, especially for a forward-thinking application. The provider flexibility alone makes it worthwhile, and the improved DX and built-in utilities are excellent bonuses.

Start with a gradual migration approach to minimize risk and test thoroughly before full migration. 