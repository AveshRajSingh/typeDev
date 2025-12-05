"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeSelector from "./components/ThemeSelector";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import AuthModal from "./components/auth/AuthModal";
import TypingSettings from "./components/TypingSettings";
import TypingParagraph from "./components/TypingParagraph";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState("login"); // 'login' or 'signup'
  const [timer, setTimer] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);

  const handleOpenAuth = (view = "login") => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  const handleSwitchToSignup = () => {
    setAuthView("signup");
  };

  const handleSwitchToLogin = () => {
    setAuthView("login");
  };

  return (
    <main
      className="min-h-screen p-4"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="absolute top-4 right-4 flex gap-3 items-center">
        <button
          onClick={() => handleOpenAuth("login")}
          className="p-2 rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--primary)" }}
          aria-label="User account"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </button>
        <ThemeSelector />
      </div>

      {/* Typing Settings Component */}
      <TypingSettings
        timer={timer}
        setTimer={setTimer}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        includeSpecialChars={includeSpecialChars}
        setIncludeSpecialChars={setIncludeSpecialChars}
      />

      {/* Typing Paragraph Component */}
      <TypingParagraph
        timer={timer}
        difficulty={difficulty}
        includeSpecialChars={includeSpecialChars}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuth}>
        {authView === "login" ? (
          <Login onSwitchToSignup={handleSwitchToSignup} />
        ) : (
          <Signup onSwitchToLogin={handleSwitchToLogin} />
        )}
      </AuthModal>
    </main>
  );
}
