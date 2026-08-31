"use client";

export function Footer() {
  return (
    <footer className="py-6 px-4 sm:px-6 md:px-12 lg:px-20 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#0f0f12] mt-auto">
      <div>© 2026 QRIS API. All rights reserved.</div>
      <div>v{process.env.NEXT_PUBLIC_APP_VERSION}</div>
    </footer>
  );
}
