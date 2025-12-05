"use client";
import React from "react";

const TypingSettings = ({
  timer,
  setTimer,
  difficulty,
  setDifficulty,
  includeSpecialChars,
  setIncludeSpecialChars,
}) => {
  const timeOptions = [30, 60, 120];
  const difficultyOptions = ["easy", "medium", "hard"];

  return (
    <div className="max-w-4xl mx-auto mt-20 mb-8">
      <div
        className="rounded-xl px-6 py-4 shadow-lg transition-all duration-300 flex items-center justify-center gap-6"
        style={{
          backgroundColor: "var(--card)",
        }}
      >
        {/* Timer Options */}
        <div className="flex items-center gap-2">
          {timeOptions.map((time) => (
            <button
              key={time}
              onClick={() => setTimer(time)}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                color: timer === time ? "var(--primary)" : "var(--secondary)",
              }}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div
          className="h-8 w-px"
          style={{ backgroundColor: "var(--border)" }}
        ></div>

        {/* Difficulty Options */}
        <div className="flex items-center gap-2">
          {difficultyOptions.map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 capitalize"
              style={{
                color: difficulty === level ? "var(--primary)" : "var(--secondary)",
                scale: difficulty === level ? "1.25" : "1",
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div
          className="h-8 w-px"
          style={{ backgroundColor: "var(--border)" }}
        ></div>

        {/* Special Characters Toggle */}
        <div className="flex items-center gap-2">
         
          <button
            onClick={() => setIncludeSpecialChars(!includeSpecialChars)}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{
              color: includeSpecialChars ? "var(--primary)" : "var(--secondary)",
            }}
          >
            special chars
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypingSettings;
