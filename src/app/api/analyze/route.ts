// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(request: Request) {
  const form = await request.formData();
  const url = form.get('url')?.toString() ?? null;
  // (We’re not handling screenshots in this MVP)
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
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'system', content: 'You analyze real estate listings.' },
                 { role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const analysis = completion.data.choices[0].message?.content ?? '';
    return NextResponse.json({ analysis });
  } catch (e: any) {
    console.error('OpenAI error', e);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
