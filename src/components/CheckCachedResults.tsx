import { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface CheckCachedResultsProps {
  walletToCheck: string;
  onResultsFound: (results: any) => void;
  className?: string;
}

export default function CheckCachedResults({ 
  walletToCheck, 
  onResultsFound,
  className 
}: CheckCachedResultsProps) {
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
      className={className}
    >
      {isChecking ? 'Checking...' : 'Check Cache'}
    </button>
  );
}
