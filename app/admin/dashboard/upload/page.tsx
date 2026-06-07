"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "👦 Boys", value: "Boys", slug: "boys" },
  { label: "👧 Girls", value: "Girls", slug: "girls" },
  { label: "🎌 Anime", value: "Anime", slug: "anime" },
  { label: "🧸 Chibi", value: "Chibi", slug: "chibi" },
  { label: "🎮 Gaming", value: "Gaming", slug: "gaming" },
  { label: "💼 Professional", value: "Professional", slug: "professional" },
  { label: "👶 Kids", value: "Kids", slug: "kids" },
  { label: "🎨 Cartoon", value: "Cartoon", slug: "cartoon" },
  { label: "📸 Realistic", value: "Realistic", slug: "realistic" },
];

export default function UploadPromptPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    prompt_text: "",
    category: "Boys",
    categorySlug: "boys",
    tags: "",
    is_trending: true,
  });

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) router.push("/admin/login");
  }, [router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.prompt_text || !imageFile) {
      toast.error("Please fill all fields and upload an image!");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("prompt-images")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("prompt-images")
        .getPublicUrl(fileName);

      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", form.categorySlug)
        .single();

      const { error: insertError } = await supabase.from("prompts").insert({
        title: form.title,
        prompt_text: form.prompt_text,
        image_url: urlData.publicUrl,
        category_id: categoryData?.id,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_trending: form.is_trending,
      });

      if (insertError) throw insertError;

      toast.success("Prompt uploaded successfully!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="font-bold">Upload Prompt</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left - Form */}
          <div className="space-y-4">

            {/* Title */}
            <div className="space-y-2">
              <Label>
                Title{" "}
                <span className="text-xs text-muted-foreground">
                  (SEO only - not shown to users)
                </span>
              </Label>
              <Input
                placeholder="Cyberpunk Girl"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Prompt Text */}
            <div className="space-y-2">
              <Label>Prompt Text</Label>
              <textarea
                placeholder="A stunning cyberpunk girl with neon lights..."
                value={form.prompt_text}
                onChange={(e) =>
                  setForm({ ...form, prompt_text: e.target.value })
                }
                className="w-full h-32 bg-card border border-border rounded-xl p-3 text-sm resize-none outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() =>
                      setForm({
                        ...form,
                        category: cat.value,
                        categorySlug: cat.slug,
                      })
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      form.category === cat.value
                        ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/30 scale-105"
                        : "bg-transparent border-border/60 text-muted-foreground hover:border-violet-500/60 hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>
                Tags{" "}
                <span className="text-xs text-muted-foreground">
                  (SEO only - comma separated)
                </span>
              </Label>
              <Input
                placeholder="anime, cyberpunk, neon"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Trending */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="trending"
                checked={form.is_trending}
                onChange={(e) =>
                  setForm({ ...form, is_trending: e.target.checked })
                }
                className="w-4 h-4 accent-purple-600"
              />
              <Label htmlFor="trending">Mark as Trending</Label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl"
            >
              {loading ? "Uploading..." : "Upload Prompt"}
            </Button>
          </div>

          {/* Right - Image Upload */}
          <div className="space-y-4">
            <Label>Prompt Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full aspect-square object-cover rounded-2xl"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="w-10 h-10 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>
      </main>
    </div>
  );
}