/**
 * Offline-safe Navigation Utility
 * Handles client-side navigation that works even when offline
 * Uses Next.js router normally - Service Worker handles offline page caching
 */

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Custom hook for navigation with transition support
 * Service Worker ensures pages work offline
 */
export const useOfflineRouter = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const push = (href) => {
    startTransition(() => {
      router.push(href);
    });
  };

  const replace = (href) => {
    startTransition(() => {
      router.replace(href);
    });
  };

  const back = () => {
    router.back();
  };

  return {
    push,
    replace,
    back,
    isPending,
  };
};

/**
 * Simple navigation function for non-hook contexts
 * Service Worker ensures it works offline
 */
export const navigateOffline = (href) => {
  // Just use window.location for simple navigation
  // Service Worker will serve cached page if offline
  window.location.href = href;
};
