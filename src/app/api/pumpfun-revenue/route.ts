import { DuneClient } from '@duneanalytics/client-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dune = new DuneClient(process.env.DUNE_API_KEY!);
    
    // Fetch PUMPFUN revenue data
    const result = await dune.getLatestResult({ queryId: 3759856 });
    
    // Get the total revenue from the first row (most recent)
    const totalRevenueUSD = result?.result?.rows?.[0]?.total_revenue_usd || 0;
    
    return NextResponse.json({
      totalRevenueUSD,
      success: true
    });
  } catch (error) {
    console.error('Error fetching PUMPFUN revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PUMPFUN revenue data' },
      { status: 500 }
    );
  }
} 