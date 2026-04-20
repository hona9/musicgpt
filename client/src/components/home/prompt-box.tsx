"use client";

import { useRef, useEffect } from "react";

interface PromptBoxProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function PromptBox({ value, onChange, onSubmit, isLoading }: PromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  const hasText = value.trim().length > 0;

  return (
    <div className="w-full max-w-[560px]">
      {/* Animated border box */}
      <div className="glow-box">
        <div className="glow-layer glow-layer-static" />
        <div className="glow-layer-bloom" />
        <div className="glow-box-inner">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your song"
            rows={2}
            className="w-full resize-none bg-transparent px-[18px] pb-1 pt-4 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-[#4a4a4a]"
            style={{ minHeight: 80 }}
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 px-3.5 pb-3 pt-2">
            {/* Attach */}
            <ToolbarIconButton title="Attach">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M14 8.5L7.5 15C5.567 16.933 2.5 16.933 0.567 15C-1.366 13.067-1.366 10 0.567 8.067L8 0.633C9.266-.633 11.333-.633 12.6.633 13.866 1.9 13.866 3.967 12.6 5.233L5.5 12.333C4.9 12.933 3.934 12.933 3.334 12.333 2.734 11.733 2.734 10.767 3.334 10.167L9.5 4" stroke="#666" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </ToolbarIconButton>

            {/* Tune */}
            <ToolbarIconButton title="Tune">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h2M2 8h8M2 12h4M6 2v4M12 6v8M8 10v4" stroke="#666" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </ToolbarIconButton>

            {/* Waveform */}
            <ToolbarIconButton title="Audio style">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M1 8H3M3 5V11M5 3V13M7 6V10M9 4V12M11 5V11M13 7V9M13 7H15" stroke="#666" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ToolbarIconButton>

            {/* Lyrics pill */}
            <button
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              style={{ background: "#1c1c1c", borderColor: "#2a2a2a" }}
            >
              <span className="text-[11px]">+</span> Lyrics
            </button>

            <div className="flex-1" />

            {/* Tools */}
            <button
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              style={{ borderColor: "#2a2a2a" }}
            >
              Tools
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Send */}
            <button
              onClick={onSubmit}
              disabled={!hasText || isLoading}
              className="flex size-[30px] items-center justify-center rounded-full transition-all duration-200 disabled:cursor-default"
              style={{
                background: hasText ? "#e8820c" : "#1c1c1c",
                boxShadow: hasText ? "0 0 12px rgba(232,130,12,0.4)" : "none",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 11V2M2 6.5L6.5 2L11 6.5"
                  stroke={hasText ? "white" : "#444"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="mt-3.5 text-center text-[12px]" style={{ color: "#4a4a4a" }}>
        MusicGPT v8 Pro · Our latest AI audio model ·{" "}
        <span
          className="cursor-pointer underline"
          style={{ color: "#7a7a7a" }}
        >
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
      className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
    >
      {children}
    </button>
  );
}
