"use client";
import React from "react";

const Results = ({ stats, onRestart }) => {
  const { correctChars, wrongChars, accurateWPM, rawWPM, accuracy } = stats;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-8">
      <div
        className="rounded-xl p-12 shadow-2xl transition-all duration-300"
      >
        {/* Title */}
        <h1
          className="text-4xl font-bold text-center mb-8"
          style={{ color: "var(--primary)" }}
        >
          Test Complete!
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Accurate WPM */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Accurate WPM
            </p>
            <p
              style={{ color: "var(--primary)" }}
              className="text-5xl font-bold"
            >
              {accurateWPM}
            </p>
          </div>

          {/* Raw WPM */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Raw WPM
            </p>
            <p
              style={{ color: "var(--primary)" }}
              className="text-5xl font-bold"
            >
              {rawWPM}
            </p>
          </div>

          {/* Accuracy */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Accuracy
            </p>
            <p style={{ color: "#22c55e" }} className="text-5xl font-bold">
              {accuracy.toFixed(1)}%
            </p>
          </div>

          {/* Characters */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Characters
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <div>
                <span style={{ color: "#22c55e" }} className="text-2xl font-bold">
                  {correctChars}
                </span>
                <span style={{ color: "var(--secondary)" }} className="text-sm ml-1">
                  correct
                </span>
              </div>
              <div>
                <span style={{ color: "#ef4444" }} className="text-2xl font-bold">
                  {wrongChars}
                </span>
                <span style={{ color: "var(--secondary)" }} className="text-sm ml-1">
                  wrong
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
            }}
          >
            ↻ Try Again
          </button>
        </div>

        {/* Info Text */}
        <p
          style={{ color: "var(--secondary)" }}
          className="text-center text-sm mt-6"
        >
          Accurate WPM counts only correct characters. Raw WPM includes all typed characters.
        </p>
      </div>
    </div>
  );
};

export default Results;
