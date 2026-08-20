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

// Convert all local items into searchable items
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

  // 1. Search local catalog with priority matching (name -> brand -> ingredients -> category)
  const localMatches = LOCAL_CATALOG.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(query);
    const brandMatch = p.brand ? p.brand.toLowerCase().includes(query) : false;
    const catMatch = p.category ? p.category.toLowerCase().includes(query) : false;
    const categoryFilterMatch = !category || category === "ALL" || p.category === category;

    return (nameMatch || brandMatch || catMatch) && categoryFilterMatch;
  });

  // 2. Multi-Strategy Live Open Food Facts 3.2M Search
  let apiProducts: ProductItem[] = [];
  const normalizedTag = query.replace(/\s+/g, "-");

  const searchUrls: string[] = [];

  // Strategy A: Brand Tag Search (e.g. pepsi, coca-cola, lays, doritos, snickers, oreo)
  searchUrls.push(
    `https://world.openfoodfacts.net/api/v2/search?brands_tags=${encodeURIComponent(
      normalizedTag
    )}&page=${page}&page_size=20&fields=code,product_name,product_name_en,brands,categories,nutriscore_grade,image_front_small_url,image_url,nutriments`
  );

  // Strategy B: Category Tag Search (e.g. sodas, cereals, yogurts, cheeses, chips, cookies)
  searchUrls.push(
    `https://world.openfoodfacts.net/api/v2/search?categories_tags=${encodeURIComponent(
      normalizedTag
    )}&page=${page}&page_size=20&fields=code,product_name,product_name_en,brands,categories,nutriscore_grade,image_front_small_url,image_url,nutriments`
  );

  // Strategy C: Barcode direct lookup if numeric
  if (/^\d{6,14}$/.test(query)) {
    searchUrls.unshift(
      `https://world.openfoodfacts.net/api/v2/product/${encodeURIComponent(query)}.json`
    );
  }

  try {
    const responses = await Promise.allSettled(
      searchUrls.map((url) =>
        fetch(url, {
          headers: {
            "User-Agent": "NutriVisionWorkbench/2.0 (contact@nutrivision.dev)",
            Accept: "application/json",
          },
          next: { revalidate: 1800 },
        }).then((res) => (res.ok ? res.json() : null))
      )
    );

    const rawList: any[] = [];
    for (const res of responses) {
      if (res.status === "fulfilled" && res.value) {
        const val = res.value;
        if (val.product) {
          rawList.push(val.product);
        } else if (Array.isArray(val.products)) {
          rawList.push(...val.products);
        }
      }
    }

    apiProducts = rawList
      .filter((p: any) => p && (p.product_name || p.product_name_en) && p.code)
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
  } catch (error) {
    console.warn("Open Food Facts search error:", error);
  }

  // 3. Combine local catalog matches (top priority) + Open Food Facts API matches, removing duplicates
  const combinedMap = new Map<string, ProductItem>();
  localMatches.forEach((p) => combinedMap.set(p.id, p));
  apiProducts.forEach((p) => {
    if (!combinedMap.has(p.id)) combinedMap.set(p.id, p);
  });

  const finalProducts = Array.from(combinedMap.values());

  return NextResponse.json({
    products: finalProducts.slice(0, 40),
    total: finalProducts.length,
    hasMore: finalProducts.length > 40,
  });
}
