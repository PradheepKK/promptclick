"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Download, X, ImagePlus, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUploadedImage(result);
      setUploadedImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt!");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageBase64: uploadedImageBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedImage(data.imageUrl);
      toast.success("Image generated!");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.target = "_blank";
    link.download = `promptclick-${Date.now()}.png`;
    link.click();
    toast.success("Image downloading!");
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Wand2 className="w-4 h-4" />
            Unlimited Free Generation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Generate
            <span className="gradient-text"> AI Images</span>
          </h1>
          <p className="text-muted-foreground">
            Enter a prompt and generate for free! No signup required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left - Input */}
          <div className="space-y-4">
            {/* Prompt Input */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <label className="text-sm font-medium mb-2 block">Your Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A beautiful anime girl with silver hair, magical forest background, detailed illustration, 8k..."
                className="w-full h-32 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">{prompt.length} chars</span>
                {prompt && (
                  <button
                    onClick={() => setPrompt("")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <label className="text-sm font-medium mb-2 block">
                Reference Image{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>

              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="uploaded"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    onClick={removeUploadedImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-xl h-12 text-base gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* Right - Output */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col">
            <label className="text-sm font-medium mb-3 block">Generated Image</label>

            {generatedImage ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="relative flex-1 min-h-64 rounded-xl overflow-hidden">
                  <img
                    src={generatedImage}
                    alt="generated"
                    className="w-full h-full object-contain"
                    onError={() => toast.error("Image load failed!")}
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full rounded-xl gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="flex-1 min-h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Creating your image...</p>
                    <p className="text-xs text-muted-foreground">This may take 10-30 seconds</p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Your image will appear here</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}