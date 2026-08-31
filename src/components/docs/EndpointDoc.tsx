"use client";

import { useState } from "react";
import { ParamTable, Parameter } from "./ParamTable";
import { SnippetTabs } from "./SnippetTabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EndpointProps {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  parameters: Parameter[];
  defaultPayload?: any;
  snippetGuide?: any;
  inputFields?: { name: string; label: string; placeholder: string; defaultValue?: string; options?: string[] }[];
  supportsImage?: boolean;
  hasPaymentTabs?: boolean;
}

export function EndpointDoc({
  id,
  method,
  path,
  title,
  description,
  parameters,
  defaultPayload,
  snippetGuide,
  inputFields,
  supportsImage = false,
  hasPaymentTabs = false,
}: EndpointProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("OK");
  const [showResponse, setShowResponse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeResTab, setActiveResTab] = useState<"json" | "image">("json");
  const [activeCreateMode, setActiveCreateMode] = useState<"custom" | "demo">("custom");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // Form input states (Initially empty on page load, populated only by Example click)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    inputFields?.forEach((f) => {
      init[f.name] = f.options ? f.defaultValue || f.options[0] : "";
    });
    return init;
  });

  const httpStatusText = (code: number) => {
    const map: Record<number, string> = {
      200: "OK",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      422: "Unprocessable Entity",
      500: "Internal Server Error",
    };
    return map[code] || "Unknown";
  };

  const handleExecute = async () => {
    setLoading(true);
    setShowResponse(false);
    setImageDataUrl(null);
    try {
      toast.loading("Sending request...", { id: "req-toast" });
      let reqUrl = path;
      let reqBody: any = null;

      if (path.includes("[id]")) {
        reqUrl = path.replace("[id]", fieldValues.id || "");
      }

      if (method === "GET") {
        const queryParams = { ...fieldValues };
        delete queryParams.id;
        const query = new URLSearchParams(queryParams).toString();
        if (query) reqUrl += `?${query}`;
      } else if (method === "POST") {
        if (inputFields && inputFields.length > 0) {
          reqBody = { ...fieldValues };
          delete reqBody.id;
          if (id === "convert") reqBody.format = "data_url";
          if (reqBody.amount) reqBody.amount = Number(reqBody.amount);
          if (reqBody.expiresIn && !isNaN(Number(reqBody.expiresIn))) reqBody.expiresIn = Number(reqBody.expiresIn);
        } else if (defaultPayload) {
          reqBody = defaultPayload;
        }
      }

      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      
      // Do not send body for POST if it's empty (like in cancel/confirm endpoints)
      if (reqBody && Object.keys(reqBody).length > 0 && method !== "GET") {
        options.body = JSON.stringify(reqBody);
      }

      // Check if it's an image streaming endpoint (QR generation from payment ID)
      if (reqUrl.endsWith("/qr") || (reqUrl.includes("/qr?") && !reqUrl.includes("qris/generate"))) {
        const imgRes = await fetch(reqUrl, { method: "GET" });
        setStatus(imgRes.status);
        setStatusText(httpStatusText(imgRes.status));

        if (imgRes.ok) {
          const blob = await imgRes.blob();
          const url = URL.createObjectURL(blob);
          setImageDataUrl(url);
          setResponse({ status: "success", format: fieldValues.format || "png", stream: "binary/image" });
          setActiveResTab("image");
          setShowResponse(true);
          setLoading(false);
          toast.success("Image received successfully", { id: "req-toast" });
          return;
        } else {
          // If error on image endpoint, fallback to JSON parsing
          const errData = await imgRes.json();
          setResponse(errData);
          setShowResponse(true);
          setLoading(false);
          toast.error(`Request failed (${imgRes.status})`, { id: "req-toast" });
          return;
        }
      }

      const res = await fetch(reqUrl, options);
      const data = await res.json();
      setStatus(res.status);
      setStatusText(httpStatusText(res.status));
      setResponse(data);
      setShowResponse(true);

      if (res.ok) {
        toast.success(`Request success (${res.status})`, { id: "req-toast" });
      } else {
        toast.error(`Request error (${res.status})`, { id: "req-toast" });
      }

      // Handle standard envelope format response
      const targetPayload = data?.success ? data.data : data;

      // Only show QR preview if it is not a cancellation or confirmation response
      if (path.includes("/cancel") || path.includes("/confirm")) {
        setImageDataUrl(null);
        return;
      }

      if (targetPayload?.dataUrl) {
        setImageDataUrl(targetPayload.dataUrl);
      } else if (targetPayload?.dynamicQris || targetPayload?.qrisString) {
        try {
          const qrRes = await fetch(
            `/api/qris/payment/${targetPayload.paymentId || "pay_01K4Z8X7M3N5Q2R6T9W8A1B4C"}/qr?format=png`
          );
          if (qrRes.ok) {
            const blob = await qrRes.blob();
            setImageDataUrl(URL.createObjectURL(blob));
          }
        } catch {}
      }
    } catch (err: any) {
      setStatus(500);
      setStatusText("Internal Server Error");
      setResponse({ error: err.message || "Failed to make request" });
      setShowResponse(true);
      toast.error("Network or internal error", { id: "req-toast" });
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJsonSyntax = (obj: any) => {
    const jsonString = JSON.stringify(obj, null, 2);
    return jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "n";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "k";
          } else {
            cls = "s";
          }
        } else if (/true|false/.test(match)) {
          cls = "b";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const gridColsClass =
    !inputFields || inputFields.length === 1
      ? "grid-cols-1"
      : inputFields.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-3";

  return (
    <div id={id} className="section-animate py-4 border-b border-zinc-100 dark:border-zinc-800">
      <div
        className="ep-header flex items-center gap-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className={method === "GET" ? "badge-get" : "badge-post"}>{method}</span>
        <span className="ep-path">{path}</span>
        <button
          type="button"
          className="endpoint-toggle ml-auto"
          aria-label="Toggle endpoint"
        >
          <i
            className={`fa-solid fa-chevron-down transition-transform duration-200 ${
              isCollapsed ? "-rotate-90" : ""
            }`}
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="endpoint-body mt-2 space-y-4">
          <p className="ep-desc">{description}</p>

          <ParamTable parameters={parameters} />

          <SnippetTabs endpointPath={path} isPost={method === "POST"} bodyPayload={snippetGuide || defaultPayload} />

          {/* Try It Input Container */}
          <div className="input-container">
            <div className="playground-header relative flex items-center justify-between min-h-[42px] px-3">
              <span className="playground-title">TRY IT</span>
              
              {hasPaymentTabs && (
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-md text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCreateMode("custom");
                      setFieldValues({ qris: "", amount: "", referenceId: "", expiresIn: "" });
                      toast.info("Custom Mode aktif");
                    }}
                    className={`px-3 py-1 rounded transition ${
                      activeCreateMode === "custom"
                        ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-950 dark:text-white font-semibold"
                        : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    Custom Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCreateMode("demo");
                      if (defaultPayload) {
                        const mapped: Record<string, string> = {};
                        Object.keys(defaultPayload).forEach((k) => {
                          mapped[k] =
                            typeof defaultPayload[k] === "object"
                              ? JSON.stringify(defaultPayload[k])
                              : String(defaultPayload[k]);
                        });
                        setFieldValues(mapped);
                        toast.success("Demo Mode aktif");
                      }
                    }}
                    className={`px-3 py-1 rounded transition ${
                      activeCreateMode === "demo"
                        ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-950 dark:text-white font-semibold"
                        : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    Demo Mode
                  </button>
                </div>
              )}

              <button
                type="button"
                className="btn-fill-example px-3 py-1 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm"
                onClick={() => {
                  if (defaultPayload) {
                    const mapped: Record<string, string> = {};
                    Object.keys(defaultPayload).forEach((k) => {
                      mapped[k] =
                        typeof defaultPayload[k] === "object"
                          ? JSON.stringify(defaultPayload[k])
                          : String(defaultPayload[k]);
                    });
                    setFieldValues(mapped);
                    toast.success("Example payload loaded");
                  }
                }}
              >
                <i className="fa-regular fa-lightbulb text-amber-500 mr-1.5" />
                <span>Example</span>
              </button>
            </div>

            <div className="playground-body space-y-4">
              {inputFields && inputFields.length > 0 && (
                <div className={`grid ${gridColsClass} gap-3`}>
                  {inputFields.map((field) => (
                    <div key={field.name} className="w-full min-w-0">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        {field.label.trim().endsWith("*") ? (
                          <>
                            {field.label.replace(/\s*\*+\s*$/, "")} <span className="text-red-500">*</span>
                          </>
                        ) : (
                          field.label
                        )}
                      </label>
                      {field.options && field.options.length > 0 ? (
                        <Select
                          value={fieldValues[field.name] || field.defaultValue || field.options[0]}
                          onValueChange={(val) =>
                            setFieldValues({
                              ...fieldValues,
                              [field.name]: val,
                            })
                          }
                        >
                          <SelectTrigger className="w-full text-xs h-9 bg-white dark:bg-[#0f0f12] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                            <SelectValue placeholder={field.placeholder || "Select option"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={fieldValues[field.name] || ""}
                          onChange={(e) =>
                            setFieldValues({
                              ...fieldValues,
                              [field.name]: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleExecute}
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" /> Loading...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" /> Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Container */}
          {showResponse && response && (
            <div className="code-container !block mt-4">
              <div className="card-wrap">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <span
                      className={`status-badge ${
                        status && status >= 200 && status < 300
                          ? "status-ok"
                          : status && status >= 500
                          ? "status-err"
                          : "status-warn"
                      }`}
                    >
                      {status} {statusText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {(supportsImage || imageDataUrl) && (
                      <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-0.5 rounded-md text-xs font-medium mr-1">
                        <button
                          type="button"
                          onClick={() => setActiveResTab("json")}
                          className={`px-2.5 py-0.5 rounded transition ${
                            activeResTab === "json"
                              ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-950 dark:text-white font-semibold"
                              : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                          }`}
                        >
                          JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveResTab("image")}
                          className={`px-2.5 py-0.5 rounded transition ${
                            activeResTab === "image"
                              ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-950 dark:text-white font-semibold"
                              : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                          }`}
                        >
                          QR Preview
                        </button>
                      </div>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="btn-ghost !h-8 !px-2 hidden sm:inline-flex"
                          onClick={copyPayload}
                        >
                          {copied ? (
                            <i className="fa-solid fa-check text-emerald-500" />
                          ) : (
                            <i className="fa-regular fa-copy" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="btn-ghost !h-8 !px-2"
                          onClick={() => setShowResponse(false)}
                        >
                          <i className="fa-solid fa-chevron-up" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Collapse</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="btn-ghost !h-8 !px-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-500"
                          onClick={() => {
                            setShowResponse(false);
                            setResponse(null);
                            setImageDataUrl(null);
                          }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Clear</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {activeResTab === "json" ? (
                  <div
                    className="code relative group"
                    dangerouslySetInnerHTML={{
                      __html: formatJsonSyntax(response),
                    }}
                  />
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center bg-zinc-950 text-white space-y-4 rounded-b-xl">
                    {imageDataUrl ? (
                      <div className="bg-white p-3 rounded-xl shadow-lg">
                        <img
                          src={imageDataUrl}
                          alt="Generated QR"
                          className="w-48 h-48 sm:w-60 sm:h-60 rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="text-zinc-400 text-xs">
                        No image visual preview available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
