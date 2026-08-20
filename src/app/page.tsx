"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { HOUSEHOLD_PRODUCTS } from "@/lib/mock-data";
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
  Compass, 
  ScanLine, 
  Search, 
  Scale, 
  Upload, 
  Shield, 
  X, 
  Loader2, 
  FlaskConical,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Filter,
  Camera,
  Flame,
  Droplet,
  Info
} from "lucide-react";

type PwaTab = "explore" | "scan" | "search";

export default function NutriVisionWorkbench() {
  // 1. Core State
  const initialProduct = HOUSEHOLD_PRODUCTS.us_nutella || HOUSEHOLD_PRODUCTS.us_honeycrisp_apple || Object.values(HOUSEHOLD_PRODUCTS)[0];
  const [analysis, setAnalysis] = useState<NutriVisionAnalysis>(initialProduct);
  const [activeProductKey, setActiveProductKey] = useState<string>("us_nutella");
  const [activeTab, setActiveTab] = useState<PwaTab>("explore");

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState<boolean>(false);
  const [searchGradeFilter, setSearchGradeFilter] = useState<string>("ALL");
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<string>("ALL");

  // UI & Modals State
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [showReformulationInExplore, setShowReformulationInExplore] = useState<boolean>(false);
  const [comparisonList, setComparisonList] = useState<NutriVisionAnalysis[]>([
    HOUSEHOLD_PRODUCTS.us_honeycrisp_apple,
    HOUSEHOLD_PRODUCTS.us_froot_loops,
    HOUSEHOLD_PRODUCTS.us_nutella,
  ].filter(Boolean));

  // Dietary Profile State
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

  const iconicPresets = [
    { key: "us_nutella", name: "Nutella", grade: "E", icon: "🌰", tag: "56% Sugar" },
    { key: "us_froot_loops", name: "Froot Loops", grade: "D", icon: "🥣", tag: "Ultra-Processed" },
    { key: "es_barilla_pesto", name: "Barilla Pesto", grade: "C", icon: "🫒", tag: "High Sodium" },
    { key: "se_oatly_barista", name: "Oatly Barista", grade: "B", icon: "🥛", tag: "Plant-Based" },
    { key: "us_quaker_oats", name: "Rolled Oats", grade: "A", icon: "🥣", tag: "Beta-Glucan" },
    { key: "us_honeycrisp_apple", name: "Honeycrisp", grade: "A", icon: "🍎", tag: "Whole Food" },
  ];

  const handleSelectProduct = (key: string) => {
    setActiveProductKey(key);
    setSelectedBoxId(null);
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

  // Global Keyboard Shortcut (CMD+K or / to open Search tab)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setActiveTab("search");
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live Multi-Strategy Search Execution
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      // Default populate with local staples
      const list = Object.entries(HOUSEHOLD_PRODUCTS).map(([key, item]: [string, any]) => ({
        id: key,
        name: item.productName,
        brand: item.brand,
        category: item.category || "Food",
        nutri_score: item.nutriScore,
        energy: item.calories,
        sugars: item.sugars,
        saturated_fat: item.saturatedFat,
        sodium: item.sodium,
        image_url: item.imageUrl,
      }));
      setSearchResults(list);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearchingApi(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load product into active view and switch to Explore
  const handleSelectSearchedProduct = async (product: any) => {
    setIsSearchingApi(true);
    try {
      if (HOUSEHOLD_PRODUCTS[product.id]) {
        handleSelectProduct(product.id);
        setActiveTab("explore");
        return;
      }

      const res = await fetch(`/api/product/${product.id}`);
      if (res.ok) {
        const data: NutriVisionAnalysis = await res.json();
        setAnalysis(data);
        setActiveProductKey(product.id);
        setSelectedBoxId(null);
        setActiveTab("explore");
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
      setActiveTab("explore");
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
      setActiveTab("explore");
      return;
    }

    try {
      setIsSearchingApi(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(swap.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          await handleSelectSearchedProduct(data.products[0]);
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
    setActiveTab("scan");
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

  const filteredSearchResults = useMemo(() => {
    return searchResults.filter((p) => {
      const matchGrade = searchGradeFilter === "ALL" || p.nutri_score === searchGradeFilter;
      const matchCat = searchCategoryFilter === "ALL" || (p.category && p.category.toLowerCase().includes(searchCategoryFilter.toLowerCase()));
      return matchGrade && matchCat;
    });
  }, [searchResults, searchGradeFilter, searchCategoryFilter]);

  return (
    <div className="min-h-screen bg-[#F0F3F7] p-2 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
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
        onSelectActive={(p) => {
          setAnalysis(p);
          setActiveTab("explore");
        }}
      />

      {/* Main PWA Window Frame */}
      <div className="w-full max-w-[1440px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* 1. TOP PWA APP HEADER                                                     */}
        {/* ========================================================================= */}
        <header className="px-6 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
          {/* Brand & App Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-black text-xl">
              🥗
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">NutriVision</h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  PWA Food Explorer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Inside the Box • Real Images • 3.2M Food Database</p>
            </div>
          </div>

          {/* Quick Utility Controls: Compare Tray & Dietary Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComparisonOpen(true)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                comparisonList.length > 0
                  ? "bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Scale size={14} className={comparisonList.length > 0 ? "text-amber-600" : "text-slate-400"} />
              <span>Compare Tray</span>
              {comparisonList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black font-mono">
                  {comparisonList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeFiltersCount > 0
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Shield size={14} className={activeFiltersCount > 0 ? "text-emerald-600" : "text-slate-400"} />
              <span className="hidden sm:inline">Dietary Safeguards</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. PROMINENT 3-PILLAR PWA TABS (Explore • Scan • Search)                   */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          {/* Big Segmented Tab Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl w-full sm:w-auto shadow-inner">
            {/* Tab 1: Explore (Flagship / Inside the Box) */}
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2.5 ${
                activeTab === "explore"
                  ? "bg-white text-indigo-700 shadow-md ring-1 ring-black/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Compass size={17} className={activeTab === "explore" ? "text-indigo-600 animate-pulse" : "text-slate-400"} />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">🧭 Explore Food</span>
                <span className="text-[10px] text-slate-400 font-medium hidden md:block">Inside the Box & Nutrition</span>
              </div>
            </button>

            {/* Tab 2: Scan Label */}
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2.5 ${
                activeTab === "scan"
                  ? "bg-white text-emerald-700 shadow-md ring-1 ring-black/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <ScanLine size={17} className={activeTab === "scan" ? "text-emerald-600" : "text-slate-400"} />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">📸 Scan Label</span>
                <span className="text-[10px] text-slate-400 font-medium hidden md:block">Vision & Claims Truth</span>
              </div>
            </button>

            {/* Tab 3: Search Database */}
            <button
              onClick={() => {
                setActiveTab("search");
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2.5 ${
                activeTab === "search"
                  ? "bg-white text-blue-700 shadow-md ring-1 ring-black/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Search size={17} className={activeTab === "search" ? "text-blue-600" : "text-slate-400"} />
              <div className="text-left leading-tight">
                <span className="block text-xs font-black">🔍 Search 3.2M</span>
                <span className="text-[10px] text-slate-400 font-medium hidden md:block">Global Live Products</span>
              </div>
            </button>
          </div>

          {/* Quick 1-Click Iconic Presets Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden lg:inline">
              Staples:
            </span>
            {iconicPresets.map((item) => {
              const isSelected = activeProductKey === item.key || analysis.productName.includes(item.name);
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    handleSelectProduct(item.key);
                    setActiveTab("explore");
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
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
        {/* 3. MAIN PWA VIEWPORT CONTAINER                                            */}
        {/* ========================================================================= */}
        <main className="p-4 sm:p-6 bg-[#F8FAFC] min-h-[640px] flex-1">

          {/* ===================================================================== */}
          {/* TAB 1: EXPLORE (INSIDE THE BOX & NUTRITIONAL ANATOMY)                 */}
          {/* ===================================================================== */}
          {activeTab === "explore" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Product Header Pill & Quick Reformulation Switch */}
              <div className="flex items-center justify-between pb-1 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Currently Analyzing:</span>
                  <span className="text-sm font-black text-slate-900">{analysis.productName}</span>
                  <span className="text-xs text-slate-500 font-medium">({analysis.brand})</span>
                  <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shadow-xs ${getGradeBadge(analysis.nutriScore)}`}>
                    {analysis.nutriScore}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCompare(analysis)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isCurrentInComparison
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Scale size={13} />
                    <span>{isCurrentInComparison ? "In Compare Tray" : "+ Add to Compare"}</span>
                  </button>

                  <button
                    onClick={() => setShowReformulationInExplore(!showReformulationInExplore)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      showReformulationInExplore
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    <FlaskConical size={13} />
                    <span>{showReformulationInExplore ? "Hide Reformulation Lab" : "🧪 Test Recipe Reformulation"}</span>
                  </button>
                </div>
              </div>

              {/* Recipe Reformulation Overlay (if toggled) */}
              {showReformulationInExplore && (
                <div className="p-6 bg-white rounded-3xl border border-purple-200 shadow-lg animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-100">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <FlaskConical size={18} className="text-purple-600" />
                        <span>Interactive Recipe Reformulation Simulator</span>
                      </h3>
                      <p className="text-xs text-slate-500">Simulate sugar/sodium reductions to improve Nutri-Score grade in real time</p>
                    </div>
                    <button
                      onClick={() => setShowReformulationInExplore(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <ReformulationLab
                    baseCalories={analysis.calories}
                    baseSugars={analysis.sugars}
                    baseSatFat={analysis.saturatedFat}
                    baseSodium={analysis.sodium}
                    baseProtein={analysis.protein}
                    baseFiber={analysis.fiber}
                  />
                </div>
              )}

              {/* Primary Volumetric Deconstruction View */}
              <ProductDeconstructionView
                analysis={analysis}
                onSelectProduct={(key) => handleSelectProduct(key)}
              />
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: SCAN (LABEL SCANNER & CLAIMS TRUTH)                            */}
          {/* ===================================================================== */}
          {activeTab === "scan" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Scan Upload CTA Hero */}
              <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex items-center justify-between gap-6 flex-wrap">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Camera size={18} className="text-emerald-400" />
                    <h2 className="text-lg font-black tracking-tight">Package Label Scanner & Visual Fact-Check</h2>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Upload or snap any packaged grocery food label. Our system extracts the nutrition facts table, verifies marketing claims against statutory regulations, and suggests healthier alternatives.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={triggerUpload}
                    disabled={isScanning}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analyzing Packaging...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload Product Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3-Column Scanner Workbench */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Col 1: Verified Real Image Grounding Canvas */}
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

                {/* Col 2: Speedometer Gauge & Score Drivers */}
                <div>
                  <NutriScoreGauge
                    nutriScore={analysis.nutriScore}
                    nutriScoreRaw={analysis.nutriScoreRaw}
                    novaScore={analysis.novaScore}
                    novaDescription={analysis.novaDescription}
                    allergens={analysis.allergens}
                    sugarCarbRatio={analysis.sugarCarbRatio}
                    positiveScoreDrivers={analysis.positiveScoreDrivers}
                    negativeScoreDrivers={analysis.negativeScoreDrivers}
                  />
                </div>

                {/* Col 3: Marketing Claims & Healthier Swaps */}
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
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: SEARCH (IMMERSIVE 3.2M GLOBAL PRODUCT DISCOVERY)               */}
          {/* ===================================================================== */}
          {activeTab === "search" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Search Hero Header & Big Input */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Search size={22} className="text-blue-600" />
                    <span>Search Global Food & Grocery Products</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live query over 3.2 million products from Open Food Facts & verified staples. Search by brand name (e.g. <em>Pepsi</em>, <em>Oatly</em>, <em>Doritos</em>, <em>Cheerios</em>), food name, or barcode.
                  </p>
                </div>

                {/* Big Search Bar */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    {isSearchingApi ? (
                      <Loader2 size={18} className="text-blue-600 animate-spin" />
                    ) : (
                      <Search size={18} className="text-slate-400" />
                    )}
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search brand, food, or barcode (e.g. Pepsi, Doritos, Chobani, Oats)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter Pills: Grades & Popular Categories */}
                <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-100 text-xs">
                  {/* Grade Filters */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-400 text-[11px] uppercase mr-1">Grade:</span>
                    {["ALL", "A", "B", "C", "D", "E"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setSearchGradeFilter(g)}
                        className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                          searchGradeFilter === g
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {g === "ALL" ? "All Grades" : `Grade ${g}`}
                      </button>
                    ))}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {["ALL", "Sodas", "Cereals", "Dairy", "Snacks", "Produce", "Pantry"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSearchCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
                          searchCategoryFilter === cat
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat === "ALL" ? "All Categories" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Results Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
                  <span>
                    Showing <strong>{filteredSearchResults.length}</strong> matching products {searchQuery ? `for "${searchQuery}"` : "from curated library"}
                  </span>
                  <span className="text-[11px] text-slate-400">Click any card to inspect inside</span>
                </div>

                {filteredSearchResults.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                    <Search size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No products found</p>
                    <p className="text-xs mt-1">Try searching for a different brand like "pepsi", "lays", "oat", or "barilla".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredSearchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSearchedProduct(item)}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
                      >
                        <div>
                          {/* Card Top: Grade Badge & Brand */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shadow-xs ${getGradeBadge(item.nutri_score)}`}>
                              {item.nutri_score}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate max-w-[140px]">
                              {item.id}
                            </span>
                          </div>

                          {/* Product Image Thumbnail if Available */}
                          {item.image_url && (
                            <div className="w-full h-28 mb-3 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="max-h-full object-contain group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  // fallback if image fails
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {/* Product Name & Brand */}
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mb-3">{item.brand || "Open Food Facts"}</p>

                          {/* Nutrient Summary Pills */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2.5 border-t border-slate-100 text-slate-600">
                            <div className="flex justify-between">
                              <span>Energy:</span>
                              <span className="font-mono font-bold text-slate-800">{item.energy} kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sugars:</span>
                              <span className="font-mono font-bold text-rose-600">{item.sugars}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sat Fat:</span>
                              <span className="font-mono font-bold text-amber-600">{item.saturated_fat}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sodium:</span>
                              <span className="font-mono font-bold text-slate-800">{item.sodium}mg</span>
                            </div>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                          <span>Inspect Inside</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
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
