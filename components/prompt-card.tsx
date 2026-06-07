"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  id: string;
  title: string;
  prompt_text: string;
  image_url?: string;
  category?: string;
  is_trending?: boolean;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onView?: () => void;
}

export default function PromptCard({
  id,
  title,
  prompt_text,
  image_url,
  category,
  is_trending = false,
  isSaved = false,
  onSave,
  onView,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt_text);
    setCopied(true);
    toast.success("Prompt copied!");
    onView?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(id);
    toast.success(saved ? "Removed from collection" : "Saved to collection!");
  };

  return (
    <div className="group relative bg-card rounded-2xl border border-border overflow-hidden card-hover flex flex-col">
      {image_url && (
        <div className="relative aspect-square overflow-hidden flex-shrink-0">
          <Image
            src={image_url}
            alt={title}
            fill
            quality={100}
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized
          />
          {category && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-black/50 backdrop-blur-sm text-white border-0 text-xs">
                {category}
              </Badge>
            </div>
          )}

          {is_trending && (
            <div className="absolute bottom-3 left-3">
              <span className="relative flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/40 border border-white/20">
                <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
                🔥
                <span className="tracking-wide">TRENDING</span>
              </span>
            </div>
          )}

          <button
            onClick={handleSave}
            className="absolute top-2 right-2 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={cn(
                "w-7 h-7 drop-shadow-lg transition-all",
                saved
                  ? "fill-primary stroke-primary"
                  : "fill-black/30 stroke-white stroke-2 hover:fill-white/40"
              )}
            >
              <path d="M5 3h14a1 1 0 0 1 1 1v17.27a0.5 0.5 0 0 1-.757.429L12 18.03l-7.243 3.669A0.5 0.5 0 0 1 4 21.27V4a1 1 0 0 1 1-1z" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <div className="px-4 py-2 border-b border-border/60">
          <p className="text-sm font-semibold text-primary">Prompt here 👇</p>
        </div>

        <div className="px-4 py-3 flex-1">
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-4 leading-relaxed">
            {prompt_text}
          </p>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleCopy}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all",
              copied
                ? "bg-primary/10 border-primary text-primary"
                : "bg-transparent border-border text-foreground hover:border-primary hover:text-primary"
            )}
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /> Copied!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}