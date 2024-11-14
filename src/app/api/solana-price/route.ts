import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SOL',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY!,
          'Accept': 'application/json'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOL price' },
      { status: 500 }
    );
  }
} 