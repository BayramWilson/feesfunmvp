'use client';

import { useState } from 'react';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [totalFees, setTotalFees] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFees = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzA0NzIxMTkyOTQsImVtYWlsIjoiYmF5cmFtLndpbHNvbjA0QGdtYWlsLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTczMDQ3MjExOX0.yFuLfml12MylfJ4wNKNNBkUPpL68x7YyZBe5T0Tp5nM"
        }
      };

      const response = await fetch(
        `https://pro-api.solscan.io/v2.0/account/transactions?address=${encodeURIComponent(walletAddress)}&limit=40`,
        requestOptions
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${errorData.message || JSON.stringify(errorData.errors)}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data); // For debugging

      if (data.success && data.data && Array.isArray(data.data)) {
        const fees = data.data.reduce((acc: number, tx: any) => {
          const fee = tx.fee || 0;
          return acc + fee;
        }, 0);
        setTotalFees(fees / 1e9); // Convert lamports to SOL
      } else {
        throw new Error('Invalid response format from Solscan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Solana Fee Calculator</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter a Solana wallet address to calculate total transaction fees
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter Solana wallet address"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={calculateFees}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Fees'}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {totalFees !== null && (
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-lg font-semibold">Total Fees</p>
              <p className="text-2xl font-bold">{totalFees.toFixed(6)} SOL</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
