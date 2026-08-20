"use client";

import React from "react";
import { NutriVisionAnalysis } from "@/shared/types/nutrivision";
import { X, Scale, ArrowRight, Trophy, Sparkles, Check, Plus, Trash2 } from "lucide-react";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: NutriVisionAnalysis[];
  onRemoveProduct: (index: number) => void;
  onSelectActive: (product: NutriVisionAnalysis) => void;
}

export function ComparisonModal({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onSelectActive,
}: ComparisonModalProps) {
  if (!isOpen) return null;

  // Determine healthier pick based on Nutri-Score rank and sugar/fat
  const gradeRank: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  
  let bestIdx = 0;
  if (products.length > 1) {
    let highestScore = -999;
    products.forEach((p, idx) => {
      const gScore = (gradeRank[p.nutriScore] || 1) * 100 - (p.sugars * 2) - (p.saturatedFat * 3) - (p.sodium / 50);
      if (gScore > highestScore) {
        highestScore = gScore;
        bestIdx = idx;
      }
    });
  }

  const getBadgeClass = (grade: string) => {
    switch (grade) {
      case "A": return "bg-emerald-600 text-white";
      case "B": return "bg-lime-600 text-white";
      case "C": return "bg-amber-400 text-slate-900";
      case "D": return "bg-orange-500 text-white";
      case "E": return "bg-rose-600 text-white";
      default: return "bg-slate-300 text-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Side-by-Side Product Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Comparing {products.length} products on nutritional density, macros, and processing score
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {products.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Scale size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-sm">No products in comparison tray.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &ldquo;+ Compare&rdquo; on any product in the workbench or search dropdown.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((item, idx) => {
                const isWinner = products.length > 1 && idx === bestIdx;

                return (
                  <div
                    key={`${item.productName}-${idx}`}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                      isWinner
                        ? "bg-emerald-50/40 border-emerald-300 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-slate-50/70 border-slate-200 hover:bg-white"
                    }`}
                  >
                    {/* Winner Badge */}
                    {isWinner && (
                      <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Trophy size={11} />
                        <span>Healthier Pick</span>
                      </div>
                    )}

                    {/* Top Controls: Remove button */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">
                            🥣
                          </div>
                        )}
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">{item.brand}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveProduct(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remove from comparison"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Nutri-Score & NOVA Badges */}
                    <div className="flex items-center gap-2 py-3 border-y border-slate-200/60 my-2">
                      <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Nutri-Score
                        </span>
                        <span
                          className={`inline-block px-3 py-0.5 rounded-lg text-sm font-black shadow-2xs ${getBadgeClass(
                            item.nutriScore
                          )}`}
                        >
                          Grade {item.nutriScore}
                        </span>
                      </div>

                      <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          NOVA Group
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-900 text-white">
                          Group {item.novaScore}
                        </span>
                      </div>
                    </div>

                    {/* Nutritional Breakdown Table */}
                    <div className="space-y-1.5 text-xs text-slate-600 my-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Calories (100g):</span>
                        <span className="font-bold text-slate-900">{item.calories} kcal</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Sugars:</span>
                        <span className={`font-bold ${item.sugars > 15 ? "text-rose-600" : "text-emerald-700"}`}>
                          {item.sugars}g
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Saturated Fat:</span>
                        <span className={`font-bold ${item.saturatedFat > 5 ? "text-rose-600" : "text-slate-800"}`}>
                          {item.saturatedFat}g
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Sodium:</span>
                        <span className={`font-bold ${item.sodium > 400 ? "text-amber-600" : "text-slate-800"}`}>
                          {item.sodium}mg
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Protein:</span>
                        <span className="font-bold text-slate-900">{item.protein}g</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Fiber:</span>
                        <span className="font-bold text-emerald-700">{item.fiber}g</span>
                      </div>
                    </div>

                    {/* Bottom Action: Load into Workbench */}
                    <button
                      onClick={() => {
                        onSelectActive(item);
                        onClose();
                      }}
                      className="mt-4 w-full py-2 bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-300 hover:border-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs group"
                    >
                      <span>Load in Workbench</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Official Santé Publique France & NOVA Classification Criteria</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
