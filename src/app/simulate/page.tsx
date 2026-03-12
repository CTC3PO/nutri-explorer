"use client";

import { useState } from 'react';
import { SlidersHorizontal, ArrowRight, Dna } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SimulatePage() {
  const [energy, setEnergy] = useState<number>(250);
  const [sugars, setSugars] = useState<number>(12);
  const [saturatedFat, setSaturatedFat] = useState<number>(3);
  const [sodium, setSodium] = useState<number>(0.8);
  const [fiber, setFiber] = useState<number>(2);
  const [protein, setProtein] = useState<number>(5);

  const calculateSimulatedScore = () => {
    // Very basic dummy calculation for visual feedback
    const badPoints = (energy / 335) + (sugars / 4.5) + (saturatedFat / 1) + (sodium / 0.09);
    const goodPoints = (fiber / 0.9) + (protein / 1.6);
    const score = badPoints - goodPoints;
    
    if (score <= -1) return 'A';
    if (score <= 2) return 'B';
    if (score <= 10) return 'C';
    if (score <= 18) return 'D';
    return 'E';
  };

  const simulatedScore = calculateSimulatedScore();

  const getNutriColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-nutri-a text-white';
      case 'B': return 'bg-nutri-b text-white';
      case 'C': return 'bg-nutri-c text-white';
      case 'D': return 'bg-nutri-d text-white';
      case 'E': return 'bg-nutri-e text-white';
      default: return 'bg-slate-300 text-slate-600';
    }
  };

  const calculateImpact = (currentScore: string) => {
    if (currentScore === 'A' || currentScore === 'B') {
      return { msg: 'Tier A/B Pass', color: 'text-emerald-500' };
    }
    if (currentScore === 'C') {
      return { msg: 'Borderline', color: 'text-amber-500' };
    }
    return { msg: 'High Risk', color: 'text-red-500' };
  };

  const impact = calculateImpact(simulatedScore);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden pb-24">
      {/* Ex-3 Color Splashes (Subtle) */}
      <div className="color-splash top-[-50px] left-[-100px] w-[350px] h-[350px] bg-brand-500 opacity-[0.03]" />
      <div className="color-splash bottom-[150px] right-[-100px] w-[350px] h-[350px] bg-sky-500 opacity-[0.03]" />

      {/* Sleek Minimal Header */}
      <header className="px-6 pt-14 pb-6 z-10 relative">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Recipe<span className="text-brand-500 font-medium">Lab</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Interactive Formulation Simulator</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-500 shadow-sm border border-slate-100">
            <Dna size={18} />
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6 z-10 relative">
        
        {/* Real-time Result Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Predicted Score</span>
            <div className={`font-bold mt-1 ${impact.color}`}>{impact.msg}</div>
          </div>
          <motion.div 
            key={simulatedScore}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${getNutriColor(simulatedScore)} w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-md transition-colors duration-300`}
          >
            {simulatedScore}
          </motion.div>
        </div>

        {/* Sliders Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
            <SlidersHorizontal size={18} className="text-slate-400" />
            <h3 className="font-semibold text-slate-700">Adjust Nutrients (per 100g)</h3>
          </div>

          {/* Energy Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-600">Energy (kcal)</label>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{energy}</span>
            </div>
            <input 
              type="range" min="0" max="900" step="10" 
              value={energy} onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-brand-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Sugars Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-600">Sugars (g)</label>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{sugars}</span>
            </div>
            <input 
              type="range" min="0" max="60" step="0.5" 
              value={sugars} onChange={(e) => setSugars(Number(e.target.value))}
              className="w-full accent-red-400 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Saturated Fat Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-600">Saturated Fat (g)</label>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{saturatedFat}</span>
            </div>
            <input 
              type="range" min="0" max="30" step="0.5" 
              value={saturatedFat} onChange={(e) => setSaturatedFat(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Sodium Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-600">Sodium (g)</label>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{sodium}</span>
            </div>
            <input 
              type="range" min="0" max="5" step="0.1" 
              value={sodium} onChange={(e) => setSodium(Number(e.target.value))}
              className="w-full accent-orange-400 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Fiber Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-emerald-600">Fiber (g) <span className="text-[10px] text-slate-400 font-normal ml-1">Improves score</span></label>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{fiber}</span>
            </div>
            <input 
              type="range" min="0" max="25" step="0.5" 
              value={fiber} onChange={(e) => setFiber(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Protein Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-emerald-600">Protein (g) <span className="text-[10px] text-slate-400 font-normal ml-1">Improves score</span></label>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{protein}</span>
            </div>
            <input 
              type="range" min="0" max="30" step="0.5" 
              value={protein} onChange={(e) => setProtein(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-2 pb-8">
          <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
            Save Recipe Profile
            <ArrowRight size={18} />
          </button>
        </div>

      </main>
    </div>
  );
}
