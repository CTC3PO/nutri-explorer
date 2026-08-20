"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { HOUSEHOLD_PRODUCTS, COUNTRY_INTELLIGENCE, CountryIntelligence } from "@/lib/mock-data";
import { NutriVisionAnalysis } from "@/shared/types/nutrivision";
import { VisualGroundingCanvas } from "@/features/scanner/VisualGroundingCanvas";
import { NutriScoreGauge } from "@/features/nutrition/NutriScoreGauge";
import { KnowledgeGraphPanel } from "@/features/safety/KnowledgeGraphPanel";
import { ProductSwapList } from "@/features/recommendations/ProductSwapList";
import { ReformulationLab } from "@/features/producer/ReformulationLab";
import { MarketingVsReality } from "@/features/claims/MarketingVsReality";
import { ProductDeconstructionView } from "@/features/deconstruction/ProductDeconstructionView";
import { DietaryProfileModal, DietaryProfile } from "@/features/profile/DietaryProfileModal";
import { ComparisonModal } from "@/features/comparison/ComparisonModal";
import { 
  Layers, 
  Scan, 
  FlaskConical, 
  Globe2, 
  Scale, 
  Search, 
  Upload, 
  Printer, 
  Shield, 
  Sun, 
  X, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

type MainTab = "deconstruction" | "shopper" | "producer" | "country_markets" | "comparison";

export default function NutriVisionWorkbench() {
  // 1. Core Product & Tab State (Default: 'deconstruction' / Inside the Box)
  const initialProduct = HOUSEHOLD_PRODUCTS.us_nutella || HOUSEHOLD_PRODUCTS.us_honeycrisp_apple || Object.values(HOUSEHOLD_PRODUCTS)[0];
  const [analysis, setAnalysis] = useState<NutriVisionAnalysis>(initialProduct);
  const [activeProductKey, setActiveProductKey] = useState<string>("us_nutella");
  const [activeTab, setActiveTab] = useState<MainTab>("deconstruction");

  // Search & Global State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [comparisonList, setComparisonList] = useState<NutriVisionAnalysis[]>([
    HOUSEHOLD_PRODUCTS.us_honeycrisp_apple,
    HOUSEHOLD_PRODUCTS.us_froot_loops,
    HOUSEHOLD_PRODUCTS.us_nutella,
  ].filter(Boolean));

  // Country Market Tab State
  const [selectedCountryMarket, setSelectedCountryMarket] = useState<string>("United States");
  const [countryCategoryFilter, setCountryCategoryFilter] = useState<string>("ALL");

  // User Dietary Profile State
  const [dietaryProfile, setDietaryProfile] = useState<DietaryProfile>({
    glutenFree: false,
    nutFree: false,
    lowSodium: false,
    diabeticFriendly: false,
    dairyFree: false,
    noSyntheticDyes: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const productList = useMemo(() => {
    return Object.entries(HOUSEHOLD_PRODUCTS).map(([key, item]) => ({
      key,
      ...item,
    }));
  }, []);

  const iconicPresets = [
    { key: "us_nutella", name: "Nutella Spread", grade: "E", icon: "🌰", tag: "56% Sugar" },
    { key: "us_froot_loops", name: "Froot Loops", grade: "D", icon: "🥣", tag: "Ultra-Processed" },
    { key: "es_barilla_pesto", name: "Barilla Pesto", grade: "C", icon: "🫒", tag: "High Sodium" },
    { key: "se_oatly_barista", name: "Oatly Barista", grade: "B", icon: "🥛", tag: "Plant-Based" },
    { key: "us_quaker_oats", name: "Rolled Oats", grade: "A", icon: "🥣", tag: "Beta-Glucan" },
    { key: "us_honeycrisp_apple", name: "Honeycrisp Apple", grade: "A", icon: "🍎", tag: "100% Whole Food" },
  ];

  const handleSelectProduct = (key: string) => {
    setActiveProductKey(key);
    setSelectedBoxId(null);
    setShowSearchDropdown(false);
    if (HOUSEHOLD_PRODUCTS[key]) {
      setAnalysis(HOUSEHOLD_PRODUCTS[key]);
    }
  };

  // Toggle current product in comparison tray
  const handleToggleCompare = (itemToCompare: NutriVisionAnalysis) => {
    setComparisonList((prev) => {
      const exists = prev.some((p) => p.productName === itemToCompare.productName && p.brand === itemToCompare.brand);
      if (exists) {
        return prev.filter((p) => p.productName !== itemToCompare.productName || p.brand !== itemToCompare.brand);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], itemToCompare];
      }
      return [...prev, itemToCompare];
    });
  };

  const handleRemoveFromCompare = (index: number) => {
    setComparisonList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const isCurrentInComparison = comparisonList.some(
    (p) => p.productName === analysis.productName && p.brand === analysis.brand
  );

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard Shortcut (CMD+K or / to focus search)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSearchDropdown(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Unified Search API & Local Lookup
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearchingApi(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load product by ID/Barcode
  const handleSelectApiProduct = async (product: any) => {
    setIsSearchingApi(true);
    setShowSearchDropdown(false);
    try {
      const res = await fetch(`/api/product/${product.id}`);
      if (res.ok) {
        const data: NutriVisionAnalysis = await res.json();
        setAnalysis(data);
        setActiveProductKey(product.id);
        setSelectedBoxId(null);
      }
    } catch (err) {
      console.error("Failed to load product details:", err);
    } finally {
      setIsSearchingApi(false);
    }
  };

  // Interactive Swap Selection
  const handleSelectSwap = async (swap: any) => {
    const strippedKey = swap.id?.replace(/^swap-/, "").replace(/-\d+$/, "");
    if (strippedKey && HOUSEHOLD_PRODUCTS[strippedKey]) {
      handleSelectProduct(strippedKey);
      return;
    }

    const localMatch = Object.keys(HOUSEHOLD_PRODUCTS).find((k) => {
      const p = HOUSEHOLD_PRODUCTS[k];
      return (
        p.productName.toLowerCase() === swap.name?.toLowerCase() ||
        (p.brand.toLowerCase() === swap.brand?.toLowerCase() &&
          p.productName.toLowerCase().includes(swap.name?.toLowerCase()))
      );
    });

    if (localMatch) {
      handleSelectProduct(localMatch);
      return;
    }

    try {
      setIsSearchingApi(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(swap.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          await handleSelectApiProduct(data.products[0]);
        }
      }
    } catch (e) {
      console.error("Failed to select swap:", e);
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Scanning failed");
      const data: NutriVisionAnalysis = await res.json();
      setAnalysis(data);
      setActiveProductKey("custom");
      setSelectedBoxId(null);
    } catch (err) {
      console.error(err);
      setAnalysis(initialProduct);
    } finally {
      setIsScanning(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const activeFiltersCount = Object.values(dietaryProfile).filter(Boolean).length;

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

  const activeCountryData = useMemo(() => {
    return COUNTRY_INTELLIGENCE.find((c) => c.country === selectedCountryMarket) || COUNTRY_INTELLIGENCE[0];
  }, [selectedCountryMarket]);

  const countryProducts = useMemo(() => {
    return productList.filter((p: any) => {
      const matchesCountry = p.country === selectedCountryMarket;
      const matchesCat = countryCategoryFilter === "ALL" || p.category === countryCategoryFilter;
      return matchesCountry && matchesCat;
    });
  }, [productList, selectedCountryMarket, countryCategoryFilter]);

  return (
    <div className="min-h-screen bg-[#EEF2F6] p-3 sm:p-6 lg:p-8 flex items-center justify-center font-sans antialiased text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Dietary Profile Modal */}
      <DietaryProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={dietaryProfile}
        onChangeProfile={setDietaryProfile}
        analysis={analysis}
      />

      {/* Product Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        products={comparisonList}
        onRemoveProduct={handleRemoveFromCompare}
        onSelectActive={(p) => setAnalysis(p)}
      />

      {/* Main Mac-Style Window Frame */}
      <div className="w-full max-w-[1440px] bg-[#F8FAFC] rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* 1. TOP APP BAR (Decluttered & Clean)                                     */}
        {/* ========================================================================= */}
        <header className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Window Dots & App Brand */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">NutriVision AI</h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md hidden sm:inline">
                  Food Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Bar (Instant Search across Catalog & 3.2M OFF) */}
          <div className="flex-1 max-w-lg relative" ref={searchContainerRef}>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                {isSearchingApi ? (
                  <Loader2 size={14} className="text-emerald-600 animate-spin" />
                ) : (
                  <Search size={14} className="text-slate-400" />
                )}
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search food, brand, or barcode (e.g. Nutella, Oatly, 7622210449283)..."
                value={searchQuery}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-1.5 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all font-medium"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                {searchQuery ? (
                  <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* Live Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in duration-150 max-h-[360px] flex flex-col">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Results ({searchResults.length})</span>
                  <span className="text-[10px] text-slate-400">Click to load</span>
                </div>
                <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectApiProduct(item)}
                      className="px-3 py-2 hover:bg-emerald-50/60 flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.brand || "Open Food Facts"} • {item.category || "Food"}
                        </div>
                      </div>
                      <span className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center shrink-0 ${getGradeBadge(item.nutri_score)}`}>
                        {item.nutri_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleCompare(analysis)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isCurrentInComparison
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Scale size={13} />
              <span>{isCurrentInComparison ? "Pinned" : "+ Compare"}</span>
              {comparisonList.length > 0 && (
                <span className="ml-0.5 px-1 py-0.2 rounded bg-black/15 text-[10px] font-mono">
                  {comparisonList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeFiltersCount > 0
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Shield size={13} className={activeFiltersCount > 0 ? "text-emerald-600" : "text-slate-400"} />
              <span className="hidden sm:inline">Dietary Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={triggerUpload}
              disabled={isScanning}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Upload size={12} />
              <span className="hidden md:inline">Scan Label</span>
            </button>

            <button
              onClick={() => window.print()}
              title="Print Dossier"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors hidden sm:flex"
            >
              <Printer size={13} />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. ACTIVE PRODUCT HERO STRIP & PRESET CHIPS                              */}
        {/* ========================================================================= */}
        <div className="px-6 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
          {/* Active Product Summary Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Currently Inspecting:</span>
              <span className="text-xs font-black text-slate-900">{analysis.productName}</span>
              <span className="text-[11px] text-slate-500 font-medium">({analysis.brand})</span>
              <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shadow-xs ${getGradeBadge(analysis.nutriScore)}`}>
                {analysis.nutriScore}
              </span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                NOVA {analysis.novaScore}
              </span>
            </div>
          </div>

          {/* Quick 1-Click Iconic Presets Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Popular Presets:
            </span>
            {iconicPresets.map((item) => {
              const isSelected = activeProductKey === item.key || analysis.productName.includes(item.name);
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelectProduct(item.key)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${getGradeBadge(item.grade)}`}>
                    {item.grade}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DISTINCT FEATURE TABS (Clean Swiss Structure like _6_zoning)           */}
        {/* ========================================================================= */}
        <nav className="px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1">
            {/* Tab 1: Inside the Box (MAIN FEATURE) */}
            <button
              onClick={() => setActiveTab("deconstruction")}
              className={`py-3.5 px-4 text-xs font-black transition-all flex items-center gap-2 border-b-2 relative ${
                activeTab === "deconstruction"
                  ? "text-indigo-600 border-indigo-600 font-black bg-indigo-50/40"
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Layers size={15} className={activeTab === "deconstruction" ? "text-indigo-600" : "text-slate-400"} />
              <span>🔬 Inside the Box (X-Ray)</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                Main
              </span>
            </button>

            {/* Tab 2: Shopper Scanner */}
            <button
              onClick={() => setActiveTab("shopper")}
              className={`py-3.5 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 relative ${
                activeTab === "shopper"
                  ? "text-emerald-700 border-emerald-600 font-black bg-emerald-50/40"
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Scan size={15} className={activeTab === "shopper" ? "text-emerald-600" : "text-slate-400"} />
              <span>🏷️ Shopper Scanner & Claims</span>
            </button>

            {/* Tab 3: Reformulation Lab */}
            <button
              onClick={() => setActiveTab("producer")}
              className={`py-3.5 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 relative ${
                activeTab === "producer"
                  ? "text-purple-700 border-purple-600 font-black bg-purple-50/40"
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FlaskConical size={15} className={activeTab === "producer" ? "text-purple-600" : "text-slate-400"} />
              <span>🧪 Reformulation Lab</span>
            </button>

            {/* Tab 4: Global Country Markets */}
            <button
              onClick={() => setActiveTab("country_markets")}
              className={`py-3.5 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 relative ${
                activeTab === "country_markets"
                  ? "text-blue-700 border-blue-600 font-black bg-blue-50/40"
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Globe2 size={15} className={activeTab === "country_markets" ? "text-blue-600" : "text-slate-400"} />
              <span>🌍 Country Markets (ML)</span>
            </button>

            {/* Tab 5: Side-by-Side Comparison */}
            <button
              onClick={() => setActiveTab("comparison")}
              className={`py-3.5 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 relative ${
                activeTab === "comparison"
                  ? "text-amber-700 border-amber-600 font-black bg-amber-50/40"
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Scale size={15} className={activeTab === "comparison" ? "text-amber-600" : "text-slate-400"} />
              <span>⚖️ Comparison ({comparisonList.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-medium text-slate-400 hidden xl:flex items-center gap-2">
            <span>Revised Nutri-Score 2024 Formula</span>
            <span>•</span>
            <span>Open Food Facts + World Bank</span>
          </div>
        </nav>

        {/* ========================================================================= */}
        {/* 4. TAB CONTENTS CONTAINER                                                 */}
        {/* ========================================================================= */}
        <main className="p-6 flex-1 min-h-[580px]">

          {/* TAB 1: INSIDE THE BOX (MAIN FEATURE) */}
          {activeTab === "deconstruction" && (
            <div className="animate-in fade-in duration-200">
              <ProductDeconstructionView
                analysis={analysis}
                onSelectProduct={handleSelectProduct}
              />
            </div>
          )}

          {/* TAB 2: SHOPPER SCANNER & CLAIMS */}
          {activeTab === "shopper" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-200">
              {/* Col 1: Visual Grounding Image */}
              <div>
                <VisualGroundingCanvas
                  productName={analysis.productName}
                  brand={analysis.brand}
                  imageUrl={analysis.imageUrl}
                  calories={analysis.calories}
                  sugars={analysis.sugars}
                  saturatedFat={analysis.saturatedFat}
                  sodium={analysis.sodium}
                  protein={analysis.protein}
                  boundingBoxes={analysis.boundingBoxes}
                  selectedBoxId={selectedBoxId}
                  onSelectBox={setSelectedBoxId}
                />
              </div>

              {/* Col 2: Nutri-Score Speedometer Gauge */}
              <div>
                <NutriScoreGauge
                  nutriScore={analysis.nutriScore}
                  nutriScoreRaw={analysis.nutriScoreRaw}
                  novaScore={analysis.novaScore}
                  novaDescription={analysis.novaDescription}
                  allergens={analysis.allergens}
                />
              </div>

              {/* Col 3: Claims Fact-Check & Healthier Swaps */}
              <div className="flex flex-col gap-6 justify-between">
                {analysis.claims && analysis.claims.length > 0 ? (
                  <MarketingVsReality
                    productName={analysis.productName}
                    claims={analysis.claims}
                  />
                ) : (
                  <KnowledgeGraphPanel
                    productName={analysis.productName}
                    ingredients={analysis.ingredients}
                    additives={analysis.additives}
                  />
                )}

                <ProductSwapList
                  swaps={analysis.recommendedSwaps}
                  onSelectSwap={handleSelectSwap}
                />
              </div>
            </div>
          )}

          {/* TAB 3: REFORMULATION LAB */}
          {activeTab === "producer" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-200">
              <div className="lg:col-span-2">
                <ReformulationLab
                  baseCalories={analysis.calories}
                  baseSugars={analysis.sugars}
                  baseSatFat={analysis.saturatedFat}
                  baseSodium={analysis.sodium}
                  baseProtein={analysis.protein}
                  baseFiber={analysis.fiber}
                />
              </div>
              <div>
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 h-full">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Product Baseline</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{analysis.productName}</h3>
                    <p className="text-xs text-slate-500">{analysis.brand} • Current Grade {analysis.nutriScore}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Calories:</span>
                      <span className="font-mono font-bold text-slate-800">{analysis.calories} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Sugars:</span>
                      <span className="font-mono font-bold text-rose-600">{analysis.sugars}g / 100g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Saturated Fat:</span>
                      <span className="font-mono font-bold text-amber-600">{analysis.saturatedFat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sodium:</span>
                      <span className="font-mono font-bold text-slate-800">{analysis.sodium}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Protein:</span>
                      <span className="font-mono font-bold text-emerald-600">{analysis.protein}g</span>
                    </div>
                  </div>

                  <div className="mt-auto p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900">
                    <strong className="block font-bold mb-1">Reformulation Target:</strong>
                    Lowering sugars by 40% shifts this recipe from <strong>Grade {analysis.nutriScore}</strong> to <strong>Grade B</strong>, qualifying for UK HFSS broadcast standards.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GLOBAL COUNTRY MARKETS (ML Notebook Findings) */}
          {activeTab === "country_markets" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Country Selector Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {COUNTRY_INTELLIGENCE.map((c) => {
                  const isSelected = selectedCountryMarket === c.country;
                  return (
                    <button
                      key={c.country}
                      onClick={() => setSelectedCountryMarket(c.country)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span>{c.country}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-black">
                        {c.adoptionScore.toFixed(0)} pts
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Country Health & Adoption Card */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-slate-800">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl">{activeCountryData.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black">{activeCountryData.country} Food Intelligence</h2>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {activeCountryData.adoptionCategory}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl">{activeCountryData.insights}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                    <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-right">
                      <span className="text-[10px] text-slate-400 block">Adoption Score</span>
                      <span className="font-mono font-black text-emerald-400 text-base">
                        {activeCountryData.adoptionScore.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-right">
                      <span className="text-[10px] text-slate-400 block">Obesity Rate</span>
                      <span className="font-mono font-black text-amber-400 text-base">
                        {activeCountryData.obesityPrevalence}%
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-right">
                      <span className="text-[10px] text-slate-400 block">GDP / Capita</span>
                      <span className="font-mono font-bold text-slate-200 text-base">
                        ${activeCountryData.gdpPerCapita.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-right">
                      <span className="text-[10px] text-slate-400 block">Food Quality</span>
                      <span className="font-mono font-bold text-sky-400 text-base">
                        {activeCountryData.nutriQualityIndex.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nutri-Score Distribution Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4 text-xs">
                  <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Grade Distribution ({activeCountryData.totalProducts.toLocaleString()} items analyzed):
                  </span>
                  <div className="flex-1 max-w-md h-2.5 rounded-full overflow-hidden bg-slate-800 flex gap-0.5">
                    <div style={{ width: `${activeCountryData.gradeDistribution.A}%` }} className="bg-emerald-500 h-full" title={`A: ${activeCountryData.gradeDistribution.A}%`} />
                    <div style={{ width: `${activeCountryData.gradeDistribution.B}%` }} className="bg-lime-500 h-full" title={`B: ${activeCountryData.gradeDistribution.B}%`} />
                    <div style={{ width: `${activeCountryData.gradeDistribution.C}%` }} className="bg-amber-400 h-full" title={`C: ${activeCountryData.gradeDistribution.C}%`} />
                    <div style={{ width: `${activeCountryData.gradeDistribution.D}%` }} className="bg-orange-500 h-full" title={`D: ${activeCountryData.gradeDistribution.D}%`} />
                    <div style={{ width: `${activeCountryData.gradeDistribution.E}%` }} className="bg-rose-500 h-full" title={`E: ${activeCountryData.gradeDistribution.E}%`} />
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Grade A: {activeCountryData.gradeDistribution.A}% • D/E: {(activeCountryData.gradeDistribution.D + activeCountryData.gradeDistribution.E).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Country Representative Products Grid */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Representative Products from {activeCountryData.country}
                    </h3>
                    <p className="text-xs text-slate-500">Curated authentic staples extracted from Open Food Facts</p>
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    {["ALL", "Breakfast & Cereals", "Sauces, Spreads & Pantry", "Dairy & Plant Alternatives", "Bars & Healthy Snacks"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCountryCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                          countryCategoryFilter === cat
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat === "ALL" ? "All Categories" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {countryProducts.map((prod: any) => {
                    const isSelected = analysis.productName === prod.productName;
                    return (
                      <div
                        key={prod.key}
                        onClick={() => {
                          handleSelectProduct(prod.key);
                          setActiveTab("deconstruction");
                        }}
                        className={`bg-slate-50 hover:bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-white"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${getGradeBadge(prod.nutriScore)}`}>
                              {prod.nutriScore}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">NOVA {prod.novaScore}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{prod.productName}</h4>
                          <p className="text-[11px] text-slate-500 truncate mb-2">{prod.brand}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">{prod.calories} kcal</span>
                          <span className="font-bold text-emerald-700">{prod.sugars}g sugar</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SIDE-BY-SIDE COMPARISON */}
          {activeTab === "comparison" && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Side-by-Side Product Comparison</h2>
                    <p className="text-xs text-slate-500">Compare nutrients and discover the healthier pick</p>
                  </div>
                  <button
                    onClick={() => setIsComparisonOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Open Fullscreen Modal
                  </button>
                </div>

                {comparisonList.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Scale size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No products in comparison tray yet.</p>
                    <p className="text-xs mt-1">Click "+ Compare" on any product to pin it for comparison.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparisonList.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center ${getGradeBadge(item.nutriScore)}`}>
                              {item.nutriScore}
                            </span>
                            <button
                              onClick={() => handleRemoveFromCompare(idx)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{item.productName}</h4>
                          <p className="text-xs text-slate-500 mb-3">{item.brand}</p>
                          <div className="space-y-2 text-xs border-t border-slate-200/80 pt-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Calories:</span>
                              <span className="font-mono font-bold text-slate-800">{item.calories} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Sugars:</span>
                              <span className="font-mono font-bold text-rose-600">{item.sugars}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Sat Fat:</span>
                              <span className="font-mono font-bold text-amber-600">{item.saturatedFat}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Sodium:</span>
                              <span className="font-mono font-bold text-slate-800">{item.sodium}mg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Protein:</span>
                              <span className="font-mono font-bold text-emerald-600">{item.protein}g</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAnalysis(item);
                            setActiveTab("deconstruction");
                          }}
                          className="mt-4 w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors"
                        >
                          Inspect Inside
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
