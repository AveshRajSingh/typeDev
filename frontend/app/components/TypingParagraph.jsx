"use client";
import React, { useEffect, useState, useRef } from "react";
import { getPara } from "../services/api";

const TypingParagraph = ({ timer, difficulty, includeSpecialChars, onComplete }) => {
  const [paragraph, setParagraph] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [correctChars, setCorrectChars] = useState(0);
  const [wrongChars, setWrongChars] = useState(0);
  const inputRef = useRef(null);
  const textContainerRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollLine = useRef(0);
  const [timeLeft, setTimeLeft] = useState(timer);
  const [isTypingStarted, setIsTypingStarted] = useState(false);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const correctCharsRef = useRef(0);
  const wrongCharsRef = useRef(0);

  const fetchParagraph = async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setTypedText("");
    setCorrectChars(0);
    setWrongChars(0);
    correctCharsRef.current = 0;
    wrongCharsRef.current = 0;
    setScrollOffset(0);
    lastScrollLine.current = 0;
    setTimeLeft(timer);
    setIsTypingStarted(false);
    startTimeRef.current = null;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    try {
      const response = await getPara(
        includeSpecialChars,
        "en",
        difficulty,
        timer
      );
      setParagraph(response.paragraph || []);
    } catch (error) {
      console.error("Failed to fetch paragraph:", error);
      setError("Failed to load paragraph. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParagraph();
  }, [timer, difficulty, includeSpecialChars]);

  useEffect(() => {
    // Focus input when component mounts or paragraph changes
    if (inputRef.current && paragraph.length > 0) {
      inputRef.current.focus();
    }
  }, [paragraph]);

  // Timer countdown effect
  useEffect(() => {
    if (isTypingStarted && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            // Use setTimeout to ensure state is updated before calling handleTestComplete
            setTimeout(() => {
              handleTestComplete();
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [isTypingStarted]);

  // Effect to trigger completion when timer reaches 0
  useEffect(() => {
    if (isTypingStarted && timeLeft === 0) {
      handleTestComplete();
    }
  }, [timeLeft]);

  const handleTestComplete = () => {
    // Use the full timer duration for calculation
    const timeElapsed = timer;
    const minutes = timeElapsed / 60;
    
    // Prevent division by zero
    if (minutes === 0) return;
    
    // Use ref values to get the latest counts
    const finalCorrectChars = correctCharsRef.current;
    const finalWrongChars = wrongCharsRef.current;
    
    // Calculate words (5 characters = 1 word)
    const correctWords = finalCorrectChars / 5;
    const totalWords = (finalCorrectChars + finalWrongChars) / 5;
    
    // Accurate WPM (only correct characters)
    const accurateWPM = Math.round(correctWords / minutes);
    
    // Raw WPM (all typed characters)
    const rawWPM = Math.round(totalWords / minutes);
    
    // Accuracy percentage
    const accuracy = Math.round((finalCorrectChars / (finalCorrectChars + finalWrongChars)) * 100) || 0;

    if (onComplete) {
      onComplete({
        correctChars: finalCorrectChars,
        wrongChars: finalWrongChars,
        accurateWPM: accurateWPM || 0,
        rawWPM: rawWPM || 0,
        accuracy,
        timeElapsed,
      });
    }
  };

  const fullText = paragraph.join(" ");

  useEffect(() => {
    // Update scroll position based on current character position
    if (textContainerRef.current && fullText.length > 0) {
      const charElements = textContainerRef.current.querySelectorAll('span');
      if (charElements[currentIndex]) {
        const charRect = charElements[currentIndex].getBoundingClientRect();
        const containerRect = textContainerRef.current.getBoundingClientRect();
        const relativeTop = charRect.top - containerRect.top;
        
        // Start scrolling when cursor reaches bottom of 3rd line (180px from top)
        // Only scroll once per line by checking if we've moved down a full line
        const shouldScrollLine = Math.floor(relativeTop / 60);
        
        if (relativeTop >= 180 && shouldScrollLine > lastScrollLine.current) {
          lastScrollLine.current = shouldScrollLine;
          setScrollOffset(prev => prev + 60);
        }
      }
    }
  }, [currentIndex, fullText]);

  const handleKeyPress = (e) => {
    const key = e.key;

    // Start timer on first keypress
    if (!isTypingStarted && key.length === 1) {
      setIsTypingStarted(true);
      startTimeRef.current = Date.now();
    }

    if (key === "Backspace") {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setTypedText(typedText.slice(0, -1));
        // Adjust correct/wrong counts
        if (typedText[typedText.length - 1] === fullText[currentIndex - 1]) {
          setCorrectChars(prev => {
            const newVal = prev - 1;
            correctCharsRef.current = newVal;
            return newVal;
          });
        } else {
          setWrongChars(prev => {
            const newVal = prev - 1;
            wrongCharsRef.current = newVal;
            return newVal;
          });
        }
      }
      return;
    }

    if (key.length === 1 && currentIndex < fullText.length) {
      const expectedChar = fullText[currentIndex];
      setTypedText(typedText + key);

      if (key === expectedChar) {
        setCorrectChars(prev => {
          const newVal = prev + 1;
          correctCharsRef.current = newVal;
          return newVal;
        });
      } else {
        setWrongChars(prev => {
          const newVal = prev + 1;
          wrongCharsRef.current = newVal;
          return newVal;
        });
      }

      setCurrentIndex(currentIndex + 1);
    }
  };

  const getCharacterStyle = (index) => {
    if (index < currentIndex) {
      // Already typed
      if (typedText[index] === fullText[index]) {
        return { color: "#22c55e" }; // Green for correct
      } else {
        return { color: "#ef4444", textDecoration: "underline" }; // Red for wrong
      }
    } else if (index === currentIndex) {
      // Current character
      return {
        backgroundColor: "var(--primary)",
        color: "#ffffff",
      };
    } else {
      // Not yet typed
      return { color: "var(--secondary)", opacity: 0.6 };
    }
  };

  // Calculate which lines to show (3-line window)
  const getVisibleText = () => {
    const charsPerLine = 60; // Approximate characters per line
    const lineHeight = 60; // Height of each line in pixels
    const currentLine = Math.floor(currentIndex / charsPerLine);

    return {
      currentLine,
    };
  };

  const { currentLine } = getVisibleText();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div
          className="rounded-xl p-8 shadow-lg text-center"
          style={{
            backgroundColor: "var(--card)",
          }}
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
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div
          className="rounded-xl p-8 shadow-lg text-center"
          style={{
            backgroundColor: "var(--card)",
          }}
        >
          <p style={{ color: "var(--primary)" }} className="mb-4">
            {error}
          </p>
          <button
            onClick={fetchParagraph}
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
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8">
      <div
        className="rounded-xl p-8 shadow-lg transition-all duration-300"
      >
        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-6">
            <div>
              <span style={{ color: "var(--secondary)" }} className="text-sm">
                Time:{" "}
              </span>
              <span style={{ color: isTypingStarted ? "var(--primary)" : "var(--foreground)" }} className="font-semibold text-2xl">
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
                {currentIndex}/{fullText.length}
              </span>
            </div>
          </div>
          <button
            onClick={fetchParagraph}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--input)",
              color: "var(--foreground)",
            }}
          >
            ↻ Restart
          </button>
        </div>

        {/* Typing Area - 3 Line Window */}
        <div
          className="relative overflow-hidden"
          style={{ height: "200px" }} // Fixed height for 3 lines
          onClick={() => inputRef.current?.focus()}
        >
          <div
            ref={textContainerRef}
            className="text-3xl leading-relaxed font-mono tracking-wide transition-transform duration-300 whitespace-pre-wrap"
            style={{
              transform: `translateY(-${scrollOffset}px)`,
              lineHeight: "60px",
            }}
          >
            {fullText.length > 0 ? (
              fullText.split("").map((char, index) => (
                <span
                  key={index}
                  className="transition-all duration-100"
                  style={getCharacterStyle(index)}
                >
                  {char}
                </span>
              ))
            ) : (
              <p
                className="text-center"
                style={{ color: "var(--secondary)" }}
              >
                No paragraph available. Please adjust settings and try again.
              </p>
            )}
          </div>
        </div>

        {/* Hidden Input for Key Detection */}
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute"
          onKeyDown={handleKeyPress}
          autoFocus
        />

        {/* Instruction */}
        <div className="mt-6 text-center">
          <p style={{ color: "var(--secondary)" }} className="text-sm">
            Click anywhere to start typing. Press Backspace to correct mistakes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypingParagraph;
