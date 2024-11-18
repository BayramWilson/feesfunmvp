'use client';
import { useEffect, useState } from 'react';

export default function DuneWatch() {
  const [jupiterRevenue, setJupiterRevenue] = useState<number | null>(null);
  const [photonFees, setPhotonFees] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDuneData() {
      try {
        const response = await fetch('/api/dune');
        const data = await response.json();
        if (data.jupiterRevenue) {
          setJupiterRevenue(Number(data.jupiterRevenue));
        }
        if (data.photonFees) {
          setPhotonFees(Number(data.photonFees));
        }
        // Calculate total revenue
        const total = Number(data.jupiterRevenue || 0) + Number(data.photonFees || 0);
        setTotalRevenue(total);
      } catch (error) {
        console.error('Error fetching Dune data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDuneData();
  }, []);

  if (isLoading) {
    return <div>Loading revenue data...</div>;
  }

  return (
    <div className="p-4 rounded-lg bg-black/80">
      <div className="mb-4">
        <h2 className="text-xl font-mondwest text-white mb-2">Total Trading Bot Revenue</h2>
        <div className="text-3xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          ${totalRevenue ? totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0.00'}
        </div>
      </div>
 {/*      
      <div className="mb-4">
        <h2 className="text-xl font-mondwest text-white mb-2">Jupiter Lifetime Revenue</h2>
        <div className="text-2xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          ${jupiterRevenue ? jupiterRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0.00'}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-mondwest text-white mb-2">Photon Lifetime Fees</h2>
        <div className="text-2xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          ${photonFees ? photonFees.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0.00'}
        </div>
      </div> */}
    </div>
  );
}
