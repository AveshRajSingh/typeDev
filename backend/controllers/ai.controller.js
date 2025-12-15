import Groq from "groq-sdk";
import { User } from "../models/user.model.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Get AI feedback on typing test performance
 * Access: Public (with quota limits)
 * Guest users: 3 feedbacks (tracked via guestToken in localStorage)
 * Logged-in users: 20 feedbacks (tracked via freeFeedbackLeft)
 * Premium users: Unlimited
 */
export const getAIFeedback = async (req, res) => {
  try {
    const {
      testData, // { correctChars, wrongChars, accuracy, wpm, errorFrequencyMap }
      difficulty,
      timeInSeconds,
      guestToken, // For non-authenticated users
    } = req.body;

    // Validate required fields
    if (!testData || !testData.errorFrequencyMap) {
      return res.status(400).json({
        success: false,
        message: "Test data with error frequency map is required",
      });
    }

    let user = null;
    let isGuest = false;
    let quotaRemaining = 0;

    // Check if user is authenticated
    if (req.user) {
      user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check quota for non-premium users
      if (!user.isPremium) {
        if (user.freeFeedbackLeft <= 0) {
          return res.status(403).json({
            success: false,
            message: "You have used all your free feedbacks. Upgrade to Premium for unlimited access.",
            quotaRemaining: 0,
          });
        }
        quotaRemaining = user.freeFeedbackLeft;
      } else {
        quotaRemaining = -1; // Unlimited
      }
    } else {
      // Guest user - validate token
      isGuest = true;
      if (!guestToken) {
        return res.status(400).json({
          success: false,
          message: "Guest token is required for non-authenticated users",
        });
      }

      // In a production app, you'd store guest tokens in Redis or a cache
      // For simplicity, we trust the frontend to manage the 3-feedback limit
      // The token should contain the count: e.g., "guest_v1_2" means 2 feedbacks used
      const tokenParts = guestToken.split('_');
      const usedCount = parseInt(tokenParts[2] || 0);
      
      if (usedCount >= 3) {
        return res.status(403).json({
          success: false,
          message: "You have used all 3 free feedbacks. Please sign up for 20 more free feedbacks!",
          quotaRemaining: 0,
          isGuest: true,
        });
      }
      quotaRemaining = 3 - usedCount;
    }

    // Prepare AI prompt with error analysis
    const errorKeys = Object.keys(testData.errorFrequencyMap);
    const totalErrors = Object.values(testData.errorFrequencyMap).reduce((sum, count) => sum + count, 0);
    
    const topErrors = Object.entries(testData.errorFrequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([char, count]) => `'${char}' (${count} errors)`)
      .join(', ');

    const prompt = `You are a typing coach analyzing a typing test performance. Provide personalized feedback.

Test Results:
- WPM: ${testData.wpm}
- Accuracy: ${testData.accuracy}%
- Correct Characters: ${testData.correctChars}
- Wrong Characters: ${testData.wrongChars}
- Test Duration: ${timeInSeconds} seconds
- Difficulty: ${difficulty || 'medium'}

Error Analysis:
- Total Errors: ${totalErrors}
- Most problematic characters: ${topErrors}
- Error frequency map: ${JSON.stringify(testData.errorFrequencyMap)}

Please provide:
1. A brief performance summary (2-3 sentences)
2. Specific keys/characters the user struggles with
3. Finger placement or technique suggestions
4. 2-3 actionable practice recommendations

Keep the response concise, encouraging, and actionable. Format with clear sections.`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful typing coach providing personalized feedback to improve typing skills."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    const feedback = completion.choices[0].message.content;

    // Decrement quota for non-premium users
    if (user && !user.isPremium) {
      user.freeFeedbackLeft -= 1;
      user.lastFeedback = {
        feedback,
        createdAt: new Date(),
      };
      await user.save();
      quotaRemaining = user.freeFeedbackLeft;
    }

    // For guest users, return new token
    let newGuestToken = null;
    if (isGuest) {
      const tokenParts = guestToken.split('_');
      const usedCount = parseInt(tokenParts[2] || 0);
      newGuestToken = `guest_v1_${usedCount + 1}`;
      quotaRemaining = 3 - (usedCount + 1);
    }

    // Set cache headers - AI feedback can be cached as it's tied to specific test results
    res.set({
      'Cache-Control': 'private, max-age=604800', // Cache for 7 days (private cache only)
      'Vary': 'Cookie',
    });

    return res.status(200).json({
      success: true,
      feedback,
      quotaRemaining,
      isGuest,
      newGuestToken,
      isPremium: user?.isPremium || false,
    });

  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI feedback",
      error: error.message,
    });
  }
};

/**
 * Generate custom paragraph targeting weak characters
 * Access: Protected (requires authentication)
 * Logged-in users: 5 paragraph generations
 * Premium users: Unlimited
 */
export const generateParagraph = async (req, res) => {
  try {
    const {
      errorFrequencyMap, // Characters the user struggles with
      wordCount, // Desired paragraph length (default: 50)
      difficulty, // easy, medium, hard
    } = req.body;

    // Validate authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please log in to generate custom paragraphs",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check quota for non-premium users
    let quotaRemaining = 0;
    if (!user.isPremium) {
      if (user.freeParagraphGenLeft <= 0) {
        return res.status(403).json({
          success: false,
          message: "You have used all 5 free paragraph generations. Upgrade to Premium for unlimited access.",
          quotaRemaining: 0,
        });
      }
      quotaRemaining = user.freeParagraphGenLeft;
    } else {
      quotaRemaining = -1; // Unlimited
    }

    // Prepare AI prompt based on error frequency map
    const targetWordCount = wordCount || 50;
    const targetDifficulty = difficulty || 'medium';
    
    let prompt;
    const hasErrors = errorFrequencyMap && Object.keys(errorFrequencyMap).length > 0;
    
    if (hasErrors) {
      // Generate targeted paragraph focusing on weak characters
      const weakCharacters = Object.entries(errorFrequencyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([char, count]) => char)
        .join(', ');

      prompt = `Generate a typing practice paragraph with exactly ${targetWordCount} words.

Requirements:
1. Must contain EXACTLY ${targetWordCount} words (count carefully)
2. Difficulty level: ${targetDifficulty}
3. Emphasize these problematic characters: ${weakCharacters}
4. Use these characters frequently throughout the text
5. Create natural, readable sentences (not random words)
6. Make it engaging and educational
7. Include proper punctuation and capitalization
8. Return ONLY the paragraph text, no explanations or extra formatting

Focus on incorporating the weak characters: ${weakCharacters}`;
    } else {
      // Generate general practice paragraph
      prompt = `Generate a typing practice paragraph with exactly ${targetWordCount} words.

Requirements:
1. Must contain EXACTLY ${targetWordCount} words (count carefully)
2. Difficulty level: ${targetDifficulty}
3. Include a balanced mix of common letters, punctuation, and characters
4. Create natural, readable sentences (not random words)
5. Make it engaging and educational
6. Include proper punctuation and capitalization
7. Return ONLY the paragraph text, no explanations or extra formatting

Generate a well-rounded paragraph for typing practice at ${targetDifficulty} difficulty level.`;
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a typing practice paragraph generator. Generate engaging, natural paragraphs that focus on specific characters for practice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300,
    });
    let generatedText = completion.choices[0].message.content.trim();

    // Clean up the response (remove quotes or extra formatting)
    generatedText = generatedText.replace(/^["']|["']$/g, '');

    // Convert to word array (matching the existing paragraph format)
    const words = generatedText.split(/\s+/);

    // Decrement quota for non-premium users
    if (!user.isPremium) {
      user.freeParagraphGenLeft -= 1;
      await user.save();
      quotaRemaining = user.freeParagraphGenLeft;
    }

    return res.status(200).json({
      success: true,
      paragraph: {
        content: words,
        difficultyLevel: targetDifficulty,
        wordCount: words.length,
        targetCharacters: weakCharacters,
        isAIGenerated: true,
      },
      quotaRemaining,
      isPremium: user.isPremium,
    });

  } catch (error) {
    console.error("Error generating paragraph:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate paragraph",
      error: error.message,
    });
  }
};
