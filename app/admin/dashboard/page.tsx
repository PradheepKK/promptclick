"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  ImagePlus,
  LogOut,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ChevronRight,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }

    const fetchStats = async () => {
      const supabase = createClient();

      const { count } = await supabase
        .from("prompts")
        .select("*", { count: "exact", head: true });
      setTotalPrompts(count || 0);

      const { data: viewData } = await supabase
        .from("prompts")
        .select("view_count");

      if (viewData) {
        const total = viewData.reduce(
          (sum: number, p: { view_count: number }) =>
            sum + (p.view_count || 0),
          0
        );
        setTotalViews(total);
      }
    };

    fetchStats();

    // const supabase = createClient();
    // const subscription = supabase
    //   .channel("prompts-views")
    //   .on(
    //     "postgres_changes",
    //     { event: "UPDATE", schema: "public", table: "prompts" },
    //     (payload) => {
    //       const newCount = payload.new.view_count || 0;
    //       const oldCount = payload.old.view_count || 0;
    //       if (newCount > oldCount) {
    //         setTotalViews((prev) => prev + (newCount - oldCount));
    //       }
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    document.cookie = "admin_auth=; path=/; max-age=0";
    router.push("/admin/login");
    toast.success("Logged out!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm">PromptClick</span>
                <span className="text-xs text-muted-foreground ml-2">Admin</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back! 👋</h1>
          <p className="text-muted-foreground text-sm">
            Manage your PromptClick content here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{totalPrompts}</p>
            <p className="text-sm text-muted-foreground">Prompts Published</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">9</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{totalViews}</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>
        </div>

        {/* Actions */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quick Actions
        </h2>

        <div className="space-y-3">
          <Link href="/admin/dashboard/upload">
            <div className="group bg-card border border-border hover:border-violet-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all hover:bg-violet-500/5 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 flex items-center justify-center transition-all flex-shrink-0">
                <Upload className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-0.5">Upload New Prompt</h3>
                <p className="text-sm text-muted-foreground">
                  Add trending prompts with images to your collection
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-500 transition-all group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/admin/dashboard/manage">
            <div className="group bg-card border border-border hover:border-blue-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all hover:bg-blue-500/5 cursor-pointer mt-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-all flex-shrink-0">
                <ImagePlus className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-0.5">Manage Prompts</h3>
                <p className="text-sm text-muted-foreground">
                  Edit, replace images or delete existing prompts
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}