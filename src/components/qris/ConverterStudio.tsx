"use client";

import { useState, useRef } from "react";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { parseQRIS } from "@/lib/core/parser";
import { convertQRIS } from "@/lib/core/converter";
import { validateQRIS } from "@/lib/core/validator";
import type { QRISData } from "@/lib/core/types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ConverterStudio() {
  const [activeTab, setActiveTab] = useState<"upload" | "raw">("upload");
  const [inputString, setInputString] = useState("");
  const [parsed, setParsed] = useState<QRISData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Upload & Progress State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const [amount, setAmount] = useState<string>("");
  const [feeType, setFeeType] = useState<"none" | "fixed" | "percentage">("none");
  const [feeValue, setFeeValue] = useState<string>("");

  const [dynamicResult, setDynamicResult] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessInput = (val: string, fromUpload = false) => {
    setInputString(val);
    setDynamicResult("");
    setQrDataUrl("");
    setErrors([]);

    if (!val.trim()) {
      setParsed(null);
      return;
    }

    const validation = validateQRIS(val.trim());
    if (!validation.valid) {
      setErrors(validation.errors);
      setParsed(null);
      if (fromUpload) toast.error("Invalid QRIS payload");
      return;
    }

    try {
      const data = parseQRIS(val.trim());
      setParsed(data);
      if (fromUpload) toast.success("QRIS parsed successfully");
    } catch {
      setErrors(["Failed to parse QRIS payload structure"]);
      setParsed(null);
      if (fromUpload) toast.error("Failed to parse QRIS payload");
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    setErrors([]);
    setUploadProgress(15);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 60);
        setUploadProgress(percent);
      }
    };

    reader.onload = () => {
      setUploadProgress(75);
      const img = new Image();
      img.onload = () => {
        setUploadProgress(90);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setUploadProgress(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setTimeout(() => {
          setUploadProgress(100);
          setUploadedImagePreview(img.src);

          if (code && code.data) {
            handleProcessInput(code.data, true);
          } else {
            setErrors(["No QR code could be detected in this image."]);
            toast.error("No QR code detected in this image");
          }

          setTimeout(() => setUploadProgress(null), 300);
        }, 200);
      };

      img.onerror = () => {
        setUploadProgress(null);
        setErrors(["Failed to load image file."]);
        toast.error("Failed to load image file");
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleResetImage = () => {
    setUploadedImagePreview(null);
    setInputString("");
    setParsed(null);
    setDynamicResult("");
    setQrDataUrl("");
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image removed");
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputString.trim() || !amount) return;

    try {
      const numAmount = parseFloat(amount);
      let feeObj = undefined;

      if (feeType !== "none" && feeValue) {
        feeObj = {
          type: feeType,
          value: parseFloat(feeValue),
        };
      }

      const resString = convertQRIS(inputString.trim(), {
        amount: Math.floor(numAmount),
        fee: feeObj,
      });

      setDynamicResult(resString);

      const url = await QRCode.toDataURL(resString, {
        margin: 2,
        width: 300,
        color: { dark: "#09090b", light: "#ffffff" },
      });
      setQrDataUrl(url);
      toast.success("Dynamic QRIS generated successfully");
    } catch (err: any) {
      const msg = err.message || "Failed to generate dynamic QRIS";
      setErrors([msg]);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Card with Tabs */}
      <div className="card-wrap">
        <div className="playground-header flex items-center justify-between">
          <span className="playground-title">INPUT QRIS</span>
          <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-0.5 rounded-md text-xs font-medium mr-1">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1 rounded transition ${
                activeTab === "upload"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              <i className="fa-solid fa-cloud-arrow-up mr-1.5" /> Upload Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("raw")}
              className={`px-3 py-1 rounded transition ${
                activeTab === "raw"
                  ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              <i className="fa-solid fa-code mr-1.5" /> Raw QRIS
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {activeTab === "upload" ? (
            uploadedImagePreview ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
                <img
                  src={uploadedImagePreview}
                  alt="Uploaded QRIS"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white p-1"
                />
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      QR Code Detected
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Image processed successfully, payload is ready to convert.
                  </p>
                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
                    >
                      <i className="fa-solid fa-arrow-rotate-right text-[11px]" />
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <i className="fa-solid fa-trash text-[11px]" />
                      Remove
                    </button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition min-h-[190px] ${
                  isDragging
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100/80 dark:bg-zinc-800/80 scale-[0.99]"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30"
                }`}
              >
                {uploadProgress !== null ? (
                  <div className="w-full max-w-xs flex flex-col items-center space-y-3">
                    <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-600 dark:text-zinc-300" />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Processing image... ({uploadProgress}%)
                    </span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <i className="fa-solid fa-image text-xl text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1 text-center">
                      Drag & drop image here or <span className="underline font-semibold">browse file</span>
                    </p>
                    <p className="text-xs text-zinc-400 text-center">
                      Formats: JPG, PNG, WEBP • Max 10 MB
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )
          ) : (
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Paste QRIS Code
              </label>
              <textarea
                rows={3}
                value={inputString}
                onChange={(e) => handleProcessInput(e.target.value)}
                placeholder="00020101021126580014ID.LINKAJA.WWW..."
                className="input-field font-mono text-xs !h-auto"
              />
            </div>
          )}

          {/* Always display decoded raw QRIS if available */}
          {inputString && (
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Active QRIS Payload
              </label>
              <textarea
                rows={2}
                readOnly
                value={inputString}
                className="input-field font-mono text-xs !h-auto bg-zinc-50 dark:bg-zinc-900"
              />
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-600 dark:text-rose-400 text-xs space-y-1">
              {errors.map((err, idx) => (
                <div key={idx}>• {err}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Merchant Details */}
      {parsed && (
        <div className="card-wrap">
          <div className="card-header">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Parsed Merchant Info
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {parsed.method.toUpperCase()}
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block mb-0.5">Merchant Name</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {parsed.merchantName || "-"}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">City / Postal</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {parsed.merchantCity || "-"} ({parsed.postalCode || "-"})
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Currency</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                IDR (360)
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-0.5">Acquirers / IDs</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {parsed.merchantAccountInfo
                  .map((m) => m.globallyUniqueId)
                  .filter(Boolean)
                  .join(", ") || "Standard QRIS"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Convert Form */}
      {parsed && (
        <form onSubmit={handleConvert} className="card-wrap">
          <div className="card-header">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Dynamic Parameters
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Amount (IDR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Convenience Fee Type
                </label>
                <Select
                  value={feeType}
                  onValueChange={(val: any) => setFeeType(val)}
                >
                  <SelectTrigger className="w-full text-xs h-9 bg-white dark:bg-[#0f0f12] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <SelectItem value="none">No Fee</SelectItem>
                    <SelectItem value="fixed">Fixed Fee (IDR)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {feeType !== "none" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Fee Value {feeType === "fixed" ? "(IDR)" : "(%)"}
                </label>
                <input
                  type="number"
                  step={feeType === "percentage" ? "0.1" : "1"}
                  placeholder={feeType === "fixed" ? "2000" : "0.7"}
                  value={feeValue}
                  onChange={(e) => setFeeValue(e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full text-xs font-semibold !h-9"
            >
              <i className="fa-solid fa-bolt mr-1.5" /> Generate Dynamic QRIS
            </button>
          </div>
        </form>
      )}

      {/* Generated Result */}
      {dynamicResult && (
        <div className="card-wrap">
          <div className="card-header">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Dynamic QRIS Output
            </span>
          </div>
          <div className="p-6 flex flex-col items-center justify-center space-y-4">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Dynamic QR Code"
                className="w-56 h-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white p-2"
              />
            )}
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Payload String:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(dynamicResult);
                    toast.success("Payload string copied to clipboard");
                  }}
                  className="text-zinc-700 dark:text-zinc-300 hover:underline font-medium"
                >
                  Copy String
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={dynamicResult}
                className="input-field font-mono text-xs !h-auto select-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
