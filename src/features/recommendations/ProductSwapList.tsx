"use client";

import React from "react";
import { ProductSwap } from "@/shared/types/nutrivision";
import { ChevronRight } from "lucide-react";

interface ProductSwapListProps {
  swaps: ProductSwap[];
  onSelectSwap?: (swap: ProductSwap) => void;
}

export function ProductSwapList({ swaps, onSelectSwap }: ProductSwapListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600">Healthier Alternatives</span>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Product Swaps</h3>
        </div>
        <button className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 transition-colors">
          <span>See more</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* 3 Horizontal Cards Arranged in 3-Columns */}
      <div className="grid grid-cols-3 gap-2.5 my-2">
        {swaps.map((swap) => (
          <div
            key={swap.id}
            onClick={() => onSelectSwap?.(swap)}
            className="group bg-slate-50 hover:bg-white border border-slate-200/70 hover:border-emerald-300 rounded-xl p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-md"
          >
            {/* Top Icon & Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{swap.image || "🥣"}</span>
                <span className="w-5 h-5 rounded bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                  {swap.nutriScore}
                </span>
              </div>
              <h5 className="font-bold text-[11px] text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {swap.name}
              </h5>
              <p className="text-[10px] text-slate-400 truncate">{swap.brand}</p>
            </div>

            {/* Nutri Specs */}
            <div className="pt-2 border-t border-slate-200/60 mt-1 space-y-0.5 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>Energy:</span>
                <span className="font-bold text-slate-800">{swap.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Sugars:</span>
                <span className="font-bold text-emerald-700">{swap.sugars}g</span>
              </div>
              <div className="mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-bold py-0.5 rounded text-center transition-colors">
                {swap.vectorMatchPercent}% Match • Inspect Alternative
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Comparison: <strong>Same Food Category</strong></span>
        <span className="text-emerald-700 font-semibold">Higher Nutri-Score</span>
      </div>
    </div>
  );
}
