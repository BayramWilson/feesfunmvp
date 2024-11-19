'use client';

import { useState, useRef, useContext, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { useRouter, useSearchParams } from 'next/navigation';
import Results from '@/components/Results';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ViewContext } from '@/context/ViewContext';
import DuneWatch from '@/components/DuneWatch';
import PumpFunRevenue from '@/components/PumpFunRevenue';
import Leaderboard from '@/components/Leaderboard';
import CheckCachedResults from '@/components/CheckCachedResults';

const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const RAYDIUM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

/* eslint-disable @typescript-eslint/no-unused-vars */

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [totalFees, setTotalFees] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionsProcessed, setTransactionsProcessed] = useState(0);
  const [progress, setProgress] = useState<string | null>(null);
  const [dexFees, setDexFees] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page');
  const [showingResults, setShowingResults] = useState(false);
  const [botFees, setBotFees] = useState<number | null>(null);
  const { setCurrentView, setHideBottomIcons } = useContext(ViewContext);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    setHideBottomIcons(true);
    return () => setHideBottomIcons(false);
  }, [setHideBottomIcons]);

  const calculateFees = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError(null);
    let totalFeesAccumulator = 0;
    let raydiumFeesAccumulator = 0;
    let botFeesAccumulator = 0;
    const startTime = Date.now();
    const TIME_LIMIT = 600000; // 10 minutes

    const BATCH_SIZE = 40;
    let before: string | undefined = undefined;
    const processedTxs = new Set();
    let retryCount = 0;
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 5000; // 5 seconds

    let consecutiveEmptyBatches = 0;
    const MAX_CONSECUTIVE_EMPTY = 3;

    try {
      while (true) {
        // Check time limit
        if (Date.now() - startTime > TIME_LIMIT) {
          console.log('Time limit reached, stopping pagination');
          setProgress('Time limit reached. Showing partial results.');
          break;
        }

        // Fetch transaction list
        const solscanToken = process.env.NEXT_PUBLIC_SOLSCAN_TOKEN;
        if (!solscanToken) {
          throw new Error('Solscan API token is not configured');
        }
        const requestOptions = {
          method: "GET",
          headers: { "token": solscanToken }
        };

        let url = `https://pro-api.solscan.io/v2.0/account/transactions?address=${encodeURIComponent(walletAddress)}&limit=${BATCH_SIZE}`;
        if (before) {
          url += `&before=${before}`;
        }

        const response = await fetch(url, requestOptions);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.message || JSON.stringify(errorData.errors)}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from Solscan');
        }

        // Handle empty data with retries
        if (data.data.length === 0) {
          if (retryCount >= MAX_RETRIES) {
            console.log(`No more transactions found after ${MAX_RETRIES} retries, stopping`);
            break;
          }

          retryCount++;
          console.log(`No transactions found, waiting ${RETRY_DELAY/1000} seconds for retry attempt ${retryCount}`);
          setProgress(`No new transactions found. Retry attempt ${retryCount} of ${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }

        // Reset retry counter if we found transactions
        retryCount = 0;

        // Process transactions in this batch
        for (const tx of data.data) {
          if (!processedTxs.has(tx.tx_hash)) {
            processedTxs.add(tx.tx_hash);
            const fee = tx.fee || 0;
            totalFeesAccumulator += fee;

            // Check if transaction involves either pump.fun or raydium
            if (tx.program_ids.includes(PUMP_FUN_PROGRAM_ID) || tx.program_ids.includes(RAYDIUM_PROGRAM_ID)) {
              // Track DEX fees separately
              raydiumFeesAccumulator += fee;

              // Only calculate additional bot fees for pump.fun transactions
              if (tx.program_ids.includes(PUMP_FUN_PROGRAM_ID)) {
                const txDetailsUrl = `https://pro-api.solscan.io/v2.0/transaction/actions?tx=${tx.tx_hash}`;
                const txResponse = await fetch(txDetailsUrl, requestOptions);
                const txData = await txResponse.json();

                if (txData.success && txData.data.transfers) {
                  // Filter only outgoing SOL transfers from the wallet
                  const solTransfers = txData.data.transfers
                    .filter((t: any) => {
                      return t.token_address === 'So11111111111111111111111111111111111111111' && 
                             t.source_owner === walletAddress &&
                             t.amount > 0;
                    })
                    .map((t: any) => ({
                      amount: t.amount / 1e9,
                      destination: t.destination_owner
                    }));

                  if (solTransfers.length > 1) {
                    // Sort transfers in descending order
                    solTransfers.sort((a: any, b: any) => b.amount - a.amount);
                    
                    // Sum all transfers except the largest one
                    const smallerTransfers = solTransfers.slice(1);
                    const txBotFees = smallerTransfers.reduce((sum: number, t: any) => sum + t.amount, 0);
                    
                    botFeesAccumulator += txBotFees;
                  }
                }
              }
            }
          }
        }

        // Update UI
        setTotalFees(totalFeesAccumulator / 1e9);
        setDexFees(botFeesAccumulator);
        setBotFees(raydiumFeesAccumulator / 1e9);
        setTransactionsProcessed(processedTxs.size);
        setProgress(
          `Processing transactions... ${processedTxs.size} unique transactions found (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`
        );

        // Modified pagination handling
        if (data.data.length < BATCH_SIZE) {
          console.log('Potentially reached last batch, attempting retry');
          
          if (consecutiveEmptyBatches >= MAX_CONSECUTIVE_EMPTY) {
            console.log('Reached last batch after maximum retries');
            setProgress(`Completed! Processed ${processedTxs.size} unique transactions`);
            break;
          }

          consecutiveEmptyBatches++;
          console.log(`Retry attempt ${consecutiveEmptyBatches} of ${MAX_CONSECUTIVE_EMPTY}`);
          setProgress(`Checking for more transactions... Retry ${consecutiveEmptyBatches} of ${MAX_CONSECUTIVE_EMPTY}`);
          
          // Wait 5 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        // Reset consecutive empty batches if we got data
        consecutiveEmptyBatches = 0;

        // Update before value for next iteration
        const lastTx = data.data[data.data.length - 1];
        before = lastTx.tx_hash;

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Final total fees:', totalFeesAccumulator / 1e9);
      console.log('Raydium fees:', raydiumFeesAccumulator / 1e9);
      console.log('Bot fees:', botFeesAccumulator);
      console.log('Total unique transactions processed:', processedTxs.size);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("9dELs5mcif6jBgVxr81hN4rvBvXkybMZCx8TfuZLpump");
      // Optionally add some feedback that copying worked
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSearch = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    setIsLoading(true);
    setTransactionsProcessed(0);
    setProgress(null);
    
    await calculateFees();
    
    setShowingResults(true);
    setIsLoading(false);
  };

  // Update view when components change
  const handleWalletSubmit = () => {
    setCurrentView('loading');
    // ... rest of your submit logic
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative font-mondwest">
      {/* Remove or hide the wallet adapter here */}
      {/* <div className="fixed top-4 right-4 z-50">
        <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
          {typeof window !== 'undefined' && (
            <WalletMultiButton ... />
          )}
        </div>
      </div> */}

      {/* Hidden video element to help bypass autoplay restrictions */}
      <video 
        playsInline 
        autoPlay 
        muted 
        className="hidden"
      >
        <source src="/assets/music/Rick Astley - Never Gonna Give You Up (Official Music Video) [dQw4w9WgXcQ].mp3" type="audio/mpeg" />
      </video>

      {/* Main audio element */}
      <audio
        ref={audioRef}
        autoPlay
        loop
      >
        <source src="/assets/music/Rick Astley - Never Gonna Give You Up (Official Music Video) [dQw4w9WgXcQ].mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Music toggle button */}
      <button
        onClick={() => {
          if (audioRef.current) {
            if (isMusicPlaying) {
              audioRef.current.pause();
            } else {
              audioRef.current.play();
            }
            setIsMusicPlaying(!isMusicPlaying);
          }
        }}
        className="fixed bottom-4 right-4 z-50 bg-gray-800/80 hover:bg-gray-700/80 
                   text-white rounded-full p-3 transition-colors"
      >
        {isMusicPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Local video background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          style={{ filter: 'brightness(0.5)' }}
        >
          <source src="/assets/videos/output.webm" type="video/webm" />
        </video>
      </div>

      {/* Add Leaderboard Button near the top */}
{/*       <div className="fixed top-4 z-50">
        <div className="p-[1px] rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195]">
         <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-6 py-2 rounded-lg bg-black hover:bg-gray-900 transition-colors font-mondwest text-white"
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </button>
        </div>
      </div> */}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl p-4 md:p-8">
            {/* Close button */}
            <button
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-2 right-2 p-2 text-white hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Leaderboard Component */}
            <Leaderboard />
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingScreen 
          onLoadingComplete={() => setIsLoading(false)}
          transactionsProcessed={transactionsProcessed}
        />
      ) : showingResults ? (
        <div className="max-w-4xl w-full space-y-8 relative z-10">
          <Results 
            error={error}
            totalFees={totalFees}
            transactionsProcessed={transactionsProcessed}
            progress={progress}
            dexFees={dexFees}
            botFees={botFees}
            walletAddress={walletAddress}
          />
        </div>
      ) : (
        <div className="max-w-2xl w-full space-y-8 relative z-10 text-center">
          <div className="flex flex-col items-center">
            <img 
              src="/assets/logo_chipz.png" 
            alt="Fees.Fun" 
            className="mx-auto w-[200px] sm:w-[250px] md:w-[300px] h-auto px-2" 
            />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-0 mb-4 font-mondwest bg-solana-gradient text-transparent bg-clip-text">
            Fees.Fun
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 font-mondwest bg-gradient-to-r from-purple-500 via-blue-400 to-green-500 text-transparent bg-clip-text">
            Degening Is Fun, Check How Much FeesYou Have Lost on PumpFun And Co And Get Your Reward!
          </h2>
          </div>

          {/* Search Input and Buttons */}
          <div className="relative max-w-2xl w-full">
            <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <div className="flex flex-col sm:flex-row">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="flex-1 px-4 py-3 text-base sm:text-lg rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none
                           bg-white/90 dark:bg-gray-800/90 font-mondwest"
                />
                <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none">
              {/*     <CheckCachedResults 
                    walletToCheck={walletAddress}
                    onResultsFound={(results) => {
                      setTotalFees(results.total_fees);
                      setDexFees(results.dex_fees);
                      setBotFees(results.bot_fees);
                      setTransactionsProcessed(results.transactions_count);
                      setShowingResults(true);
                    }}
                    className="w-full sm:w-auto md:px-6 md:py-2 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg 
                              hover:bg-[#3A3A3A] transition-colors disabled:opacity-50"
                  /> */}
                  <button
                    onClick={handleSearch}
                    disabled={!walletAddress || loading}
                    className="w-full sm:w-auto md:px-6 md:py-2 px-4 py-2 text-sm sm:text-base md:text-lg 
                             bg-solana-green text-gray-900 rounded-lg hover:bg-[#0DD584] disabled:bg-solana-green/50 
                             transition-colors font-mondwest"
                  >
                    {loading ? 'Calculating...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {(error || totalFees !== null) && (
            <Results 
              error={error}
              totalFees={totalFees}
              transactionsProcessed={transactionsProcessed}
              progress={progress}
              dexFees={dexFees}
              botFees={botFees}
              walletAddress={walletAddress}
            />
          )}

          {/* Token Address Box */}
          <div className="relative max-w-2xl w-full mt-8">
            <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400">
              <div className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg 
                            bg-black pr-32 flex items-center font-mondwest">
                <span className="text-gray-400 mr-2">Token Address:</span>
                <span className="text-gray-200">Placeholder</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="absolute right-3 top-1/2 transform -translate-y-1/2
                         px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-sm sm:text-base md:text-lg 
                         bg-solana-green text-gray-900 rounded-lg
                         hover:bg-[#0DD584] disabled:bg-solana-green/50 
                         transition-colors font-mondwest"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Social Media Icons - Now before Powered By */}
          <div className="flex justify-center gap-6 mt-8">
            <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <a href="https://jup.ag/swap/SOL-9dELs5mcif6jBgVxr81hN4rvBvXkybMZCx8TfuZLpump" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                <img 
                  src="/assets/socials/Token-64x64.svg" 
                  alt="Token" 
                  className="w-6 h-6"
                />
              </a>
            </div>
            <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <a href="https://dexscreener.com/solana/bxf1haw9w4nvhg83hjghwvy8hdjbjafnkb81knpfbvtz" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                <img 
                  src="/assets/socials/dex-screener-seeklogo.svg" 
                  alt="DexScreener" 
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>

          {/* Logo Grid - Last */}
          <div className="w-full mt-8">
            <h3 className="text-lg sm:text-xl font-mondwest mb-4 text-white text-center">
              Powered by:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {[
                '/assets/newlogos/BBqyuDPm_400x400.png',
                '/assets/newlogos/bullx.png',
                '/assets/newlogos/image 29 1.png',
                '/assets/newlogos/image 31.png',
                '/assets/newlogos/image 40.png',
                '/assets/newlogos/image 41.png',
                '/assets/newlogos/Logomark - White Padded.png',
                '/assets/newlogos/Magic200.png'
              ].map((logo, index) => (
                <div 
                  key={index} 
                  className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400"
                >
                  <div className="bg-black rounded-lg p-4 h-full flex items-center justify-center">
                    <img 
                      src={logo} 
                      alt={logo.split('/').pop()?.replace(/\.(png|webp)$/, '') || 'Partner Logo'} 
                      className="w-full h-12 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add DuneWatch below logos */}
          <div className=" grid grid-cols-1 md:grid-cols-2 justify-center gap-1 mt-8">
            <DuneWatch />
            <PumpFunRevenue />
          </div>
        </div>
      )}
    </div>
  );
}