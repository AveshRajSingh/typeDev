import React from 'react';

const LoadingState = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8 p-8">
      <div
        className="rounded-xl p-8 shadow-lg text-center"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--primary)" }}
          ></div>
          <p style={{ color: "var(--secondary)" }}>Loading paragraph...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
