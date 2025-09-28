// "use client";
// import { useState } from "react";
// // backend api
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

// // File type
// type UploadFile = {
//   file_token: string;
//   columns: string[];
//   dataPreview: Record<string, any>[];
// };

// export default function HomePage() {

//   const [fileToken, setFileToken] = useState<string>("");
//   const [columns, setColumns] = useState<string[]>([]);
//   // preview data returned by backend
//   const [preview, setPreview] = useState<any[]>([]);
//   const [selectedCol, setSelectedCol] = useState<string>("");
//   const [regex, setRegex] = useState<string>("");
//   const [replacement, setReplacement] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [message, setMessage] = useState<string>("");

//   async function handleUpload(file: File) {
//     // upload to backend
//     setLoading(true); setMessage("");
//     const form = new FormData();
//     form.append("file", file);

//     try {
//       const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
//       if (!res.ok) throw new Error(await res.text());
//       const data: UploadFile = await res.json();
//       setFileToken(data.file_token);
//       setColumns(data.columns);
//       setPreview(data.dataPreview);
//       setSelectedCol(data.columns[0] || "");
//       setMessage("Upload success!");
//     } catch (e: any) {
//       setMessage(e?.message || "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handlePreview() {
//     // only replace n columns for preview
//     setLoading(true); setMessage("");
//     try {
//       const res = await fetch(`${API_BASE}/preview`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           file_token: fileToken,
//           column: selectedCol,
//           regex,
//           replacement
//         }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       // { preview_after: [...] }
//       const data = await res.json();
//       setPreview(data.preview_after || []);
//       setMessage("Preview updated.");
//     } catch (e: any) {
//       setMessage(e?.message || "Preview failed");
//     } finally {
//       setLoading(false);
//     }
//   }


//   async function handleConversion() {
//     // Replace all columns and return downlaod link
//     setLoading(true); setMessage("");
//     try {
//       const res = await fetch(`${API_BASE}/conversion`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           file_token: fileToken,
//           column: selectedCol,
//           regex,
//           replacement
//         }),
//       });

//       if (!res.ok) throw new Error(await res.text());
//       // { download_url: "xxx/result.csv" }
//       const data = await res.json();
//       setMessage(`Done. Download: ${data.download_url}`);
//     } catch (e: any) {
//       setMessage(e?.message || "Conversion failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen p-6 bg-gray-50">
//       <div className="mx-auto max-w-3xl space-y-6">
//         <h1 className="text-2xl font-bold">Regex Pattern Matching and Replacement</h1>

//         <div className="rounded-xl border bg-white p-4">
//           <input
//             type="file"
//             accept=".csv,.xlsx"
//             onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
//           />
//           {fileToken && (
//             <div className="mt-3 text-sm text-gray-600">file_token: {fileToken}</div>
//           )}
//         </div>

//         {columns.length > 0 && (
//           <div className="rounded-xl border bg-white p-4 space-y-3">
//             <div className="flex flex-wrap gap-3 items-center">
//               <label className="text-sm">Column:</label>
//               <select
//                 value={selectedCol}
//                 onChange={(e) => setSelectedCol(e.target.value)}
//                 className="border rounded px-2 py-1"
//               >
//                 {columns.map((c) => <option key={c} value={c}>{c}</option>)}
//               </select>

//               <input
//                 className="border rounded px-2 py-1 flex-1"
//                 placeholder="regex (e.g. \\d{3}-\\d{3}-\\d{4})"
//                 value={regex}
//                 onChange={(e) => setRegex(e.target.value)}
//               />
//               <input
//                 className="border rounded px-2 py-1"
//                 placeholder="replacement (e.g. REDACTED)"
//                 value={replacement}
//                 onChange={(e) => setReplacement(e.target.value)}
//               />
//               <button
//                 onClick={handlePreview}
//                 className="rounded bg-black text-white px-3 py-1"
//                 disabled={loading || !fileToken || !selectedCol || !regex}
//               >
//                 Preview
//               </button>
//               <button
//                 onClick={handleConversion}
//                 className="rounded bg-green-600 text-white px-3 py-1"
//                 disabled={loading || !fileToken || !selectedCol || !regex}
//               >
//                 Convert
//               </button>
//             </div>

//             <div className="text-sm text-gray-500">{loading ? "Working..." : message}</div>
//           </div>
//         )}

//         {preview.length > 0 && (
//           <div className="rounded-xl border bg-white p-4 overflow-auto">
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr>
//                   {Object.keys(preview[0]).map((k) => (
//                     <th key={k} className="border-b px-2 py-1 text-left">{k}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {preview.map((row, i) => (
//                   <tr key={i}>
//                     {Object.keys(preview[0]).map((k) => (
//                       <td key={k} className="border-b px-2 py-1">{String(row[k])}</td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }


"use client";
import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
// 自创常量：后端基础地址，来自 .env.local；没设走本地 8000

type UploadResp = {
  file_token?: string;                 // 改为可选，避免后端异常时炸
  columns?: string[];                  // 改为可选
  preview?: Record<string, unknown>[]; // 改为可选
};

export default function Home() {
  // 状态初始化都给“最安全”的默认值
  const [fileToken, setFileToken] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [regex, setRegex] = useState<string>("");
  const [replacement, setReplacement] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  // ====== 在状态区新增两个状态（放在其他 useState 附近）======
  const [nlInstruction, setNlInstruction] = useState<string>("");
  // 自创变量 nlInstruction：用户自然语言指令
  const [suggesting, setSuggesting] = useState<boolean>(false);
  // 自创变量 suggesting：正在调用 /suggest 的 loading

  function toAbsDownloadUrl(relative: string): string {
    // 再拼上后端返回的相对路径 /api/files/...
    const backendOrigin = API_BASE.replace(/\/api\/?$/, "");
    return `${backendOrigin}${relative}`;
  }

  async function handleUpload(file: File) {
    setLoading(true);
    setMessage("");
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data: UploadResp = await res.json();

      // —— 保守赋值：任何字段拿不到都给默认空值 —— //
      const nextToken = typeof data.file_token === "string" ? data.file_token : "";
      const nextCols = Array.isArray(data.columns) ? data.columns : [];
      const nextPreview = Array.isArray(data.preview) ? data.preview : [];

      setFileToken(nextToken);
      setColumns(nextCols);
      setPreview(nextPreview);
      // 如果有列名就默认选第一列，否则置空
      setSelectedCol(nextCols.length > 0 ? nextCols[0] : "");
      setMessage("Upload success.");
      console.log("[upload] received:", data); // 调试：看一眼实际结构
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
      // —— 同样防御：如果后端没给 preview_after，就用 [] —— //
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
    setLoading(true); setMessage("");
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
      setMessage(e?.message || "Commit failed");
    } finally {
      setLoading(false);
    }
  }

  // ====== 新增函数：调用后端 /api/suggest ======
  async function handleSuggest() {
    setSuggesting(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: nlInstruction, column: selectedCol }),
        // 自创入参 instruction/column：告诉后端我们要匹配哪一列、想做什么
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json(); // 期望 { regex, explanation, confidence, source }
      if (typeof data?.regex === "string") {
        setRegex(data.regex); // 关键：把建议的正则写回到 regex 输入框
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

  // —— 计算表头 keys：只有在 preview 是“非空数组”时才读取第 0 行 —— //
  const headerKeys: string[] =
    Array.isArray(preview) && preview.length > 0
      ? Object.keys(preview[0] ?? {})
      : []; // 自创变量 headerKeys：当前预览表头字段名列表

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Regex Pattern Tool (Student Edition)</h1>

        {/* 上传卡片 */}
        <div className="rounded-xl border bg-white p-4">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          {fileToken ? (
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <div>file_token: {fileToken}</div>
              {Array.isArray(columns) && columns.length > 0 && (
                <div>columns: {columns.join(", ")}</div>
              )}
              <div>Preview rows: {Array.isArray(preview) ? preview.length : 0}</div>
            </div>
          ) : null}
        </div>

        {/* ====== 自然语言转正则（新增）====== */}
        <div className="rounded-xl border bg-white p-4 space-y-2">
          <label className="text-sm font-medium">Describe what to find (natural language):</label>
          <textarea
            className="w-full border rounded p-2"
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

        {/* 规则输入区（只有 columns 有值才显示） */}
        {Array.isArray(columns) && columns.length > 0 && (
          <div className="rounded-xl border bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm">Column:</label>
              <select
                value={selectedCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {(columns ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="regex (e.g. ^.*$ to replace whole cell)"
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
                onClick={handleCommit}
                className="rounded bg-green-600 text-white px-3 py-1"
                disabled={loading || !fileToken || !selectedCol || !regex}
              >
                Commit
              </button>
            </div>

            {/* 状态提示 */}
            <div className="text-sm text-gray-500">{loading ? "Working..." : message}</div>

            {/* === 下载按钮：只有 commit 成功后（有 downloadUrl）才显示 === */}
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

        {/* 预览表格 */}
        {headerKeys.length > 0 && Array.isArray(preview) && preview.length > 0 && (
          <div className="rounded-xl border bg-white p-4 overflow-auto">
            <table className="min-w-full text-sm">
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