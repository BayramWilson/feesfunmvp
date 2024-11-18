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
  setHideBottomIcons: (hide: boolean) => void;
}

export default function ShareModal({ totalFees, dexFees, botFees, onClose, solPrice, scannedWallet, setHideBottomIcons }: ShareModalProps) {
  const [isSharing] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { publicKey } = useWallet();
  const [randomImage, setRandomImage] = useState(1);

  useEffect(() => {
    setHideBottomIcons(true);
    const randomNum = Math.floor(Math.random() * 5) + 1;
    setRandomImage(randomNum);
    return () => setHideBottomIcons(false);
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
        // Create a temporary clone with desktop layout
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '960px';
        tempDiv.style.height = '400px';
        tempDiv.style.backgroundColor = '#1A1A1A';
        tempDiv.style.padding = '32px';
        tempDiv.style.borderRadius = '8px';
        tempDiv.style.fontFamily = 'Mondwest, sans-serif';
        
        // Create the flex container
        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.width = '100%';
        flexContainer.style.height = '100%';
        
        // Left side content (text)
        const leftSide = document.createElement('div');
        leftSide.style.flex = '1';
        leftSide.style.paddingRight = '32px';
        leftSide.style.fontFamily = 'Mondwest, sans-serif';
        leftSide.innerHTML = `
          <div style="font-family: Mondwest, sans-serif; font-size: 24px; background: linear-gradient(to right, #9945FF, #14F195); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Fees.Fun
          </div>
          <div style="font-family: Mondwest, sans-serif; font-size: 60px; background: linear-gradient(to right, #9945FF, #14F195); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            ${combinedTotal.toFixed(2)} SOL
          </div>
          <div style="font-family: Mondwest, sans-serif; font-size: 30px; color: white;">
            ($${(combinedTotal * solPrice).toFixed(2)})
          </div>
          <div style="font-family: Mondwest, sans-serif; font-size: 20px; color: white;">
            in fees to pumpfun and co
          </div>
          <div style="margin-top: 16px;">
            <span style="color: white;">You've lost </span>
            <span style="font-family: Mondwest, sans-serif; font-size: 24px; background: linear-gradient(to right, #9945FF, #14F195); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              ${dexFees ? dexFees.toFixed(2) : "0.00"} SOL on PUMPFUN
            </span>
          </div>
          <div style="font-family: Mondwest, sans-serif; font-size: 20px; color: white;">
            Right now, that's $ ${(dexFees ? dexFees * solPrice : 0).toFixed(2)}
          </div>
          <div style="margin-top: 16px;">
            <span style="color: white;">You donated </span>
            <span style="font-family: Mondwest, sans-serif; font-size: 24px; background: linear-gradient(to right, #9945FF, #14F195); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              ${(botFees ?? 0).toFixed(2)} SOL
            </span>
          </div>
          <div style="font-family: Mondwest, sans-serif; font-size: 20px; color: white;">
            trading fees for trade bots
          </div>
        `;
        
        // Add pumpfun background pattern
        const pattern = document.createElement('div');
        pattern.style.position = 'absolute';
        pattern.style.inset = '0';
        pattern.style.opacity = '0.1';
        pattern.style.backgroundImage = `url('/assets/pumpfun.png')`;
        pattern.style.backgroundSize = '48px';
        pattern.style.backgroundRepeat = 'repeat';
        leftSide.style.position = 'relative';
        leftSide.appendChild(pattern);
        
        // Right side image
        const rightSide = document.createElement('div');
        rightSide.style.flex = '1';
        const img = document.createElement('img');
        img.src = `/assets/PNLcards/cutted/${randomImage}.png`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        rightSide.appendChild(img);
        
        // Assemble the layout
        flexContainer.appendChild(leftSide);
        flexContainer.appendChild(rightSide);
        tempDiv.appendChild(flexContainer);
        document.body.appendChild(tempDiv);

        // Add style tag for font
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'Mondwest';
            src: url('/fonts/PPMondwest-Regular.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(style);
        
        // Wait a bit for font to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Generate image
        const dataUrl = await htmlToImage.toPng(tempDiv, {
          quality: 1.0,
          pixelRatio: 2,
          width: 960,
          height: 400,
        });
        
        // Clean up
        document.body.removeChild(tempDiv);
        document.head.removeChild(style);
        
        // Handle download
        const link = document.createElement('a');
        link.download = 'funfees-share.png';
        link.href = dataUrl;
        
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          const img = new Image();
          img.src = dataUrl;
          const w = window.open('');
          w?.document.write(img.outerHTML);
        } else {
          link.click();
        }
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
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
        
        // Check if mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For iOS devices
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = `twitter://post?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`;
            
            // Fallback to web if app doesn't open after 1 second
            setTimeout(() => {
              window.location.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`;
            }, 1000);
          } 
          // For Android devices
          else if (/Android/i.test(navigator.userAgent)) {
            window.location.href = `intent://post?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}#Intent;scheme=twitter;package=com.twitter.android;end`;
            
            // Fallback to web if app doesn't open after 1 second
            setTimeout(() => {
              window.location.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`;
            }, 1000);
          }
        } else {
          // Desktop behavior remains the same
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`, '_blank');
        }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 min-[810px]:py-0 py-[12.5%] overflow-y-auto h-full">
      <div className="flex flex-col items-center gap-1 min-[810px]:gap-4 relative w-[95%] max-w-[960px] mt-12 min-[810px]:mt-0">
        {/* Desktop close button - outside container */}
        <div className="hidden min-[810px]:block absolute -top-8 -right-8 z-20">
          <div className="p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              × Close
            </button>
          </div>
        </div>

        {/* Main modal content box */}
        <div ref={contentRef} className="w-full rounded-lg p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195]">
          <div className="bg-[#1A1A1A] rounded-lg p-2 min-[810px]:p-8 relative overflow-hidden">
            {/* Mobile close button */}
            <div className="flex justify-end mb-1 min-[810px]:mb-2 min-[810px]:hidden sticky top-0 z-50">
              <div className="p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
                <button 
                  onClick={onClose}
                  className="px-2 py-0.5 text-xs bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  × Close
                </button>
              </div>
            </div>

            <div className="space-y-1 min-[810px]:space-y-8 relative z-10">
              <div className="p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
                {/* Container flex wrapper */}
                <div className="flex flex-col min-[810px]:flex-row min-[810px]:divide-x divide-[#9945FF]/20">
                  {/* Left Half - Text Content */}
                  <div className="w-full min-[810px]:w-1/2 h-auto min-[810px]:h-[400px] p-2 min-[810px]:p-8 space-y-1 min-[810px]:space-y-6 bg-[#1A1A1A] rounded-t-lg min-[810px]:rounded-l-lg min-[810px]:rounded-tr-none">
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
                      <div className="text-sm min-[810px]:text-2xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                        Fees.Fun
                      </div>

                      <div className="text-lg min-[810px]:text-2xl font-mondwest">
                        You have lost
                      </div>

                      <div className="space-y-1 min-[810px]:space-y-2">
                        <div className="text-3xl min-[810px]:text-6xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                          {combinedTotal.toFixed(2)} SOL
                        </div>
                        <div className="text-xl min-[810px]:text-3xl text-white font-mondwest">
                          (${(combinedTotal * solPrice).toFixed(2)})
                        </div>
                        <div className="text-base min-[810px]:text-xl text-white font-mondwest">
                          in fees to pumpfun and co
                        </div>
                      </div>

                      <div className="space-y-1 min-[810px]:space-y-2">
                        <div>
                          <span className="text-white text-sm min-[810px]:text-base">You've lost </span>
                          <span className="text-lg min-[810px]:text-2xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                            {dexFees ? dexFees.toFixed(2) : "0.00"} SOL on PUMPFUN
                          </span>
                        </div>
                        <div className="text-base min-[810px]:text-xl text-white font-mondwest">
                          Right now, that's $ {(dexFees ? dexFees * solPrice : 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="space-y-1 min-[810px]:space-y-2">
                        <div>
                          <span className="text-white text-sm min-[810px]:text-base">You donated </span>
                          <span className="text-lg min-[810px]:text-2xl font-mondwest bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                            {(botFees ?? 0).toFixed(2)} SOL
                          </span>
                        </div>
                        <div className="text-base min-[810px]:text-xl text-white font-mondwest">
                          trading fees for trade bots
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Half - Random Meme Image */}
                  <div className="w-full min-[810px]:w-1/2 h-[150px] min-[810px]:h-[400px] bg-[#1A1A1A] rounded-b-lg min-[810px]:rounded-r-lg min-[810px]:rounded-bl-none">
                    <img 
                      src={`/assets/PNLcards/cutted/${randomImage}.png`}
                      alt="PNL Card Meme" 
                      className="w-full h-full object-cover rounded-b-lg min-[810px]:rounded-r-lg min-[810px]:rounded-bl-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - always horizontal */}
        <div className="w-full flex gap-1 min-[810px]:gap-4">
          <div className="flex-[1.2] p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
            <button 
              onClick={handleDownload}
              className="w-full px-2 sm:px-5 md:px-7 py-1 sm:py-2.5 md:py-3 
                text-xs sm:text-base bg-[#1A1A1A] text-white rounded-lg 
                hover:bg-[#2A2A2A] transition-colors"
            >
              Download
            </button>
          </div>
          <div className="flex-1 p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="w-full px-2 sm:px-4 md:px-6 py-1 sm:py-2.5 md:py-3 
                text-xs sm:text-base bg-[#1A1A1A] text-white rounded-lg 
                hover:bg-[#2A2A2A] transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>

        {/* Submit form */}
        <div className="w-full p-[1px] bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg">
          <div className="flex gap-1 min-[810px]:gap-2 bg-[#1A1A1A] rounded-lg p-1 min-[810px]:p-2">
            <input
              type="text"
              value={tweetLink}
              onChange={(e) => setTweetLink(e.target.value)}
              placeholder="Submit link to your tweet to be eligible for $FUN reward"
              className="flex-1 px-2 min-[810px]:px-4 py-1 min-[810px]:py-2 text-xs min-[810px]:text-base bg-[#2A2A2A] rounded-lg text-white placeholder-gray-500 outline-none"
            />
            <button 
              onClick={handleSubmit}
              className="px-3 min-[810px]:px-6 py-1 min-[810px]:py-2 text-xs min-[810px]:text-base bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
            >
              Submit
            </button>
          </div>
          {submitError && (
            <div className="mt-1 text-red-500 text-xs min-[810px]:text-sm px-2">
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
