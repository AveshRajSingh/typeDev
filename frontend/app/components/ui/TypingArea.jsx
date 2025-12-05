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
      backgroundColor: "var(--primary)",
      color: "#ffffff",
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
              className="transition-all duration-100"
              style={getCharacterStyle(index, currentIndex, typedText, fullText)}
            >
              {char}
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
