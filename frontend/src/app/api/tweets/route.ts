// frontend/src/app/api/tweets/route.ts
import { NextResponse } from "next/server";

// Perfiles políticos argentinos a seguir
const HANDLES = [
  "JMilei",
  "MLousteau",
  "PatoBullrich",
  "maximokirchhner",
  "alferdez",
];

// Nitter instances públicas (fallback si una falla)
const NITTER_INSTANCES = [
  "https://nitter.net",
  "https://nitter.privacydev.net",
  "https://nitter.poast.org",
];

async function fetchTweetsFromHandle(handle: string): Promise<any[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const res = await fetch(`${instance}/${handle}/rss`, {
        next: { revalidate: 900 }, // cache 15min
        headers: { "User-Agent": "Alethia-Bot/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;

      const xml = await res.text();

      // Parse RSS XML manualmente (sin dependencias)
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      return items.slice(0, 2).map((item) => {
        const title    = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || "";
        const pubDate  = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const link     = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const creator  = item.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/)?.[1] || handle;

        // Calcular tiempo relativo
        const date = new Date(pubDate);
        const diff = Date.now() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        const time = hours < 1 ? "Hace menos de 1h" : hours < 24 ? `Hace ${hours}h` : `Hace ${Math.floor(hours / 24)}d`;

        return {
          id: link,
          author: creator,
          handle: `@${handle}`,
          time,
          text: title.replace(/^RT @\w+: /, "").slice(0, 280),
          likes: "—",
          retweets: "—",
          url: link,
        };
      });
    } catch {
      continue;
    }
  }
  return [];
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      HANDLES.map(h => fetchTweetsFromHandle(h))
    );

    const tweets = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as PromiseFulfilledResult<any[]>).value)
      .filter(t => t.text.length > 10)
      .slice(0, 8);

    return NextResponse.json({ tweets });
  } catch (e: any) {
    return NextResponse.json({ tweets: [], error: e.message }, { status: 500 });
  }
}
