export const PARSE_PROMPT = `
You are a smart EV charging assistant. Parse the driver's input.

User Input: "{userInput}"

Extract this JSON (respond ONLY with valid JSON, no explanation, no markdown formatting like \`\`\`json):
{
  "time_available_minutes": <number or null>,
  "battery_level_percent": <number or null>,
  "preferred_stations": [<exact station names if mentioned>],
  "avoid_stations": [<station names to avoid>],
  "constraints": [<urgency, comfort, amenities, etc>],
  "confidence": <0.0 to 1.0>
}

RULES:
1. If time not explicitly mentioned, set to null
2. If battery not mentioned, set to null UNLESS urgency implies it
3. Station names: Match EXACTLY to: "Downtown Hub", "Midtown Fast-Charge", "Uptown Plaza"
4. Always respond with valid JSON only
5. If uncertain about a field, set to null

Examples:
Input: "I have 20 mins, battery at 15%"
Output: {"time_available_minutes": 20, "battery_level_percent": 15, "preferred_stations": [], "avoid_stations": [], "constraints": ["urgent"], "confidence": 0.95}

Input: "Just need a quick charge, prefer Downtown"
Output: {"time_available_minutes": null, "battery_level_percent": null, "preferred_stations": ["Downtown Hub"], "avoid_stations": [], "constraints": ["quick"], "confidence": 0.8}
`;

export const EXPLAIN_PROMPT = `
Generate a SHORT, friendly explanation for this charging recommendation.

Driver's Needs:
- Time: {timeAvailable} minutes
- Battery: {batteryLevel}%
- Preferences: {preferences}
- Constraints: {constraints}

Recommended Station: {stationName}
- Distance: {eta} minutes away
- Queue Position: {queuePos}
- Available Chargers: {chargersAvailable} / {chargerTotal}
- Estimated Charge: {projectedCharge}% in {timeAvailable} minutes

Write 1-2 sentences explaining why this is their best option. Be specific about benefits.
Include numbers. Be encouraging but honest. Do not use markdown or quotes.

Examples:
"Midtown is your best bet! Only 7 minutes away with just 1 car ahead - you'll hit 85% in your timeframe."
"Downtown takes longer but that short queue means you'll actually get the most charging time."
`;

export const FALLBACK_PROMPT = `
A driver has impossible or difficult constraints.

Constraints: {constraints}
Time Available: {time} minutes
Battery Level: {battery}%

Generate a SHORT, honest, empathetic message explaining their situation and 
suggesting the "least bad" option. Keep it 1-2 sentences. Do not use markdown or quotes.

Example:
"Honestly, you're cutting it close - all stations have 20+ min queues right now. 
Uptown is your least bad option (closest), but expect a wait."
`;
