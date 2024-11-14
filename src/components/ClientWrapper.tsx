'use client';

import { WalletContextProvider } from './WalletContextProvider';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <WalletContextProvider>{children}</WalletContextProvider>;
} 