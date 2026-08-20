import { NextRequest, NextResponse } from "next/server";
import { HOUSEHOLD_PRODUCTS } from "@/lib/mock-data";

interface ProductItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  nutri_score: string;
  energy: number; // kcal
  sugars: number; // g
  saturated_fat: number; // g
  sodium: number; // mg
  image_url?: string;
}

// Convert all 406 items into searchable items
const LOCAL_CATALOG: ProductItem[] = Object.entries(HOUSEHOLD_PRODUCTS).map(([key, item]: [string, any]) => ({
  id: key,
  name: item.productName,
  brand: item.brand,
  category: item.category || "Food & Produce",
  nutri_score: item.nutriScore,
  energy: item.calories,
  sugars: item.sugars,
  saturated_fat: item.saturatedFat,
  sodium: item.sodium,
  image_url: item.imageUrl,
}));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const category = (searchParams.get("category") || "").trim();

  // If query is empty, return top items from local catalog
  if (!query) {
    let list = LOCAL_CATALOG;
    if (category && category !== "ALL") {
      list = list.filter((p) => p.category === category);
    }
    return NextResponse.json({ products: list.slice(0, 30), total: list.length, hasMore: false });
  }

  // 1. Search local 406 catalog with priority matching (name -> brand -> ingredients -> category)
  const localMatches = LOCAL_CATALOG.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(query);
    const brandMatch = p.brand ? p.brand.toLowerCase().includes(query) : false;
    const catMatch = p.category ? p.category.toLowerCase().includes(query) : false;
    const categoryFilterMatch = !category || category === "ALL" || p.category === category;

    return (nameMatch || brandMatch || catMatch) && categoryFilterMatch;
  });

  // 2. Query Open Food Facts 3.2M Live API in parallel for broader global results
  let apiProducts: ProductItem[] = [];
  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(
      query
    )}&page=${page}&page_size=30&fields=code,product_name,product_name_en,brands,categories,nutriscore_grade,image_front_small_url,image_url,nutriments`;

    const res = await fetch(offUrl, {
      headers: {
        "User-Agent": "NutriVisionWorkbench/1.0 (contact@nutrivision.dev)",
      },
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const data = await res.json();
      const rawProducts = data.products || [];

      apiProducts = rawProducts
        .filter((p: any) => p.product_name || p.product_name_en)
        .map((p: any) => {
          const nutriments = p.nutriments || {};
          const energyKcal = Math.round(
            nutriments["energy-kcal_100g"] ??
              nutriments["energy-kcal"] ??
              (nutriments["energy_100g"] ? Math.round(nutriments["energy_100g"] / 4.184) : 0)
          );

          const rawGrade = p.nutriscore_grade ? p.nutriscore_grade.toUpperCase() : "C";
          const validGrade = ["A", "B", "C", "D", "E"].includes(rawGrade) ? rawGrade : "C";

          return {
            id: p.code,
            name: p.product_name || p.product_name_en || "Food Product",
            brand: p.brands ? p.brands.split(",")[0].trim() : "Open Food Facts",
            category: p.categories ? p.categories.split(",")[0].trim() : "Packaged Food",
            nutri_score: validGrade,
            energy: energyKcal,
            sugars: Math.round((nutriments["sugars_100g"] ?? 0) * 10) / 10,
            saturated_fat: Math.round((nutriments["saturated-fat_100g"] ?? 0) * 10) / 10,
            sodium: Math.round(
              (nutriments["sodium_100g"] ?? (nutriments["salt_100g"] ? nutriments["salt_100g"] / 2.5 : 0)) * 1000
            ),
            image_url: p.image_front_small_url || p.image_url || undefined,
          };
        });
    }
  } catch (error) {
    console.warn("OpenFoodFacts search offline, returning local matches:", error);
  }

  // 3. Combine local catalog matches (top priority) + Open Food Facts API matches, removing duplicates
  const combinedMap = new Map<string, ProductItem>();
  localMatches.forEach((p) => combinedMap.set(p.id, p));
  apiProducts.forEach((p) => {
    if (!combinedMap.has(p.id)) combinedMap.set(p.id, p);
  });

  const finalProducts = Array.from(combinedMap.values());

  return NextResponse.json({
    products: finalProducts.slice(0, 50),
    total: finalProducts.length,
    hasMore: finalProducts.length > 50,
  });
}
