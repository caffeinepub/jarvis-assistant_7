# Tharun's-jarvis-405

## Current State
A Jarvis-like voice assistant PWA with:
- Voice input (Web Speech API) and text input
- Female voice TTS responses
- Knowledge base (intelligenceEngine.ts) for general questions
- commandProcessor.ts handles specific commands (time, date, jokes, math, reminders, notes, CSE B student lookup)
- If knowledge base has no answer, falls back to a generic "I'll search for that" message
- JarvisOrb component: animated glowing orb with idle/listening/thinking/speaking states
- Dark futuristic theme already in place (arc-reactor cyan/blue palette)
- Conversation panel, reminders panel, notes panel

## Requested Changes (Diff)

### Add
- **Web Search via Wikipedia API**: When intelligenceEngine and commandProcessor both fail to answer, automatically call Wikipedia REST API (`https://en.wikipedia.org/api/rest_v1/page/summary/{term}`) to find an answer. Extract the summary and present it.
- **Web Search Display**: Show the search result as text in the conversation panel AND speak it aloud via TTS.
- **Search status indicator**: Show "Searching the web..." status while fetching.
- **Revolving orb visual upgrade**: The center orb should have visually prominent revolving rings/particles around it -- multiple concentric orbiting rings at different angles (like a 3D atom or arc reactor), making it look like a ball revolving in the center.
- **Futuristic HUD overlays**: Add corner HUD decorations, subtle scan lines, and data readout elements for more Iron Man Jarvis feel.

### Modify
- **intelligenceEngine.ts**: Add `searchWeb(query)` async function that calls Wikipedia API and returns a formatted answer string, or null if not found.
- **App.tsx**: After commandProcessor + intelligenceEngine both return no answer, call `searchWeb()` async, set orbState to "thinking" while waiting, then display and speak the result. If Wikipedia also fails, fall back to suggesting a Google search.
- **JarvisOrb.tsx**: Enhance the orb with 3 revolving rings at different tilt angles (0deg, 60deg, -60deg) creating a 3D sphere-like orbital effect. The rings should revolve at different speeds. Add a bright glowing core sphere inside.
- **Status text**: Show "SEARCHING WEB..." when doing a web search.

### Remove
- The generic "let me search that for you" dead-end fallback response (replace with actual web search)

## Implementation Plan
1. Add `searchWeb(query: string): Promise<string | null>` to intelligenceEngine.ts using Wikipedia summary API
2. Update App.tsx handleCommand flow: after local knowledge fails, call searchWeb(), show "SEARCHING WEB..." status and thinking orb state, then speak+display result
3. Upgrade JarvisOrb.tsx: add 3 tilted revolving orbital rings at different angles (CSS 3D transforms), glowing core sphere
4. Add HUD corner decorations to App.tsx layout
5. Validate and fix any TypeScript/lint errors
