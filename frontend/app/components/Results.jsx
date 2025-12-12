"use client";
import React, { useState, useEffect } from "react";
import { getAIFeedback, generateAIParagraph } from "../services/api";
import { isOnline, onConnectionChange } from "../services/cacheService";
import { navigateOffline } from "../utils/offlineNavigation";

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
  const [offline, setOffline] = useState(!isOnline());

  // Track online/offline status with live updates
  useEffect(() => {
    // Set initial status
    setOffline(!isOnline());
    
    // Listen for connection changes
    const cleanup = onConnectionChange((online) => {
      setOffline(!online);
    });
    
    return cleanup;
  }, []);

  // Parse and format AI feedback
  const formatAIFeedback = (feedback) => {
    if (!feedback) return null;

    const sections = [];
    const lines = feedback.split('\n');
    let currentSection = null;

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: line.replace('## ', '').trim(),
          content: []
        };
      } else if (line.trim() && currentSection) {
        currentSection.content.push(line.trim());
      }
    });

    if (currentSection) sections.push(currentSection);

    return sections;
  };

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
    // Check if offline
    if (!isOnline()) {
      setFeedbackError("AI Feedback requires an internet connection. Please connect and try again.");
      return;
    }

    setLoadingFeedback(true);
    setFeedbackError(null);
    
    try {
      // Get or ensure guest token for non-authenticated users
      let tokenToUse = guestToken;
      if (!isAuthenticated) {
        if (!tokenToUse) {
          tokenToUse = localStorage.getItem('guestFeedbackToken');
          if (!tokenToUse) {
            tokenToUse = 'guest_v1_0';
            localStorage.setItem('guestFeedbackToken', tokenToUse);
          }
          setGuestToken(tokenToUse);
        }
      }

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
        isAuthenticated ? null : tokenToUse,
        user // Pass user for cache management
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

    // Check if offline
    if (!isOnline()) {
      setParagraphError("Custom paragraph generation requires an internet connection. Please connect and try again.");
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
      
      // Store the generated paragraph in sessionStorage for homepage to use
      sessionStorage.setItem('aiGeneratedParagraph', JSON.stringify(response.paragraph));
      
      // Navigate directly to homepage to start typing
      navigateOffline('/');

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
    <div className="max-w-6xl mx-auto mt-12 px-4">
      {/* Offline Warning Banner */}
      {offline && (
        <div
          className="mb-6 rounded-xl p-4 text-center shadow-lg"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "2px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>
            🔴 You are offline - AI features are disabled. Results are calculated locally.
          </p>
        </div>
      )}

      {/* Header with Title and Try Again Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
        <h1
          className="text-5xl font-bold"
          style={{ color: "var(--primary)" }}
        >
          Test Complete! 🎉
        </h1>
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: "var(--primary)",
            color: "#ffffff",
          }}
        >
          ↻ Try Again
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Accurate WPM - Featured */}
            <div
              className="rounded-2xl p-8 text-center shadow-lg transform transition-all hover:scale-105"
              style={{ 
                backgroundColor: "var(--background)",
                border: "3px solid var(--primary)"
              }}
            >
              <p style={{ color: "var(--secondary)" }} className="text-sm uppercase tracking-wide mb-3">
                Accurate WPM
              </p>
              <p
                style={{ color: "var(--primary)" }}
                className="text-6xl font-extrabold mb-2"
              >
                {accurateWPM}
              </p>
              <p style={{ color: "var(--secondary)" }} className="text-xs">
                Your true speed
              </p>
            </div>

            {/* Raw WPM */}
            <div
              className="rounded-2xl p-8 text-center shadow-lg transform transition-all hover:scale-105"
              style={{ 
                backgroundColor: "var(--background)",
                border: "2px solid var(--border)"
              }}
            >
              <p style={{ color: "var(--secondary)" }} className="text-sm uppercase tracking-wide mb-3">
                Raw WPM
              </p>
              <p
                style={{ color: "var(--text)" }}
                className="text-6xl font-extrabold mb-2"
              >
                {rawWPM}
              </p>
              <p style={{ color: "var(--secondary)" }} className="text-xs">
                Including errors
              </p>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Accuracy */}
            <div
              className="rounded-2xl p-6 text-center shadow-md"
              style={{ backgroundColor: "var(--background)" }}
            >
              <p style={{ color: "var(--secondary)" }} className="text-xs uppercase tracking-wide mb-2">
                Accuracy
              </p>
              <p style={{ color: "#22c55e" }} className="text-4xl font-bold">
                {accuracy.toFixed(1)}%
              </p>
            </div>

            {/* Characters */}
            <div
              className="rounded-2xl p-6 shadow-md"
              style={{ backgroundColor: "var(--background)" }}
            >
              <p style={{ color: "var(--secondary)" }} className="text-xs uppercase tracking-wide mb-3 text-center">
                Characters
              </p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <span style={{ color: "#22c55e" }} className="text-3xl font-bold block">
                    {correctChars}
                  </span>
                  <span style={{ color: "var(--secondary)" }} className="text-xs">
                    correct
                  </span>
                </div>
                <div className="h-12 w-px" style={{ backgroundColor: "var(--border)" }}></div>
                <div className="text-center">
                  <span style={{ color: "#ef4444" }} className="text-3xl font-bold block">
                    {wrongChars}
                  </span>
                  <span style={{ color: "var(--secondary)" }} className="text-xs">
                    wrong
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - AI Features */}
        <div className="lg:col-span-1 space-y-4">
          {/* AI Feedback Card */}
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{ 
              backgroundColor: "var(--background)",
              border: "2px solid var(--border)"
            }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--primary)" }}>
              <span>🤖</span>
              <span>AI Analysis</span>
            </h3>
            
            <button
              onClick={handleGetFeedback}
              disabled={loadingFeedback || (feedbackQuota !== null && feedbackQuota === 0)}
              className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3"
              style={{
                backgroundColor: "var(--primary)",
                color: "#ffffff",
              }}
            >
              {loadingFeedback ? "Analyzing..." : "Get Feedback"}
            </button>

            {feedbackQuota !== null && (
              <p className="text-center text-xs mb-3" style={{ color: "var(--secondary)" }}>
                {getQuotaDisplay()}
              </p>
            )}

            {/* Quota Messages */}
            {feedbackQuota === 0 && !isAuthenticated && (
              <p className="text-xs text-center mb-2" style={{ color: "#ef4444" }}>
                Free quota used. <span onClick={() => navigateOffline('/auth')} style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>Sign up</span> for 20 more!
              </p>
            )}
            {feedbackQuota === 0 && isAuthenticated && !user?.isPremium && (
              <p className="text-xs text-center mb-2" style={{ color: "#ef4444" }}>
                Free quota used. <span onClick={() => navigateOffline('/auth')} style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>Upgrade</span> for unlimited!
              </p>
            )}

            {feedbackError && (
              <p className="text-xs text-center" style={{ color: "#ef4444" }}>
                {feedbackError}
              </p>
            )}
          </div>

          {/* Generate Paragraph Card */}
          {isAuthenticated && (
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{ 
                backgroundColor: "var(--background)",
                border: "2px solid var(--border)"
              }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#8b5cf6" }}>
                <span>✨</span>
                <span>Custom Practice</span>
              </h3>
              
              <button
                onClick={handleGenerateParagraph}
                disabled={loadingParagraph || (paragraphQuota !== null && paragraphQuota === 0)}
                className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3"
                style={{
                  backgroundColor: "#8b5cf6",
                  color: "#ffffff",
                }}
              >
                {loadingParagraph ? "Generating..." : "Generate Paragraph"}
              </button>

              {paragraphQuota !== null && (
                <p className="text-center text-xs mb-3" style={{ color: "var(--secondary)" }}>
                  {getParagraphQuotaDisplay()}
                </p>
              )}

              {paragraphQuota === 0 && !user?.isPremium && (
                <p className="text-xs text-center mb-2" style={{ color: "#ef4444" }}>
                  Free quota used. <span onClick={() => navigateOffline('/auth')} style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>Upgrade</span> for unlimited!
                </p>
              )}

              {paragraphError && (
                <p className="text-xs text-center" style={{ color: "#ef4444" }}>
                  {paragraphError}
                </p>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div
              className="rounded-2xl p-6 shadow-lg text-center"
              style={{ 
                backgroundColor: "var(--background)",
                border: "2px dashed var(--border)"
              }}
            >
              <p className="text-sm mb-2" style={{ color: "var(--secondary)" }}>
                ✨ Want custom practice paragraphs?
              </p>
              <p onClick={() => navigateOffline('/auth')} className="text-xs" style={{ color: "var(--primary)", fontWeight: "bold", cursor: "pointer" }}>
                Sign up to unlock!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Feedback Display - Full Width Below */}
      {aiFeedback && (
        <div
          className="rounded-2xl p-8 mt-8 shadow-xl"
          style={{ 
            backgroundColor: "var(--background)", 
            border: "3px solid var(--primary)"
          }}
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--primary)" }}>
            <span>🤖</span>
            <span>AI Performance Analysis</span>
          </h3>
          
          <div className="space-y-6">
            {formatAIFeedback(aiFeedback)?.map((section, index) => {
              const icons = {
                'Performance Summary': '📊',
                'Problematic Characters': '⚠️',
                'Technique Suggestions': '💡',
                'Practice Recommendations': '🎯'
              };

              return (
                <div 
                  key={index}
                  className="rounded-xl p-6"
                  style={{ 
                    backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <h4 
                    className="text-lg font-bold mb-3 flex items-center gap-2"
                    style={{ color: "var(--primary)" }}
                  >
                    <span>{icons[section.title] || '•'}</span>
                    <span>{section.title}</span>
                  </h4>
                  
                  <div className="space-y-2">
                    {section.content.map((paragraph, pIndex) => {
                      // Check if it's a numbered list item
                      if (paragraph.match(/^\d+\.\s\*\*/)) {
                        const parts = paragraph.split('**');
                        return (
                          <div 
                            key={pIndex}
                            className="flex gap-3 items-start mb-3"
                          >
                            <span 
                              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ 
                                backgroundColor: "var(--primary)",
                                color: "#ffffff"
                              }}
                            >
                              {paragraph.match(/^\d+/)[0]}
                            </span>
                            <div style={{ color: "var(--text)" }}>
                              <span className="font-bold" style={{ color: "var(--primary)" }}>
                                {parts[1]}
                              </span>
                              <span>{parts[2]?.replace(/^:\s*/, ': ')}</span>
                            </div>
                          </div>
                        );
                      }
                      
                      // Regular paragraph
                      return (
                        <p 
                          key={pIndex}
                          style={{ 
                            color: "var(--text)",
                            lineHeight: "1.7"
                          }}
                        >
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <p
        style={{ color: "var(--secondary)" }}
        className="text-center text-xs mt-8 opacity-70"
      >
        💡 Accurate WPM counts only correct characters • Raw WPM includes all typed characters
      </p>
    </div>
  );
};

export default Results;
