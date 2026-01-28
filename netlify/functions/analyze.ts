
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    const { observations, location } = JSON.parse(event.body || "{}");
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("CRITICAL: API_KEY environment variable is missing in Netlify.");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "Server configuration error: The Gemini API Key is missing. Please add API_KEY to your Netlify Environment Variables." 
        }),
      };
    }

    if (!observations || !Array.isArray(observations) || observations.length < 3) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Insufficient data. Need at least 3 observations." }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let locationString = "Woombye, QLD, Australia";
    if (location) {
      if (location.isManual) {
        locationString = `${location.suburb || ''}, ${location.state || ''}, ${location.postcode || ''}, Australia`.replace(/^, /, '');
      } else if (location.latitude && location.longitude) {
        locationString = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
      }
    }

    const dataSummary = observations
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((o: any) => `Date: ${o.date}, Bats: ${o.bats}%, Figs Dropped: ${o.figsDropped}%, Leaves Dropped: ${o.leavesDropped}%`)
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
      
      IMPORTANT: You must provide exactly 3 influencers in the influencers array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      }),
    };
  } catch (error: any) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Internal server error during analysis." }),
    };
  }
};
