"use client";

import React, { useState, useMemo } from "react";
import { NutriVisionAnalysis, IngredientComponent } from "@/shared/types/nutrivision";
import { HOUSEHOLD_PRODUCTS } from "@/lib/mock-data";
import { Layers, ShieldCheck, AlertCircle, Info, Sparkles, Check, ArrowRight, Filter, Search } from "lucide-react";

interface ProductDeconstructionViewProps {
  analysis: NutriVisionAnalysis;
  onSelectProduct: (key: string) => void;
}

export function ProductDeconstructionView({
  analysis,
  onSelectProduct,
}: ProductDeconstructionViewProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");

  const ingredients: IngredientComponent[] = analysis.deconstructedIngredients || [];
  const activeIngredient = ingredients.find((i) => i.id === selectedIngredientId) || ingredients[0];

  const productList = useMemo(() => {
    return Object.entries(HOUSEHOLD_PRODUCTS).map(([key, item]) => ({
      key,
      ...item,
    }));
  }, []);

  const categories = [
    "ALL", 
    "Fresh Produce", 
    "Breakfast & Cereals", 
    "Dairy & Plant Alternatives", 
    "Bars & Healthy Snacks", 
    "Sauces, Spreads & Pantry"
  ];

  const filteredProducts = useMemo(() => {
    return productList.filter((prod: any) => {
      const matchCat = selectedCategory === "ALL" || prod.category === selectedCategory;
      const matchGrade = gradeFilter === "ALL" || prod.nutriScore === gradeFilter;
      return matchCat && matchGrade;
    });
  }, [productList, selectedCategory, gradeFilter]);

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
      {/* ===================================================================== */}
      {/* 1. HERO DECONSTRUCTION CARD: Proportional Ingredient Weight Stack     */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col gap-5">
        {/* Card Header: Product Identity & Nutritional Scoring */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                X-Ray Volumetric Deconstruction
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">• What are you actually eating?</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {analysis.productName} <span className="text-base font-normal text-slate-500 font-sans">({analysis.brand})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{analysis.category || "Packaged Grocery"} • {analysis.servingSize || "100g serving"}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700">
              <span className="text-slate-500 text-[11px]">Nutri-Score:</span>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-xs ${getGradeBadge(analysis.nutriScore)}`}>
                {analysis.nutriScore}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700">
              <span className="text-slate-500 text-[11px]">NOVA:</span>
              <span className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                {analysis.novaScore}
              </span>
            </div>
          </div>
        </div>

        {/* Proportional Stack Visual Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Layers size={15} className="text-indigo-600" />
              <span>Ingredient Weight Composition (% by Volume)</span>
            </span>
            <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
              Click any ingredient to inspect metabolic impact
            </span>
          </div>

          {/* Segmented Horizontal Stack Bar */}
          <div className="w-full h-10 bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner p-1 gap-1 border border-slate-200/60">
            {ingredients.map((ing) => {
              const isSelected = selectedIngredientId === ing.id || (!selectedIngredientId && activeIngredient?.id === ing.id);
              return (
                <div
                  key={ing.id}
                  onClick={() => setSelectedIngredientId(ing.id)}
                  style={{ width: `${Math.max(8, ing.percentage)}%` }}
                  title={`${ing.name}: ${ing.percentage}%`}
                  className={`${ing.color} h-full rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center text-[11px] font-black text-white px-1.5 truncate select-none ${
                    isSelected ? "ring-2 ring-offset-2 ring-slate-900 scale-y-105 shadow-md z-10" : "hover:opacity-90"
                  }`}
                >
                  {ing.percentage >= 8 && `${ing.percentage}%`}
                </div>
              );
            })}
          </div>

          {/* Legend Chips below bar */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {ingredients.map((ing) => {
              const isSelected = selectedIngredientId === ing.id || (!selectedIngredientId && activeIngredient?.id === ing.id);
              return (
                <button
                  key={ing.id}
                  onClick={() => setSelectedIngredientId(ing.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${ing.color}`} />
                  <span>{ing.name}</span>
                  <span className="font-mono text-[10px] opacity-75 font-semibold">({ing.percentage}%)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoomed-in Ingredient Detail Spotlight */}
        {activeIngredient && (
          <div className="mt-1 p-4.5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-indigo-100/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  Spotlight: {activeIngredient.name}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">{activeIngredient.percentage}% of Product</span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                  activeIngredient.processing === "Raw Whole Food"
                    ? "bg-emerald-100 text-emerald-800"
                    : activeIngredient.processing === "Minimally Processed"
                    ? "bg-lime-100 text-lime-800"
                    : activeIngredient.processing === "Processed Culinary"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {activeIngredient.processing}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                <strong>Metabolic Impact:</strong> {activeIngredient.metabolicImpact}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                <span>Agricultural Origin: <strong className="text-slate-800 font-semibold">{activeIngredient.origin}</strong></span>
              </div>
            </div>

            {activeIngredient.safetyNote && (
              <div className="px-3.5 py-2 bg-white rounded-xl border border-amber-200 shadow-xs text-xs text-amber-900 shrink-0 flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Note</span>
                  <span className="font-semibold">{activeIngredient.safetyNote}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. INGREDIENT DEEP-DIVE GRID                                          */}
      {/* ===================================================================== */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Ingredient Breakdown Cards ({ingredients.length} total components)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ing) => {
            const isSelected = selectedIngredientId === ing.id || (!selectedIngredientId && activeIngredient?.id === ing.id);
            return (
              <div
                key={ing.id}
                onClick={() => setSelectedIngredientId(ing.id)}
                className={`bg-white rounded-2xl border p-4.5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                    : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
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
                  <p className="text-xs text-slate-600 leading-snug mb-3 font-normal">
                    {ing.metabolicImpact}
                  </p>
                </div>

                {/* Card Bottom: Origin & Allergen Icon */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[180px]">{ing.origin}</span>
                  {ing.allergenIcon && (
                    <span className="text-xs bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md" title="Allergen Alert">
                      {ing.allergenIcon}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. FOOD EXPLORATION SPECTRUM GALLERY (Category & Grade Filters)       */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Food Spectrum Catalog</span>
            <h3 className="text-base font-bold text-slate-900">Explore & Switch Food Items ({filteredProducts.length} items)</h3>
          </div>

          {/* Grade Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            {["ALL", "A", "B", "C", "D", "E"].map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-2 py-0.8 rounded-lg font-bold transition-all ${
                  gradeFilter === g
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {g === "ALL" ? "All" : g}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat === "ALL" ? "All Food Categories" : cat}
            </button>
          ))}
        </div>

        {/* Food Items Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {filteredProducts.map((prod) => {
            const isCurrent = analysis.productName === prod.productName;
            return (
              <div
                key={prod.key}
                onClick={() => onSelectProduct(prod.key)}
                className={`bg-slate-50 hover:bg-white rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white shadow-md"
                    : "border-slate-200 hover:border-emerald-300 hover:shadow-xs"
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
