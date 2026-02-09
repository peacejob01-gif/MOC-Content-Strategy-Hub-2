import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Category, ContentType } from "../types";

// ใน Vite ต้องใช้ import.meta.env แทน process.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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
    // ปรับให้ Return ค่า Default แทนการ Throw Error เพื่อไม่ให้หน้าเว็บขาว (Crash)
    console.warn("Missing VITE_GEMINI_API_KEY");
    return {
      summary: "กรุณาตั้งค่า API Key เพื่อใช้งานระบบวิเคราะห์",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }

  // ใช้โมเดล gemini-1.5-flash (เร็วและเสถียรกว่า)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          contentType: { 
            type: SchemaType.STRING, 
            enum: ['Video', 'Banner', 'PR Press', 'Photo Album'] 
          },
          category: { 
            type: SchemaType.STRING, 
            enum: ['Trust & Impact', 'MOC Update', 'Policy to People'] 
          },
          isHighlight: { type: SchemaType.BOOLEAN }
        },
        required: ["summary", "contentType", "category", "isHighlight"]
      }
    }
  });

  const prompt = `
    Analyze the following news text for the Ministry of Commerce (MOC) content strategy.
    1. Summarize the content concisely in Thai.
    2. Determine format: 'Video', 'Banner', 'PR Press', or 'Photo Album'.
    3. Categorize: 'Trust & Impact', 'MOC Update', or 'Policy to People'.
    4. Set isHighlight to true if it matches theme: "${currentMonthTheme}".

    News Content:
    "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text()) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "ไม่สามารถวิเคราะห์ข้อมูลได้ โปรดลองอีกครั้ง",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }
};
