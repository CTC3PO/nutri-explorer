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
  Upload, 
  Sun, 
  ShoppingCart, 
  Sliders, 
  Shield, 
  Search, 
  Printer, 
  Layers, 
  Loader2, 
  Globe, 
  Database, 
  X,
  Scale,
  TrendingUp,
  Award,
  Activity,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";

export default function NutriVisionWorkbench() {
  const initialProduct = HOUSEHOLD_PRODUCTS.us_honeycrisp_apple || Object.values(HOUSEHOLD_PRODUCTS)[0];
  const [analysis, setAnalysis] = useState<NutriVisionAnalysis>(initialProduct);
  const [activeProductKey, setActiveProductKey] = useState<string>("us_honeycrisp_apple");
  const [activeMode, setActiveMode] = useState<"shopper" | "producer" | "deconstruction">("shopper");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [comparisonList, setComparisonList] = useState<NutriVisionAnalysis[]>([]);
  const [showCountryIntelBanner, setShowCountryIntelBanner] = useState<boolean>(true);
  
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

  const categories = ["ALL", "Fresh Produce", "Breakfast & Cereals", "Dairy & Plant Alternatives", "Bars & Healthy Snacks", "Sauces, Spreads & Pantry"];

  const activeCountryData = useMemo(() => {
    if (selectedCountry === "ALL") return null;
    return COUNTRY_INTELLIGENCE.find((c) => c.country === selectedCountry) || null;
  }, [selectedCountry]);

  const filteredProducts = useMemo(() => {
    return productList.filter((item: any) => {
      const matchesCountry = selectedCountry === "ALL" || (item.country && item.country === selectedCountry);
      const matchesGrade = selectedGradeFilter === "ALL" || item.nutriScore === selectedGradeFilter;
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCountry && matchesGrade && matchesCategory && matchesSearch;
    });
  }, [productList, selectedCountry, selectedGradeFilter, selectedCategory, searchQuery]);

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
        const catParam = selectedCategory !== "ALL" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}${catParam}`);
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
  }, [searchQuery, selectedCategory]);

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

      {/* Mac Window Double-Bezel Frame */}
      <div className="w-full max-w-[1440px] bg-[#F8FAFC] rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden relative">
        {/* Window Title Bar (Cleaned of legacy v1 links) */}
        <header className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Window Controls & App Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">NutriVision AI</h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md hidden sm:inline flex items-center gap-1">
                <Database size={11} /> Global OFF & World Bank ML
              </span>
            </div>
          </div>

          {/* Center: 3 Persona Narrative Modes */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setActiveMode("shopper")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === "shopper"
                  ? "bg-white text-emerald-700 shadow-sm font-black border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShoppingCart size={13} />
              <span>Shopper View</span>
            </button>

            <button
              onClick={() => setActiveMode("deconstruction")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === "deconstruction"
                  ? "bg-white text-indigo-700 shadow-sm font-black border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={13} />
              <span>Inside the Box</span>
            </button>

            <button
              onClick={() => setActiveMode("producer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === "producer"
                  ? "bg-white text-indigo-700 shadow-sm font-black border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sliders size={13} />
              <span>Producer Lab</span>
            </button>
          </div>

          {/* Right: Compare, Profile, Upload, Print, Light Mode */}
          <div className="flex items-center gap-2">
            {/* Compare Button */}
            <button
              onClick={() => handleToggleCompare(analysis)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isCurrentInComparison
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Scale size={13} />
              <span>{isCurrentInComparison ? "In Compare" : "+ Compare"}</span>
            </button>

            {/* Dietary Profile Filter Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeFiltersCount > 0
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Shield size={13} className={activeFiltersCount > 0 ? "text-emerald-600" : "text-slate-400"} />
              <span>Dietary Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Upload Photo Button */}
            <button
              onClick={triggerUpload}
              disabled={isScanning}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Upload size={12} />
              <span className="hidden md:inline">Upload Photo</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              title="Print Clinical Nutrition Dossier"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors hidden sm:flex"
            >
              <Printer size={13} />
            </button>

            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/60">
              <Sun size={12} className="text-amber-500" />
              <span className="hidden sm:inline">Light</span>
            </div>
          </div>
        </header>

        {/* COUNTRY MARKET SELECTOR & SEARCH BAR */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex flex-col gap-3.5 relative z-30">
          {/* Main Search Bar */}
          <div className="flex items-center gap-3 w-full" ref={searchContainerRef}>
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                {isSearchingApi ? (
                  <Loader2 size={16} className="text-emerald-600 animate-spin" />
                ) : (
                  <Search size={16} className="text-slate-400" />
                )}
              </div>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search across country catalog or 3,200,000 Open Food Facts global database (e.g., Cheerios, Oatly, Apples, 7622210449283)..."
                value={searchQuery}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 bg-white border-2 border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 shadow-sm font-medium transition-all"
              />

              {/* Right Search Controls / Clear & Keyboard Hint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowSearchDropdown(false);
                    }}
                    className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 rounded-md border border-slate-200">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Rich Live Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[460px] flex flex-col">
                  {/* Results Header */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe size={13} className="text-emerald-600" />
                      <span>Matching Products ({searchResults.length} found)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Click any product to analyze</span>
                  </div>

                  {/* Scrollable Product List */}
                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectApiProduct(item)}
                        className="px-4 py-2.5 hover:bg-emerald-50/50 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                              🥣
                            </div>
                          )}

                          <div className="truncate">
                            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{item.brand || "Open Food Facts"}</span>
                              <span>•</span>
                              <span className="text-slate-400">{item.category || "Food"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 pl-3">
                          <div className="text-right hidden sm:block text-xs">
                            <div className="font-bold text-slate-700">{item.energy} kcal</div>
                            <div className="text-[11px] text-slate-400">{item.sugars}g sugar</div>
                          </div>

                          <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shadow-xs ${getGradeBadge(item.nutri_score)}`}>
                            {item.nutri_score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nutri-Score Grade Filters (A ➔ E) */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs shrink-0">
              {["ALL", "A", "B", "C", "D", "E"].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGradeFilter(grade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGradeFilter === grade
                      ? "bg-slate-900 text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {grade === "ALL" ? "All Grades" : `Grade ${grade}`}
                </button>
              ))}
            </div>
          </div>

          {/* COUNTRY MARKETS SELECTOR (Linked to ML Notebook) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <Globe size={12} /> Country Market:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedCountry("ALL")}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  selectedCountry === "ALL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100"
                }`}
              >
                🌍 Global / All ({productList.length})
              </button>

              {COUNTRY_INTELLIGENCE.map((c) => {
                const isSelected = selectedCountry === c.country;
                return (
                  <button
                    key={c.country}
                    onClick={() => setSelectedCountry(c.country)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.country}</span>
                    <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-1 py-0.2 rounded font-bold">
                      {c.adoptionScore.toFixed(0)} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills & Results Meta */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-slate-200/50">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium hidden lg:block">
              Showing <strong>{filteredProducts.length}</strong> items in <strong>{selectedCountry === "ALL" ? "All Markets" : selectedCountry}</strong>
            </div>
          </div>
        </div>

        {/* COUNTRY INTELLIGENCE BANNER (Derived from ML Notebook & World Bank Integration) */}
        {activeCountryData && (
          <div className="px-6 py-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 transition-all">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeCountryData.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black tracking-tight">{activeCountryData.country} Food Intelligence</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                      {activeCountryData.adoptionCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{activeCountryData.insights}</p>
                </div>
              </div>

              {/* Stat Chips */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Adoption Suitability</div>
                  <div className="font-mono font-black text-emerald-400 text-sm">
                    {activeCountryData.adoptionScore.toFixed(1)} <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="text-right bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Adult Obesity</div>
                  <div className="font-mono font-black text-amber-400 text-sm">
                    {activeCountryData.obesityPrevalence}%
                  </div>
                </div>

                <div className="text-right bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs hidden md:block">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">GDP / Capita</div>
                  <div className="font-mono font-bold text-slate-200 text-sm">
                    ${activeCountryData.gdpPerCapita.toLocaleString()}
                  </div>
                </div>

                <div className="text-right bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs hidden lg:block">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Food Quality Index</div>
                  <div className="font-mono font-bold text-sky-400 text-sm">
                    {activeCountryData.nutriQualityIndex.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Nutri-Score Grade Breakdown Mini Bar */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-4 text-[11px] text-slate-300">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Nutri-Score Distribution ({activeCountryData.totalProducts.toLocaleString()} products):
              </span>
              <div className="flex items-center gap-1.5 flex-1 max-w-md h-2 rounded-full overflow-hidden bg-slate-800">
                <div style={{ width: `${activeCountryData.gradeDistribution.A}%` }} className="h-full bg-emerald-500" title={`Grade A: ${activeCountryData.gradeDistribution.A}%`} />
                <div style={{ width: `${activeCountryData.gradeDistribution.B}%` }} className="h-full bg-lime-500" title={`Grade B: ${activeCountryData.gradeDistribution.B}%`} />
                <div style={{ width: `${activeCountryData.gradeDistribution.C}%` }} className="h-full bg-amber-400" title={`Grade C: ${activeCountryData.gradeDistribution.C}%`} />
                <div style={{ width: `${activeCountryData.gradeDistribution.D}%` }} className="h-full bg-orange-500" title={`Grade D: ${activeCountryData.gradeDistribution.D}%`} />
                <div style={{ width: `${activeCountryData.gradeDistribution.E}%` }} className="h-full bg-rose-500" title={`Grade E: ${activeCountryData.gradeDistribution.E}%`} />
              </div>
              <span className="font-mono text-slate-400 text-[10px]">
                A: {activeCountryData.gradeDistribution.A}% • D/E: {(activeCountryData.gradeDistribution.D + activeCountryData.gradeDistribution.E).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Narrative Banner: Explains current scenario */}
        <div className="px-6 py-2.5 bg-white/80 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
          {activeMode === "shopper" ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                <strong>Shopper View:</strong> {analysis.productName} ({analysis.brand}) • Nutri-Score <strong>Grade {analysis.nutriScore}</strong> (NOVA {analysis.novaScore}) • Verified ingredients and healthier swaps.
              </span>
            </div>
          ) : activeMode === "deconstruction" ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>
                <strong>X-Ray Deconstruction:</strong> Visualizing ingredient weight percentages, processing stages, and metabolic impact inside {analysis.productName}.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>
                <strong>Producer Simulation:</strong> Recipe testing for {analysis.brand} • Adjust sugar and sodium levels to test score improvement before production.
              </span>
            </div>
          )}
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">Open Food Facts & World Bank ML Bridge</span>
        </div>

        {/* Main Content View (Switches between 3-Column Workbench and Deconstruction View) */}
        <main className="p-6 flex-1">
          {activeMode === "deconstruction" ? (
            <ProductDeconstructionView
              analysis={analysis}
              onSelectProduct={handleSelectProduct}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch h-full">
              {/* Column 1: Scanned Package Analysis */}
              <div className="h-full">
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

              {/* Column 2: Nutri-Score Gauge OR Producer Reformulation Lab */}
              <div className="h-full">
                {activeMode === "shopper" ? (
                  <NutriScoreGauge
                    nutriScore={analysis.nutriScore}
                    nutriScoreRaw={analysis.nutriScoreRaw}
                    novaScore={analysis.novaScore}
                    novaDescription={analysis.novaDescription}
                    allergens={analysis.allergens}
                  />
                ) : (
                  <ReformulationLab
                    baseCalories={analysis.calories}
                    baseSugars={analysis.sugars}
                    baseSatFat={analysis.saturatedFat}
                    baseSodium={analysis.sodium}
                    baseProtein={analysis.protein}
                    baseFiber={analysis.fiber}
                  />
                )}
              </div>

              {/* Column 3: Marketing Claims vs Reality (Top) + Healthier Product Swaps (Bottom) */}
              <div className="flex flex-col gap-6 h-full justify-between">
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
        </main>

        {/* Floating Bottom Comparison Dock */}
        {comparisonList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-emerald-400" />
              <span className="text-xs font-bold">
                Comparison Tray ({comparisonList.length}/3)
              </span>
            </div>

            {/* Thumbnail Pills */}
            <div className="flex items-center gap-1.5">
              {comparisonList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 px-2 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1.5 border border-slate-700"
                >
                  <span className="truncate max-w-[90px]">{item.productName}</span>
                  <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${getGradeBadge(item.nutriScore)}`}>
                    {item.nutriScore}
                  </span>
                  <button
                    onClick={() => handleRemoveFromCompare(idx)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Compare Action */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <button
                onClick={() => setIsComparisonOpen(true)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <span>Compare Now</span>
              </button>
              <button
                onClick={() => setComparisonList([])}
                className="text-slate-400 hover:text-slate-200 p-1 text-xs"
                title="Clear tray"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
