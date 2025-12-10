'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../utils/serviceWorkerRegistration';

/**
 * Component that registers the service worker on app initialization
 */
export default function ServiceWorkerInit() {
  useEffect(() => {
    // Register service worker after a short delay to not block initial render
    const timer = setTimeout(() => {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            console.log('🎉 Service Worker ready - app works offline!');
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
