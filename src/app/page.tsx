import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Hero } from "@/components/layout/Hero";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { EndpointsSection } from "@/components/docs/EndpointsSection";
import { ConverterStudio } from "@/components/qris/ConverterStudio";
import { Footer } from "@/components/layout/Footer";

export default function Page() {
  return (
    <div className="flex flex-1 w-full relative">
      <Topbar />
      <Sidebar />
      <ScrollToTop />

      <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0f0f12]">
        <Hero />

        <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-2">
          <div id="tester" className="py-4 section-animate">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2">
              Interactive QRIS Playground
            </h2>
            <p className="ep-desc mb-4">
              Test parsing, validating, and dynamic generation directly in your browser. Upload a QRIS image or provide raw string payload.
            </p>
            <ConverterStudio />
          </div>

          <div id="endpoints" className="pt-2 pb-6 section-animate">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2">
              API Endpoints
            </h2>
            <p className="ep-desc mb-4">
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
