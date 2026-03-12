"use client";

import { useState, useEffect } from 'react';
import { Clock, PackageSearch } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanHistoryItem {
  id: number;
  created_at: string;
  product_name: string;
  nutri_score: string;
  extraction_raw?: Record<string, unknown>;
}

const getNutriColor = (score: string) => {
  switch (score) {
    case 'A': return 'bg-nutri-a';
    case 'B': return 'bg-nutri-b';
    case 'C': return 'bg-nutri-c';
    case 'D': return 'bg-nutri-d';
    case 'E': return 'bg-nutri-e';
    default: return 'bg-slate-300';
  }
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('scan_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setHistory(data as ScanHistoryItem[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden pb-24">
      <div className="color-splash top-[-50px] left-[-100px] w-[350px] h-[350px] bg-sky-500 opacity-[0.03]" />

      <header className="px-6 pt-14 pb-6 z-10 relative">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Scan<span className="text-brand-500 font-medium">History</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Your recent label scans</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-500 shadow-sm border border-slate-100">
            <Clock size={18} />
          </div>
        </div>
      </header>

      <main className="px-6 space-y-3 z-10 relative">
        <AnimatePresence>
          {loading && (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && history.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                <PackageSearch className="text-slate-200" size={32} />
              </div>
              <p className="text-slate-400 font-medium text-sm">No scans yet.</p>
              <p className="text-slate-300 text-xs mt-1">Use the Scan tab to analyse your first label.</p>
            </motion.div>
          )}

          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div className={`${getNutriColor(item.nutri_score)} w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm shrink-0`}>
                {item.nutri_score}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">{item.product_name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.created_at)}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
}
