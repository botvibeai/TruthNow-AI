import { motion } from "motion/react";
import { Shield, Sparkles, Zap, Globe, FileCheck } from "lucide-react";

interface HeroSectionProps {
  onScrollToScanner: () => void;
}

export default function HeroSection({ onScrollToScanner }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-slate-950 text-slate-100">
      {/* Aurora Ambient Orbs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Copy Area */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-slate-900/95 border border-slate-800 rounded-full py-1 px-3 w-fit text-slate-300 text-xs font-mono"
            >
              <Sparkles className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              <span>Next-Generation Cognitive Engine</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-emerald-400 uppercase font-bold tracking-widest text-[9px]">Live 3.5</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-sans tracking-tight leading-tight text-white font-semibold"
            >
              Face, Sex, & Age <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                Recognition Suite
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed font-sans"
            >
              Deploy enterprise cognitive visual analysis instantly. Learn 
              <strong className="text-slate-200"> how to check if a person in a photo is minor or adult appearance</strong>, 
              determine visual gender traits, and run real-time biometric-safe geographic compliance audits automatically.
            </motion.p>

            {/* Keyword tags / SEO anchor indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-500"
            >
              <span className="border border-slate-900 bg-slate-900/30 px-2 py-0.5 rounded-md hover:border-slate-800 transition-colors">#age gender detector</span>
              <span className="border border-slate-900 bg-slate-900/30 px-2 py-0.5 rounded-md hover:border-slate-800 transition-colors">#gender detector photo</span>
              <span className="border border-slate-900 bg-slate-900/30 px-2 py-0.5 rounded-md hover:border-slate-800 transition-colors">#face gender analyzer</span>
              <span className="border border-slate-900 bg-slate-900/30 px-2 py-0.5 rounded-md hover:border-slate-800 transition-colors">#gender detection from image</span>
            </motion.div>

            {/* CTA Controls */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
            >
              <button
                onClick={onScrollToScanner}
                id="btn_scroll_scanner"
                className="relative overflow-hidden group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-medium rounded-lg shadow-xl shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-all text-center cursor-pointer active:scale-98"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide">
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  Try Live Face Scanner
                </span>
              </button>
              
              <a
                href="#pricing-section"
                className="flex items-center justify-center gap-2 border border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 text-slate-300 font-medium px-8 py-4 rounded-lg hover:text-white hover:border-slate-700 transition-colors text-sm text-center"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                View Enterprise Pricing
              </a>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4 border-t border-slate-900 pt-8 mt-4 text-left"
            >
              <div>
                <span className="block text-2xl font-semibold text-white font-mono">99.8%</span>
                <span className="text-xs text-slate-500 font-sans font-medium">Model Precision</span>
              </div>
              <div>
                <span className="block text-2xl font-semibold text-white font-mono">140ms</span>
                <span className="text-xs text-slate-500 font-sans font-medium">Crawl API Latency</span>
              </div>
              <div>
                <span className="block text-2xl font-semibold text-white font-mono">Zero</span>
                <span className="text-xs text-slate-500 font-sans font-medium">Data Retention</span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Graphic Mockup Area (The Wow Visual Aspect) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-[370px] bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-2xl"
            >
              {/* Fake UI Screen with active face scan visualizer */}
              <div className="absolute -top-3 -right-3 bg-cyan-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider shadow font-mono">
                SECURE SCANNER ACTIVE
              </div>

              {/* Mock Image Box */}
              <div className="relative aspect-[4/5] rounded-2xl bg-slate-950 overflow-hidden border border-slate-800/80 group">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop" 
                  alt="Face and gender estimation visual representation" 
                  className="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Simulated Scanning active overlay block */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 via-cyan-400/10 to-transparent animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[bounce_3s_infinite]" />

                {/* Face Scanning square locator overlay */}
                <div className="absolute top-[22%] left-[24%] w-[52%] h-[42%] border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center">
                  {/* Bounding points */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  
                  {/* Glowing text anchor */}
                  <div className="absolute bg-emerald-900/95 border border-emerald-500 text-emerald-300 text-[10px] font-mono py-1 px-2 rounded-md -bottom-4 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    <span>Candidate #1: Female Presentation</span>
                  </div>
                </div>

                {/* Left indicators */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 text-[9px] font-mono text-slate-400 bg-slate-950/85 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold">DETECTION CORE</span>
                  <span>AGE: 22-26</span>
                  <span>CONF: 98.4%</span>
                </div>

                {/* Bottom right indicator */}
                <div className="absolute bottom-4 right-4 text-[9px] font-mono text-emerald-400 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-920">
                  PASS_ADULT_APPEARANCE
                </div>
              </div>

              {/* Status metrics bar */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 text-slate-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-[8px] text-slate-500 font-semibold uppercase">Geo Policy</span>
                    <span className="text-[10px] text-white">GDPR Compliant</span>
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 text-slate-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="block text-[8px] text-slate-500 font-semibold uppercase">Classification</span>
                    <span className="text-[10px] text-white">EPHEMERAL SAFE</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
