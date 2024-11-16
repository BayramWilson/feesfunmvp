'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Claim from './Claim';
import { useRouter } from 'next/navigation';

interface RewardsProps {
  setActiveTab: (tab: 'feeChecker' | 'rewards' | 'claim') => void;
  setShowShareModal: (show: boolean) => void;
}

export default function Rewards({ setActiveTab, setShowShareModal }: RewardsProps) {
  const { connected, publicKey } = useWallet();
  const [isChecking, setIsChecking] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState('check');
  const router = useRouter();

  const checkEligibility = async () => {
    setIsChecking(true);

    try {
      if (publicKey) {
        // First check if any ID > 10000 exists in the table
        const { data: maxIdData, error: maxIdError } = await supabase
          .from('fees')
          .select('id')
          .gt('id', 10000)
          .limit(1);

        // If we find any ID > 10000, show "too late" screen
        if (!maxIdError && maxIdData && maxIdData.length > 0) {
          setIsFull(true);
          setCheckComplete(true);
          setIsChecking(false);
          return;
        }

        // If we're still accepting entries, check this wallet's eligibility
        const { data, error } = await supabase
          .from('fees')
          .select('id, link')
          .eq('wallet', publicKey.toString())
          .single();

        if (!error && data && data.id <= 10000 && data.link) {
          setIsEligible(true);
        } else {
          setIsEligible(false);
        }
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setIsEligible(false);
    }

    setCheckComplete(true);
    setIsChecking(false);
  };

  const handleCheck = () => {
    checkEligibility();
  };

  // Reset states when wallet changes
  useEffect(() => {
    setCheckComplete(false);
    setIsChecking(false);
    setIsEligible(false);
    setIsFull(false);
  }, [publicKey]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center space-y-32">
        <h2 className="text-4xl font-mondwest">
          <span className="bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
            Checking your wallet
          </span>
        </h2>

        <div className="relative w-48 h-48">
          <div className="absolute inset-0 rounded-full border-8 border-[#1a1a1a]" />
          <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-purple-500 border-r-blue-400 border-b-cyan-400 border-l-[#2a2a2a] animate-spin" />
        </div>
      </div>
    );
  }

  if (checkComplete) {
    if (isFull) {
      return (
        <div className="text-center space-y-8 pt-20">
          <h2 className="text-4xl font-mondwest">
            <span className="bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Sorry, you are too late for $FUN.
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 text-white text-xl">
            <span>📺 Wallet Address:</span>
            <span className="cursor-pointer hover:text-gray-300">{publicKey?.toString()}</span>
          </div>

          <div className="p-[2px] rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] w-[30rem] mx-auto">
            <div className="w-full h-60 rounded-lg overflow-hidden">
              <img
                src="/assets/web assets video/popcat.gif"
                alt="Popcat"
                className="w-full h-full object-fill"
              />
            </div>
          </div>

          <div className="text-white text-2xl space-y-2">
            <p>You have to buy it on the open market.</p>
            <p>Next time stay locked in, chat!</p>
          </div>

          <div className="p-[1px] rounded-md bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 w-80 mx-auto">
            <button 
              className="w-full py-2 rounded-md font-mondwest text-xl bg-black text-white hover:bg-opacity-80 transition-all"
            >
              Buy $FUN!
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-8 pt-20">
        <h2 className="text-4xl font-mondwest">
          <span className="bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
            {isEligible ? "Congrats, you have been qualified for $FUN!" : "You are not eligible for $FUN"}
          </span>
        </h2>

        <div className="p-[2px] rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] w-[30rem] mx-auto">
          <div className="w-full h-60 rounded-lg overflow-hidden">
            <img
              src={isEligible 
                ? "/assets/web assets video/retardio.gif"
                : "/assets/web assets video/popcat.gif"
              }
              alt={isEligible ? "Retardio" : "Popcat"}
              className="w-full h-full object-fill"
            />
          </div>
        </div>

        {isEligible && (
          <div className="p-[1px] rounded-md bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 w-80 mx-auto">
            <button 
              onClick={() => setActiveTab('claim')}
              className="w-full py-2 rounded-md font-mondwest text-xl bg-black text-white hover:bg-opacity-80 transition-all"
            >
              Claim!
            </button>
          </div>
        )}

        {!isEligible && (
          <>
            <p className="text-2xl text-white">Share your results on Twitter to become eligible!</p>
            <div className="p-[1px] rounded-md bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 w-80 mx-auto">
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-full py-2 rounded-md font-mondwest text-xl bg-black text-white hover:bg-opacity-80 transition-all"
              >
                Share
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-12">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-mondwest">
          <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
            Check to see if you are
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
            eligible for $FUN
          </span>
        </h2>
      </div>

      {/* Images Section */}
      <div className="flex items-center justify-center gap-8 w-full max-w-3xl mb-16">
        <div className="w-48 h-48">
          <img
            src="/assets/web assets video/doge-good-morning.gif"
            alt="Good Morning Doge"
            className="w-full h-full transform scale-x-[-1]"
          />
        </div>

        <div className="p-[2px] rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195]">
          <div className="w-48 h-48 bg-[#FDB900] rounded-lg overflow-hidden">
            <img
              src="/assets/web assets video/ponke-ponkesol.gif"
              alt="Ponke"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="w-48 h-48">
          <img
            src="/assets/web assets video/doge-good-morning.gif"
            alt="Good Morning Doge"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Bottom Text or Button */}
      {!connected ? (
        <div className="text-2xl font-mondwest mt-20">
          <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
            Connect your wallet to check
          </span>
        </div>
      ) : (
        <div className="p-[1px] rounded-md bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400 w-80">
          <button 
            onClick={handleCheck}
            className="w-full py-2 rounded-md font-mondwest text-xl bg-black text-white hover:bg-opacity-80 transition-all"
          >
            Check eligibility
          </button>
        </div>
      )}
    </div>
  );
} 