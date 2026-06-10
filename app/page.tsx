"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import PromptCard from "@/components/prompt-card";
import CategoryFilter from "@/components/category-filter";
import { createClient } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  image_url?: string;
  category?: string;
  is_trending?: boolean;
  tags?: string[];
}

interface SupabasePrompt {
  id: string;
  title: string;
  prompt_text: string;
  image_url?: string;
  tags?: string[];
  is_trending?: boolean;
  categories?: { name: string; slug: string };
}

const CATEGORY_MAP: { [key: string]: string } = {
  boys: "3d6eba72-e92c-4e05-a256-5272f56d4d4c",
  girls: "1151466f-9ae6-4c02-bf6d-ec73388bedd0",
  anime: "55e9bba9-2707-4ca1-89bb-4a29ad54e5ab",
  chibi: "5e81431f-39df-4870-8732-3d9f715cef52",
  gaming: "824c3cd3-2ea7-45dd-a1ff-ae7d784e43da",
  professional: "035e9808-1101-4fcc-a737-b0f42e21e63b",
  kids: "2d54b265-1599-4949-8c3f-b278c446cdac",
  cartoon: "afa7bf76-c4e0-4008-9ab2-e73ab00df041",
  realistic: "21a6b9dc-5f77-4cc3-94f6-20bc74fc3eb5",
};

export default function HomePage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("promptclick_collection");
    if (!stored) return [];
    return JSON.parse(stored).map((p: { id: string }) => p.id);
  });

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("prompts")
        .select(`
          id,
          title,
          prompt_text,
          image_url,
          tags,
          is_trending,
          categories (name, slug)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formatted = (data as unknown as SupabasePrompt[]).map((p) => ({
          id: p.id,
          title: p.title,
          prompt_text: p.prompt_text,
          image_url: p.image_url,
          tags: p.tags,
          is_trending: p.is_trending,
          category: p.categories?.name,
        }));
        setPrompts(formatted);
      }
      setLoading(false);
    };

    fetchPrompts();
  }, []);

  const handleSave = (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;

    const stored = localStorage.getItem("promptclick_collection");
    const collection = stored ? JSON.parse(stored) : [];
    const isAlreadySaved = collection.some((p: { id: string }) => p.id === id);

    const updated = isAlreadySaved
      ? collection.filter((p: { id: string }) => p.id !== id)
      : [...collection, prompt];

    localStorage.setItem("promptclick_collection", JSON.stringify(updated));
    setSavedIds(updated.map((p: { id: string }) => p.id));
  };

  const handleView = async (id: string) => {
    const key = `viewed_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const supabase = createClient();
    await supabase.rpc("increment_view", { prompt_id: id });
  };

  const handleCategoryChange = (cat: string) => {
    if (cat === "all") return;
    router.push(`/${cat}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Trending AI Prompts
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Discover & Copy
            <span className="gradient-text block">Trending Prompts</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Find the best AI image prompts trending on Instagram. Copy instantly, no login needed.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter active="all" onChange={handleCategoryChange} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                {...prompt}
                isSaved={savedIds.includes(prompt.id)}
                onSave={handleSave}
                onView={() => handleView(prompt.id)}
              />
            ))}
          </div>
        )}

        {!loading && prompts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No prompts found!</p>
          </div>
        )}
      </main>
    </div>
  );
}