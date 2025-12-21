import React from 'react';

const getCharacterStyle = (index, currentIndex, typedText, fullText) => {
  if (index < currentIndex) {
    if (typedText[index] === fullText[index]) {
      return { color: "#22c55e" };
    } else {
      return { color: "#ef4444", textDecoration: "underline" };
    }
  } else if (index === currentIndex) {
    return {
      position: 'relative',
    };
  } else {
    return { color: "var(--secondary)", opacity: 0.6 };
  }
};

const TypingArea = ({ 
  fullText, 
  currentIndex, 
  typedText, 
  isFocused, 
  scrollOffset, 
  textContainerRef, 
  onAreaClick 
}) => {
  return (
    <div
      className="relative overflow-hidden"
      style={{ height: "200px" }}
      onClick={onAreaClick}
    >
      {!isFocused && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div 
            className="p-4 rounded-lg" 
            style={{ backgroundColor: "var(--card)", border: "2px solid var(--primary)" }}
          >
            <p style={{ color: "var(--primary)", fontSize: "18px", fontWeight: "600" }}>
              Click here to start typing
            </p>
          </div>
        </div>
      )}
      
      <div
        ref={textContainerRef}
        className="text-3xl leading-relaxed font-mono tracking-wide transition-transform duration-300 whitespace-pre-wrap"
        style={{
          transform: `translateY(-${scrollOffset}px)`,
          lineHeight: "60px",
          filter: !isFocused ? "blur(5px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        {fullText.length > 0 ? (
          fullText.split("").map((char, index) => (
            <span
              key={index}
              style={{
                ...getCharacterStyle(index, currentIndex, typedText, fullText),
                transition: 'color 0.15s ease',
              }}
            >
              {char}
              {index === currentIndex && (
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: 'var(--primary)',
                    opacity: 0.15,
                    animation: 'cursorPulse 1s ease-in-out infinite',
                    borderRadius: '2px',
                    transition: 'opacity 0.15s ease',
                  }}
                />
              )}
              {index === currentIndex && (
                <span
                  className="absolute left-0 top-0 bottom-0 pointer-events-none"
                  style={{
                    width: '3px',
                    backgroundColor: 'var(--primary)',
                    animation: 'cursorBlink 1s step-end infinite',
                    borderRadius: '2px',
                    transition: 'all 0.15s ease',
                  }}
                />
              )}
            </span>
          ))
        ) : (
          <p className="text-center" style={{ color: "var(--secondary)" }}>
            No paragraph available. Please adjust settings and try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default TypingArea;
