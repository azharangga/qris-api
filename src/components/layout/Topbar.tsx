"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Topbar() {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar-panel");
    const overlay = document.querySelector(".sidebar-overlay");
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("active");
  };

  const toggleTheme = () => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-14 bg-white/85 dark:bg-[#0f0f12]/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-between px-4 transition-transform lg:hidden",
        hidden && "-translate-y-full"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <i className="fa-solid fa-bars text-sm" />
        </button>
        <span className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">QRIS API</span>
      </div>
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <i className="fa-solid fa-moon text-sm dark:hidden" />
        <i className="fa-solid fa-sun text-sm hidden dark:inline-block" />
      </button>
    </header>
  );
}
