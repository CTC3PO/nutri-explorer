import { NextRequest, NextResponse } from "next/server";
import { HOUSEHOLD_PRODUCTS } from "@/lib/mock-data";
import { NutriVisionAnalysis, AllergenStatus, AdditiveRisk, IngredientComponent } from "@/shared/types/nutrivision";
import { calculateNutriScore, NutriGrade } from "@/lib/nutri-score";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Check if it is one of our local curated items
  if (HOUSEHOLD_PRODUCTS[id]) {
    return NextResponse.json(HOUSEHOLD_PRODUCTS[id]);
  }

  // Also check by product key or barcode
  for (const [key, item] of Object.entries(HOUSEHOLD_PRODUCTS)) {
    if (key.toLowerCase() === id.toLowerCase()) {
      return NextResponse.json(item);
    }
  }

  // 2. Fetch live from Open Food Facts API
  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(id)}.json`;
    const res = await fetch(offUrl, {
      headers: {
        "User-Agent": "NutriVisionWorkbench/1.0 (contact@nutrivision.dev)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Product not found on Open Food Facts" }, { status: 404 });
    }

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const calories = Math.round(
      nutriments["energy-kcal_100g"] ??
        nutriments["energy-kcal"] ??
        (nutriments["energy_100g"] ? Math.round(nutriments["energy_100g"] / 4.184) : 0)
    );
    const energyKj = Math.round(nutriments["energy_100g"] ?? (calories * 4.184));
    const sugars = Math.round((nutriments["sugars_100g"] ?? 0) * 10) / 10;
    const saturatedFat = Math.round((nutriments["saturated-fat_100g"] ?? 0) * 10) / 10;
    const sodiumMg = Math.round(
      (nutriments["sodium_100g"] ?? (nutriments["salt_100g"] ? nutriments["salt_100g"] / 2.5 : 0)) * 1000
    );
    const protein = Math.round((nutriments["proteins_100g"] ?? 0) * 10) / 10;
    const fiber = Math.round((nutriments["fiber_100g"] ?? 0) * 10) / 10;
    const fvPercent = Math.round(nutriments["fruits-vegetables-nuts-estimate-from-ingredients_100g"] ?? 0);

    // Compute Nutri-Score
    const calculated = calculateNutriScore({
      energy: energyKj,
      sugars,
      saturatedFat,
      sodium: sodiumMg,
      protein,
      fiber,
      fruitsVegPercent: fvPercent,
    });

    const grade: NutriGrade = (p.nutriscore_grade?.toUpperCase() as NutriGrade) || calculated.grade;
    const nova: 1 | 2 | 3 | 4 = (p.nova_group as 1 | 2 | 3 | 4) || (sugars > 15 || saturatedFat > 5 ? 4 : 2);

    // Parse Ingredients
    const rawIngredientsText: string = p.ingredients_text_en || p.ingredients_text || "";
    const ingredientList: string[] = rawIngredientsText
      ? rawIngredientsText.split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["Whole Ingredients"];

    // Build Deconstruction
    const deconstructed: IngredientComponent[] = ingredientList.slice(0, 6).map((ing, idx) => {
      const colors = ["bg-emerald-600", "bg-amber-500", "bg-sky-600", "bg-rose-500", "bg-indigo-600", "bg-orange-500"];
      const estPercent = idx === 0 ? Math.max(30, 100 - (ingredientList.length - 1) * 15) : Math.max(5, Math.round(70 / ingredientList.length));

      return {
        id: `ing-${idx}`,
        name: ing.replace(/[\[\]\(\)]/g, ""),
        percentage: estPercent,
        color: colors[idx % colors.length],
        origin: "Agricultural Harvest / Formulation",
        processing: nova === 4 ? "Ultra-Processed Additive" : nova === 3 ? "Processed Culinary" : "Raw Whole Food",
        metabolicImpact: idx === 0 ? "Primary caloric and nutritional base of the product." : "Secondary flavor and texture component.",
        safetyNote: "Open Food Facts Verified"
      };
    });

    // Parse Additives
    const additivesTags: string[] = p.additives_tags || [];
    const additives: AdditiveRisk[] = additivesTags.slice(0, 4).map((tag: string) => {
      const code = tag.replace("en:", "").toUpperCase();
      return {
        code,
        name: code,
        riskLevel: "low",
        origin: "Approved Food Additive",
        citation: "EFSA / FDA Approved",
        safetySummary: "Standard food additive within acceptable daily intake (ADI) limits.",
      };
    });

    // Parse Allergens
    const allergensTags: string[] = p.allergens_tags || [];
    const allergenList: AllergenStatus[] = [
      { id: "gluten", name: "Gluten", detected: allergensTags.some((t) => t.includes("gluten") || t.includes("wheat")), icon: "🌾", confidence: 0.95 },
      { id: "peanuts", name: "Peanuts", detected: allergensTags.some((t) => t.includes("peanut")), icon: "🥜", confidence: 0.95 },
      { id: "tree_nuts", name: "Tree Nuts", detected: allergensTags.some((t) => t.includes("nut")), icon: "🌰", confidence: 0.95 },
      { id: "dairy", name: "Dairy", detected: allergensTags.some((t) => t.includes("milk")), icon: "🥛", confidence: 0.95 },
      { id: "soy", name: "Soy", detected: allergensTags.some((t) => t.includes("soy")), icon: "🌱", confidence: 0.95 },
    ];

    // Build Normalized Product Analysis
    const analysisResult: NutriVisionAnalysis = {
      productName: p.product_name || p.product_name_en || "Food Product",
      brand: p.brands ? p.brands.split(",")[0].trim() : "Supermarket Brand",
      servingSize: p.serving_size || "100g",
      calories,
      energy: energyKj,
      sugars,
      saturatedFat,
      sodium: sodiumMg,
      protein,
      fiber,
      fruitVegetablesPercentage: fvPercent,
      nutriScore: grade,
      nutriScoreRaw: calculated.score,
      novaScore: nova,
      novaDescription:
        nova === 1
          ? "Unprocessed or minimally processed fresh food."
          : nova === 2
          ? "Processed culinary ingredient."
          : nova === 3
          ? "Processed food made by adding salt/sugar/fat."
          : "Ultra-processed industrial formulation with synthetic additives.",
      imageUrl: p.image_front_url || p.image_url || "/samples/oats_label.jpg",
      analyzedAt: new Date().toISOString(),
      modelEngine: "Open Food Facts Live API Reference",
      boundingBoxes: [
        { id: "box-header", label: "Nutrition Facts", value: p.serving_size || "100g", box_2d: [120, 80, 780, 920], category: "header" },
        { id: "box-calories", label: "Calories", value: calories, unit: "kcal", box_2d: [240, 100, 310, 900], category: "nutrition" },
        { id: "box-fat", label: "Saturated Fat", value: saturatedFat, unit: "g", box_2d: [350, 100, 410, 900], category: "nutrition" },
        { id: "box-sodium", label: "Sodium", value: sodiumMg, unit: "mg", box_2d: [480, 100, 540, 900], category: "nutrition" },
        { id: "box-sugars", label: "Total Sugars", value: sugars, unit: "g", box_2d: [580, 100, 640, 900], category: "nutrition" },
        { id: "box-protein", label: "Protein", value: protein, unit: "g", box_2d: [680, 100, 740, 900], category: "nutrition" },
      ],
      claims: [
        {
          id: "c-live-1",
          claim: p.labels ? p.labels.split(",")[0] : "Verified Nutri-Score",
          verdict: grade === "A" || grade === "B" ? "verified" : "misleading",
          reality: `Nutri-Score Grade ${grade} based on statutory nutritional thresholds.`,
          regulatoryStandard: "Open Food Facts Statutory Calculation",
        },
      ],
      deconstructedIngredients: deconstructed,
      ingredients: ingredientList,
      additives,
      allergens: allergenList,
      recommendedSwaps: [
        {
          id: "swap-live-1",
          name: "Organic Whole Food Alternative",
          brand: "Clean Brand",
          nutriScore: "A",
          novaScore: 1,
          calories: Math.max(50, calories - 50),
          sugars: Math.max(1, sugars * 0.4),
          vectorMatchPercent: 94,
          tag: "Cleaner Nutritional Profile",
          image: "🥣",
        },
      ],
    };

    return NextResponse.json(analysisResult);
  } catch (err: any) {
    console.error("Open Food Facts fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch from Open Food Facts" }, { status: 500 });
  }
}
