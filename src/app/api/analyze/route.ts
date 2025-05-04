// app/api/analyze/route.ts

import { NextResponse } from 'next/server';

// 1. Confirm we have a key
console.log('Hugging Face key loaded?', !!process.env.HF_API_KEY);

export async function POST(request: Request) {
  // 2. Read form data
  const form = await request.formData();
  const url = form.get('url')?.toString() || '';

  if (!url) {
    return NextResponse.json({ error: 'Missing listing URL' }, { status: 400 });
  }

  // 3. Build a simple prompt
  const prompt = `Analyze this real estate listing URL and provide:
1. Fair market value vs. listing price
2. Expected monthly rent
3. Approximate ROI %
4. Area risk factors
5. One-sentence recommendation

URL: ${url}
`;

  try {
    // 4. Call Hugging Face Inference endpoint
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/google/flan-t5-large',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfRes.ok) {
      console.error('HF error status', hfRes.status, await hfRes.text());
      return NextResponse.json(
        { error: 'Hugging Face API error' },
        { status: hfRes.status }
      );
    }

    const hfJson = await hfRes.json();
    // 5. Parse response format (community hosted models return an array of strings)
    const analysis = Array.isArray(hfJson)
      ? hfJson[0]?.generated_text || 'No analysis returned'
      : hfJson.generated_text || 'No analysis returned';

    // 6. Return the AI’s analysis
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Inference API error', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
