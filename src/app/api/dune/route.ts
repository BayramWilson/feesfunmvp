import { DuneClient } from '@duneanalytics/client-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dune = new DuneClient(process.env.DUNE_API_KEY!);
    
    // Fetch both query results
    const [jupiterResult, photonResult] = await Promise.all([
      dune.getLatestResult({ queryId: 2691008 }),
      dune.getLatestResult({ queryId: 3790088 })
    ]);
    
    return NextResponse.json({
      jupiterRevenue: jupiterResult?.result?.rows?.[0]?.totalFeesUSD || 0,
      photonFees: photonResult?.result?.rows?.[0]?.lifetime_fees_usd || 0
    });
  } catch (error) {
    console.error('Error fetching Dune data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 