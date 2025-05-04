// app/api/analyze/route.ts
console.log('OpenAI key:', !!process.env.OPENAI_API_KEY);
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const form = await request.formData();
  const url = form.get('url')?.toString() ?? null;

  if (!url) {
    return NextResponse.json({ error: 'Missing listing URL' }, { status: 400 });
  }

  // Build a prompt for the AI
  const prompt = `
You are an expert real estate analyst. Given the listing URL below, provide:
1. Estimated fair market value vs. listing price
2. Expected monthly rental income
3. Approximate ROI percentage (rental yield)
4. Area risk factors (crime, flood, schools, etc.)
5. One-sentence investment recommendation

Listing URL: ${url}
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You analyze real estate listings.' },
                 { role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('OpenAI error', error);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
