"use client";
import React, { useState, useEffect } from "react";
import { getAIFeedback, generateAIParagraph } from "../services/api";

const Results = ({ stats, onRestart, errorFrequencyMap, difficulty, timeInSeconds, user, isAuthenticated, onParagraphGenerated }) => {
  const { correctChars, wrongChars, accurateWPM, rawWPM, accuracy } = stats;
  
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingParagraph, setLoadingParagraph] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [paragraphError, setParagraphError] = useState(null);
  const [feedbackQuota, setFeedbackQuota] = useState(null);
  const [paragraphQuota, setParagraphQuota] = useState(null);
  const [guestToken, setGuestToken] = useState(null);

  // Initialize guest token and quotas on mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Get or create guest token from localStorage
      let token = localStorage.getItem('guestFeedbackToken');
      if (!token) {
        token = 'guest_v1_0';
        localStorage.setItem('guestFeedbackToken', token);
      }
      setGuestToken(token);
      
      // Parse remaining quota from token
      const usedCount = parseInt(token.split('_')[2] || 0);
      setFeedbackQuota(3 - usedCount);
    } else if (user) {
      // Set quotas from user data
      setFeedbackQuota(user.isPremium ? -1 : user.freeFeedbackLeft);
      setParagraphQuota(user.isPremium ? -1 : user.freeParagraphGenLeft);
    }
  }, [isAuthenticated, user]);

  const handleGetFeedback = async () => {
    setLoadingFeedback(true);
    setFeedbackError(null);
    
    try {
      const testData = {
        correctChars,
        wrongChars,
        accuracy,
        wpm: accurateWPM,
        errorFrequencyMap: errorFrequencyMap || {},
      };

      const response = await getAIFeedback(
        testData,
        difficulty,
        timeInSeconds,
        isAuthenticated ? null : guestToken
      );

      setAiFeedback(response.feedback);
      setFeedbackQuota(response.quotaRemaining);

      // Update guest token if guest user
      if (response.newGuestToken) {
        localStorage.setItem('guestFeedbackToken', response.newGuestToken);
        setGuestToken(response.newGuestToken);
      }

    } catch (error) {
      setFeedbackError(error.message);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleGenerateParagraph = async () => {
    if (!isAuthenticated) {
      setParagraphError("Please log in to generate custom paragraphs");
      return;
    }

    setLoadingParagraph(true);
    setParagraphError(null);

    try {
      const response = await generateAIParagraph(
        errorFrequencyMap || {},
        50,
        difficulty
      );

      setParagraphQuota(response.quotaRemaining);
      
      // Pass generated paragraph back to parent
      if (onParagraphGenerated) {
        onParagraphGenerated(response.paragraph);
      }

      alert("Custom practice paragraph generated! Click 'Try Again' to practice with it.");

    } catch (error) {
      setParagraphError(error.message);
    } finally {
      setLoadingParagraph(false);
    }
  };

  const getQuotaDisplay = () => {
    if (feedbackQuota === null) return "";
    if (feedbackQuota === -1) return "Unlimited";
    return `${feedbackQuota} left`;
  };

  const getParagraphQuotaDisplay = () => {
    if (paragraphQuota === null) return "";
    if (paragraphQuota === -1) return "Unlimited";
    return `${paragraphQuota}/5 left`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 p-8">
      <div
        className="rounded-xl p-12 shadow-2xl transition-all duration-300"
      >
        {/* Title */}
        <h1
          className="text-4xl font-bold text-center mb-8"
          style={{ color: "var(--primary)" }}
        >
          Test Complete!
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Accurate WPM */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Accurate WPM
            </p>
            <p
              style={{ color: "var(--primary)" }}
              className="text-5xl font-bold"
            >
              {accurateWPM}
            </p>
          </div>

          {/* Raw WPM */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Raw WPM
            </p>
            <p
              style={{ color: "var(--primary)" }}
              className="text-5xl font-bold"
            >
              {rawWPM}
            </p>
          </div>

          {/* Accuracy */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Accuracy
            </p>
            <p style={{ color: "#22c55e" }} className="text-5xl font-bold">
              {accuracy.toFixed(1)}%
            </p>
          </div>

          {/* Characters */}
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: "var(--background)" }}
          >
            <p style={{ color: "var(--secondary)" }} className="text-sm mb-2">
              Characters
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <div>
                <span style={{ color: "#22c55e" }} className="text-2xl font-bold">
                  {correctChars}
                </span>
                <span style={{ color: "var(--secondary)" }} className="text-sm ml-1">
                  correct
                </span>
              </div>
              <div>
                <span style={{ color: "#ef4444" }} className="text-2xl font-bold">
                  {wrongChars}
                </span>
                <span style={{ color: "var(--secondary)" }} className="text-sm ml-1">
                  wrong
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback Section */}
        <div className="mb-8">
          <div className="flex gap-4 justify-center mb-4">
            {/* Get AI Feedback Button */}
            <button
              onClick={handleGetFeedback}
              disabled={loadingFeedback || (feedbackQuota !== null && feedbackQuota === 0)}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundColor: "var(--primary)",
                color: "#ffffff",
              }}
            >
              {loadingFeedback ? "🤖 Analyzing..." : "🤖 Get AI Feedback"}
              {feedbackQuota !== null && (
                <span className="ml-2 text-sm opacity-80">
                  ({getQuotaDisplay()})
                </span>
              )}
            </button>

            {/* Generate Practice Paragraph Button */}
            {isAuthenticated && (
              <button
                onClick={handleGenerateParagraph}
                disabled={loadingParagraph || (paragraphQuota !== null && paragraphQuota === 0)}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor: "#8b5cf6",
                  color: "#ffffff",
                }}
              >
                {loadingParagraph ? "✨ Generating..." : "✨ Generate Practice Paragraph"}
                {paragraphQuota !== null && (
                  <span className="ml-2 text-sm opacity-80">
                    ({getParagraphQuotaDisplay()})
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Quota Exhausted Messages */}
          {feedbackQuota === 0 && !isAuthenticated && (
            <p className="text-center text-sm mb-2" style={{ color: "#ef4444" }}>
              You've used all 3 free feedbacks. <span style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>Sign up</span> for 20 more!
            </p>
          )}
          {feedbackQuota === 0 && isAuthenticated && !user?.isPremium && (
            <p className="text-center text-sm mb-2" style={{ color: "#ef4444" }}>
              You've used all 20 feedbacks. <span style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>Upgrade to Premium</span> for unlimited access!
            </p>
          )}
          {paragraphQuota === 0 && isAuthenticated && !user?.isPremium && (
            <p className="text-center text-sm mb-2" style={{ color: "#ef4444" }}>
              You've used all 5 paragraph generations. <span style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>Upgrade to Premium</span> for unlimited!
            </p>
          )}
          {!isAuthenticated && (
            <p className="text-center text-sm mb-2" style={{ color: "var(--secondary)" }}>
              Sign up to generate custom practice paragraphs!
            </p>
          )}

          {/* Error Messages */}
          {feedbackError && (
            <p className="text-center text-sm mb-2" style={{ color: "#ef4444" }}>
              {feedbackError}
            </p>
          )}
          {paragraphError && (
            <p className="text-center text-sm mb-2" style={{ color: "#ef4444" }}>
              {paragraphError}
            </p>
          )}

          {/* AI Feedback Display */}
          {aiFeedback && (
            <div
              className="rounded-lg p-6 mt-4"
              style={{ backgroundColor: "var(--background)", border: "2px solid var(--primary)" }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--primary)" }}>
                🤖 AI Performance Analysis
              </h3>
              <div style={{ color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                {aiFeedback}
              </div>
            </div>
          )}
        </div>

        {/* Restart Button */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
            }}
          >
            ↻ Try Again
          </button>
        </div>

        {/* Info Text */}
        <p
          style={{ color: "var(--secondary)" }}
          className="text-center text-sm mt-6"
        >
          Accurate WPM counts only correct characters. Raw WPM includes all typed characters.
        </p>
      </div>
    </div>
  );
};

export default Results;
