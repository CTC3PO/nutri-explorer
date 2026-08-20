"use client";

import React from "react";
import { Sparkles, Upload, Camera } from "lucide-react";

interface SampleSelectorProps {
  activeSampleKey: string | null;
  onSelectSample: (sampleKey: string) => void;
  onTriggerUpload: () => void;
  isScanning: boolean;
}

export function SampleSelector({
  activeSampleKey,
  onSelectSample,
  onTriggerUpload,
  isScanning,
}: SampleSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-3.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Label & Recruiter Chip */}
      <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
          <Sparkles size={12} /> Recruiter Presets
        </span>
        <span className="hidden sm:inline text-zinc-400">• Click to test VLM groundings:</span>
      </div>

      {/* Preset Action Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onSelectSample("oats")}
          disabled={isScanning}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSampleKey === "oats"
              ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          🥣 Oats (Grade A)
        </button>

        <button
          onClick={() => onSelectSample("granola_bar")}
          disabled={isScanning}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSampleKey === "granola_bar"
              ? "bg-lime-600 text-white shadow-sm ring-2 ring-lime-500/30"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          🥜 Snack Bar (Grade B)
        </button>

        <button
          onClick={() => onSelectSample("choco_cereal")}
          disabled={isScanning}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSampleKey === "choco_cereal"
              ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-500/30"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
        >
          🍫 Choco Puffs (Grade D • NOVA 4)
        </button>

        <button
          onClick={onTriggerUpload}
          disabled={isScanning}
          className="ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Upload size={12} />
          <span>Upload Custom</span>
        </button>
      </div>
    </div>
  );
}
