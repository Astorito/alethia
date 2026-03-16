// frontend/src/components/dashboard/tweet-carousel.tsx
"use client";

import { useState, useEffect } from "react";

interface Tweet {
  id: string;
  author: string;
  handle: string;
  time: string;
  text: string;
  likes: string;
  retweets: string;
  url?: string;
}

const MOCK_TWEETS: Tweet[] = [
  { id: "1", author: "Javier Milei", handle: "@JMilei", time: "Hace 2h", text: "El equilibrio fiscal no es una opción, es el punto de partida de cualquier economía sana.", likes: "12.4K", retweets: "3.2K" },
  { id: "2", author: "Martín Lousteau", handle: "@MLousteau", time: "Hace 4h", text: "Los datos de pobreza son inaceptables. Necesitamos políticas de Estado que protejan a los más vulnerables.", likes: "8.1K", retweets: "2.7K" },
  { id: "3", author: "Patricia Bullrich", handle: "@PatoBullrich", time: "Hace 6h", text: "Nuevo operativo de seguridad en el norte del país. Estamos recuperando territorios que el narcotráfico había tomado.", likes: "15.2K", retweets: "4.1K" },
];

export function TweetCarousel() {
  const [tweets, setTweets] = useState<Tweet[]>(MOCK_TWEETS);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tweets")
      .then(r => r.json())
      .then(data => {
        if (data.tweets?.length > 0) setTweets(data.tweets);
      })
      .catch(() => {}) // fallback a mock si falla
      .finally(() => setLoading(false));
  }, []);

  const prev = () => setCurrent(c => (c - 1 + tweets.length) % tweets.length);
  const next = () => setCurrent(c => (c + 1) % tweets.length);

  const tweet = tweets[current];
  const initials = tweet?.author?.split(" ").map(w => w[0]).join("").slice(0, 2) || "??";

  return (
    <div className="glass-card-dash rounded-2xl p-5 flex flex-col justify-between" style={{ minHeight: "200px" }}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-black/5">
                <span className="text-xs font-bold text-gray-500">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{tweet.author}</p>
                <p className="text-[10px] text-gray-400 font-mono">{tweet.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 font-mono">{tweet.time}</span>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-gray-400 flex-shrink-0">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
          </div>

          {/* Text */}
          <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-4 line-clamp-4">{tweet.text}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="material-symbols-outlined text-[14px]">favorite</span>
                {tweet.likes}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="material-symbols-outlined text-[14px]">repeat</span>
                {tweet.retweets}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 font-mono mr-2">{current + 1}/{tweets.length}</span>
              <button onClick={prev} className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[14px] text-gray-600">chevron_left</span>
              </button>
              <button onClick={next} className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[14px] text-gray-600">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {tweets.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "bg-gray-700 w-4" : "bg-gray-300 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
