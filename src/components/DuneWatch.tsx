'use client';
import { useEffect, useState } from 'react';

export default function DuneWatch() {
  const [displayRevenue, setDisplayRevenue] = useState<number>(490000000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDuneData() {
      try {
        const response = await fetch('/api/dune');
        const data = await response.json();
        console.log('DuneWatch API Response:', data);
        
        if (data.error) {
          console.error('DuneWatch API Error:', data.error);
          return;
        }

        const total = Number(data.jupiterRevenue || 0) + Number(data.photonFees || 0);
        console.log('Total Revenue Calculated:', total);
        
        setDisplayRevenue(total || 490000000); // Fallback to static value
      } catch (error) {
        console.error('Error fetching Dune data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDuneData();
  }, []);

  return (
    <div className="p-3 rounded-lg bg-black/80">
      <div className="mb-4">
        <h2 className="text-xl font-mondwest text-white mb-2 text-center">Total Trading Bot Revenue</h2>
        <div className="text-4xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text text-center">
          ${displayRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}

