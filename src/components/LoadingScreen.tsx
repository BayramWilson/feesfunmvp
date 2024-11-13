import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  transactionsProcessed: number;
}

export default function LoadingScreen({ onLoadingComplete, transactionsProcessed }: LoadingScreenProps) {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    // Update progress based on transactions processed
    if (transactionsProcessed > 0) {
      setProgressPercentage(Math.min((transactionsProcessed / 100) * 100, 100));
    }
  }, [transactionsProcessed]);

  return (
    <div className="max-w-2xl w-full space-y-8 relative z-10">
      {/* GIF Container */}
      <div className="rounded-lg overflow-hidden bg-gray-800/80 p-4">
        <div className="w-full h-auto rounded-lg text-center p-8">
          <img 
            src="/assets/videos/TRUMP VIDEO/trump.gif"
            alt="Loading Animation"
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-white">
          <span className="text-xl">Checking your wallet...</span>
          <span className="text-xl">{transactionsProcessed} transactions</span>
        </div>
        
        {/* Transaction Counter (replacing Progress Bar) */}
        <div className="text-center text-white text-lg">
          Processed {transactionsProcessed} transactions
        </div>

        {/* Progress Text */}
        {progress && (
          <p className="text-center text-white text-lg mt-2">
            {progress}
          </p>
        )}
      </div>
    </div>
  );
} 