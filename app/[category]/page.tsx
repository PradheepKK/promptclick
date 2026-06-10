import { Metadata } from "next";
import CategoryPageClient from "../../components/category-page-client";

const CATEGORY_INFO: { [key: string]: { name: string; emoji: string; description: string } } = {
  all: { name: "All", emoji: "✨", description: "Discover all trending AI image prompts" },
  boys: { name: "Boys", emoji: "👦", description: "Trending AI prompts for boys characters" },
  girls: { name: "Girls", emoji: "👧", description: "Trending AI prompts for girls characters" },
  anime: { name: "Anime", emoji: "🎌", description: "Best anime style AI image prompts" },
  chibi: { name: "Chibi", emoji: "🧸", description: "Cute chibi character AI prompts" },
  gaming: { name: "Gaming", emoji: "🎮", description: "Gaming character AI image prompts" },
  professional: { name: "Professional", emoji: "💼", description: "Professional style AI prompts" },
  kids: { name: "Kids", emoji: "👶", description: "Kids character AI image prompts" },
  cartoon: { name: "Cartoon", emoji: "🎨", description: "Cartoon style AI image prompts" },
  realistic: { name: "Realistic", emoji: "📸", description: "Photorealistic AI image prompts" },
};

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const info = CATEGORY_INFO[category];

  if (!info) {
    return {
      title: "PromptClick - Trending AI Prompts",
      description: "Discover trending AI image prompts",
    };
  }

  return {
    title: `${info.emoji} ${info.name} AI Prompts - PromptClick`,
    description: `${info.description}. Copy instantly, no login needed.`,
    openGraph: {
      title: `${info.name} AI Prompts - PromptClick`,
      description: info.description,
      url: `https://promptclick.vercel.app/${category}`,
    },
  };
}

export function generateStaticParams() {
  return [
    { category: "boys" },
    { category: "girls" },
    { category: "anime" },
    { category: "chibi" },
    { category: "gaming" },
    { category: "professional" },
    { category: "kids" },
    { category: "cartoon" },
    { category: "realistic" },
  ];
}

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  return <CategoryPageClient category={category} />;
}