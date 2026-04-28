# GEMINI 2.0 PRO STRUCTURED PROMPT - PHASE 5B PLANNING
## (Use with "Extended Thinking" Mode for Deep Analysis)

---

## INSTRUCTION PREAMBLE

You are an expert AI system architect tasked with planning the implementation of an AI-powered feature (Gemini integration) within an existing real-time EV charging optimization platform. 

Your goal is to generate a comprehensive, detailed, and executable plan that:
1. Is technically sound and architecturally clean
2. Respects existing codebase patterns and constraints
3. Prioritizes hackathon demo visibility
4. Minimizes implementation complexity while maximizing impact
5. Identifies and mitigates risks proactively

Use your extended thinking capabilities to:
- Deeply analyze data flow and component interactions
- Identify potential integration issues before they arise
- Suggest elegant solutions that fit the existing architecture
- Break complex features into manageable, sequential tasks

---

## PROBLEM STATEMENT

**Project Context:**
- EV Charging + Parking Orchestrator (hackathon submission, 80% complete)
- Real-time allocation platform using Firebase RTDB + React frontend + Node.js backend
- Phase 5B: Add Gemini AI for natural language charging recommendations

**Current State:**
- Backend: Simulator running every 5 seconds, tracking 7 vehicles across 3 stations
- Frontend: React consumer app (mobile-first) with hardcoded test vehicle `manual_user_999`
- Real-time: Firebase RTDB syncing vehicle/station state to all clients
- UI: Basic "Navigate to Charger" button; no AI integration yet

**The Ask:**
Enable drivers to describe their situation (time available, battery level, preferences, constraints) in natural language → Gemini parses it → backend provides optimal station ranking → UI displays recommendations → driver chooses → vehicle spawns and navigates.

---

## CONSTRAINT ANALYSIS

### Technical Constraints
1. Must integrate with existing Firebase setup (no new infrastructure)
2. Must respect existing vehicle/station data models
3. Consumer app is mobile-first (max-width: 400px)
4. Both consumer app (port 5174) and admin dashboard (port 5173) run concurrently
5. No backend endpoint exists yet (start with mock)
6. Simulator runs every 5 seconds; allocation is real-time

### Design Constraints
1. Input: Text-only (voice can be added later)
2. Output: Card-based UI (not chat interface)
3. Gemini model: 2.0-flash (fast, cost-effective)
4. Cost target: <$0.001 per recommendation
5. Response time: <3 seconds per recommendation

### Business Constraints
1. This is a hackathon demo (polish > perfection)
2. Feature must be visibly impressive to judges
3. Demos run on specific hardware (mobile sim + 2x laptop screens)
4. Time budget: 2-3 days ideal, but could be faster

---

## ARCHITECTURE DEEP DIVE

### Current System Flow
```
[Simulator] ---(5s tick)---> [Allocator] ---(updates)---> [Firebase RTDB]
                                                                 ↓
                                          [Admin Dashboard] [Consumer App]
                                             (React)            (React)
                                          ← [Real-time sync] →
```

### Proposed: Where Gemini Fits
```
[Driver Input] ---> [Gemini: Parse] ---> [Backend Query] ---> [Gemini: Format]
(natural lang)        (constraints)    (mock or real)      (friendly text)
                                              ↓
                                        [Firebase RTDB]
                                        (real-time state)
                                              ↓
                                        [Ranking Logic]
                                        (score stations)
                                              ↓
                                        [UI: Cards]
                                        (display)
                                              ↓
                                        [Driver Click]
                                        [Navigate]
                                              ↓
                                        [Firebase Update]
                                        (spawn vehicle)
```

### Data Flow Detail
```
Timeline:
T+0s:   User types: "I have 25 mins, battery 20%, prefer Downtown"
T+0.1s: Send to Gemini (parse request)
T+1.2s: Gemini returns: { time: 25, battery: 20, preferred: ['Downtown'], ... }
T+1.3s: Fetch real-time station data from Firebase
T+1.4s: Call mock backend / calculate scores
T+1.5s: Send station data back to Gemini (format explanations)
T+2.8s: Gemini returns explanations for 3 recommendations
T+2.9s: Render RecommendationScreen with 3 cards
T+3.0s: User sees results; ready to click [Navigate]
Total time: ~3 seconds (acceptable)
```

---

## COMPONENT ARCHITECTURE

### New Components to Create

#### 1. ChatInput.tsx (UI Component)
**Purpose:** Render text input for natural language queries  
**Responsibilities:**
- Text input field with placeholder
- Submit button (or Enter key handler)
- Loading spinner while processing
- Error message display
- Clear button

**Props:**
```typescript
interface ChatInputProps {
  onSubmit: (input: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}
```

**State:**
- `inputText: string`
- `isLoading: boolean`
- `error: string | null`

#### 2. RecommendationCard.tsx (UI Component)
**Purpose:** Display individual station recommendation  
**Responsibilities:**
- Render station rank badge (⭐ / 🟡 / ❌)
- Show station name, ETA, queue, projected charge
- Display match confidence indicator
- Show Gemini-generated explanation
- Provide [Navigate] and [Details] buttons

**Props:**
```typescript
interface RecommendationCardProps {
  recommendation: StationRecommendation;
  rank: 1 | 2 | 3;
  onNavigate: (stationId: string) => void;
  onDetails?: (stationId: string) => void;
}
```

#### 3. RecommendationScreen.tsx (Container Component)
**Purpose:** Orchestrate recommendation display  
**Responsibilities:**
- Show parsed request summary at top
- Display 3 recommendation cards in rank order
- Provide [Ask Again] and [Skip AI] buttons
- Handle navigation when user clicks [Navigate]

**Props:**
```typescript
interface RecommendationScreenProps {
  parseResult: ParsedRequest;
  recommendations: StationRecommendation[];
  onAskAgain: () => void;
  onSkip: () => void;
}
```

### Components to Modify

#### 1. RequestChargeScreen.tsx
**Modifications:**
- Add [🎯 Ask AI] button next to existing [Navigate to Nearest] button
- When clicked: show ChatInput overlay/modal
- Maintain existing functionality for direct navigation

#### 2. App.tsx (State Machine)
**Modifications:**
- Add states: `"Chatting"` and `"Recommending"`
- Route to ChatInput when user clicks [🎯 Ask AI]
- Route to RecommendationScreen after Gemini processing
- Update navigation logic for [Navigate] from recommendation

---

## HOOK ARCHITECTURE

### Main Integration Hook: useStationRecommendation.ts

**Purpose:** Orchestrate entire Gemini + backend flow  
**Returns:**
```typescript
interface UseStationRecommendationReturn {
  getRecommendations: (userInput: string) => Promise<RecommendationResult>;
  isLoading: boolean;
  error: string | null;
}

interface RecommendationResult {
  parsed: ParsedRequest;
  recommendations: StationRecommendation[];
  rawStationData: any;
  processingTimeMs: number;
}
```

**Internal Flow:**
```
getRecommendations(userInput)
  ↓
  1. parseUserRequest(userInput)
     - Call Gemini with PARSE_PROMPT
     - Return: ParsedRequest
     - Error handling: ask user to rephrase
  ↓
  2. queryBackend(parsed)
     - Fetch real-time station data from Firebase
     - Calculate ETA, queue projections
     - Score each station based on parsed constraints
     - Return: StationScores[]
  ↓
  3. formatRecommendations(stationScores, parsed)
     - For each of top 3 stations, call Gemini with EXPLAIN_PROMPT
     - Generate friendly explanation
     - Return: StationRecommendation[]
  ↓
  Return: RecommendationResult
```

### Support Functions

#### parseUserRequest(userInput: string)
```typescript
async function parseUserRequest(userInput: string): Promise<ParsedRequest> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = PARSE_PROMPT.replace('{userInput}', userInput);
  
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { 
      temperature: 0.3,  // Deterministic for JSON
      maxOutputTokens: 200 
    }
  });
  
  try {
    const jsonText = result.response.text().match(/\{[\s\S]*\}/)?.[0];
    return JSON.parse(jsonText || '{}');
  } catch (e) {
    throw new Error("Failed to parse Gemini response");
  }
}
```

#### queryBackend(parsed: ParsedRequest)
```typescript
async function queryBackend(parsed: ParsedRequest) {
  // Step 1: Get real-time station data from Firebase
  const stationsSnapshot = await get(ref(db, '/stations'));
  const stations = stationsSnapshot.val();
  
  // Step 2: Calculate metrics for each station
  const stationScores = Object.entries(stations).map(([id, station]) => {
    // Calculate ETA using current vehicle location
    // (Assume vehicle at center of station bounding box for demo)
    const eta = calculateETA(vehicleLocation, station.location);
    
    // Get current queue from Firebase
    const queue = station.queueLength || 0;
    
    // Project charge at time limit
    const projectedCharge = Math.min(
      100,
      parsed.battery_level_percent + (parsed.time_available_minutes * 0.5)
    );
    
    // Calculate match score
    const score = calculateMatchScore(
      station,
      parsed,
      eta,
      queue,
      projectedCharge
    );
    
    return { id, station, eta, queue, projectedCharge, score };
  });
  
  // Step 3: Sort by score and return top 3
  return stationScores.sort((a, b) => b.score - a.score).slice(0, 3);
}
```

#### formatRecommendations(stationScores, parsed)
```typescript
async function formatRecommendations(stationScores, parsed) {
  const recommendations = [];
  
  for (let i = 0; i < stationScores.length; i++) {
    const { id, station, eta, queue, projectedCharge, score } = stationScores[i];
    
    const explanation = await generateExplanation({
      stationName: station.name,
      eta,
      queue,
      projectedCharge,
      timeAvailable: parsed.time_available_minutes,
      battery: parsed.battery_level_percent,
      preferences: parsed.preferred_stations,
      constraints: parsed.constraints
    });
    
    recommendations.push({
      station_id: id,
      station_name: station.name,
      eta_minutes: eta,
      queue_position: queue,
      chargers_available: station.availableChargers,
      projected_charge_at_timelimit: projectedCharge,
      match_score: score,
      explanation,
      matches_preferences: parsed.preferred_stations.includes(station.name),
      rank: i + 1 as 1 | 2 | 3
    });
  }
  
  return recommendations;
}
```

---

## GEMINI PROMPTS (Production-Ready)

### PARSE_PROMPT
```text
You are a smart EV charging assistant. Parse the driver's input into structured data.

User Input: "{userInput}"

Respond ONLY with valid JSON (no other text). Extract this structure:
{
  "time_available_minutes": <number or null>,
  "battery_level_percent": <number or null>,
  "preferred_stations": [<exact names matching: "Downtown Hub", "Midtown Fast-Charge", "Uptown Plaza">],
  "avoid_stations": [<station names to avoid>],
  "constraints": [<urgency, comfort, food, amenities, quick_charge, etc>],
  "confidence": <0.0 to 1.0>
}

Rules:
1. If time not mentioned, set to null
2. If battery not mentioned, set to null
3. For station names, match EXACTLY to the three real options
4. If you can't match a name, leave out of arrays
5. Always return valid JSON only
6. Confidence should reflect how well you understood their request

If uncertain about parsing, ask for clarification via Gemini (caller will re-prompt).
```

### EXPLAIN_PROMPT
```text
Generate a SHORT, friendly explanation for a charging recommendation.

Driver's Situation:
- Time available: {timeAvailable} minutes
- Battery: {batteryLevel}%
- Preferences: {preferences}
- Constraints: {constraints}

Recommended Station: {stationName}
- ETA: {eta} minutes away
- Cars ahead: {queuePos}
- Available chargers: {chargersAvailable}
- Estimated battery after {timeAvailable} min: {projectedCharge}%

Write 1-2 sentences explaining why this is their best option.
- Be specific about the benefits
- Include numbers
- Be encouraging but realistic
- Match their tone (urgent vs leisurely)

Example good responses:
"Midtown is perfect for you! Only 7 minutes away with just 1 car ahead - you'll hit 85% easily."
"Downtown's queue is longer but you have the time, so you'll actually get the most charging."
```

### FALLBACK_PROMPT
```text
A driver has constraints that are hard to satisfy.

Situation:
- Time available: {time} minutes
- Battery: {battery}%
- Constraints: {constraints}

Generate a SHORT, honest, empathetic message (1-2 sentences) explaining their situation 
and suggesting the "least bad" station option.

Be realistic but not discouraging.

Example:
"You're cutting it close - all stations have 20+ minute queues. 
Uptown is closest but expect a 30+ minute wait for a charger."
```

---

## MOCK BACKEND QUERY DESIGN

### Why Mock? (For Now)
- Real backend endpoint `/api/recommend-stations` takes time to build
- Mock uses real Firebase data (already in system)
- Realistic responses from day 1
- Easy to upgrade to real endpoint later

### Mock Implementation Strategy

```typescript
async function mockBackendQuery(parsed: ParsedRequest): Promise<StationScore[]> {
  // 1. Fetch real-time station data from Firebase
  const stationsRef = ref(db, '/stations');
  const stationsSnapshot = await get(stationsRef);
  const stations = stationsSnapshot.val();
  
  if (!stations) throw new Error("No stations in database");
  
  // 2. Assume vehicle is at center of service area (40.7580, -73.9855)
  // In real implementation, this would be actual vehicle location
  const vehicleLocation = { lat: 40.7580, lng: -73.9855 };
  
  // 3. Calculate scores for each station
  const scores: StationScore[] = [];
  
  for (const [stationId, station] of Object.entries(stations)) {
    // Calculate ETA (distance formula + speed)
    const latDiff = station.location.lat - vehicleLocation.lat;
    const lngDiff = station.location.lng - vehicleLocation.lng;
    const distanceDegrees = Math.sqrt(latDiff ** 2 + lngDiff ** 2);
    const etaMinutes = Math.max(2, Math.round(distanceDegrees * 222));
    
    // Get current queue from Firebase
    const currentQueue = station.queueLength || 0;
    
    // Get real availability
    const chargersAvailable = station.availableChargers || 0;
    const parkingAvailable = station.availableParking || 0;
    
    // Project charge at time limit
    const chargeRate = 0.5; // % per minute (realistic for EV)
    const projectedCharge = Math.min(
      100,
      (parsed.battery_level_percent || 20) + (parsed.time_available_minutes || 30) * chargeRate
    );
    
    // Calculate match score (0-100)
    let score = 50; // Base score
    
    // Time fit: -30 points if too far, +30 if perfect
    if (parsed.time_available_minutes) {
      const timeNeeded = etaMinutes + (currentQueue * 5); // 5 min per car ahead
      const timeFit = Math.max(0, parsed.time_available_minutes - timeNeeded) / parsed.time_available_minutes;
      score += timeFit * 30;
    }
    
    // Preference match: +20 if matches, -20 if avoided
    if (parsed.preferred_stations?.includes(station.name)) {
      score += 20;
    } else if (parsed.avoid_stations?.includes(station.name)) {
      score -= 20;
    }
    
    // Availability: +50 if chargers available, -50 if full
    if (chargersAvailable > 0) {
      score += (chargersAvailable / station.totalChargers) * 50;
    } else {
      score -= 50;
    }
    
    // Parking: penalty if parking full and vehicle needs it
    if (parkingAvailable === 0) {
      score -= 25;
    }
    
    // Charge capability: bonus if projected charge is high
    if (projectedCharge >= 80) {
      score += 20;
    }
    
    scores.push({
      stationId,
      station,
      etaMinutes,
      currentQueue,
      chargersAvailable,
      parkingAvailable,
      projectedCharge,
      score: Math.max(0, Math.min(100, score))
    });
  }
  
  // 4. Sort by score descending and return
  return scores.sort((a, b) => b.score - a.score);
}
```

### Mock Data Structure (Return Value)

```typescript
interface StationScore {
  stationId: string;
  station: Station;  // From Firebase
  etaMinutes: number;
  currentQueue: number;
  chargersAvailable: number;
  parkingAvailable: number;
  projectedCharge: number;  // % battery after timeLimit
  score: number;  // 0-100
}
```

---

## IMPLEMENTATION PHASES

### PHASE 1: Setup & Infrastructure (1-2 hours)
**Tasks:**
- [ ] Create `consumer-app/src/lib/aiPrompts.ts` with 3 prompts
- [ ] Create `consumer-app/src/types/recommendations.ts` with interfaces
- [ ] Add `@google/generative-ai` package to `consumer-app/package.json`
- [ ] Add `VITE_GEMINI_API_KEY` to `consumer-app/.env`
- [ ] Test Gemini connection in a simple test file

**Acceptance Criteria:**
- `npm install` completes without errors
- Can create Gemini model instance
- `VITE_GEMINI_API_KEY` is loaded from .env

---

### PHASE 2: Hooks & Logic (2-3 hours)
**Tasks:**
- [ ] Create `consumer-app/src/hooks/useStationRecommendation.ts`
  - [ ] Implement `parseUserRequest()` function
  - [ ] Implement `queryBackend()` mock function
  - [ ] Implement `formatRecommendations()` function
  - [ ] Implement error handling & fallbacks
  - [ ] Test with sample inputs locally
- [ ] Create helper utilities in new file `lib/stationScoring.ts`

**Acceptance Criteria:**
- Can parse natural language into structured JSON
- Can calculate ETA and match scores
- Can generate explanations with Gemini
- Error handling works (invalid input, Gemini fails, etc.)

---

### PHASE 3: UI Components (3-4 hours)
**Tasks:**
- [ ] Create `ChatInput.tsx` component
  - Input field, submit button, loading state, error display
- [ ] Create `RecommendationCard.tsx` component
  - Rank badge, station info, explanation, navigate/details buttons
- [ ] Create `RecommendationScreen.tsx` component
  - Shows parsed request, stacks 3 cards, navigation buttons
- [ ] Test individual components with mock data

**Acceptance Criteria:**
- Components render without errors
- Mobile responsive (400px max width)
- All interactive elements work
- Styling matches app theme

---

### PHASE 4: Integration & Wiring (2-3 hours)
**Tasks:**
- [ ] Modify `RequestChargeScreen.tsx` to add [🎯 Ask AI] button
- [ ] Update `App.tsx` state machine
  - Add "Chatting" and "Recommending" states
  - Route between screens properly
- [ ] Wire ChatInput → hook → RecommendationScreen
- [ ] Wire [Navigate] button → Firebase update + EnRouteScreen
- [ ] Test full flow end-to-end

**Acceptance Criteria:**
- Full user flow works: input → recommendations → navigate → vehicle spawns
- Screen transitions are smooth
- Firebase updates correctly when [Navigate] clicked
- Admin dashboard shows `manual_user_999` spawning

---

### PHASE 5: Testing & Edge Cases (1-2 hours)
**Tasks:**
- [ ] Test with 3 provided scenarios (see below)
- [ ] Test error cases: impossible constraints, no good options
- [ ] Test edge cases: nonsensical input, contradictory constraints
- [ ] Performance testing: response time <3 seconds
- [ ] Mobile viewport testing

**Acceptance Criteria:**
- All test scenarios pass
- Error messages are helpful
- Response time acceptable
- No console errors

---

### PHASE 6: Polish & Demo Prep (1-2 hours)
**Tasks:**
- [ ] Optimize Gemini prompts for consistency
- [ ] Add loading animations & visual feedback
- [ ] Test on demo hardware/setup
- [ ] Create demo script & edge case workarounds
- [ ] Final QA sweep

**Acceptance Criteria:**
- Demo runs smoothly
- No crashes or console errors
- Prompts generate consistent quality responses
- Judges' first impression is "wow, the AI works"

**Total Estimated Time: 10-17 hours**

---

## TESTING SCENARIOS (Copy for Testing)

### Test Scenario 1: Time-Constrained Commuter
**Input:** "I'm stuck in traffic, have 15 minutes, battery's getting low"

**Expected Gemini Parse:**
```json
{
  "time_available_minutes": 15,
  "battery_level_percent": null,
  "preferred_stations": [],
  "avoid_stations": [],
  "constraints": ["urgent", "stuck_in_traffic", "low_battery"],
  "confidence": 0.85
}
```

**Expected Backend Response:**
- Top recommendation: Fastest station with shortest queue
- Projected charge: Whatever can be charged in remaining time
- Explanation emphasizes urgency and speed

**Expected UI Output:**
```
⭐ BEST: [Fastest Station]
  7 min away | 1 car in queue | 12% charge in 15 min
  "This is your only shot! Leave now and you'll make it."
```

---

### Test Scenario 2: Road Trip Planner
**Input:** "I'm planning a 200-mile road trip tomorrow, need full charge, have 2 hours, would love somewhere with food"

**Expected Gemini Parse:**
```json
{
  "time_available_minutes": 120,
  "battery_level_percent": 0,
  "preferred_stations": [],
  "avoid_stations": [],
  "constraints": ["road_trip", "full_charge_needed", "amenities", "comfort"],
  "confidence": 0.90
}
```

**Expected Backend Response:**
- Top recommendation: Most reliable station with 0 queue
- Projected charge: 100% (plenty of time)
- Explanation emphasizes comfort and reliability

**Expected UI Output:**
```
⭐ BEST: [Most Reliable Station]
  12 min away | 2 cars ahead | 100% charge in 95 min
  "You have plenty of time! This station is super reliable and super comfortable for a wait."
```

---

### Test Scenario 3: Preference-Based
**Input:** "I'm at 30% battery, prefer Downtown or Midtown, don't send me to Uptown, I have 30 minutes"

**Expected Gemini Parse:**
```json
{
  "time_available_minutes": 30,
  "battery_level_percent": 30,
  "preferred_stations": ["Downtown Hub", "Midtown Fast-Charge"],
  "avoid_stations": ["Uptown Plaza"],
  "constraints": [],
  "confidence": 0.95
}
```

**Expected Backend Response:**
- Top recommendation: Downtown or Midtown (prefer list)
- Respects avoid list (Uptown ranked last, marked "not recommended")
- Explanation acknowledges preference

**Expected UI Output:**
```
⭐ BEST: Downtown Hub
  6 min away | 4 cars ahead | 65% charge in 30 min
  "Downtown works perfectly for you! Your preference is honored, and you'll get a solid 65% charge."

🟡 ALTERNATIVE: Midtown Fast-Charge
  8 min away | 1 car ahead | 80% charge in 30 min
  "Slightly better charging, but Downtown is what you wanted."

❌ NOT RECOMMENDED: Uptown Plaza
  3 min away | 10 cars ahead | 30% charge in 30 min
  "I know you wanted to avoid this one. It'll be jammed anyway."
```

---

## RISK ASSESSMENT & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Gemini API fails | Medium | High | Implement fallback rule-based ranking; show error message; cache last result |
| Response time >3s | Low | High | Use gemini-2.0-flash; add timeout; cache for repeated queries |
| JSON parse fails | Low | Medium | Wrap in try-catch; ask user to rephrase; provide examples |
| Mock data unrealistic | Low | Medium | Use real Firebase data; validate calculations manually |
| UI not mobile-responsive | Low | High | Test at 400px viewport; use TailwindCSS constraints |
| Station names don't match | Medium | Medium | Normalize input; provide exact names in prompt |
| Contradictory constraints | Low | Medium | Detect & ask for clarification; use Gemini to resolve |
| Demo day connection fails | Low | Critical | Test offline mode; cache responses; have backup demo video |

---

## SUCCESS DEFINITION (Definition of Done)

**Functional Requirements:**
- ✅ Parse natural language into structured constraints
- ✅ Query real-time station data from Firebase
- ✅ Calculate scores for each station
- ✅ Generate Gemini explanations for top 3 stations
- ✅ Display recommendations in card-based UI
- ✅ [Navigate] button updates Firebase and spawns vehicle
- ✅ Handle errors gracefully

**Non-Functional Requirements:**
- ✅ Response time: <3 seconds per recommendation
- ✅ Cost: <$0.001 per recommendation
- ✅ Mobile responsive: Looks good at 400px
- ✅ No console errors
- ✅ Works on demo hardware

**Demo Success Criteria:**
- ✅ Judges input natural language
- ✅ AI gives recommendations (looks impressive)
- ✅ Driver selects station (seamlessly)
- ✅ Vehicle spawns on admin map and drives there
- ✅ System continues working for multiple scenarios

---

## DEPLOYMENT CHECKLIST

Before demo day, verify:
- [ ] `VITE_GEMINI_API_KEY` is set in `consumer-app/.env`
- [ ] `npm run dev` in `consumer-app/` starts on port 5174
- [ ] `npm run dev` in `frontend/` starts on port 5173
- [ ] Both apps run simultaneously without conflicts
- [ ] [🎯 Ask AI] button is visible on RequestChargeScreen
- [ ] Typing a query and hitting Enter works
- [ ] Recommendations appear in <3 seconds
- [ ] [Navigate] button triggers Firebase update
- [ ] Admin dashboard shows `manual_user_999` spawning
- [ ] Vehicle moves toward recommended station in real-time
- [ ] No console errors
- [ ] Mobile viewport (400px) looks good
- [ ] Fallback works if Gemini fails
- [ ] Demo script is memorized and smooth

---

## REMAINING QUESTIONS FOR YOU

Before you start implementation, answer these:

1. **Time Budget:** Do you have 2-3 days, or is this a weekend sprint?
2. **Real Backend:** Will you build `/api/recommend-stations` endpoint later, or stay mock indefinitely?
3. **Voice Input:** Should Web Speech API support be added later?
4. **Multi-turn Conversation:** Should Gemini remember context across queries?
5. **Gamification:** Should we add achievement messages post-charging?
6. **Mobile Testing:** Do you have access to actual mobile device or just browser dev tools?
7. **Gemini Quota:** Is there a usage quota/budget concern, or open-ended API key?
8. **Production Plans:** Is this hackathon-only or will it be a real product?

---

*Generated by AI Planning Agent for Phase 5B: Smart Station Recommendation Engine*
*Last Updated: 2026-04-26*
*Status: READY FOR IMPLEMENTATION*

