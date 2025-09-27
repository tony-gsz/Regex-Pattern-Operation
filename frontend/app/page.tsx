"use client";
import { useState } from "react";
// backend api
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

// File type
type UploadFile = {
  file_token: string;
  columns: string[];
  dataPreview: Record<string, any>[];
};

export default function HomePage() {

  const [fileToken, setFileToken] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  // preview data returned by backend
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [regex, setRegex] = useState<string>("");
  const [replacement, setReplacement] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function handleUpload(file: File) {
    // upload to backend
    setLoading(true); setMessage("");
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data: UploadFile = await res.json();
      setFileToken(data.file_token);
      setColumns(data.columns);
      setPreview(data.dataPreview);
      setSelectedCol(data.columns[0] || "");
      setMessage("Upload success!");
    } catch (e: any) {
      setMessage(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePreview() {
    // only replace n columns for preview
    setLoading(true); setMessage("");
    try {
      const res = await fetch(`${API_BASE}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_token: fileToken,
          column: selectedCol,
          regex,
          replacement
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // { preview_after: [...] }
      const data = await res.json();
      setPreview(data.preview_after || []);
      setMessage("Preview updated.");
    } catch (e: any) {
      setMessage(e?.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  }


  async function handleConversion() {
    // Replace all columns and return downlaod link
    setLoading(true); setMessage("");
    try {
      const res = await fetch(`${API_BASE}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_token: fileToken,
          column: selectedCol,
          regex,
          replacement
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      // { download_url: "xxx/result.csv" }
      const data = await res.json();
      setMessage(`Done. Download: ${data.download_url}`);
    } catch (e: any) {
      setMessage(e?.message || "Commit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Regex Pattern Matching and Replacement</h1>

        <div className="rounded-xl border bg-white p-4">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          {fileToken && (
            <div className="mt-3 text-sm text-gray-600">file_token: {fileToken}</div>
          )}
        </div>

        {columns.length > 0 && (
          <div className="rounded-xl border bg-white p-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm">Column:</label>
              <select
                value={selectedCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="regex (e.g. \\d{3}-\\d{3}-\\d{4})"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1"
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
                onClick={handleConversion}
                className="rounded bg-green-600 text-white px-3 py-1"
                disabled={loading || !fileToken || !selectedCol || !regex}
              >
                Convert
              </button>
            </div>

            <div className="text-sm text-gray-500">{loading ? "Working..." : message}</div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="rounded-xl border bg-white p-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((k) => (
                    <th key={k} className="border-b px-2 py-1 text-left">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.keys(preview[0]).map((k) => (
                      <td key={k} className="border-b px-2 py-1">{String(row[k])}</td>
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