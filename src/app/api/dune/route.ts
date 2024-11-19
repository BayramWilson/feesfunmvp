import { DuneClient } from '@duneanalytics/client-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Check if API key exists
    if (!process.env.DUNE_API_KEY) {
      console.error('DUNE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Dune API key not configured' },
        { status: 500 }
      );
    }

    const dune = new DuneClient(process.env.DUNE_API_KEY);
    
    // 2. Add error handling for each query
    try {
      const [jupiterResult, photonResult, lifetimeResult] = await Promise.all([
        dune.getLatestResult({ queryId: 2691008 }),
        dune.getLatestResult({ queryId: 3790088 }),
        dune.getLatestResult({ queryId: 3759856 })
      ]);
      
      // 3. Validate query results
      return NextResponse.json({
        jupiterRevenue: jupiterResult?.result?.rows?.[0]?.totalFeesUSD || 0,
        photonFees: photonResult?.result?.rows?.[0]?.lifetime_fees_usd || 0,
        lifetimeRevenue: lifetimeResult?.result?.rows?.[0]?.totalFeesUSD || 0,
        success: true
      });
    } catch (queryError) {
      console.error('Error fetching from Dune:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch data from Dune', details: (queryError as Error).message },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in Dune API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 