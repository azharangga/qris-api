"use client";

import { useState } from "react";
import { ParamTable, Parameter } from "./ParamTable";
import { SnippetTabs } from "./SnippetTabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface EndpointProps {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  parameters: Parameter[];
  defaultPayload?: any;
  snippetGuide?: any;
  inputFields?: { name: string; label: string; placeholder: string; defaultValue?: string }[];
  supportsImage?: boolean;
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
}: EndpointProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("OK");
  const [showResponse, setShowResponse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeResTab, setActiveResTab] = useState<"json" | "image">("json");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // Form input states (Initially empty, populated only by Example click)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    inputFields?.forEach((f) => {
      init[f.name] = "";
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
      let reqUrl = path;
      let reqBody: any = null;

      if (method === "GET") {
        const query = new URLSearchParams(fieldValues).toString();
        if (query) reqUrl += `?${query}`;
      } else if (method === "POST") {
        if (inputFields && inputFields.length > 0) {
          reqBody = { ...fieldValues };
          if (reqBody.amount) reqBody.amount = Number(reqBody.amount);
        } else if (defaultPayload) {
          reqBody = defaultPayload;
        }
      }

      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (reqBody) options.body = JSON.stringify(reqBody);

      const res = await fetch(reqUrl, options);
      const data = await res.json();
      setStatus(res.status);
      setStatusText(httpStatusText(res.status));
      setResponse(data);
      setShowResponse(true);

      if (data?.dataUrl) {
        setImageDataUrl(data.dataUrl);
      } else if (data?.dynamic_qris) {
        try {
          const qrRes = await fetch("/api/qris/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: data.dynamic_qris }),
          });
          const qrData = await qrRes.json();
          if (qrData.dataUrl) setImageDataUrl(qrData.dataUrl);
        } catch {}
      }
    } catch (err: any) {
      setStatus(500);
      setStatusText("Internal Server Error");
      setResponse({ error: err.message || "Failed to make request" });
      setShowResponse(true);
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
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
            <div className="playground-header">
              <span className="playground-title">TRY IT</span>
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
                    <div key={field.name} className="w-full">
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        {field.label}
                      </label>
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
