import React from 'react';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="max-w-4xl mx-auto mt-8 p-8">
      <div
        className="rounded-xl p-8 shadow-lg text-center"
        style={{ backgroundColor: "var(--card)" }}
      >
        <p style={{ color: "var(--primary)" }} className="mb-4">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: "var(--primary)",
            color: "#ffffff",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
