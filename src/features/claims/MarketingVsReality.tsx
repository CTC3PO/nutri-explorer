"use client";

import React from "react";
import { AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";

export interface MarketingClaim {
  id: string;
  claim: string;
  verdict: "verified" | "misleading" | "exaggerated";
  reality: string;
  regulatoryStandard: string;
}

interface MarketingVsRealityProps {
  productName: string;
  claims: MarketingClaim[];
}

export function MarketingVsReality({ productName, claims }: MarketingVsRealityProps) {
  if (!claims || claims.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600">Package Claims vs. Reality</span>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Marketing Verification</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          FDA / EFSA Guidelines
        </span>
      </div>

      {/* Claim Cards */}
      <div className="space-y-2.5 my-3">
        {claims.map((item) => {
          const isVerified = item.verdict === "verified";
          const isMisleading = item.verdict === "misleading";

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                isVerified
                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                  : isMisleading
                  ? "bg-rose-50/50 border-rose-200 text-rose-950"
                  : "bg-amber-50/50 border-amber-200 text-amber-950"
              }`}
            >
              {/* Top Row: Claim & Verdict Badge */}
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  {isVerified ? (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  ) : isMisleading ? (
                    <XCircle size={15} className="text-rose-600 shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  )}
                  <span>Front Claim: &ldquo;{item.claim}&rdquo;</span>
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isVerified
                      ? "bg-emerald-100 text-emerald-800"
                      : isMisleading
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.verdict}
                </span>
              </div>

              {/* Reality Text */}
              <p className="text-[11px] text-slate-600 leading-snug pl-5">
                <strong className="text-slate-800">Reality:</strong> {item.reality}
              </p>

              {/* Regulatory Reference */}
              <span className="text-[10px] text-slate-400 font-mono pl-5">
                Standard: {item.regulatoryStandard}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Statutory Label Compliance</span>
        <span className="text-slate-600 font-medium">Fact-Checked</span>
      </div>
    </div>
  );
}
