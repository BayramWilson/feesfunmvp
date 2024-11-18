'use client';
import { useEffect, useState } from 'react';

export default function DuneWatch() {
  const [jupiterRevenue, setJupiterRevenue] = useState<number | null>(null);
  const [photonFees, setPhotonFees] = useState<number | null>(null);
  const [displayRevenue, setDisplayRevenue] = useState<number>(0);
  const [targetRevenue, setTargetRevenue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDuneData() {
      try {
        const response = await fetch('/api/dune');
        const data = await response.json();
        const total = Number(data.jupiterRevenue || 0) + Number(data.photonFees || 0);
        
        setJupiterRevenue(Number(data.jupiterRevenue));
        setPhotonFees(Number(data.photonFees));
        setDisplayRevenue(Math.max(0, total - 100000000)); // Start 10M less
        setTargetRevenue(total);
      } catch (error) {
        console.error('Error fetching Dune data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDuneData();
  }, []);

  useEffect(() => {
    if (targetRevenue === null || displayRevenue === targetRevenue) return;

    const duration = 10000; // 10 seconds total
    const startTime = Date.now();
    let stepDuration = 100; // Start with 100ms intervals
    let currentMultiplier = 1;

    let timer: NodeJS.Timeout;
    const createInterval = () => {
      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const remaining = targetRevenue - displayRevenue;
        
        setDisplayRevenue(prev => {
          if (progress >= 1) {
            clearInterval(timer);
            return targetRevenue;
          }
          return prev + (remaining * 0.05 * currentMultiplier); // Increased to 5%
        });

        if ((Date.now() - startTime) % 2000 < stepDuration) {
          currentMultiplier *= 4; // Increased to 4x
          stepDuration = Math.max(stepDuration / 3, 1); // Changed to /3
          clearInterval(timer);
          createInterval();
        }
      }, stepDuration);
    };

    createInterval();
    return () => clearInterval(timer);
  }, [targetRevenue, displayRevenue]);

  if (isLoading) {
    return <div>Loading revenue data...</div>;
  }

  return (
    <div className="p-3 rounded-lg bg-black/80">
      <div className="mb-4">
        <h2 className="text-xl font-mondwest text-white mb-2 text-center">Total Trading Bot Revenue</h2>
        <div className="text-4xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text text-center">
          ${displayRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>

      
      {/* Rest of your component remains the same */}
    </div>
  );
}

