"use client";
import React, { useState, useEffect } from 'react';
import { getCacheStats, clearUserCache, clearExpiredCache } from '../services/cacheService';
import { warmParagraphCache } from '../utils/cacheWarming';

const CacheManager = ({ user }) => {
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load cache stats on mount
  useEffect(() => {
    loadCacheStats();
  }, [user]);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats(user);
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will require re-downloading content.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const deletedCount = await clearUserCache(user);
      setMessage({
        type: 'success',
        text: `✅ Successfully cleared ${deletedCount} cached items`,
      });
      await loadCacheStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Failed to clear cache: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearExpired = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const deletedCount = await clearExpiredCache(user);
      setMessage({
        type: 'success',
        text: `✅ Cleared ${deletedCount} expired items`,
      });
      await loadCacheStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Failed to clear expired cache: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWarmCache = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await warmParagraphCache(user);
      setMessage({
        type: 'success',
        text: '✅ Cache warmed successfully! All difficulty levels preloaded.',
      });
      await loadCacheStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Failed to warm cache: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cacheStats?.supported) {
    return (
      <div
        className="rounded-2xl p-6 shadow-lg"
        style={{ 
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)"
        }}
      >
        <h3 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
          💾 Offline Cache
        </h3>
        <p className="text-sm opacity-70" style={{ color: "var(--text)" }}>
          Cache Storage is not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-lg"
      style={{ 
        backgroundColor: "var(--card)",
        border: "2px solid var(--border)"
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
        💾 Offline Cache
      </h3>

      {/* Cache Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <p className="text-xs opacity-70 mb-1" style={{ color: "var(--text)" }}>
            Cached Items
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
            {cacheStats?.entries || 0}
          </p>
        </div>
        <div
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <p className="text-xs opacity-70 mb-1" style={{ color: "var(--text)" }}>
            Cache Size
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
            {cacheStats?.sizeFormatted || '0 KB'}
          </p>
        </div>
      </div>

      {cacheStats?.expired > 0 && (
        <div
          className="rounded-lg p-3 mb-4 text-sm"
          style={{ 
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)"
          }}
        >
          <span style={{ color: "#ef4444" }}>
            ⚠️ {cacheStats.expired} expired items found
          </span>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className="rounded-lg p-3 mb-4 text-sm"
          style={{ 
            backgroundColor: message.type === 'success' 
              ? "rgba(34, 197, 94, 0.1)" 
              : "rgba(239, 68, 68, 0.1)",
            border: message.type === 'success'
              ? "1px solid rgba(34, 197, 94, 0.3)"
              : "1px solid rgba(239, 68, 68, 0.3)"
          }}
        >
          <span style={{ 
            color: message.type === 'success' ? "#22c55e" : "#ef4444" 
          }}>
            {message.text}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleWarmCache}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            backgroundColor: "var(--primary)",
            color: "#ffffff",
          }}
        >
          {loading ? '⏳ Processing...' : '🔥 Preload All Paragraphs'}
        </button>

        {cacheStats?.expired > 0 && (
          <button
            onClick={handleClearExpired}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: "#f59e0b",
              color: "#ffffff",
            }}
          >
            {loading ? '⏳ Processing...' : '🧹 Clear Expired Items'}
          </button>
        )}

        <button
          onClick={handleClearCache}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
          }}
        >
          {loading ? '⏳ Processing...' : '🗑️ Clear All Cache'}
        </button>
      </div>

      <p className="text-xs opacity-50 mt-4 text-center" style={{ color: "var(--text)" }}>
        💡 Cached data allows offline access and faster loading
      </p>
    </div>
  );
};

export default CacheManager;
