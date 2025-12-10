/**
 * Service Worker Registration
 * Registers the service worker for offline page caching
 */

let registration = null;

/**
 * Register the service worker
 */
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    // Register the service worker
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ Service Worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Service Worker update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('🆕 New Service Worker available - refresh to update');
        }
      });
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Unregister the service worker
 */
export const unregisterServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Worker unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister Service Worker:', error);
    return false;
  }
};

/**
 * Get the current service worker registration
 */
export const getRegistration = () => registration;

/**
 * Check if service worker is active
 */
export const isServiceWorkerActive = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  return navigator.serviceWorker.controller !== null;
};
