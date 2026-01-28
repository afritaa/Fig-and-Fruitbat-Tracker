
import { Observation, LocationData, FruitingPrediction, CorrelationHighlight } from "../types.ts";

export const analyzeTrends = async (
  observations: Observation[],
  location: LocationData | null
): Promise<{ 
  text: string; 
  prediction: FruitingPrediction | null; 
  sources: any[];
  weatherData?: { date: string; temp: number; rainfall: number }[];
  correlations?: CorrelationHighlight[];
}> => {
  try {
    const response = await fetch("/.netlify/functions/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observations, location }),
    });

    // Check content type before parsing as JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Server returned non-JSON response:", text);
      throw new Error(`Server Error: Received HTML instead of JSON. Ensure the Netlify function is deployed and API_KEY is set.`);
    }

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to fetch analysis from server.");
    }

    const data = await response.json();
    const fullText = data.text || "";
    
    let cleanText = fullText;
    let prediction: FruitingPrediction | null = null;
    let weatherData: { date: string; temp: number; rainfall: number }[] = [];
    let correlations: CorrelationHighlight[] = [];

    const startMarker = "[DATA_START]";
    const endMarker = "[DATA_END]";
    
    if (fullText.includes(startMarker) && fullText.includes(endMarker)) {
      const jsonPart = fullText.split(startMarker)[1].split(endMarker)[0].trim();
      try {
        const parsed = JSON.parse(jsonPart);
        prediction = parsed.prediction;
        weatherData = parsed.weatherMatrix || [];
        correlations = parsed.correlations || [];
        cleanText = fullText.split(startMarker)[0].trim();
      } catch (e) {
        console.error("Failed to parse AI data JSON", e);
      }
    }

    const sources = data.groundingMetadata?.groundingChunks || [];

    return { text: cleanText, prediction, sources, weatherData, correlations };
  } catch (error: any) {
    console.error("Service Analysis Error:", error);
    throw error;
  }
};
