import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  transactionsProcessed: number;
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ transactionsProcessed }: LoadingScreenProps) {
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
        
        {/* Transaction Counter */}
        <div className="text-center text-white text-lg">
          Processed {transactionsProcessed} transactions
        </div>
      </div>
    </div>
  );
} 