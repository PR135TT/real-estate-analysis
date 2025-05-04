// app/api/analyze/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const form = await request.formData();
  const url = form.get('url')?.toString() || '';
  if (!url) {
    return NextResponse.json({ error: 'Missing listing URL' }, { status: 400 });
  }

  const prompt = `
You are an expert real estate analyst. For each point below, write 3–5 sentences in a paragraph:
1. Fair market value vs. listing price
2. Expected monthly rent
3. Approximate ROI percentage
4. Area risk factors
5. One-sentence investment recommendation

URL: ${url}
`.trim();

  try {
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/google/flan-t5-large',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,    // allow up to 512 new tokens :contentReference[oaicite:7]{index=7}
            do_sample: true,        // enable sampling for varied output :contentReference[oaicite:8]{index=8}
            num_beams: 2            // use beam search for richer text :contentReference[oaicite:9]{index=9}
          }
        }),
      }
    );

    if (!hfRes.ok) {
      console.error('HF error status', hfRes.status, await hfRes.text());
      return NextResponse.json({ error: 'Hugging Face API error' }, { status: hfRes.status });
    }

    const hfJson = await hfRes.json();
    const analysis = Array.isArray(hfJson)
      ? hfJson[0]?.generated_text || 'No analysis returned'
      : hfJson.generated_text || 'No analysis returned';

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Inference API error', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
