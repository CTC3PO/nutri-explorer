"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Zap, ChevronLeft, Info, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanResult {
  productName?: string;
  brand?: string;
  grade: string;
  energy?: number;
  sugars?: number;
  saturatedFat?: number;
  sodium?: number;
  score?: number;
}

interface HistoryItem {
  id: number;
  product_name: string;
  nutri_score: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase
        .from('scan_history')
        .select('id, product_name, nutri_score, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => { if (data) setRecentScans(data as HistoryItem[]); });
    });
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const scanRes = await fetch("/api/scan", { method: "POST", body: formData });
      if (!scanRes.ok) throw new Error("Failed to scan label");
      const scanData = await scanRes.json();

      const predictRes = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanData),
      });
      if (!predictRes.ok) throw new Error("Failed to calculate score");
      const predictData = await predictRes.json();
      
      const fullResult = { ...scanData, ...predictData };
      setResult(fullResult);
      
      // Save to History (Non-blocking)
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.from('scan_history').insert([{
           product_name: fullResult.productName || 'Unknown Product',
           nutri_score: fullResult.grade,
           extraction_raw: fullResult
        }]).then(({ error }) => {
           if (error) console.error("Failed to save history:", error);
        });
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-nutri-a';
      case 'B': return 'bg-nutri-b';
      case 'C': return 'bg-nutri-c';
      case 'D': return 'bg-nutri-d';
      case 'E': return 'bg-nutri-e';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden pb-24">
      {/* Ex-3 Color Splashes (Subtle) */}
      <div className="color-splash top-[-100px] left-[-100px] w-[400px] h-[400px] bg-brand-500 opacity-[0.03]" />
      <div className="color-splash bottom-[100px] right-[-50px] w-[350px] h-[350px] bg-sky-500 opacity-[0.03]" />

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />

      {/* Sleek Minimal Header (Ex-1 style) */}
      <header className="px-6 pt-14 pb-6 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Nutri<span className="text-brand-500 font-medium">Scan</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Instant intel for your health</p>
          </div>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <Info size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-[340px] aspect-[4/5] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center bg-slate-50/50 m-2 rounded-2xl border border-slate-100/50 relative overflow-hidden">
                 {!isScanning && <Camera size={40} className="text-slate-300" />}

                 {isScanning && (
                   <motion.div 
                     initial={{ top: '0%' }}
                     animate={{ top: '100%' }}
                     transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                     className="absolute w-full h-[2px] bg-brand-500 shadow-[0_0_15px_#10b981] z-20"
                   />
                 )}
              </div>

              {!isScanning ? (
                <div className="px-6 py-8 text-center bg-white">
                  <p className="text-slate-800 font-medium text-lg">Snap a label</p>
                  <p className="text-slate-500 text-sm mt-1">We&apos;ll automatically extract the nutrition facts.</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-30">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 mb-4 animate-pulse">
                     <Zap size={24} />
                  </div>
                  <p className="text-slate-800 font-medium">Analyzing label...</p>
                </div>
              )}
              
              <button onClick={triggerUpload} className="absolute inset-0 z-40" />
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[400px] bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Product Details</span>
                  <h2 className="text-2xl font-semibold text-slate-900 leading-tight">{result.productName || "Product"}</h2>
                  <p className="text-brand-600 font-medium text-sm">{result.brand || "Information unavailable"}</p>
                </div>
                <div className={`${getGradeColor(result.grade)} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
                  {result.grade}
                </div>
              </div>

              {/* Minimal Nutri Stats */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <NutriStat label="Energy" value={`${result.energy} kJ`} />
                <NutriStat label="Sugars" value={`${result.sugars} g`} />
                <NutriStat label="Sat. Fat" value={`${result.saturatedFat} g`} />
                <NutriStat label="Sodium" value={`${result.sodium} mg`} />
              </div>

              <div className="space-y-3 relative z-10 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => setResult(null)}
                  className="w-full py-4 bg-slate-900 text-white font-medium rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
                >
                  <ChevronLeft size={18} /> Scan new item
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[340px] p-4 mt-6 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <AlertTriangle size={18} />
            {error}
          </motion.div>
        )}

        {/* Action Buttons */}
        {!result && (
          <div className="w-full max-w-[340px] space-y-4 pt-8">
            <button 
              onClick={triggerUpload}
              disabled={isScanning}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all text-white font-medium rounded-2xl shadow-sm disabled:opacity-50"
            >
              {isScanning ? "Processing..." : "Scan Product"}
            </button>
            <div className="flex gap-4">
               <button onClick={triggerUpload} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm">
                 <Upload size={16} /> Open Gallery
               </button>
            </div>
          </div>
        )}

        {/* Recent Scans Panel */}
        {recentScans.length > 0 && !result && (
          <div className="w-full max-w-[340px] mt-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock size={14} className="text-slate-400" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recent Scans</p>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {recentScans.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                      item.nutri_score === 'A' ? 'bg-nutri-a' :
                      item.nutri_score === 'B' ? 'bg-nutri-b' :
                      item.nutri_score === 'C' ? 'bg-nutri-c' :
                      item.nutri_score === 'D' ? 'bg-nutri-d' :
                      'bg-nutri-e'
                    }`}>
                      {item.nutri_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-400">{timeAgo(item.created_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NutriStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900 leading-none">{value}</p>
    </div>
  );
}

