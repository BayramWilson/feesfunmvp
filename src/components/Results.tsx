import React, { useState, useEffect } from 'react';
import ShareModal from './ShareModal';

interface ResultsProps {
  error: string | null;
  totalFees: number | null;
  transactionsProcessed: number;
  progress: string | null;
  dexFees: number | null;
  walletAddress: string;
}

type Tab = 'feeChecker' | 'rewards' | 'claim';

export default function Results({ 
  error, 
  totalFees, 
  transactionsProcessed, 
  progress, 
  dexFees, 
  walletAddress 
}: ResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('feeChecker');
  const [showShareModal, setShowShareModal] = useState(false);
  const [solPrice, setSolPrice] = useState<number>(0);

  const fetchSolPrice = async () => {
    try {
      const response = await fetch('/api/solana-price');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const solPrice = data.data?.SOL?.quote?.USD?.price;
      
      if (typeof solPrice !== 'number') {
        throw new Error('Invalid price data received');
      }
      
      setSolPrice(solPrice);
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      setSolPrice(0);
    }
  };

  useEffect(() => {
    fetchSolPrice();
  }, []);

  return (
    <div className="p-[6px] rounded-lg bg-gradient-to-br from-solana-purple to-solana-green">
      <div className="bg-[#1A1A1A] rounded-lg backdrop-blur-sm font-mondwest w-full">
        {/* Tabs inside the box */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('feeChecker')}
            className={`flex-1 py-4 px-6 text-lg transition-colors
              ${activeTab === 'feeChecker' 
                ? 'text-white border-b-2 border-solana-green' 
                : 'text-gray-400 hover:text-gray-200'}`}
          >
            FeeChecker
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-4 px-6 text-lg transition-colors
              ${activeTab === 'rewards' 
                ? 'text-white border-b-2 border-solana-green' 
                : 'text-gray-400 hover:text-gray-200'}`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`flex-1 py-4 px-6 text-lg transition-colors
              ${activeTab === 'claim' 
                ? 'text-white border-b-2 border-solana-green' 
                : 'text-gray-400 hover:text-gray-200'}`}
          >
            Claim
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-[600px] flex flex-col">
          {activeTab === 'feeChecker' && (
            <div className="flex flex-col h-full">
              {error && (
                <div className="text-center space-y-4">
                  <div className="text-red-500 text-xl font-mondwest">
                    {error}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#2A2A2A] text-white rounded-lg 
                              hover:bg-[#3A3A3A] transition-colors border-[6px] 
                              border-[#1A1A1A] font-mondwest"
                  >
                    Try Another Wallet
                  </button>
                </div>
              )}

              {totalFees !== null && (
                <>
                  {/* Main Content */}
                  <div className="flex-grow space-y-8 text-left">
                    <div className="space-y-2">
                      <div className="text-white text-4xl font-mondwest">
                        You have lost
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-8xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                          {totalFees.toFixed(2)} SOL
                        </div>
                        <div className="text-4xl text-white font-mondwest">
                          (${(totalFees * solPrice).toFixed(2)})
                        </div>
                      </div>
                      <div className="text-4xl text-white font-mondwest">
                        in fees to pumpfun and co
                      </div>
                    </div>

                    <div className="space-y-2 text-center">
                      <div className="text-white text-5xl font-mondwest">
                        You've lost
                      </div>
                      <div className="text-5xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                        {dexFees ? dexFees.toFixed(2) : "0.00"} SOL on PUMPFUN
                      </div>
                      <div className="text-5xl text-white font-mondwest">
                        Right now, that&apos;s $ {(dexFees ? dexFees * solPrice : 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Buttons Container - now at the bottom */}
                  <div className="flex justify-between items-end mt-auto pt-8">
                    {/* Left Button */}
                    <button
                      className="w-[45%] px-6 py-3 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors border-[6px] border-[#1A1A1A]"
                      onClick={() => setActiveTab('rewards')}
                    >
                      Check Rewards
                    </button>

                    {/* Right Side Container */}
                    <div className="text-right space-y-2 w-[45%]">
                      <div className="text-[#14F195] text-sm">
                        Share on X to eligible for rewards
                      </div>
                      <button
                        className="w-full rounded-lg p-[6px] bg-gradient-to-br from-[#9945FF] to-[#14F195] hover:opacity-90 transition-opacity"
                        onClick={() => setShowShareModal(true)}
                      >
                        <span className="block w-full px-6 py-3 rounded-lg bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition-colors">
                          SHARE
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="text-center text-gray-400 pt-12">
              Rewards feature coming soon...
            </div>
          )}

          {activeTab === 'claim' && (
            <div className="text-center text-gray-400 pt-12">
              Claim feature coming soon...
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          totalFees={totalFees ?? 0}
          dexFees={dexFees ?? 0}
          onClose={() => setShowShareModal(false)}
          solPrice={solPrice}
          scannedWallet={walletAddress}
        />
      )}
    </div>
  );
}
