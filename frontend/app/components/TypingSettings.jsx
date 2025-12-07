"use client";
import React, { useState } from "react";

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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState("");

  return (
    <div className="max-w-4xl mx-auto mt-20 mb-8">
      <div
        className="rounded-xl px-6 py-4 shadow-lg transition-all duration-300 flex items-center justify-center gap-6"
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
          {/* Custom Time Input */}
          {showCustomInput ? (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customTimeValue}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setCustomTimeValue(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customTimeValue) {
                  let time = Number(customTimeValue);
                  if (time < 10) time = 10;
                  if (time > 300) time = 300;
                  setTimer(time);
                  setShowCustomInput(false);
                  setCustomTimeValue("");
                } else if (e.key === "Escape") {
                  setShowCustomInput(false);
                  setCustomTimeValue("");
                }
              }}
              onBlur={() => {
                if (customTimeValue) {
                  let time = Number(customTimeValue);
                  if (time < 10) time = 10;
                  if (time > 300) time = 300;
                  setTimer(time);
                }
                setShowCustomInput(false);
                setCustomTimeValue("");
              }}
              autoFocus
              placeholder="10"
              className="w-16 px-2 py-2 rounded-lg font-medium text-center outline-none transition-all duration-200"
              style={{
                color: "var(--primary)",
                backgroundColor: "var(--background)",
                border: "2px solid var(--primary)",
                MozAppearance: "textfield",
              }}
            />
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              className="px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                color: !timeOptions.includes(timer) ? "var(--primary)" : "var(--secondary)",
              }}
              title="Set custom time"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
              </svg>
            </button>
          )}
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
