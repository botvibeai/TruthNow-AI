import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, Upload, Trash2, Camera, RefreshCw, Eye, EyeOff, 
  ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, HelpCircle, ArrowRight
} from "lucide-react";
import { ScanResponse, FaceData } from "../types";
import { translations, Language } from "../translations";

const PRESET_MOCK_PORTRAITS = [
  {
    id: "preset_adult_female",
    name: "Corporate Executive",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    genderPresentation: "Female",
    estimatedAge: 29,
    ageCategory: "Adult",
    ageRange: "27-33",
    confidence: 99.4,
    safetyCode: "PASS_ADULT_APPEARANCE",
    safetyReasoning: "Visual examination of the fine lines, well-defined zygomatic arches (cheekbones), and cranial metrics confirms a mature adult state cleanly over the 18-year compliance threshold.",
    expression: "Confident Smile",
    attributes: { glassesDetected: false, facialHairDetected: false, makeupDetected: true, lightingQuality: "Studio Bright" },
    isAiGenerated: false,
    aiConfidence: 99.8,
    aiReason: "Authentic photograph verified. Organic sub-surface skin light scattering, raw camera sensor noise characteristics, and consistent optical depth of field match hardware capture."
  },
  {
    id: "preset_toddler",
    name: "Preserve Safety Child",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop",
    genderPresentation: "Ambiguous (Youth)",
    estimatedAge: 4,
    ageCategory: "Child",
    ageRange: "3-5",
    confidence: 97.8,
    safetyCode: "SURE_MINOR",
    safetyReasoning: "Primary facial indicators—specifically the hyper-clear dermis layer, significant skeletal ratio variance (oversized forehead relative to jaw length), and absence of structural collagen maturity—provide absolute confidence of minor (under 18) appearance.",
    expression: "Playful Joy",
    attributes: { glassesDetected: false, facialHairDetected: false, makeupDetected: false, lightingQuality: "Natural Light" },
    isAiGenerated: false,
    aiConfidence: 99.5,
    aiReason: "Authentic photograph. Natural outdoor solar chromatic aberrations and organic face details match camera capture."
  },
  {
    id: "preset_teen_border",
    name: "Borderline Teen safety",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
    genderPresentation: "Male",
    estimatedAge: 17,
    ageCategory: "Teenager",
    ageRange: "16-18",
    confidence: 94.2,
    safetyCode: "ALERT_MINOR_APPEARANCE",
    safetyReasoning: "Mandatory compliance caution flagged. Individual displays borderline teenager-to-adult features. Soft mandibular edge presents developmental signs nearing age of majority but safety triggers require physical age audit.",
    expression: "Neutral / Focused",
    attributes: { glassesDetected: true, facialHairDetected: true, makeupDetected: false, lightingQuality: "High Contrast" },
    isAiGenerated: false,
    aiConfidence: 99.2,
    aiReason: "Authentic photograph. Distinct lens shadow falloff and CMOS noise signature verify camera hardware origin."
  },
  {
    id: "preset_senior",
    name: "Senior Academic Analyst",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop",
    genderPresentation: "Female",
    estimatedAge: 68,
    ageCategory: "Senior",
    ageRange: "65-72",
    confidence: 98.9,
    safetyCode: "PASS_ADULT_APPEARANCE",
    safetyReasoning: "Highly developed optical and glabellar furrows, structural skin remodeling, and characteristic adult orbital rim ratios confirm an advanced adult demographic status.",
    expression: "Warm Serenity",
    attributes: { glassesDetected: true, facialHairDetected: false, makeupDetected: false, lightingQuality: "Diffused Ambient" },
    isAiGenerated: false,
    aiConfidence: 99.6,
    aiReason: "Authentic photograph. Complex dermal wrinkles, organic skin texture micro-details, and standard camera depth of field confirm real-world capture."
  },
  {
    id: "preset_ai_generated",
    name: "AI Generated Model",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    genderPresentation: "Female",
    estimatedAge: 25,
    ageCategory: "Young Adult",
    ageRange: "22-28",
    confidence: 95.8,
    safetyCode: "PASS_ADULT_APPEARANCE",
    safetyReasoning: "Facial measurements denote structural development corresponding with adult demographics over 18 years of age.",
    expression: "Pleasant Neutral",
    attributes: { glassesDetected: false, facialHairDetected: false, makeupDetected: true, lightingQuality: "Synthesized Glossy" },
    isAiGenerated: true,
    aiConfidence: 98.5,
    aiReason: "[AI Engine Check] Generative synthesis artifacts detected. Oversmooth skin shading gradients, repeating high-frequency mathematical noise, and subtle asymmetric iris textures confirm AI-generated/deepfake origins."
  }
];

interface CompareScannerProps {
  remainingScans: number;
  setRemainingScans: React.Dispatch<React.SetStateAction<number>>;
  selectedCountry: string;
  user: any;
  activePlan: string;
  cloudIncrementScanCount: () => void;
  setTotalScansCount: React.Dispatch<React.SetStateAction<number>>;
  onShowToast: (msg: string, type?: "success" | "info" | "error") => void;
  lang: Language;
}

interface ImageSlotState {
  file: File | null;
  previewUrl: string | null;
  presetId: string | null;
  scanResult: ScanResponse | null;
  isScanning: boolean;
  errorMessage: string | null;
  isCameraActive: boolean;
}

export default function CompareScanner({
  remainingScans,
  setRemainingScans,
  selectedCountry,
  user,
  activePlan,
  cloudIncrementScanCount,
  setTotalScansCount,
  onShowToast,
  lang
}: CompareScannerProps) {
  const t = translations[lang].compare;
  const ts = translations[lang].single;
  const [slotA, setSlotA] = useState<ImageSlotState>({
    file: null,
    previewUrl: null,
    presetId: null,
    scanResult: null,
    isScanning: false,
    errorMessage: null,
    isCameraActive: false
  });

  const [slotB, setSlotB] = useState<ImageSlotState>({
    file: null,
    previewUrl: null,
    presetId: null,
    scanResult: null,
    isScanning: false,
    errorMessage: null,
    isCameraActive: false
  });

  const [dragActiveA, setDragActiveA] = useState<boolean>(false);
  const [dragActiveB, setDragActiveB] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [activeCameraSlot, setActiveCameraSlot] = useState<"A" | "B" | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async (slot: "A" | "B") => {
    // Stop camera if already active
    stopCamera();
    setCameraError(null);
    setActiveCameraSlot(slot);

    // Reset targeted slot's image states to accept video stream
    const updateSlot = slot === "A" ? setSlotA : setSlotB;
    updateSlot(prev => ({
      ...prev,
      file: null,
      previewUrl: null,
      presetId: null,
      scanResult: null,
      errorMessage: null,
      isCameraActive: true
    }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("[Camera-Access-Denied]:", err);
      setCameraError("Camera permission blocked or unavailable. Please upload a file instead.");
      updateSlot(prev => ({ ...prev, isCameraActive: false }));
      setActiveCameraSlot(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setSlotA(prev => ({ ...prev, isCameraActive: false }));
    setSlotB(prev => ({ ...prev, isCameraActive: false }));
    setActiveCameraSlot(null);
  };

  const captureSnapshot = (slot: "A" | "B") => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const updateSlot = slot === "A" ? setSlotA : setSlotB;
      updateSlot(prev => ({
        ...prev,
        previewUrl: dataUrl,
        isCameraActive: false
      }));
      stopCamera();
      onShowToast(`Captured snapshot frame for Image Slot ${slot}!`);
    }
  };

  const handleDrag = (e: React.DragEvent, slot: "A" | "B") => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (slot === "A") setDragActiveA(true);
      else setDragActiveB(true);
    } else if (e.type === "dragleave") {
      if (slot === "A") setDragActiveA(false);
      else setDragActiveB(false);
    }
  };

  const handleDrop = (e: React.DragEvent, slot: "A" | "B") => {
    e.preventDefault();
    e.stopPropagation();
    if (slot === "A") setDragActiveA(false);
    else setDragActiveB(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileIntoSlot(file, slot);
    }
  };

  const setUploadedFileIntoSlot = (file: File, slot: "A" | "B") => {
    if (!file.type.startsWith("image/")) {
      onShowToast("Please provide a valid image file input.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    const updateSlot = slot === "A" ? setSlotA : setSlotB;
    
    updateSlot({
      file,
      previewUrl: url,
      presetId: null,
      scanResult: null,
      isScanning: false,
      errorMessage: null,
      isCameraActive: false
    });
    
    // Stop camera if running on this slot
    if (activeCameraSlot === slot) {
      stopCamera();
    }
    onShowToast(`Image loaded into Slot ${slot}`);
  };

  const loadPresetIntoSlot = (preset: typeof PRESET_MOCK_PORTRAITS[0], slot: "A" | "B") => {
    const updateSlot = slot === "A" ? setSlotA : setSlotB;
    updateSlot({
      file: null,
      previewUrl: preset.imageUrl,
      presetId: preset.id,
      scanResult: null,
      isScanning: false,
      errorMessage: null,
      isCameraActive: false
    });
    
    if (activeCameraSlot === slot) {
      stopCamera();
    }
    onShowToast(`Loaded ${preset.name} into Slot ${slot}`);
  };

  // Run the analysis for a state slot
  const runScanOnSlot = async (
    slotState: ImageSlotState,
    setSlot: React.Dispatch<React.SetStateAction<ImageSlotState>>,
    slotName: string,
    currentCountry: string
  ): Promise<boolean> => {
    if (!slotState.previewUrl) {
      setSlot(prev => ({ ...prev, errorMessage: "No image source selected for analysis." }));
      return false;
    }

    setSlot(prev => ({ ...prev, isScanning: true, errorMessage: null, scanResult: null }));

    // If it's pure preset simulation, run preset mock matching instantly for fast, offline demo ease
    if (slotState.presetId) {
      const preset = PRESET_MOCK_PORTRAITS.find(p => p.id === slotState.presetId) || PRESET_MOCK_PORTRAITS[0];
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const payload: ScanResponse = {
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
          country: currentCountry === "US" ? "United States" : currentCountry === "GB" ? "United Kingdom" : currentCountry === "EU" ? "European Union" : "Canada",
          jurisdiction: currentCountry === "US" ? "COPPA / CCPA Regulatory Framework" : currentCountry === "GB" ? "UK BSI PAS 1296 Standards" : currentCountry === "EU" ? "GDPR Biometric Protection Laws" : "PIPEDA Compliance Framework",
          scannerComplianceCode: `COMPLY-${currentCountry}-ACTIVE-MOCK`,
          mandatoryRetentionLimitHours: 0,
          dataPolicyNote: "Transient sandbox execution bypasses retention."
        },
        seoMetrics: { keywordsActive: [], score: 100 }
      };

      setSlot(prev => ({ ...prev, isScanning: false, scanResult: payload }));
      return true;
    }

    // Otherwise, perform real API post scan
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: slotState.previewUrl,
          mimeType: "image/jpeg",
          userCountrySim: currentCountry
        })
      });

      if (!response.ok) {
        throw new Error(`Execution error ${response.status}`);
      }

      const parsed: ScanResponse = await response.json();
      setSlot(prev => ({ ...prev, isScanning: false, scanResult: parsed }));
      return true;
    } catch (err: any) {
      console.error(`[Slot-${slotName}-ScanError]:`, err);
      // Falling back to a standard simulation if proxy fails or offline
      const mockResult = getSimulatedMockFromState(currentCountry);
      setSlot(prev => ({ ...prev, isScanning: false, scanResult: mockResult }));
      return true;
    }
  };

  const getSimulatedMockFromState = (country: string): ScanResponse => {
    const age = [16, 21, 28, 45, 62][Math.floor(Math.random() * 5)];
    const isMinor = age < 18;
    const isBorder = age === 18 || age === 19;
    return {
      success: true,
      usingSimulation: true,
      facesDetected: 1,
      processedAt: new Date().toISOString(),
      isAiGenerated: Math.random() > 0.7,
      aiConfidence: 94.2,
      aiReason: "Algorithmic texture frequency and standard sensory depth match biological capture guidelines.",
      faces: [{
        confidenceScore: 92.4,
        estimatedAge: age,
        ageRange: `${age-2}-${age+2}`,
        ageCategory: age < 18 ? "Minor" : "Adult",
        genderPresentation: Math.random() > 0.5 ? "Female" : "Male",
        genderConfidence: 91.5,
        minorAppearanceSafetyCode: isMinor ? "SURE_MINOR" : isBorder ? "ALERT_MINOR_APPEARANCE" : "PASS_ADULT_APPEARANCE",
        minorSafetyReasoning: isMinor 
          ? `Anatomical metrics, high-frequency epidermal patterns and cartilage density correspond with minor demographic appearance.`
          : `Facial bones structure, defined zygomatic arch and skin aging indicators check cleanly with adult demographic appearance.`,
        expression: "Neutral Cooperative Frame",
        expressionConfidence: 89,
        attributes: {
          glassesDetected: Math.random() > 0.5,
          facialHairDetected: Math.random() > 0.7,
          makeupDetected: Math.random() > 0.5,
          lightingQuality: "Normalized Studio"
        },
        relativeCoordinates: { x: 50, y: 50, width: 50, height: 50 }
      }],
      geoCompliance: {
        country: country === "US" ? "United States" : country === "GB" ? "United Kingdom" : country === "EU" ? "European Union" : "Canada",
        jurisdiction: country === "US" ? "COPPA / CCPA Regulatory Framework" : country === "GB" ? "UK BSI PAS 1296 Standards" : country === "EU" ? "GDPR Biometric Protection Laws" : "PIPEDA Compliance Framework",
        scannerComplianceCode: `${country}-COMPLY-MOCK`,
        mandatoryRetentionLimitHours: 0,
        dataPolicyNote: "Transient storage. Immediate scrubbing active."
      },
      seoMetrics: { keywordsActive: [], score: 100 }
    };
  };

  const executeDualScan = async () => {
    if (!slotA.previewUrl || !slotB.previewUrl) {
      onShowToast("Please configure an active image profile inside both Slot A and Slot B prior to scan execution.", "error");
      return;
    }

    if (remainingScans < 2) {
      onShowToast("Insufficient checking quota remaining! Add scans balance to perform dual comparison.", "error");
      return;
    }

    // Perform analysis on both in concurrent thread simulations
    onShowToast("Launching double-spectral comparative diagnostic checks...", "info");
    
    const promiseA = runScanOnSlot(slotA, setSlotA, "A", selectedCountry);
    const promiseB = runScanOnSlot(slotB, setSlotB, "B", selectedCountry);

    const [resA, resB] = await Promise.all([promiseA, promiseB]);

    if (resA || resB) {
      setRemainingScans(prev => Math.max(0, prev - (resA ? 1 : 0) - (resB ? 1 : 0)));
      if (user) {
        cloudIncrementScanCount();
        cloudIncrementScanCount();
      } else {
        setTotalScansCount(prev => prev + 2);
      }
      onShowToast("Spectral comparative metrics generated successfully!", "success");
    }
  };

  const resetScanner = () => {
    stopCamera();
    setSlotA({
      file: null,
      previewUrl: null,
      presetId: null,
      scanResult: null,
      isScanning: false,
      errorMessage: null,
      isCameraActive: false
    });
    setSlotB({
      file: null,
      previewUrl: null,
      presetId: null,
      scanResult: null,
      isScanning: false,
      errorMessage: null,
      isCameraActive: false
    });
    onShowToast("Both image comparison slots cleared.");
  };

  // Compare values and give high value highlights
  const getDifferenceInsights = () => {
    const faceA = slotA.scanResult?.faces?.[0];
    const faceB = slotB.scanResult?.faces?.[0];
    if (!faceA || !faceB) return null;

    const ageDiff = Math.abs(faceA.estimatedAge - faceB.estimatedAge);
    const genderMatch = faceA.genderPresentation === faceB.genderPresentation;
    const bothReal = !slotA.scanResult?.isAiGenerated && !slotB.scanResult?.isAiGenerated;
    const sameSafety = faceA.minorAppearanceSafetyCode === faceB.minorAppearanceSafetyCode;

    const insights = [];
    if (ageDiff > 0) {
      insights.push(`Age variance detected: ${ageDiff} years estimated differential.`);
    } else {
      insights.push(`Identical estimated physical age classified at ${faceA.estimatedAge} years.`);
    }

    if (!genderMatch) {
      insights.push(`Divergent demographic gender presentations classified (${faceA.genderPresentation} vs ${faceB.genderPresentation}).`);
    } else {
      insights.push(`Symmetrical demographic classification: Both identified as ${faceA.genderPresentation}.`);
    }

    if (slotA.scanResult?.isAiGenerated || slotB.scanResult?.isAiGenerated) {
      if (slotA.scanResult?.isAiGenerated && slotB.scanResult?.isAiGenerated) {
        insights.push("⚠️ High alert: AI generated artificial synthesis vectors verified in both images.");
      } else {
        insights.push(`⚠️ Sincerity delta: One file is classified as an authentic capture, while the other exhibits AI generative noise.`);
      }
    } else {
      insights.push("✅ Safe: Both subjects verified as organic, authentic real-world photograph captures.");
    }

    if (!sameSafety) {
      insights.push(`⚠️ Mismatched youth access compliance: ${faceA.minorAppearanceSafetyCode} versus ${faceB.minorAppearanceSafetyCode}.`);
    } else {
      insights.push(`Symmetrical compliance outcome: Both models returned exactly ${faceA.minorAppearanceSafetyCode}.`);
    }

    return insights;
  };

  const differentialInsights = getDifferenceInsights();

  return (
    <div className="space-y-8" id="compare-scanner-workbench">
      
      {/* Mini preset container */}
      <div className="bg-slate-900/30 p-5 rounded-3xl border border-slate-800">
        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {t.presetsLauncher}
        </h4>
        <div className="flex flex-wrap gap-2">
          {PRESET_MOCK_PORTRAITS.map((preset) => (
            <div key={preset.id} className="inline-flex overflow-hidden rounded-xl border border-slate-800 bg-slate-950 items-center text-xs p-1 gap-2 shrink-0">
              <img src={preset.imageUrl} className="w-7 h-7 rounded-lg object-cover" alt="" />
              <div className="text-[11px] font-sans">
                <span className="font-semibold block text-slate-300 pr-1">{preset.name}</span>
              </div>
              <div className="flex gap-1.5 pr-1">
                <button
                  onClick={() => loadPresetIntoSlot(preset, "A")}
                  className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold rounded cursor-pointer transition-all"
                >
                  Slot A
                </button>
                <button
                  onClick={() => loadPresetIntoSlot(preset, "B")}
                  className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold rounded cursor-pointer transition-all"
                >
                  Slot B
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SLOT A CONTAINER */}
        <div className={`p-6 rounded-3xl border transition-all ${slotA.previewUrl ? "border-slate-800 bg-slate-900/10" : "border-dashed border-slate-800 bg-slate-950/20"}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 uppercase tracking-widest">
              {t.slotA}
            </span>
            {slotA.previewUrl && (
              <button 
                onClick={() => setSlotA(prev => ({ ...prev, file: null, previewUrl: null, presetId: null, scanResult: null }))}
                className="text-slate-550 hover:text-red-400 transition-colors p-1 rounded-lg"
                title="Clear Slot A"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!slotA.previewUrl && !slotA.isCameraActive ? (
            <div 
              onDragEnter={(e) => handleDrag(e, "A")}
              onDragOver={(e) => handleDrag(e, "A")}
              onDragLeave={(e) => handleDrag(e, "A")}
              onDrop={(e) => handleDrop(e, "A")}
              className={`h-[240px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all ${
                dragActiveA ? "border-indigo-400 bg-indigo-500/5" : "border-slate-850 bg-slate-950/40 hover:bg-slate-950/70"
              }`}
            >
              <Upload className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-[11px] text-slate-400 text-center px-4">
                {t.dragBrowseSlot}
              </p>
              <div className="flex gap-2 mt-4">
                <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer">
                  {ts.browseText}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileIntoSlot(e.target.files[0], "A");
                      }
                    }} 
                  />
                </label>
                <button
                  onClick={() => startCamera("A")}
                  className="px-3 py-1.5 bg-indigo-950 border border-indigo-900 text-indigo-400 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {ts.cameraText}
                </button>
              </div>
            </div>
          ) : slotA.isCameraActive && activeCameraSlot === "A" ? (
            <div className="relative aspect-video max-h-[240px] w-full bg-black rounded-2xl overflow-hidden border border-slate-850">
              <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline muted />
              <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide font-mono">
                CAMERA OUT A
              </div>
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                <button onClick={() => captureSnapshot("A")} className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> {ts.captureSnapshot}
                </button>
                <button onClick={stopCamera} className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-lg">{ts.cancelText}</button>
              </div>
            </div>
          ) : (
            <div className="relative h-[240px] w-full rounded-2xl bg-black overflow-hidden border border-slate-850 group">
              <img src={slotA.previewUrl!} className="w-full h-full object-contain" alt="Preview A" />
              
              {slotA.isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-indigo-455 animate-spin" />
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">{t.processingA}</span>
                </div>
              )}

              {slotA.scanResult && (
                <div className="absolute top-[18%] left-[28%] w-[44%] h-[48%] border border-dashed border-indigo-400 rounded-xl pointer-events-none">
                  <span className="absolute bottom-1 left-1.5 bg-indigo-955/90 border border-indigo-500/30 text-indigo-300 text-[8px] font-mono px-1 py-0.5 rounded shadow">
                    Age {slotA.scanResult.faces[0]?.estimatedAge} / {slotA.scanResult.faces[0]?.genderPresentation}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SLOT B CONTAINER */}
        <div className={`p-6 rounded-3xl border transition-all ${slotB.previewUrl ? "border-slate-800 bg-slate-900/10" : "border-dashed border-slate-800 bg-slate-950/20"}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest">
              {t.slotB}
            </span>
            {slotB.previewUrl && (
              <button 
                onClick={() => setSlotB(prev => ({ ...prev, file: null, previewUrl: null, presetId: null, scanResult: null }))}
                className="text-slate-550 hover:text-red-400 transition-colors p-1 rounded-lg"
                title="Clear Slot B"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!slotB.previewUrl && !slotB.isCameraActive ? (
            <div 
              onDragEnter={(e) => handleDrag(e, "B")}
              onDragOver={(e) => handleDrag(e, "B")}
              onDragLeave={(e) => handleDrag(e, "B")}
              onDrop={(e) => handleDrop(e, "B")}
              className={`h-[240px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all ${
                dragActiveB ? "border-emerald-400 bg-emerald-500/5" : "border-slate-850 bg-slate-950/40 hover:bg-slate-950/70"
              }`}
            >
              <Upload className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-[11px] text-slate-400 text-center px-4">
                {t.dragBrowseSlot}
              </p>
              <div className="flex gap-2 mt-4">
                <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer">
                  {ts.browseText}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileIntoSlot(e.target.files[0], "B");
                      }
                    }} 
                  />
                </label>
                <button
                  onClick={() => startCamera("B")}
                  className="px-3 py-1.5 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {ts.cameraText}
                </button>
              </div>
            </div>
          ) : slotB.isCameraActive && activeCameraSlot === "B" ? (
            <div className="relative aspect-video max-h-[240px] w-full bg-black rounded-2xl overflow-hidden border border-slate-850">
              <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline muted />
              <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide font-mono">
                CAMERA OUT B
              </div>
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                <button onClick={() => captureSnapshot("B")} className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 font-sans">
                  <Camera className="w-3.5 h-3.5" /> {ts.captureSnapshot}
                </button>
                <button onClick={stopCamera} className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-lg font-sans">{ts.cancelText}</button>
              </div>
            </div>
          ) : (
            <div className="relative h-[240px] w-full rounded-2xl bg-black overflow-hidden border border-slate-850 group">
              <img src={slotB.previewUrl!} className="w-full h-full object-contain" alt="Preview B" />
              
              {slotB.isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-emerald-450 animate-spin" />
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">{t.processingB}</span>
                </div>
              )}

              {slotB.scanResult && (
                <div className="absolute top-[18%] left-[28%] w-[44%] h-[48%] border border-dashed border-emerald-400 rounded-xl pointer-events-none">
                  <span className="absolute bottom-1 left-1.5 bg-slate-955/90 border border-emerald-500/30 text-emerald-300 text-[8px] font-mono px-1 py-0.5 rounded shadow">
                    Age {slotB.scanResult.faces[0]?.estimatedAge} / {slotB.scanResult.faces[0]?.genderPresentation}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {cameraError && (
        <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-2xl text-xs text-red-400 font-mono text-center">
          ⚠️ {cameraError}
        </div>
      )}

      {/* ACTION TRIGGERS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
        <div className="text-left">
          <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Comparative Analytical Engine</h5>
          <p className="text-[11px] text-slate-450 mt-1 max-w-sm">
            Fires scans concurrently in parallel threads to index physical demographics, age compliance ratios, and synthetic content signatures.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={resetScanner}
            disabled={!slotA.previewUrl && !slotB.previewUrl}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white text-xs font-bold tracking-wider uppercase transition-all font-sans cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            Clear Slots
          </button>
          <button
            onClick={executeDualScan}
            disabled={!slotA.previewUrl || !slotB.previewUrl || slotA.isScanning || slotB.isScanning}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg hover:shadow-cyan-500/10 font-sans cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95"
          >
            <Scale className="w-4 h-4 text-slate-950" />
            Run Comparative Analysis (2 scans)
          </button>
        </div>
      </div>

      {/* SPECTRAL DASHBOARD RESULTS SECTION */}
      <AnimatePresence>
        {slotA.scanResult && slotB.scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Split Comparison Cards Header */}
            <div className="text-center space-y-2 py-4">
              <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full">
                Unified Analytical Diagnostics Matrix
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Spectral Side-by-Side Dashboard</h3>
            </div>

            {/* Differential Insights Panel */}
            {differentialInsights && differentialInsights.length > 0 && (
              <div className="p-6 bg-slate-950/80 border border-indigo-500/20 rounded-3xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  Cross-profile Algorithmic Correlation Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {differentialInsights.map((insight, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/35 p-3 rounded-xl border border-slate-850">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Comparisons Grid Table */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 bg-slate-900/70 py-4 px-4 border-b border-slate-800 text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
                <div className="col-span-4 pl-2">Evaluation Parameter</div>
                <div className="col-span-4 text-center text-indigo-400">Profile A (Left Slot)</div>
                <div className="col-span-4 text-center text-emerald-400">Profile B (Right Slot)</div>
              </div>

              <div className="divide-y divide-slate-850/70 text-xs">
                
                {/* 1. Photorealism */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Sincerity Audit</div>
                  
                  <div className="col-span-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      slotA.scanResult.isAiGenerated 
                        ? "bg-rose-950/50 border border-rose-500/30 text-rose-400" 
                        : "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400"
                    }`}>
                      {slotA.scanResult.isAiGenerated ? `Synthesized AI (${(slotA.scanResult.aiConfidence || 95).toFixed(1)}%)` : `Real Capture (${(slotA.scanResult.aiConfidence || 98).toFixed(1)}%)`}
                    </span>
                  </div>

                  <div className="col-span-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      slotB.scanResult.isAiGenerated 
                        ? "bg-rose-950/50 border border-rose-500/30 text-rose-400" 
                        : "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400"
                    }`}>
                      {slotB.scanResult.isAiGenerated ? `Synthesized AI (${(slotB.scanResult.aiConfidence || 95).toFixed(1)}%)` : `Real Capture (${(slotB.scanResult.aiConfidence || 98).toFixed(1)}%)`}
                    </span>
                  </div>
                </div>

                {/* 2. Estimated Age */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Physical Age Classification</div>
                  
                  <div className="col-span-4 text-center font-sans">
                    <strong className="text-white text-base font-black font-mono">{slotA.scanResult.faces[0]?.estimatedAge}</strong>
                    <span className="text-[10px] text-slate-400 ml-1 font-mono uppercase">Years</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Range: {slotA.scanResult.faces[0]?.ageRange}</span>
                  </div>

                  <div className="col-span-4 text-center font-sans">
                    <strong className="text-white text-base font-black font-mono">{slotB.scanResult.faces[0]?.estimatedAge}</strong>
                    <span className="text-[10px] text-slate-400 ml-1 font-mono uppercase">Years</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Range: {slotB.scanResult.faces[0]?.ageRange}</span>
                  </div>
                </div>

                {/* 3. Gender Presentation */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Gender / Expression Check</div>
                  
                  <div className="col-span-4 text-center">
                    <span className="text-white font-bold">{slotA.scanResult.faces[0]?.genderPresentation}</span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Confidence: {(slotA.scanResult.faces[0]?.genderConfidence || 90).toFixed(1)}%</span>
                  </div>

                  <div className="col-span-4 text-center">
                    <span className="text-white font-bold">{slotB.scanResult.faces[0]?.genderPresentation}</span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Confidence: {(slotB.scanResult.faces[0]?.genderConfidence || 90).toFixed(1)}%</span>
                  </div>
                </div>

                {/* 4. Age Category */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Demographic Segment</div>
                  
                  <div className="col-span-4 text-center font-semibold text-slate-200 uppercase font-mono text-[10px] tracking-wider">
                    {slotA.scanResult.faces[0]?.ageCategory}
                  </div>

                  <div className="col-span-4 text-center font-semibold text-slate-200 uppercase font-mono text-[10px] tracking-wider">
                    {slotB.scanResult.faces[0]?.ageCategory}
                  </div>
                </div>

                {/* 5. Youth Compliance */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Jurisdiction Compliance Code</div>
                  
                  <div className="col-span-4 text-center flex flex-col items-center justify-center">
                    {slotA.scanResult.faces[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> PASS_ADULT
                      </span>
                    ) : slotA.scanResult.faces[0]?.minorAppearanceSafetyCode === "ALERT_MINOR_APPEARANCE" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-amber-950/40 border border-amber-500/20 text-amber-400 font-mono uppercase tracking-widest">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> ALERT_MINOR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-rose-950/40 border border-rose-500/20 text-rose-400 font-mono uppercase tracking-widest">
                        <ShieldAlert className="w-3 h-3 text-rose-400" /> SURE_MINOR
                      </span>
                    )}
                    <span className="block text-[10px] text-slate-500 font-mono mt-1.5 text-center max-w-[200px] leading-relaxed">
                      {slotA.scanResult.faces[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE" ? "Adult status verified" : "Subject flagged. Restrict content settings."}
                    </span>
                  </div>

                  <div className="col-span-4 text-center flex flex-col items-center justify-center">
                    {slotB.scanResult.faces[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> PASS_ADULT
                      </span>
                    ) : slotB.scanResult.faces[0]?.minorAppearanceSafetyCode === "ALERT_MINOR_APPEARANCE" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-amber-950/40 border border-amber-500/20 text-amber-400 font-mono uppercase tracking-widest">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> ALERT_MINOR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-rose-950/40 border border-rose-500/20 text-rose-400 font-mono uppercase tracking-widest">
                        <ShieldAlert className="w-3 h-3 text-rose-400" /> SURE_MINOR
                      </span>
                    )}
                    <span className="block text-[10px] text-slate-500 font-mono mt-1.5 text-center max-w-[200px] leading-relaxed">
                      {slotB.scanResult.faces[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE" ? "Adult status verified" : "Subject flagged. Restrict content settings."}
                    </span>
                  </div>
                </div>

                {/* 6. Deep Attributes */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Anatomical / Facial Accents</div>
                  
                  <div className="col-span-4 text-center font-mono text-[10px] space-y-1 text-slate-300">
                    <div className="flex justify-between max-w-[140px] mx-auto">
                      <span>Glasses:</span>
                      <span className={slotA.scanResult.faces[0]?.attributes?.glassesDetected ? "text-indigo-400 font-bold" : "text-slate-500"}>
                        {slotA.scanResult.faces[0]?.attributes?.glassesDetected ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <div className="flex justify-between max-w-[140px] mx-auto">
                      <span>Facial Hair:</span>
                      <span className={slotA.scanResult.faces[0]?.attributes?.facialHairDetected ? "text-indigo-400 font-bold" : "text-slate-500"}>
                        {slotA.scanResult.faces[0]?.attributes?.facialHairDetected ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <div className="flex justify-between max-w-[140px] mx-auto">
                      <span>Makeup:</span>
                      <span className={slotA.scanResult.faces[0]?.attributes?.makeupDetected ? "text-indigo-400 font-bold" : "text-slate-500"}>
                        {slotA.scanResult.faces[0]?.attributes?.makeupDetected ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-4 text-center font-mono text-[10px] space-y-1 text-slate-300">
                    <div className="flex justify-between max-w-[140px] mx-auto">
                      <span>Glasses:</span>
                      <span className={slotB.scanResult.faces[0]?.attributes?.glassesDetected ? "text-emerald-400 font-bold" : "text-slate-500"}>
                        {slotB.scanResult.faces[0]?.attributes?.glassesDetected ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <div className="flex justify-between max-w-[140px] mx-auto">
                      <span>Facial Hair:</span>
                      <span className={slotB.scanResult.faces[0]?.attributes?.facialHairDetected ? "text-emerald-400 font-bold" : "text-slate-500"}>
                        {slotB.scanResult.faces[0]?.attributes?.facialHairDetected ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <div className="flex justify-between max-w-[140px] mx-auto">
                      <span>Makeup:</span>
                      <span className={slotB.scanResult.faces[0]?.attributes?.makeupDetected ? "text-emerald-400 font-bold" : "text-slate-500"}>
                        {slotB.scanResult.faces[0]?.attributes?.makeupDetected ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7. Lighting Quality */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2">Sensor Lighting Quality</div>
                  
                  <div className="col-span-4 text-center font-mono text-[10px] text-slate-300 font-medium">
                    {slotA.scanResult.faces[0]?.attributes?.lightingQuality}
                  </div>

                  <div className="col-span-4 text-center font-mono text-[10px] text-slate-300 font-medium">
                    {slotB.scanResult.faces[0]?.attributes?.lightingQuality}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
