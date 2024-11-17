import { useEffect, useState, useContext } from 'react';
import { ViewContext } from '../context/ViewContext';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  transactionsProcessed: number;
}

export default function LoadingScreen({ onLoadingComplete, transactionsProcessed }: LoadingScreenProps) {
  const { setCurrentView } = useContext(ViewContext);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    setCurrentView('loading');
  }, []);

  useEffect(() => {
    const duration = 600000;
    const interval = 100;
    const steps = duration / interval;
    const incrementPerStep = 100 / steps;
    
    const timer = setInterval(() => {
      setPercentage(prev => {
        const newValue = Math.min(prev + incrementPerStep, 100);
        if (newValue >= 100) {
          clearInterval(timer);
          onLoadingComplete();
        }
        return newValue;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="max-w-2xl w-full space-y-8 relative">
      <div className="rounded-lg overflow-hidden p-[2px] bg-gradient-to-br from-[#9945FF] to-[#14F195] relative">
        <div className="w-full h-auto rounded-lg text-center bg-black relative">
          <img
            src="/assets/rednut.png"
            alt="Red Nut"
            className="absolute top-[-24px] left-[-6px] w-48 h-48 z-50"
          />
          
          <img
            src="/assets/bluenut.png"
            alt="Blue Nut"
            className="absolute bottom-[-60px] right-[-48px] w-48 h-48 z-50"
          />

          <img 
            src="/assets/videos/TRUMP VIDEO/trump.gif"
            alt="Loading Animation"
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="inline-block text-2xl font-mondwest bg-gradient-to-br from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          Checking your wallet... {Math.floor(percentage)}%
          {transactionsProcessed > 0 && ` (${transactionsProcessed} transactions found)`}
        </div>

        <div className="w-full h-8 rounded-full p-[1px] bg-gradient-to-r from-[#9945FF] to-[#14F195]">
          <div className="w-full h-full bg-gray-800 rounded-full">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 