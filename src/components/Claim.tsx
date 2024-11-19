'use client';
import { useEffect, useState } from 'react';

export default function Claim() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2024-11-20T18:00:00Z');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial calculation

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center space-y-4 md:space-y-8">
      <h2 className="text-2xl md:text-4xl font-mondwest">
        <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          Claim will be available at
          <br />
          6PM UTC, 20/11/2024.
          <br />
          Please check back later.
        </span>
      </h2>
      <div className="p-[2px] rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] w-full max-w-[30rem] mx-auto">
        <div className="w-full h-40 md:h-60 rounded-lg overflow-hidden">
          <img
            src="/assets/web assets video/retardio.gif"
            alt="Retardio"
            className="w-full h-full object-fill"
          />
        </div>
      </div>
      <div className="p-[1px] rounded-md bg-gradient-to-r from-[#9945FF] to-[#14F195] w-full max-w-xs mx-auto">
        <div 
          className="w-full py-2 rounded-md font-mondwest text-lg md:text-xl bg-black text-white"
        >
          {`${timeLeft.days}d: ${timeLeft.hours}h: ${timeLeft.minutes}m: ${timeLeft.seconds}s`}
        </div>
      </div>
    </div>
  );
} 