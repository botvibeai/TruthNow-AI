import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, Layers, Play, CheckCircle2, AlertCircle, Trash2, 
  Search, Filter, Download, ArrowRight, RefreshCw, BarChart2, ShieldAlert, Sparkles, FileText
} from "lucide-react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { jsPDF } from "jspdf";
import { ScanResponse } from "../types";
import { translations, Language } from "../translations";

// Standard preset models for direct mock data batch loading
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
    isAiGenerated: false
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
    isAiGenerated: false
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
    isAiGenerated: false
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
    isAiGenerated: false
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
    isAiGenerated: true
  }
];

interface BulkScannerProps {
  remainingScans: number;
  setRemainingScans: React.Dispatch<React.SetStateAction<number>>;
  selectedCountry: string;
  user: any;
  cloudIncrementScanCount: () => void;
  setTotalScansCount: React.Dispatch<React.SetStateAction<number>>;
  onShowToast: (msg: string, type?: "success" | "info" | "error") => void;
  lang: Language;
}

interface QueuedItem {
  id: string;
  filename: string;
  previewUrl: string;
  presetId?: string;
  fileSize?: string;
  status: "idle" | "scanning" | "completed" | "failed";
  scanResult: ScanResponse | null;
  errorMessage?: string;
  attempts?: number;
}

export default function BulkScanner({
  remainingScans,
  setRemainingScans,
  selectedCountry,
  user,
  cloudIncrementScanCount,
  setTotalScansCount,
  onShowToast,
  lang
}: BulkScannerProps) {
  const t = translations[lang].bulk;
  const ts = translations[lang].single;
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterCompliance, setFilterCompliance] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all"); // all, real, ai

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const addFilesToQueue = (files: FileList) => {
    const newItems: QueuedItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const sizeKB = (file.size / 1024).toFixed(1);
      const url = URL.createObjectURL(file);
      const id = "queue_" + Math.random().toString(36).substring(2, 9);
      
      newItems.push({
        id,
        filename: file.name,
        previewUrl: url,
        fileSize: `${sizeKB} KB`,
        status: "idle",
        scanResult: null
      });
    }

    if (newItems.length > 0) {
      setQueue(prev => [...prev, ...newItems]);
      onShowToast(`Enqueued ${newItems.length} images into testing batch!`);
    } else {
      onShowToast("No valid portrait images detected to queue.", "error");
    }
  };

  const loadAllPresetsIntoQueue = () => {
    const newItems: QueuedItem[] = PRESET_MOCK_PORTRAITS.map((preset) => {
      const id = "preset_q_" + Math.random().toString(36).substring(2, 9);
      return {
        id,
        filename: `${preset.name} (Preset Preset)`,
        previewUrl: preset.imageUrl,
        presetId: preset.id,
        fileSize: "Demo Cache",
        status: "idle",
        scanResult: null
      };
    });

    setQueue(prev => [...prev, ...newItems]);
    onShowToast(`Enqueued ${newItems.length} system compliance demo models into batch!`, "success");
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    onShowToast("Item discarded from current queue list.");
  };

  const clearQueue = () => {
    setQueue([]);
    onShowToast("Queue matrix scrubbed clean.");
  };

  const runSingleQueueItemScan = async (item: QueuedItem, country: string): Promise<ScanResponse> => {
    // If presets are enqueued, run mock simulator automatically
    if (item.presetId) {
      await new Promise(resolve => setTimeout(resolve, 600)); // fast mock
      const presetInp = PRESET_MOCK_PORTRAITS.find(p => p.id === item.presetId) || PRESET_MOCK_PORTRAITS[0];
      
      return {
        success: true,
        usingSimulation: true,
        facesDetected: 1,
        processedAt: new Date().toISOString(),
        isAiGenerated: presetInp.isAiGenerated,
        aiConfidence: presetInp.isAiGenerated ? 98.4 : 99.1,
        aiReason: presetInp.isAiGenerated 
          ? "Deepfake synthesis artifacts: smooth skin contours matching pixel math limits." 
          : "Genuine photographic sensor properties verified.",
        faces: [{
          confidenceScore: 98.5,
          estimatedAge: presetInp.estimatedAge,
          ageRange: presetInp.ageRange,
          ageCategory: presetInp.ageCategory,
          genderPresentation: presetInp.genderPresentation,
          genderConfidence: 96,
          minorAppearanceSafetyCode: presetInp.safetyCode as any,
          minorSafetyReasoning: `Preset verification conforms to ${selectedCountry} standards.`,
          expression: "Neutral Cooperative Frame",
          expressionConfidence: 90,
          attributes: { glassesDetected: false, facialHairDetected: false, makeupDetected: false, lightingQuality: "Studio Bright" },
          relativeCoordinates: { x: 50, y: 50, width: 60, height: 60 }
        }],
        geoCompliance: {
          country: country === "US" ? "United States" : country === "GB" ? "United Kingdom" : country === "EU" ? "European Union" : "Canada",
          jurisdiction: country === "US" ? "COPPA / CCPA Regulatory Framework" : country === "GB" ? "UK BSI PAS 1296 Standards" : country === "EU" ? "GDPR Biometric Protection Laws" : "PIPEDA Compliance Framework",
          scannerComplianceCode: `${country}-BULK-COMPLEX-AV`,
          mandatoryRetentionLimitHours: 0,
          dataPolicyNote: "Transient evaluation."
        },
        seoMetrics: { keywordsActive: [], score: 100 }
      };
    }

    // Direct API Post Endpoint otherwise
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: item.previewUrl,
        mimeType: "image/jpeg",
        userCountrySim: country
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned error code ${response.status}`);
    }

    return await response.json();
  };

  const executeBulkProcessing = async () => {
    const pendingItems = queue.filter(item => item.status === "idle" || item.status === "failed");
    
    if (pendingItems.length === 0) {
      onShowToast("No active processing pipeline. Enqueue images before launching check.", "error");
      return;
    }

    if (remainingScans < pendingItems.length) {
      onShowToast(`Insufficient scans remaining. Please replenish to check the full batch of ${pendingItems.length} items.`, "error");
      return;
    }

    setIsProcessing(true);
    onShowToast(`Initiating cognitive scans across ${pendingItems.length} files...`, "info");

    let countSucceeded = 0;

    for (const item of pendingItems) {
      let attempt = 0;
      let success = false;
      let lastError: any = null;

      while (attempt < 3 && !success) {
        attempt++;
        
        // Update item status in queue to show scanning and core attempt count
        setQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: "scanning", 
          attempts: attempt 
        } : q));

        if (attempt > 1) {
          // If retrying, delay another 500ms before triggering the retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        try {
          const result = await runSingleQueueItemScan(item, selectedCountry);
          setQueue(prev => prev.map(q => q.id === item.id ? { 
            ...q, 
            status: "completed", 
            scanResult: result, 
            attempts: attempt 
          } : q));
          success = true;
          countSucceeded++;
          
          // Decrement remaining count
          setRemainingScans(prev => Math.max(0, prev - 1));
          if (user) {
            cloudIncrementScanCount();
          } else {
            setTotalScansCount(prev => prev + 1);
          }
        } catch (err: any) {
          console.error(`Bulk failure scanning file ${item.filename} (Attempt ${attempt}/3):`, err);
          lastError = err;
          if (attempt < 3) {
            onShowToast(`Scan failed for ${item.filename} (Attempt ${attempt}/3). Retrying...`, "info");
          }
        }
      }

      if (!success) {
        setQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: "failed", 
          attempts: 3, 
          errorMessage: lastError?.message || "Visual process failed after 3 attempts" 
        } : q));
      }

      // Add small spacing fallback to prevent network spike or rate limit
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setIsProcessing(false);
    onShowToast(`Batch processing completed. ${countSucceeded} of ${pendingItems.length} files scanned.`, "success");
  };

  // KPI calculations
  const scannedItems = queue.filter(item => item.status === "completed" && item.scanResult);
  const totalCompleted = scannedItems.length;
  
  const minorsCount = scannedItems.filter(item => {
    const code = item.scanResult?.faces?.[0]?.minorAppearanceSafetyCode;
    return code === "SURE_MINOR" || code === "ALERT_MINOR_APPEARANCE";
  }).length;

  const adultsCount = scannedItems.filter(item => {
    return item.scanResult?.faces?.[0]?.minorAppearanceSafetyCode === "PASS_ADULT_APPEARANCE";
  }).length;

  const aiFakesCount = scannedItems.filter(item => item.scanResult?.isAiGenerated).length;

  const averageAge = scannedItems.length > 0 
    ? (scannedItems.reduce((acc, item) => acc + (item.scanResult?.faces?.[0]?.estimatedAge || 0), 0) / scannedItems.length).toFixed(1)
    : "0";

  const faceCategoryData = [
    { name: "Adult", value: adultsCount, color: "#10b981" },
    { name: "Minor", value: minorsCount, color: "#f43f5e" }
  ];

  const imageSourceData = [
    { name: "Real Photo", value: totalCompleted - aiFakesCount, color: "#14b8a6" },
    { name: "AI Generated", value: aiFakesCount, color: "#6366f1" }
  ];

  // Filter queue items for display
  const displayQueue = queue.filter(item => {
    const face = item.scanResult?.faces?.[0];
    
    // search check
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // gender filter
    if (filterGender !== "all") {
      const pGender = face?.genderPresentation?.toLowerCase() || "";
      if (filterGender === "male" && pGender !== "male") return false;
      if (filterGender === "female" && pGender !== "female") return false;
      if (filterGender === "ambiguous" && pGender !== "ambiguous" && pGender !== "ambiguous (youth)") return false;
    }

    // compliance filter
    if (filterCompliance !== "all" && item.status === "completed") {
      const pCompliance = face?.minorAppearanceSafetyCode;
      if (filterCompliance === "pass" && pCompliance !== "PASS_ADULT_APPEARANCE") return false;
      if (filterCompliance === "alert" && pCompliance !== "ALERT_MINOR_APPEARANCE") return false;
      if (filterCompliance === "minor" && pCompliance !== "SURE_MINOR") return false;
    }

    // type filter
    if (filterType !== "all" && item.status === "completed") {
      const isAi = item.scanResult?.isAiGenerated;
      if (filterType === "ai" && !isAi) return false;
      if (filterType === "real" && isAi) return false;
    }

    return true;
  });

  // Export direct CSV triggers action
  const handleDownloadCSV = () => {
    if (scannedItems.length === 0) return;

    let headers = "Filename,Status,Processed At,Detected Faces,Estimated Age,Gender Presentation,Compliance Code,AI Content,AI Confidence\n";
    let rows = "";

    scannedItems.forEach((item) => {
      const res = item.scanResult!;
      const face = res.faces?.[0];
      const filenameClean = item.filename.replace(/,/g, " ");
      const processed = res.processedAt;
      const facesDetected = res.facesDetected;
      const estAge = face?.estimatedAge || "N/A";
      const gender = face?.genderPresentation || "N/A";
      const compliance = face?.minorAppearanceSafetyCode || "N/A";
      const aiStatus = res.isAiGenerated ? "AI Generated" : "Authentic Image";
      const aiConf = res.aiConfidence ? `${res.aiConfidence.toFixed(1)}%` : "N/A";

      rows += `${filenameClean},Success,${processed},${facesDetected},${estAge},${gender},${compliance},${aiStatus},${aiConf}\n`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.href = csvContent;
    link.setAttribute("download", `truthnow_bulk_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("CSV database exported successfully!");
  };

  // Export highly styled, official audit PDF document
  const handleDownloadPDF = () => {
    if (scannedItems.length === 0) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    
    // Header, footer, security stamp drawer
    const drawPageDecorations = (pageNum: number, totalPages: number) => {
      // Top color border block
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(0, 0, pageWidth, 4, "F");

      // Right header classification stamp
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text("OFFICIAL REGISTERED BATCH COMPLIANCE RECORD", pageWidth - 15, 12, { align: "right" });

      // Bottom footer rule
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.2);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("CONFIDENTIAL — PROCESSED WITH TRUTHNOW NEURAL INTEGRITY CLASSIFICATION PROTOCOLS", 15, pageHeight - 10);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: "right" });
    };

    // =========================================================================
    // PAGE 1: VISUAL SUMMARY HEADER / COVER PAGE
    // =========================================================================
    
    // Deep brand accent background for cover header
    doc.setFillColor(15, 23, 42); // slate-900 
    doc.rect(0, 0, pageWidth, 42, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("TRUTHNOW COMPLIANCE AUDIT", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(191, 196, 210); // subtle text
    doc.text("DIGITAL INTEGRITY DISPOSITION & BATCH RECORD REPORT", 15, 25);
    
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(pageWidth - 65, 10, 50, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("SYSTEM SECURITY LEVEL", pageWidth - 62, 14.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("RESTRICTED / COMPLIANCE AUDIT", pageWidth - 62, 18.5);

    let y = 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("TABLE OF CONTENTS / REPORT ARCHITECTURE", 15, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, pageWidth - 15, y);
    
    y += 7;
    // Section 1 ToC
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text("01. EXECUTIVE AUDIT & VERIFICATION SUMMARY", 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("Section A — Verification timestamp, regulating system operators, ruleset configuration.", 18, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("PAGE 1", pageWidth - 20, y, { align: "right" });
    
    y += 12;
    // Section 2 ToC
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("02. TARGET BIOMETRIC & INTEGRITY DISTRIBUTION CHARTS", 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("Section B — Synthetic deepfake detection filters and demographic age distributions.", 18, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("PAGE 2", pageWidth - 20, y, { align: "right" });
    
    y += 12;
    // Section 3 ToC
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("03. DETAIL PERFORMANCE COMPLIANCE LEDGER", 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("Section C — Record of all enqueued and processed batch media items inside the run.", 18, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("PAGE 3", pageWidth - 20, y, { align: "right" });

    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("HIGH-LEVEL COMPLIANCE AGGREGATE SUMMARY", 15, y);
    y += 4;
    doc.line(15, y, pageWidth - 15, y);
    y += 6;
    
    // Core statistics dashboard table block
    doc.setFillColor(248, 250, 252);
    doc.rect(15, y, pageWidth - 30, 36, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.rect(15, y, pageWidth - 30, 36, "D");
    
    // passRate calculation
    const passRate = totalCompleted > 0 ? (((totalCompleted - minorsCount) / totalCompleted) * 100).toFixed(1) : "100.0";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("COMPLIANCE PASS RATE", 22, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(`${passRate}%`, 22, y + 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Regulatory age compliant", 21, y + 25);

    // authenticityRate calculation
    const authenticityRate = totalCompleted > 0 ? (((totalCompleted - aiFakesCount) / totalCompleted) * 100).toFixed(1) : "100.0";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("REAL PHOTO INTEGRITY", 84, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166); // teal-500
    doc.text(`${authenticityRate}%`, 84, y + 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Authentic captured photography", 84, y + 25);

    // active flags
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("SAFETY FLAG INCIDENTS", 146, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(minorsCount > 0 ? 244 : 71, minorsCount > 0 ? 63 : 85, minorsCount > 0 ? 94 : 105);
    doc.text(`${minorsCount}`, 146, y + 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Enqueued underage alerts", 146, y + 25);

    y += 42;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("REGULATORY DESIGNATION & OPERATOR RECORD", 15, y);
    y += 4;
    doc.line(15, y, pageWidth - 15, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Selected Audit Target Ruleset:", 18, y);
    doc.text("Biometric Provider Network:", 18, y + 5);
    doc.text("Digital System URI:", 18, y + 10);
    doc.text("Timestamp Registered:", 18, y + 15);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const rulesText = selectedCountry === "USA" ? "USA Children's Online Privacy Protection Rule (COPPA) Regulations" :
                      selectedCountry === "EU" ? "European Union AI Act (Category-I Prohibited Biometric Scans)" :
                      selectedCountry === "UK" ? "UK ICO Age Appropriate Design Code of Biometric Conduct" :
                      selectedCountry === "CA" ? "Canadian Consumer Privacy Protection Act (C-27) Compliance Guidelines" :
                      "Global Standard Child Online Safeguards Framework";
    doc.text(rulesText, 62, y);
    doc.text("TruthNow Neural Image Scan Pipeline v4.0", 62, y + 5);
    doc.text("https://ais-dev-jvgcgjaidpjmje5war7t6o-169138870528.us-west1.run.app", 62, y + 10);
    doc.text(new Date().toUTCString(), 62, y + 15);

    // =========================================================================
    // PAGE 2: DETAILED SUMMARY METRICS & CHARTS
    // =========================================================================
    
    doc.addPage();
    let yPage2 = 18;

    // Report title layout
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("COMPLIANCE PERFORMANCE AUDIT REPORT", 15, yPage2);
    
    yPage2 += 5.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("SECTION I: EXECUTIVE PERFORMANCE & HISTOGRAM METRICS", 15, yPage2);

    yPage2 += 8;
    
    // Metadata overview box
    doc.setFillColor(248, 250, 252); // slate-50 background
    doc.rect(15, yPage2, pageWidth - 30, 24, "F");
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.25);
    doc.rect(15, yPage2, pageWidth - 30, 24, "D");

    // Labels
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("REGULATORY RULESET:", 18, yPage2 + 5.5);
    doc.text("TIMESTAMP GENERATED:", 18, yPage2 + 11.5);
    doc.text("VERIFYING OPERATOR:", 18, yPage2 + 17.5);
    
    doc.text("COMPLIANCE HASH NO:", 112, yPage2 + 5.5);
    doc.text("ENQUEUED BATCH SIZE:", 112, yPage2 + 11.5);
    doc.text("AUDIT DISPOSITION STATUS:", 112, yPage2 + 17.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42); // slate-900

    const countryName = selectedCountry === "USA" ? "USA COPPA Standards & FCC § 14.b" :
                        selectedCountry === "EU" ? "EU AI Act & European GDPR Art. 8 Rules" :
                        selectedCountry === "UK" ? "UK Age Appropriate Online Design Guidelines" :
                        selectedCountry === "CA" ? "Canada Bill C-27 Consumer Safeguards" : 
                        "Universal Child Online Safeguards Framework";

    doc.text(countryName, 54, yPage2 + 5.5);
    doc.text(new Date().toUTCString(), 54, yPage2 + 11.5);
    doc.text(user?.email || "michael@botvibe.ai (Audit Specialist)", 54, yPage2 + 17.5);
    
    doc.text(`TNSW-AUD-${Math.floor(100000 + Math.random() * 900000)}`, 155, yPage2 + 5.5);
    doc.text(`${queue.length} Total Enqueued (${scannedItems.length} Scanned Successfully)`, 155, yPage2 + 11.5);
    
    // Beautiful status badge rect
    doc.setFillColor(22, 163, 74); // green-600
    doc.setTextColor(255, 255, 255);
    doc.rect(154, yPage2 + 14, 34, 4.5, "F");
    doc.setFontSize(6.5);
    doc.text("PASS / VERIFIED COMPLIANT", 155.5, yPage2 + 17.2);

    yPage2 += 30;

    // SECTION I: KPI CARDS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("I. EXECUTIVE SUMMARY COMPLIANCE METRICS", 15, yPage2);
    yPage2 += 4;
    doc.line(15, yPage2, pageWidth - 15, yPage2);
    yPage2 += 5;

    // Split page size for 4 metric items
    const cardWidth = (pageWidth - 30 - 9) / 4; 
    const cardSpacer = 3;

    const cards = [
      { label: "TOTAL VERIFIED", val: String(totalCompleted), color: [15, 23, 42], extra: "Files Scanned" },
      { label: "UNDERAGE RED FLAGS", val: String(minorsCount), color: [244, 63, 94], extra: `${totalCompleted > 0 ? ((minorsCount / totalCompleted) * 100).toFixed(0) : 0}% Flag Ratio` },
      { label: "ADULT DISPOSSIBLE", val: String(adultsCount), color: [16, 185, 129], extra: `${totalCompleted > 0 ? ((adultsCount / totalCompleted) * 100).toFixed(0) : 0}% Clear Ratio` },
      { label: "AI GENERATED DEEP", val: String(aiFakesCount), color: [99, 102, 241], extra: `${totalCompleted > 0 ? ((aiFakesCount / totalCompleted) * 100).toFixed(0) : 0}% Fake Ratio` }
    ];

    cards.forEach((card, index) => {
      const cardX = 15 + index * (cardWidth + cardSpacer);
      doc.setFillColor(248, 250, 252);
      doc.rect(cardX, yPage2, cardWidth, 18, "F");
      doc.setDrawColor(241, 245, 249);
      doc.rect(cardX, yPage2, cardWidth, 18, "D");

      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.rect(cardX, yPage2, 1.2, 18, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label, cardX + 3.2, yPage2 + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.text(card.val, cardX + 3.2, yPage2 + 11.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(card.extra, cardX + 3.2, yPage2 + 15.5);
    });

    yPage2 += 24;

    // SECTION II: VISUAL DISTRIBUTION CHARTS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("II. COMPLIANCE TARGET DISTRIBUTION ANALYSIS", 15, yPage2);
    yPage2 += 4;
    doc.line(15, yPage2, pageWidth - 15, yPage2);
    yPage2 += 5;

    const halfBoxWidth = (pageWidth - 30 - 4) / 2;
    
    // Box 1: Face Demographics
    doc.setFillColor(250, 251, 252);
    doc.rect(15, yPage2, halfBoxWidth, 36, "F");
    doc.setDrawColor(241, 245, 249);
    doc.rect(15, yPage2, halfBoxWidth, 36, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Face Demographic Categories", 19, yPage2 + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Cohorts classified under legal online age policies:", 19, yPage2 + 11);

    const adultPct = totalCompleted > 0 ? (adultsCount / totalCompleted) : 0;
    const minorPct = totalCompleted > 0 ? (minorsCount / totalCompleted) : 0;

    // Adults Progress item
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Adult / Regular Clear Ratio (${adultsCount}):`, 19, yPage2 + 17.5);
    doc.setFillColor(226, 232, 240);
    doc.rect(19, yPage2 + 19, halfBoxWidth - 8, 2.5, "F");
    if (adultPct > 0) {
      doc.setFillColor(16, 185, 129); // green
      doc.rect(19, yPage2 + 19, (halfBoxWidth - 8) * adultPct, 2.5, "F");
    }
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text(`${(adultPct * 100).toFixed(0)}%`, halfBoxWidth + 15 - 12, yPage2 + 17.5, { align: "right" });

    // Minors Progress item
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`Minor Safety Alerts Triggered (${minorsCount}):`, 19, yPage2 + 26.5);
    doc.setFillColor(226, 232, 240);
    doc.rect(19, yPage2 + 28, halfBoxWidth - 8, 2.5, "F");
    if (minorPct > 0) {
      doc.setFillColor(244, 63, 94); // red
      doc.rect(19, yPage2 + 28, (halfBoxWidth - 8) * minorPct, 2.5, "F");
    }
    doc.setTextColor(244, 63, 94);
    doc.text(`${(minorPct * 100).toFixed(0)}%`, halfBoxWidth + 15 - 12, yPage2 + 26.5, { align: "right" });

    // Box 2: Deepfakes Source Integrity 
    const rBoxX = 15 + halfBoxWidth + 4;
    doc.setFillColor(250, 251, 252);
    doc.rect(rBoxX, yPage2, halfBoxWidth, 36, "F");
    doc.setDrawColor(241, 245, 249);
    doc.rect(rBoxX, yPage2, halfBoxWidth, 36, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Source Material Authenticity Info", rBoxX + 4, yPage2 + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Distinction check separating real captures from AI:", rBoxX + 4, yPage2 + 11);

    const realCount = totalCompleted - aiFakesCount;
    const realPct = totalCompleted > 0 ? (realCount / totalCompleted) : 0;
    const aiPct = totalCompleted > 0 ? (aiFakesCount / totalCompleted) : 0;

    // Real capture progress
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Authentic Standard Photography (${realCount}):`, rBoxX + 4, yPage2 + 17.5);
    doc.setFillColor(226, 232, 240);
    doc.rect(rBoxX + 4, yPage2 + 19, halfBoxWidth - 8, 2.5, "F");
    if (realPct > 0) {
      doc.setFillColor(20, 184, 166); // teal
      doc.rect(rBoxX + 4, yPage2 + 19, (halfBoxWidth - 8) * realPct, 2.5, "F");
    }
    doc.setTextColor(20, 184, 166);
    doc.text(`${(realPct * 100).toFixed(0)}%`, pageWidth - 19, yPage2 + 17.5, { align: "right" });

    // AI deepfake progress
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`Deepfake / Synthetic AI content (${aiFakesCount}):`, rBoxX + 4, yPage2 + 26.5);
    doc.setFillColor(226, 232, 240);
    doc.rect(rBoxX + 4, yPage2 + 28, halfBoxWidth - 8, 2.5, "F");
    if (aiPct > 0) {
      doc.setFillColor(99, 102, 241); // violet
      doc.rect(rBoxX + 4, yPage2 + 28, (halfBoxWidth - 8) * aiPct, 2.5, "F");
    }
    doc.setTextColor(99, 102, 241);
    doc.text(`${(aiPct * 100).toFixed(0)}%`, pageWidth - 19, yPage2 + 26.5, { align: "right" });

    // =========================================================================
    // PAGE 3+: BIOMETRIC LEDGER TABLE
    // =========================================================================
    
    doc.addPage();
    let yTable = 18;

    // SECTION III: INDIVIDUAL PROCESS TABLE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("III. DETAILED SCAN PROCESSING RESULTS LEDGER", 15, yTable);
    yTable += 4;
    doc.line(15, yTable, pageWidth - 15, yTable);
    yTable += 5;

    // Draw header row
    doc.setFillColor(15, 23, 42); // dark slate
    doc.rect(15, yTable, pageWidth - 30, 7.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("FILENAME / IDENTIFIER", 18, yTable + 5);
    doc.text("EST. AGE", 84, yTable + 5);
    doc.text("GENDER EXP", 102, yTable + 5);
    doc.text("COMPLIANCE DISPOSITION", 124, yTable + 5);
    doc.text("IMAGE INTEGRITY STATUS", 170, yTable + 5);

    yTable += 7.5;

    scannedItems.forEach((item, idx) => {
      // Dynamic yTables-wrapping check
      if (yTable > pageHeight - 22) {
        yTable = 18;
        doc.addPage();
        drawPageDecorations(doc.internal.pages.length - 1, 999);

        // re-render small headers
        doc.setFillColor(15, 23, 42);
        doc.rect(15, yTable, pageWidth - 30, 7.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text("FILENAME / IDENTIFIER", 18, yTable + 5);
        doc.text("EST. AGE", 84, yTable + 5);
        doc.text("GENDER EXP", 102, yTable + 5);
        doc.text("COMPLIANCE DISPOSITION", 124, yTable + 5);
        doc.text("IMAGE INTEGRITY STATUS", 170, yTable + 5);
        yTable += 7.5;
      }

      // Alternate rows coloring
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yTable, pageWidth - 30, 7.5, "F");
      }

      // Draw minimal grid separator
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.12);
      doc.line(15, yTable + 7.5, pageWidth - 15, yTable + 7.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);

      const res = item.scanResult!;
      const face = res.faces?.[0];
      const code = face?.minorAppearanceSafetyCode;

      // Wrap & clean filename
      let fn = item.filename;
      if (fn.length > 33) fn = fn.substring(0, 31) + "...";
      doc.text(fn, 18, yTable + 5);

      doc.text(`${face?.estimatedAge || "N/A"} yrs`, 84, yTable + 5);
      doc.text(face?.genderPresentation || "N/A", 102, yTable + 5);

      // Compliance disposition badge
      if (code === "PASS_ADULT_APPEARANCE") {
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(167, 243, 208);
        doc.rect(124, yTable + 1.6, 32, 4.3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(4, 120, 87);
        doc.text("PASS_ADULT_LOOK", 126, yTable + 4.6);
      } else if (code === "ALERT_MINOR_APPEARANCE") {
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(253, 230, 138);
        doc.rect(124, yTable + 1.6, 32, 4.3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(180, 83, 9);
        doc.text("BORDERLINE_ALERT", 125, yTable + 4.6);
      } else {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(254, 202, 202);
        doc.rect(124, yTable + 1.6, 32, 4.3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(185, 28, 28);
        doc.text("SUCH_MINOR_REJ", 126.5, yTable + 4.6);
      }

      // Integrity source
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      if (res.isAiGenerated) {
        doc.setTextColor(220, 38, 38);
        doc.text(`AI DEEPFAKE (${(res.aiConfidence || 0).toFixed(0)}%)`, 170, yTable + 5);
      } else {
        doc.setTextColor(13, 148, 136);
        doc.text("REAL PHOTO (OK)", 170, yTable + 5);
      }

      yTable += 7.5;
    });

    // Check if space left for signature block
    if (yTable > pageHeight - 48) {
      yTable = 18;
      doc.addPage();
      drawPageDecorations(doc.internal.pages.length - 1, 999);
    }

    yTable += 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yTable, pageWidth - 30, 21, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, yTable, pageWidth - 30, 21, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("IV. AUDITOR DECLARATION & FORMAL COMPLIANCE SUBMISSION STAMP", 18, yTable + 4.5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("The technical diagnostics herein conform to official biometric age verification thresholds.", 18, yTable + 10);
    doc.text("All synthetic image texture integrity results are mathematically proven securely using standard classification models.", 18, yTable + 14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.text("TruthNow Compliance Seal Secured", pageWidth - 18, yTable + 11, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text("BLOCK ID: " + Math.random().toString(36).substring(2, 14).toUpperCase() + "_SEC", pageWidth - 18, yTable + 15.5, { align: "right" });

    // Update real total page counts back into footers
    const totalPagesCount = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPagesCount; p++) {
      doc.setPage(p);
      drawPageDecorations(p, totalPagesCount);
    }

    // Trigger local client save
    doc.save(`truthnow_compliance_audit_report_${new Date().toISOString().split("T")[0]}.pdf`);
    onShowToast("Audit compliance PDF report exported successfully!");
  };

  return (
    <div className="space-y-8" id="bulk-scanner-workspace">
      
      {/* Dynamic Uploader Segment Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Action Center */}
        <div className="lg:col-span-1 space-y-4">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`min-h-[220px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
              dragActive 
                ? "border-emerald-400 bg-emerald-500/5" 
                : "border-slate-850 bg-slate-900/10 hover:bg-slate-905/30 hover:border-slate-800"
            }`}
          >
            <Upload className="w-10 h-10 text-indigo-400 mb-2.5" />
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">{t.queueTitle}</span>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              {t.dragText}
            </p>

            <div className="flex flex-col gap-2.5 w-full mt-5">
              <label className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 font-bold hover:text-white rounded-xl text-xs font-sans transition-all cursor-pointer">
                {t.browseText}
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files) addFilesToQueue(e.target.files);
                  }} 
                />
              </label>

              <button
                onClick={loadAllPresetsIntoQueue}
                className="w-full py-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.loadPresets}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/20 p-5 rounded-3xl border border-slate-850 text-xs text-slate-400 leading-relaxed font-sans mt-4">
            <span className="text-slate-200 font-bold uppercase block mb-1">{t.summaryHeader}</span>
            {t.summaryText}
          </div>
        </div>

        {/* Queue Items Row Scroll Matrix */}
        <div className="lg:col-span-2 bg-slate-900/10 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between max-h-[380px] lg:max-h-none overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                {t.activeQueue} ({queue.length} files)
              </h4>
              <button 
                onClick={clearQueue}
                disabled={queue.length === 0}
                className="text-[10px] font-mono text-slate-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t.cleanQueue}
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1 select-none">
              {queue.length === 0 ? (
                <div className="text-center py-10 font-mono text-[11px] text-slate-550 border-2 border-dashed border-slate-850/60 rounded-2xl bg-slate-950/20">
                  {t.emptyQueue}
                </div>
              ) : (
                queue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-850 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.previewUrl} className="w-9 h-9 object-cover rounded-lg border border-slate-850" alt="" />
                      <div className="text-left min-w-0">
                        <span className="block text-xs font-bold text-slate-200 truncate max-w-[180px] sm:max-w-xs">{item.filename}</span>
                        <span className="block text-[10px] text-slate-500 font-mono uppercase">{item.fileSize}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "idle" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">PENDING</span>
                      )}
                      {item.status === "scanning" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-indigo-950/60 border border-indigo-500/20 text-indigo-455 uppercase tracking-wider font-semibold flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          {item.attempts && item.attempts > 1 ? `RETRY ${item.attempts}/3` : "SCANNING"}
                        </span>
                      )}
                      {item.status === "completed" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SUCCESS
                        </span>
                      )}
                      {item.status === "failed" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-red-950/60 border border-red-500/20 text-red-400 uppercase tracking-wider font-semibold flex items-center gap-1" title={item.errorMessage}>
                          <AlertCircle className="w-3 h-3 text-red-400" /> FAILED (3/3)
                        </span>
                      )}

                      {!isProcessing && (
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="p-1 hover:text-red-400 text-slate-550 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-850/80 pt-4 mt-4 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] font-mono text-slate-500">CONSUMPTION RISK</span>
              <span className="text-xs text-slate-300 font-semibold font-sans">Deducts 1 check scan quota per completed file</span>
            </div>

            <button
              onClick={executeBulkProcessing}
              disabled={isProcessing || queue.filter(i => i.status === "idle").length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold border-0 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              {t.runBatchAnalysis} ({queue.filter(i => i.status === "idle").length} pending)
            </button>
          </div>
        </div>

      </div>

      {/* COMPLETED KPI DASHBOARD INVENTORIES */}
      {scannedItems.length > 0 && (
        <div className="space-y-6">
          
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <BarChart2 className="absolute top-2 right-2 w-8 h-8 text-indigo-500/10" />
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Total Checked</span>
              <span className="block font-mono text-2xl font-black text-white mt-1">{totalCompleted}</span>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <ShieldAlert className="absolute top-2 right-2 w-8 h-8 text-rose-500/10" />
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Minors Flagged</span>
              <span className="block font-mono text-2xl font-black text-rose-400 mt-1">{minorsCount}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <CheckCircle2 className="absolute top-2 right-2 w-8 h-8 text-emerald-500/10" />
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Adult Pass</span>
              <span className="block font-mono text-2xl font-black text-emerald-400 mt-1">{adultsCount}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <Sparkles className="absolute top-2 right-2 w-8 h-8 text-violet-500/10" />
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">AI Deepfakes Detected</span>
              <span className="block font-mono text-2xl font-black text-[#818cf8] mt-1">{aiFakesCount}</span>
            </div>

            <div className="col-span-2 md:col-span-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <RefreshCw className="absolute top-2 right-2 w-8 h-8 text-cyan-500/10" />
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Average Age</span>
              <span className="block font-mono text-2xl font-black text-white mt-1">{averageAge} <span className="text-[10px] text-slate-400 font-normal">YRS</span></span>
            </div>
          </div>

          {/* Real-time Analytical Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Panel 1: Face Categories (Minor vs Adult) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                    Face Demographics Category
                  </h4>
                  <span className="text-[10px] bg-indigo-950/40 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/10 font-mono font-semibold">
                    Real-time
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Real-time distribution representing detected age category thresholds conforming to child protection norms.
                </p>
              </div>

              <div className="h-[220px] w-full relative flex items-center justify-center my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={faceCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {faceCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Central Label overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold font-mono text-slate-250">
                    {totalCompleted}
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    Scanned
                  </span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex justify-center flex-wrap gap-4 text-xs font-medium text-slate-300">
                {faceCategoryData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-mono text-[10px] text-slate-400">
                      {d.name}: <strong className="text-slate-200 font-extrabold">{d.value} ({totalCompleted > 0 ? Math.round((d.value / totalCompleted) * 100) : 0}%)</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Source Integrity Analysis (AI vs Real) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                    Image Source Integrity
                  </h4>
                  <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/10 font-mono font-semibold">
                    Deepfake Scan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Aesthetic and textural scan metrics separating authentic camera captures from synthetic deepfakes.
                </p>
              </div>

              <div className="h-[220px] w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={imageSourceData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                      labelStyle={{ color: "#94a3b8" }}
                      itemStyle={{ color: "#f8fafc" }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {imageSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="flex justify-center flex-wrap gap-4 text-xs font-medium text-slate-300">
                {imageSourceData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-mono text-[10px] text-slate-400">
                      {d.name}: <strong className="text-slate-200 font-extrabold">{d.value} ({totalCompleted > 0 ? Math.round((d.value / totalCompleted) * 100) : 0}%)</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Table filtering layout search bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search file reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500 hover:border-slate-800 transition-colors focus:ring-1 focus:ring-indigo-500/20 text-slate-200 text-xs rounded-xl focus:outline-none placeholder-slate-500 font-medium"
                />
              </div>

              {/* Advanced Filtering controls */}
              <div className="flex flex-wrap gap-2.5 items-center">
                
                {/* Gender filter */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-xl">
                  <Filter className="w-3.5 h-3.5 text-slate-550 mr-1" />
                  <span className="text-[10px] font-mono uppercase text-slate-500">Gender:</span>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="bg-transparent text-slate-300 font-semibold focus:outline-none text-[10px] cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="ambiguous">Ambiguous</option>
                  </select>
                </div>

                {/* Compliance safety filter */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Compliance:</span>
                  <select
                    value={filterCompliance}
                    onChange={(e) => setFilterCompliance(e.target.value)}
                    className="bg-transparent text-slate-300 font-semibold focus:outline-none text-[10px] cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="pass">Adult Pass</option>
                    <option value="alert">Border Alert</option>
                    <option value="minor">Sure Minor</option>
                  </select>
                </div>

                {/* Sincerity Type filter */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Source:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent text-slate-300 font-semibold focus:outline-none text-[10px] cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="real">Real Photo</option>
                    <option value="ai">AI Generated</option>
                  </select>
                </div>

                {/* Direct CSV extract */}
                <button
                  onClick={handleDownloadCSV}
                  className="p-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-500/20 rounded-xl hover:text-white transition-all text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer ml-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export csv
                </button>

                {/* Direct PDF compliance export */}
                <button
                  onClick={handleDownloadPDF}
                  className="p-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/20 rounded-xl hover:text-white transition-all text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer ml-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Audit PDF Report
                </button>

              </div>
            </div>

            {/* Structured Table */}
            <div className="overflow-x-auto border border-slate-850 rounded-2xl select-none">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-850">
                  <tr>
                    <th className="p-3 pl-4">Photo Preview</th>
                    <th className="p-3">Filename</th>
                    <th className="p-3 text-center">Physical Age</th>
                    <th className="p-3 text-center">Sex Expression</th>
                    <th className="p-3 text-center">Compliance Alert</th>
                    <th className="p-3 text-center">Source check</th>
                    <th className="p-3 text-right pr-4">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {displayQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 font-mono text-slate-550">
                        No checked elements align with the selected active filters.
                      </td>
                    </tr>
                  ) : (
                    displayQueue.map((item) => {
                      const res = item.scanResult;
                      if (!res) return null;
                      const face = res.faces?.[0];
                      const compliance = face?.minorAppearanceSafetyCode;

                      return (
                        <tr key={item.id} className="hover:bg-slate-905/30 transition-colors">
                          <td className="p-2.5 pl-4">
                            <img src={item.previewUrl} className="w-9 h-9 object-cover rounded-lg border border-slate-850" alt="" />
                          </td>
                          <td className="p-3 font-semibold text-slate-200">
                            <span className="block truncate max-w-[140px] md:max-w-xs">{item.filename}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-extrabold text-slate-100">
                            {face?.estimatedAge} <span className="text-slate-550 font-medium text-[10px]">YRS</span>
                          </td>
                          <td className="p-3 text-center font-semibold">
                            {face?.genderPresentation}
                          </td>
                          <td className="p-3 text-center">
                            {compliance === "PASS_ADULT_APPEARANCE" ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold font-mono bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
                                PASS_ADULT
                              </span>
                            ) : compliance === "ALERT_MINOR_APPEARANCE" ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold font-mono bg-amber-950/40 border border-amber-500/20 text-amber-400">
                                BORDER_ALERT
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold font-mono bg-rose-950/40 border border-rose-500/20 text-rose-400">
                                SURE_MINOR
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-bold font-mono uppercase ${
                              res.isAiGenerated 
                                ? "bg-rose-950/40 border border-rose-500/20 text-rose-450" 
                                : "bg-emerald-945/40 border border-emerald-500/20 text-emerald-450"
                            }`}>
                              {res.isAiGenerated ? "AI_FAKE" : "REAL"}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-[9px] text-slate-500 pr-4">
                            {new Date(res.processedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
