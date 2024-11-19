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
    
    // 2. Add better error handling and logging
    try {
      console.log('Fetching PUMPFUN revenue data...');
      const result = await dune.getLatestResult({ queryId: 3759856 });
      console.log('Dune API Response:', result);
      
      // 3. Validate the response
      if (!result?.result?.rows?.[0]) {
        console.error('Invalid response format from Dune');
        return NextResponse.json(
          { error: 'Invalid response format' },
          { status: 500 }
        );
      }

      const totalRevenueUSD = result.result.rows[0].total_revenue_usd || 0;
      console.log('Total Revenue USD:', totalRevenueUSD);

      return NextResponse.json({
        totalRevenueUSD,
        success: true
      });
    } catch (queryError) {
      console.error('Dune query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch data from Dune' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PumpFun revenue API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PUMPFUN revenue data' },
      { status: 500 }
    );
  }
} 