"use client";
import { useState, useEffect } from "react";
import { useUser } from "./context/UserContext";
import ThemeSelector from "./components/ThemeSelector";
import TypingSettings from "./components/TypingSettings";
import TypingParagraph from "./components/TypingParagraph";
import PremiumPlans from "./components/PremiumPlans";
import { saveTestResults } from "./utils/testResultsStorage";
import { isOnline } from "./services/cacheService";
import { useOfflineRouter } from "./utils/offlineNavigation";

export default function Home() {
  const router = useOfflineRouter();
  const { user, isAuthenticated, logout } = useUser();
  const [timer, setTimer] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);
  const [aiGeneratedParagraph, setAiGeneratedParagraph] = useState(null);

  // Check for AI generated paragraph in sessionStorage on mount
  useEffect(() => {
    const storedParagraph = sessionStorage.getItem('aiGeneratedParagraph');
    if (storedParagraph) {
      try {
        const paragraph = JSON.parse(storedParagraph);
        setAiGeneratedParagraph(paragraph);
        // Clear it so it's only used once
        sessionStorage.removeItem('aiGeneratedParagraph');
      } catch (error) {
        console.error('Error parsing stored paragraph:', error);
      }
    }
  }, []);

  const handleTestComplete = async (stats) => {
    // Only show results and save if user actually typed something
    if (stats.correctChars === 0 && stats.wrongChars === 0) {
      // User didn't type anything, don't save or show results
      return;
    }

    // Save result for authenticated users to backend
    if (isAuthenticated && isOnline()) {
      try {
        const { saveTestResult } = await import('./services/api');
        await saveTestResult({
          wpm: stats.accurateWPM,
          accuracy: stats.accuracy,
          rawWPM: stats.rawWPM,
          correctChars: stats.correctChars,
          wrongChars: stats.wrongChars,
          timeInSeconds: timer,
        });
      } catch (error) {
        console.error("Failed to save test result:", error);
        // Continue to results page even if save fails
      }
    } else if (isAuthenticated && !isOnline()) {
      console.warn("⚠️ Offline - Test result will not be saved to server");
    }

    // Save to sessionStorage and navigate to results page
    const testData = {
      stats: {
        correctChars: stats.correctChars,
        wrongChars: stats.wrongChars,
        accurateWPM: stats.accurateWPM,
        rawWPM: stats.rawWPM,
        accuracy: stats.accuracy,
      },
      errorFrequencyMap: stats.errorFrequencyMap,
      difficulty,
      timeInSeconds: timer,
    };

    saveTestResults(testData);
    router.push('/results');
  };

  const handleParagraphGenerated = (paragraph) => {
    setAiGeneratedParagraph(paragraph);
  };

  const handleProfileClick = () => {
    if (user?.username) {
      router.push(`/profile/${user.username}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Navigation is handled by logout function
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
            {user.isAdmin && (
              <button
                onClick={() => router.push('/admin/payments')}
                className="px-4 py-2 rounded-full hover:opacity-80 transition-opacity font-semibold text-white"
                style={{ backgroundColor: "var(--primary)" }}
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                🛡️ Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full hover:opacity-80 transition-opacity font-semibold text-white"
              style={{ backgroundColor: "#dc2626" }}
              aria-label="Logout"
              title="Logout"
            >
              Logout
            </button>
            <button
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-white text-lg"
              style={{ backgroundColor: "var(--primary)" }}
              aria-label="View profile"
              title="View Profile"
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
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
        isAuthenticated={isAuthenticated}
        customParagraph={aiGeneratedParagraph}
      />

      {/* Premium Plans - Show on homepage */}
      <PremiumPlans />
    </main>
  );
}
