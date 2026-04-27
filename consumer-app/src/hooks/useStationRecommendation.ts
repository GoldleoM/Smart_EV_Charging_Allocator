import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PARSE_PROMPT, EXPLAIN_PROMPT } from '../lib/aiPrompts';
import type { ParsedRequest, RecommendationResponse, StationRecommendation } from '../types/recommendations';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });

export function useStationRecommendation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (userInput: string): Promise<RecommendationResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("Missing VITE_GEMINI_API_KEY in .env");
      }

      // Step 1: Parse Input
      const parsedReq = await parseUserRequest(userInput);
      if (!parsedReq) throw new Error("Could not parse request.");

      // Step 2: Query Backend (Mocked here with live Firebase data)
      const stationsData = await mockBackendQuery(parsedReq);

      // Step 3: Format Explanations
      const finalRecommendations = await formatRecommendations(stationsData, parsedReq);

      setIsLoading(false);
      return {
        parsed: parsedReq,
        recommendations: finalRecommendations,
        rawData: stationsData
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
      setIsLoading(false);
      return null;
    }
  };

  const parseUserRequest = async (userInput: string): Promise<ParsedRequest | null> => {
    const prompt = PARSE_PROMPT.replace('{userInput}', userInput);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanJson);
    } catch (e) {
      // Fallback: Use brace counting to find a valid JSON object
      let braceCount = 0;
      let startIndex = -1;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
          if (braceCount === 0) startIndex = i;
          braceCount++;
        } else if (text[i] === '}') {
          braceCount--;
          if (braceCount === 0 && startIndex !== -1) {
            try {
              const jsonStr = text.substring(startIndex, i + 1);
              return JSON.parse(jsonStr);
            } catch (err) {
              startIndex = -1; // Keep searching if invalid
            }
          }
        }
      }

      console.error("JSON Parse Error: Could not find valid JSON object. Text:", text);
      return null;
    }
  };

  const mockBackendQuery = async (parsed: ParsedRequest): Promise<StationRecommendation[]> => {
    const snapshot = await get(ref(db, '/stations'));
    const stations = snapshot.val() || {};

    // Base lat/lng for manual_user_999
    const vehicleLat = 40.7128 + (Math.random() - 0.5) * 0.04;
    const vehicleLng = -74.0060 + (Math.random() - 0.5) * 0.04;

    const results: StationRecommendation[] = [];

    for (const [id, st] of Object.entries<any>(stations)) {
      const latDiff = st.location.lat - vehicleLat;
      const lngDiff = st.location.lng - vehicleLng;
      const distanceDegrees = Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lngDiff, 2));
      let etaMinutes = Math.round(distanceDegrees * 222);
      if (etaMinutes < 2) etaMinutes = 2;

      const timeAvailable = parsed.time_available_minutes || 30; // default 30
      const currentBattery = parsed.battery_level_percent || 15; // default 15

      const chargingRate = 0.5; // % per minute
      const actualChargingTime = Math.max(0, timeAvailable - etaMinutes - ((st.queueLength || 0) * 10)); // simple wait time
      const projectedCharge = Math.min(100, currentBattery + (actualChargingTime * chargingRate));

      const matches_preference = parsed.preferred_stations.includes(st.name);
      const avoids_constraint = parsed.avoid_stations.includes(st.name);

      let score = 50;
      if (matches_preference) score += 30;
      if (avoids_constraint) score -= 50;

      // Score based on availability & distance
      score += (st.availableChargers > 0 ? 20 : 0);
      score -= etaMinutes;
      score -= (st.queueLength || 0) * 5;

      results.push({
        station_id: id,
        name: st.name,
        location: st.location,
        eta_minutes: etaMinutes,
        current_queue: st.queueLength || 0,
        chargers_available: st.availableChargers,
        chargers_total: st.totalChargers,
        parking_available: st.availableParking,
        parking_total: st.totalParking,
        est_charge_at_time_limit: Math.round(projectedCharge),
        matches_preference,
        avoids_constraint,
        recommendation_score: score
      });
    }

    // Sort by score descending
    results.sort((a, b) => b.recommendation_score - a.recommendation_score);

    if (results.length > 0) results[0].rank = 'BEST';
    if (results.length > 1) results[1].rank = 'ALTERNATIVE';
    if (results.length > 2) results[2].rank = 'NOT RECOMMENDED';

    return results;
  };

  const formatRecommendations = async (stations: StationRecommendation[], parsed: ParsedRequest): Promise<StationRecommendation[]> => {
    // Generate explanation for each in parallel
    const promises = stations.map(async (st) => {
      let prompt = EXPLAIN_PROMPT
        .replace(/{timeAvailable}/g, (parsed.time_available_minutes || 30).toString())
        .replace('{batteryLevel}', (parsed.battery_level_percent || 15).toString())
        .replace('{preferences}', parsed.preferred_stations.join(', ') || 'None')
        .replace('{constraints}', parsed.constraints.join(', ') || 'None')
        .replace('{stationName}', st.name)
        .replace('{eta}', st.eta_minutes.toString())
        .replace('{queuePos}', st.current_queue.toString())
        .replace('{chargersAvailable}', st.chargers_available.toString())
        .replace('{chargerTotal}', st.chargers_total.toString())
        .replace('{projectedCharge}', st.est_charge_at_time_limit.toString());

      try {
        const res = await model.generateContent(prompt);
        st.explanation = res.response.text().trim();
      } catch (e) {
        st.explanation = "Good option based on your current constraints.";
      }
      return st;
    });

    return Promise.all(promises);
  };

  return {
    getRecommendations,
    isLoading,
    error
  };
}
