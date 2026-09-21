"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConverterStudio } from "@/components/qris/ConverterStudio";

export function PlaygroundModal() {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    const handler = () => {
      setSessionKey((prev) => prev + 1);
      setOpen(true);
    };
    window.addEventListener("open-playground", handler);
    return () => window.removeEventListener("open-playground", handler);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSessionKey((prev) => prev + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-5xl h-[88vh] max-h-[88vh] p-0 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm">
              <i className="fa-solid fa-qrcode text-zinc-700 dark:text-zinc-300" />
            </span>
            <span>QRIS Playground & Converter Studio</span>
          </DialogTitle>
          <DialogDescription>
            Test parsing, validating, and converting static QRIS to dynamic codes directly in your browser.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {open && <ConverterStudio key={sessionKey} />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export function openPlayground() {
  window.dispatchEvent(new Event("open-playground"));
}
