'use client';

import { useEffect, useRef } from 'react';
import { warmParagraphCache } from '../utils/cacheWarming';

/**
 * Component that handles cache warming on app initialization
 * Uses ref to prevent multiple warming attempts across remounts
 */
export default function CacheWarmer() {
  const hasWarmed = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (hasWarmed.current) return;
    
    hasWarmed.current = true;
    
    // Warm cache after a short delay to not block initial render
    const timer = setTimeout(() => {
      warmParagraphCache()
        .then(() => {
          console.log('🔥 Cache warming complete');
        })
        .catch((error) => {
          console.error('Cache warming failed:', error);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
