'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface FeeEntry {
  wallet: string;
  fee: number;
  rank: number;
}

// Function to truncate wallet address
const formatWalletAddress = (wallet: string) => {
  if (wallet.length <= 8) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
};

// Create Supabase client outside the component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<FeeEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const walletsPerPage = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Validate Supabase configuration
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Supabase configuration is missing');
        }

        const startRange = (currentPage - 1) * walletsPerPage;
        
        const { data, error: supabaseError } = await supabase
          .from('fees')
          .select('wallet, fee')
          .order('fee', { ascending: false })
          .range(startRange, startRange + walletsPerPage - 1);

        if (supabaseError) {
          throw supabaseError;
        }

        if (!data) {
          throw new Error('No data received from Supabase');
        }

        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: startRange + index + 1
        }));

        setLeaderboardData(rankedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="text-center text-white font-mondwest text-2xl p-8">
        Loading leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-mondwest text-xl p-8">
        <p>Error loading leaderboard:</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      <h2 className="text-2xl sm:text-3xl font-mondwest text-center mb-4 sm:mb-8 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
        Top Fee Payers
      </h2>
      
      {leaderboardData.length === 0 ? (
        <div className="text-center text-white font-mondwest text-xl">
          No leaderboard data available
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {leaderboardData.map((entry) => (
            <div 
              key={entry.wallet}
              className="flex items-center justify-between p-3 sm:p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <span className="text-lg sm:text-2xl font-mondwest text-[#14F195] w-6 sm:w-8 flex-shrink-0">
                  #{entry.rank}
                </span>
                <span className="text-sm sm:text-base font-mondwest text-white">
                  {formatWalletAddress(entry.wallet)}
                </span>
              </div>
              <span className="text-base sm:text-xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text ml-2 flex-shrink-0">
                {Number(entry.fee).toFixed(2)} SOL
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 sm:px-4 py-2 font-mondwest bg-[#2A2A2A] text-white text-sm sm:text-base rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white font-mondwest py-2 text-sm sm:text-base">
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={leaderboardData.length < walletsPerPage}
          className="px-3 sm:px-4 py-2 font-mondwest bg-[#2A2A2A] text-white text-sm sm:text-base rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
