"use client";

import { useEffect, useState } from "react";

export function Hero() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="overview"
      className="px-4 sm:px-6 md:px-12 lg:px-20 pt-20 lg:pt-16 pb-12 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0f0f12] section-animate"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white mb-4">
        QRIS API Documentation
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
        A payment gateway built for Indonesian QRIS, designed for seamless integration into your applications. Parse, validate, and convert payment codes while powering secure, reliable, and real-time checkout experiences.
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 pl-3 rounded-lg w-full sm:w-fit shadow-sm overflow-hidden">
        <span className="font-medium text-zinc-500 dark:text-zinc-400 shrink-0">Base URL:</span>
        <code className="text-zinc-900 dark:text-zinc-100 font-mono text-xs sm:text-sm truncate flex-1 min-w-0">
          {origin}
        </code>
        <button
          onClick={copyUrl}
          className="btn-ghost !h-8 !px-2 shrink-0"
          title="Copy Base URL"
        >
          {copied ? (
            <i className="fa-solid fa-check text-emerald-500" />
          ) : (
            <i className="fa-regular fa-copy" />
          )}
        </button>
      </div>
    </section>
  );
}
