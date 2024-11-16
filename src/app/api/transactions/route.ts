import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const before = searchParams.get('before');
  const limit = searchParams.get('limit');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  let url = `https://pro-api.solscan.io/v2.0/account/transactions?address=${address}&limit=${limit || 40}`;
  if (before) {
    url += `&before=${before}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'token': process.env.SOLSCAN_TOKEN || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Solscan API error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('Failed to parse JSON:', text);
      return NextResponse.json(
        { error: 'Invalid JSON response from Solscan API' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}