'use client';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { ClientWrapper } from '@/components/ClientWrapper';
import localFont from 'next/font/local';
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ViewContext } from '@/context/ViewContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Load Mondwest font
const mondwest = localFont({
  src: '../fonts/PPMondwest-Regular.otf',
  variable: '--font-mondwest'
});

type ViewType = 'wallet-entry' | 'results' | 'rewards' | 'claim' | 'loading';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>('wallet-entry');
  const [hideBottomIcons, setHideBottomIcons] = useState(false);

  const handleReset = () => {
    router.push('/');
    window.location.reload();
  };

  return (
    <html lang="en" className={mondwest.variable}>
      <body>
        <ClientWrapper>
          <div className="relative min-h-screen flex flex-col">
            <ViewContext.Provider value={{ 
              currentView, 
              setCurrentView: setCurrentView as React.Dispatch<React.SetStateAction<string>>,
              hideBottomIcons,
              setHideBottomIcons 
            }}>
              {children}

              {/* Desktop Only Buttons */}
              <div className="sm:block">
                {/* Another One Button - Hidden on Mobile */}
                <button 
                  onClick={handleReset}
                  className="fixed top-4 left-4 z-50 p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500 hidden sm:block"
                >
                  <span className="block px-6 py-2 bg-black text-white rounded-lg hover:bg-opacity-80 transition-all font-mondwest">
                    Another One?
                  </span>
                </button>

                {/* Wallet Button - Desktop Only */}
                <div className="fixed top-4 right-4 z-50 hidden sm:block">
                  <WalletMultiButton className="!bg-black hover:!bg-opacity-80 !transition-all !font-mondwest" />
                </div>
              </div>

              {/* Chipmunks - Responsive sizing */}
              <img
                src="/assets/chipmunk.png"
                alt="Chipmunk Left"
                className="fixed 
                  w-[200px] h-[200px] xl:w-[199px] xl:h-[199px]
                  bottom-0
                  left-0 
                  transform scale-x-[-1] 
                  z-40 
                  hidden lg:block chipmunk-visible"
              />
              <img
                src="/assets/chipmunk.png"
                alt="Chipmunk Right"
                className="fixed 
                   w-[200px] h-[200px] xl:w-[199px] xl:h-[199px]
                  bottom-0
                  right-0 
                  z-40 
                  hidden lg:block chipmunk-visible"
              />

              {/* Social Media Icons */}
              {currentView === 'wallet-entry' && 
               !hideBottomIcons && (
                <div className={`fixed bottom-12 left-0 right-0 z-50 
                  ${hideBottomIcons ? 'hidden' : ''}
                `}>
                  <div className="hidden min-[1000px]:flex justify-center gap-4 sm:gap-6">
                    <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
                      <a href="#" className="p-2 sm:p-2.5 md:p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                        <img 
                          src="/assets/socials/Token-64x64.svg" 
                          alt="Token" 
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                        />
                      </a>
                    </div>
                    <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
                      <a href="#" className="p-2 sm:p-2.5 md:p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                        <img 
                          src="/assets/socials/dex-screener-seeklogo.svg" 
                          alt="DexScreener" 
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </ViewContext.Provider>
          </div>
        </ClientWrapper>
        <Analytics />
      </body>
    </html>
  );
}
