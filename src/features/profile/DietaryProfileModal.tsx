"use client";

import React from "react";
import { X, Shield, Check, AlertTriangle } from "lucide-react";
import { NutriVisionAnalysis } from "@/shared/types/nutrivision";

export interface DietaryProfile {
  glutenFree: boolean;
  nutFree: boolean;
  lowSodium: boolean;
  diabeticFriendly: boolean;
  dairyFree: boolean;
  noSyntheticDyes: boolean;
}

interface DietaryProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DietaryProfile;
  onChangeProfile: (updated: DietaryProfile) => void;
  analysis: NutriVisionAnalysis;
}

export function DietaryProfileModal({
  isOpen,
  onClose,
  profile,
  onChangeProfile,
  analysis,
}: DietaryProfileModalProps) {
  if (!isOpen) return null;

  const toggle = (key: keyof DietaryProfile) => {
    onChangeProfile({
      ...profile,
      [key]: !profile[key],
    });
  };

  // Evaluate active product warnings based on profile
  const warnings: string[] = [];
  if (profile.glutenFree && analysis.allergens.some((a) => a.id === "gluten" && a.detected)) {
    warnings.push("Contains Gluten / Wheat");
  }
  if (profile.nutFree && analysis.allergens.some((a) => (a.id === "peanuts" || a.id === "tree_nuts") && a.detected)) {
    warnings.push("Contains Peanuts or Tree Nuts");
  }
  if (profile.dairyFree && analysis.allergens.some((a) => a.id === "dairy" && a.detected)) {
    warnings.push("Contains Dairy / Milk derivatives");
  }
  if (profile.lowSodium && analysis.sodium > 300) {
    warnings.push(`High Sodium (${analysis.sodium}mg exceeds your 300mg threshold)`);
  }
  if (profile.diabeticFriendly && analysis.sugars > 8) {
    warnings.push(`High Sugar (${analysis.sugars}g exceeds low-glycemic limit)`);
  }
  if (profile.noSyntheticDyes && analysis.additives.some((add) => add.riskLevel === "moderate" || add.riskLevel === "high")) {
    warnings.push("Contains synthetic coloring or high-risk food additives");
  }

  const profileOptions = [
    { key: "glutenFree" as const, label: "Gluten-Free / Celiac", icon: "🌾", desc: "Flags wheat, barley, and rye grains" },
    { key: "nutFree" as const, label: "Nut-Free (Peanuts & Tree Nuts)", icon: "🥜", desc: "Safe for nut-free school environments" },
    { key: "diabeticFriendly" as const, label: "Diabetic / Low Glycemic", icon: "🩸", desc: "Alerts when sugars exceed 8g per serving" },
    { key: "lowSodium" as const, label: "Low Sodium / Heart Healthy", icon: "❤️", desc: "Alerts when sodium exceeds 300mg" },
    { key: "dairyFree" as const, label: "Dairy-Free / Vegan", icon: "🥛", desc: "Flags milk powder, whey, and casein" },
    { key: "noSyntheticDyes" as const, label: "Zero Synthetic Dyes & BHT", icon: "🎨", desc: "Flags Red 40, Yellow 5, and synthetic preservatives" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Personalized Dietary Profile</h3>
              <p className="text-xs text-slate-500">Set your medical & lifestyle dietary filters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Active Product Evaluation Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Check: {analysis.productName}
            </span>

            {warnings.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mt-1">
                <Check size={16} className="text-emerald-600" />
                <span>100% Compatible with your active dietary profile.</span>
              </div>
            ) : (
              <div className="space-y-1 mt-1.5">
                <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold">
                  <AlertTriangle size={15} />
                  <span>{warnings.length} Dietary Conflict{warnings.length > 1 ? "s" : ""} Detected:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-rose-600 pl-1 space-y-0.5 font-medium">
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Toggleable Options */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Select Dietary Filters:</span>
            {profileOptions.map((opt) => {
              const isActive = profile[opt.key];

              return (
                <div
                  key={opt.key}
                  onClick={() => toggle(opt.key)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40"
                      : "bg-white hover:bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.desc}</div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isActive ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                    }`}
                  >
                    {isActive && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {Object.values(profile).filter(Boolean).length} filters active
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Apply Profile
          </button>
        </div>
      </div>
    </div>
  );
}
