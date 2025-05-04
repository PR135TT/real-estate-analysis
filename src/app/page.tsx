// app/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import Spinner from './components/Spinner';  // we'll create this next

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (url) formData.append('url', url);
    if (file) formData.append('screenshot', file);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    setResult(json.analysis);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Real Estate Listing Analyzer</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Listing URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.zillow.com/..."
            className="w-full border rounded p-2 focus:ring focus:ring-indigo-200"
            required={!file}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Or Upload Screenshot</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full"
            required={!url}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Spinner /> : 'Analyze Listing'}
        </button>
      </form>

      {result && (
        <section className="w-full max-w-xl mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </section>
      )}
    </main>
  );
}
