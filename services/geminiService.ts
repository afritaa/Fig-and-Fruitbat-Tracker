
import { GoogleGenAI } from "@google/genai";
import { Observation, LocationData, FruitingPrediction, CorrelationHighlight } from "../types";

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
  // Use the API key directly from the environment variable as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let locationString = "Woombye, QLD, Australia";
  if (location) {
    if (location.isManual) {
      locationString = `${location.suburb || ''}, ${location.state || ''}, ${location.postcode || ''}, Australia`.replace(/^, /, '');
    } else if (location.latitude && location.longitude) {
      locationString = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
    }
  }

  const dataSummary = observations
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(o => `Date: ${o.date}, Bats: ${o.bats}%, Figs Dropped: ${o.figsDropped}%, Leaves Dropped: ${o.leavesDropped}%`)
    .join("\n");

  const prompt = `
    You are an expert Australian ecologist and phenologist. Analyze this monitoring data for a fig tree and visiting fruitbats.
    
    Location Context: ${locationString}
    
    Data History:
    ${dataSummary}
    
    TASKS:
    1. Using Google Search, check current and historical weather patterns (specifically Max Temperature and Rainfall) for ${locationString} for the exact dates provided in the Data History.
    2. Identify correlations between weather spikes (heatwaves/rainfall) and the biological events (figs/bats).
    3. PREDICT the next significant fruiting event window.
    
    OUTPUT FORMAT:
    First, provide a detailed Markdown report with headings.
    Second, at the very end of your response, provide a JSON block delimited by [DATA_START] and [DATA_END] with the following structure:
    {
      "prediction": {
        "window": "Month/Season Year",
        "confidence": 0-100,
        "reasoning": "A concise explanation of the forecast",
        "influencers": [
          {
            "label": "Short Title",
            "impact": "positive" | "negative" | "neutral",
            "description": "Short explanation"
          }
        ]
      },
      "weatherMatrix": [
        {"date": "YYYY-MM-DD", "temp": number, "rainfall": number}
      ],
      "correlations": [
        {"startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "type": "positive/negative", "description": "Short label"}
      ]
    }
    
    IMPORTANT: You must provide exactly 3 influencers in the influencers array to fill the UI layout.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || "";
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

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text: cleanText, prediction, sources, weatherData, correlations };
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
