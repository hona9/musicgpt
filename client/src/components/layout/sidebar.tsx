"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 6.5L8 1.5L14 6.5V14H10V10H6V14H2V6.5Z"
        stroke={active ? "#f0f0f0" : "#666"}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreateIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5L9.5 5.5H13.5L10.5 8L11.5 12L8 9.5L4.5 12L5.5 8L2.5 5.5H6.5L8 1.5Z"
        stroke={active ? "#e8820c" : "#666"}
        fill={active ? "rgba(232,130,12,0.12)" : "none"}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#666" strokeWidth="1.4" />
      <path d="M8 5V8L10 10" stroke="#666" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="#666" strokeWidth="1.4" />
      <path d="M3 14C3 11.2386 5.23858 9 8 9C10.7614 9 13 11.2386 13 14" stroke="#666" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 13S2 9.5 2 5.5C2 3.567 3.567 2 5.5 2C6.6 2 7.6 2.55 8 3.4C8.4 2.55 9.4 2 10.5 2C12.433 2 14 3.567 14 5.5C14 9.5 8 13 8 13Z" stroke="#666" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#666" strokeWidth="1.4" />
      <path d="M8 5V11M5 8H11" stroke="#666" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Nav Item ────────────────────────────────────────────────────────────────

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function NavItem({ href, label, icon, activeIcon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-150",
        isActive
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      {isActive ? activeIcon : icon}
      {label}
    </Link>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside
      className="flex h-full w-[200px] shrink-0 flex-col border-r py-4"
      style={{ borderColor: "#1f1f1f", background: "#0c0c0c" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <div
          className="flex size-7 items-center justify-center rounded-full"
          style={{ background: "conic-gradient(#f59e0b, #e8820c, #f59e0b)" }}
        >
          <div
            className="flex size-[22px] items-center justify-center rounded-full"
            style={{ background: "#0c0c0c" }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="2.5" fill="#e8820c" />
              <circle cx="5.5" cy="5.5" r="1" fill="#0c0c0c" />
            </svg>
          </div>
        </div>
        <span className="text-[15px] font-bold tracking-tight">MusicGPT</span>
        <span
          className="ml-0.5 rounded px-1 py-px text-[9px] font-semibold tracking-wider"
          style={{ background: "rgba(232,130,12,0.15)", color: "#e8820c" }}
        >
          BETA
        </span>
      </div>

      {/* Search */}
      <div className="px-2.5 pb-4">
        <button
          className="flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors hover:border-border"
          style={{ background: "#141414", borderColor: "#2a2a2a", color: "#4a4a4a" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="#555" strokeWidth="1.5" />
            <path d="M9 9L11.5 11.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-left">Search</span>
          <span
            className="rounded px-1 py-px text-[10px]"
            style={{ background: "#1c1c1c" }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        <NavItem
          href="/"
          label="Home"
          icon={<HomeIcon />}
          activeIcon={<HomeIcon active />}
        />
        <NavItem
          href="/create"
          label="Create"
          icon={<CreateIcon />}
          activeIcon={<CreateIcon active />}
        />
        <NavItem
          href="/explore"
          label="Explore"
          icon={<ExploreIcon />}
          activeIcon={<ExploreIcon />}
        />
      </nav>

      {/* Library */}
      <div className="px-4 pb-1.5 pt-4">
        <span
          className="text-[11px] font-medium tracking-wide"
          style={{ color: "#4a4a4a" }}
        >
          Library
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        {[
          { label: "Profile", icon: <ProfileIcon /> },
          { label: "Liked", icon: <HeartIcon /> },
          { label: "New playlist", icon: <PlusCircleIcon /> },
        ].map(({ label, icon }) => (
          <button
            key={label}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-all duration-150 hover:text-foreground hover:bg-muted/50"
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Pro promo card */}
      <div
        className="mx-2.5 mb-3 rounded-xl border p-3"
        style={{
          background: "linear-gradient(135deg, #2d1b6b, #1a0f3e)",
          borderColor: "#3d2a7a",
        }}
      >
        <p className="mb-1 text-[12px] font-bold" style={{ color: "#c4b5fd" }}>
          Model v8 Pro is here!
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: "#8b7aaa" }}>
          Pushing boundaries to the world&apos;s best AI music model
        </p>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 px-4">
        {["Pricing", "Affiliate", "API", "About", "Terms", "Privacy"].map((l) => (
          <span
            key={l}
            className="cursor-pointer text-[10px] hover:text-muted-foreground"
            style={{ color: "#4a4a4a" }}
          >
            {l}
          </span>
        ))}
        <span className="text-[10px]" style={{ color: "#4a4a4a" }}>
          🌐 EN ▾
        </span>
      </div>
    </aside>
  );
}
