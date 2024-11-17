'use client';

import { ClientWrapper } from '@/components/ClientWrapper';
import localFont from 'next/font/local';
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, createContext } from 'react';

export const ViewContext = createContext<{
  currentView: string;
  setCurrentView: (view: string) => void;
}>({ currentView: 'wallet-entry', setCurrentView: () => {} });

// Load Mondwest font
const mondwest = localFont({
  src: '../fonts/PPMondwest-Regular.otf',
  variable: '--font-mondwest'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create a context or state management to track the current view
  const [currentView, setCurrentView] = useState('wallet-entry');

  const handleReset = () => {
    router.push('/');
    window.location.reload();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("Placeholder");
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <html lang="en" className={mondwest.variable}>
      <body>
        <ClientWrapper>
          <div className="relative min-h-screen flex flex-col">
            <ViewContext.Provider value={{ currentView, setCurrentView }}>
              {children}
            </ViewContext.Provider>

            {/* Another One button - Always visible, top left */}
            <button 
              onClick={handleReset}
              className="fixed top-4 left-4 z-50 p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500"
            >
              <span className="block px-6 py-2 bg-black text-white rounded-lg hover:bg-opacity-80 transition-all font-mondwest">
                Another One?
              </span>
            </button>

            {/* Chipmunks */}
            <img
              src="/assets/chipmunk.png"
              alt="Chipmunk Left"
              className="fixed w-[604px] h-[554px] top-[470px] left-0 transform scale-x-[-1] z-40 rounded-tr-[540px]"
            />
            <img
              src="/assets/chipmunk.png"
              alt="Chipmunk Right"
              className="fixed w-[604px] h-[554px] top-[470px] right-0 z-40 rounded-tl-[540px]"
            />

            {/* Social Media Icons - Show everywhere except wallet entry */}
            {currentView !== 'wallet-entry' && (
              <div className="fixed bottom-12 left-0 right-0 z-50">
                <div className="flex justify-center gap-6">
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
                    <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                      <img 
                        src="/assets/socials/Token-64x64.svg" 
                        alt="Token" 
                        className="w-6 h-6"
                      />
                    </a>
                  </div>
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-500 via-blue-400 to-green-500">
                    <a href="#" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors block">
                      <img 
                        src="/assets/socials/dex-screener-seeklogo.svg" 
                        alt="DexScreener" 
                        className="w-6 h-6"
                      />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
