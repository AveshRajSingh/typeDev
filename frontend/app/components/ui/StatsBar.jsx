import React from 'react';

const StatsBar = ({ timeLeft, isTypingStarted, correctChars, wrongChars, currentIndex, totalLength, onRestart, restartButtonRef }) => {
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="flex gap-6">
        <div>
          <span style={{ color: "var(--secondary)" }} className="text-sm">
            Time:{" "}
          </span>
          <span 
            style={{ color: isTypingStarted ? "var(--primary)" : "var(--foreground)" }} 
            className="font-semibold text-2xl"
          >
            {timeLeft}s
          </span>
        </div>
        <div>
          <span style={{ color: "var(--secondary)" }} className="text-sm">
            Correct:{" "}
          </span>
          <span style={{ color: "#22c55e" }} className="font-semibold">
            {correctChars}
          </span>
        </div>
        <div>
          <span style={{ color: "var(--secondary)" }} className="text-sm">
            Wrong:{" "}
          </span>
          <span style={{ color: "#ef4444" }} className="font-semibold">
            {wrongChars}
          </span>
        </div>
        <div>
          <span style={{ color: "var(--secondary)" }} className="text-sm">
            Progress:{" "}
          </span>
          <span style={{ color: "var(--foreground)" }} className="font-semibold">
            {currentIndex}/{totalLength}
          </span>
        </div>
      </div>
      <button
        ref={restartButtonRef}
        onClick={onRestart}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: "var(--input)",
          color: "var(--foreground)",
        }}
      >
        ↻ Restart
      </button>
    </div>
  );
};

export default StatsBar;
