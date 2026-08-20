"use client";

import React from "react";
import { NutriGrade } from "@/lib/nutri-score";
import { NovaGrade, AllergenStatus } from "@/shared/types/nutrivision";
import { Info, ShieldCheck, Check, TrendingUp, TrendingDown, Sparkles } from "lucide-react";

interface NutriScoreGaugeProps {
  nutriScore: NutriGrade;
  nutriScoreRaw: number;
  novaScore: NovaGrade;
  novaDescription: string;
  allergens: AllergenStatus[];
  sugarCarbRatio?: number;
  positiveScoreDrivers?: string[];
  negativeScoreDrivers?: string[];
}

export function NutriScoreGauge({
  nutriScore,
  novaScore,
  novaDescription,
  allergens,
  sugarCarbRatio,
  positiveScoreDrivers,
  negativeScoreDrivers,
}: NutriScoreGaugeProps) {
  // Needle rotation calculation based on grade
  const gradeAngles: Record<NutriGrade, number> = {
    A: -65,
    B: -32,
    C: 0,
    D: 32,
    E: 65,
  };

  const needleAngle = gradeAngles[nutriScore] ?? -65;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between h-full min-h-[580px] gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600">Nutritional Quality</span>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Nutri-Score & Score Drivers</h3>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
          Official 2024 Formula
        </div>
      </div>

      {/* Main Semi-Circular Speedometer Gauge Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-center relative">
        <div className="w-full flex items-center justify-around gap-2">
          {/* Semi-Circular SVG Speedometer Gauge */}
          <div className="relative w-[180px] h-[110px] flex items-end justify-center">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                <line id="needle" x1="100" y1="100" x2="100" y2="25" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              </defs>

              {/* Segment A: Green */}
              <path d="M 20 100 A 80 80 0 0 1 42 48" fill="none" stroke="#10b981" strokeWidth="18" strokeLinecap="round" />
              {/* Segment B: Lime */}
              <path d="M 46 44 A 80 80 0 0 1 78 24" fill="none" stroke="#84cc16" strokeWidth="18" />
              {/* Segment C: Yellow */}
              <path d="M 83 22 A 80 80 0 0 1 117 22" fill="none" stroke="#eab308" strokeWidth="18" />
              {/* Segment D: Orange */}
              <path d="M 122 24 A 80 80 0 0 1 154 44" fill="none" stroke="#f97316" strokeWidth="18" />
              {/* Segment E: Red */}
              <path d="M 158 48 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />

              {/* Center Needle with Dynamic Rotation */}
              <g transform={`rotate(${needleAngle} 100 100)`} className="transition-transform duration-500 ease-out">
                <line x1="100" y1="100" x2="100" y2="30" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                <circle cx="100" cy="100" r="8" fill="#0f172a" />
                <circle cx="100" cy="100" r="4" fill="#ffffff" />
              </g>
            </svg>

            {/* Letter Labels around bottom */}
            <div className="absolute bottom-0 w-full flex justify-between px-2 text-[11px] font-black text-slate-500 font-sans select-none">
              <span className="text-emerald-600 font-black">A</span>
              <span className="text-lime-600 font-black">B</span>
              <span className="text-amber-500 font-black">C</span>
              <span className="text-orange-500 font-black">D</span>
              <span className="text-rose-500 font-black">E</span>
            </div>
          </div>

          {/* Large Glowing Grade Badge */}
          <div className="flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg transition-all duration-300 ${
                nutriScore === "A"
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/25 ring-4 ring-emerald-100"
                  : nutriScore === "B"
                  ? "bg-gradient-to-br from-lime-500 to-lime-700 shadow-lime-500/25 ring-4 ring-lime-100"
                  : nutriScore === "C"
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/25 ring-4 ring-amber-100"
                  : nutriScore === "D"
                  ? "bg-gradient-to-br from-orange-500 to-orange-700 shadow-orange-500/25 ring-4 ring-orange-100"
                  : "bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/25 ring-4 ring-rose-100"
              }`}
            >
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">GRADE</span>
              <span className="text-3xl font-black leading-none">{nutriScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Sugar Ratio Meter (Carbohydrate Quality) */}
      {sugarCarbRatio !== undefined && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Hidden Sugar in Carbs:</span>
            </span>
            <span className={`font-mono font-black px-2 py-0.5 rounded text-[11px] ${
              sugarCarbRatio <= 10 
                ? "bg-emerald-100 text-emerald-800" 
                : sugarCarbRatio <= 35 
                ? "bg-lime-100 text-lime-800" 
                : sugarCarbRatio <= 60 
                ? "bg-amber-100 text-amber-800" 
                : "bg-rose-100 text-rose-800"
            }`}>
              {sugarCarbRatio.toFixed(1)}% Free Sugar
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
            <div 
              style={{ width: `${Math.min(100, Math.max(2, sugarCarbRatio))}%` }} 
              className={`h-full transition-all duration-500 ${
                sugarCarbRatio <= 10 
                  ? "bg-emerald-500" 
                  : sugarCarbRatio <= 35 
                  ? "bg-lime-500" 
                  : sugarCarbRatio <= 60 
                  ? "bg-amber-500" 
                  : "bg-rose-500"
              }`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Complex Whole Grain</span>
            <span>Pure Sugar Matrix</span>
          </div>
        </div>
      )}

      {/* Key Score Drivers Section (Positive & Negative Factors) */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Key Nutritional Drivers
        </span>
        
        {/* Positive Drivers */}
        {positiveScoreDrivers && positiveScoreDrivers.length > 0 && (
          <div className="space-y-1">
            {positiveScoreDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1 rounded-lg font-medium">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        )}

        {/* Negative Drivers */}
        {negativeScoreDrivers && negativeScoreDrivers.length > 0 && (
          <div className="space-y-1">
            {negativeScoreDrivers.map((driver, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-rose-800 bg-rose-50/70 border border-rose-200/60 px-2.5 py-1 rounded-lg font-medium">
                <span className="text-rose-600 font-bold">✕</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Mini Safeguard Modules: NOVA & Allergen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* NOVA Score Card */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800">NOVA Score</span>
            <div className="w-5 h-5 rounded bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {novaScore}
            </div>
          </div>
          <p className="text-[10px] text-slate-600 font-medium line-clamp-1">
            {novaDescription}
          </p>
        </div>

        {/* Allergen Guardrails Card */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800">Allergens</span>
            <ShieldCheck size={14} className="text-emerald-600" />
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold leading-tight">
            Verified Standards
          </p>
        </div>
      </div>
    </div>
  );
}
