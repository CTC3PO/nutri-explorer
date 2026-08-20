"use client";

import React from "react";
import { NutriVisionAnalysis } from "@/shared/types/nutrivision";

interface MacroTableProps {
  analysis: NutriVisionAnalysis;
  selectedBoxId: string | null;
  onHoverBox: (boxId: string | null) => void;
}

export function MacroTable({ analysis, selectedBoxId, onHoverBox }: MacroTableProps) {
  const rows = [
    { id: "box-calories", label: "Energy / Calories", value: `${analysis.calories} kcal (${analysis.energy} kJ)`, dv: "6%", status: "Optimal" },
    { id: "box-fat", label: "Saturated Fat", value: `${analysis.saturatedFat} g`, dv: "8%", status: "Low" },
    { id: "box-sodium", label: "Sodium", value: `${analysis.sodium} mg`, dv: "1%", status: "Low" },
    { id: "box-sugars", label: "Total Sugars", value: `${analysis.sugars} g`, dv: "4%", status: analysis.sugars > 10 ? "High" : "Low" },
    { id: "box-protein", label: "Protein", value: `${analysis.protein} g`, dv: "10%", status: "Good" },
    { id: "box-fiber", label: "Dietary Fiber", value: `${analysis.fiber} g`, dv: "14%", status: "High" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
        <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Extracted Nutrition Facts</h3>
        <span className="text-[11px] text-zinc-400 font-mono">Per 100g serving</span>
      </div>

      <div className="space-y-1.5 text-xs">
        {rows.map((row) => {
          const isHighlighted = selectedBoxId === row.id;

          return (
            <div
              key={row.id}
              onMouseEnter={() => onHoverBox(row.id)}
              onMouseLeave={() => onHoverBox(null)}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-150 cursor-pointer ${
                isHighlighted
                  ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/50 shadow-sm"
                  : "bg-zinc-50/60 hover:bg-zinc-100/70 border-zinc-200/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isHighlighted ? "bg-emerald-500" : "bg-zinc-300"}`} />
                <span className="font-medium text-zinc-800">{row.label}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-900">{row.value}</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-200/50 px-1.5 py-0.5 rounded font-mono">
                  {row.dv} DV
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
