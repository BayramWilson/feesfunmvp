import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tx = searchParams.get('tx');

  if (!tx) {
    return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://pro-api.solscan.io/v2.0/transaction/actions?tx=${tx}`,
      {
        headers: {
          'token': process.env.SOLSCAN_TOKEN || '',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  }
}