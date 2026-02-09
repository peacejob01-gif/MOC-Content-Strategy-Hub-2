import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Category, ContentType } from "../types";

// ใช้ import.meta.env สำหรับ Vite (เพื่อให้รันบน Vercel ได้)
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
    return {
      summary: "กรุณาตั้งค่า API Key ใน Vercel (VITE_GEMINI_API_KEY)",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }

  // ใช้รุ่น 1.5 Flash ที่เสถียรที่สุด
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
    - Summarize in Thai.
    - Match with theme: "${currentMonthTheme}".
    
    Content: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text()) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "เกิดข้อผิดพลาดในการวิเคราะห์ โปรดตรวจสอบข้อมูลด้วยตนเอง",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }
};
