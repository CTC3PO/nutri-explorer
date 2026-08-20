"use client";

import React, { useState } from "react";
import { NutriVisionAnalysis, IngredientComponent } from "@/shared/types/nutrivision";
import { HOUSEHOLD_PRODUCTS } from "@/lib/mock-data";
import { Layers, ShieldCheck, AlertCircle, Info, Sparkles, Check, ArrowRight } from "lucide-react";

interface ProductDeconstructionViewProps {
  analysis: NutriVisionAnalysis;
  onSelectProduct: (key: string) => void;
}

export function ProductDeconstructionView({
  analysis,
  onSelectProduct,
}: ProductDeconstructionViewProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

  const ingredients: IngredientComponent[] = analysis.deconstructedIngredients || [];
  const activeIngredient = ingredients.find((i) => i.id === selectedIngredientId) || ingredients[0];

  const productList = Object.entries(HOUSEHOLD_PRODUCTS).map(([key, item]) => ({
    key,
    ...item,
  }));

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-600 text-white";
      case "B":
        return "bg-lime-600 text-white";
      case "C":
        return "bg-amber-400 text-slate-900";
      case "D":
        return "bg-orange-500 text-white";
      case "E":
        return "bg-rose-600 text-white";
      default:
        return "bg-slate-300 text-slate-700";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Proportional Ingredients Stack Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                X-Ray Deconstruction
              </span>
              <span className="text-xs text-slate-400 font-medium">• What are you actually eating?</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {analysis.productName} <span className="text-sm font-normal text-slate-500">({analysis.brand})</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
              <span>Nutri-Score:</span>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${getGradeBadge(analysis.nutriScore)}`}>
                {analysis.nutriScore}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
              <span>NOVA Group:</span>
              <span className="w-5 h-5 rounded bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">
                {analysis.novaScore}
              </span>
            </div>
          </div>
        </div>

        {/* Proportional Stack Visual Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-600" />
              <span>Ingredient Weight Composition (% by Volume)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Hover/Click slice to zoom</span>
          </div>

          {/* Segmented Horizontal Stack Bar */}
          <div className="w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner p-0.5 gap-0.5">
            {ingredients.map((ing) => {
              const isSelected = selectedIngredientId === ing.id;
              return (
                <div
                  key={ing.id}
                  onClick={() => setSelectedIngredientId(ing.id)}
                  style={{ width: `${Math.max(6, ing.percentage)}%` }}
                  title={`${ing.name}: ${ing.percentage}%`}
                  className={`${ing.color} h-full rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-[10px] font-black text-white px-1 truncate select-none ${
                    isSelected ? "ring-2 ring-offset-1 ring-slate-900 scale-y-110 shadow-md" : "hover:opacity-90"
                  }`}
                >
                  {ing.percentage >= 10 && `${ing.percentage}%`}
                </div>
              );
            })}
          </div>

          {/* Legend Chips below bar */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {ingredients.map((ing) => {
              const isSelected = selectedIngredientId === ing.id;
              return (
                <button
                  key={ing.id}
                  onClick={() => setSelectedIngredientId(ing.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${ing.color}`} />
                  <span>{ing.name}</span>
                  <span className="font-mono text-[10px] opacity-70">({ing.percentage}%)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoomed-in Ingredient Detail Spotlight */}
        {activeIngredient && (
          <div className="mt-2 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Spotlight: {activeIngredient.name}
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">{activeIngredient.percentage}% of Product</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong>Metabolic Impact:</strong> {activeIngredient.metabolicImpact}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span>Origin: <strong className="text-slate-700 font-semibold">{activeIngredient.origin}</strong></span>
                <span>•</span>
                <span>Stage: <strong className="text-slate-700 font-semibold">{activeIngredient.processing}</strong></span>
              </div>
            </div>

            {activeIngredient.safetyNote && (
              <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-xs text-xs text-slate-700 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Safety Note</span>
                <span className="font-semibold">{activeIngredient.safetyNote}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive Ingredient Inspection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map((ing) => {
          const isSelected = selectedIngredientId === ing.id;
          return (
            <div
              key={ing.id}
              onClick={() => setSelectedIngredientId(ing.id)}
              className={`bg-white rounded-2xl border p-4.5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] ${
                isSelected
                  ? "border-indigo-400 ring-2 ring-indigo-400/30 shadow-md"
                  : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div>
                {/* Card Top: Name & % */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${ing.color}`} />
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{ing.name}</h4>
                  </div>
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg font-mono">
                    {ing.percentage}%
                  </span>
                </div>

                {/* Processing Tag */}
                <div className="mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ing.processing === "Raw Whole Food"
                        ? "bg-emerald-100 text-emerald-800"
                        : ing.processing === "Minimally Processed"
                        ? "bg-lime-100 text-lime-800"
                        : ing.processing === "Processed Culinary"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {ing.processing}
                  </span>
                </div>

                {/* Metabolic Text */}
                <p className="text-xs text-slate-600 leading-snug mb-3">
                  {ing.metabolicImpact}
                </p>
              </div>

              {/* Card Bottom: Origin & Allergen Icon */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[180px]">{ing.origin}</span>
                {ing.allergenIcon && (
                  <span className="text-sm bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md" title="Allergen Alert">
                    {ing.allergenIcon}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Product Catalog Gallery & Spectrum Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Product Spectrum</span>
            <h3 className="text-base font-bold text-slate-900">Explore All Household Products (Grades A ➔ E)</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any product to inspect inside</span>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {productList.map((prod) => {
            const isCurrent = analysis.productName === prod.productName;
            return (
              <div
                key={prod.key}
                onClick={() => onSelectProduct(prod.key)}
                className={`bg-slate-50 hover:bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white shadow-md"
                    : "border-slate-200/80 hover:border-emerald-300 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${getGradeBadge(prod.nutriScore)}`}>
                      {prod.nutriScore}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">NOVA {prod.novaScore}</span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 leading-tight line-clamp-1">{prod.productName}</h5>
                  <p className="text-[11px] text-slate-500 mb-2 truncate">{prod.brand}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">{prod.calories} kcal</span>
                  <span className="font-bold text-emerald-700">{prod.sugars}g sugar</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
