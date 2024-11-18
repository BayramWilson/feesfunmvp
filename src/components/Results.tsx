import React, { useState, useEffect } from 'react';
import ShareModal from './ShareModal';
import Rewards from './Rewards';
import Claim from './Claim';

interface ResultsProps {
  error: string | null;
  totalFees: number | null;
  transactionsProcessed: number;
  progress: string | null;
  dexFees: number | null;
  botFees: number | null;
  walletAddress: string;
}

type Tab = 'feeChecker' | 'rewards' | 'claim';

export default function Results({ 
  error, 
  totalFees, 
  transactionsProcessed, 
  progress, 
  dexFees, 
  botFees, 
  walletAddress 
}: ResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('feeChecker');
  const [showShareModal, setShowShareModal] = useState(false);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [hideBottomIcons, setHideBottomIcons] = useState(false);

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

  // Calculate the true total (all fees combined)
  const combinedTotal = (totalFees || 0) + (botFees || 0);

  return (
    <div className="p-[6px] rounded-lg bg-gradient-to-br from-solana-purple to-solana-green w-full 
      max-w-[95vw] 
      sm:max-w-[85vw] 
      md:max-w-[75vw] 
      lg:max-w-[65vw] 
      xl:max-w-4xl 
      mx-auto">
      <div className="bg-[#1A1A1A] rounded-lg backdrop-blur-sm font-mondwest w-full overflow-x-hidden">
        {/* Tabs inside the box */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('feeChecker')}
            className={`flex-1 py-1.5 sm:py-2 md:py-3 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg transition-colors
              ${activeTab === 'feeChecker' 
                ? 'text-white border-b-2 border-solana-green' 
                : 'text-gray-400 hover:text-gray-200'}`}
          >
            FeeChecker
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2 sm:py-4 px-4 sm:px-6 text-base sm:text-lg transition-colors
              ${activeTab === 'rewards' 
                ? 'text-white border-b-2 border-solana-green' 
                : 'text-gray-400 hover:text-gray-200'}`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`flex-1 py-2 sm:py-4 px-4 sm:px-6 text-base sm:text-lg transition-colors
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
                      <div className="text-white text-xl sm:text-2xl md:text-4xl font-mondwest">
                        You have lost
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl sm:text-4xl md:text-8xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                          {combinedTotal.toFixed(2)} SOL
                        </div>
                        <div className="text-xl sm:text-2xl md:text-4xl text-white font-mondwest">
                          (${(combinedTotal * solPrice).toFixed(2)})
                        </div>
                      </div>
                      <div className="text-2xl md:text-4xl text-white font-mondwest">
                        in fees to pumpfun and co
                      </div>
                    </div>

                    {/* DEX Fees Section */}
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="text-white text-lg sm:text-xl md:text-3xl font-mondwest">
                          You&apos;ve lost
                        </div>
                        <div className="text-lg sm:text-xl md:text-3xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                          {(dexFees || 0).toFixed(2)} SOL on PUMPFUN
                        </div>
                      </div>
                      <div className="text-base sm:text-lg md:text-2xl text-white font-mondwest">
                        Right now, that&apos;s $ {((dexFees || 0) * solPrice).toFixed(2)}
                      </div>
                    </div>

                    {/* Bot Fees Section */}
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="text-white text-xl md:text-3xl font-mondwest">
                          and
                        </div>
                        <div className="text-xl md:text-3xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                          {(botFees || 0).toFixed(2)} SOL on Bot Fees
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl text-white font-mondwest">
                        Right now, that&apos;s $ {((botFees || 0) * solPrice).toFixed(2)}
                      </div>
                    </div>

                   {/*  <div className="text-white text-lg">
                      Transactions processed: {transactionsProcessed}
                      {progress && <div className="text-gray-400">{progress}</div>}
                    </div> */}
                  </div>

                  {/* Buttons Container - now at the bottom */}
                  <div className="flex justify-between items-end mt-auto pt-8">
                    {/* Check Rewards button */}
                    <div className="w-[45%] rounded-lg p-[1px] sm:p-[2px] bg-gradient-to-br from-[#9945FF] to-[#14F195]">
                      <button 
                        onClick={() => setActiveTab('rewards')}
                        className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg rounded-lg bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition-colors"
                      >
                        Check Rewards
                      </button>
                    </div>

                    {/* Share section */}
                    <div className="text-right space-y-2 w-[45%]">
                      <div className="text-[#14F195] text-sm">
                        Share on X to eligible for rewards
                      </div>
                      <div className="rounded-lg p-[2px] bg-gradient-to-br from-[#9945FF] to-[#14F195]">
                        <button 
                          onClick={() => setShowShareModal(true)} 
                          className="w-full px-6 py-3 rounded-lg bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition-colors"
                        >
                          SHARE
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <Rewards setActiveTab={setActiveTab} setShowShareModal={setShowShareModal} />
          )}

          {activeTab === 'claim' && (
            <Claim />
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          totalFees={totalFees ?? 0}
          dexFees={dexFees ?? 0}
          botFees={botFees ?? 0}
          onClose={() => {
            setShowShareModal(false);
            setHideBottomIcons(false);
          }}
          solPrice={solPrice}
          scannedWallet={walletAddress}
          setHideBottomIcons={setHideBottomIcons}
        />
      )}
    </div>
  );
}