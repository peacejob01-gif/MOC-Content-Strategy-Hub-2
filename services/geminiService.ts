import { GoogleGenAI, Type } from "@google/genai";
import { Category, ContentType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface AnalysisResult {
  summary: string;
  contentType: ContentType;
  category: Category;
  isHighlight: boolean;
}

export const analyzeNewsContent = async (
  text: string, 
  currentMonthTheme: string
): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following news text for the Ministry of Commerce (MOC) content strategy.
    
    1. Summarize the content concisely.
    2. Determine the most suitable content format from: 'Video', 'Banner', 'PR Press', or 'Photo Album'.
    3. Categorize it into one of these three pillars: 'Trust & Impact', 'MOC Update', or 'Policy to People'.
    4. Check if the content relates to the current monthly theme: "${currentMonthTheme}". If it matches strictly or loosely, set isHighlight to true.

    News Content:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            contentType: { 
              type: Type.STRING, 
              enum: ['Video', 'Banner', 'PR Press', 'Photo Album'] 
            },
            category: { 
              type: Type.STRING, 
              enum: ['Trust & Impact', 'MOC Update', 'Policy to People'] 
            },
            isHighlight: { type: Type.BOOLEAN }
          },
          required: ["summary", "contentType", "category", "isHighlight"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback in case of error
    return {
      summary: "Error analyzing text. Please review manually.",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }
};