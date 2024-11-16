'use client';

import { ClientWrapper } from '@/components/ClientWrapper';
import localFont from 'next/font/local';
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useRouter } from 'next/navigation';

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

  const handleReset = () => {
    // Navigate to home page and refresh to reset all states
    router.push('/');
    window.location.reload();
  };

  return (
    <html lang="en" className={mondwest.variable}>
      <body>
        <ClientWrapper>
          <div className="relative">
            <button 
              onClick={handleReset}
              className="fixed top-4 left-4 z-50 p-[1px] rounded-lg bg-gradient-to-r from-purple-500 via-blue-400 to-green-500"
            >
              <span className="block px-6 py-2 bg-black text-white rounded-lg hover:bg-opacity-80 transition-all font-mondwest">
                Another One?
              </span>
            </button>
            {children}
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
