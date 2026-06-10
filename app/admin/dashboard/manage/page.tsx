"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Sparkles, Search, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  image_url?: string;
  is_trending: boolean;
  created_at: string;
  category_id?: string;
  categories?: { name: string };
}

const CATEGORIES = [
  { label: "👦 Boys", value: "Boys", slug: "boys", id: "3d6eba72-e92c-4e05-a256-5272f56d4d4c" },
  { label: "👧 Girls", value: "Girls", slug: "girls", id: "1151466f-9ae6-4c02-bf6d-ec73388bedd0" },
  { label: "🎌 Anime", value: "Anime", slug: "anime", id: "55e9bba9-2707-4ca1-89bb-4a29ad54e5ab" },
  { label: "🧸 Chibi", value: "Chibi", slug: "chibi", id: "5e81431f-39df-4870-8732-3d9f715cef52" },
  { label: "🎮 Gaming", value: "Gaming", slug: "gaming", id: "824c3cd3-2ea7-45dd-a1ff-ae7d784e43da" },
  { label: "💼 Professional", value: "Professional", slug: "professional", id: "035e9808-1101-4fcc-a737-b0f42e21e63b" },
  { label: "👶 Kids", value: "Kids", slug: "kids", id: "2d54b265-1599-4949-8c3f-b278c446cdac" },
  { label: "🎨 Cartoon", value: "Cartoon", slug: "cartoon", id: "afa7bf76-c4e0-4008-9ab2-e73ab00df041" },
  { label: "📸 Realistic", value: "Realistic", slug: "realistic", id: "21a6b9dc-5f77-4cc3-94f6-20bc74fc3eb5" },
];

export default function ManagePromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPromptText, setEditPromptText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
const [editTrending, setEditTrending] = useState(false);
const [saving, setSaving] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }

    const fetchPrompts = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("prompts")
        .select("id, title, prompt_text, image_url, is_trending, created_at, category_id, categories(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPrompts(data as unknown as Prompt[]);
      }
      setLoading(false);
    };

    fetchPrompts();
  }, [router]);

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    setDeleting(id);
    const supabase = createClient();

    if (imageUrl) {
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("prompt-images").remove([fileName]);
      }
    }

    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed!");
    } else {
      toast.success("Prompt deleted!");
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(null);
  };

  const handleEdit = (prompt: Prompt) => {
  setEditingId(prompt.id);
  setEditTitle(prompt.title);
  setEditPromptText(prompt.prompt_text);
  setEditCategoryId(prompt.category_id || "");
  setEditTrending(prompt.is_trending);
};

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    const supabase = createClient();
   const { error } = await supabase
  .from("prompts")
  .update({
    title: editTitle,
    prompt_text: editPromptText,
    category_id: editCategoryId,
    is_trending: editTrending,
  })
  .eq("id", id);

    if (error) {
      toast.error("Update failed!");
    } else {
      toast.success("Prompt updated!");
      setPrompts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const cat = CATEGORIES.find((c) => c.id === editCategoryId);
            return {
              ...p,
              title: editTitle,
              prompt_text: editPromptText,
              category_id: editCategoryId,
              categories: { name: cat?.value || p.categories?.name || "" },
            };
          }
          return p;
        })
      );
      setEditingId(null);
    }
    setSaving(false);
  };

  const handleImageReplace = async (id: string, oldImageUrl?: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const supabase = createClient();
      toast.loading("Replacing image...");

      if (oldImageUrl) {
        const fileName = oldImageUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("prompt-images").remove([fileName]);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("prompt-images")
        .upload(fileName, file);

      if (uploadError) {
        toast.dismiss();
        toast.error("Image upload failed!");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("prompt-images")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("prompts")
        .update({ image_url: urlData.publicUrl })
        .eq("id", id);

      if (updateError) {
        toast.dismiss();
        toast.error("Update failed!");
      } else {
        toast.dismiss();
        toast.success("Image replaced!");
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, image_url: urlData.publicUrl } : p
          )
        );
      }
    };
    input.click();
  };

  const filtered = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-bold">Manage Prompts</h1>
            </div>
            <span className="text-muted-foreground text-sm">
              ({prompts.length} total)
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  {prompt.image_url ? (
                    <Image
                      src={prompt.image_url}
                      alt={prompt.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {prompt.is_trending && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        🔥 Trending
                      </span>
                    </div>
                  )}

                  {prompt.categories?.name && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {prompt.categories.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1">
                  {editingId === prompt.id ? (
                    <div className="space-y-2 flex-1">
                      {/* Title */}
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-secondary rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 ring-primary"
                        placeholder="Title"
                      />
                      {/* Prompt Text */}
                      <textarea
                        value={editPromptText}
                        onChange={(e) => setEditPromptText(e.target.value)}
                        className="w-full bg-secondary rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 ring-primary resize-none h-20"
                        placeholder="Prompt text..."
                      />
                      {/* Category Select */}
                      <div className="flex flex-wrap gap-1">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setEditCategoryId(cat.id)}
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium transition-all border",
                              editCategoryId === cat.id
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-transparent border-border text-muted-foreground hover:border-violet-500"
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                      {/* Trending Toggle */}
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    id={`trending-${prompt.id}`}
    checked={editTrending}
    onChange={(e) => setEditTrending(e.target.checked)}
    className="w-3.5 h-3.5 accent-purple-600"
  />
  <label htmlFor={`trending-${prompt.id}`} className="text-xs text-muted-foreground">
    Mark as Trending 🔥
  </label>
</div>
                      {/* Save/Cancel */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(prompt.id)}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-secondary rounded-lg text-xs font-medium"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1 line-clamp-1">{prompt.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {prompt.prompt_text}
                      </p>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(prompt)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-border rounded-lg text-xs hover:border-primary hover:text-primary transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleImageReplace(prompt.id, prompt.image_url)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-border rounded-lg text-xs hover:border-blue-500 hover:text-blue-500 transition-all"
                        >
                          🖼️ Image
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id, prompt.image_url)}
                          disabled={deleting === prompt.id}
                          className="flex items-center justify-center p-1.5 border border-border rounded-lg text-xs hover:border-red-500 hover:text-red-500 transition-all"
                        >
                          {deleting === prompt.id ? (
                            <div className="w-3 h-3 border border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-4 text-center py-20 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No prompts found!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}