"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getPara } from "../services/api";
import { useTimer } from "./hooks/useTimer";
import { useTypingState } from "./hooks/useTypingState";
import { useCapsLock } from "./hooks/useCapsLock";
import StatsBar from "./ui/StatsBar";
import CapsLockWarning from "./ui/CapsLockWarning";
import TypingArea from "./ui/TypingArea";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";

const TypingParagraph = ({ timer, difficulty, includeSpecialChars, onComplete }) => {
  const [paragraph, setParagraph] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const textContainerRef = useRef(null);
  const lastScrollLine = useRef(0);
  const restartButtonRef = useRef(null);

  const fullText = paragraph.join(" ");
  const capsLockOn = useCapsLock();
  
  const typingState = useTypingState();
  const { 
    currentIndex, 
    typedText, 
    correctChars, 
    wrongChars, 
    correctCharsRef, 
    wrongCharsRef,
    handleBackspace,
    handleCharacter,
    reset: resetTyping
  } = typingState;

  const handleTestComplete = useCallback(() => {
    const timeElapsed = timer;
    const minutes = timeElapsed / 60;
    
    if (minutes === 0) return;
    
    const finalCorrectChars = correctCharsRef.current;
    const finalWrongChars = wrongCharsRef.current;
    
    const correctWords = finalCorrectChars / 5;
    const totalWords = (finalCorrectChars + finalWrongChars) / 5;
    
    const accurateWPM = Math.round(correctWords / minutes);
    const rawWPM = Math.round(totalWords / minutes);
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
  }, [timer, correctCharsRef, wrongCharsRef, onComplete]);

  const { timeLeft, isStarted: isTypingStarted, start: startTimer, reset: resetTimer } = useTimer(timer, handleTestComplete);

  const fetchParagraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    resetTyping();
    setScrollOffset(0);
    lastScrollLine.current = 0;
    setIsFocused(false);
    resetTimer();

    try {
      const response = await getPara(includeSpecialChars, "en", difficulty, timer);
      setParagraph(response.paragraph || []);
    } catch (error) {
      console.error("Failed to fetch paragraph:", error);
      setError("Failed to load paragraph. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [timer, difficulty, includeSpecialChars, resetTyping, resetTimer]);

  useEffect(() => {
    fetchParagraph();
  }, [timer, difficulty, includeSpecialChars]);

  useEffect(() => {
    if (inputRef.current && paragraph.length > 0) {
      inputRef.current.focus();
    }
  }, [paragraph]);

  useEffect(() => {
    if (textContainerRef.current && fullText.length > 0) {
      const charElements = textContainerRef.current.querySelectorAll('span');
      if (charElements[currentIndex]) {
        const charRect = charElements[currentIndex].getBoundingClientRect();
        const containerRect = textContainerRef.current.getBoundingClientRect();
        const relativeTop = charRect.top - containerRect.top;
        
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

    // Allow Tab to focus restart button
    if (key === "Tab") {
      e.preventDefault();
      restartButtonRef.current?.focus();
      return;
    }

    if (!isTypingStarted && key.length === 1) {
      startTimer();
    }

    if (key === "Backspace") {
      handleBackspace(fullText);
      return;
    }

    if (key.length === 1 && currentIndex < fullText.length) {
      const expectedChar = fullText[currentIndex];
      handleCharacter(key, expectedChar, fullText);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchParagraph} />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8">
      <div className="rounded-xl p-8 shadow-lg transition-all duration-300">
        {capsLockOn && <CapsLockWarning />}

        <StatsBar
          timeLeft={timeLeft}
          isTypingStarted={isTypingStarted}
          correctChars={correctChars}
          wrongChars={wrongChars}
          currentIndex={currentIndex}
          totalLength={fullText.length}
          onRestart={fetchParagraph}
          restartButtonRef={restartButtonRef}
        />

        <TypingArea
          fullText={fullText}
          currentIndex={currentIndex}
          typedText={typedText}
          isFocused={isFocused}
          scrollOffset={scrollOffset}
          textContainerRef={textContainerRef}
          onAreaClick={() => inputRef.current?.focus()}
        />

        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute"
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
        />

        <div className="mt-6 text-center">
          <p style={{ color: "var(--secondary)" }} className="text-sm">
            Click anywhere to start typing. Press Backspace to correct mistakes. Press Tab + Enter to restart.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypingParagraph;
