import { NextRequest, NextResponse } from "next/server";

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  nutriscore_grade?: string;
  image_front_small_url?: string;
  image_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
    "energy_100g"?: number;
    "sugars_100g"?: number;
    "saturated-fat_100g"?: number;
    "sodium_100g"?: number;
    "salt_100g"?: number;
    "proteins_100g"?: number;
    "fiber_100g"?: number;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  if (!query.trim()) {
    return NextResponse.json({ products: [], hasMore: false });
  }

  try {
    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=20&page=${page}&fields=code,product_name,product_name_en,brands,categories,nutriscore_grade,image_front_small_url,image_url,nutriments`;

    const res = await fetch(offUrl, {
      headers: {
        "User-Agent": "NutriGlobalExplorer - WebApp - Version 1.0",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`OpenFoodFacts HTTP error ${res.status}`);
    }

    const data = await res.json();
    const rawProducts: OpenFoodFactsProduct[] = data.products || [];

    const products = rawProducts
      .filter((p) => (p.product_name || p.product_name_en) && p.nutriscore_grade)
      .map((p) => {
        const nutriments = p.nutriments || {};
        const energyKcal = Math.round(
          nutriments["energy-kcal_100g"] ??
            nutriments["energy-kcal"] ??
            (nutriments["energy_100g"] ? Math.round(nutriments["energy_100g"] / 4.184) : 0)
        );

        const grade = (p.nutriscore_grade || "c").toUpperCase();

        return {
          id: p.code,
          name: p.product_name || p.product_name_en || "Unknown Product",
          brand: p.brands ? p.brands.split(",")[0].trim() : undefined,
          category: p.categories ? p.categories.split(",")[0].trim() : undefined,
          nutri_score: grade,
          energy: energyKcal,
          sugars: Math.round((nutriments["sugars_100g"] ?? 0) * 10) / 10,
          saturated_fat: Math.round((nutriments["saturated-fat_100g"] ?? 0) * 10) / 10,
          sodium: Math.round(
            (nutriments["sodium_100g"] ?? (nutriments["salt_100g"] ? nutriments["salt_100g"] / 2.5 : 0)) * 1000
          ), // mg
          image_url: p.image_front_small_url || p.image_url || null,
        };
      });

    return NextResponse.json({
      products,
      hasMore: products.length >= 20,
      total: data.count || products.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to search products";
    return NextResponse.json({ error: msg, products: [], hasMore: false }, { status: 500 });
  }
}
