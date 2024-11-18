import { useState, useEffect } from 'react';

export default function PumpFunRevenue() {
  const [displayRevenue, setDisplayRevenue] = useState<number>(0);
  const [targetRevenue, setTargetRevenue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPumpFunRevenue() {
      try {
        const response = await fetch('/api/pumpfun-revenue');
        const data = await response.json();
        const total = Number(data.totalRevenueUSD || 0);
        
        setDisplayRevenue(Math.max(0, total - 100000)); // Start animation from slightly lower
        setTargetRevenue(total);
      } catch (error) {
        console.error('Error fetching PUMPFUN revenue:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPumpFunRevenue();
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
          return prev + (remaining * 0.05 * currentMultiplier);
        });

        if ((Date.now() - startTime) % 2000 < stepDuration) {
          currentMultiplier *= 4;
          stepDuration = Math.max(stepDuration / 3, 1);
          clearInterval(timer);
          createInterval();
        }
      }, stepDuration);
    };

    createInterval();
    return () => clearInterval(timer);
  }, [targetRevenue, displayRevenue]);

  if (isLoading) {
    return <div className="text-white text-center">Loading PUMPFUN revenue...</div>;
  }

  return (
    <div className="p-3 rounded-lg bg-black/80">
      <h2 className="text-xl font-mondwest text-white mb-2 text-center">
        PUMPFUN Revenue
      </h2>
      <div className="text-4xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text text-center">    
        ${displayRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}