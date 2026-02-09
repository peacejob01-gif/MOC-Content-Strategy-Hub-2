import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Category, ContentType } from "../types";

// ใช้ import.meta.env สำหรับ Vite (มาตรฐาน Vercel)
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
  // ป้องกันแอปพังหากยังไม่ได้ตั้งค่า API Key
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing!");
    return {
      summary: "กรุณาตั้งค่า API Key ใน Environment Variables ของ Vercel",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }

  // ใช้โมเดล gemini-1.5-flash (เสถียรและประมวลผล JSON ได้แม่นยำ)
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
    
    1. Summarize the content concisely in Thai language.
    2. Determine the most suitable content format from: 'Video', 'Banner', 'PR Press', or 'Photo Album'.
    3. Categorize it into one of these three pillars: 'Trust & Impact', 'MOC Update', or 'Policy to People'.
    4. Check if the content relates to the current monthly theme: "${currentMonthTheme}". If it matches strictly or loosely, set isHighlight to true.

    News Content:
    "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text();
    return JSON.parse(jsonStr) as AnalysisResult;

  } catch (error) {
    console.error("❌ Error calling Gemini API:", error);
    // Fallback เมื่อเกิด Error เพื่อให้ระบบยังทำงานต่อได้
    return {
      summary: "เกิดข้อผิดพลาดในการวิเคราะห์เนื้อหา โปรดตรวจสอบข้อมูลด้วยตนเอง",
      contentType: "PR Press",
      category: "MOC Update",
      isHighlight: false
    };
  }
};
