import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse, Language } from "../types";

// Validate API Key
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey || apiKey.trim() === "") {
  console.error("❌ VITE_API_KEY is not configured. Please add it to your .env file.");
}

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey });

// Models to try in order
const MODEL_NAMES = ["gemini-2.5-flash", "gemini-1.5-flash"];

/**
 * Detects MIME type from base64 data string
 */
function detectMimeType(base64String: string): string {
  // Check if it has a data URI prefix
  if (base64String.includes(',')) {
    const prefix = base64String.split(',')[0].toLowerCase();
    if (prefix.includes('image/png')) return 'image/png';
    if (prefix.includes('image/jpeg') || prefix.includes('image/jpg')) return 'image/jpeg';
    if (prefix.includes('image/webp')) return 'image/webp';
    if (prefix.includes('image/gif')) return 'image/gif';
  }
  
  // Check base64 magic bytes
  const base64Data = base64String.split(',')[1] || base64String;
  if (base64Data.length > 0) {
    const header = base64Data.substring(0, 8);
    // PNG: /iVBORw0KGgo=
    if (header === '/iVBORw0') return 'image/png';
    // JPEG: /9j/4AAQSkZJRgABA
    if (header === '/9j/4AAQ') return 'image/jpeg';
    // WebP: UklGRiY=
    if (header.startsWith('UklGRi')) return 'image/webp';
    // GIF: R0lGODlh
    if (header.startsWith('R0lGODlh')) return 'image/gif';
  }
  
  // Default to JPEG
  return 'image/jpeg';
}

/**
 * Analyzes text and optional image to estimate nutritional info.
 */
export const analyzeFoodEntry = async (
  description: string,
  imageBase64: string | undefined,
  language: Language
): Promise<AIAnalysisResponse> => {
  
  // Validate inputs
  if (!description?.trim() && !imageBase64) {
    throw new Error("Please provide an image or a description.");
  }

  // Validate API Key
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API key not configured. Please check your .env file.");
  }
  
  // Define the schema for structured JSON output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      foodItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the food item" },
            portion: { type: Type.STRING, description: "Estimated portion size (e.g., '1 cup', '100g')" },
            calories: { type: Type.NUMBER, description: "Calories in kcal" },
            protein: { type: Type.NUMBER, description: "Protein in grams" },
            carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
            fat: { type: Type.NUMBER, description: "Fat in grams" },
          },
          required: ["name", "portion", "calories", "protein", "carbs", "fat"],
        },
      },
      summary: {
        type: Type.STRING,
        description: "A brief, friendly summary of the meal's nutritional value and healthiness.",
      },
    },
    required: ["foodItems", "summary"],
  };

  const parts: any[] = [];

  // Add image if available
  if (imageBase64) {
    try {
      // Remove header if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      const mimeType = detectMimeType(imageBase64);
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
      console.log(`📸 Image detected: ${mimeType}`);
    } catch (err) {
      console.error("Error processing image:", err);
      throw new Error("Failed to process image. Please try a different photo.");
    }
  }

  // Add text prompt
  let promptText = `Analyze the food in this image/description. Estimate the calories and macronutrients as accurately as possible.
IMPORTANT:
1. Return the response in JSON format strictly matching the schema.
2. The 'foodItems.name' and 'summary' fields MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
3. The JSON keys (like 'foodItems', 'calories', 'protein') must remain in English.
4. Be conservative with estimates if portion size is unclear.`;

  if (description?.trim()) {
    promptText += `\nUser description: "${description}"`;
  }

  parts.push({ text: promptText });

  // Try models in order
  let lastError: any = null;
  
  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an expert nutritionist. Analyze the input to provide accurate nutritional data. Be conservative with calorie estimates if portion size is unclear. Ensure output text is in the requested language.",
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error(`No response from ${modelName}`);
      }

      console.log(`✅ Success with ${modelName}`);
      return JSON.parse(text) as AIAnalysisResponse;
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ ${modelName} failed:`, error.message);
      
      // If it's an auth error, don't retry
      if (error.message?.includes('UNAUTHENTICATED') || 
          error.message?.includes('invalid') ||
          error.message?.includes('API key')) {
        throw new Error("API key is invalid or not configured properly. Please check your .env file.");
      }
    }
  }

  // If we get here, all models failed
  console.error("❌ All models failed:", lastError);
  
  if (lastError?.message?.includes('permission')) {
    throw new Error("API doesn't have permission to access this model. Check your API key permissions.");
  }
  
  if (lastError?.message?.includes('overloaded') || lastError?.message?.includes('quota')) {
    throw new Error("AI service is temporarily overloaded. Please try again in a moment.");
  }

  throw new Error("Failed to analyze food. Please check your API key and try again.");
};