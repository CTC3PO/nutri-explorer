"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Globe, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const regionalData = [
  { region: 'NA', score: 3.2, obesity: 36, pop: 370 },
  { region: 'EU', score: 2.1, obesity: 23, pop: 447 },
  { region: 'LATAM', score: 3.8, obesity: 28, pop: 660 },
  { region: 'APAC', score: 1.9, obesity: 10, pop: 4300 },
];

const trendData = [
  { year: '2020', a: 15, c: 40, e: 45 },
  { year: '2022', a: 22, c: 45, e: 33 },
  { year: '2024', a: 35, c: 42, e: 23 },
  { year: '2026', a: 48, c: 38, e: 14 },
];

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'regions'>('trends');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden pb-24">
      {/* Ex-3 Color Splashes (Subtle) */}
      <div className="color-splash top-[-50px] right-[-100px] w-[350px] h-[350px] bg-indigo-500 opacity-[0.03]" />
      <div className="color-splash bottom-[100px] left-[-150px] w-[400px] h-[400px] bg-brand-500 opacity-[0.03]" />

      {/* Sleek Minimal Header */}
      <header className="px-6 pt-14 pb-6 z-10 relative">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Global<span className="text-brand-500 font-medium">Policy</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Macro Health Systems Analysis</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-500 shadow-sm border border-slate-100">
            <Globe size={18} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 z-10 relative">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Activity size={16} />
              <span className="text-[11px] font-medium uppercase tracking-wider">Avg Score</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">2.8</span>
              <span className="flex items-center text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <ArrowDownRight size={12} className="mr-0.5" /> 12%
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Users size={16} />
              <span className="text-[11px] font-medium uppercase tracking-wider">A-Tier Reach</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-900">48<span className="text-sm text-slate-400">%</span></span>
              <span className="flex items-center text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" /> 8%
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Dashboard Area */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          
          {/* Tabs */}
          <div className="flex p-1 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
            <button 
              onClick={() => setActiveTab('trends')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'trends' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Timeline
            </button>
            <button 
              onClick={() => setActiveTab('regions')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'regions' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Regional
            </button>
          </div>

          {/* Chart Content */}
          <div className="h-[240px] w-full">
            {activeTab === 'trends' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Market Distribution Shift</h3>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="a" name="Grade A (%)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorA)" />
                    <Area type="monotone" dataKey="e" name="Grade E (%)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorE)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Obesity Rate vs Nutri-Score</h3>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={regionalData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                    />
                    <Bar dataKey="obesity" name="Obesity (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        </div>

        {/* Detailed Insights List */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-slate-400 px-2 uppercase tracking-wider">Automated Insights</h3>
          
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex gap-4 items-start">
             <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500 shrink-0">
               <BarChart3 size={20} strokeWidth={2} />
             </div>
             <div>
               <h4 className="font-semibold text-slate-900 text-sm">LATAM Intervention Needed</h4>
               <p className="text-slate-500 text-xs mt-1 leading-relaxed">High correlation between 3.8 average product score and rising obesity markers. Recommended policy shift to front-of-pack labels.</p>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}

