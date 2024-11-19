import { useEffect, useState, useContext, useRef } from 'react';
import { ViewContext } from '../context/ViewContext';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  transactionsProcessed: number;
}

export default function LoadingScreen({ onLoadingComplete, transactionsProcessed }: LoadingScreenProps) {
  const { setCurrentView, setHideBottomIcons } = useContext(ViewContext);
  const [percentage, setPercentage] = useState(0);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCurrentView('loading');
    setHideBottomIcons(false);
  }, [setCurrentView, setHideBottomIcons]);

  useEffect(() => {
    // First minute: progress to 80%
    const firstMinuteInterval = 100; // Update every 100ms
    const firstMinuteDuration = 60000; // 1 minute

    // After first minute: 2% per minute
    const laterMinutesInterval = 1000; // Update every second

    const updateProgress = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimeRef.current;

      setPercentage(prev => {
        // Don't update if we've already reached 100%
        if (prev >= 100) return prev;

        let newValue;
        
        if (elapsedTime <= firstMinuteDuration) {
          // First minute: progress to 80%
          newValue = Math.min((elapsedTime / firstMinuteDuration) * 80, 80);
        } else {
          // After first minute: add 2% per minute
          const additionalMinutes = (elapsedTime - firstMinuteDuration) / 60000;
          newValue = Math.min(80 + (additionalMinutes * 2), 100);
        }

        if (newValue >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          onLoadingComplete();
        }

        return newValue;
      });
    };

    // Start with more frequent updates in the first minute
    timerRef.current = setInterval(() => {
      updateProgress();
      
      // After first minute, switch to less frequent updates
      if (Date.now() - startTimeRef.current > firstMinuteDuration) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(updateProgress, laterMinutesInterval);
      }
    }, firstMinuteInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // Empty dependency array

  return (
    <div className="max-w-2xl w-full space-y-8 relative">
      <div className="rounded-lg overflow-hidden p-[2px] bg-gradient-to-br from-[#9945FF] to-[#14F195] relative">
        <div className="w-full h-auto rounded-lg text-center bg-black relative">
          <img
            src="/assets/rednut.png"
            alt="Red Nut"
            className="absolute top-[-24px] left-[-6px] w-48 h-48 z-50 hidden md:block"
          />
          
          <img
            src="/assets/bluenut.png"
            alt="Blue Nut"
            className="absolute bottom-[-60px] right-[-48px] w-48 h-48 z-50 hidden md:block"
          />

          <img 
            src="/assets/videos/loading_video.gif"
            alt="Loading Animation"
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="inline-block text-2xl font-mondwest bg-gradient-to-br from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          Checking your wallet... {Math.floor(percentage)}%
          
        </div>
        
        {transactionsProcessed >= 3000 ? (
          <div className="text-2xl font-mondwest bg-gradient-to-br from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
            Hold my hand...never gonna give you up nigga, almost through.
          </div>
        ) : transactionsProcessed >= 1000 && (
          <div className="text-2xl font-mondwest bg-gradient-to-br from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
            Oh boy that's a lot of transactions, I'm just an AI...gimme time to analyze your shitty wallet.
          </div>
        )}

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