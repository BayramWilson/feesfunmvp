'use client';
import { useEffect, useState } from 'react';

export default function PumpFunRevenue() {
  const [displayRevenue, setDisplayRevenue] = useState<number>(210000000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <div className="p-3 rounded-lg bg-black/80">
      <div className="mb-4">
        <h2 className="text-xl font-mondwest text-white mb-2 text-center">PUMPFUN Revenue</h2>
        <div className="text-4xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text text-center">
          ${displayRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}