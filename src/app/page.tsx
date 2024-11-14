'use client';

import { useState, useRef } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { useRouter, useSearchParams } from 'next/navigation';
import Results from '@/components/Results';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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

  const calculateFees = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError(null);
    let totalFeesAccumulator = 0;
    let raydiumFeesAccumulator = 0;
    const startTime = Date.now();
    const TIME_LIMIT = 18000; // 1 minute in milliseconds
    const BATCH_SIZE = 40;
    let before: string | undefined = undefined;
    const processedTxs = new Set(); // Track unique transactions
    let retry = false; // Track if we should retry once

    // Actual program IDs for pump.fun and raydium
    const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
    const RAYDIUM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';

    try {
      while (true) {
        // Check if we've exceeded the time limit
        if (Date.now() - startTime > TIME_LIMIT) {
          console.log('Time limit reached, stopping pagination');
          setProgress('Time limit reached. Showing partial results.');
          break;
        }
        const solscanToken = process.env.NEXT_PUBLIC_SOLSCAN_TOKEN;
        if (!solscanToken) {
          throw new Error('Solscan API token is not configured');
        }
        const requestOptions = {
          method: "GET",
          headers: {
            "token": solscanToken || ''
          }
        } as const;

        // Construct URL with before parameter if available
        let url = `https://pro-api.solscan.io/v2.0/account/transactions?address=${encodeURIComponent(walletAddress)}&limit=${BATCH_SIZE}`;
        if (before) {
          url += `&before=${before}`;
        }
        console.log('Fetching URL:', url);

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.message || JSON.stringify(errorData.errors)}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (!data.success || !data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from Solscan');
        }

        // If no more transactions, handle retry logic
        if (data.data.length === 0) {
          if (retry) {
            console.log('No more transactions found after retry, stopping');
            break;
          } else {
            console.log('No more transactions found, waiting 5 seconds to retry');
            retry = true;
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
        }

        // Reset retry flag if transactions are found
        retry = false;

        // Process transactions in this batch
        for (const tx of data.data) {
          if (!processedTxs.has(tx.tx_hash)) {
            processedTxs.add(tx.tx_hash);
            const fee = tx.fee || 0;
            totalFeesAccumulator += fee;

            // Check if the transaction involves pump.fun or raydium
            if (tx.program_ids.includes(PUMP_FUN_PROGRAM_ID)) {
              raydiumFeesAccumulator += fee;
            } else if (tx.program_ids.includes(RAYDIUM_PROGRAM_ID)) {
              raydiumFeesAccumulator += fee;
            }
          }
        }

        // Update UI with progress
        setTotalFees(totalFeesAccumulator / 1e9);
        setTransactionsProcessed(processedTxs.size);
        setProgress(
          `Processing transactions... ${processedTxs.size} unique transactions found (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`
        );

        // If we got fewer transactions than the batch size, we've reached the end
        if (data.data.length < BATCH_SIZE) {
          console.log('Reached last batch of transactions');
          setProgress(`Completed! Processed ${processedTxs.size} unique transactions`);
          break;
        }

        // Get the signature of the last transaction for the next batch
        const lastTx = data.data[data.data.length - 1];
        before = lastTx.tx_hash; // Use the transaction signature instead of timestamp
        console.log('Next before signature:', before);

        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Final total fees:', totalFeesAccumulator / 1e9);
      console.log('Raydium fees:', raydiumFeesAccumulator / 1e9);
      console.log('Total unique transactions processed:', processedTxs.size);

      setDexFees((raydiumFeesAccumulator) / 1e9);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("Placeholder");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative font-mondwest">
      {/* Wallet Adapter - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
          {typeof window !== 'undefined' && (
            <WalletMultiButton className="px-4 py-2 text-base rounded-lg 
              bg-white/90 dark:bg-gray-800/90 hover:bg-gray-700/90
              transition-colors font-mondwest" />
          )}
        </div>
      </div>

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
            walletAddress={walletAddress}
          />
        </div>
      ) : (
        <div className="max-w-2xl w-full space-y-8 relative z-10">
          <h1 className="text-6xl font-bold text-center mb-4 font-mondwest bg-solana-gradient text-transparent bg-clip-text">
            Fees.Fun
          </h1>
          
          <h2 className="text-3xl font-bold text-center mb-8 font-mondwest bg-gradient-to-r from-purple-500 via-blue-400 to-green-500 text-transparent bg-clip-text">
            Check How Many You Have Been Paying?
          </h2>

          {/* Input field with both buttons */}
          <div className="relative">
            <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <div className="flex">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="flex-1 px-6 py-4 text-lg rounded-l-lg 
                           bg-white/90 dark:bg-gray-800/90 font-mondwest"
                />
                <div className="flex gap-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-r-lg">
                  <button
                    onClick={handleSearch}
                    disabled={!walletAddress || loading}
                    className="px-6 py-2 bg-solana-green text-gray-900 rounded-lg
                             hover:bg-[#0DD584] disabled:bg-solana-green/50 
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
              walletAddress={walletAddress}
            />
          )}

          {/* Social Media Icons */}
          <div className="flex justify-center gap-6">
            <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                <img 
                  src="/assets/socials/icons8-twitterx.svg" 
                  alt="Twitter" 
                  className="w-6 h-6 brightness-0 invert"
                />
              </a>
            </div>
            <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                <img 
                  src="/assets/socials/icons8-telegram-app.svg" 
                  alt="Telegram" 
                  className="w-6 h-6 brightness-0 invert"
                />
              </a>
            </div>
            <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                <img 
                  src="/assets/socials/icons8-discord.svg" 
                  alt="Discord" 
                  className="w-6 h-6 brightness-0 invert"
                />
              </a>
            </div>
          </div>

          {/* Token Address Box */}
          <div className="relative max-w-xl mx-auto mt-12">
            <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
              <div className="w-full px-6 py-4 text-lg rounded-lg 
                              bg-white/90 dark:bg-gray-800/90 pr-32 flex items-center font-mondwest">
                <span className="text-gray-600 dark:text-gray-400 mr-2">Token Address:</span>
                <span className="text-gray-800 dark:text-gray-200">Placeholder</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="absolute right-1 top-1/2 transform -translate-y-1/2
                           bg-[#14F195] text-gray-900 px-3 py-1 rounded-lg text-sm
                           hover:bg-[#0DD584] transition-colors font-mondwest"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
