'use client';

import { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/utils/supabase';

interface ShareModalProps {
  totalFees: number;
  dexFees: number | null;
  botFees: number | null;
  onClose: () => void;
  solPrice: number;
  scannedWallet: string;
}

export default function ShareModal({ totalFees, dexFees, botFees, onClose, solPrice, scannedWallet }: ShareModalProps) {
  const [isSharing] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { publicKey } = useWallet();
  const [randomImage, setRandomImage] = useState(1);

  useEffect(() => {
    const randomNum = Math.floor(Math.random() * 5) + 1;
    setRandomImage(randomNum);
  }, []);

  const combinedTotal = (totalFees || 0) + (botFees || 0);

  const extractTwitterHandle = (tweetUrl: string): string | null => {
    try {
      const url = new URL(tweetUrl);
      if (!url.hostname.includes('twitter.com') && !url.hostname.includes('x.com')) {
        return null;
      }
      const pathParts = url.pathname.split('/');
      return pathParts[1] || null;
    } catch {
      return null;
    }
  };

  const handleDownload = async () => {
    if (contentRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(contentRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#1A1A1A',
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'funfees-share.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  const handleShare = async () => {
    if (contentRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(contentRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#1A1A1A',
        });

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: dataUrl })
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const { imageUrl } = await response.json();

        // Create tweet text
        const tweetText = `I've lost ${combinedTotal.toFixed(2)} SOL ($${(combinedTotal * solPrice).toFixed(2)}) in fees on @PumpFunDAO! Check your fees at https://fees.fun 🚀`;
        
        // Create Twitter share URL with both text and image
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`;
        
        window.open(twitterUrl, '_blank');
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Failed to share. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!publicKey || publicKey.toBase58() !== scannedWallet) {
      setSubmitError('Connected wallet does not match the scanned wallet');
      return;
    }

    if (!tweetLink) {
      setSubmitError('Please enter your tweet link');
      return;
    }

    const twitterHandle = extractTwitterHandle(tweetLink);
    if (!twitterHandle) {
      setSubmitError('Invalid Twitter link format');
      return;
    }

    try {
      // Check for existing Twitter handle
      const { data: existingSubmissions, error: checkError } = await supabase
        .from('fees')
        .select('link')
        .eq('handle', twitterHandle);

      if (checkError) throw checkError;

      if (existingSubmissions && existingSubmissions.length > 0) {
        setSubmitError('This Twitter account has already submitted');
        return;
      }

      // Insert data into Supabase
      const { error: insertError } = await supabase
        .from('fees')
        .insert([
          {
            wallet: scannedWallet,
            fee: combinedTotal,
            link: tweetLink,
            handle: twitterHandle
          }
        ]);

      if (insertError) throw insertError;

      onClose();
      alert('Successfully submitted!');
    } catch (error: unknown) {
      console.error('Error submitting to database:', error instanceof Error ? error.message : error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4 relative">
        {/* Close button with gradient border - repositioned */}
        <div className="absolute -top-4 -right-4 z-20">
          <div className="p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
            <button 
              onClick={onClose}
              className="px-3 py-1 bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              × Close
            </button>
          </div>
        </div>

        {/* Main modal content box */}
        <div ref={contentRef} className="w-full max-w-[95vw] md:w-[960px] p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
          <div className="bg-[#1A1A1A] rounded-lg p-4 md:p-8 relative overflow-hidden">
            {/* Content container with higher z-index to stay above pattern */}
            <div className="space-y-8 relative z-10 flex gap-[1px]">
              {/* Wrapper with single gradient border */}
              <div className="p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
                {/* Container flex wrapper */}
                <div className="flex divide-x divide-[#9945FF]/20">
                  {/* Left Half - Text Content */}
                  <div className="w-1/2 h-[400px] p-8 space-y-6 bg-[#1A1A1A] rounded-l-lg relative">
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `url('/assets/pumpfun.png')`,
                        backgroundSize: '48px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    <div className="relative z-10">
                      {/* Title */}
                      <div className="text-2xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                        Fees.Fun
                      </div>

                      <div className="text-2xl font-mondwest">
                        You have lost
                      </div>

                      <div className="space-y-2">
                        <div className="text-6xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                          {combinedTotal.toFixed(2)} SOL
                        </div>
                        <div className="text-3xl text-white font-mondwest">
                          (${(combinedTotal * solPrice).toFixed(2)})
                        </div>
                        <div className="text-xl text-white font-mondwest">
                          in fees to pumpfun and co
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-white">You've lost </span>
                          <span className="text-2xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                            {dexFees ? dexFees.toFixed(2) : "0.00"} SOL on PUMPFUN
                          </span>
                        </div>
                        <div className="text-xl text-white font-mondwest">
                          Right now, that's $ {(dexFees ? dexFees * solPrice : 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-white">You donated </span>
                          <span className="text-2xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                            {(botFees ?? 0).toFixed(2)} SOL
                          </span>
                        </div>
                        <div className="text-xl text-white font-mondwest">
                          trading fees for trade bots
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Half - Random Meme Image */}
                  <div className="w-1/2 h-[400px] bg-[#1A1A1A] rounded-r-lg">
                    <img 
                      src={`/assets/PNLcards/cutted/${randomImage}.png`}
                      alt="PNL Card Meme" 
                      className="w-full h-full object-cover rounded-r-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - match the width */}
        <div className="w-[960px] flex gap-4">
          <div className="flex-1 p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
            <button 
              onClick={handleDownload}
              className="w-full px-6 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
            >
              Download Image
            </button>
          </div>
          <div className="flex-1 p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="w-full px-6 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? 'Sharing...' : 'Share on Twitter'}
            </button>
          </div>
        </div>

        {/* Submit form - match the width */}
        <div className="w-[960px] p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
          <div className="flex gap-2 bg-[#1A1A1A] rounded-lg p-2">
            <input
              type="text"
              value={tweetLink}
              onChange={(e) => setTweetLink(e.target.value)}
              placeholder="Submit link to your tweet to be eligible for $FUN reward"
              className="flex-1 px-4 py-2 bg-[#2A2A2A] rounded-lg text-white placeholder-gray-500 outline-none"
            />
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
            >
              Submit
            </button>
          </div>
          {submitError && (
            <div className="mt-2 text-red-500 text-sm px-2">
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
