"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Nav Item ────────────────────────────────────────────────────────────────

interface NavItemProps {
  href?: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

function NavItem({ href, label, icon, disabled }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href ? pathname === href : false;

  const className = cn(
    "flex items-center gap-2 text-[13px] transition-all duration-150",
    isActive
      ? "rounded-[30px] h-[37px] px-4 py-[3px] bg-muted font-medium"
      : "rounded-[30px] h-[37px] px-4 py-[3px] hover:bg-muted/50",
  );

  if (disabled || !href) {
    return (
      <span className={className} style={{ color: "#fff" }}>
        <Image src={icon} width={16} height={16} alt={label} />
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      <Image src={icon} width={16} height={16} alt={label} />
      {label}
    </Link>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data, isFetching } = useSearch(debouncedQuery);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = data?.pages[0]?.items ?? [];
  const users = items.filter((i) => i.type === "user");
  const tracks = items.filter((i) => i.type === "audio");
  const hasResults = users.length > 0 || tracks.length > 0;
  const showDropdown = open && debouncedQuery.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative px-2.5 pb-4">
      <div
        className="flex w-full items-center gap-2 overflow-hidden rounded-full border px-3 py-1.5 text-[12px] transition-colors"
        style={{
          background: "#141414",
          borderColor: open ? "#3a3a3a" : "#2a2a2a",
        }}
      >
        <Image src="/icons/search-md.svg" width={13} height={13} alt="Search" className="shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-[rgba(255,255,255,0.3)]"
        />
        {query ? (
          <button onClick={() => setQuery("")} className="text-[rgba(255,255,255,0.4)] hover:text-white">
            ×
          </button>
        ) : (
          <span
            className="shrink-0 rounded px-1 py-px text-[10px]"
            style={{ background: "#1c1c1c", color: "rgba(255,255,255,0.3)" }}
          >
            ⌘K
          </span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-2.5 right-2.5 top-[calc(100%-8px)] z-50 overflow-hidden rounded-[12px] border py-1.5 shadow-xl"
          style={{ background: "rgba(22,25,28,1)", borderColor: "rgba(48,52,56,1)" }}
        >
          {isFetching && !hasResults && (
            <p className="px-3 py-2 text-[11px]" style={{ color: "rgba(93,97,101,1)" }}>
              Searching…
            </p>
          )}

          {!isFetching && !hasResults && (
            <p className="px-3 py-2 text-[11px]" style={{ color: "rgba(93,97,101,1)" }}>
              No results for &quot;{debouncedQuery}&quot;
            </p>
          )}

          {/* Users */}
          {users.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(93,97,101,1)" }}>
                Users
              </p>
              {users.map((u) => (
                <button
                  key={u.id}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <div
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(180deg, rgba(199,0,255,1), rgba(255,44,155,1))" }}
                  >
                    {u.display[0]?.toUpperCase()}
                  </div>
                  <span className="truncate text-[12px]" style={{ color: "rgba(228,230,232,1)" }}>
                    {u.display.split("@")[0]}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(93,97,101,1)" }}>
                Tracks
              </p>
              {tracks.map((t) => (
                <button
                  key={t.id}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <div
                    className="size-6 shrink-0 rounded-[6px]"
                    style={{ background: "linear-gradient(135deg, #1a1a3e, #3a1a5c)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium" style={{ color: "rgba(228,230,232,1)" }}>
                      {t.display.length > 28 ? t.display.slice(0, 28) + "…" : t.display}
                    </p>
                    {t.promptText && t.promptText !== t.display && (
                      <p className="truncate text-[11px]" style={{ color: "rgba(93,97,101,1)" }}>
                        {t.promptText.length > 32 ? t.promptText.slice(0, 32) + "…" : t.promptText}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside
      className="flex h-full w-[200px] shrink-0 flex-col border-r py-4"
      style={{
        borderColor: "#1f1f1f",
        background: "rgba(255,255,255,0.03)",
        color: "#fff",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pb-5 pt-4">
        <Image src="/Logo.svg" width={119} height={32} alt="MusicGPT" />
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <SearchBar />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        <NavItem disabled label="Home" icon="/icons/home.svg" />
        <NavItem href="/" label="Create" icon="/icons/stars-01.svg" />
        <NavItem href="/explore" label="Explore" icon="/icons/compass-03 1.svg" />
      </nav>

      {/* Library */}
      <div className="px-4 pb-1.5 pt-4">
        <span
          className="text-[11px] font-medium tracking-wide"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Library
        </span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {[
          { label: "Profile", icon: "/icons/profile.svg" },
          { label: "Liked", icon: "/icons/heart.svg" },
          { label: "New playlist", icon: "/icons/add.svg" },
        ].map(({ label, icon }) => (
          <button
            key={label}
            className="flex w-full items-center gap-2 rounded-[30px] h-[37px] px-4 py-[3px] text-[13px] transition-all duration-150 hover:bg-muted/50"
            style={{ color: "#fff" }}
          >
            <Image src={icon} width={16} height={16} alt={label} />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Pro promo card */}
      <div
        className="mx-2.5 mb-3 rounded-[12px] px-3 py-2.5"
        style={{
          background:
            "linear-gradient(233.67deg, rgba(48,7,255,0.29) 0%, rgba(209,40,150,0.27) 50%, rgba(255,86,35,0.25) 100%), linear-gradient(0deg, #1D2125, #1D2125)",
        }}
      >
        <p className="mb-1 text-[12px] font-bold" style={{ color: "#FFF" }}>
          Model v6 Pro is here!
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: "#FFF" }}>
          Pushing boundaries to the world&apos;s best AI music model
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex flex-wrap items-center px-4"
        style={{ minHeight: 40, columnGap: 8, rowGap: 4 }}
      >
        {["Pricing", "Affiliate", "API", "About", "Terms", "Privacy"].map((l) => (
          <span
            key={l}
            className="cursor-pointer text-[10px] hover:text-muted-foreground"
            style={{ color: "#4a4a4a" }}
          >
            {l}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#4a4a4a" }}>
          <Image
            src="/icons/UM - United States Minor Outlying Islands.svg"
            width={12}
            height={12}
            alt="EN"
          />
          EN ▾
        </span>
      </div>
    </aside>
  );
}
