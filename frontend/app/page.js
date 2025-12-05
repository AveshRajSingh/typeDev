"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./context/UserContext";
import ThemeSelector from "./components/ThemeSelector";
import TypingSettings from "./components/TypingSettings";
import TypingParagraph from "./components/TypingParagraph";
import Results from "./components/Results";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUser();
  const [timer, setTimer] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleTestComplete = (stats) => {
    setTestResults(stats);
    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    setTestResults(null);
  };

  const handleProfileClick = () => {
    if (user?.username) {
      router.push(`/profile/${user.username}`);
    }
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
        {isAuthenticated && user ? (
          <>
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-full hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--primary)" }}
              aria-label="View profile"
              title="View Profile"
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
          </>
        ) : (
          <button
            onClick={() => router.push('/auth')}
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
        )}
        <ThemeSelector />
      </div>

      {showResults ? (
        <Results stats={testResults} onRestart={handleRestart} />
      ) : (
        <>
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
            onComplete={handleTestComplete}
          />
        </>
      )}
    </main>
  );
}
