import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint, payload } = body;

    // Security: Only logged-in users with a valid SaaS subscription should access this
    // We will hook this up to Firebase Admin SDK / PayPal subscription status later

    const cloudmersiveApiKey = process.env.CLOUDMERSIVE_API_KEY;
    if (!cloudmersiveApiKey) {
      return NextResponse.json({ error: 'Cloudmersive API key not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.cloudmersive.com/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': cloudmersiveApiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
