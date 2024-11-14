import { ClientWrapper } from '@/components/ClientWrapper';
import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';

// Load Mondwest font
const mondwest = localFont({
  src: '../fonts/PPMondwest-Regular.otf',
  variable: '--font-mondwest'
});

export const metadata: Metadata = {
  title: "Solana Fee Calculator",
  description: "Calculate total transaction fees for any Solana wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mondwest.variable}>
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
