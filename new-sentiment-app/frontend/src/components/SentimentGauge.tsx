import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  score: number; // -1 to +1
  label: string;
}

const COLORS = {
  Positive: "#22c55e",
  Neutral:  "#f59e0b",
  Negative: "#ef4444",
};

export default function SentimentGauge({ score, label }: Props) {
  const progress = useMotionValue(0);
  const pct = useTransform(progress, [-1, 1], [0, 100]);

  useEffect(() => {
    const controls = animate(progress, score, { duration: 1.6, ease: "easeOut" });
    return controls.stop;
  }, [score]);

  const color = COLORS[label as keyof typeof COLORS] ?? "#6b7280";
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="70" cy="70" r={radius}
            fill="none" stroke="rgba(255,255,255,0.08)"
            strokeWidth="10" strokeLinecap="round" />
          {/* Animated arc */}
          <motion.circle cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: useTransform(pct,
                [0, 100],
                [circumference, 0]
              )
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-3xl font-bold text-white"
            style={{ color }}>
            {useTransform(progress, (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)}`)}
          </motion.span>
          <span className="text-xs text-white/50 mt-1">sentiment</span>
        </div>
      </div>
      <span className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: `${color}22`, color }}>
        {label}
      </span>
    </div>
  );
}