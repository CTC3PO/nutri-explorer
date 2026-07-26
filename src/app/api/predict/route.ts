import { NextRequest, NextResponse } from "next/server";
import { calculateNutriScore, NutritionalData } from "@/lib/nutri-score";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Standardize energy: if energy is provided in kcal (typical slider value < 1000), convert to kJ
    let energyKj = body.energy || 0;
    if (energyKj > 0 && energyKj < 1000) {
      energyKj = Math.round(energyKj * 4.184);
    }

    const nutriData: NutritionalData = {
      energy: energyKj,
      sugars: body.sugars ?? 0,
      saturatedFat: body.saturatedFat ?? 0,
      sodium: body.sodium ?? 0,
      fiber: body.fiber ?? 0,
      protein: body.protein ?? 0,
      fruitsVegPercent: body.fruitVegetablesPercentage ?? body.fruitsVegPercent ?? 0,
      isBeverage: Boolean(body.isBeverage),
    };

    const result = calculateNutriScore(nutriData);

    return NextResponse.json({
      score: result.score,
      grade: result.grade,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
