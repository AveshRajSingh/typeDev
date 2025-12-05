"use client";
import React, { useEffect, useState } from "react";

const AuthModal = ({ isOpen, onClose, children }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-20 right-4 z-50 w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
          isAnimating
            ? "opacity-100 translate-x-0 scale-100"
            : "opacity-0 translate-x-8 scale-95"
        }`}
        style={{
          backgroundColor: "var(--card)",
          backdropFilter: "blur(10px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:rotate-90 hover:scale-110"
            style={{ 
              color: "var(--foreground)",
              backgroundColor: "var(--input)",
            }}
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
