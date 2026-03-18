import { GoogleGenAI } from "@google/genai";
import { IntelResult } from "../types";

// Initialize Gemini Client
// Note: In a production environment, this would likely be proxied through a backend
// to protect the API key, or the user enters their own key in the UI.
const getClient = (apiKey: string) => {
    return new GoogleGenAI({ apiKey });
};

export const analyzeIntelWithGemini = async (
  intel: IntelResult,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in Settings.");
  }

  const ai = getClient(apiKey);

  const prompt = `
    Act as a Senior Cyber Intelligence Analyst. 
    Review the following OSINT data point and provide a concise threat assessment.
    
    Data Type: ${intel.type}
    Query: ${intel.query}
    Raw Data: ${JSON.stringify(intel.data)}
    
    Please provide:
    1. A brief summary of the findings.
    2. A risk assessment (Low/Medium/High) with justification.
    3. Recommended next steps for investigation.
    
    Format the response in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate analysis. Please check your API Key and try again.");
  }
};

export const generateDashboardSummary = async (
    history: IntelResult[],
    apiKey: string
): Promise<string> => {
    if (!apiKey) return "API Key required for AI Summary.";
    if (history.length === 0) return "No data available for analysis.";

    const ai = getClient(apiKey);
    
    // Limit history to last 10 items to save tokens
    const recentHistory = history.slice(0, 10).map(h => ({ type: h.type, query: h.query, risk: h.riskScore }));
    
    const prompt = `
      Analyze the recent search history of this OSINT session.
      History: ${JSON.stringify(recentHistory)}
      
      Provide a 2-sentence executive summary of the current threat landscape based on these queries.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Summary unavailable.";
    } catch (e) {
        return "Could not generate summary.";
    }
}
