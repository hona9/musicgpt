"use client";

import { useState, useRef } from "react";

// Static waveform data for visual representation
const WAVEFORM = [0.4,0.7,0.5,0.9,0.6,0.8,0.4,0.7,0.5,0.6,0.9,0.4,0.8,0.6,0.7,0.5,0.4,0.9,0.6,0.7,0.5,0.8,0.4,0.6,0.9,0.5,0.7,0.4,0.8,0.6];
const ALBUM_GRADIENT = "linear-gradient(135deg, #0f1a2e, #1a2a4a)";

interface CompletedTrack {
  promptId: string;
  jobId: string;
  audioUrl: string | null;
  promptText: string;
}

interface CompleteViewProps {
  track: CompletedTrack;
  onNewPrompt: () => void;
}

export function CompleteView({ track, onNewPrompt }: CompleteViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }

  // Derive a title from the prompt text
  const title = track.promptText.length > 40
    ? track.promptText.slice(0, 40) + "…"
    : track.promptText;

  return (
    <div
      className="flex-1 overflow-y-auto px-10 py-5 animate-fade-up"
    >
      <div className="mx-auto max-w-[680px]">
        {/* Header */}
        <div className="mb-[18px] flex items-start justify-between">
          <div>
            <p
              className="mb-1 text-[10px] font-medium tracking-[0.07em]"
              style={{ color: "#4ade80" }}
            >
              ✓ COMPLETE · 1 TRACK
            </p>
            <h2
              className="text-[20px] font-bold tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              &ldquo;{track.promptText || "Your generated track"}&rdquo;
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={onNewPrompt}
              className="rounded-lg border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              style={{ background: "#141414", borderColor: "#2a2a2a" }}
            >
              New Prompt
            </button>
            {track.audioUrl && (
              <a
                href={track.audioUrl}
                download
                className="rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "#e8820c",
                  boxShadow: "0 4px 14px rgba(232,130,12,0.3)",
                }}
              >
                Download
              </a>
            )}
          </div>
        </div>

        {/* Track Card */}
        <div
          className="cursor-pointer rounded-xl border p-4 transition-all duration-200"
          style={{
            background: isPlaying ? "#1a1510" : "#141414",
            borderColor: isPlaying ? "#3a2a10" : "#1f1f1f",
            animation: "card-in 0.4s ease both",
          }}
          onClick={togglePlay}
        >
          <div className="flex items-center gap-3">
            {/* Album art */}
            <div
              className="relative size-[52px] shrink-0 overflow-hidden rounded-[9px]"
              style={{ background: ALBUM_GRADIENT }}
            >
              <div
                className="absolute inset-0 rounded-[9px]"
                style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4))" }}
              />
            </div>

            {/* Play button */}
            <button
              className="flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200"
              style={{
                background: isPlaying ? "#e8820c" : "#1c1c1c",
                borderColor: isPlaying ? "transparent" : "#2a2a2a",
              }}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="1.5" width="3.5" height="9" rx="1.5" fill="white" />
                  <rect x="7" y="1.5" width="3.5" height="9" rx="1.5" fill="white" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 2L10 6L2.5 10V2Z" fill="#aaa" />
                </svg>
              )}
            </button>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[14px] font-semibold truncate">{title}</span>
                <span
                  className="shrink-0 rounded px-1.5 py-px text-[10px]"
                  style={{ background: "#1c1c1c", color: "#4a4a4a" }}
                >
                  AI generated
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="rounded px-1.5 py-px text-[10px]"
                  style={{ color: "#e8820c", background: "rgba(232,130,12,0.1)" }}
                >
                  AI Music
                </span>
                <span
                  className="rounded px-1.5 py-px text-[10px]"
                  style={{ background: "#1c1c1c", color: "#4a4a4a" }}
                >
                  Original
                </span>
              </div>
            </div>

            {/* Waveform */}
            <div className="shrink-0">
              <svg width="100" height="24" viewBox="0 0 120 24">
                {WAVEFORM.map((v, i) => {
                  const h = v * 20;
                  return (
                    <rect
                      key={i}
                      x={i * 4}
                      y={(24 - h) / 2}
                      width={2.5}
                      height={h}
                      rx={1}
                      fill={isPlaying ? "#e8820c" : "#3a3a3a"}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Action row */}
          <div
            className="mt-3 flex gap-1.5"
            style={{ paddingLeft: 100 }}
            onClick={(e) => e.stopPropagation()}
          >
            {track.audioUrl && (
              <a
                href={track.audioUrl}
                download
                className="rounded-lg border px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-border hover:text-foreground"
                style={{ background: "#1c1c1c", borderColor: "#1f1f1f" }}
              >
                ↓ Download
              </a>
            )}
            <button
              className="rounded-lg border px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-border hover:text-foreground"
              style={{ background: "#1c1c1c", borderColor: "#1f1f1f" }}
            >
              ⟳ Remix
            </button>
            <button
              className="rounded-lg border px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-border hover:text-foreground"
              style={{ background: "#1c1c1c", borderColor: "#1f1f1f" }}
            >
              ↗ Share
            </button>
          </div>
        </div>

        {/* Hidden audio element */}
        {track.audioUrl && (
          <audio
            ref={audioRef}
            src={track.audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        <div className="h-5" />
      </div>
    </div>
  );
}
