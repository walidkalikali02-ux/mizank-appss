import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse, Language } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Analyzes text and optional image to estimate nutritional info.
 */
export const analyzeFoodEntry = async (
  description: string,
  imageBase64: string | undefined,
  language: Language
): Promise<AIAnalysisResponse> => {
  
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
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg", // Assuming JPEG for simplicity, though API handles others
        data: base64Data,
      },
    });
  }

  // Add text prompt
  let promptText = `Analyze the food in this image/description. Estimate the calories and macronutrients as accurately as possible.
  IMPORTANT:
  1. Return the response in JSON format strictly matching the schema.
  2. The 'foodItems.name' and 'summary' fields MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.
  3. The JSON keys (like 'foodItems', 'calories', 'protein') must remain in English.`;

  if (description) {
    promptText += `\nUser description: "${description}"`;
  }
  if (!description && !imageBase64) {
    throw new Error("Please provide an image or a description.");
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert nutritionist. Analyze the input to provide accurate nutritional data. Be conservative with calorie estimates if portion size is unclear. Ensure output text is in the requested language.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as AIAnalysisResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze food. Please try again.");
  }
};