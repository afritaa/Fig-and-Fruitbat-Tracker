
export interface Observation {
  id: string;
  date: string; // ISO format
  bats: number; // 0-100 (Activity)
  figsDropped: number; // 0-100 (Volume of fruit dropped)
  leavesDropped: number; // 0-100 (Volume of leaves dropped)
  temp?: number; // Added: Daily Max Temperature
  rainfall?: number; // Added: Daily Rainfall in mm
}

export interface CorrelationHighlight {
  startDate: string;
  endDate: string;
  type: 'positive' | 'negative';
  description: string;
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  suburb?: string;
  state?: string;
  postcode?: string;
  isManual?: boolean;
}

export interface FruitingPrediction {
  window: string;
  confidence: number;
  reasoning: string;
  influencers: {
    label: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

export interface TrendReport {
  analysis: string;
  prediction?: FruitingPrediction;
  weatherData?: { date: string; temp: number; rainfall: number }[];
  correlations?: CorrelationHighlight[];
  timestamp: string;
}
