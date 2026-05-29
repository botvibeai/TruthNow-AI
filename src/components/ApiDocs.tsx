import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Code, ArrowLeft, Copy, Check, BookOpen, Terminal, 
  ShieldAlert, AlertTriangle, Key, Cpu, HelpCircle, CornerDownRight
} from "lucide-react";

interface ApiDocsProps {
  onClose: () => void;
}

export default function ApiDocs({ onClose }: ApiDocsProps) {
  const [activeLang, setActiveLang] = useState<"curl" | "node" | "python" | "go">("curl");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST "https://api.truthnowai.com/api/scan" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    "mimeType": "image/png",
    "userCountrySim": "US"
  }'`,
    node: `const axios = require('axios');

const data = JSON.stringify({
  imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbybl...", // Base64 Raw Data
  mimeType: "image/png",
  userCountrySim: "US"
});

const config = {
  method: 'post',
  url: 'https://api.truthnowai.com/api/scan',
  headers: { 
    'Authorization': 'Bearer YOUR_API_KEY', 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });`,
    python: `import requests
import json

url = "https://api.truthnowai.com/api/scan"

payload = {
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbybl...", # Base64 Raw Data
    "mimeType": "image/png",
    "userCountrySim": "US"
}
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.request("POST", url, headers=headers, json=payload)
print(response.json())`,
    go: `package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {
	url := "https://api.truthnowai.com/api/scan"
	payload := strings.NewReader(\`{
		"imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbybl...",
		"mimeType": "image/png",
		"userCountrySim": "US"
	}\`)

	req, _ := http.NewRequest("POST", url, payload)
	req.Header.Add("Authorization", "Bearer YOUR_API_KEY")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(string(body))
}`
  };

  const responsePayloadSample = `{
  "success": true,
  "usingSimulation": false,
  "usingCloudmersive": true,
  "facesDetected": 1,
  "faces": [
    {
      "confidenceScore": 95.8,
      "estimatedAge": 25,
      "ageRange": "22-28",
      "ageCategory": "Young Adult",
      "genderPresentation": "Female",
      "genderConfidence": 98.5,
      "minorAppearanceSafetyCode": "PASS_ADULT_APPEARANCE",
      "minorSafetyReasoning": "[Cloudmersive Biometrics Node] Face measures correspond with adult demographics over 18.",
      "expression": "Pleasant Neutral",
      "attributes": {
        "glassesDetected": false,
        "facialHairDetected": false,
        "makeupDetected": true,
        "lightingQuality": "Synthesized Glossy"
      },
      "relativeCoordinates": { "x": 50, "y": 50, "width": 50, "height": 50 }
    }
  ],
  "isAiGenerated": true,
  "aiConfidence": 98.5,
  "aiReason": "[AI Engine Check] Generative synthesis artifacts detected. Oversmooth skin textures indicate artificial face.",
  "geoCompliance": {
    "country": "United States",
    "jurisdiction": "COPPA / CCPA Regulatory Framework",
    "scannerComplianceCode": "SECURE-US-COPPA-COMPLIANT",
    "mandatoryRetentionLimitHours": 0,
    "dataPolicyNote": "Meets biometric safety standard requirements for transient zero-cache memory execution."
  },
  "processedAt": "2026-05-27T15:58:36.512Z",
  "seoMetrics": {
    "keywordsActive": ["age gender detector", "real or AI image verification", "fake or not checker"],
    "score": 100
  }
}`;

  return (
    <div className="space-y-10 animate-fade-in font-sans text-slate-300">
      
      {/* Document Back Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <button 
            onClick={onClose}
            className="group inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mb-2.5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO WORKBENCH
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-505/20 rounded-2xl text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Developer API Reference File
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Technical API documentation, model schemas, and payload examples for cloud biometric face scanner and artificial deepfake checks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-full font-mono text-[10px] uppercase font-semibold">
            v1.2 Rest Spec
          </span>
          <span className="px-3 py-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-full font-mono text-[10px] uppercase font-semibold">
            Status: Active Node
          </span>
        </div>
      </div>

      {/* Docs Grid Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Quick scroll sidebar anchors */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-24">
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono uppercase text-slate-500 font-bold tracking-widest px-2 mb-2">
              Sections
            </span>
            <ul className="space-y-1 font-mono text-[11px]">
              <li>
                <a href="#endpoint-overview" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-all">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Base URL & Auth</span>
                </a>
              </li>
              <li>
                <a href="#request-parameters" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-all">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Request Parameters</span>
                </a>
              </li>
              <li>
                <a href="#response-payload" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-all">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Response Properties</span>
                </a>
              </li>
              <li>
                <a href="#interactive-snippets" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-all">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Code Snippets</span>
                </a>
              </li>
              <li>
                <a href="#error-schemas" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-all">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Error Handlers</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/10 to-slate-950 border border-slate-800 p-5 rounded-2xl text-left space-y-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 w-9 h-9 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Sandbox Token Access</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generate development API tokens inside the <span className="text-slate-200">Developer API Portal</span>. Use the always-active sandbox test token to evaluate endpoints without deducting plan credits.
            </p>
          </div>
        </div>

        {/* Documentation details container */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Base URL and Auth details */}
          <section id="endpoint-overview" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono tracking-widest">
              <Cpu className="w-4 h-4" />
              <span>Base URL & Authentication Standard</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Gateway Integration & Bearer Tokens
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              All REST visual model queries must target the secure endpoints specified below. Authenticate every HTTP request by supplying your developers' API key inside the standard headers profile.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden font-mono text-[11px]">
              <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/30 flex items-center justify-between">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Standard Host URLs</span>
                <span className="text-emerald-400 text-[10px] font-bold">SSL (TLS 1.3 REQUIRED)</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
                  <span className="w-24 font-bold text-indigo-400">[Staging / Prod]</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-350 select-all">
                    https://api.truthnowai.com/api
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
                  <span className="w-24 font-bold text-slate-500">[Local Sandbox]</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-400 select-all">
                    http://localhost:3000/api
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden font-mono text-[11px]">
              <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/30 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                Required HTTP Headers
              </div>
              <div className="p-4 space-y-2 text-left">
                <div className="flex items-start gap-3">
                  <span className="bg-slate-900 py-0.5 px-2 rounded font-bold text-indigo-300 min-w-120 shrink-0">Authorization:</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Bearer <code className="text-indigo-400">YOUR_API_KEY_TOKEN</code>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-slate-900 py-0.5 px-2 rounded font-bold text-indigo-300 min-w-120 shrink-0">Content-Type:</span>
                  <span className="text-slate-400 text-[11px]">
                    application/json
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Request Parameters Spec */}
          <section id="request-parameters" className="scroll-mt-24 space-y-4 text-left">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono tracking-widest">
              <Terminal className="w-4 h-4" />
              <span>Request Pipeline Parameters</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              POST /scan Endpoint Payload Specification
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This core endpoint triggers parallel face checks, structural age classification, sexual expression indicators, and Real vs AI generated texture authenticity audits.
            </p>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-450 uppercase text-[9px] font-bold tracking-widest">
                      <th className="p-4">Parameter</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    <tr>
                      <td className="p-4 font-bold text-white">imageBase64</td>
                      <td className="p-4 text-indigo-350">string</td>
                      <td className="p-4"><span className="text-rose-450 text-rose-400 font-bold">REQUIRED</span></td>
                      <td className="p-4 text-slate-410 leading-relaxed">
                        The raw visual binary stream base64 unmarshalled string. Ensure there are no headers like <code className="text-slate-500">data:image/...</code> unless normalized. Maximum payload: <strong>4MB</strong>.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">mimeType</td>
                      <td className="p-4 text-indigo-350">string</td>
                      <td className="p-4 text-slate-500">OPTIONAL</td>
                      <td className="p-4 text-slate-410">
                        Default: <code className="text-slate-550">image/jpeg</code>. Explicitly set media format to <code className="text-indigo-400">image/png</code>, <code className="text-indigo-400">image/webp</code>, or <code className="text-indigo-400">image/gif</code> to speed parsing.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">userCountrySim</td>
                      <td className="p-4 text-indigo-350">string</td>
                      <td className="p-4 text-slate-500">OPTIONAL</td>
                      <td className="p-4 text-slate-410 leading-relaxed">
                        ISO-3166-1 2-letter country indicator code (e.g. <code className="text-indigo-400">US</code>, <code className="text-indigo-400">GB</code>, <code className="text-indigo-400">EU</code>, <code className="text-indigo-400">CA</code>). Dynamically triggers regional privacy rule guidelines.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Response payload spec */}
          <section id="response-payload" className="scroll-mt-24 space-y-4 text-left">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono tracking-widest">
              <Code className="w-4 h-4" />
              <span>Response Object properties</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Output Payload Model Schema
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Returns detailed, structured biometric indicators, dynamic geographic boundaries, and artificial pixel synthesis checks inside a single latency-optimized response container.
            </p>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl overflow-hidden p-5 space-y-4">
              <h3 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">
                Core Property Specifications
              </h3>
              <ul className="space-y-4 font-mono text-[11px] text-slate-350">
                <li className="flex flex-col gap-1 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">success</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-900/10 px-1.5 py-0.2 rounded font-mono">boolean</span>
                  </div>
                  <span className="text-slate-450 leading-relaxed">
                    Indicates whether the entire image parsing pipeline successfully terminated without core structural failures.
                  </span>
                </li>
                
                <li className="flex flex-col gap-1 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">isAiGenerated</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/20 px-1.5 py-0.2 rounded font-mono">boolean</span>
                  </div>
                  <span className="text-slate-450 leading-relaxed">
                    Flag showing image generation checking origin. Returns <code className="text-rose-400 font-bold">true</code> if neural deepfake synthesis anomalies, unnatural skin gradients, or diffusion edge traits are verified.
                  </span>
                </li>

                <li className="flex flex-col gap-1 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">aiConfidence</span>
                    <span className="text-[10px] text-indigo-300 bg-indigo-950/20 px-1.5 py-0.2 rounded font-mono">number</span>
                  </div>
                  <span className="text-slate-450">
                    Accuracy certainty percentile score representing relative image origin confidence (0-100%).
                  </span>
                </li>

                <li className="flex flex-col gap-1 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">aiReason</span>
                    <span className="text-[10px] text-slate-500 font-mono">string</span>
                  </div>
                  <span className="text-slate-450 leading-relaxed">
                    Dermal texture and neural noise distribution breakdown detailing the classification results.
                  </span>
                </li>

                <li className="flex flex-col gap-1 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">facesDetected</span>
                    <span className="text-[10px] text-indigo-350 bg-indigo-950/20 px-1.5 py-0.2 rounded font-mono">integer</span>
                  </div>
                  <span className="text-slate-445">
                    Count of human faces successfully isolated and measured inside the image. Returns <code className="text-slate-500">0</code> if no face is isolated.
                  </span>
                </li>

                <li className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">faces</span>
                    <span className="text-[10px] text-indigo-350 bg-indigo-950/20 px-1.5 py-0.2 rounded font-mono">array of face objects</span>
                  </div>
                  <p className="text-slate-450 leading-relaxed mb-1.5">
                    Array of target face records. Standard visual parameters parsed per index include:
                  </p>
                  <div className="pl-4 border-l border-indigo-950 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                    <div>• <code className="text-white font-bold">estimatedAge</code>: Int representing estimated age presentation (e.g. <code className="text-indigo-300">25</code>).</div>
                    <div>• <code className="text-white font-bold">genderPresentation</code>: Gender classification presentation (<code className="text-indigo-300">"Female"</code>, <code className="text-indigo-300">"Male"</code>, or <code className="text-indigo-300">"Ambiguous"</code>).</div>
                    <div>• <code className="text-white font-bold">minorAppearanceSafetyCode</code>: Critical security trigger evaluation: <code className="text-rose-450 font-bold text-rose-400">"SURE_MINOR"</code>, <code className="text-yellow-450 font-bold text-yellow-500">"ALERT_MINOR_APPEARANCE"</code>, or <code className="text-emerald-400 font-bold">"PASS_ADULT_APPEARANCE"</code>.</div>
                    <div>• <code className="text-white font-bold">minorSafetyReasoning</code>: Transparent physical verification log outlining cranial proportion indices and biological skeletal characteristics.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Code snippets and languages */}
          <section id="interactive-snippets" className="scroll-mt-24 space-y-4 text-left">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono tracking-widest">
              <Terminal className="w-4 h-4" />
              <span>Language Integration Center</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Instant Copy-Paste Snippets
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Initiate API executions right out of your existing microservices stack. Select your core language to construct valid visual payload envelopes.
            </p>

            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Tab Header */}
              <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {(["curl", "node", "python", "go"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all uppercase cursor-pointer ${
                        activeLang === lang
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                          : "text-slate-400 hover:text-white bg-slate-955 hover:bg-slate-850"
                      }`}
                    >
                      {lang === "curl" ? "cURL" : lang === "node" ? "Node.js" : lang === "python" ? "Python" : "Go (Standard)"}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard("snippet", codeSnippets[activeLang])}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedSnippet === "snippet" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Panel */}
              <div className="p-6 overflow-x-auto text-left">
                <pre className="font-mono text-xs text-indigo-200 leading-relaxed select-all">
                  {codeSnippets[activeLang]}
                </pre>
              </div>
            </div>

            {/* Response Payload Block */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  Target Response JSON payload
                </span>
                <button
                  onClick={() => copyToClipboard("response", responsePayloadSample)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {copiedSnippet === "response" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Payload!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/80 border border-slate-850 p-6 rounded-3xl overflow-x-auto text-left max-h-[440px] overflow-y-auto">
                <pre className="font-mono text-[11px] text-emerald-300 leading-relaxed select-all">
                  {responsePayloadSample}
                </pre>
              </div>
            </div>
          </section>

          {/* Fault Error Table */}
          <section id="error-schemas" className="scroll-mt-24 space-y-4 text-left">
            <div className="flex items-center gap-2 text-rose-450 text-rose-400 font-bold text-xs uppercase font-mono tracking-widest animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              <span>Fault Resolution Matrix</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white animate-fade-in">
              HTTP Error Handling & Fail-Safe Code Specifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We return standardized HTTP status codes representing the exact error context. Failures are captured and returned in simple JSON structures, speeding exception triage.
            </p>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-450 uppercase text-[9px] font-bold tracking-widest">
                      <th className="p-4 w-24">Status Code</th>
                      <th className="p-4 w-40">Classification Path</th>
                      <th className="p-4">Detailed Recovery Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-400">
                    <tr>
                      <td className="p-4 font-bold text-emerald-400">200 OK</td>
                      <td className="p-4 text-emerald-300">REQUEST_SUCCESS</td>
                      <td className="p-4 text-slate-400 leading-relaxed">
                        Query processed successfully. Response metadata envelope delivered to matching callback threads.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-amber-500">400 Bad Request</td>
                      <td className="p-4 text-amber-400">MALFORMED_PAYLOAD</td>
                      <td className="p-4 text-slate-400 leading-relaxed">
                        Input is missing the required <code className="text-slate-300">imageBase64</code> file stream, or image compression format cannot be processed. Ensure valid unmarshalled Base64 string is supplied.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-rose-400">401 Unauthorized</td>
                      <td className="p-4 text-rose-400">INVALID_AUTH_TOKEN</td>
                      <td className="p-4 text-slate-400 leading-relaxed">
                        API credential key token is missing or has expired/revoked. Check matching bearer details in the developer dashboard portal.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-rose-400">402 Payment Required</td>
                      <td className="p-4 text-rose-400">QUOTA_LIMIT_EXCEEDED</td>
                      <td className="p-4 text-slate-400 leading-relaxed font-sans text-xs">
                        Scattering credits on current subscription plan are depleted. Purchase single credit scan packs inside the pricing module.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-red-400">429 Too Many Requests</td>
                      <td className="p-4 text-red-400">RATE_LIMIT_EXCEEDED</td>
                      <td className="p-4 text-slate-400 leading-relaxed">
                        The API key has exceeded its allowed rate. Sandbox/free key threshold limit is set to <strong>60 requests per minute</strong>. Includes a <code className="text-slate-300">retryAfterSeconds</code> integer indicating backoff lock metrics.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-indigo-400">413 Payload Too Large</td>
                      <td className="p-4 text-indigo-400">MAX_LIMIT_EXCEEDED</td>
                      <td className="p-4 text-slate-400 leading-relaxed">
                        Target canvas file stream size exceeds the <strong>4MB maximum envelope cap</strong>. Compress image file vectors on client-side state prior to uploading.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-indigo-400">500 Server Error</td>
                      <td className="p-4 text-indigo-400">COGNITIVE_TIMEOUT_FAIL</td>
                      <td className="p-4 text-slate-400 leading-relaxed">
                        Upstream API parser timeout or transient microservice exceptions. Integrators are advised to execute a fallback exponential-backoff retry scheme.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Error Simulation Section */}
            <div className="bg-slate-950/80 p-5 rounded-3xl border border-red-500/20 flex gap-4 text-xs leading-relaxed text-left mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-white">Interactive Sandbox Fault Simulation</h4>
                <p className="text-slate-400 mt-1">
                  Want to see how your integration handles these exact error models? Visit the <strong className="text-indigo-400">Developer API Portal</strong> and use the <strong className="text-red-400">Inject API Error</strong> dropdown. You can toggle between <strong>401 Unauthorized</strong> or <strong>429 Rate Limited</strong> modes to instantly view live console logs and test sample JSON failure payloads in real-time.
                </p>
              </div>
            </div>

            {/* Developer Help Footer Card */}
            <div className="bg-slate-900/30 p-5 rounded-3xl border border-slate-800 flex gap-4 text-xs leading-relaxed">
              <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-white">Need Live Help Integration?</h4>
                <p className="text-slate-400 mt-1">
                  Our core visual analysis systems are backed by strict Service Level Agreements (SLA). Contact the enterprise team on <span className="text-indigo-400">michael@botvibe.ai</span> to set up a dedicated enterprise virtual environment with static dedicated IPs and multi-spectral throughput quotas.
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
