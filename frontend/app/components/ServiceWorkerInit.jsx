'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../utils/serviceWorkerRegistration';

// Import cache clearing utilities in development
if (process.env.NODE_ENV === 'development') {
  import('../utils/clearCache');
}

/**
 * Component that registers the service worker on app initialization
 */
export default function ServiceWorkerInit() {
  useEffect(() => {
    // In development, log helpful cache clearing instructions
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development Mode - Cache utilities loaded');
      console.log('   Run window.clearCache.soft() to clear caches');
      console.log('   Run window.clearCache.hard() for complete reset');
    }

    // Register service worker after a short delay to not block initial render
    const timer = setTimeout(() => {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('🎉 Service Worker ready - app works offline!');
            
            // Force update check in development
            if (process.env.NODE_ENV === 'development' && registration) {
              registration.update().then(() => {
                console.log('✅ Service Worker update check complete');
              });
            }
          }
        })
        .catch((error) => {
          console.error('Service Worker registration error:', error);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
