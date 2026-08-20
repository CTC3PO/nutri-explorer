import { NutriVisionAnalysis } from "@/shared/types/nutrivision";
import catalogJson from "@/data/catalog-300.json";

export const HOUSEHOLD_PRODUCTS: Record<string, NutriVisionAnalysis> = catalogJson as unknown as Record<string, NutriVisionAnalysis>;

export const SAMPLE_PRODUCTS = HOUSEHOLD_PRODUCTS;
