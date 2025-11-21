export type Language = 'ar' | 'en';

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  name: string;
  portion: string;
  macros: MacroNutrients;
}

export interface MealLog {
  id: string;
  timestamp: number;
  imageUrl?: string; // Base64 or URL
  description: string;
  items: FoodItem[];
  totalMacros: MacroNutrients;
  summary: string; // AI provided summary
}

export interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AIAnalysisResponse {
  foodItems: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  summary: string;
}