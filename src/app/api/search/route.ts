import { NextRequest, NextResponse } from "next/server";

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

// Curated database of famous products for high availability & instant response
const CURATED_PRODUCTS: ProductItem[] = [
  {
    id: "7622210449283",
    name: "Oreo Original Sandwich Biscuits",
    brand: "Mondelez / Nabisco",
    category: "Biscuits & Snacks",
    nutri_score: "E",
    energy: 474,
    sugars: 38,
    saturated_fat: 7.6,
    sodium: 400,
    image_url: "https://images.openfoodfacts.org/images/products/762/221/044/9283/front_fr.4.200.jpg",
  },
  {
    id: "7622210449284",
    name: "Oreo Double Stuf",
    brand: "Nabisco",
    category: "Biscuits & Snacks",
    nutri_score: "E",
    energy: 500,
    sugars: 42,
    saturated_fat: 9.0,
    sodium: 420,
    image_url: "https://images.openfoodfacts.org/images/products/004/400/003/2425/front_en.12.200.jpg",
  },
  {
    id: "3017620422003",
    name: "Nutella Hazelnut Spread",
    brand: "Ferrero",
    category: "Spreads",
    nutri_score: "E",
    energy: 539,
    sugars: 56.3,
    saturated_fat: 10.6,
    sodium: 42,
    image_url: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.327.200.jpg",
  },
  {
    id: "7613035123456",
    name: "KitKat Milk Chocolate Bar",
    brand: "Nestlé",
    category: "Chocolates",
    nutri_score: "E",
    energy: 518,
    sugars: 49.6,
    saturated_fat: 18.4,
    sodium: 90,
    image_url: "https://images.openfoodfacts.org/images/products/500/015/946/1122/front_en.39.200.jpg",
  },
  {
    id: "5449000000996",
    name: "Coca-Cola Original Taste",
    brand: "The Coca-Cola Company",
    category: "Beverages",
    nutri_score: "E",
    energy: 42,
    sugars: 10.6,
    saturated_fat: 0,
    sodium: 10,
    image_url: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.618.200.jpg",
  },
  {
    id: "7350059530018",
    name: "Oat Milk Unsweetened (Barista Edition)",
    brand: "Oatly",
    category: "Plant-based Beverages",
    nutri_score: "B",
    energy: 59,
    sugars: 3.4,
    saturated_fat: 0.3,
    sodium: 40,
    image_url: "https://images.openfoodfacts.org/images/products/735/005/953/0018/front_en.43.200.jpg",
  },
  {
    id: "0016000275263",
    name: "Honey Nut Cheerios",
    brand: "General Mills",
    category: "Breakfast Cereals",
    nutri_score: "C",
    energy: 378,
    sugars: 30.5,
    saturated_fat: 0.8,
    sodium: 540,
    image_url: "https://images.openfoodfacts.org/images/products/001/600/027/5263/front_en.24.200.jpg",
  },
  {
    id: "5000159461122",
    name: "Snickers Chocolate Bar",
    brand: "Mars",
    category: "Snacks",
    nutri_score: "E",
    energy: 483,
    sugars: 50.5,
    saturated_fat: 9.3,
    sodium: 220,
    image_url: "https://images.openfoodfacts.org/images/products/500/015/946/1122/front_en.39.200.jpg",
  },
  {
    id: "3228857000166",
    name: "Organic Greek Yogurt 0% Fat",
    brand: "Chobani",
    category: "Dairy & Yogurt",
    nutri_score: "A",
    energy: 57,
    sugars: 3.6,
    saturated_fat: 0.1,
    sodium: 35,
    image_url: "https://images.openfoodfacts.org/images/products/085/609/700/0088/front_en.11.200.jpg",
  },
  {
    id: "0000000000001",
    name: "Fresh Organic Broccoli",
    brand: "Nature Fresh",
    category: "Vegetables",
    nutri_score: "A",
    energy: 34,
    sugars: 1.7,
    saturated_fat: 0.1,
    sodium: 33,
    image_url: "https://images.openfoodfacts.org/images/products/327/019/002/0970/front_fr.6.200.jpg",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!query) {
    return NextResponse.json({ products: CURATED_PRODUCTS.slice(0, 10), hasMore: false });
  }

  // 1. Check matching items in curated list
  const curatedMatches = CURATED_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
  );

  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(
      query
    )}&page=${page}&page_size=20&fields=code,product_name,product_name_en,brands,categories,nutriscore_grade,image_front_small_url,image_url,nutriments`;

    const res = await fetch(offUrl, {
      headers: {
        "User-Agent": "NutriGlobalExplorerApp/1.0 (chau@chautran.dev)",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const rawProducts = data.products || [];

      const apiProducts: ProductItem[] = rawProducts
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
            name: p.product_name || p.product_name_en || "Unknown Product",
            brand: p.brands ? p.brands.split(",")[0].trim() : undefined,
            category: p.categories ? p.categories.split(",")[0].trim() : undefined,
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

      // Merge curated matches at top, then API results, removing duplicates by id
      const combinedMap = new Map<string, ProductItem>();
      curatedMatches.forEach((p) => combinedMap.set(p.id, p));
      apiProducts.forEach((p) => {
        if (!combinedMap.has(p.id)) combinedMap.set(p.id, p);
      });

      const finalProducts = Array.from(combinedMap.values());
      return NextResponse.json({
        products: finalProducts,
        hasMore: finalProducts.length >= 20,
      });
    }
  } catch (error) {
    console.warn("OpenFoodFacts search offline, returning curated matches:", error);
  }

  // Fallback to curated matches if OpenFoodFacts endpoint is down/timing out
  return NextResponse.json({
    products: curatedMatches.length > 0 ? curatedMatches : CURATED_PRODUCTS.slice(0, 6),
    hasMore: false,
  });
}
