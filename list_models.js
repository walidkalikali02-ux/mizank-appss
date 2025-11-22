import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY });

async function listModels() {
    try {
        const response = await ai.models.list();
        console.log("Available models:");
        // The response structure might vary, let's print it all or iterate if it's an array
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
