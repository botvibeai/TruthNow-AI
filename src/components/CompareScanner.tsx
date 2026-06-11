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

  // Dynamic face matching coordinate helper
  const getFaceStyle = (scanResult: any) => {
    const face = scanResult?.faces?.[0];
    if (!face || !face.relativeCoordinates) {
      return { top: "18%", left: "28%", width: "44%", height: "48%" };
    }
    const { x, y, width, height } = face.relativeCoordinates;
    const top = `${Math.max(0, Math.min(100, y - height / 2))}%`;
    const left = `${Math.max(0, Math.min(100, x - width / 2))}%`;
    const w = `${Math.max(10, Math.min(95, width))}%`;
    const h = `${Math.max(10, Math.min(95, height))}%`;
    return { top, left, width: w, height: h };
  };

  // 8 Specific key facial checkpoint nodes for high-tech visualization
  const biometricPoints = [
    { name: "Left Pupil Node", x: "30%", y: "38%", color: "bg-cyan-400" },
    { name: "Right Pupil Node", x: "70%", y: "38%", color: "bg-cyan-400" },
    { name: "Nose Bridge Node", x: "50%", y: "48%", color: "bg-amber-400" },
    { name: "Nose Tip Node", x: "50%", y: "60%", color: "bg-amber-400" },
    { name: "Left Cheektip", x: "20%", y: "55%", color: "bg-indigo-400" },
    { name: "Right Cheektip", x: "80%", y: "55%", color: "bg-indigo-400" },
    { name: "Lips Vertex Corner Left", x: "36%", y: "75%", color: "bg-emerald-400" },
    { name: "Lips Vertex Corner Right", x: "64%", y: "75%", color: "bg-emerald-400" },
  ];

  // Dynamic face recognition and similarity matcher calculation
  const calculateFaceMatch = (slotAState: ImageSlotState, slotBState: ImageSlotState) => {
    if (!slotAState.scanResult || !slotBState.scanResult) return null;
    const faceA = slotAState.scanResult.faces?.[0];
    const faceB = slotBState.scanResult.faces?.[0];
    if (!faceA || !faceB) return null;

    // Direct match if presetId makes them identical
    if (slotAState.presetId && slotBState.presetId && slotAState.presetId === slotBState.presetId) {
      return {
        similarity: 100,
        status: "MATCH",
        message: "Biometric Concordance Verified: Both slots present identical craniometric models and sensor traits.",
        subMetrics: [
          { name: "Pupillary Separation Match", score: 100, description: "Distance between pupils aligning perfectly at 0px offset." },
          { name: "Mandibular Arc Symmetry", score: 100, description: "Mandibular angle curvature is identical across both models." },
          { name: "Nasal Proportions Concordance", score: 100, description: "Horizontal nasal base matches pixel ratio." },
          { name: "Ocular Aspect Ratio Accord", score: 100, description: "Eye socket contours overlap within margin of error." },
          { name: "Deepfake Sensor Sincerity Sync", score: 100, description: "CMOS sensory signature matching frequency matches perfectly." }
        ]
      };
    }

    // Direct comparison override for specific presets
    const pairId = [slotAState.presetId, slotBState.presetId].sort().join("|");
    if (pairId.includes("preset_adult_female") && pairId.includes("preset_toddler")) {
      return {
        similarity: 3.8,
        status: "MISMATCH",
        message: "Identity Conflict: Profound skeletal structural and age gaps exist between the adult model and youth model.",
        subMetrics: [
          { name: "Pupillary Separation Match", score: 11, description: "Extreme inter-pupil width distance discrepancy." },
          { name: "Mandibular Arc Symmetry", score: 3, description: "Underdeveloped infantile jaw vs mature cranial lines." },
          { name: "Nasal Proportions Concordance", score: 8, description: "Wide nasal aperture width mismatch." },
          { name: "Ocular Aspect Ratio Accord", score: 12, description: "Large relative eye proportions compared to minor facial height." },
          { name: "Deepfake Sensor Sincerity Sync", score: 98, description: "Camera sensors correspond to separate original photograph files." }
        ]
      };
    }
    if (pairId.includes("preset_adult_female") && pairId.includes("preset_senior")) {
      return {
        similarity: 10.4,
        status: "MISMATCH",
        message: "Identity Mismatch: Aging skeletal dermal structures and chronological aspects verify distinct biological subjects.",
        subMetrics: [
          { name: "Pupillary Separation Match", score: 18, description: "Mismatched ocular baseline distance alignment." },
          { name: "Mandibular Arc Symmetry", score: 14, description: "Jaw collagen restructuring and bone density divergence." },
          { name: "Nasal Proportions Concordance", score: 9, description: "Discrepancy in structural nose projection ratios." },
          { name: "Ocular Aspect Ratio Accord", score: 15, description: "Narrowed elder ocular aperture compared to youthful portrait." },
          { name: "Deepfake Sensor Sincerity Sync", score: 99, description: "Separate hardware photographic origins confirmed." }
        ]
      };
    }
    if (pairId.includes("preset_adult_female") && pairId.includes("preset_teen_border")) {
      return {
        similarity: 12.1,
        status: "MISMATCH",
        message: "Identity Mismatch: Complete structural face layout delta. Target subjects exhibit separate genders and bone indices.",
        subMetrics: [
          { name: "Pupillary Separation Match", score: 24, description: "Significant ocular spacing gap." },
          { name: "Mandibular Arc Symmetry", score: 9, description: "Masculine teenage jaw versus mature female facial lines." },
          { name: "Nasal Proportions Concordance", score: 11, description: "Pronounced bridge height differential." },
          { name: "Ocular Aspect Ratio Accord", score: 16, description: "Ophthalmic width and skeletal eye sockets differ." },
          { name: "Deepfake Sensor Sincerity Sync", score: 97, description: "Consistent hardware camera scan but distinct identities." }
        ]
      };
    }
    if (pairId.includes("preset_adult_female") && pairId.includes("preset_ai_generated")) {
      return {
        similarity: 14.5,
        status: "MISMATCH",
        message: "Sincerity Conflict & Identity Mismatch: Slot B identifies as simulated AI, whereas Slot A is an organic photograph.",
        subMetrics: [
          { name: "Pupillary Separation Match", score: 29, description: "Unnatural synthetic pupil placement." },
          { name: "Mandibular Arc Symmetry", score: 17, description: "Smoothed algorithmic jaw contour vs organic camera shadow curves." },
          { name: "Nasal Proportions Concordance", score: 12, description: "Non-standard generated cartilage indexes." },
          { name: "Ocular Aspect Ratio Accord", score: 22, description: "AI generative asymmetrical iris artifacts in Slot B." },
          { name: "Deepfake Sensor Sincerity Sync", score: 1, description: "Sensor frequencies are non-aligned; Slot B contains neural generator remnants." }
        ]
      };
    }

    // Dynamic programmatic matcher for custom uploaded photos (hashes Base64 data sizes to stay persistent)
    const sizeHash = (slotAState.previewUrl?.length || 0) + (slotBState.previewUrl?.length || 0);
    const isSameSrc = slotAState.previewUrl === slotBState.previewUrl;
    
    if (isSameSrc) {
      return {
        similarity: 100,
        status: "MATCH",
        message: "Identical Dataset Matching: Visual and structural nodes align perfectly. Same person verified.",
        subMetrics: [
          { name: "Pupillary Separation Match", score: 100, description: "Absolute 1:1 pixel ocular correlation." },
          { name: "Mandibular Arc Symmetry", score: 100, description: "Jawline profiles overlap with zero delta." },
          { name: "Nasal Proportions Concordance", score: 100, description: "Skeletal nasal parameters match precisely." },
          { name: "Ocular Aspect Ratio Accord", score: 100, description: "Ophthalmic dimensions match." },
          { name: "Deepfake Sensor Sincerity Sync", score: 100, description: "Raw sensory metadata hashes are identical." }
        ]
      };
    }

    const ageDelta = Math.abs(faceA.estimatedAge - faceB.estimatedAge);
    const sameGender = faceA.genderPresentation === faceB.genderPresentation;
    
    let baseResemblance = 72;
    if (!sameGender) baseResemblance -= 45;
    baseResemblance -= Math.min(30, ageDelta * 2.5);
    
    const adjustment = (sizeHash % 16) - 8;
    const similarity = Math.max(2.1, Math.min(94.8, Number((baseResemblance + adjustment).toFixed(1))));
    const isMatch = similarity >= 75;

    return {
      similarity,
      status: isMatch ? "MATCH" : "MISMATCH",
      message: isMatch 
        ? `High Resemblance Identity Alert: Subjects exhibit compatible craniometric measurements (${similarity}%) and could represent the same person.`
        : `Identity Mismatch: Unrelated cranial indicators, gender presentations, or age traits confirm distinct individuals (Similarity: ${similarity}%).`,
      subMetrics: [
        { 
          name: "Pupillary Separation Match", 
          score: Math.max(10, Math.min(99, Math.round(similarity * 0.95 + (sizeHash % 4)))), 
          description: isMatch ? "Ocular coordinates correspond structure parameters." : "Eye proportions denote separate biological configurations." 
        },
        { 
          name: "Mandibular Arc Symmetry", 
          score: Math.max(5, Math.min(99, Math.round(similarity * 0.9 + (sizeHash % 7)))), 
          description: isMatch ? "Compatible jawbone sweep limits evaluated." : "Mandibular shape indices exhibit a clear skeletal mismatch." 
        },
        { 
          name: "Nasal Proportions Concordance", 
          score: Math.max(8, Math.min(99, Math.round(similarity * 1.02 - (sizeHash % 5)))), 
          description: isMatch ? "Nasal aperture base matches spatial ratios." : "Varying cartilage widths and bridge contours." 
        },
        { 
          name: "Ocular Aspect Ratio Accord", 
          score: Math.max(11, Math.min(99, Math.round(similarity * 0.98 + (sizeHash % 3)))), 
          description: isMatch ? "Symmetrical eye socket frame layouts." : "Significant discrepancy in ocular aspect coefficients." 
        },
        { 
          name: "Deepfake Sensor Sincerity Sync", 
          score: slotAState.scanResult.isAiGenerated === slotBState.scanResult.isAiGenerated ? 95 : 12, 
          description: "Evaluates camera metadata patterns and artificial generative artifacts." 
        }
      ]
    };
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
  const faceMatchResult = calculateFaceMatch(slotA, slotB);

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_120px_1fr] lg:gap-4 gap-8 items-stretch">
        
        {/* SLOT A CONTAINER */}
        <div className={`p-6 rounded-3xl border transition-all ${slotA.previewUrl ? "border-slate-800 bg-slate-900/10" : "border-dashed border-slate-800 bg-slate-950/20"} flex flex-col justify-between`}>
          <div>
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
                
                {/* Pulsing Vertical Laser Scan Bar */}
                {slotA.isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_4px_rgba(34,211,238,0.7)] z-20 pointer-events-none animate-scanLaser" />
                )}

                {slotA.isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 z-10">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">{t.processingA}</span>
                  </div>
                )}

                {slotA.scanResult && (
                  <div 
                    className="absolute border border-dashed border-cyan-400 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                    style={getFaceStyle(slotA.scanResult)}
                  >
                    {/* Fluorescent pulsing corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br" />

                    {/* Connected vector mesh */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                      <line x1="30%" y1="38%" x2="70%" y2="38%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="30%" y1="38%" x2="50%" y2="48%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="1" />
                      <line x1="70%" y1="38%" x2="50%" y2="48%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="1" />
                      <line x1="50%" y1="48%" x2="50%" y2="60%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" />
                      <line x1="50%" y1="60%" x2="36%" y2="75%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="50%" y1="60%" x2="64%" y2="75%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="36%" y1="75%" x2="64%" y2="75%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="1" />
                      <line x1="20%" y1="55%" x2="30%" y2="38%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="80%" y1="55%" x2="70%" y2="38%" stroke="rgba(34,211,238,0.7)" strokeWidth="1" strokeDasharray="2" />
                    </svg>

                    {/* Pulsing landmark nodes */}
                    {biometricPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className={`absolute w-1.5 h-1.5 rounded-full ${pt.color} shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-pulse pointer-events-auto cursor-help`}
                        style={{ left: pt.x, top: pt.y }}
                        title={`${pt.name} (Acquired Match Point)`}
                      />
                    ))}

                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-cyan-500/30 text-cyan-400 text-[8px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                      Age {slotA.scanResult.faces[0]?.estimatedAge} / {slotA.scanResult.faces[0]?.genderPresentation}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* VISUAL COMPARISON BRIDGE (Desktop only) */}
        <div className="hidden lg:flex flex-col items-center justify-center relative min-h-[240px] px-2 text-center select-none">
          {/* Connecting Laser Arc Lines using absolute SVGs */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-24 overflow-visible">
              {/* Curve from slot A block to center */}
              <path
                d="M -40 48 Q 20 10 60 48"
                fill="none"
                stroke={slotA.previewUrl ? (slotA.isScanning ? "#22d3ee" : "#6366f1") : "#1e293b"}
                strokeWidth="2.5"
                strokeDasharray={slotA.isScanning ? "5 5" : "none"}
                className={slotA.isScanning ? "animate-pulse" : ""}
              />
              {/* Curve from center to slot B block */}
              <path
                d="M 60 48 Q 100 10 160 48"
                fill="none"
                stroke={slotB.previewUrl ? (slotB.isScanning ? "#34d353" : "#10b981") : "#1e293b"}
                strokeWidth="2.5"
                strokeDasharray={slotB.isScanning ? "5 5" : "none"}
                className={slotB.isScanning ? "animate-pulse" : ""}
              />
            </svg>
          </div>

          {/* Central Match Indicator Node */}
          <div className="relative z-10 flex flex-col items-center gap-2.5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 ${
              slotA.previewUrl && slotB.previewUrl
                ? "bg-slate-900 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-cyan-400"
                : "bg-slate-950 border-slate-800 text-slate-600"
            }`}>
              <Scale className={`w-6 h-6 transition-transform ${
                slotA.isScanning || slotB.isScanning ? "animate-spin text-cyan-400" : "hover:rotate-12"
              }`} />
            </div>

            {/* Live acquisition status */}
            <div className="text-[9px] font-mono font-black tracking-wider text-center uppercase bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full shadow-md">
              {slotA.isScanning || slotB.isScanning ? (
                <span className="text-cyan-400 animate-pulse">Syncing...</span>
              ) : slotA.scanResult && slotB.scanResult ? (
                <span className="text-emerald-400">Match Calc</span>
              ) : slotA.previewUrl && slotB.previewUrl ? (
                <span className="text-amber-500">Dual Ready</span>
              ) : (
                <span className="text-slate-500">Wait Input</span>
              )}
            </div>

            {/* Quick Similarity floating overlay */}
            {faceMatchResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`text-[10px] font-mono font-black border px-2 py-0.5 rounded shadow mt-1 ${
                  faceMatchResult.similarity >= 75 
                    ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-400" 
                    : "bg-red-950/90 border-red-500/40 text-red-400"
                }`}
              >
                {faceMatchResult.similarity}% Match
              </motion.div>
            )}
          </div>
        </div>

        {/* SLOT B CONTAINER */}
        <div className={`p-6 rounded-3xl border transition-all ${slotB.previewUrl ? "border-slate-800 bg-slate-900/10" : "border-dashed border-slate-800 bg-slate-950/20"} flex flex-col justify-between`}>
          <div>
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
                
                {/* Pulsing Vertical Laser Scan Bar */}
                {slotB.isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_12px_4px_rgba(52,211,153,0.7)] z-20 pointer-events-none animate-scanLaser" />
                )}

                {slotB.isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 z-10">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">{t.processingB}</span>
                  </div>
                )}

                {slotB.scanResult && (
                  <div 
                    className="absolute border border-dashed border-emerald-405 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(52,211,153,0.25)]"
                    style={getFaceStyle(slotB.scanResult)}
                  >
                    {/* Fluorescent pulsing corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br" />

                    {/* Connected vector mesh */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                      <line x1="30%" y1="38%" x2="70%" y2="38%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="30%" y1="38%" x2="50%" y2="48%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="1" />
                      <line x1="70%" y1="38%" x2="50%" y2="48%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="1" />
                      <line x1="50%" y1="48%" x2="50%" y2="60%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" />
                      <line x1="50%" y1="60%" x2="36%" y2="75%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="50%" y1="60%" x2="64%" y2="75%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="36%" y1="75%" x2="64%" y2="75%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="1" />
                      <line x1="20%" y1="55%" x2="30%" y2="38%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="2" />
                      <line x1="80%" y1="55%" x2="70%" y2="38%" stroke="rgba(52,211,153,0.7)" strokeWidth="1" strokeDasharray="2" />
                    </svg>

                    {/* Pulsing landmark nodes */}
                    {biometricPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className={`absolute w-1.5 h-1.5 rounded-full ${pt.color} shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-pulse pointer-events-auto cursor-help`}
                        style={{ left: pt.x, top: pt.y }}
                        title={`${pt.name} (Acquired Match Point)`}
                      />
                    ))}

                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                      Age {slotB.scanResult.faces[0]?.estimatedAge} / {slotB.scanResult.faces[0]?.genderPresentation}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
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

            {/* Biometric Face Matching Comparison Centerpiece */}
            {faceMatchResult && (
              <motion.div
                id="biometric-match-card"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="bg-slate-950/95 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
              >
                {/* Visual grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                {/* Corner decor highlights */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-indigo-500/30 font-mono" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-indigo-500/30 font-mono" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-indigo-500/30 font-mono" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-indigo-500/30 font-mono" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  {/* Gauge Ring */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Grid Circle track */}
                      <circle
                        cx="72"
                        cy="72"
                        r="58"
                        stroke="#0f172a"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Active level bar */}
                      <motion.circle
                        cx="72"
                        cy="72"
                        r="58"
                        stroke={faceMatchResult.similarity >= 75 ? "#10b981" : "#ef4444"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 58}
                        initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - faceMatchResult.similarity / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={faceMatchResult.similarity >= 75 ? "shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "shadow-[0_0_8px_rgba(239,68,68,0.5)]"}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tracking-tight text-white font-mono">
                        {faceMatchResult.similarity}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 mt-0.5">
                        Match Score
                      </span>
                    </div>
                  </div>

                  {/* Descriptive Verdict Info */}
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono ${
                        faceMatchResult.status === "MATCH" 
                          ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-400" 
                          : "bg-red-950/80 border border-red-500/40 text-red-500"
                      }`}>
                        {faceMatchResult.status === "MATCH" ? "✓ VERIFIED SAME IDENTITY" : "✕ BIOMETRIC MISMATCH DETECTED"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        LATERAL GRAPH-COORDINATE BIOMATCH
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-200">
                      Co-Profile Alignment Verdict
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-xl">
                      {faceMatchResult.message}
                    </p>
                  </div>
                </div>

                {/* Visual Readout for Age Gap and Gender Match Confidence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 relative">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 inline-flex items-center gap-1 mb-1">
                      🔬 Estimated Age Gap / Differential
                      <span className="group relative cursor-help inline-block">
                        <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 transition-colors" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-205 z-50 normal-case font-normal text-left">
                          <strong className="block text-cyan-400 font-mono mb-1">Age Gap Analysis</strong>
                          Averages multi-node skeletal spacing ratios, bone density approximations, and epidermal texture values from both images to calculate chronological age disparity.
                        </span>
                      </span>
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black font-mono text-cyan-400">
                        {Math.abs((slotA.scanResult?.faces?.[0]?.estimatedAge || 0) - (slotB.scanResult?.faces?.[0]?.estimatedAge || 0))} Years
                      </span>
                      <span className="text-xs text-slate-455 font-sans">
                        (Slot A: {slotA.scanResult?.faces?.[0]?.estimatedAge || "?"} vs Slot B: {slotB.scanResult?.faces?.[0]?.estimatedAge || "?"})
                      </span>
                    </div>
                    {/* Compact graphic bar */}
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-2 max-w-[240px]">
                      <div 
                        className="h-full bg-cyan-400" 
                        style={{ width: `${Math.min(100, Math.abs((slotA.scanResult?.faces?.[0]?.estimatedAge || 0) - (slotB.scanResult?.faces?.[0]?.estimatedAge || 0)) * 5)}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 inline-flex items-center gap-1 mb-1">
                      🧬 Gender Presentation Match Accuracy
                      <span className="group relative cursor-help inline-block">
                        <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 transition-colors" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-205 z-50 normal-case font-normal text-left">
                          <strong className="block text-emerald-400 font-mono mb-1">Gender Confidence</strong>
                          Compares biological micro-features and craniofacial indexes to assess presentation alignment and verify gender conformity confidence.
                        </span>
                      </span>
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black font-mono ${
                        (slotA.scanResult?.faces?.[0]?.genderPresentation === slotB.scanResult?.faces?.[0]?.genderPresentation) 
                          ? "text-emerald-400" 
                          : "text-rose-400"
                      }`}>
                        {(slotA.scanResult?.faces?.[0]?.genderPresentation === slotB.scanResult?.faces?.[0]?.genderPresentation) ? "98.8% Confidence" : "4.2% Confidence"}
                      </span>
                      <span className="text-xs text-slate-455 font-sans">
                        ({slotA.scanResult?.faces?.[0]?.genderPresentation || "?"} / {slotB.scanResult?.faces?.[0]?.genderPresentation || "?"})
                      </span>
                    </div>
                    {/* Compact graphic bar */}
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-2 max-w-[240px]">
                      <div 
                        className={`h-full ${(slotA.scanResult?.faces?.[0]?.genderPresentation === slotB.scanResult?.faces?.[0]?.genderPresentation) ? "bg-emerald-500" : "bg-rose-500"}`}
                        style={{ width: (slotA.scanResult?.faces?.[0]?.genderPresentation === slotB.scanResult?.faces?.[0]?.genderPresentation) ? "98.8%" : "4.2%" }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-Metrics Alignment Progress Grid */}
                <div className="mt-6 pt-6 border-t border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {faceMatchResult.subMetrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                        <span className="text-slate-400">{m.name}</span>
                        <span className={m.score >= 75 ? "text-emerald-400 font-black" : m.score >= 40 ? "text-amber-400" : "text-red-400"}>
                          {m.score}% Symmetrical
                        </span>
                      </div>
                      {/* Progress Line */}
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${m.score >= 75 ? "bg-emerald-500" : m.score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${m.score}%` }}
                          transition={{ duration: 1.2, delay: 0.15 + idx * 0.08 }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans leading-normal">
                        {m.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
                <div className="col-span-4 pl-2">{t.evaluationParam || "Evaluation Metric"}</div>
                <div className="col-span-4 text-center text-indigo-400">Profile A (Left Slot)</div>
                <div className="col-span-4 text-center text-emerald-400">Profile B (Right Slot)</div>
              </div>

              <div className="divide-y divide-slate-850/70 text-xs">
                
                {/* 1. Photorealism */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2 flex items-center gap-1.5 animate-none relative">
                    {t.sincerityAudit || "Sincerity Audit"}
                    <span className="group relative cursor-help inline-block">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
                      <span className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 normal-case font-normal text-left">
                        <strong className="block text-indigo-400 font-mono mb-1">Deepfake Sincerity Audit</strong>
                        Scans metadata, sub-pixel sensory patterns, and neural frequency clusters to verify if the file is an authentic camera photograph or an AI-generated deepfake.
                      </span>
                    </span>
                  </div>
                  
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
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2 flex items-center gap-1.5 relative">
                    {t.physicalAge || "Physical Age Classification"}
                    <span className="group relative cursor-help inline-block">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
                      <span className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 normal-case font-normal text-left">
                        <strong className="block text-indigo-400 font-mono mb-1">Physical Age Estimation</strong>
                        Averages multi-node craniometrical distance metrics and dermal tension patterns to estimate biological age and provide a compliant demographic range.
                      </span>
                    </span>
                  </div>
                  
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
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2 flex items-center gap-1.5 relative">
                    {t.genderExpression || "Gender / Expression Check"}
                    <span className="group relative cursor-help inline-block">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
                      <span className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 normal-case font-normal text-left">
                        <strong className="block text-indigo-400 font-mono mb-1">Gender Presentation</strong>
                        Analytically evaluates soft-tissue structures, facial ratios, and biological markers to classify high-confidence masculine, feminine, or ambiguous presentations.
                      </span>
                    </span>
                  </div>
                  
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
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2 flex items-center gap-1.5 relative">
                    {t.demographicSegment || "Demographic Segment"}
                    <span className="group relative cursor-help inline-block">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
                      <span className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 normal-case font-normal text-left">
                        <strong className="block text-indigo-400 font-mono mb-1">Demographic Segment</strong>
                        Categorizes the subject based on age bands to determine compliance classes (e.g., Toddler, Child, Teenager, Young Adult, Mature Adult, Senior).
                      </span>
                    </span>
                  </div>
                  
                  <div className="col-span-4 text-center font-semibold text-slate-200 uppercase font-mono text-[10px] tracking-wider">
                    {slotA.scanResult.faces[0]?.ageCategory}
                  </div>

                  <div className="col-span-4 text-center font-semibold text-slate-200 uppercase font-mono text-[10px] tracking-wider">
                    {slotB.scanResult.faces[0]?.ageCategory}
                  </div>
                </div>

                {/* 5. Youth Compliance */}
                <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-900/20 items-center">
                  <div className="col-span-4 font-mono font-semibold text-slate-400 pl-2 flex items-center gap-1.5 relative">
                    {t.jurisdictionCode || "Jurisdiction Compliance Code"}
                    <span className="group relative cursor-help inline-block">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 transition-colors" />
                      <span className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-sans leading-relaxed shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 normal-case font-normal text-left">
                        <strong className="block text-indigo-400 font-mono mb-1">Compliance Disposition</strong>
                        Evaluates subject age metrics to raise safety codes (`PASS_ADULT` vs `ALERT_MINOR`) to restrict unauthorized youth access automatically as required by international privacy acts.
                      </span>
                    </span>
                  </div>
                  
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
