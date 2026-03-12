/**
 * Nutri-Score Calculation Logic
 * Based on the official Nutri-Score algorithm (2024 update where applicable)
 */

export interface NutritionalData {
  energy: number;       // kJ per 100g
  sugars: number;       // g per 100g
  saturatedFat: number; // g per 100g
  sodium: number;       // mg per 100g (Note: 1g salt = 400mg sodium)
  fiber: number;        // g per 100g
  protein: number;      // g per 100g
  fruitsVegPercent: number; // % of fruits, vegetables, pulses, nuts, etc.
  isBeverage?: boolean;
}

export type NutriGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export function calculateNutriScore(data: NutritionalData): { score: number; grade: NutriGrade } {
  // Negative points (N)
  const energyPoints = getEnergyPoints(data.energy, data.isBeverage);
  const sugarPoints = getSugarPoints(data.sugars, data.isBeverage);
  const satFatPoints = getSaturatedFatPoints(data.saturatedFat, data.isBeverage);
  const sodiumPoints = getSodiumPoints(data.sodium);

  const negativePoints = energyPoints + sugarPoints + satFatPoints + sodiumPoints;

  // Positive points (P)
  const fruitsVegPoints = getFruitsVegPoints(data.fruitsVegPercent, data.isBeverage);
  const fiberPoints = getFiberPoints(data.fiber, data.isBeverage);
  const proteinPoints = getProteinPoints(data.protein, data.isBeverage);

  let finalScore: number;

  if (data.isBeverage) {
     // Beverages have a different calculation
     finalScore = negativePoints - (fruitsVegPoints); // Simplified for this implementation
  } else {
    // General food calculation
    if (negativePoints >= 11 && fruitsVegPoints < 5) {
      finalScore = negativePoints - (fruitsVegPoints + fiberPoints);
    } else {
      finalScore = negativePoints - (fruitsVegPoints + fiberPoints + proteinPoints);
    }
  }

  return {
    score: finalScore,
    grade: getNutriGrade(finalScore, data.isBeverage)
  };
}

function getEnergyPoints(energy: number, isBeverage?: boolean): number {
  if (isBeverage) {
    if (energy <= 0) return 0;
    if (energy <= 30) return 1;
    if (energy <= 60) return 2;
    if (energy <= 90) return 3;
    if (energy <= 120) return 4;
    if (energy <= 150) return 5;
    if (energy <= 180) return 6;
    if (energy <= 210) return 7;
    if (energy <= 240) return 8;
    if (energy <= 270) return 9;
    return 10;
  }
  if (energy <= 335) return 0;
  if (energy <= 670) return 1;
  if (energy <= 1005) return 2;
  if (energy <= 1340) return 3;
  if (energy <= 1675) return 4;
  if (energy <= 2010) return 5;
  if (energy <= 2345) return 6;
  if (energy <= 2680) return 7;
  if (energy <= 3015) return 8;
  if (energy <= 3350) return 9;
  return 10;
}

function getSugarPoints(sugar: number, isBeverage?: boolean): number {
  if (isBeverage) {
    if (sugar <= 0) return 0;
    if (sugar <= 1.5) return 1;
    if (sugar <= 3) return 2;
    if (sugar <= 4.5) return 3;
    if (sugar <= 6) return 4;
    if (sugar <= 7.5) return 5;
    if (sugar <= 9) return 6;
    if (sugar <= 10.5) return 7;
    if (sugar <= 12) return 8;
    if (sugar <= 13.5) return 9;
    return 10;
  }
  if (sugar <= 4.5) return 0;
  if (sugar <= 9) return 1;
  if (sugar <= 13.5) return 2;
  if (sugar <= 18) return 3;
  if (sugar <= 22.5) return 4;
  if (sugar <= 27) return 5;
  if (sugar <= 31) return 6;
  if (sugar <= 36) return 7;
  if (sugar <= 40) return 8;
  if (sugar <= 45) return 9;
  return 10;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSaturatedFatPoints(satFat: number, _isBeverage?: boolean): number {
  if (satFat <= 1) return 0;
  if (satFat <= 2) return 1;
  if (satFat <= 3) return 2;
  if (satFat <= 4) return 3;
  if (satFat <= 5) return 4;
  if (satFat <= 6) return 5;
  if (satFat <= 7) return 6;
  if (satFat <= 8) return 7;
  if (satFat <= 9) return 8;
  if (satFat <= 10) return 9;
  return 10;
}

function getSodiumPoints(sodium: number): number {
  if (sodium <= 90) return 0;
  if (sodium <= 180) return 1;
  if (sodium <= 270) return 2;
  if (sodium <= 360) return 3;
  if (sodium <= 450) return 4;
  if (sodium <= 540) return 5;
  if (sodium <= 630) return 6;
  if (sodium <= 720) return 7;
  if (sodium <= 810) return 8;
  if (sodium <= 900) return 9;
  return 10;
}

function getFruitsVegPoints(percent: number, isBeverage?: boolean): number {
  if (isBeverage) {
    if (percent <= 40) return 0;
    if (percent <= 60) return 2;
    if (percent <= 80) return 4;
    return 10;
  }
  if (percent <= 40) return 0;
  if (percent <= 60) return 1;
  if (percent <= 80) return 2;
  return 5;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFiberPoints(fiber: number, _isBeverage?: boolean): number {
  if (fiber <= 0.9) return 0;
  if (fiber <= 1.9) return 1;
  if (fiber <= 2.8) return 2;
  if (fiber <= 3.7) return 3;
  if (fiber <= 4.7) return 4;
  return 5;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getProteinPoints(protein: number, _isBeverage?: boolean): number {
  if (protein <= 1.6) return 0;
  if (protein <= 3.2) return 1;
  if (protein <= 4.8) return 2;
  if (protein <= 6.4) return 3;
  if (protein <= 8.0) return 4;
  return 5;
}

function getNutriGrade(score: number, isBeverage?: boolean): NutriGrade {
  if (isBeverage) {
    if (score <= 1) return 'A';
    if (score <= 5) return 'B';
    if (score <= 9) return 'C';
    if (score <= 12) return 'D';
    return 'E';
  }
  if (score <= -1) return 'A';
  if (score <= 2) return 'B';
  if (score <= 10) return 'C';
  if (score <= 18) return 'D';
  return 'E';
}
