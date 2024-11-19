import { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface CheckCachedResultsProps {
  onResultsFound: (results: any) => void;
  walletToCheck: string;
}

export default function CheckCachedResults({ onResultsFound, walletToCheck }: CheckCachedResultsProps) {
  const [isChecking, setIsChecking] = useState(false);

  const checkCachedResults = async () => {
    if (!walletToCheck) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(`/api/cached-scan?wallet=${walletToCheck}`);
      const { data, error } = await response.json();
      
      if (error) throw error;
      if (data) {
        onResultsFound(data);
      }
    } catch (error) {
      console.error('Error checking cached results:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <button 
      onClick={checkCachedResults}
      disabled={isChecking}
      className="px-6 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors disabled:opacity-50"
    >
      {isChecking ? 'Checking...' : 'Check Cache'}
    </button>
  );
}
