'use client';

import { useState } from 'react';

/**
 * Development-only cache clear button
 * Shows a floating button in dev mode to quickly clear caches
 */
export default function DevCacheClearButton() {
  const [isClearing, setIsClearing] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      // Import and run soft reset
      const { softReset } = await import('../utils/clearCache');
      await softReset();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Check console for details.');
      setIsClearing(false);
    }
  };

  return (
    <button
      onClick={handleClearCache}
      disabled={isClearing}
      className="fixed bottom-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Clear service worker caches and reload"
    >
      {isClearing ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Clearing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Cache
        </>
      )}
    </button>
  );
}
