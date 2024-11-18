import { FC } from 'react';
import { WalletReadyState, WalletName } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { createSignerFromWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters';

interface MobileWalletModalProps {
  onClose: () => void;
}

export const MobileWalletModal: FC<MobileWalletModalProps> = ({ onClose }) => {
  const { wallets, select, wallet } = useWallet();

  const handleWalletClick = async (walletName: WalletName) => {
    select(walletName);
    if (wallet) {
      const signer = createSignerFromWalletAdapter(wallet.adapter);
      // You can now use this signer for Metaplex transactions
    }
    onClose();
  };

  // Filter for mobile-compatible wallets that are installed or can be installed
  const mobileWallets = wallets.filter(
    wallet => 
      wallet.readyState === WalletReadyState.Installed || 
      wallet.readyState === WalletReadyState.Loadable
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] rounded-lg w-[90%] max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-mondwest text-xl">Select Wallet</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          {mobileWallets.map((wallet) => (
            <div 
              key={wallet.adapter.name}
              className="p-[1px] rounded-md bg-gradient-to-r from-[#9945FF] to-[#14F195]"
            >
              <button
                onClick={() => handleWalletClick(wallet.adapter.name)}
                className="w-full py-3 px-4 rounded-md bg-black text-white hover:bg-opacity-80 transition-all flex items-center justify-between"
              >
                <span className="font-mondwest">{wallet.adapter.name}</span>
                {wallet.adapter.icon && (
                  <img 
                    src={wallet.adapter.icon} 
                    alt={`${wallet.adapter.name} icon`}
                    className="w-6 h-6"
                  />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 