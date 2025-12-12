/**
 * Cache clearing utilities for development
 */

/**
 * Clear all service worker caches
 */
export const clearServiceWorkerCaches = async () => {
  if (typeof window === 'undefined' || !('caches' in window)) {
    console.log('Cache API not available');
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    console.log('✅ All service worker caches cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear caches:', error);
    return false;
  }
};

/**
 * Unregister all service workers
 */
export const unregisterAllServiceWorkers = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not available');
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(registration => {
        console.log('Unregistering service worker:', registration.scope);
        return registration.unregister();
      })
    );
    console.log('✅ All service workers unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister service workers:', error);
    return false;
  }
};

/**
 * Clear all storage (localStorage, sessionStorage, IndexedDB)
 */
export const clearAllStorage = () => {
  if (typeof window === 'undefined') return false;

  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');

    // Clear IndexedDB (if any)
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          indexedDB.deleteDatabase(db.name);
          console.log('✅ IndexedDB cleared:', db.name);
        });
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};

/**
 * Complete cache and storage reset
 * Use this when you need a fresh start
 */
export const hardReset = async () => {
  console.log('🔄 Starting hard reset...');
  
  await clearServiceWorkerCaches();
  await unregisterAllServiceWorkers();
  clearAllStorage();
  
  console.log('✅ Hard reset complete! Reloading page...');
  
  // Force reload from server
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
};

/**
 * Soft reset - just clear caches but keep storage
 */
export const softReset = async () => {
  console.log('🔄 Starting soft reset...');
  
  await clearServiceWorkerCaches();
  
  console.log('✅ Soft reset complete! Reloading page...');
  
  // Force reload from server
  setTimeout(() => {
    window.location.reload(true);
  }, 500);
};

// Development helper: Add to window object
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.clearCache = {
    hard: hardReset,
    soft: softReset,
    caches: clearServiceWorkerCaches,
    serviceWorkers: unregisterAllServiceWorkers,
    storage: clearAllStorage,
  };
  
  console.log('💡 Development cache utilities available:');
  console.log('   - window.clearCache.hard() - Complete reset');
  console.log('   - window.clearCache.soft() - Clear caches only');
  console.log('   - window.clearCache.caches() - Clear service worker caches');
  console.log('   - window.clearCache.serviceWorkers() - Unregister service workers');
  console.log('   - window.clearCache.storage() - Clear all storage');
}
