export const __types_workaround = true;

export interface ParsedRequest {
  time_available_minutes: number | null;
  battery_level_percent: number | null;
  preferred_stations: string[];
  avoid_stations: string[];
  constraints: string[];
  confidence: number;
}

export interface StationRecommendation {
  station_id: string;
  name: string;
  location: { lat: number; lng: number };
  eta_minutes: number;
  current_queue: number;
  chargers_available: number;
  chargers_total: number;
  parking_available: number;
  parking_total: number;
  est_charge_at_time_limit: number;
  matches_preference: boolean;
  avoids_constraint: boolean;
  recommendation_score: number;
  explanation?: string;
  rank?: 'BEST' | 'ALTERNATIVE' | 'NOT RECOMMENDED';
}

export interface RecommendationResponse {
  parsed: ParsedRequest;
  recommendations: StationRecommendation[];
  rawData: any;
}
