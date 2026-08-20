"use client";

import React, { useState } from "react";
import { calculateNutriScore, NutriGrade } from "@/lib/nutri-score";
import { Sliders, Sparkles, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";

interface ReformulationLabProps {
  baseCalories: number;
  baseSugars: number;
  baseSatFat: number;
  baseSodium: number;
  baseProtein: number;
  baseFiber: number;
}

export function ReformulationLab({
  baseCalories,
  baseSugars,
  baseSatFat,
  baseSodium,
  baseProtein,
  baseFiber,
}: ReformulationLabProps) {
  // Sliders for percentage modifications
  const [sugarDelta, setSugarDelta] = useState<number>(-30); // -30% sugar
  const [sodiumDelta, setSodiumDelta] = useState<number>(-20); // -20% sodium
  const [fiberBoost, setFiberBoost] = useState<number>(3); // +3g fiber
  const [proteinBoost, setProteinBoost] = useState<number>(2); // +2g protein

  // Compute reformulated values
  const simSugars = Math.max(0, parseFloat((baseSugars * (1 + sugarDelta / 100)).toFixed(1)));
  const simSodium = Math.max(0, Math.round(baseSodium * (1 + sodiumDelta / 100)));
  const simFiber = parseFloat((baseFiber + fiberBoost).toFixed(1));
  const simProtein = parseFloat((baseProtein + proteinBoost).toFixed(1));
  const simCalories = Math.round(baseCalories - (baseSugars - simSugars) * 4);
  const simEnergy = Math.round(simCalories * 4.184);

  // Compute live Nutri-Score
  const baselineScore = calculateNutriScore({
    energy: Math.round(baseCalories * 4.184),
    sugars: baseSugars,
    saturatedFat: baseSatFat,
    sodium: baseSodium,
    protein: baseProtein,
    fiber: baseFiber,
    fruitsVegPercent: 0,
  });

  const simulatedScore = calculateNutriScore({
    energy: simEnergy,
    sugars: simSugars,
    saturatedFat: baseSatFat,
    sodium: simSodium,
    protein: simProtein,
    fiber: simFiber,
    fruitsVegPercent: 0,
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between h-full min-h-[580px]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600">R&D Formulation Sandbox</span>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Producer Recipe Simulator</h3>
        </div>
        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200/60 flex items-center gap-1">
          <Sliders size={11} /> Real-Time Solver
        </span>
      </div>

      {/* Comparison Score Banner */}
      <div className="my-3 bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex items-center justify-around">
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Baseline</span>
          <div className="text-2xl font-black text-slate-700 mt-1">Grade {baselineScore.grade}</div>
          <span className="text-[10px] text-slate-400 font-mono">Score: {baselineScore.score}</span>
        </div>

        <ArrowRight size={20} className="text-indigo-400 animate-pulse" />

        <div className="text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Reformulated Target</span>
          <div className="text-3xl font-black text-emerald-600 mt-0.5">Grade {simulatedScore.grade}</div>
          <span className="text-[10px] text-emerald-700 font-bold font-mono">Score: {simulatedScore.score} (Improved)</span>
        </div>
      </div>

      {/* Interactive Reformulation Parameter Sliders */}
      <div className="space-y-3.5 my-2">
        {/* Sugar Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-800">
            <span>Reduce Added Sugars:</span>
            <span className="text-emerald-600 font-bold">{sugarDelta}% ({simSugars}g vs {baseSugars}g)</span>
          </div>
          <input
            type="range"
            min="-60"
            max="0"
            step="5"
            value={sugarDelta}
            onChange={(e) => setSugarDelta(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Sodium Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-800">
            <span>Reduce Sodium / Salt:</span>
            <span className="text-emerald-600 font-bold">{sodiumDelta}% ({simSodium}mg vs {baseSodium}mg)</span>
          </div>
          <input
            type="range"
            min="-50"
            max="0"
            step="5"
            value={sodiumDelta}
            onChange={(e) => setSodiumDelta(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Dietary Fiber Boost */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-800">
            <span>Add Soluble Dietary Fiber (Oat / Chicory):</span>
            <span className="text-indigo-600 font-bold">+{fiberBoost}g ({simFiber}g total)</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={fiberBoost}
            onChange={(e) => setFiberBoost(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Protein Boost */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-800">
            <span>Add Plant Protein Isolate (Pea / Hemp):</span>
            <span className="text-indigo-600 font-bold">+{proteinBoost}g ({simProtein}g total)</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={proteinBoost}
            onChange={(e) => setProteinBoost(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      {/* Regulatory Impact Card */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>EU HFSS TV & Promotion Eligible</span>
        </div>
        <button
          onClick={() => {
            setSugarDelta(-30);
            setSodiumDelta(-20);
            setFiberBoost(3);
            setProteinBoost(2);
          }}
          className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] font-medium"
        >
          <RefreshCw size={10} /> Reset
        </button>
      </div>
    </div>
  );
}
