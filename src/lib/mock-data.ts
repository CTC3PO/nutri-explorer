import { NutriVisionAnalysis } from "@/shared/types/nutrivision";
import countryCatalogJson from "@/data/country-catalog.json";
import countryIntelJson from "@/data/country-intelligence.json";

export interface CountryIntelligence {
  country: string;
  code: string;
  flag: string;
  totalProducts: number;
  gdpPerCapita: number;
  obesityPrevalence: number;
  giniIndex: number;
  nutriQualityIndex: number;
  adoptionScore: number;
  adoptionCategory: string;
  avgEnergy: number;
  avgFat: number;
  avgSalt: number;
  avgAdditives: number;
  insights: string;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
}

export const COUNTRY_CATALOG: Record<string, NutriVisionAnalysis> = countryCatalogJson as unknown as Record<string, NutriVisionAnalysis>;

export const COUNTRY_INTELLIGENCE: CountryIntelligence[] = countryIntelJson as unknown as CountryIntelligence[];

export const HOUSEHOLD_PRODUCTS: Record<string, NutriVisionAnalysis> = COUNTRY_CATALOG;

export const SAMPLE_PRODUCTS = COUNTRY_CATALOG;
