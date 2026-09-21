"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { openPlayground } from "@/components/qris/PlaygroundModal";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
      const isCol = localStorage.getItem("sidebar-collapsed") === "true";
      if (window.innerWidth >= 1024) setCollapsed(isCol);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );

      const sections = document.querySelectorAll("section[id], div[id]");
      sections.forEach((sec) => observer.observe(sec));

      return () => observer.disconnect();
    }
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      const newCol = !collapsed;
      setCollapsed(newCol);
      localStorage.setItem("sidebar-collapsed", String(newCol));
    } else {
      const panel = document.getElementById("sidebar-panel");
      const overlay = document.getElementById("sidebar-overlay");
      panel?.classList.toggle("open");
      overlay?.classList.toggle("active");
    }
  };

  const closeSidebarMobile = () => {
    const panel = document.getElementById("sidebar-panel");
    const overlay = document.getElementById("sidebar-overlay");
    panel?.classList.remove("open");
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
  };

  const toggleDarkMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e && e.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    document.documentElement.classList.add("theme-switching");

    if (document.startViewTransition) {
      const willBeDark = !document.documentElement.classList.contains("dark");
      if (!willBeDark) document.documentElement.classList.add("transitioning-to-light");
      document.documentElement.style.setProperty("--tx", x + "px");
      document.documentElement.style.setProperty("--ty", y + "px");
      document.documentElement.style.setProperty("--tr", maxRadius + "px");
      const transition = document.startViewTransition(() => {
        if (willBeDark) {
          document.documentElement.classList.add("dark");
          localStorage.theme = "dark";
          setIsDark(true);
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.theme = "light";
          setIsDark(false);
        }
      });
      transition.finished.then(() => {
        document.documentElement.classList.remove(
          "transitioning-to-light",
          "theme-switching"
        );
      });
      return;
    }

    const willBeDark = !document.documentElement.classList.contains("dark");
    if (willBeDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    }
    document.documentElement.classList.remove("theme-switching");
  };

  return (
    <>
      <div
        className="sidebar-overlay"
        id="sidebar-overlay"
        onClick={closeSidebarMobile}
      />
      <aside
        id="sidebar-panel"
        className={cn(
          "sidebar-panel no-scrollbar",
          collapsed ? "lg-collapsed" : ""
        )}
      >
        <div className="sidebar-header mb-2">
          <div className="sidebar-header-content flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 p-1">
              <Image
                src="/img/QRIS Logo.svg"
                alt="QRIS Logo"
                width={38}
                height={38}
                className="w-full h-auto dark:invert"
              />
            </div>
            <div>
              <h2 className="sidebar-header-title">QRIS API</h2>
              <p className="sidebar-header-version">
                v{process.env.NEXT_PUBLIC_APP_VERSION}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="sidebar-close-btn sidebar-collapse-toggle"
            id="sidebar-toggle-btn"
            aria-label="Toggle sidebar"
            data-tooltip="Collapse"
          >
            <i className="fa-solid fa-angles-left text-sm sidebar-collapse-icon" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar sidebar-nav-section">
          {/* Overview Group */}
          <div className="sidebar-nav-group">
            <div className="sidebar-nav-label">Overview</div>
            <a
              href="#overview"
              className={cn(
                "nav-item",
                activeSection === "overview" && "active"
              )}
              data-s="overview"
              data-tooltip="Introduction"
              onClick={() => {
                setActiveSection("overview");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-house" />
              </span>
              <span className="nav-text">Introduction</span>
            </a>
            <button
              type="button"
              onClick={() => {
                closeSidebarMobile();
                openPlayground();
              }}
              className="nav-item w-full text-left"
              data-tooltip="QRIS Playground"
            >
              <span className="nav-icon">
                <i className="fa-solid fa-qrcode" />
              </span>
              <span className="nav-text">QRIS Playground</span>
            </button>
          </div>

          {/* System Group */}
          <div className="sidebar-nav-group">
            <div className="sidebar-nav-label">System Endpoints</div>
            <a
              href="#health"
              className={cn(
                "nav-item",
                activeSection === "health" && "active"
              )}
              data-s="health"
              data-tooltip="Health Check"
              onClick={() => {
                setActiveSection("health");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-heart-pulse" />
              </span>
              <span className="nav-text">Health Check</span>
            </a>
          </div>

          {/* QRIS API Services (Flat list, without dropdown) */}
          <div className="sidebar-nav-group">
            <div className="sidebar-nav-label">QRIS Services</div>
            <a
              href="#parse"
              className={cn(
                "nav-item",
                activeSection === "parse" && "active"
              )}
              data-s="parse"
              data-tooltip="Parse Payload"
              onClick={() => {
                setActiveSection("parse");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-magnifying-glass" />
              </span>
              <span className="nav-text">Parse Payload</span>
            </a>
            <a
              href="#decode"
              className={cn(
                "nav-item",
                activeSection === "decode" && "active"
              )}
              data-s="decode"
              data-tooltip="Decode Image Content"
              onClick={() => {
                setActiveSection("decode");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-camera" />
              </span>
              <span className="nav-text">Decode Image</span>
            </a>
            <a
              href="#validate"
              className={cn(
                "nav-item",
                activeSection === "validate" && "active"
              )}
              data-s="validate"
              data-tooltip="Validate QRIS"
              onClick={() => {
                setActiveSection("validate");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-check-double" />
              </span>
              <span className="nav-text">Validate QRIS</span>
            </a>
            <a
              href="#convert"
              className={cn(
                "nav-item",
                activeSection === "convert" && "active"
              )}
              data-s="convert"
              data-tooltip="Convert Dynamic"
              onClick={() => {
                setActiveSection("convert");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-bolt" />
              </span>
              <span className="nav-text">Convert Dynamic</span>
            </a>
          </div>

          <div className="sidebar-nav-group">
            <div className="sidebar-nav-label">QRIS Payment Services</div>
            <a
              href="#create-payment"
              className={cn(
                "nav-item",
                activeSection === "create-payment" && "active"
              )}
              data-s="create-payment"
              data-tooltip="Create Payment"
              onClick={() => {
                setActiveSection("create-payment");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-file-invoice" />
              </span>
              <span className="nav-text">Create Payment</span>
            </a>
            <a
              href="#get-payment"
              className={cn(
                "nav-item",
                activeSection === "get-payment" && "active"
              )}
              data-s="get-payment"
              data-tooltip="Get Payment Details"
              onClick={() => {
                setActiveSection("get-payment");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-info-circle" />
              </span>
              <span className="nav-text">Get Details</span>
            </a>
            <a
              href="#cancel-payment"
              className={cn(
                "nav-item",
                activeSection === "cancel-payment" && "active"
              )}
              data-s="cancel-payment"
              data-tooltip="Cancel Payment"
              onClick={() => {
                setActiveSection("cancel-payment");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-ban" />
              </span>
              <span className="nav-text">Cancel Payment</span>
            </a>
            <a
              href="#confirm-payment"
              className={cn(
                "nav-item",
                activeSection === "confirm-payment" && "active"
              )}
              data-s="confirm-payment"
              data-tooltip="Confirm Payment"
              onClick={() => {
                setActiveSection("confirm-payment");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-check-circle" />
              </span>
              <span className="nav-text">Confirm Payment</span>
            </a>
            <a
              href="#qr-payment"
              className={cn(
                "nav-item",
                activeSection === "qr-payment" && "active"
              )}
              data-s="qr-payment"
              data-tooltip="Generate QR Code"
              onClick={() => {
                setActiveSection("qr-payment");
                closeSidebarMobile();
              }}
            >
              <span className="nav-icon">
                <i className="fa-solid fa-qrcode" />
              </span>
              <span className="nav-text">Generate QR Code</span>
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={toggleDarkMode}
            className="sidebar-footer-btn sidebar-theme-btn"
            data-tooltip="Dark Mode"
          >
            {isDark ? (
              <i className="fa-solid fa-sun" />
            ) : (
              <i className="fa-solid fa-moon" />
            )}
            <span className="footer-text">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
