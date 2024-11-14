'use client';

import { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/utils/supabase';

interface ShareModalProps {
  totalFees: number;
  dexFees: number | null;
  onClose: () => void;
  solPrice: number;
  scannedWallet: string;
}

export default function ShareModal({ totalFees, dexFees, onClose, solPrice, scannedWallet }: ShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { publicKey } = useWallet();

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
        const tweetText = `I've lost ${totalFees.toFixed(2)} SOL ($${(totalFees * solPrice).toFixed(2)}) in fees on @PumpFunDAO! Check your fees at https://fees.fun 🚀`;
        
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
            fee: totalFees,
            link: tweetLink,
            handle: twitterHandle
          }
        ]);

      if (insertError) throw insertError;

      onClose();
      alert('Successfully submitted!');
    } catch (error: any) {
      console.error('Error submitting to database:', error.message || error);
      setSubmitError(error.message || 'Failed to submit. Please try again.');
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
        <div ref={contentRef} className="w-[960px] p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
          <div className="bg-[#1A1A1A] rounded-lg p-8 relative overflow-hidden">
            {/* Background pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url('/assets/pumpfun.png')`,
                backgroundSize: '48px',
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Content container with higher z-index to stay above pattern */}
            <div className="space-y-8 relative z-10">
              {/* Title */}
              <div className="text-3xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                Fees.Fun
              </div>

              {/* Main Content with Doge */}
              <div className="relative min-h-[300px] flex">
                {/* Text Content */}
                <div className="space-y-6 relative z-10 max-w-[60%]">
                  <div className="text-3xl font-mondwest">
                    You have lost
                  </div>
                  <div className="flex items-baseline gap-4">
                    <div className="text-7xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                      {totalFees.toFixed(2)} SOL
                    </div>
                    <div className="text-4xl text-white font-mondwest">
                      (${(totalFees * solPrice).toFixed(2)})
                    </div>
                  </div>
                  <div className="text-2xl font-mondwest">
                    in fees to pumpfun and co
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-white text-3xl font-mondwest">
                        You've lost
                      </div>
                      <div className="text-3xl font-mondwest bg-gradient-to-r from-solana-purple via-blue-400 to-solana-green text-transparent bg-clip-text">
                        {dexFees ? dexFees.toFixed(2) : "0.00"} SOL on PUMPFUN
                      </div>
                    </div>
                    <div className="text-2xl text-white font-mondwest">
                      Right now, that´s $ {(dexFees ? dexFees * solPrice : 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Doge Image */}
                <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[432px] h-[432px]">
                  <img 
                    src="/assets/doge.png" 
                    alt="Doge" 
                    className="w-full h-full object-contain"
                  />
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
