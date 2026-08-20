import { NutriGrade } from "@/lib/nutri-score";

export type NovaGrade = 1 | 2 | 3 | 4;

export interface BoundingBox {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  box_2d: [number, number, number, number];
  category: "nutrition" | "ingredient" | "header" | "barcode";
}

export interface AdditiveRisk {
  code: string;
  name: string;
  riskLevel: "low" | "moderate" | "high";
  origin: string;
  citation: string;
  safetySummary: string;
}

export interface AllergenStatus {
  id: string;
  name: string;
  detected: boolean;
  icon: string;
  confidence: number;
}

export interface MarketingClaim {
  id: string;
  claim: string;
  verdict: "verified" | "misleading" | "exaggerated";
  reality: string;
  regulatoryStandard: string;
}

export interface IngredientComponent {
  id: string;
  name: string;
  percentage: number;
  color: string;
  origin: string;
  processing: "Raw Whole Food" | "Minimally Processed" | "Processed Culinary" | "Ultra-Processed Additive";
  metabolicImpact: string;
  allergenIcon?: string;
  safetyNote?: string;
}

export interface ProductSwap {
  id: string;
  name: string;
  brand: string;
  nutriScore: NutriGrade;
  novaScore: NovaGrade;
  calories: number;
  sugars: number;
  vectorMatchPercent: number;
  tag: string;
  image?: string;
}

export interface NutriVisionAnalysis {
  productName: string;
  brand: string;
  servingSize?: string;
  calories: number;
  energy: number;
  sugars: number;
  saturatedFat: number;
  sodium: number;
  protein: number;
  fiber: number;
  fruitVegetablesPercentage: number;
  
  // Nutri-Score calculation
  nutriScore: NutriGrade;
  nutriScoreRaw: number;
  
  // NOVA Classification
  novaScore: NovaGrade;
  novaDescription: string;
  
  // Visual Grounding
  boundingBoxes: BoundingBox[];
  
  // Marketing Claims Verification
  claims?: MarketingClaim[];
  
  // Detailed Ingredient Proportions for X-Ray Deconstruction
  deconstructedIngredients?: IngredientComponent[];
  
  // Ingredient & Additive Knowledge Graph
  ingredients: string[];
  additives: AdditiveRisk[];
  allergens: AllergenStatus[];
  
  // Healthier Swaps
  recommendedSwaps: ProductSwap[];
  
  // Metadata
  imageUrl?: string;
  analyzedAt: string;
  modelEngine: string;
}
