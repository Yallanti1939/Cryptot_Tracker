import { GoogleGenAI, Type } from "@google/genai";
import { Coin } from '../types';

export const getMarketAnalysis = async (coin: Coin): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "AI Analysis unavailable: Gemini API Key is missing. Check environment configuration.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const startPrice = coin.sparkline[0];
    const endPrice = coin.sparkline[coin.sparkline.length - 1];
    const trend = endPrice > startPrice ? 'Upward' : 'Downward';

    const prompt = `
      Act as a senior cryptocurrency market analyst.
      Analyze the following real-time data for ${coin.name} (${coin.symbol.toUpperCase()}):
      
      - Current Price: $${coin.current_price}
      - 24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%
      - 7-Day Trend Direction: ${trend}
      - Market Cap: $${coin.market_cap.toLocaleString()}
      
      Provide a sophisticated, concise 3-sentence market summary:
      1. First sentence: Assess the current market sentiment (Bullish/Bearish/Neutral) based on the 24h change and 7-day trend.
      2. Second sentence: Highlight a key technical observation or momentum indicator implied by the data.
      3. Third sentence: Provide a brief outlook or key price level to watch.
      
      Do not use markdown formatting like bold or headers. Keep it conversational but professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights generated. Try again.";
  } catch (error) {
    console.error("Gemini Market Analysis Error:", error);
    return `AI Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export interface PredictionData {
  sentiment: string;
  confidence: number;
  predictionRange: string;
  reasoning: string;
}

export const getPricePrediction = async (coin: Coin): Promise<PredictionData | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      As a quantitative crypto analyst, predict the next 24-hour price movement for ${coin.name} (${coin.symbol.toUpperCase()}).
      Current Data:
      - Price: $${coin.current_price}
      - 24h Volume: $${(coin.market_cap * 0.05).toLocaleString()}
      - Recent Trend: ${coin.price_change_percentage_24h > 0 ? 'Positive' : 'Negative'} momentum.
      
      Based on this metadata and market patterns, provide a structured prediction in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { 
              type: Type.STRING, 
              description: "Short sentiment label: Bullish, Bearish, or Neutral" 
            },
            confidence: { 
              type: Type.NUMBER, 
              description: "Confidence percentage (0-100)" 
            },
            predictionRange: { 
              type: Type.STRING, 
              description: "A predicted price range for the next 24 hours (e.g. '$63,500 - $65,200')" 
            },
            reasoning: { 
              type: Type.STRING, 
              description: "A concise, single-sentence explanation for the prediction" 
            }
          },
          required: ["sentiment", "confidence", "predictionRange", "reasoning"],
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim()) as PredictionData;
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return null;
  }
};