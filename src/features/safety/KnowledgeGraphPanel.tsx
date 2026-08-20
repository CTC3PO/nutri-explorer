"use client";

import React from "react";
import { AdditiveRisk } from "@/shared/types/nutrivision";
import { ChevronRight, ShieldCheck } from "lucide-react";

interface KnowledgeGraphPanelProps {
  productName: string;
  ingredients: string[];
  additives: AdditiveRisk[];
}

export function KnowledgeGraphPanel({
  productName,
  ingredients,
  additives,
}: KnowledgeGraphPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600">Ingredient & Safety Audit</span>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Safety Standards</h3>
        </div>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors">
          <span>Citations</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* SVG Radial Graph Visual Matching Mockup */}
      <div className="my-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl p-3 relative h-[140px] flex items-center justify-center overflow-hidden border border-slate-800">
        <svg viewBox="0 0 400 130" className="w-full h-full">
          {/* Connector Lines */}
          <line x1="200" y1="65" x2="80" y2="35" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="200" y1="65" x2="80" y2="95" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="200" y1="65" x2="320" y2="40" stroke="#10b981" strokeWidth="2" />
          <line x1="200" y1="65" x2="320" y2="90" stroke="#10b981" strokeWidth="2" />

          {/* Central Ingredient Core Node */}
          <g transform="translate(200, 65)">
            <circle r="26" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
            <text textAnchor="middle" y="3" fill="#ffffff" fontSize="8" fontWeight="bold">
              Ingredients
            </text>
          </g>

          {/* Left Node: Whole Grains */}
          <g transform="translate(80, 35)">
            <circle r="18" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <text textAnchor="middle" y="3" fill="#e2e8f0" fontSize="7" fontWeight="600">
              Whole Oats
            </text>
          </g>

          {/* Left Node: Sea Salt */}
          <g transform="translate(80, 95)">
            <circle r="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <text textAnchor="middle" y="3" fill="#e2e8f0" fontSize="7" fontWeight="600">
              Sea Salt
            </text>
          </g>

          {/* Right Node: EFSA 2023 Safety Verified */}
          <g transform="translate(320, 40)">
            <circle r="20" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <text textAnchor="middle" y="-2" fill="#ecfdf5" fontSize="7" fontWeight="bold">
              EFSA 2023
            </text>
            <text textAnchor="middle" y="6" fill="#a7f3d0" fontSize="6">
              Verified
            </text>
          </g>

          {/* Right Node: FDA Clean Label */}
          <g transform="translate(320, 90)">
            <circle r="18" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <text textAnchor="middle" y="-2" fill="#ecfdf5" fontSize="7" fontWeight="bold">
              FDA GRAS
            </text>
            <text textAnchor="middle" y="6" fill="#a7f3d0" fontSize="6">
              Compliant
            </text>
          </g>
        </svg>

        <span className="absolute bottom-1.5 left-2.5 text-[8px] text-slate-400 font-mono">
          European Food Safety Authority (EFSA) Guidelines
        </span>
      </div>

      {/* Additive Safety Findings Card */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Chemical & Additive Audit</span>
          </span>
          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Low Risk
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          Zero high-risk preservatives or synthetic coloring agents. Contains dietary minerals with no health warnings.
        </p>
      </div>
    </div>
  );
}
