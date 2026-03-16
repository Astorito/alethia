// frontend/src/app/api/news/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.NEWS_API_KEY || "";
const QUERY = "Argentina política legislativo congreso";
const URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(QUERY)}&language=es&sortBy=publishedAt&pageSize=6&apiKey=${API_KEY}`;

export async function GET() {
  try {
    const res = await fetch(URL, { next: { revalidate: 1800 } }); // cache 30min
    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
    const data = await res.json();

    const articles = (data.articles || []).map((a: any) => ({
      id: a.url,
      category: a.source?.name || "Noticias",
      title: a.title,
      excerpt: a.description,
      image: a.urlToImage,
      source: a.source?.name,
      time: a.publishedAt,
      url: a.url,
    }));

    return NextResponse.json({ articles });
  } catch (e: any) {
    return NextResponse.json({ articles: [], error: e.message }, { status: 500 });
  }
}
