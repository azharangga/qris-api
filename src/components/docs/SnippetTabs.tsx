"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function SnippetTabs({
  endpointPath,
  isPost,
  bodyPayload,
}: {
  endpointPath: string;
  isPost?: boolean;
  bodyPayload?: any;
}) {
  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState("curl");
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const placeholderId = bodyPayload?.id && /&lt;|</.test(String(bodyPayload.id)) ? String(bodyPayload.id) : "<PAYMENT_ID>";
  const fullUrl = endpointPath.includes("[id]")
    ? `${origin}${endpointPath.replace("[id]", placeholderId)}`
    : `${origin}${endpointPath}`;
  const jsonString = bodyPayload ? JSON.stringify(bodyPayload, null, 2) : "";
  const dynamicBodyPayload = bodyPayload;

  const snippets: Record<string, string> = {
    curl: isPost
      ? `curl -X POST "${fullUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(bodyPayload)}'`
      : `curl -X GET "${fullUrl}"`,
    python: isPost
      ? `import requests\n\npayload = ${jsonString.replace(/true/g, 'True').replace(/false/g, 'False')}\nresponse = requests.post("${fullUrl}", json=payload)\nresponse.raise_for_status()\nprint(response.json())`
      : `import requests\n\nresponse = requests.get("${fullUrl}")\nresponse.raise_for_status()\nprint(response.json())`,
    node: isPost
      ? `const axios = require("axios");\n\nasync function sendData() {\n  try {\n    const payload = ${jsonString};\n    const { data } = await axios.post("${fullUrl}", payload);\n    console.log(data);\n  } catch (error) {\n    console.error("Request failed:", error.message);\n  }\n}\n\nsendData();`
      : `const axios = require("axios");\n\nasync function fetchData() {\n  try {\n    const { data } = await axios.get("${fullUrl}");\n    console.log(data);\n  } catch (error) {\n    console.error("Request failed:", error.message);\n  }\n}\n\nfetchData();`,
    react: isPost
      ? `import { useState } from "react";\n\nexport default function DataSender() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(false);\n\n  const handleSubmit = async () => {\n    setLoading(true);\n    try {\n      const res = await fetch("${endpointPath}", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify(${jsonString}),\n      });\n      const json = await res.json();\n      setData(json);\n    } catch (err) {\n      console.error(err);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div>\n      <button onClick={handleSubmit} disabled={loading}>\n        {loading ? "Sending..." : "Submit"}\n      </button>\n      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}\n    </div>\n  );\n}`
      : `import { useState, useEffect } from "react";\n\nexport default function DataFetcher() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch("${endpointPath}", { signal: controller.signal })\n      .then((res) => {\n        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n        return res.json();\n      })\n      .then(setData)\n      .catch((err) => {\n        if (err.name !== "AbortError") setError(err.message);\n      })\n      .finally(() => setLoading(false));\n    return () => controller.abort();\n  }, []);\n\n  if (loading) return <p>Loading...</p>;\n  if (error) return <p>Error: {error}</p>;\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n}`,
    nextjs: isPost
      ? `// app/page.tsx\nexport default async function Page() {\n  const res = await fetch("${fullUrl}", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(${jsonString}),\n    cache: "no-store",\n  });\n  if (!res.ok) throw new Error("Failed to post data");\n  const data = await res.json();\n\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n}`
      : `// app/page.tsx\nexport default async function Page() {\n  const res = await fetch("${fullUrl}", {\n    next: { revalidate: 60 },\n  });\n  if (!res.ok) throw new Error("Failed to fetch data");\n  const data = await res.json();\n\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n}`,
    laravel: isPost
      ? `use Illuminate\\Support\\Facades\\Http;\n\n$response = Http::timeout(30)->post('${fullUrl}', ${jsonString.replace(/\{/g, '[').replace(/\}/g, ']').replace(/:/g, ' =>')});\n\nif ($response->successful()) {\n    return $response->json();\n}\nreturn response()->json(['error' => 'Request failed'], $response->status());`
      : `use Illuminate\\Support\\Facades\\Http;\n\n$response = Http::timeout(30)->get('${fullUrl}');\n\nif ($response->successful()) {\n    return $response->json();\n}\nreturn response()->json(['error' => 'Request failed'], $response->status());`,
    go: isPost
      ? `package main\n\nimport (\n    "bytes"\n    "fmt"\n    "io"\n    "log"\n    "net/http"\n)\n\nfunc main() {\n    payload := []byte(\`${JSON.stringify(bodyPayload)}\`)\n    resp, err := http.Post("${fullUrl}", "application/json", bytes.NewBuffer(payload))\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer resp.Body.Close()\n\n    body, _ := io.ReadAll(resp.Body)\n    fmt.Println(string(body))\n}`
      : `package main\n\nimport (\n    "fmt"\n    "io"\n    "log"\n    "net/http"\n)\n\nfunc main() {\n    resp, err := http.Get("${fullUrl}")\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer resp.Body.Close()\n\n    body, _ := io.ReadAll(resp.Body)\n    fmt.Println(string(body))\n}`,
    reactnative: isPost
      ? `import { useState } from "react";\nimport { Button, Text, ActivityIndicator, ScrollView, View } from "react-native";\n\nexport default function SubmitScreen() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(false);\n\n  const sendData = () => {\n    setLoading(true);\n    fetch("${fullUrl}", {\n      method: "POST",\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify(${jsonString}),\n    })\n      .then((res) => res.json())\n      .then(setData)\n      .catch(console.error)\n      .finally(() => setLoading(false));\n  };\n\n  return (\n    <View>\n      <Button title="Send Request" onPress={sendData} />\n      {loading && <ActivityIndicator />}\n      {data && <ScrollView><Text>{JSON.stringify(data, null, 2)}</Text></ScrollView>}\n    </View>\n  );\n}`
      : `import { useState, useEffect } from "react";\nimport { Text, ActivityIndicator, ScrollView } from "react-native";\n\nexport default function DataScreen() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch("${fullUrl}")\n      .then((res) => res.json())\n      .then(setData)\n      .catch(console.error)\n      .finally(() => setLoading(false));\n  }, []);\n\n  if (loading) return <ActivityIndicator size="large" />;\n  return <ScrollView><Text>{JSON.stringify(data, null, 2)}</Text></ScrollView>;\n}`,
    flutter: isPost
      ? `import 'dart:convert';\nimport 'package:http/http.dart' as http;\n\nFuture<Map<String, dynamic>> sendData() async {\n  final response = await http.post(\n    Uri.parse('${fullUrl}'),\n    headers: {'Content-Type': 'application/json'},\n    body: jsonEncode(${jsonString}),\n  );\n  if (response.statusCode == 200) {\n    return jsonDecode(response.body);\n  }\n  throw Exception('Failed: \${response.statusCode}');\n}`
      : `import 'dart:convert';\nimport 'package:http/http.dart' as http;\n\nFuture<Map<String, dynamic>> fetchData() async {\n  final response = await http.get(\n    Uri.parse('${fullUrl}'),\n  );\n  if (response.statusCode == 200) {\n    return jsonDecode(response.body);\n  }\n  throw Exception('Failed: \${response.statusCode}');\n}`,
    kotlin: isPost
      ? `import io.ktor.client.*\nimport io.ktor.client.request.*\nimport io.ktor.client.statement.*\nimport io.ktor.http.*\n\nsuspend fun sendData(): String {\n    val client = HttpClient()\n    try {\n        val response = client.post("${fullUrl}") {\n            contentType(ContentType.Application.Json)\n            setBody("""${jsonString}""")\n        }\n        return response.bodyAsText()\n    } finally {\n        client.close()\n    }\n}`
      : `import io.ktor.client.*\nimport io.ktor.client.request.*\nimport io.ktor.client.statement.*\n\nsuspend fun fetchData(): String {\n    val client = HttpClient()\n    try {\n        val response = client.get("${fullUrl}")\n        return response.bodyAsText()\n    } finally {\n        client.close()\n    }\n}`,
    swift: isPost
      ? `import Foundation\n\nfunc sendData() async throws -> [String: Any] {\n    guard let url = URL(string: "${fullUrl}") else {\n        throw URLError(.badURL)\n    }\n    var request = URLRequest(url: url)\n    request.httpMethod = "POST"\n    request.setValue("application/json", forHTTPHeaderField: "Content-Type")\n    request.httpBody = """\n${jsonString}\n""".data(using: .utf8)\n\n    let (data, response) = try await URLSession.shared.data(for: request)\n    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {\n        throw URLError(.badServerResponse)\n    }\n    return try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]\n}`
      : `import Foundation\n\nfunc fetchData() async throws -> [String: Any] {\n    guard let url = URL(string: "${fullUrl}") else {\n        throw URLError(.badURL)\n    }\n    let (data, response) = try await URLSession.shared.data(from: url)\n    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {\n        throw URLError(.badServerResponse)\n    }\n    return try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]\n}`,
  };

  const tabs = [
    { key: "curl", label: "cURL" },
    { key: "python", label: "Python" },
    { key: "node", label: "Node.js" },
    { key: "react", label: "React" },
    { key: "nextjs", label: "Next.js" },
    { key: "laravel", label: "Laravel" },
    { key: "go", label: "Go" },
    { key: "reactnative", label: "React Native" },
    { key: "flutter", label: "Flutter" },
    { key: "kotlin", label: "Kotlin" },
    { key: "swift", label: "Swift" },
  ];

  const handleCopy = () => {
    const code = snippets[activeTab] || "";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="snip-wrap">
      <div className="snip-header">
        <div className="snip-tabs no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setIsVisible(true);
              }}
              className={`snip-tab ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="btn-ghost-dark"
                aria-label="Copy Code"
              >
                {copied ? (
                  <i className="fa-solid fa-check text-emerald-400" />
                ) : (
                  <i className="fa-regular fa-copy" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy Code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="btn-ghost-dark"
                aria-label="Toggle View"
              >
                <i className={`fa-solid fa-chevron-${isVisible ? "up" : "down"}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{isVisible ? "Collapse Code" : "Expand Code"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {isVisible && (
        <div className="snip-body">
          <pre className="m-0 overflow-x-auto text-xs sm:text-[13px] whitespace-pre-wrap word-break">
            <code
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(snippets[activeTab] || ""),
              }}
            />
          </pre>
        </div>
      )}
    </div>
  );
}

function highlightSyntax(code: string) {
  let hl = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  hl = hl.replace(/(&lt;[A-Z_]+?&gt;)/g, '<span style="color: #f87171; font-weight: 700;">$1</span>');
  hl = hl.replace(/\b(curl|GET|POST)\b|(-X|-H|-d)/g, '<span style="color: #c678dd;">$1</span>');
  hl = hl.replace(/(".*?")/g, (match) => {
    if (/&lt;[A-Z_]+?&gt;/.test(match)) {
      return match.replace(/(&lt;[A-Z_]+?&gt;)/g, '"<span style="color: #f87171; font-weight: 700;">$1</span>"');
    }
    return `<span style="color: #98c379;">${match}</span>`;
  });
  hl = hl.replace(/(https?:\/\/[^\s"]+)/g, (match) => {
    if (/&lt;[A-Z_]+?&gt;/.test(match)) {
      return match.replace(/(&lt;[A-Z_]+?&gt;)/g, '<span style="color: #f87171; font-weight: 700;">$1</span>');
    }
    return `<span style="color: #61afef; text-decoration: underline;">${match}</span>`;
  });
  hl = hl.replace(/\b(const|let|var|await|import|from|export|default|function|return|package|main|func|defer|if|throw|try|catch|new|nil|err|use|suspend|val|class|struct|Future|async|throws|guard|else)\b/g, '<span style="color: #c678dd;">$1</span>');
  hl = hl.replace(/\b(fetch|print|jsonDecode|jsonEncode)\b|console\.log|io\.ReadAll|JSON\.stringify|\.json|\.ok|\.status|Http::timeout|requests\.(get|post)/g, '<span style="color: #61afef;">$1</span>');

  return hl;
}
