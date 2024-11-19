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
      className={`flex items-center ${className}`}
    >
      {isChecking ? (
        <span className="loader"></span> // Optional: Lade-Animation
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </>
      )}
    </button>
  );
}
