import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code, Key, Copy, Plus, ArrowLeft, Trash2, Eye, EyeOff, Terminal, 
  BookOpen, Cpu, Server, CheckCircle, Sliders, AlertCircle, Sparkles, Check,
  Activity, TrendingUp, BarChart3
} from "lucide-react";
import { DevApiKey } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DeveloperPortalProps {
  apiKeys: DevApiKey[];
  onGenerateApiKey: (name: string) => void;
  onRevokeApiKey: (id: string) => void;
  onToggleKeyStatus: (id: string) => void;
  onClose: () => void;
}

const SAMPLE_PORTRAITS = [
  { id: "customer_a", name: "Corporate Portrait", age: 29, gender: "Female", minor: "PASS_ADULT_APPEARANCE" },
  { id: "customer_b", name: "Teenage Game Streamer", age: 16, gender: "Male", minor: "SURE_MINOR" },
  { id: "customer_c", name: "Young adult", age: 19, gender: "Non-binary", minor: "ALERT_MINOR_APPEARANCE" }
];

export default function DeveloperPortal({
  apiKeys,
  onGenerateApiKey,
  onRevokeApiKey,
  onToggleKeyStatus,
  onClose
}: DeveloperPortalProps) {
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<"curl" | "node" | "python">("curl");
  const [toasts, setToasts] = useState<{ id: string; message: string; type?: "success" | "info" | "error" }[]>([]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };
  
  // Console state elements
  const [consoleSelectedKey, setConsoleSelectedKey] = useState<string>(
    apiKeys[0]?.key || "tn_test_a4b9c1d0e5f67890abcdef123y7"
  );
  const [consoleSelectedPortrait, setConsoleSelectedPortrait] = useState<string>("customer_a");
  const [isConsoleCalling, setIsConsoleCalling] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [consoleJsonOutput, setConsoleJsonOutput] = useState<string | null>(null);
  const [justCopiedSnippet, setJustCopiedSnippet] = useState<boolean>(false);
  const [injectedError, setInjectedError] = useState<"none" | "401" | "429">("none");

  // Find currently selected API Key object
  const currentKeyObj = apiKeys.find(k => k.key === consoleSelectedKey) || apiKeys[0];
  
  // Create deterministic 30-day analytics data
  const chartData = React.useMemo(() => {
    if (!currentKeyObj) return [];
    
    const data = [];
    const keyStr = currentKeyObj.key;
    const baseSeed = keyStr ? keyStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 101;
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Deterministic waves mimicking realistic traffic profiles per key
      const waveValue = Math.sin((baseSeed + i * i * 3) % 17) * 0.45 + 0.55;
      const noiseValue = (Math.cos((baseSeed + i * 5) % 13) * 0.55 + 0.45) * 0.25;
      const magnitude = 35 + (baseSeed % 41);
      
      let dailyTotal = Math.floor((waveValue + noiseValue) * magnitude);
      if (currentKeyObj.status === "revoked") {
        dailyTotal = i > 5 ? Math.floor(dailyTotal * 0.75) : 0;
      }
      
      // Sync today's traffic with actual cumulative mock count
      if (i === 0) {
        dailyTotal = Math.max(dailyTotal, currentKeyObj.callsCount);
      }
      
      data.push({
        date: dayName,
        calls: dailyTotal,
        latency: Math.floor(165 + Math.sin(i * 1.5) * 20 + (baseSeed % 12)),
      });
    }
    return data;
  }, [consoleSelectedKey, currentKeyObj?.callsCount, currentKeyObj?.status]);

  // Summarize 30 day metrics for the selected key
  const totalCalls30d = chartData.reduce((acc, item) => acc + item.calls, 0);
  const avgLatency = chartData.length > 0 ? Math.round(chartData.reduce((acc, item) => acc + item.latency, 0) / chartData.length) : 172;

  // Key visual generator form submission 
  const triggerGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateApiKey(newKeyName);
    setNewKeyName("");
  };

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
    showToast("API Access Token copied to clipboard successfully!");
  };

  // Run the sandbox test API client
  const runConsoleSimulation = () => {
    if (!consoleSelectedKey) {
      alert("Please generate or select an active Developer API Key token to authenticate the query.");
      return;
    }

    const currentKeyObj = apiKeys.find(k => k.key === consoleSelectedKey);
    if (currentKeyObj && currentKeyObj.status === "revoked") {
      alert("Error: The selected API credential token has been revoked / deactivated. Please toggle its state to Active or create a brand new key.");
      return;
    }

    setIsConsoleCalling(true);
    setConsoleLogs([]);
    setConsoleJsonOutput(null);

    const matchPortrait = SAMPLE_PORTRAITS.find(p => p.id === consoleSelectedPortrait) || SAMPLE_PORTRAITS[0];

    const logs = injectedError === "401"
      ? [
          `[00:01] ⚡ HTTP POST Request initiated to: https://api.truthnowai.com/v1/scan`,
          `[00:04] 🔐 Verifying bearer auth header: Authorization: Bearer ${consoleSelectedKey.substring(0, 10)}...`,
          `[00:08] ❌ ERROR: Bearer validation credentials mismatch (Unauthorized Access)`
        ]
      : injectedError === "429"
      ? [
          `[00:01] ⚡ HTTP POST Request initiated to: https://api.truthnowai.com/v1/scan`,
          `[00:04] 🔐 Verifying bearer auth header: Authorization: Bearer ${consoleSelectedKey.substring(0, 10)}...`,
          `[00:07] 📊 Traffic monitor node tracking window requests volume limit...`,
          `[00:10] ❌ ERROR: Current API token allocation threshold exceeded!`
        ]
      : [
          `[00:01] ⚡ HTTP POST Request initiated to: https://api.truthnowai.com/v1/scan`,
          `[00:04] 🔐 Verifying bearer auth header: Authorization: Bearer ${consoleSelectedKey.substring(0, 10)}...`,
          `[00:08] 🔎 Image payload base64 vector successfully unmarshalled (${(1.6).toFixed(1)} MB stream size)`,
          `[00:15] 🧠 Triggering Gemini Cognitive Vision classifier - analyzing structural geometry...`
        ];

    let count = 0;
    const interval = setInterval(() => {
      if (count < logs.length) {
        setConsoleLogs(prev => [...prev, logs[count]]);
        count++;
      } else {
        clearInterval(interval);
        
        if (injectedError === "401") {
          const errorRetBody = {
            success: false,
            error: "UNAUTHORIZED_API_ACCESS",
            statusCode: 401,
            message: "The provided API credential token is invalid, deactivated, or lacks required scopes.",
            timestamp: new Date().toISOString()
          };
          setConsoleLogs(prev => [...prev, `[00:12] 🔴 HTTP 401 Unauthorized - Authentication check failed!`]);
          setConsoleJsonOutput(JSON.stringify(errorRetBody, null, 2));
          setIsConsoleCalling(false);
          return;
        }

        if (injectedError === "429") {
          const errorRetBody = {
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            statusCode: 429,
            message: "Too Many Requests. Your sandbox key has exceeded its peak window limit of 60 requests/min.",
            retryAfterSeconds: 30,
            timestamp: new Date().toISOString()
          };
          setConsoleLogs(prev => [...prev, `[00:14] 🔴 HTTP 429 Too Many Requests - Threshold Limit Exceeded!`]);
          setConsoleJsonOutput(JSON.stringify(errorRetBody, null, 2));
          setIsConsoleCalling(false);
          return;
        }

        // Simulating the final structured JSON returned payload
        const simulatedRetBody = {
          success: true,
          status: "SUCCESS_VERIFIED",
          requestId: `req_gmn_${Math.random().toString(36).substring(2, 10)}`,
          facesDetected: 1,
          faces: [
            {
              confidenceScore: 98.65,
              estimatedAge: matchPortrait.age,
              ageCategory: matchPortrait.age >= 18 ? "Adult" : "Minor",
              genderPresentation: matchPortrait.gender,
              minorAppearanceSafetyCode: matchPortrait.minor,
              minorSafetyReasoning: `Structural evaluation indicates complete ${matchPortrait.age >= 18 ? "mature skull development, distinct zygomatic definitions, and facial skin texturing" : "youthful facial fat distribution, soft nasal profile, and minimal expression lines"} corresponding with specified age estimations.`,
              expression: "Neutral / Cooperative Portrait",
              attributes: {
                glassesDetected: false,
                facialHairDetected: matchPortrait.age >= 18 && matchPortrait.gender === "Male",
                makeupDetected: matchPortrait.gender === "Female",
                lightingQuality: "EXCELLENT_STUDIO"
              }
            }
          ],
          geoCompliance: {
            country: "US",
            jurisdiction: "COPPA / CCPA Rules Verification",
            scannerComplianceCode: "SECURE-US-COPPA-COMPLIANT"
          },
          processedAt: new Date().toISOString(),
          creditsUsed: 1
        };

        setConsoleLogs(prev => [...prev, `[00:23] 🟢 HTTP 200 OK - Successful response payload returned.`]);
        setConsoleJsonOutput(JSON.stringify(simulatedRetBody, null, 2));
        setIsConsoleCalling(false);

        // Mutate the local calls counter for keys
        if (currentKeyObj) {
          currentKeyObj.callsCount += 1;
        }
      }
    }, 450);
  };

  const copyDocumentationSnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setJustCopiedSnippet(true);
    setTimeout(() => setJustCopiedSnippet(false), 2000);
    showToast("Integration snippet code copied successfully!");
  };

  // Snippets
  const getCurlSnippet = () => `curl -X POST "https://api.truthnowai.com/v1/scan" \\
  -H "Authorization: Bearer ${consoleSelectedKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAUAAA...",
    "userCountrySim": "US"
  }'`;

  const getNodeSnippet = () => `const apiKey = "${consoleSelectedKey}";

fetch("https://api.truthnowai.com/v1/scan", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${apiKey}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAUAAA...",
    userCountrySim: "US"
  })
})
  .then(res => res.json())
  .then(data => console.log("Verification Success:", data))
  .catch(err => console.error("API Connection Error:", err));`;

  const getPythonSnippet = () => `import requests

api_key = "${consoleSelectedKey}"
url = "https://api.truthnowai.com/v1/scan"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAUAAA...",
    "userCountrySim": "US"
}

response = requests.post(url, json=payload, headers=headers)
print("Response JSON:", response.json())`;

  return (
    <div className="w-full space-y-16 py-4">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main SaaS Portal</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono py-1 px-3 rounded-full uppercase tracking-widest font-bold">
            Developer Ecosystem Hub
          </span>
          <span className="text-slate-600 font-mono text-[10px]">API Version v1.5_PRO</span>
        </div>
      </div>

      {/* 2. Hero Header Introduction */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg">
          <Terminal className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
          Natively Integrate Direct Biometric APIs
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Skip complex visual compliance coding. Query our ultra-fast server nodes directly using lightweight REST requests. Easily obtain real-time age classification, accuracy confidence metrics, and custom legal safety overrides.
        </p>
      </div>

      {/* 3. Developer API Pricing Tiers Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Developer Tier Economics Matrix</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Consolidated Dev API Tariffs</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Flexible pay-as-you-go visual classification limits. Volume-based discounts automatically scale as your traffic density increases. No heavy up-front startup fees.
          </p>
        </div>

        {/* Responsive Table UI */}
        <div className="overflow-x-auto rounded-xl border border-slate-850/80">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider font-mono border-b border-slate-850/80">
                <th className="p-4 font-extrabold">Developer Tier</th>
                <th className="p-4 font-extrabold text-emerald-400">Price Per Call</th>
                <th className="p-4 font-extrabold text-slate-300">Monthly Minimum</th>
                <th className="p-4 font-extrabold">Ideal Target Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80 text-slate-300 bg-slate-900/40">
              <tr className="hover:bg-slate-950/20 transition-all">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span>Developer</span>
                </td>
                <td className="p-4 font-mono font-bold text-base text-emerald-400">$0.10</td>
                <td className="p-4 font-mono text-slate-200 font-semibold">$10</td>
                <td className="p-4 text-slate-400">Hobby developers, discord bots, local small safety tools</td>
              </tr>
              <tr className="hover:bg-slate-950/20 transition-all bg-slate-950/10">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Startup</span>
                </td>
                <td className="p-4 font-mono font-bold text-base text-emerald-400">$0.07</td>
                <td className="p-4 font-mono text-slate-200 font-semibold">$49</td>
                <td className="p-4 text-slate-400">Indie founders, early-stage SaaS applications, beta systems</td>
              </tr>
              <tr className="hover:bg-slate-950/20 transition-all">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                  <span className="flex items-center gap-1.5">
                    Growth 
                    <span className="text-[9px] bg-pink-500/10 text-pink-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest border border-pink-500/20">POPULAR</span>
                  </span>
                </td>
                <td className="p-4 font-mono font-bold text-base text-emerald-400">$0.05</td>
                <td className="p-4 font-mono text-slate-200 font-semibold">$149</td>
                <td className="p-4 text-slate-400">Rapidly scaling mobile apps, enterprise gaming, production workloads</td>
              </tr>
              <tr className="hover:bg-slate-950/20 transition-all bg-slate-950/10">
                <td className="p-4 font-bold text-indigo-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                  <span>Enterprise</span>
                </td>
                <td className="p-4 font-mono font-bold text-base text-emerald-400">$0.03+</td>
                <td className="p-4 font-mono text-indigo-400 font-bold">$499–$999</td>
                <td className="p-4 text-slate-400">High-volume platforms, institutional compliance, custom SLAs & dedicated clusters</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. API Key Generator and Credential Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Key Generator form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase font-bold tracking-widest">
              <Key className="w-4 h-4" />
              <span>Token Issuing Facility</span>
            </div>
            <h3 className="text-xl font-bold text-slate-200">Create Access Credentials</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Issue instant live visual checking tokens. For security compliance, API keys are saved dynamically only in your local client secure cache variables.
            </p>
          </div>

          <form onSubmit={triggerGenerateKey} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-450 uppercase tracking-widest mb-1.5">
                Token Descriptor Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Discord Bot / production_app"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all font-mono shadow-inner"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Issue API Token Key</span>
            </button>
          </form>

          <div className="p-4 bg-indigo-950/15 border border-indigo-950/50 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-450 leading-relaxed space-y-1.5 font-sans">
              <p className="font-semibold text-slate-350">Secure Environment Encrypted</p>
              <p>Keep your production secrets safe. Never expose raw API key headers to front-end layers. Proxy all REST requests through server-side environment variables.</p>
            </div>
          </div>
        </div>

        {/* Right Hand: Active Keys Table Grid */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">System Credentials Ledger</h3>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-850">
              Total Issued Keys: <strong className="text-emerald-400">{apiKeys.length}</strong>
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {apiKeys.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2">
                <Key className="w-8 h-8 opacity-40" />
                <p className="text-xs font-mono select-none uppercase tracking-wider">No active credentials present</p>
              </div>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {apiKeys.map((item) => {
                  const isRevealed = revealedKeys[item.id] || false;
                  const isCopied = copiedKeyId === item.id;
                  
                  return (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: -15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      layout
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-750 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-200 text-xs">{item.name}</span>
                          <button
                            onClick={() => onToggleKeyStatus(item.id)}
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border cursor-pointer font-bold transition-all uppercase tracking-widest ${
                              item.status === "active"
                                ? "bg-emerald-405/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-505/20"
                                : "bg-red-405/10 border-red-500/20 text-red-400 hover:bg-red-505/20"
                            }`}
                            title={`Click to turn credentials ${item.status === "active" ? "Inactive" : "Active"}`}
                          >
                            ● {item.status}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="text-slate-500">Token:</span>
                          <span className="text-indigo-300 font-semibold md:w-48 overflow-hidden text-ellipsis whitespace-nowrap block">
                            {isRevealed ? item.key : "tn_••••••••••••••••••••••••••••"}
                          </span>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button 
                              onClick={() => toggleKeyReveal(item.id)}
                              className="text-slate-555 hover:text-indigo-400 font-mono transition-colors cursor-pointer p-0.5"
                              title={isRevealed ? "Hide token hash string" : "Reveal clear decrypt token"}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => copyToClipboard(item.id, item.key)}
                              className={`transition-colors cursor-pointer p-0.5 ${
                                isCopied ? "text-emerald-400" : "text-slate-555 hover:text-indigo-400"
                              }`}
                              title="Copy to Clipboard"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-4 text-[9px] text-slate-550 font-mono uppercase tracking-wider">
                          <span>Issued: {item.createdAt}</span>
                          <span>•</span>
                          <span>Simulation Queries: <strong className="text-slate-350">{item.callsCount}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center border-t border-slate-900 sm:border-0 pt-3 sm:pt-0">
                        <button
                          onClick={() => copyToClipboard(item.id, item.key)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider ${
                            isCopied 
                              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400 py-1.5 px-3" 
                              : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Copy Key to Clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>COPIED</span>
                            </>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {item.id !== "key_initial" && (
                          <button
                            onClick={() => onRevokeApiKey(item.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/40 text-slate-500 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center"
                            title="Revoke / permanent delete credential"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* 5. Interactive API Sandbox Console Test Workbench & Snippet docs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start text-left">
        {/* Left Side: Dynamic Sandbox Tester Playground console */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <span className="text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-widest bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1 rounded-full w-fit block">
              REST Request Playground Node
            </span>
            <h3 className="text-xl font-bold text-slate-200">HTTP REST Simulator</h3>
            <p className="text-xs text-slate-500">
              Inject base64 visual portraits, send mock headers, and query predictions live.
            </p>
          </div>

          <div className="space-y-4">
            {/* Input elements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-slate-450 uppercase tracking-widest mb-1">
                  Active Auth Key
                </label>
                <select
                  value={consoleSelectedKey}
                  onChange={(e) => setConsoleSelectedKey(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 focus:border-indigo-505 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none cursor-pointer shadow-inner"
                >
                  {apiKeys.length === 0 ? (
                    <option value="">No Active Keys Created</option>
                  ) : (
                    apiKeys.map(k => (
                      <option key={k.id} value={k.key}>
                        {k.name} ({k.status === "revoked" ? "REVOKED" : k.key.substring(0, 10) + "..."})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-450 uppercase tracking-widest mb-1">
                  Query Portrait Photo
                </label>
                <select
                  value={consoleSelectedPortrait}
                  onChange={(e) => setConsoleSelectedPortrait(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 focus:border-indigo-505 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-sans focus:outline-none cursor-pointer shadow-inner"
                >
                  {SAMPLE_PORTRAITS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}y / {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-450 uppercase tracking-widest mb-1">
                  Inject API Error
                </label>
                <select
                  value={injectedError}
                  onChange={(e) => setInjectedError(e.target.value as "none" | "401" | "429")}
                  className={`w-full bg-slate-955 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none cursor-pointer shadow-inner transition-all ${
                    injectedError !== "none"
                      ? "border-red-500/40 text-red-450 focus:border-red-500 font-medium"
                      : "border-slate-800 focus:border-indigo-505 text-slate-300"
                  }`}
                >
                  <option value="none">None (HTTP 200 OK)</option>
                  <option value="401">401 Unauthorized</option>
                  <option value="429">429 Rate Limited</option>
                </select>
              </div>
            </div>

            {/* Simulated Server execution console */}
            <div className="space-y-2 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 overflow-hidden font-mono text-[11px] leading-relaxed relative min-h-[300px] flex flex-col justify-between">
              
              <div className="space-y-1">
                {/* Console header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-900 text-[10px] text-slate-500 mb-2 select-none">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <span>TRUTHNOW_REST_STREAMER v1.5</span>
                  </div>
                  {injectedError !== "none" ? (
                    <span className="text-red-400 font-bold uppercase tracking-wider animate-pulse">
                      TESTING-ERROR-{injectedError}
                    </span>
                  ) : (
                    <span>SANDBOX</span>
                  )}
                </div>

                {/* Simulated live telemetry execution rows */}
                {consoleLogs.length === 0 && !isConsoleCalling && (
                  <div className="text-slate-600 text-center py-16 space-y-2 font-mono">
                    <Terminal className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                    <p className="uppercase text-[9px] tracking-wider select-none">Await client execution command call...</p>
                    {injectedError !== "none" && (
                      <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest animate-pulse max-w-sm mx-auto mt-1">
                        ⚠️ Simulated {injectedError} failure mode active
                      </p>
                    )}
                  </div>
                )}

                {consoleLogs.map((logStr, lIdx) => (
                  <div 
                    key={lIdx} 
                    className={`transition-all duration-300 ${
                      logStr.includes("HTTP 200 OK") 
                        ? "text-emerald-400 font-bold" 
                        : logStr.includes("ERROR") 
                          ? "text-red-400 font-semibold" 
                          : "text-slate-400"
                    }`}
                  >
                    {logStr}
                  </div>
                ))}

                {isConsoleCalling && (
                  <div className="flex items-center gap-2 text-indigo-400 py-1 font-bold animate-pulse">
                    <span>⚡ Streaming prediction packet parameters...</span>
                  </div>
                )}

                {/* Pretty representation output text block */}
                {consoleJsonOutput && (
                  <pre className="mt-4 p-3 bg-slate-900 border border-slate-850 rounded-lg overflow-x-auto text-[10px] text-white max-h-[190px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-all leading-tight">
                    {consoleJsonOutput}
                  </pre>
                )}
              </div>

              {/* Reset simulator clear button if active */}
              {(consoleLogs.length > 0 || consoleJsonOutput) && !isConsoleCalling && (
                <div className="flex justify-end pt-3 border-t border-slate-900 select-none">
                  <button
                    onClick={() => { setConsoleLogs([]); setConsoleJsonOutput(null); }}
                    className="text-slate-550 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest bg-slate-900 px-2 py-1 rounded"
                  >
                    Clear Display Console
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={runConsoleSimulation}
              disabled={isConsoleCalling || apiKeys.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl ${
                isConsoleCalling 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98"
              }`}
            >
              <Cpu className={`w-4 h-4 ${isConsoleCalling ? "animate-spin" : ""}`} />
              <span>{isConsoleCalling ? "Analyzing Web Payload..." : "Transmit Visual REST API Code Query"}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Copyable Documentation blocks with multiple language headers */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              <span>REST SDK Code Boilerplates</span>
            </div>
            <h3 className="text-xl font-bold text-slate-200">Integration Reference Code</h3>
            <p className="text-xs text-slate-500 font-sans">
              Copy-paste complete request logic templates carrying your active security token credential instantly.
            </p>
          </div>

          {/* Code Selection tabs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 font-mono text-[10px] uppercase font-bold tracking-wider select-none">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveLangTab("curl")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeLangTab === "curl"
                      ? "bg-slate-900 text-indigo-400 border border-slate-800"
                      : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  cURL Shell
                </button>
                <button
                  onClick={() => setActiveLangTab("node")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeLangTab === "node"
                      ? "bg-slate-900 text-indigo-400 border border-slate-800"
                      : "text-slate-505 hover:text-slate-350"
                  }`}
                >
                  NodeJS fetch
                </button>
                <button
                  onClick={() => setActiveLangTab("python")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeLangTab === "python"
                      ? "bg-slate-900 text-indigo-400 border border-slate-800"
                      : "text-slate-505 hover:text-slate-350"
                  }`}
                >
                  Python requests
                </button>
              </div>

              <div className="pr-1 text-slate-600">v1.5_JSON</div>
            </div>

            {/* Displaying actual code block content snippets */}
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed text-indigo-300 max-h-[340px] select-all leading-relaxed">
                {activeLangTab === "curl" ? getCurlSnippet() : activeLangTab === "node" ? getNodeSnippet() : getPythonSnippet()}
              </pre>

              {/* Snippet copy hover float button */}
              <button
                onClick={() => copyDocumentationSnippet(
                  activeLangTab === "curl" ? getCurlSnippet() : activeLangTab === "node" ? getNodeSnippet() : getPythonSnippet()
                )}
                className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-[9px] font-mono tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer shadow-lg z-10 select-none uppercase ${
                  justCopiedSnippet 
                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 font-bold" 
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {justCopiedSnippet ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COPIED CODE</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>COPY snippet</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual JSON response parameters blueprint details */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-left font-sans gap-2 select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-505/10 rounded-lg text-indigo-400">
                  <Server className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-[10px]">
                  <p className="font-extrabold text-slate-200">Server response compliance headers</p>
                  <p className="text-slate-500">Every response delivers secure geo compliance and visual integrity status tokens.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.6)] border-indigo-500/20"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold font-sans tracking-tight text-slate-200">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
