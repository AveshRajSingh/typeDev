"use client";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import ThemeSelector from "../components/ThemeSelector";
import Results from "../components/Results";
import { loadTestResults, clearTestResults } from "../utils/testResultsStorage";
import LoadingState from "../components/ui/LoadingState";



export default function ResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const [isPending, startTransition] = useTransition();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load test results from sessionStorage
    const results = loadTestResults();
    
    if (!results) {
      // No results found, redirect to home
      startTransition(() => {
        router.push('/');
      });
      return;
    }

    setTestData(results);
    setLoading(false);
  }, []);

  const handleRestart = () => {
    // Clear results and go back to home
    clearTestResults();
    startTransition(() => {
      router.push('/');
    });
  };

  const handleParagraphGenerated = (paragraph) => {
    setTestData(prev => ({
      ...prev,
      aiGeneratedParagraph: paragraph
    }));
  };

  const handleProfileClick = () => {
    if (user?.username) {
      startTransition(() => {
        router.push(`/profile/${user.username}`);
      });
    }
  };

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <LoadingState />
      </main>
    );
  }

  if (!testData) {
    return null; // Will redirect
  }

  return (
    <main
      className="min-h-screen p-4"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <button
          onClick={handleRestart}
          className="p-2 rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--primary)" }}
          aria-label="Back to home"
          title="Back to Home"
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
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <div className="flex gap-3 items-center">
          {isAuthenticated && user ? (
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
      </div>

      {/* Results Component */}
      <Results
        stats={testData.stats}
        onRestart={handleRestart}
        errorFrequencyMap={testData.errorFrequencyMap}
        difficulty={testData.difficulty}
        timeInSeconds={testData.timeInSeconds}
        user={user}
        isAuthenticated={isAuthenticated}
        onParagraphGenerated={handleParagraphGenerated}
      />
    </main>
  );
}
