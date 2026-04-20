"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  "Analyzing prompt...",
  "Composing melody...",
  "Layering instruments...",
  "Mixing & mastering...",
  "Finalizing tracks...",
];

interface GeneratingViewProps {
  prompt: string;
  progress: number;
}

export function GeneratingView({ prompt, progress }: GeneratingViewProps) {
  const stepIndex = Math.min(
    Math.floor((progress / 100) * STEPS.length),
    STEPS.length - 1,
  );
  const step = STEPS[stepIndex];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10 animate-fade-up">
      {/* Pulsating bars */}
      <PulsatingBars />

      <div className="mt-6 text-center">
        {/* Status label */}
        <p
          className="mb-2 text-[11px] font-medium tracking-[0.08em]"
          style={{
            color: "#e8820c",
            animation: "pulse-opacity 1.5s ease-in-out infinite",
          }}
        >
          ● GENERATING
        </p>

        <h2
          className="mb-1.5 text-[22px] font-bold tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Creating your tracks
        </h2>

        <p className="mb-6 text-[13px] text-muted-foreground">{step}</p>

        {/* Prompt chip */}
        <div
          className="mb-6 inline-block max-w-[480px] rounded-[10px] border px-4 py-2"
          style={{ background: "#141414", borderColor: "#2a2a2a" }}
        >
          <span className="text-[13px] italic text-muted-foreground">
            &ldquo;{prompt || "Dark ambient with pulsing synths"}&rdquo;
          </span>
        </div>

        {/* Progress bar */}
        <div className="mx-auto w-[400px] max-w-full">
          <div
            className="h-[3px] overflow-hidden rounded-sm"
            style={{ background: "#1c1c1c" }}
          >
            <div
              className="h-full rounded-sm transition-[width] duration-75 ease-linear"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #e8820c, #f59e0b)",
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-[11px]" style={{ color: "#4a4a4a" }}>
              1 track · ~30s
            </span>
            <span className="text-[11px]" style={{ color: "#4a4a4a" }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PulsatingBars({ count = 40 }: { count?: number }) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 64 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: "linear-gradient(to top, #e8820c, #f59e0b)",
            transformOrigin: "bottom",
            height: 12 + Math.sin(i * 0.5) * 28 + 16,
            animation: `bar-bounce ${0.7 + Math.sin(i * 0.4) * 0.4}s ease-in-out ${(i * 0.05) % 1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
