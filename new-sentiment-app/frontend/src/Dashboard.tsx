import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Search, Zap, Globe, Hash, Clock, BookOpen } from "lucide-react";
import SentimentGauge from "./components/SentimentGauge";
import SkeletonLoader from "./components/SkeletonLoader";

interface Result {
  title: string;
  score: number;
  label: string;
  subjectivity: number;
  word_count: number;
  top_keywords: string[];
  summary: string;
  processing_time_ms: number;
}

// Animated shimmer on the CTA button
function ShimmerButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const shimmerRef = useRef<HTMLSpanElement>(null);
  useAnimationFrame((t) => {
    if (shimmerRef.current) {
      const x = ((t / 20) % 200) - 100;
      shimmerRef.current.style.transform = `translateX(${x}%)`;
    }
  });
  return (
    <button onClick={onClick} disabled={loading}
      className="relative overflow-hidden px-6 py-3 rounded-xl font-semibold
                 text-white bg-gradient-to-r from-violet-600 to-indigo-600
                 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed
                 min-w-[120px] flex items-center justify-center gap-2">
      <span ref={shimmerRef}
        className="pointer-events-none absolute inset-0 w-1/2
                   bg-gradient-to-r from-transparent via-white/25 to-transparent
                   skew-x-12" />
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4"
            strokeDasharray="31.4" strokeDashoffset="10" />
        </svg>
      ) : (
        <><Zap size={16} /> Analyze</>
      )}
    </button>
  );
}

// Stat row inside the results card
function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-2
                 border-b border-white/5 last:border-0">
      <span className="flex items-center gap-2 text-white/50 text-sm">
        {icon} {label}
      </span>
      <span className="text-white/90 text-sm font-medium">{value}</span>
    </motion.div>
  );
}

export default function Dashboard() {
  const [url, setUrl]       = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Result | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Analysis failed");
      }
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white overflow-hidden relative">

      {/* Animated mesh gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full
                     bg-violet-700/30 blur-[96px]" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full
                     bg-indigo-700/25 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                           bg-violet-500/10 border border-violet-500/20
                           text-violet-300 text-xs font-medium mb-4">
            <Globe size={12} /> AI-powered news intelligence
          </span>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br
                         from-white to-white/50 bg-clip-text text-transparent">
            Nuance
          </h1>
          <p className="mt-3 text-white/40 text-lg">
            Paste any news article URL to decode its emotional tone.
          </p>
        </motion.div>

        {/* Input row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 items-center">
          <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
                          bg-white/5 border transition-all duration-300
                          ${focused
                            ? "border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
                            : "border-white/10 hover:border-white/20"}`}>
            <Search size={16} className="text-white/30 shrink-0" />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()}
              placeholder="https://example.com/news-article"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20
                         outline-none min-w-0" />
          </div>
          <ShimmerButton loading={loading} onClick={handleAnalyze} />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border
                         border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skeleton or Results */}
        <AnimatePresence mode="wait">
          {loading && <SkeletonLoader key="skeleton" />}

          {result && !loading && (
            <motion.div key="results"
              className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Gauge card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="flex flex-col items-center justify-center gap-4 p-6
                           rounded-2xl bg-white/[0.04] border border-white/10
                           backdrop-blur-sm">
                <SentimentGauge score={result.score} label={result.label} />
              </motion.div>

              {/* Stats card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.04] border border-white/10
                           backdrop-blur-sm">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
                  Article stats
                </p>
                <StatRow icon={<BookOpen size={14}/>}  label="Words"        value={result.word_count.toLocaleString()} />
                <StatRow icon={<Hash size={14}/>}       label="Subjectivity" value={`${(result.subjectivity * 100).toFixed(0)}%`} />
                <StatRow icon={<Clock size={14}/>}      label="Analyzed in"  value={`${result.processing_time_ms} ms`} />
              </motion.div>

              {/* Summary card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 p-6 rounded-2xl bg-white/[0.04]
                           border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                  Lead sentence
                </p>
                <p className="text-white/70 text-sm leading-relaxed italic">
                  "{result.summary}"
                </p>
              </motion.div>

              {/* Keywords card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 p-6 rounded-2xl bg-white/[0.04]
                           border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                  Top keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.top_keywords.map((kw, i) => (
                    <motion.span key={kw}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      className="px-3 py-1 rounded-full text-xs font-medium
                                 bg-violet-500/10 border border-violet-500/20
                                 text-violet-300">
                      #{kw}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}