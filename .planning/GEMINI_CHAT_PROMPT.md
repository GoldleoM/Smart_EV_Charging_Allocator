# GEMINI PROMPT: EXECUTE PHASE 5B PLANNING

**Copy this entire section into Gemini Chat (gemini.google.com) for autonomous planning**

---

## SYSTEM CONTEXT

I'm building a hackathon EV charging orchestrator (80% done). I need you to help me plan Phase 5B: adding Gemini AI for smart station recommendations.

**Current Project:**
- Backend: Node.js simulator running real-time allocation every 5 seconds
- Frontend: React consumer app (mobile-first) + admin dashboard
- DB: Firebase RTDB with real-time state sync
- 3 mock stations in NYC with real charger/parking counts
- 7 mock vehicles driving around and charging

**Technology Stack:**
- Frontend: React 19, TypeScript, TailwindCSS, Vite
- Backend: Node.js, TypeScript, Firebase
- AI: Gemini 2.0 Flash (for speed/cost)

**Current Status:**
- Phase 1-4 complete (data models, allocation engine, UI, real-time sync)
- Phase 5: Consumer app prototype (basic charging request screens)
- Phase 5B (NEW): Add Gemini for natural language station recommendations

---

## THE FEATURE REQUEST

**User Story:**
As a driver, I want to describe my charging situation in natural language (e.g., "I have 25 mins, battery at 20%, prefer Downtown") and get ranked recommendations. I don't want to manually evaluate all stations.

**What the driver sees:**
1. Click [🎯 Ask AI] button
2. Type: "I have 25 minutes, my battery is at 20%, I prefer Downtown or Midtown but not Uptown"
3. System shows 3 ranked recommendation cards:
   - ⭐ BEST: Midtown Fast-Charge (7 min away, 85% charge in 25 min)
   - 🟡 ALTERNATIVE: Downtown Hub (12 min away, 65% charge)
   - ❌ NOT RECOMMENDED: Uptown Plaza (30+ min wait)
4. Driver clicks [Navigate] on one
5. Vehicle spawns in Firebase and heads there

**How it works (flow):**
- User input → Gemini parses constraints → Backend queries real-time state → Gemini ranks stations + explains → Display cards → Driver chooses

---

## CURRENT CODEBASE STRUCTURE

**Key Files You Need to Know:**

Backend:
- `src/simulator.ts` - Main 5s loop (vehicle physics, allocation)
- `src/engine/allocator.ts` - Priority scoring algorithm
- `src/models/Vehicle.ts` - Vehicle interface + mock generation
- `src/models/Station.ts` - Station interface + seed data

Frontend (Consumer App):
- `consumer-app/src/App.tsx` - Screen state machine
- `consumer-app/src/components/screens/RequestChargeScreen.tsx` - Entry point
- `consumer-app/src/components/screens/EnRouteScreen.tsx` - Driving to station
- `consumer-app/src/hooks/useSimulationState.ts` - Firebase real-time hook
- `consumer-app/src/lib/firebase.ts` - Firebase config

**Firebase Paths:**
- `/vehicles/{id}` - vehicle state (battery, location, eta, status)
- `/stations/{id}` - station state (available chargers, parking, queue length)
- `/system/` - global settings

**Mock Data (Hardcoded):**
- Station 1: Downtown Hub (40.7128, -74.0060) | 10 parking, 5 chargers
- Station 2: Midtown Fast-Charge (40.7580, -73.9855) | 8 parking, 8 chargers
- Station 3: Uptown Plaza (40.7851, -73.9683) | 15 parking, 3 chargers
- Test Vehicle: manual_user_999 (spawned on [Navigate] click)

---

## YOUR TASK: GENERATE A COMPREHENSIVE PLAN

I need you to create a detailed implementation plan for Phase 5B. Please include:

### 1. Architecture Design
- How Gemini fits into the data flow
- What components need to be created/modified
- How data flows from user input → Gemini → backend → UI
- Error handling strategy

### 2. Component Breakdown
- List all React components to create/modify
- Brief purpose of each
- Props/state for each component
- How they wire together

### 3. Gemini Integration Points
- Which API calls are needed (parsing, ranking, formatting)
- Exact prompts for each call
- Temperature/token settings
- Error handling if Gemini fails

### 4. Backend Mock Design
- How to mock the backend query without building real endpoint
- What data should it return
- How to fetch real-time Firebase data for realism
- Calculation methods (ETA, queue wait, charge projection)

### 5. Implementation Roadmap
- Break into 5-6 phases (setup, hooks, components, state, testing, polish)
- Estimated time for each phase (in hours)
- Dependencies between phases
- Clear acceptance criteria for each phase

### 6. Testing Strategy
- 3 concrete test scenarios (example inputs + expected outputs)
- Edge cases to handle
- How to verify each component works

### 7. Code Snippets
- TypeScript interfaces for the data models
- Sample Gemini prompts (ready to copy)
- Skeleton code for key functions

### 8. Potential Risks & Mitigations
- What could go wrong?
- How to prevent/handle each risk
- Fallback strategies

---

## CONSTRAINTS & PREFERENCES

**Design Decisions (Already Made):**
- Input: Text chat (not voice, for implementation speed)
- UI: Card-based recommendations (not chat bubbles)
- Backend: Start with mock (real endpoint later)
- Gemini Model: gemini-2.0-flash (fast, cheap)
- Cost Target: <$0.001 per recommendation
- Mobile-First: 400px max width

**Time Budget:** 
- Ideally 2-3 days
- Alternatively, could be done faster if simplified

**Demo Priority:**
- This must work visibly and impressively on demo day
- Judges should see: "WOW, the AI understands natural language"
- Performance: <3 seconds per recommendation

**Technical Constraints:**
- Must use existing Firebase setup (no new infrastructure)
- Must work with existing vehicle/station models
- Consumer app runs on port 5174
- Admin dashboard runs on port 5173
- Both run concurrently during demo

---

## OPTIONAL ENHANCEMENTS (If Time Allows)

- Multi-turn conversation (Gemini remembers context)
- Voice input (Web Speech API)
- Achievement gamification
- Integration with real backend endpoint
- Predictive surge alerts

---

## OUTPUT FORMAT

Please provide the plan in this structure:

```
# Phase 5B: Smart Station Recommendation Engine - EXECUTION PLAN

## 1. Architecture Overview
[Diagram + explanation]

## 2. Component Map
[List of all components with purposes]

## 3. Gemini Integration Points
[API calls, prompts, settings]

## 4. Backend Mock Strategy
[How to build realistic mock data]

## 5. Implementation Roadmap
[Step-by-step phases with hours/acceptance criteria]

## 6. Testing Scenarios
[3 concrete test cases]

## 7. Code Skeletons
[TypeScript interfaces + sample implementations]

## 8. Risk Assessment
[Risks + mitigations]

## 9. Success Checklist
[Definition of done]

## 10. Questions for Clarification
[Any ambiguities I should address?]
```

---

## CONTEXT: Why This Matters

- **For the hackathon:** This is a killer feature that shows AI understanding real-world constraints
- **For the judges:** Visual proof that your system is intelligent, not just shuffling vehicles
- **For the demo:** One feature that makes people go "Oh wow, that actually works"
- **For scalability:** Template for adding more AI features later

---

**Now, please create a detailed, actionable plan for implementing this feature. Be thorough but concise. Include code examples where helpful. Assume I'm an experienced developer but new to this specific project.**

---

