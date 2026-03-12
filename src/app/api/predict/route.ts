import { NextRequest, NextResponse } from "next/server";

// Nutri-Score 2024 (Simplified Implementation)
// Points: 0 to 10 for each negative, 0 to 5 for each positive
function calculatePoints(value: number, thresholds: number[]): number {
  let points = 0;
  for (const threshold of thresholds) {
    if (value > threshold) points++;
    else break;
  }
  return points;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1. Negative Points (0-40)
    const energyPoints = calculatePoints(data.energy || 0, [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350]);
    const sugarPoints = calculatePoints(data.sugars || 0, [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45]);
    const satFatPoints = calculatePoints(data.saturatedFat || 0, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const sodiumPoints = calculatePoints(data.sodium || 0, [90, 180, 270, 360, 450, 540, 630, 720, 810, 900]);

    const negativePoints = energyPoints + sugarPoints + satFatPoints + sodiumPoints;

    // 2. Positive Points (0-15)
    const fruitPoints = calculatePoints(data.fruitVegetablesPercentage || 0, [40, 60, 80]); // 0, 1, 2, 5 points
    const fiberPoints = calculatePoints(data.fiber || 0, [0.7, 1.4, 2.1, 2.8, 3.5]);
    const proteinPoints = calculatePoints(data.protein || 0, [1.6, 3.2, 4.8, 6.4, 8.0]);

    const positivePoints = fruitPoints + fiberPoints + proteinPoints;

    // 3. Final Score
    // Note: Special rules apply if negative points >= 11, but we keep it simple for MVP
    const finalScore = negativePoints - positivePoints;

    // 4. Determine Grade
    let grade = "A";
    if (finalScore >= 19) grade = "E";
    else if (finalScore >= 11) grade = "D";
    else if (finalScore >= 3) grade = "C";
    else if (finalScore >= 0) grade = "B";

    return NextResponse.json({
      score: finalScore,
      grade: grade,
      breakdown: {
        negative: { energyPoints, sugarPoints, satFatPoints, sodiumPoints },
        positive: { fruitPoints, fiberPoints, proteinPoints }
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
