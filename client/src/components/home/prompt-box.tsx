"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const PLACEHOLDERS = [
  "Describe your song...",
  "A rainy afternoon jazz trio with brushed drums...",
  "Epic orchestral battle music with choir...",
  "Lo-fi hip hop beats for late night studying...",
  "Upbeat summer pop with synth and guitar...",
  "Dark electronic ambient with pulsing bass...",
  "Acoustic folk ballad about leaving home...",
  "Funky disco groove with wah guitar and strings...",
  "Cinematic trailer music with rising tension...",
  "Mellow bossa nova for a Sunday morning...",
];

interface PromptBoxProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function PromptBox({
  value,
  onChange,
  onSubmit,
  isLoading,
}: PromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => {
        setPrevIdx(i);
        return (i + 1) % PLACEHOLDERS.length;
      });
      setTimeout(() => setPrevIdx(null), 450);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  const hasText = value.trim().length > 0;

  return (
    <div className="w-[800px] h-[170px]">
      {/* Animated border box */}
      <div className="glow-box">
        <div className="glow-layer glow-layer-static" />
        <div className="glow-layer-bloom" />
        <div className="glow-box-inner flex flex-col gap-[10px] px-5 pb-4 pt-5">
          {/* Textarea + cycling placeholder */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-full w-full resize-none bg-transparent text-[14px] leading-relaxed text-foreground outline-none placeholder:text-transparent"
            />
            {!hasText && (
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden text-[14px] leading-relaxed"
                style={{ color: "#4a4a4a" }}
              >
                {prevIdx !== null && (
                  <span
                    key={`out-${prevIdx}`}
                    className="absolute inset-0 animate-placeholder-out"
                  >
                    {PLACEHOLDERS[prevIdx]}
                  </span>
                )}
                <span
                  key={`in-${idx}`}
                  className={
                    prevIdx !== null
                      ? "absolute inset-0 animate-placeholder-in"
                      : "absolute inset-0"
                  }
                >
                  {PLACEHOLDERS[idx]}
                </span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-[6px]">
            {/* Attach */}
            <ToolbarIconButton title="Attach">
              <Image
                src="/icons/attach-file.svg"
                width={16}
                height={16}
                alt="Attach"
              />
            </ToolbarIconButton>

            {/* Tune */}
            <ToolbarIconButton title="Tune">
              <Image
                src="/icons/controls.svg"
                width={16}
                height={16}
                alt="Tune"
              />
            </ToolbarIconButton>

            {/* Waveform */}
            <ToolbarIconButton title="Audio style">
              <Image
                src="/icons/instrumental wave.svg"
                width={16}
                height={16}
                alt="Audio style"
              />
            </ToolbarIconButton>

            {/* Lyrics pill */}
            <button
              className="flex h-[40px] items-center gap-[6px] rounded-[100px] border px-4 text-muted-foreground transition-colors hover:text-foreground"
              style={{
                borderColor: "#303438",
                fontSize: 14,
                fontWeight: 600,
                lineHeight: "160%",
                letterSpacing: "0.01em",
                textAlign: "center",
                color: "#fff",
              }}
            >
              <span className="leading-none">+</span> Lyrics
            </button>

            <div className="flex-1" />

            {/* Tools */}
            <button
              className="flex h-[40px] items-center gap-[6px] rounded-[100px] border px-4 text-muted-foreground transition-colors hover:text-foreground"
              style={{
                borderColor: "#303438",
                fontSize: 14,
                fontWeight: 600,
                lineHeight: "160%",
                letterSpacing: "0.01em",
                textAlign: "center",
                color: "#fff",
              }}
            >
              Tools
              <Image src="/icons/chevron.svg" width={10} height={10} alt="" />
            </button>

            {/* Send */}
            <button
              onClick={onSubmit}
              disabled={!hasText || isLoading}
              className="flex size-[40px] items-center justify-center rounded-full transition-all duration-200 disabled:cursor-default"
              style={{
                background: hasText ? "#FFF" : "#44484C",
                border: "1px solid #303438",
                boxShadow: hasText ? "0 0 12px rgba(232,130,12,0.4)" : "none",
              }}
            >
              <Image
                src="/icons/arrow-up.svg"
                width={20}
                height={20}
                alt="Send"
                style={{
                  opacity: 1,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p
        className="mt-3.5 text-center text-[12px]"
        style={{ color: "#4a4a4a" }}
      >
        MusicGPT v8 Pro · Our latest AI audio model ·{" "}
        <span className="cursor-pointer underline" style={{ color: "#7a7a7a" }}>
          Example prompts
        </span>
      </p>
    </div>
  );
}

function ToolbarIconButton({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      title={title}
      className="flex size-[40px] shrink-0 items-center justify-center rounded-[100px] transition-colors hover:bg-muted/50"
      style={{ border: "1px solid #303438" }}
    >
      {children}
    </button>
  );
}
