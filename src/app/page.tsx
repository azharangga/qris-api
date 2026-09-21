import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Hero } from "@/components/layout/Hero";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { EndpointsSection } from "@/components/docs/EndpointsSection";
import { PlaygroundModal } from "@/components/qris/PlaygroundModal";
import { Footer } from "@/components/layout/Footer";

export default function Page() {
  return (
    <div className="flex flex-1 w-full relative">
      <Topbar />
      <Sidebar />
      <ScrollToTop />
      <PlaygroundModal />

      <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0f0f12]">
        <Hero />

        <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-2">
          <div id="endpoints" className="pt-1 pb-6 section-animate">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-1.5">
              API Endpoints
            </h2>
            <p className="ep-desc !mb-2">
              Explore and test available endpoints with parameters and live request responses.
            </p>
            <EndpointsSection />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
