"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import PromptCard from "@/components/prompt-card";
import { BookMarked, Sparkles } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  image_url?: string;
  category?: string;
  tags?: string[];
}

export default function CollectionPage() {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>(() => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("promptclick_collection");
  return stored ? (JSON.parse(stored) as Prompt[]) : [];
});

  const handleRemove = (id: string) => {
    const updated = savedPrompts.filter((p) => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem("promptclick_collection", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Collection</h1>
            <p className="text-muted-foreground text-sm">
              {savedPrompts.length} saved prompts
            </p>
          </div>
        </div>

        {/* Grid */}
        {savedPrompts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {savedPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                {...prompt}
                isSaved={true}
                onSave={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <h2 className="text-xl font-semibold mb-2">No saved prompts yet</h2>
            <p className="text-muted-foreground text-sm">
              Browse prompts and click the bookmark icon to save them here!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}