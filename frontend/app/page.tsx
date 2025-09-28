"use client";
import { useState } from "react";

// backend api
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

// File type
type UploadResp = {
  file_token?: string;
  columns?: string[];
  preview?: Record<string, unknown>[];
};

export default function HomePage() {
  const [fileToken, setFileToken] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [regex, setRegex] = useState<string>("");
  const [replacement, setReplacement] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  // relative download path from backend
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  // Natrual Lang instruction
  const [nlInstruction, setNlInstruction] = useState<string>("");
  // llm suggesting
  const [suggesting, setSuggesting] = useState<boolean>(false);

  function toAbsDownloadUrl(relative: string): string {
    const backendOrigin = API_BASE.replace(/\/api\/?$/, "");
    return `${backendOrigin}${relative}`;
  }

  async function handleUpload(file: File) {
    setLoading(true);
    setMessage("");
    setUploadedFileName(file.name);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data: UploadResp = await res.json();

      const nextToken = typeof data.file_token === "string" ? data.file_token : "";
      const nextCols = Array.isArray(data.columns) ? data.columns : [];
      const nextPreview = Array.isArray(data.preview) ? data.preview : [];

      setFileToken(nextToken);
      setColumns(nextCols);
      setPreview(nextPreview);
      // if there is a row name then use row in pos 1, otherwise empty
      setSelectedCol(nextCols.length > 0 ? nextCols[0] : "");
      setMessage("Upload success.");
      // clear any previous download link
      setDownloadUrl("");
      console.log("[upload] received:", data);
    } catch (e: any) {
      setMessage(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePreview() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_token: fileToken,
          column: selectedCol,
          regex,
          replacement,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const after = Array.isArray(data?.preview_after) ? data.preview_after : [];
      setPreview(after);
      setMessage("Preview updated.");
    } catch (e: any) {
      setMessage(e?.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCommit() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_token: fileToken, column: selectedCol, regex, replacement }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const url = typeof data?.download_url === "string" ? data.download_url : "";
      setDownloadUrl(url);
      setMessage(`Done. Download: ${url}`);
    } catch (e: any) {
      setMessage(e?.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  // use backend llm/template
  async function handleSuggest() {
    setSuggesting(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: nlInstruction, column: selectedCol }),

      });
      if (!res.ok) throw new Error(await res.text());

      // { regex, explanation, confidence, source }
      const data = await res.json();
      if (typeof data?.regex === "string") {
        setRegex(data.regex);
        setMessage(`Suggested by ${data.source} (confidence ${data.confidence ?? "?"}) — ${data.explanation || ""}`);
      } else {
        setMessage("No suggestion received.");
      }
    } catch (e: any) {
      setMessage(e?.message || "Suggest failed");
    } finally {
      setSuggesting(false);
    }
  }

  // Table headers: only compute when we actually have preview data
  const headerKeys: string[] =
    Array.isArray(preview) && preview.length > 0
      ? Object.keys(preview[0] ?? {})
      : [];

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Centered title */}
        <h1 className="text-2xl font-bold text-center">Regex Pattern Matching and Replacement</h1>

        {/* Upload block*/}
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-4">
          <div>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </div>
          {/* filename */}
          {uploadedFileName && (
            <div className="mt-2 text-sm text-gray-700">Selected file: {uploadedFileName}</div>
          )}
          {/* info appears after upload */}
          {fileToken ? (
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <div>file_token: {fileToken}</div>
              {Array.isArray(columns) && columns.length > 0 && (
                <div>columns: {columns.join(", ")}</div>
              )}
              <div>preview rows: {Array.isArray(preview) ? preview.length : 0}</div>
            </div>
          ) : null}
        </div>

        {/* LLM-> regex: show after user uploaded (has columns) */}
        {Array.isArray(columns) && columns.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 space-y-2">
            <label className="text-sm font-medium">Describe what to find (natural language):</label>
            <textarea
              className="w-full border rounded p-2 bg-white"
              rows={3}
              placeholder='e.g. "Find all emails" or "Mask phone numbers"'
              value={nlInstruction}
              onChange={(e) => setNlInstruction(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSuggest}
                className="rounded bg-blue-600 text-white px-3 py-1"
                disabled={suggesting || !nlInstruction}
              >
                {suggesting ? "Suggesting..." : "Suggest regex"}
              </button>
              <span className="text-xs text-gray-500 self-center">
                Tip: select a Column first for better suggestions.
              </span>
            </div>
          </div>
        )}

        {/* Rule inputs + actions */}
        {Array.isArray(columns) && columns.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm">Column:</label>
              <select
                value={selectedCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className="border rounded px-2 py-1 bg-white"
              >
                {(columns ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                className="border rounded px-2 py-1 flex-1 bg-white"
                placeholder="regex (e.g. ^.*$ to replace the whole cell)"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 bg-white"
                placeholder="replacement (e.g. REDACTED)"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
              />

              <button
                onClick={handlePreview}
                className="rounded bg-black text-white px-3 py-1"
                disabled={loading || !fileToken || !selectedCol || !regex}
              >
                Preview
              </button>
              <button
                onClick={handleCommit}
                className="rounded bg-green-600 text-white px-3 py-1"
                disabled={loading || !fileToken || !selectedCol || !regex}
              >
                Convert & Download
              </button>
            </div>

            {/* status */}
            <div className="text-sm text-gray-500">{loading ? "Working..." : message}</div>

            {/* download button only after successful conversion */}
            {downloadUrl && (
              <div className="mt-3">
                <a
                  href={toAbsDownloadUrl(downloadUrl)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:opacity-90"
                >
                  Download result.csv
                </a>
              </div>
            )}
          </div>
        )}

        {/* Preview table */}
        {headerKeys.length > 0 && Array.isArray(preview) && preview.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 overflow-auto">
            <table className="min-w-full text-sm bg-white">
              <thead>
                <tr>
                  {headerKeys.map((k) => (
                    <th key={k} className="border-b px-2 py-1 text-left">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {headerKeys.map((k) => (
                      <td key={k} className="border-b px-2 py-1">
                        {String((row as any)?.[k] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}