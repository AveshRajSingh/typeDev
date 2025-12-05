import { useState, useRef } from 'react';

export const useTypingState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [wrongChars, setWrongChars] = useState(0);
  
  const correctCharsRef = useRef(0);
  const wrongCharsRef = useRef(0);
  const consecutiveSpaces = useRef(0);

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

    setTypedText(typedText + key);
    
    if (key === expectedChar) {
      handleCorrectChar();
    } else {
      handleWrongChar();
    }
    
    setCurrentIndex(currentIndex + 1);
    return true;
  };

  const reset = () => {
    setCurrentIndex(0);
    setTypedText('');
    setCorrectChars(0);
    setWrongChars(0);
    correctCharsRef.current = 0;
    wrongCharsRef.current = 0;
    consecutiveSpaces.current = 0;
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
