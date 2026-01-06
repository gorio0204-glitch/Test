
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async parseReport(text: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following insurance sales report into a structured JSON format. 
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentName: { type: Type.STRING },
                  dealDate: { type: Type.STRING },
                  salesSubChannel: { type: Type.STRING },
                  planName: { type: Type.STRING },
                  pf: { type: Type.BOOLEAN },
                  sumInsured: { type: Type.NUMBER },
                  issuedMonth: { type: Type.STRING },
                  commissionPercentage: { type: Type.NUMBER },
                  commissionAmount: { type: Type.NUMBER },
                  clientName: { type: Type.STRING }
                },
                required: ["agentName", "sumInsured"]
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"deals": []}');
  }
}

export const geminiService = new GeminiService();
