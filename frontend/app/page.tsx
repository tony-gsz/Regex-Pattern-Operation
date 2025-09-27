import Image from "next/image";

export default function Home() {

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Tailwind OK ✅</h1>
        <p className="mt-2 text-gray-600">
          This page uses Tailwind classes via <code>app/globals.css</code>.
        </p>
        <button className="mt-4 rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
          Test Button
        </button>
      </div>
    </main>
  );
}