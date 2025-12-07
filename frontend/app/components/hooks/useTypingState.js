import { useState, useRef } from 'react';

export const useTypingState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [wrongChars, setWrongChars] = useState(0);
  
  const correctCharsRef = useRef(0);
  const wrongCharsRef = useRef(0);
  const consecutiveSpaces = useRef(0);
  const consecutiveWrongAttempts = useRef(0);

  const handleCorrectChar = () => {
    setCorrectChars(prev => {
      const newVal = prev + 1;
      correctCharsRef.current = newVal;
      return newVal;
    });
  };

  const handleWrongChar = () => {
    setWrongChars(prev => {
      const newVal = prev + 1;
      wrongCharsRef.current = newVal;
      return newVal;
    });
  };

  const handleBackspace = (fullText) => {
    if (currentIndex > 0) {
      if (fullText[currentIndex - 1] === ' ') {
        consecutiveSpaces.current = Math.max(0, consecutiveSpaces.current - 1);
      }

      setCurrentIndex(currentIndex - 1);
      setTypedText(typedText.slice(0, -1));

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
    
    // Reset consecutive wrong attempts when backspacing
    consecutiveWrongAttempts.current = 0;
  };

  const handleCharacter = (key, expectedChar, fullText) => {
    // Prevent more than 2 consecutive spaces if next expected char is NOT a space
    if (key === ' ' && expectedChar !== ' ') {
      if (consecutiveSpaces.current >= 2) {
        return false;
      }
      consecutiveSpaces.current++;
    } else if (key !== ' ') {
      consecutiveSpaces.current = 0;
    }

    // Check if the key is correct
    if (key === expectedChar) {
      // Reset consecutive wrong attempts on correct key
      consecutiveWrongAttempts.current = 0;
      
      setTypedText(typedText + key);
      handleCorrectChar();
      setCurrentIndex(currentIndex + 1);
      return true;
    } else {
      // Increment wrong attempts counter
      consecutiveWrongAttempts.current++;
      
      // If 3 or more consecutive wrong attempts, don't move cursor
      if (consecutiveWrongAttempts.current >= 3) {
        // Still count as wrong char but don't advance
        handleWrongChar();
        return false;
      }
      
      // Less than 3 wrong attempts, allow cursor to move
      setTypedText(typedText + key);
      handleWrongChar();
      setCurrentIndex(currentIndex + 1);
      return true;
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setTypedText('');
    setCorrectChars(0);
    setWrongChars(0);
    correctCharsRef.current = 0;
    wrongCharsRef.current = 0;
    consecutiveSpaces.current = 0;
    consecutiveWrongAttempts.current = 0;
  };

  return {
    currentIndex,
    typedText,
    correctChars,
    wrongChars,
    correctCharsRef,
    wrongCharsRef,
    handleBackspace,
    handleCharacter,
    reset,
  };
};
