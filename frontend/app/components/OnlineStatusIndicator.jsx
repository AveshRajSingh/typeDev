"use client";
import React, { useState, useEffect } from 'react';
import { isOnline, onConnectionChange } from '../services/cacheService';

const OnlineStatusIndicator = () => {
  const [online, setOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial status
    setOnline(isOnline());

    // Listen for changes
    const cleanup = onConnectionChange((status) => {
      setOnline(status);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    });

    return cleanup;
  }, []);

  return (
    <>
      {/* Persistent Indicator */}
      <div
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300"
        style={{
          backgroundColor: online ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)",
          color: "#ffffff",
        }}
        title={online ? "You are online" : "You are offline - Using cached data"}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: "#ffffff",
          }}
        />
        <span className="text-xs font-semibold">
          {online ? "Online" : "Offline"}
        </span>
      </div>

      {/* Toast Notification on Status Change */}
      {showNotification && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-bounce"
          style={{
            backgroundColor: online ? "rgba(34, 197, 94, 0.95)" : "rgba(239, 68, 68, 0.95)",
            color: "#ffffff",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {online ? "🟢" : "🔴"}
            </span>
            <div>
              <p className="font-bold text-sm">
                {online ? "Back Online!" : "Connection Lost"}
              </p>
              <p className="text-xs opacity-90">
                {online 
                  ? "You're connected to the internet" 
                  : "Using cached data for offline access"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnlineStatusIndicator;
