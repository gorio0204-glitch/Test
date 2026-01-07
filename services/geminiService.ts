
import { GoogleGenAI, Type } from "@google/genai";

declare var process: {
  env: {
    API_KEY: string;
  }
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async parseReport(text: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract insurance deal information from the following text into JSON. 
      Pay special attention to the "Sales" field (e.g., Sales: HSV Miki) and the "Issued month" (e.g., Jan, Feb...).
      
      Text format example to parse:
      *2026-1-6*
      *Joanna*
      Deal Date: 2026/1/6
      Sales：HSV Miki
      Plan: CL 晉裕
      PF: No
      Sum Insured: HKD100,000
      Issued month: Jan
      
      Input text: "${text}"`,
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
                  agentName: { type: Type.STRING, description: "The agent name like Joanna" },
                  dealDate: { type: Type.STRING, description: "YYYY/MM/DD format" },
                  salesSubChannel: { type: Type.STRING, description: "The value following 'Sales：'" },
                  planName: { type: Type.STRING, description: "The insurance plan name" },
                  pf: { type: Type.BOOLEAN, description: "True if PF is Yes" },
                  sumInsured: { type: Type.NUMBER, description: "The numeric value of Sum Insured" },
                  issuedMonth: { type: Type.STRING, description: "The month name like Jan, Feb..." },
                  expectedDrawdownMonth: { type: Type.STRING, description: "The month name for expected drawdown" },
                  commissionPercentage: { type: Type.NUMBER },
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
