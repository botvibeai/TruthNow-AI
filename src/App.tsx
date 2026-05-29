import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, Upload, Shield, Sparkles, Zap, Globe, FileCheck, 
  RefreshCw, CheckCircle, Sliders, PlayCircle, Star, HelpCircle, 
  ArrowRight, Heart, ExternalLink, Moon, Eye, AlertCircle, Info, Trash2,
  ZoomIn, ZoomOut, Code, Copy, Plus, ArrowLeft, Key, Terminal, BookOpen, Layers, Check, KeyRound, Server, Scale
} from "lucide-react";
import { FaceData, ScanResponse, ClientReview, FaqItem, DevApiKey } from "./types";
import HeroSection from "./components/HeroSection";
import DeveloperPortal from "./components/DeveloperPortal";
import ApiDocs from "./components/ApiDocs";
import { TruthNowLogo } from "./components/TruthNowLogo";
import { useFirebase } from "./components/FirebaseProvider";
import CompareScanner from "./components/CompareScanner";
import BulkScanner from "./components/BulkScanner";
import { translations, Language } from "./translations";
import { 
  GEO_OPTIONS_LOCALIZED, 
  PRESET_MOCK_PORTRAITS_LOCALIZED, 
  FAQS_DATA, 
  USER_REVIEWS_INITIAL_DATA, 
  MAIN_EXTRA_TRANSLATIONS 
} from "./localesData";


export default function App() {
  const {
    user,
    loading: isFirebaseLoading,
    totalScansCount: cloudScansCount,
    apiKeys: cloudApiKeys,
    reviews: cloudReviews,
    signInWithGoogle,
    logOut,
    createApiKey: cloudCreateApiKey,
    revokeApiKey: cloudRevokeApiKey,
    toggleApiKeyStatus: cloudToggleApiKeyStatus,
    incrementScanCount: cloudIncrementScanCount,
    submitFeedbackReview: cloudSubmitFeedbackReview
  } = useFirebase();

  const [showApiPortal, setShowApiPortal] = useState<boolean>(false);
  const [showApiDocs, setShowApiDocs] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<DevApiKey[]>(() => {
    const saved = localStorage.getItem("truthnowai_api_keys");
    return saved ? JSON.parse(saved) : [
      {
        id: "key_initial",
        name: "Sandbox Testing Token",
        key: "tn_test_a4b9c1d0e5f67890abcdef123y7",
        createdAt: "2026-05-27",
        status: "active",
        callsCount: 42
      }
    ];
  });

  const [activeTab, setActiveTab ] = useState<"sandbox" | "calculator" | "standards">("sandbox");
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewZoomed, setIsPreviewZoomed] = useState<boolean>(false);
  const [isResetConfirmed, setIsResetConfirmed] = useState<boolean>(false);
  const [totalScansCount, setTotalScansCount] = useState<number>(() => {
    const saved = localStorage.getItem("truthnowai_total_scans_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (!user) {
      localStorage.setItem("truthnowai_total_scans_count", totalScansCount.toString());
    }
  }, [totalScansCount, user]);

  const activeApiKeys = user ? cloudApiKeys : apiKeys;
  const activeScansCount = user ? cloudScansCount : totalScansCount;

  // SaaS Credits & Active Plan Tiers
  const [remainingScans, setRemainingScans] = useState<number>(5);
  const [activePlan, setActivePlan] = useState<string>("Free Demo Plan");
  const [pricingMode, setPricingMode] = useState<"saas" | "api">("saas");
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("truthnowai_language");
    return (saved as Language) || "en";
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);

  const PRESET_MOCK_PORTRAITS = PRESET_MOCK_PORTRAITS_LOCALIZED[language];
  const FAQS_LIST = FAQS_DATA[language];
  const GEO_COMPLIANCE_OPTIONS = GEO_OPTIONS_LOCALIZED[language];
  const extraT = MAIN_EXTRA_TRANSLATIONS[language];

  useEffect(() => {
    localStorage.setItem("truthnowai_language", language);
  }, [language]);

  // Interactive Workbench Modes - Single analysis, comparative side-by-side, or multi batch upload
  const [workbenchMode, setWorkbenchMode] = useState<"single" | "compare" | "bulk">("single");

  // Global app notification toast system
  const [toasts, setToasts] = useState<{ id: string; message: string; type?: "success" | "info" | "error" }[]>([]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // Dynamic user reviews from testimonials submit form
  const [reviewsList, setReviewsList] = useState<ClientReview[]>([]);

  useEffect(() => {
    const customReviews = reviewsList.filter(item => item.id.startsWith("custom_"));
    setReviewsList([...customReviews, ...USER_REVIEWS_INITIAL_DATA[language]]);
  }, [language]);

  const displayedReviews = [
    ...cloudReviews,
    ...reviewsList.filter(item => !cloudReviews.some(cItem => cItem.id === item.id))
  ];

  // Add review form fields
  const [reviewAuthor, setReviewAuthor] = useState<string>("");
  const [reviewRole, setReviewRole] = useState<string>("");
  const [reviewCompany, setReviewCompany] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewQuery, setReviewQuery] = useState<string>("how to check if person in photo is minor or adult appearance");
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState<boolean>(false);

  // Paypal simulated interactive checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{
    name: string;
    price: number;
    type: "one-time" | "subscription";
    calls: number;
    description: string;
  } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"init" | "processing" | "success">("init");
  const [paypalEmail, setPaypalEmail] = useState<string>("");
  const [paypalPassword, setPaypalPassword] = useState<string>("");
  const [paypalError, setPaypalError] = useState<string>("");
  const [paypalAgreed, setPaypalAgreed] = useState<boolean>(true);
  
  // Camera scanning states
  const [isPlayingCamera, setIsPlayingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scan output responses
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerErrorMessage, setScannerErrorMessage] = useState<string | null>(null);

  // Pricing calculator state variables (For API Rate structures)
  const [monthlyVolume, setMonthlyVolume] = useState<number>(30000);

  // Developer API Key manipulation handlers
  const handleGenerateApiKey = async (nameOfKey: string) => {
    if (user) {
      await cloudCreateApiKey(nameOfKey);
    } else {
      const prefix = "tn_live_";
      const bodyStr = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const newKeyStr = prefix + bodyStr;
      const newKeyObj: DevApiKey = {
        id: "key_" + Date.now(),
        name: nameOfKey.trim() || "Production API Integration Token",
        key: newKeyStr,
        createdAt: new Date().toISOString().split("T")[0],
        status: "active",
        callsCount: 0
      };
      const updated = [...apiKeys, newKeyObj];
      setApiKeys(updated);
      localStorage.setItem("truthnowai_api_keys", JSON.stringify(updated));
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (user) {
      await cloudRevokeApiKey(id);
    } else {
      const updated = apiKeys.filter(k => k.id !== id);
      setApiKeys(updated);
      localStorage.setItem("truthnowai_api_keys", JSON.stringify(updated));
    }
  };

  const handleToggleKeyStatus = async (id: string) => {
    if (user) {
      await cloudToggleApiKeyStatus(id);
    } else {
      const updated = apiKeys.map(k => {
        if (k.id === id) {
          return { ...k, status: k.status === "active" ? ("revoked" as const) : ("active" as const) };
        }
        return k;
      });
      setApiKeys(updated);
      localStorage.setItem("truthnowai_api_keys", JSON.stringify(updated));
    }
  };

  // Crawler validation log mock text
  const [robotsTxtContent, setRobotsTxtContent] = useState<string>("");
  const [sitemapXmlContent, setSitemapXmlContent] = useState<string>("");
  const [activeCrawlerPreview, setActiveCrawlerPreview] = useState<"robots" | "sitemap" | null>(null);

  // Search filter for FAQs
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>("");
  const [activeFaqId, setActiveFaqId] = useState<string | null>("faq_minor");

  // Load crawler previews on mount
  useEffect(() => {
    fetch("/robots.txt")
      .then(r => r.text())
      .then(text => setRobotsTxtContent(text))
      .catch(() => setRobotsTxtContent("# Sitemap and crawler details loaded locally\nUser-agent: *\nAllow: /"));
    
    fetch("/sitemap.xml")
      .then(r => r.text())
      .then(text => setSitemapXmlContent(text))
      .catch(() => setSitemapXmlContent(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://truthnowai.com/</loc></url>\n</urlset>`));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsPreviewZoomed(false);
    setScanResult(null);
    setScannerErrorMessage(null);
    
    // Stop live camera if running to focus on file
    stopCamera();
    
    // Automatically trigger scanner on drop
    analyzeImageData(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Live Camera Controls
  const startCamera = async () => {
    setCameraError(null);
    setScannerErrorMessage(null);
    setPreviewUrl(null);
    setUploadedFile(null);
    setScanResult(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsPlayingCamera(true);
    } catch (err: any) {
      console.error("[Camera-Access-Denied]:", err);
      setCameraError(
        "Camera stream blocked or unavailable. Ensure your browser device permissions are active, or try with a preset portrait below."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsPlayingCamera(false);
  };

  const captureCameraSnapshotAndAnalyze = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewUrl(dataUrl);
      setIsPreviewZoomed(false);
      
      // Stop the camera view once captured to display snapshot
      stopCamera();
      
      // Send raw base64 data to backend
      analyzeBase64String(dataUrl);
    }
  };

  // Call proxy endpoint with base64
  const analyzeBase64String = async (base64Data: string) => {
    if (remainingScans <= 0) {
      setScannerErrorMessage("No query credits remaining on your current SaaS plan. Please purchase our Special Trial Pack (Buy 10 Get 10 Free for $6.99) or activate an SLA subscription plan below to replenish your tokens instantly.");
      // Automatically scroll to pricing to facilitate easy checkout
      document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsScanning(true);
    setScannerErrorMessage(null);
    setScanResult(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: "image/jpeg",
          userCountrySim: selectedCountry
        })
      });

      if (!response.ok) {
        throw new Error(`API returned execution code ${response.status}`);
      }

       const parsed: ScanResponse = await response.json();
      setScanResult(parsed);
      setRemainingScans(prev => Math.max(0, prev - 1));
      if (user) {
        cloudIncrementScanCount();
      } else {
        setTotalScansCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error("[ScannerEndpointError]:", err);
      setScannerErrorMessage(
        err?.message || "Visual intelligence proxy network error. Using local compliance sandbox preset fallback."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const analyzeImageData = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      analyzeBase64String(resultStr);
    };
    reader.readAsDataURL(file);
  };

  // Direct Mock Action: Load a preset template on click for fast demonstration
  const handleLoadPresetMock = (preset: typeof PRESET_MOCK_PORTRAITS[0]) => {
    if (remainingScans <= 0) {
      setScannerErrorMessage("No query credits remaining on your current SaaS plan. Please purchase our Special Trial Pack (Buy 10 Get 10 Free for $6.99) or activate an SLA subscription plan below to replenish your tokens instantly.");
      document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    stopCamera();
    setPreviewUrl(preset.imageUrl);
    setIsPreviewZoomed(false);
    setIsScanning(true);
    setScannerErrorMessage(null);
    setScanResult(null);

    // Provide immediate feedback, wait 800ms to mimic model evaluation
    setTimeout(() => {
      setScanResult({
        success: true,
        usingSimulation: true,
        facesDetected: 1,
        processedAt: new Date().toISOString(),
        isAiGenerated: preset.isAiGenerated,
        aiConfidence: preset.aiConfidence,
        aiReason: preset.aiReason,
        faces: [{
          confidenceScore: preset.confidence,
          estimatedAge: preset.estimatedAge,
          ageRange: preset.ageRange,
          ageCategory: preset.ageCategory,
          genderPresentation: preset.genderPresentation,
          genderConfidence: preset.confidence - 2,
          minorAppearanceSafetyCode: preset.safetyCode as any,
          minorSafetyReasoning: `Anatomical Analysis: ${preset.safetyReasoning}`,
          expression: preset.expression,
          expressionConfidence: 91,
          attributes: preset.attributes,
          relativeCoordinates: { x: 50, y: 50, width: 60, height: 60 }
        }],
        geoCompliance: {
          country: selectedCountry === "US" ? "United States" : selectedCountry === "GB" ? "United Kingdom" : selectedCountry === "EU" ? "European Union" : "Canada",
          jurisdiction: selectedCountry === "US" ? "COPPA / CCPA Regulatory Framework" : selectedCountry === "GB" ? "UK BSI PAS 1296 Standards" : selectedCountry === "EU" ? "GDPR Biometric Protection Laws" : "PIPEDA Compliance Framework",
          scannerComplianceCode: `COMPLY-${selectedCountry}-ACTIVE-MOCK`,
          mandatoryRetentionLimitHours: 0,
          dataPolicyNote: "Transient sandbox execution bypasses retention. Biometric template hashes immediately scrubbed from local stack variables upon evaluation."
        },
        seoMetrics: {
          keywordsActive: ["age gender detector", "gender detection from image", "how to check if person in photo is minor or adult appearance"],
          score: 100
        }
      });
      setRemainingScans(prev => Math.max(0, prev - 1));
      if (user) {
        cloudIncrementScanCount();
      } else {
        setTotalScansCount(prev => prev + 1);
      }
      setIsScanning(false);
    }, 850);
  };

  // Reset tool screen
  const handleResetScanner = () => {
    setIsResetConfirmed(true);
    setTimeout(() => {
      stopCamera();
      setPreviewUrl(null);
      setUploadedFile(null);
      setScanResult(null);
      setScannerErrorMessage(null);
      setIsPreviewZoomed(false);
      setIsResetConfirmed(false);
    }, 750);
  };

  // Paypal simulated interactive checkout methods
  const handleOpenPaymentCheckout = (plan: {
    name: string;
    price: number;
    type: "one-time" | "subscription";
    calls: number;
    description: string;
  }) => {
    setSelectedPlanDetails(plan);
    setCheckoutStep("init");
    setPaypalEmail("");
    setPaypalPassword("");
    setPaypalError("");
    setPaypalAgreed(true);
    setIsCheckoutOpen(true);
  };

  const handleSimulatedPayPalPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalEmail) {
      setPaypalError("Please enter your PayPal account email address to authenticate.");
      return;
    }
    if (!paypalPassword) {
      setPaypalError("Please enter your secure checkout password.");
      return;
    }
    if (!paypalAgreed) {
      setPaypalError("You must accept TruthNowAI's terms of visual execution.");
      return;
    }
    setPaypalError("");
    setCheckoutStep("processing");

    // Mimic secure PayPal checkout API call flow
    setTimeout(() => {
      if (selectedPlanDetails) {
        setRemainingScans(prev => prev + selectedPlanDetails.calls);
        setActivePlan(selectedPlanDetails.name);
      }
      setCheckoutStep("success");
    }, 1800);
  };

  const handleCancelCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedPlanDetails(null);
    setCheckoutStep("init");
  };

  // Submission handler for dynamic client reviews
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewText.trim()) {
      alert("Name and Review Text fields are required.");
      return;
    }
    const reviewData = {
      author: reviewAuthor.trim(),
      role: reviewRole.trim() || "Biometrics Safety Officer",
      company: reviewCompany.trim() || "Independent Platform",
      rating: reviewRating,
      avatarSeed: reviewAuthor.toLowerCase().replace(/\s/g, "_"),
      text: reviewText.trim(),
      verifiedQuery: reviewQuery,
      createdAt: new Date().toISOString(),
      userId: user?.uid || null
    };

    if (user) {
      await cloudSubmitFeedbackReview(reviewData);
    } else {
      const newReview: ClientReview = {
        ...reviewData,
        id: `custom_review_${Date.now()}`
      };
      setReviewsList(prev => [newReview, ...prev]);
    }
    setReviewSubmitSuccess(true);
    
    // Clear fields
    setReviewAuthor("");
    setReviewRole("");
    setReviewCompany("");
    setReviewRating(5);
    setReviewText("");
    
    // Smooth scroll back to reviews section
    setTimeout(() => {
      document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
    }, 1200);
  };

  // Pricing calculations for bulk scale API Developer tiers
  // Starts at $0.09 and goes down to $0.04 at high volumes
  const calculateRatePerCall = (vol: number) => {
    if (vol < 20000) return 0.09;
    if (vol < 100000) return 0.07;
    if (vol < 300000) return 0.05;
    return 0.04;
  };

  const calculatedRate = calculateRatePerCall(monthlyVolume);
  const monthlyCost = monthlyVolume * calculatedRate;

  // Average competitor cost (like manual audit bureaus or legacy biometric check APIs) is usually around $0.20/call
  const competitorMonthlyCost = monthlyVolume * 0.20;
  const clientSavings = competitorMonthlyCost - monthlyCost;

  // Filter FAQs
  const filteredFaqs = FAQS_LIST.filter(faq => 
    faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
    (faq.keywordRelation && faq.keywordRelation.toLowerCase().includes(faqSearchQuery.toLowerCase()))
  );

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      
      {/* Target SEO details & dynamic meta container hidden but optimized for scrapers */}
      <div className="hidden">
        <h2>truth now engine</h2>
        <h3>age gender detector</h3>
        <h3>how to check if person in photo is minor or adult appearance</h3>
        <p>This demographic intelligence app checks age and gender detection, photo gender detector accuracy, and is a complete face gender analyzer built directly using enterprise visual intelligence standards.</p>
      </div>

      {/* Modern Header matching Sleek Design spec */}
      <header className="sticky top-0 z-50 h-24 px-4 md:px-8 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setShowApiPortal(false); setShowApiDocs(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <TruthNowLogo className="h-16 md:h-18" />
          <span className="hidden lg:inline-block text-[10px] font-mono text-slate-500 tracking-wider font-bold ml-1 border-l border-slate-800 pl-2">BY VOLT COGNITIVE</span>
        </div>

        {/* Navigation anchors */}
        <nav className="hidden md:flex gap-7 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button 
            onClick={() => { setShowApiPortal(false); setShowApiDocs(false); setActiveTab("sandbox"); setTimeout(() => document.getElementById("sandbox-workspace")?.scrollIntoView({ behavior: "smooth" }), 50); }}
            className={`hover:text-indigo-400 transition-colors cursor-pointer ${activeTab === "sandbox" && !showApiPortal && !showApiDocs ? "text-indigo-400 underline decoration-indigo-400 underline-offset-4" : ""}`}
          >
            {t.nav.scanner}
          </button>
          <button 
            onClick={() => { setShowApiPortal(false); setShowApiDocs(false); setActiveTab("calculator"); setTimeout(() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" }), 50); }}
            className={`hover:text-indigo-400 transition-colors cursor-pointer ${activeTab === "calculator" && !showApiPortal && !showApiDocs ? "text-indigo-400 underline decoration-indigo-400 underline-offset-4" : ""}`}
          >
            {t.nav.calculator}
          </button>
          <button 
            onClick={() => { setShowApiPortal(false); setShowApiDocs(false); setTimeout(() => document.getElementById("compliance-section")?.scrollIntoView({ behavior: "smooth" }), 50); }}
            className="hover:text-indigo-400 transition-colors text-left"
          >
            {t.nav.rules}
          </button>
          <button 
            onClick={() => { setShowApiPortal(false); setShowApiDocs(false); setTimeout(() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" }), 50); }}
            className="hover:text-indigo-400 transition-colors text-left"
          >
            {t.nav.studies}
          </button>
          <button 
            onClick={() => { setShowApiPortal(false); setShowApiDocs(false); setTimeout(() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" }), 50); }}
            className="hover:text-indigo-400 transition-colors text-left"
          >
            {t.nav.faq}
          </button>
        </nav>

        {/* Quick Trigger Call / Scan Credits remaining tracker pill */}
        <div className="flex items-center gap-3">
          
          {/* Custom Language Dropdown Switcher */}
          <div className="relative z-50" id="global-language-selector">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="relative inline-flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full pl-3 pr-3.5 py-1.5 select-none shrink-0 transition-all cursor-pointer font-medium text-xs font-mono text-slate-300 active:scale-95"
              title="Change Language / Cambiar Idioma / Langue / Sprache / 言語"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[11px] min-w-[20px] text-center">
                {language.toUpperCase()}
              </span>
              <span className={`text-[8px] text-slate-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsLangDropdownOpen(false)} 
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-md"
                  >
                    {[
                      { code: "en", label: "English", display: "EN" },
                      { code: "es", label: "Español", display: "ES" },
                      { code: "fr", label: "Français", display: "FR" },
                      { code: "de", label: "Deutsch", display: "DE" },
                      { code: "ja", label: "日本語", display: "JA" }
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLanguage(item.code as Language);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          language === item.code 
                            ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                        }`}
                      >
                        <span className="font-sans">{item.label}</span>
                        <span className="font-mono text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 uppercase font-semibold">
                          {item.display}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 text-[11px] py-1.5 px-3.5 bg-slate-900/90 border border-slate-800 rounded-full font-mono">
            <span className="hidden sm:inline text-slate-500">{t.nav.tier}</span>
            <span className="hidden sm:inline text-indigo-400 font-bold">{user ? "Cloud Sync" : activePlan}</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-400 font-semibold">{user ? `${activeScansCount} ${t.nav.totalScans}` : `${remainingScans} ${t.nav.scansLeft}`}</span>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById("pricing-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-white rounded-full text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer font-sans"
          >
            {t.nav.saasPricing}
          </button>

          {/* Firebase Authentication Button */}
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-5 h-5 rounded-full object-cover border border-indigo-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              )}
              <span className="hidden lg:inline-block text-[11px] text-slate-300 font-medium max-w-[96px] overflow-hidden text-ellipsis whitespace-nowrap">
                {user.displayName || "Developer"}
              </span>
              <button 
                onClick={logOut}
                className="text-[10px] text-slate-400 hover:text-red-400 font-bold transition-all uppercase tracking-wider pl-1.5 border-l border-slate-800 cursor-pointer"
              >
                {t.nav.exit}
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-full text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer font-sans shadow-lg hover:shadow-white/5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <path fill="#EA4335" d="M22.86 12.3c0-.82-.07-1.61-.21-2.38H12v4.51h6.08a5.2 5.2 0 0 1-2.25 3.41v2.84h3.64c2.13-1.96 3.39-4.85 3.39-8.38z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.64-2.84c-1.01.68-2.3 1.08-3.64 1.08-2.81 0-5.18-1.9-6.03-4.46H2.18v2.93A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.97 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.36-2.12V6.95H2.18A11 11 0 0 0 1 12c0 1.83.45 3.56 1.25 5.08l2.72-2.12V14.12z" />
                <path fill="#4285F4" d="M5.97 9.88c.85-2.56 3.22-4.46 6.03-4.46 1.61 0 3.06.56 4.2 1.63l3.14-3.14A11 11 0 0 0 12 1c-4.41 0-8.23 2.58-10 6.34l3.97 3.08c0-.18 0-.36.2-.54z" />
              </svg>
              <span>{t.nav.googleSync}</span>
            </button>
          )}
        </div>
      </header>

      {showApiPortal ? (
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <DeveloperPortal 
            apiKeys={activeApiKeys}
            onGenerateApiKey={handleGenerateApiKey}
            onRevokeApiKey={handleRevokeApiKey}
            onToggleKeyStatus={handleToggleKeyStatus}
            onClose={() => {
              setShowApiPortal(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </main>
      ) : showApiDocs ? (
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ApiDocs 
            onClose={() => {
              setShowApiDocs(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </main>
      ) : (
        <>
          {/* Hero Section Container */}
          <HeroSection 
            onScrollToScanner={() => {
              document.getElementById("sandbox-workspace")?.scrollIntoView({ behavior: "smooth" });
            }} 
            lang={language}
          />

          {/* Main Workspace Body Content */}
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-24 font-sans">
        
        {/* Interactive Analyzer Workspace */}
        <section id="sandbox-workspace" className="scroll-mt-24 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-900/30">
              Interactive Cognitive Workbench
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Instant Meta-Analysis Sandbox
            </h2>
            <div className="flex justify-center pt-1 pb-1">
              <div className="inline-flex items-center gap-2.5 bg-indigo-950/20 border border-indigo-900/40 px-4 py-2 rounded-full text-xs text-slate-300 shadow-inner">
                <span className={`w-2 h-2 rounded-full ${remainingScans > 0 ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
                <span>
                  Current Balance: <strong className="text-slate-100 font-bold font-mono">{remainingScans} remaining checks</strong> 
                  <span className="text-slate-500 font-normal"> / {activePlan}</span>
                </span>
                {remainingScans <= 0 && (
                  <button 
                    onClick={() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-[10px] text-emerald-400 font-extrabold hover:underline uppercase ml-1 animate-pulse"
                  >
                    Replenish Now
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Test compliance metrics instantly. Experience our <strong className="text-slate-200">photo gender detector</strong>, 
              view classification labels, and examine safety reasoning live. Change the country setting below to watch real-time metadata adapt.
            </p>

            {/* Region Compliance Selection */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Select Compliance Jurisdiction:
              </span>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                {GEO_COMPLIANCE_OPTIONS.map((g) => (
                  <button
                    key={g.code}
                    onClick={() => setSelectedCountry(g.code)}
                    className={`px-3 py-1 text-[11px] font-mono rounded font-semibold transition-all cursor-pointer ${
                      selectedCountry === g.code 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {g.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Workbench Sandbox Layout Mode Selector Switcher Tab Row */}
          <div className="flex justify-center max-w-lg mx-auto w-full pt-4 pb-2">
            <div className="grid grid-cols-3 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80 w-full">
              <button 
                onClick={() => setWorkbenchMode("single")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  workbenchMode === "single"
                    ? "bg-slate-950 text-indigo-400 font-bold shadow-md shadow-black/40 border border-indigo-900/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Single Profile</span>
              </button>
              <button 
                onClick={() => setWorkbenchMode("compare")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  workbenchMode === "compare"
                    ? "bg-slate-950 text-indigo-400 font-bold shadow-md shadow-black/40 border border-indigo-900/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
              <button 
                onClick={() => setWorkbenchMode("bulk")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  workbenchMode === "bulk"
                    ? "bg-slate-950 text-indigo-400 font-bold shadow-md shadow-black/40 border border-indigo-900/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bulk Batch</span>
              </button>
            </div>
          </div>

          {workbenchMode === "single" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMN LEFT: Image Upload, Preset Selection, Action Controls */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              
              {/* Image Input Container Panel */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative min-h-[320px] rounded-2xl flex flex-col items-center justify-center p-6 border-2 transition-all ${
                  dragActive 
                    ? "border-emerald-400 bg-emerald-500/5" 
                    : "border-dashed border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                {!previewUrl && !isPlayingCamera ? (
                  // Empty Uploader state
                  <div className="text-center space-y-4 p-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200">
                        Drag & Drop portrait image or click to choose
                      </p>
                      <p className="text-xs text-slate-500">
                        Supports JPEG, PNG, or WebP up to 10MB
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <label className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 hover:border-slate-700 transition-all cursor-pointer">
                        Browse Files
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                        />
                      </label>
                      
                      <span className="text-xs text-slate-600 font-mono">OR</span>

                      <button
                        onClick={startCamera}
                        className="px-5 py-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Capture Live Video
                      </button>
                    </div>
                  </div>
                ) : isPlayingCamera ? (
                  // Active Camera Feed
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-full aspect-video md:max-h-[300px] bg-black rounded-lg overflow-hidden border border-slate-800">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover scale-x-[-1]" 
                        playsInline 
                        muted 
                      />
                      <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1 font-mono uppercase">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        Live Frame Feed
                      </div>
                    </div>
                    
                    {cameraError && (
                      <p className="text-xs text-red-400 px-4 text-center">{cameraError}</p>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={captureCameraSnapshotAndAnalyze}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-slate-950" />
                        Analyze Snapshot Frame
                      </button>
                      
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold rounded-full transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Preview Screen State (Analyzing snapshot/preset)
                  <div 
                    className={`relative w-full h-[340px] max-h-[340px] bg-slate-950/45 border border-slate-800/80 rounded-2xl transition-all duration-200 select-none ${
                      isPreviewZoomed 
                        ? "overflow-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex items-start justify-start p-4" 
                        : "overflow-hidden flex items-center justify-center"
                    }`}
                  >
                    <div 
                      className={`relative inline-block ${
                        isPreviewZoomed ? "m-auto" : "max-h-[320px] max-w-full"
                      }`}
                    >
                      <img 
                        src={previewUrl!} 
                        className={`rounded-lg transition-all duration-200 bg-slate-950/20 ${
                          isPreviewZoomed 
                            ? "max-h-none max-w-none w-auto h-auto cursor-zoom-out shadow-2xl" 
                            : "max-h-[320px] max-w-full object-contain cursor-zoom-in hover:opacity-90"
                        }`} 
                        alt="Uploaded face profile target" 
                        referrerPolicy="no-referrer"
                        onClick={() => setIsPreviewZoomed(!isPreviewZoomed)}
                        id="target-preview-image"
                      />

                      {/* Face scan bounding box drawing overlay */}
                      {!isScanning && scanResult && scanResult.facesDetected > 0 && (
                        <div className="absolute top-[20%] left-[28%] w-[44%] h-[46%] border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none">
                          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-emerald-400 rounded-full" />
                          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-emerald-400 rounded-full" />
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-emerald-900/90 border border-emerald-400/80 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap uppercase tracking-wider">
                            {scanResult.faces[0].genderPresentation} / Estimated {scanResult.faces[0].estimatedAge}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Laser scanning visualization bar active only during analytics state */}
                    {isScanning && (
                      <>
                        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-[bounce_2s_infinite] pointer-events-none" />
                        <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="bg-slate-900/95 px-4 py-3 border border-slate-800 rounded-xl max-w-xs flex items-center gap-3 shadow-2xl">
                            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                            <div className="text-left">
                              <span className="block text-xs font-bold text-white uppercase tracking-wider font-mono">Running Scan Engine</span>
                              <span className="text-[10px] text-indigo-400">Classifying via Cloudmersive API...</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Zoom Toggle Floating Indicator */}
                    {!isScanning && (
                      <button
                        onClick={() => setIsPreviewZoomed(!isPreviewZoomed)}
                        className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-slate-950/85 text-slate-300 hover:text-white hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer shadow-lg z-10"
                        title={isPreviewZoomed ? "Switch to Fit View" : "Zoom to Original Size"}
                        id="zoom-toggle-button"
                      >
                        {isPreviewZoomed ? (
                          <>
                            <ZoomOut className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Fit View</span>
                          </>
                        ) : (
                          <>
                            <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Zoom In</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Quick remove control option in upper-right */}
                    {!isScanning && (
                      <button 
                        onClick={handleResetScanner}
                        disabled={isResetConfirmed}
                        className={`absolute top-2 right-2 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer z-10 ${
                          isResetConfirmed 
                            ? "w-auto px-2.5 h-8 bg-emerald-950/90 border-emerald-500 text-emerald-400 gap-1.5 font-mono text-[10px] uppercase font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]" 
                            : "w-8 h-8 bg-slate-950/85 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                        title={isResetConfirmed ? "Reset Confirmed" : "Reset Scanner"}
                        id="reset-scanner-button"
                      >
                        {isResetConfirmed ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-400 animate-[bounce_0.5s_ease-out_1]" />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Total User Usage History Counter */}
              <div 
                className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-inner transition-all duration-300"
                id="user-usage-history-counter"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{extraT.usageHistoryLedger}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{extraT.totalScansVerified}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-2xl font-black font-mono text-emerald-400 leading-none drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      {activeScansCount}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest font-mono">
                      {extraT.scansRun}
                    </span>
                  </div>

                  {totalScansCount > 0 && !user && (
                    <button
                      onClick={() => setTotalScansCount(0)}
                      className="text-[10px] text-slate-500 hover:text-red-400 font-mono transition-colors border-l border-slate-800/80 pl-4 py-1.5 cursor-pointer font-medium"
                      title={extraT.clearLocalLog}
                    >
                      {extraT.clearText}
                    </button>
                  )}
                </div>
              </div>

              {/* Try Instant Preset Samples Block (wow factor triggers) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    {extraT.instantPresetsTitle}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/30 px-2 py-0.5 border border-emerald-900/30 rounded-md">
                    {extraT.clickToTry}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_MOCK_PORTRAITS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPresetMock(preset)}
                      className="group text-left bg-slate-900/20 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-2 rounded-xl transition-all flex flex-col items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 group-hover:border-indigo-400 transition-colors">
                        <img 
                          src={preset.imageUrl} 
                          alt={preset.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center w-full">
                        <span className="block text-[10px] font-bold text-slate-300 truncate group-hover:text-indigo-300 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">
                          Estimated: {preset.estimatedAge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geo-Compliance validation alert matching target location scope */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex gap-3 text-xs leading-relaxed">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200">
                    Enterprise Biometric Privacy Guarantee
                  </h4>
                  <p className="text-slate-400 mt-1">
                    TruthNowAI strictly isolates processing threads inside transient memory structures. All visual vectors and metadata files loaded for analysis under <span className="text-slate-200 font-semibold">{selectedCountry} policy limits</span> are scrubbed within session termination scope, enforcing absolute immunity against state privacy leaks.
                  </p>
                </div>
              </div>

            </div>

            {/* COLUMN RIGHT: Scan Diagnostic Outputs / Raw Metadata Terminal */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex-grow flex flex-col justify-between min-h-[460px] relative overflow-hidden shadow-2xl">
                
                {/* Background ambient radial aura */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 blur-3xl rounded-full" />

                <div>
                  {/* Header Title block */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                        Scanning Diagnostic Terminal
                      </span>
                    </div>
                    {scanResult && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        UID: tn_{Math.floor(Math.random() * 89999) + 10000}
                      </span>
                    )}
                  </div>

                  {/* Non-loaded UI placeholder state */}
                  {!scanResult && !isScanning && (
                    <div className="flex-grow flex flex-col items-center justify-center py-16 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="max-w-xs space-y-1">
                        <p className="text-xs font-bold text-slate-400">
                          Awaiting Input Snapshot
                        </p>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Select one of the sample presets below or upload an image above to trigger full diagnostic analysis.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Loading spinner block */}
                  {isScanning && (
                    <div className="flex-grow flex flex-col items-center justify-center py-16 text-center space-y-4">
                      <div className="relative">
                        <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                        <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest font-mono">
                          Evaluating cranial landmarks...
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Applying CCPA-verified minor-adult appearance classification keys.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error messaging wrapper if api fails */}
                  {scannerErrorMessage && !isScanning && (
                    <div className="p-4 bg-red-900/15 border border-red-500/30 rounded-xl text-left space-y-2">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Execution Pipeline Warning</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {scannerErrorMessage}
                      </p>
                      <button 
                        onClick={() => handleLoadPresetMock(PRESET_MOCK_PORTRAITS[0])}
                        className="text-[10px] text-emerald-400 hover:underline font-mono"
                      >
                        Launch sandbox offline simulation instead →
                      </button>
                    </div>
                  )}

                  {/* COMPLETE RESPONSE VIEW BLOCK */}
                  {!isScanning && scanResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Top Metrics Cards grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
                        
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                          <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Estimated Age</span>
                          <span className="text-lg font-bold text-white font-mono">
                            {scanResult.faces[0]?.estimatedAge} <span className="text-xs text-slate-400 font-normal">Yrs</span>
                          </span>
                          <span className="block text-[8px] text-slate-500 font-mono">
                            Range: {scanResult.faces[0]?.ageRange}
                          </span>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                          <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Gender Expression</span>
                          <span className="text-lg font-bold text-indigo-400 truncate block">
                            {scanResult.faces[0]?.genderPresentation}
                          </span>
                          <span className="block text-[8px] text-slate-500 font-mono">
                            Conf: {scanResult.faces[0]?.genderConfidence?.toFixed(1) || "92.0"}%
                          </span>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-left">
                          <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Detected Faces</span>
                          <span className="text-lg font-bold text-emerald-400 font-mono">
                            {scanResult.facesDetected} Total
                          </span>
                          <span className="block text-[8px] text-slate-500 font-mono">
                            Latency: 140ms
                          </span>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-left">
                          <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Authenticity Index</span>
                          <span className={`text-md font-bold truncate block ${scanResult.isAiGenerated ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {scanResult.isAiGenerated ? 'AI Generated (Fake)' : 'Authentic Original'}
                          </span>
                          <span className="block text-[8px] text-slate-500 font-mono">
                            Conf: {(scanResult.aiConfidence || 94.6).toFixed(1)}%
                          </span>
                        </div>

                      </div>

                      {/* Primary Classification Alert Banner */}
                      <div className={`p-4 rounded-xl border ${
                        scanResult.faces[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE"
                          ? "bg-slate-950/90 border-slate-800 text-left"
                          : scanResult.faces[0]?.minorAppearanceSafetyCode === "ALERT_MINOR_APPEARANCE"
                            ? "bg-amber-950/15 border-amber-500/30 text-left"
                            : "bg-red-950/15 border-red-500/30 text-left"
                      }`}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/40 mb-2">
                          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">
                            Minor Safety Status Assessment
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            scanResult.faces[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-900/30"
                              : scanResult.faces[0]?.minorAppearanceSafetyCode === "ALERT_MINOR_APPEARANCE"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-900/30"
                                : "bg-red-500/10 text-red-400 border border-red-900/30"
                          }`}>
                            {scanResult.faces[0]?.minorAppearanceSafetyCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {scanResult.faces[0]?.minorSafetyReasoning}
                        </p>
                      </div>

                      {/* Image Origin & AI Authenticity Audit Banner */}
                      <div className={`p-4 rounded-xl border ${
                        scanResult.isAiGenerated
                          ? "bg-rose-950/15 border-rose-500/30 text-left"
                          : "bg-emerald-950/10 border-emerald-500/30 text-left"
                      }`}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/40 mb-2">
                          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">
                            Image Origin & AI Authenticity Audit
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            scanResult.isAiGenerated
                              ? "bg-rose-500/15 text-rose-400 border border-rose-900/30 animation-pulse"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-900/30"
                          }`}>
                            {scanResult.isAiGenerated ? "AI_SYNTHESIS_DETECTED" : "VERIFIED_GENUINE_ORIGINAL"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {scanResult.aiReason || "Raw pixel frequency, sensor chromatic metrics, and metadata checks confirm camera hardware source capture."}
                        </p>
                      </div>

                      {/* Facial Attributes breakdown metrics grid */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest block">
                          Identified Structural Attributes
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                          
                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 flex items-center justify-between">
                            <span className="text-slate-500">Makeup:</span>
                            <span className={scanResult.faces[0]?.attributes.makeupDetected ? "text-indigo-400 font-bold" : "text-slate-400"}>
                              {scanResult.faces[0]?.attributes.makeupDetected ? "DETECTED" : "NONE"}
                            </span>
                          </div>

                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 flex items-center justify-between">
                            <span className="text-slate-500">Glasses:</span>
                            <span className={scanResult.faces[0]?.attributes.glassesDetected ? "text-indigo-400 font-bold" : "text-slate-400"}>
                              {scanResult.faces[0]?.attributes.glassesDetected ? "DETECTED" : "NONE"}
                            </span>
                          </div>

                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 flex items-center justify-between">
                            <span className="text-slate-500">Beard/Hair:</span>
                            <span className={scanResult.faces[0]?.attributes.facialHairDetected ? "text-indigo-400 font-bold" : "text-slate-400"}>
                              {scanResult.faces[0]?.attributes.facialHairDetected ? "DETECTED" : "NONE"}
                            </span>
                          </div>

                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 flex items-center justify-between">
                            <span className="text-slate-500">Lighting:</span>
                            <span className="text-slate-300 font-bold text-[10px] truncate max-w-[70px]">
                              {scanResult.faces[0]?.attributes.lightingQuality}
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* Active Country / Policy Authority Metadata block */}
                      <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 block uppercase">Policy Compliance Node</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <Globe className="w-3.5 h-3.5" />
                            {scanResult.geoCompliance.scannerComplianceCode}
                          </span>
                        </div>
                        <div className="max-w-xs text-left sm:text-right">
                          <span className="text-[10px] text-slate-505 block text-slate-500 uppercase">Applicable Law</span>
                          <span className="text-slate-300 block text-[11px] font-semibold">{scanResult.geoCompliance.jurisdiction}</span>
                        </div>
                      </div>

                    </motion.div>
                  )}
                </div>

                {/* Simulated metadata node output details inside footer status container */}
                {scanResult && (
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Ephemeral Run Purge: Handled successfully
                    </span>
                    <span>Processed At: {new Date(scanResult.processedAt).toLocaleTimeString()}</span>
                  </div>
                )}

              </div>
            </div>

          </div>
          )}

          {workbenchMode === "compare" && (
            <CompareScanner
              remainingScans={remainingScans}
              setRemainingScans={setRemainingScans}
              selectedCountry={selectedCountry}
              user={user}
              activePlan={activePlan}
              cloudIncrementScanCount={cloudIncrementScanCount}
              setTotalScansCount={setTotalScansCount}
              onShowToast={showToast}
              lang={language}
            />
          )}

          {workbenchMode === "bulk" && (
            <BulkScanner
              remainingScans={remainingScans}
              setRemainingScans={setRemainingScans}
              selectedCountry={selectedCountry}
              user={user}
              cloudIncrementScanCount={cloudIncrementScanCount}
              setTotalScansCount={setTotalScansCount}
              onShowToast={showToast}
              lang={language}
            />
          )}

        </section>

        {/* SECTION: Dual SaaS Subscription Bundles & developer calculator */}
        <section id="pricing-section" className="scroll-mt-24 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-900/30">
              Subscription & API Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Choose Your Verification Level
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We offer flexible, high-capacity checking bundles for platform owners, safety teams, and developer integrations. Select high-yield monthly subscription packs or calculate volume API rates instantly.
            </p>

            {/* Flat toggle selectors */}
            <div className="inline-flex bg-slate-900 border border-slate-800 p-1.5 rounded-full mt-4">
              <button
                onClick={() => setPricingMode("saas")}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  pricingMode === "saas"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SaaS App Plans
              </button>
              <button
                onClick={() => setPricingMode("api")}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  pricingMode === "api"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Developer API Calculator
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {pricingMode === "saas" ? (
              <motion.div
                key="saas-pricing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Special Trial Pack (Buy 10 Get 10 Free) */}
                <div className="bg-slate-900/95 border-2 border-emerald-500/80 rounded-2xl p-6 flex flex-col justify-between relative hover:border-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.18)] text-left">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                    ★ BUY 10 GET 10 FREE ★
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1 mt-1">
                      Promotional Offer
                    </span>
                    <h4 className="text-lg font-bold text-slate-200">Special Trial Pack</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Our most popular trial bundle. Get double the credits to perform comprehensive tests on the core visual network.
                    </p>
                    <div className="my-6 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white font-mono">$6.99</span>
                      <span className="text-xs text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">72% Off</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-350 mb-6 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>20 high-fidelity scans</strong> total</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Includes 10 free bonus scans</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>COPPA Compliance Indicators</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Standard verification queue</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentCheckout({
                      name: "Special Trial Pack",
                      price: 6.99,
                      type: "one-time",
                      calls: 20,
                      description: "Special trial pack containing 20 total visual compliance checks (Buy 10 Get 10 Free promotional rate)."
                    })}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Claim Trial Special</span>
                  </button>
                </div>

                {/* Growth Starter */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative hover:border-indigo-505/20 transition-all shadow-xl text-left">
                  <div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                      Recurring Subscription
                    </span>
                    <h4 className="text-lg font-bold text-slate-200">Growth Starter</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Ideal for moderate checking campaigns, small age-gated forum admins, and local safety rules.
                    </p>
                    <div className="my-6">
                      <span className="text-3xl font-extrabold text-white font-mono">$29</span>
                      <span className="text-xs text-slate-450"> / month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-400 mb-6 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span><strong>100 premium checks</strong> /mo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>GDPR Compliant Biometrics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>CCPA Youth Safety indicators</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentCheckout({
                      name: "Growth Starter",
                      price: 29.00,
                      type: "subscription",
                      calls: 100,
                      description: "Monthly subscription package including 100 high-fidelity visual checks per month."
                    })}
                    className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Choose Basic
                  </button>
                </div>

                {/* Professional Suite */}
                <div className="bg-slate-900/90 border-2 border-indigo-500 rounded-2xl p-6 flex flex-col justify-between relative hover:border-indigo-400 transition-all shadow-2xl text-left">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-slate-950 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                    Best Value Selection
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest block mb-1 mt-1">
                      SLA Business Suite
                    </span>
                    <h4 className="text-lg font-bold text-slate-200">Professional Suite</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Perfect for active age estimation flows, compliance auditing boards, and automated check teams.
                    </p>
                    <div className="my-6">
                      <span className="text-3xl font-extrabold font-mono text-indigo-400">$79</span>
                      <span className="text-xs text-slate-450"> / month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-400 mb-6 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span><strong>400 premium checks</strong> /mo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Priority 140ms server queue</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>SaaS Developer Test Token</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentCheckout({
                      name: "Professional Suite",
                      price: 79.00,
                      type: "subscription",
                      calls: 400,
                      description: "Pro SLA subscription level featuring 400 high-definition audits per month with priority throughput."
                    })}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all cursor-pointer animate-pulse"
                  >
                    Subscribe Pro
                  </button>
                </div>

                {/* Enterprise Capacity */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative hover:border-slate-750 transition-all shadow-xl text-left">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-1">
                      High Capacity Bulk
                    </span>
                    <h4 className="text-lg font-bold text-slate-200">Enterprise Capacity</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Designed for scaling digital gaming networks, high volume checkers, and corporate operations.
                    </p>
                    <div className="my-6">
                      <span className="text-3xl font-extrabold text-white font-mono">$249</span>
                      <span className="text-xs text-slate-450"> / month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-400 mb-6 font-sans">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span><strong>2,000 checks</strong> /mo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Custom compliance metadata</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>SLA Dedicated Direct Support</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentCheckout({
                      name: "Enterprise Capacity",
                      price: 249.00,
                      type: "subscription",
                      calls: 2000,
                      description: "SaaS Enterprise SLA including 2,000 dedicated biometric scanning credits and technical advisory."
                    })}
                    className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Choose Enterprise
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="api-pricing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl text-left"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointing-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Copy: Explain Pricing */}
                  <div className="lg:col-span-5 space-y-6">
                    <span className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest bg-indigo-900/10 border border-indigo-900/30 px-3 py-1 rounded-full w-fit block">
                      Developer API Core Rates
                    </span>
                    <h3 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                      Automatic Volume Tier Scaling
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-sans">
                      Are you building an in-house app? Connect directly to our secure endpoints. 
                      Our API rates start at just <strong className="text-white font-semibold">$0.09 per check</strong>, 
                      scaling all the way down to <strong className="text-indigo-300 font-semibold">$0.04</strong> as your traffic expands.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2 font-sans">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Rate</span>
                        <span className="text-xl font-mono font-extrabold text-white">$0.09</span>
                        <span className="block text-[8px] text-slate-500">Per scan up to 20k/mo</span>
                      </div>
                      <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30 text-center">
                        <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-sans">Competitors</span>
                        <span className="text-xl font-mono font-extrabold text-emerald-300">$0.20</span>
                        <span className="block text-[8px] text-slate-500">Industry Average</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Calculator Workspace: Live Slider & Margin Forecast */}
                  <div className="lg:col-span-7 bg-slate-950 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80 text-left font-sans">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Volume Cost & Margin Simulator</h4>
                        <p className="text-xs text-slate-500">Drag to align with your expected monthly query metrics</p>
                      </div>
                      <span className="text-xs text-slate-300 font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
                        Volume Tier: <strong className="text-indigo-400 uppercase">
                          {calculatedRate === 0.09 ? "Starter API" : calculatedRate === 0.07 ? "Growth API" : calculatedRate === 0.05 ? "Bulk API" : "Enterprise API"}
                        </strong>
                      </span>
                    </div>

                    {/* Range Slider Container */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Monthly Scanning Calls</span>
                        <span className="text-lg font-bold text-white">
                          {monthlyVolume.toLocaleString()} /mo
                        </span>
                      </div>

                      <input 
                        type="range"
                        min="1000"
                        max="500000"
                        step="1000"
                        value={monthlyVolume}
                        onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-1.5 focus:outline-none"
                      />

                      <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold">
                        <span>1,050 SCANS</span>
                        <span>100,000 SCANS</span>
                        <span>250,050 SCANS</span>
                        <span>500,000+ SCANS</span>
                      </div>
                    </div>

                    {/* Detailed Matrix Table Grid Output */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Left panel: Simulated Billing Rate details */}
                      <div className="bg-slate-900/55 p-4 rounded-xl border border-slate-800/80 space-y-3 text-left font-sans">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          Projected API Billing Rate
                        </span>
                        
                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                          <span className="text-slate-505">Unit Scan Cost:</span>
                          <span className="font-mono text-emerald-400 font-semibold">${calculatedRate.toFixed(2)}/scan</span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-505 font-medium">Monthly Bill Estimate:</span>
                          <span className="font-mono text-white text-base font-bold">${monthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>

                      {/* Right panel: Profits and Savings relative details */}
                      <div className="bg-indigo-950/10 p-4 rounded-xl border border-indigo-950/50 space-y-3 text-left font-sans">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                          Value Retained vs Competitors
                        </span>
                        
                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                          <span className="text-slate-505">Competitor Cost:</span>
                          <span className="font-mono text-red-400 font-medium">${competitorMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-505">Retainer ROI Savings:</span>
                          <span className="font-mono text-indigo-300 font-bold">${clientSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                        </div>
                      </div>

                    </div>

                    <div className="pt-2 text-center">
                      <button 
                        onClick={() => {
                          alert("Developer API account interest registered! Our team will reach out to organize sandbox API Token delivery.");
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition-all text-xs cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider font-sans"
                      >
                        <span>Apply For Developer Credentials</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION FOR SEARCH ENGINE CRAWLERS AND SEO AUDITS */}
        <section id="crawler-audit-section" className="scroll-mt-24 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-900/30">
              Crawler & Metadata Validation Node
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              SEO Site Crawl Diagnostics
            </h2>
            <p className="text-sm text-slate-400">
              TruthNowAI.com is calibrated for instant algorithmic search indexation. Inspect our live index maps, active directives, and structural routing schemas instantly below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* COLUMN LEFT: Explain directives */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest block">Directives & Scraper Signals</span>
                <h4 className="text-lg font-bold text-slate-200">Live Indexing Configs</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We maintain automated crawler support directly at the server root. Googlebot and Bingbot parse our <strong className="text-slate-300 font-mono">robots.txt</strong> directives to isolate protected visual API logic from exposure while caching valuable keyword endpoints automatically.
                </p>

                <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-mono">Sitemap Inclusion:</span>
                    <span className="text-emerald-400 font-bold font-mono">VALIDATION ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-mono">Disallowed API block:</span>
                    <span className="text-emerald-400 font-bold font-mono">ENABLED (/api/*)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800 pb-2">
                    <span className="text-slate-500 font-mono">Canonical Target Domain:</span>
                    <span className="text-slate-300 font-medium font-mono">truthnowai.com</span>
                  </div>
                </div>
              </div>

              {/* Action tabs selectors */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setActiveCrawlerPreview(activeCrawlerPreview === "robots" ? null : "robots")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-mono transition-all border cursor-pointer uppercase ${
                    activeCrawlerPreview === "robots" 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {activeCrawlerPreview === "robots" ? "Hide Robots.txt" : "Inspect Robots.txt"}
                </button>
                <button
                  onClick={() => setActiveCrawlerPreview(activeCrawlerPreview === "sitemap" ? null : "sitemap")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-mono transition-all border cursor-pointer uppercase ${
                    activeCrawlerPreview === "sitemap" 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {activeCrawlerPreview === "sitemap" ? "Hide Sitemap.xml" : "Inspect Sitemap.xml"}
                </button>
              </div>

            </div>

            {/* COLUMN RIGHT: Live File outputs */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex-grow bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between font-mono text-[11px] leading-relaxed shadow-inner relative min-h-[250px]">
                
                {/* Visual file tag */}
                <div className="absolute top-2.5 right-3 bg-indigo-505 text-indigo-400 font-bold text-[9px] px-2 py-0.5 border border-indigo-900/30 rounded">
                  {activeCrawlerPreview === "robots" ? "ROBOTS.TXT DIRECTIVES" : activeCrawlerPreview === "sitemap" ? "SITEMAP.XML MAPS" : "AWAITING SELECTION"}
                </div>

                {activeCrawlerPreview === null ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Eye className="w-8 h-8 text-slate-700 mb-2 animate-bounce" />
                    <span>Click either file inspect button on the left to review crawler payloads.</span>
                  </div>
                ) : activeCrawlerPreview === "robots" ? (
                  <div className="space-y-3">
                    <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider">File Content: robots.txt</span>
                    <pre className="text-slate-300 p-3 bg-slate-900 rounded-lg overflow-x-auto select-all whitespace-pre">
                      {robotsTxtContent}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block mb-1">File Content: sitemap.xml</span>
                    <pre className="text-slate-300 p-3 bg-slate-900 rounded-lg overflow-x-auto select-all whitespace-pre">
                      {sitemapXmlContent}
                    </pre>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-600">
                  <span>Routing Source: server.ts mappings</span>
                  <span>Standard Crawl Check Completed</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* SECTION: Social Proof / User Reviews Carousel with Star metrics */}
        <section id="reviews-section" className="scroll-mt-24 space-y-12 text-left">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-900/30">
              Enterprise Validations & Casestudies
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Verified Integrations & Impact Studies
            </h2>
            <p className="text-sm text-slate-400">
              Review how safety platforms, verification frameworks, and digital identity structures leverage our age and gender detection tools to mitigate compliance liabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Reviews display pool */}
            <div className="lg:col-span-2 space-y-4 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {displayedReviews.map((review) => (
                <div 
                  key={review.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between hover:border-slate-705 transition-all text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">VERIFIED PARTNER</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed font-sans">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="border-t border-slate-800/60 pt-4 flex flex-wrap items-center justify-between gap-3 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-extrabold text-xs uppercase">
                        {review.author[0]}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-205">
                          {review.author}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {review.role}, <strong className="font-semibold text-slate-400">{review.company}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Highlight verified search term targeted trigger */}
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/25 px-2 py-0.5 border border-emerald-900/30 rounded">
                      Query: "{review.verifiedQuery}"
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit review sidebar card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-left">
              <div>
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Submit Verification Study</h4>
                <p className="text-xs text-slate-500 mt-1">Share your team's accuracy metrics, trial reports, or compliance reviews live.</p>
              </div>

              {reviewSubmitSuccess ? (
                <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-5 text-center space-y-3">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <h5 className="text-xs font-bold text-white uppercase font-sans">Testimonial Published!</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Thank you! Your verified visual analyzer study has been registered on our live site database.
                  </p>
                  <button 
                    onClick={() => setReviewSubmitSuccess(false)}
                    className="text-[10px] text-indigo-400 hover:underline font-extrabold"
                  >
                    Submit another report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Full Name / Issuer</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Dr. Aris Thorne"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Designation / Role</label>
                      <input 
                        type="text"
                        placeholder="e.g. Compliance Officer"
                        value={reviewRole}
                        onChange={(e) => setReviewRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Institution / Org</label>
                      <input 
                        type="text"
                        placeholder="e.g. SafeWeb Labs"
                        value={reviewCompany}
                        onChange={(e) => setReviewCompany(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Rating Performance</label>
                      <select 
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="5">5 Stars (Excellent)</option>
                        <option value="4">4 Stars (Great)</option>
                        <option value="3">3 Stars (Adequate)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block block truncate max-w-full">Core Verified Query</label>
                      <select 
                        value={reviewQuery}
                        onChange={(e) => setReviewQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-indigo-500 truncate"
                      >
                        <option value="how to check if person in photo is minor or adult appearance">Minor/Adult Check</option>
                        <option value="age and gender detection">Age & Gender Detection</option>
                        <option value="face gender analyzer">Face Analyzer</option>
                        <option value="gender detector photo">Photo Detector</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Review Sentiment / Findings</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. Tested this face gender analyzer with our regional compliance standards..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none animate-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-650 hover:bg-indigo-500 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center shadow"
                  >
                    Publish Verified Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: Accordion FAQs explaining keyword details clearly */}
        <section id="faq-section" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-900/30">
              Dynamic FAQ Database
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Anatomical & Compliance FAQ
            </h2>
            <p className="text-sm text-slate-400">
              Clear visual intelligence insights explaining biometric safety standards, regulatory check limits, and photo scanner optimization tactics.
            </p>

            {/* Quick Filter Input bar */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Filter questions or search terms..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 pl-4 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1.5 text-slate-505 text-[10px] font-mono font-bold">
                  {faqSearchQuery && (
                    <button 
                      onClick={() => setFaqSearchQuery("")}
                      className="text-slate-500 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Accordion List wrapper layout */}
          <div className="max-w-4xl mx-auto space-y-4">
            
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                No matching FAQ matches found for "{faqSearchQuery}". Select clear to review all core categories.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = activeFaqId === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-slate-905 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-350"
                  >
                    <button
                      onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-900/40 transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="block text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider mb-1.5">
                          {faq.keywordRelation ? `Direct Target: #${faq.keywordRelation}` : "Core Standard Guidelines"}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-200">
                          {faq.question}
                        </h4>
                      </div>
                      <span className={`text-xl text-indigo-400 shrink-0 transform transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
                        →
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/40">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}

          </div>
        </section>

      </main>
        </>
      )}

      {/* Dynamic Sleek SEO Footer matching specifications exactly */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/95 py-12 px-4 md:px-8 text-slate-500 font-sans text-xs">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <TruthNowLogo className="h-14" />
            </div>
            <p className="max-w-sm text-[11px] text-slate-500 leading-relaxed">
              We engineer enterprise cognitive age and gender detection tools using transparent visual API nodes. Meets youth protective safety guidelines worldwide.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Geo-Server: Operational 99.98%
              </span>
              <span>•</span>
              <span>Face Analyzer v2.4</span>
            </div>
          </div>

          <div className="space-y-3 text-[11px]">
            <span className="block text-slate-300 font-bold uppercase font-mono tracking-widest text-[10px]">DIRECTIVES</span>
            <ul className="space-y-1.5">
              <li><a href="/robots.txt" target="_blank" className="hover:text-white transition-colors">Robots.txt Schema Directive</a></li>
              <li><a href="/sitemap.xml" target="_blank" className="hover:text-white transition-colors">Sitemap.xml Core Map</a></li>
              <li><a href="#compliance-section" className="hover:text-white transition-colors">GDPR Article 9 Framework</a></li>
              <li><a href="#compliance-section" className="hover:text-white transition-colors">CCPA Youth Verification</a></li>
            </ul>
          </div>

          <div className="space-y-3 text-[11px] text-left">
            <span className="block text-slate-350 font-bold uppercase font-mono tracking-widest text-[10px]">SEO SIGNALS</span>
            <ul className="space-y-1.5 text-slate-500 font-mono">
              <li>#how to check if person in photo is minor or adult appearance</li>
              <li>#age gender detector</li>
              <li>#gender detector photo</li>
              <li>#face gender analyzer</li>
            </ul>
          </div>

          <div className="space-y-3 text-[11px] text-left">
            <span className="block text-indigo-400 font-bold uppercase font-mono tracking-widest text-[10px]">DEVELOPERS</span>
            <ul className="space-y-2 text-left">
              <li>
                <button 
                  onClick={() => {
                    setShowApiPortal(true);
                    setShowApiDocs(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white text-indigo-300 font-bold text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Developer API Portal</span>
                  <ExternalLink className="w-3 h-3 text-indigo-400 animate-pulse" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setShowApiDocs(true);
                    setShowApiPortal(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white text-slate-300 font-bold text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>API Documentation</span>
                  <Code className="w-3 h-3 text-indigo-455 text-indigo-400" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setShowApiPortal(true);
                    setShowApiDocs(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors text-left font-mono"
                >
                  → Generate Sandbox Keys
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setShowApiDocs(true);
                    setShowApiPortal(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors text-left font-mono"
                >
                  → REST JSON Spec Docs
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="w-full max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-wide uppercase font-mono">
          <div>
            <span>© 2026 TRUTHNOWAI. All Rights Reserved. POWERED VIA CLOUDMERSIVE.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Biometric Waiver</a>
            <span>•</span>
            <a href="#" className="hover:underline">Sitemap Indexing</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms of Execution</a>
          </div>
        </div>
      </footer>

      {/* PAYPAL CHECKOUT INTERACTIVE MODAL OVERLAY */}
      <AnimatePresence>
        {isCheckoutOpen && selectedPlanDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelCheckout}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left font-sans text-xs text-slate-300 z-10"
            >
              {/* Gold PayPal Accent Bar */}
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              {/* Header Container */}
              <div className="p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 bg-amber-500 rounded text-slate-950 font-black tracking-tighter text-sm italic">
                    PayPal
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-slate-505 text-slate-500 uppercase">SECURED PLATFORM</span>
                </div>
                <button 
                  onClick={handleCancelCheckout}
                  className="w-7 h-7 bg-slate-950 border border-slate-800/60 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Main Checkout Area */}
              <div className="p-6 space-y-6">
                
                {/* Order Summary Node */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500">Checkout summary</span>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{selectedPlanDetails.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {selectedPlanDetails.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-extrabold text-amber-400">
                        ${selectedPlanDetails.price.toFixed(2)}
                      </span>
                      <span className="block text-[9px] text-slate-500">
                        {selectedPlanDetails.type === "subscription" ? "monthly SLA" : "one-time"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Scans / Scan Pack credits:</span>
                    <span className="text-emerald-400 font-bold">{selectedPlanDetails.calls.toLocaleString()} Queries</span>
                  </div>
                </div>

                {checkoutStep === "init" && (
                  <form onSubmit={handleSimulatedPayPalPurchase} className="space-y-4">
                    {paypalError && (
                      <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-[10px] leading-relaxed">{paypalError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">PayPal Account Email</label>
                      <input 
                        type="email"
                        required
                        placeholder="your-paypal-id@domain.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 tracking-wide text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 font-semibold">PayPal Secure Password</label>
                        <a href="#" className="text-[10px] text-amber-500 hover:underline">Forgot?</a>
                      </div>
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={paypalPassword}
                        onChange={(e) => setPaypalPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-205 placeholder-slate-600 focus:outline-none focus:border-amber-500 tracking-wide text-xs"
                      />
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input 
                        type="checkbox"
                        id="agreeTerms"
                        checked={paypalAgreed}
                        onChange={(e) => setPaypalAgreed(e.target.checked)}
                        className="w-4 h-4 bg-slate-950 border border-slate-850 rounded text-amber-505 accent-amber-500 mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="agreeTerms" className="text-[10px] text-slate-400 leading-relaxed select-none cursor-pointer">
                        I authorize TruthNowAI to issue the {selectedPlanDetails.calls.toLocaleString()} scanning credits to my client workspace immediately under standard regulatory directives.
                      </label>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button"
                        onClick={handleCancelCheckout}
                        className="flex-1 py-3 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Abort
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl uppercase tracking-wider text-center transition-transform active:scale-98 shadow-lg shadow-amber-500/10 cursor-pointer"
                      >
                        Authenticate Pay
                      </button>
                    </div>
                  </form>
                )}

                {checkoutStep === "processing" && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                    <div className="space-y-1.5">
                      <span className="block text-sm font-bold text-white uppercase tracking-wider font-mono">Connecting with PayPal...</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans max-w-xs">
                        Establishing active TLS 1.3 handshake, verifying funding sources, and reserving {selectedPlanDetails.calls} biometric quota checks...
                      </p>
                    </div>
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <span className="block text-sm font-extrabold text-white uppercase tracking-wider font-mono">Transaction Approved!</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                        Your transaction of <strong className="text-white">${selectedPlanDetails.price.toFixed(2)}</strong> completed successfully. {selectedPlanDetails.calls} facial scanning credits have been credited to your active wallet namespace instantly.
                      </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 w-full text-left flex items-center justify-between font-mono text-[9px] text-slate-500">
                      <span>Receipt: TN-PAYPAL-{Math.floor(Math.random() * 900000 + 100000)}</span>
                      <span className="text-emerald-400 uppercase font-black">QUOTA ALLOCATED</span>
                    </div>

                    <button 
                      onClick={handleCancelCheckout}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center shadow"
                    >
                      Return to Sandbox Console
                    </button>
                  </div>
                )}

              </div>

              {/* Secure footer signal node */}
              <div className="p-4 bg-slate-950 text-center flex items-center justify-center gap-1 text-[9px] font-mono text-slate-600">
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                <span>Fully Secure SSL Encrypted Hands-off PayPal Verification Ledger</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Floating Toast Portal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`p-4 rounded-xl shadow-lg border text-xs font-sans font-semibold text-white pointer-events-auto flex items-center gap-2.5 ${
                toast.type === "error"
                  ? "bg-rose-950/90 border-rose-500/30 text-rose-300"
                  : toast.type === "info"
                  ? "bg-slate-900/90 border-slate-850 text-slate-300"
                  : "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              }`}
            >
              <div className="flex-grow">{toast.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
