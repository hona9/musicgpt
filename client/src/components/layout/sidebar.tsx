"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Nav Item ────────────────────────────────────────────────────────────────

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
}

function NavItem({ href, label, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 text-[13px] transition-all duration-150",
        isActive
          ? "rounded-[30px] h-[37px] px-4 py-[3px] bg-muted font-medium"
          : "rounded-[30px] h-[37px] px-4 py-[3px] hover:bg-muted/50",
      )}
    >
      <Image src={icon} width={16} height={16} alt={label} />
      {label}
    </Link>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
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
      <div className="flex items-center px-4 pb-5 pt-4">
        <Image src="/Logo.svg" width={119} height={32} alt="MusicGPT" />
      </div>

      {/* Search */}
      <div className="px-2.5 pb-4">
        <button
          className="flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors hover:border-border"
          style={{
            background: "#141414",
            borderColor: "#2a2a2a",
            color: "#FFF",
          }}
        >
          <Image
            src="/icons/search-md.svg"
            width={13}
            height={13}
            alt="Search"
          />
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
      <nav className="flex flex-col gap-0.5">
        <NavItem href="/" label="Home" icon="/icons/home.svg" />
        <NavItem href="/create" label="Create" icon="/icons/stars-01.svg" />
        <NavItem
          href="/explore"
          label="Explore"
          icon="/icons/compass-03 1.svg"
        />
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
        {["Pricing", "Affiliate", "API", "About", "Terms", "Privacy"].map(
          (l) => (
            <span
              key={l}
              className="cursor-pointer text-[10px] hover:text-muted-foreground"
              style={{ color: "#4a4a4a" }}
            >
              {l}
            </span>
          ),
        )}
        <span
          className="flex items-center gap-1 text-[10px]"
          style={{ color: "#4a4a4a" }}
        >
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
