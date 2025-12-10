"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getPara, startTest } from "../services/api";
import { useTimer, useTypingState, useCapsLock } from "./hooks";
import { StatsBar, CapsLockWarning, TypingArea, LoadingState, ErrorState } from "./ui";
import { useUser } from "../context/UserContext";

const TypingParagraph = ({ timer, difficulty, includeSpecialChars, onComplete, isAuthenticated, customParagraph }) => {
  const { user } = useUser();
  const [paragraph, setParagraph] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [hasIncrementedTest, setHasIncrementedTest] = useState(false);

  const inputRef = useRef(null);
  const textContainerRef = useRef(null);
  const lastScrollLine = useRef(0);
  const restartButtonRef = useRef(null);
  const lastFetchParams = useRef({ timer: null, difficulty: null, includeSpecialChars: null });
  const initialFetchDone = useRef(false);

  const fullText = paragraph.join(" ");
  const capsLockOn = useCapsLock();
  
  // Reset state and force fetch on mount (handles navigation back)
  useEffect(() => {
    // Force refetch when component mounts
    if (paragraph.length === 0 && !loading) {
      initialFetchDone.current = false;
      lastFetchParams.current = { timer: null, difficulty: null, includeSpecialChars: null };
    }
    
    return () => {
      // Cleanup: reset everything when component unmounts
      initialFetchDone.current = false;
      lastFetchParams.current = { timer: null, difficulty: null, includeSpecialChars: null };
    };
  }, []);
  
  const typingState = useTypingState();
  const { 
    currentIndex, 
    typedText, 
    correctChars, 
    wrongChars,
    errorLog,
    errorFrequencyMap, 
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
        errorLog: errorLog,
        errorFrequencyMap: errorFrequencyMap,
      });
    }
  }, [timer, correctCharsRef, wrongCharsRef, onComplete, errorLog, errorFrequencyMap]);

  const { timeLeft, isStarted: isTypingStarted, start: startTimer, pause: pauseTimer, resume: resumeTimer, reset: resetTimer } = useTimer(timer, handleTestComplete);

  const fetchParagraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    resetTyping();
    setScrollOffset(0);
    lastScrollLine.current = 0;
    setIsFocused(false);
    resetTimer();
    setHasIncrementedTest(false);

    try {
      // Use custom AI-generated paragraph if provided
      if (customParagraph?.content) {
        setParagraph(customParagraph.content);
        setLoading(false);
        return;
      }
      
      // getPara has built-in fallbacks (cache → offline generation)
      // It should never throw, but we'll handle errors defensively
      const response = await getPara(includeSpecialChars, "en", difficulty, timer, user);
      
      // Validate response has paragraph array
      if (response && response.paragraph && Array.isArray(response.paragraph)) {
        setParagraph(response.paragraph);
      } else {
        console.error("Invalid paragraph response:", response);
        // Generate a basic fallback paragraph instead of showing error
        setParagraph(['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog']);
      }
    } catch (error) {
      console.error("Unexpected error in fetchParagraph:", error);
      // Never show error to user - provide fallback paragraph
      setParagraph(['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog']);
    } finally {
      setLoading(false);
    }
  }, [timer, difficulty, includeSpecialChars, resetTyping, resetTimer, customParagraph, user]);

  // Only fetch on mount and when settings actually change
  useEffect(() => {
    const settingsChanged = 
      lastFetchParams.current.timer !== timer ||
      lastFetchParams.current.difficulty !== difficulty ||
      lastFetchParams.current.includeSpecialChars !== includeSpecialChars;

    // Always fetch if paragraph is empty
    if (paragraph.length === 0) {
      lastFetchParams.current = { timer, difficulty, includeSpecialChars };
      initialFetchDone.current = true;
      fetchParagraph();
      return;
    }

    // Skip if we already have a paragraph and settings haven't changed
    if (initialFetchDone.current && !settingsChanged && !customParagraph) {
      return;
    }

    // Update last fetch params and fetch
    lastFetchParams.current = { timer, difficulty, includeSpecialChars };
    initialFetchDone.current = true;
    fetchParagraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, difficulty, includeSpecialChars, customParagraph, paragraph.length]);

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

  const handleKeyPress = async (e) => {
    const key = e.key;

    // Allow Tab to focus restart button
    if (key === "Tab") {
      e.preventDefault();
      restartButtonRef.current?.focus();
      return;
    }

    if (!isTypingStarted && key.length === 1) {
      startTimer();
      
      // Increment testsTaken when user starts typing (only for authenticated users)
      if (isAuthenticated && !hasIncrementedTest) {
        setHasIncrementedTest(true);
        try {
          await startTest();
        } catch (error) {
          console.error("Failed to increment test counter:", error);
        }
      }
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
          onFocus={() => {
            setIsFocused(true);
            // Resume timer when user focuses back if typing has started
            if (isTypingStarted) {
              resumeTimer();
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Pause timer when user loses focus if typing has started
            if (isTypingStarted) {
              pauseTimer();
            }
          }}
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
