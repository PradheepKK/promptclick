"use client";

import { cn } from "@/lib/utils";

const categories = [
  { label: "✨ All", value: "all" },
  { label: "👦 Boys", value: "boys" },
  { label: "👧 Girls", value: "girls" },
  { label: "🎌 Anime", value: "anime" },
  { label: "🧸 Chibi", value: "chibi" },
  { label: "🎮 Gaming", value: "gaming" },
  { label: "💼 Professional", value: "professional" },
  { label: "👶 Kids", value: "kids" },
  { label: "🎨 Cartoon", value: "cartoon" },
  { label: "📸 Realistic", value: "realistic" },
];

interface CategoryFilterProps {
  active: string;
  onChange: (value: string) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      {/* Top fade */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-2 py-4">
        {categories.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
  "flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
  active === value
    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/60"
)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}