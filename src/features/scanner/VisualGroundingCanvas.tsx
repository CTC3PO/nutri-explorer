"use client";

import React, { useState } from "react";
import { BoundingBox } from "@/shared/types/nutrivision";
import { CheckCircle2, Search } from "lucide-react";

interface VisualGroundingCanvasProps {
  productName: string;
  brand: string;
  imageUrl?: string;
  calories: number;
  sugars: number;
  saturatedFat: number;
  sodium: number;
  protein: number;
  boundingBoxes: BoundingBox[];
  selectedBoxId: string | null;
  onSelectBox: (boxId: string | null) => void;
}

export function VisualGroundingCanvas({
  productName,
  brand,
  imageUrl,
  calories,
  sugars,
  saturatedFat,
  sodium,
  protein,
  selectedBoxId,
  onSelectBox,
}: VisualGroundingCanvasProps) {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);
  const active = hoveredBox || selectedBoxId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between h-full min-h-[580px]">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600">Product Package</span>
          <h3 className="text-base font-bold text-slate-900 leading-tight">{productName}</h3>
          <p className="text-xs text-slate-500">{brand}</p>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
          <Search size={11} /> Label Verified
        </span>
      </div>

      {/* Package Viewport with Real Photo & SVG Coordinate Overlays */}
      <div className="relative my-3 flex-1 bg-gradient-to-b from-slate-100 to-slate-200/80 rounded-2xl border border-slate-200/60 p-3 flex items-center justify-center overflow-hidden min-h-[360px]">
        {/* Real Product Photo */}
        <div className="relative w-full h-[360px] max-w-[280px] rounded-xl overflow-hidden shadow-lg border border-slate-300">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover object-center select-none"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              No Image
            </div>
          )}

          {/* Interactive SVG Bounding Box Overlays */}
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            preserveAspectRatio="none"
          >
            {/* Nutrition Facts Header Box */}
            <rect
              x="620"
              y="280"
              width="260"
              height="380"
              fill={active === "box-header" ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.08)"}
              stroke="#10b981"
              strokeWidth="4"
              rx="8"
              className={active === "box-header" ? "animate-pulse" : ""}
            />

            {/* Calories Bounding Box */}
            <rect
              x="630"
              y="320"
              width="240"
              height="50"
              fill={active === "box-calories" ? "rgba(16, 185, 129, 0.35)" : "transparent"}
              stroke={active === "box-calories" ? "#10b981" : "rgba(59, 130, 246, 0.5)"}
              strokeWidth={active === "box-calories" ? "4" : "2"}
              strokeDasharray={active === "box-calories" ? "none" : "6 4"}
              rx="4"
            />

            {/* Saturated Fat Bounding Box */}
            <rect
              x="630"
              y="390"
              width="240"
              height="40"
              fill={active === "box-fat" ? "rgba(16, 185, 129, 0.35)" : "transparent"}
              stroke={active === "box-fat" ? "#10b981" : "rgba(59, 130, 246, 0.5)"}
              strokeWidth={active === "box-fat" ? "4" : "2"}
              strokeDasharray={active === "box-fat" ? "none" : "6 4"}
              rx="4"
            />

            {/* Sodium Bounding Box */}
            <rect
              x="630"
              y="450"
              width="240"
              height="40"
              fill={active === "box-sodium" ? "rgba(16, 185, 129, 0.35)" : "transparent"}
              stroke={active === "box-sodium" ? "#10b981" : "rgba(59, 130, 246, 0.5)"}
              strokeWidth={active === "box-sodium" ? "4" : "2"}
              strokeDasharray={active === "box-sodium" ? "none" : "6 4"}
              rx="4"
            />

            {/* Sugars Bounding Box */}
            <rect
              x="630"
              y="505"
              width="240"
              height="40"
              fill={active === "box-sugars" ? "rgba(16, 185, 129, 0.35)" : "transparent"}
              stroke={active === "box-sugars" ? "#10b981" : "rgba(59, 130, 246, 0.5)"}
              strokeWidth={active === "box-sugars" ? "4" : "2"}
              strokeDasharray={active === "box-sugars" ? "none" : "6 4"}
              rx="4"
            />
          </svg>
        </div>

        {/* Floating Callout Badges with Dynamic Highlight */}
        {/* Sugars Callout */}
        <div
          onMouseEnter={() => setHoveredBox("box-sugars")}
          onMouseLeave={() => setHoveredBox(null)}
          onClick={() => onSelectBox("box-sugars")}
          className={`absolute top-10 right-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5 z-20 ${
            active === "box-sugars"
              ? "bg-emerald-600 text-white scale-105 ring-2 ring-emerald-400"
              : sugars > 10
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-white/95 text-slate-800 border border-slate-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${sugars > 10 ? "bg-rose-500" : "bg-emerald-400"}`} />
          <span>Sugars: {sugars}g</span>
        </div>

        {/* Saturated Fat Callout */}
        <div
          onMouseEnter={() => setHoveredBox("box-fat")}
          onMouseLeave={() => setHoveredBox(null)}
          onClick={() => onSelectBox("box-fat")}
          className={`absolute top-28 left-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5 z-20 ${
            active === "box-fat"
              ? "bg-emerald-600 text-white scale-105 ring-2 ring-emerald-400"
              : saturatedFat > 3
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-white/95 text-slate-800 border border-slate-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${saturatedFat > 3 ? "bg-amber-500" : "bg-emerald-400"}`} />
          <span>Sat Fat: {saturatedFat}g</span>
        </div>

        {/* Sodium Callout */}
        <div
          onMouseEnter={() => setHoveredBox("box-sodium")}
          onMouseLeave={() => setHoveredBox(null)}
          onClick={() => onSelectBox("box-sodium")}
          className={`absolute bottom-8 right-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5 z-20 ${
            active === "box-sodium"
              ? "bg-emerald-600 text-white scale-105 ring-2 ring-emerald-400"
              : sodium > 200
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-white/95 text-slate-800 border border-slate-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${sodium > 200 ? "bg-amber-500" : "bg-emerald-400"}`} />
          <span>Sodium: {sodium}mg</span>
        </div>
      </div>

      {/* Card Footer: Status Bar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nutrition Label Loaded</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Standard 100g Reference</span>
      </div>
    </div>
  );
}
