/**
 * Offline Results Calculator
 * Calculates test results without requiring network access
 */

/**
 * Calculate typing statistics from test data
 * This runs entirely client-side and works offline
 * @param {Object} testData - Test completion data
 * @returns {Object} - Calculated statistics
 */
export const calculateOfflineResults = (testData) => {
  const {
    correctChars = 0,
    wrongChars = 0,
    timeInSeconds = 60,
    errorFrequencyMap = {},
  } = testData;

  // Calculate total characters
  const totalChars = correctChars + wrongChars;

  // Calculate accuracy
  const accuracy = totalChars > 0 
    ? (correctChars / totalChars) * 100 
    : 0;

  // Calculate WPM (Words Per Minute)
  // Standard: 1 word = 5 characters
  const timeInMinutes = timeInSeconds / 60;
  
  // Raw WPM (including errors)
  const rawWPM = totalChars > 0 && timeInMinutes > 0
    ? Math.round((totalChars / 5) / timeInMinutes)
    : 0;

  // Accurate WPM (only correct characters)
  const accurateWPM = correctChars > 0 && timeInMinutes > 0
    ? Math.round((correctChars / 5) / timeInMinutes)
    : 0;

  return {
    correctChars,
    wrongChars,
    totalChars,
    accuracy: parseFloat(accuracy.toFixed(2)),
    rawWPM,
    accurateWPM,
    errorFrequencyMap,
    timeInSeconds,
  };
};

/**
 * Generate offline-friendly paragraph
 * Uses the same logic as backend but works client-side
 * @param {Object} params - Paragraph parameters
 * @returns {Object} - Generated paragraph data
 */
export const generateOfflineParagraph = (params) => {
  const {
    difficulty = 'medium',
    includeSpecialChars = false,
    timeInSeconds = 60,
  } = params;

  // Fallback paragraph data for offline use
  const paragraphData = {
    easy: {
      normal: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'],
      special: ['@the', '#and', '$for', '&are', '*but', '!not', '?you', '+all', '=can', '-her']
    },
    medium: {
      normal: ['about', 'after', 'again', 'could', 'every', 'first', 'found', 'great', 'house', 'large', 'learn', 'never', 'other', 'place', 'plant', 'point', 'right', 'small', 'sound', 'spell', 'still', 'study', 'their', 'there', 'these', 'thing', 'think', 'three', 'water', 'where', 'which', 'world', 'would', 'write'],
      special: ['about!', 'after?', '@again', '#could', '$every', '&first', '*found', '+great']
    },
    hard: {
      normal: ['although', 'anything', 'beautiful', 'because', 'between', 'business', 'children', 'complete', 'consider', 'continue', 'contract', 'database', 'decision', 'describe', 'different', 'difficult', 'discover', 'document', 'economic', 'education', 'equipment', 'establish', 'excellent', 'executive', 'experience', 'financial', 'frequency', 'government', 'important', 'including', 'increase', 'indicated', 'individual', 'influence', 'information', 'knowledge', 'management', 'necessary', 'objective', 'operation', 'particular', 'performance', 'political', 'population', 'practical', 'president', 'principle', 'procedure', 'production', 'professional', 'protection', 'publication', 'recognize', 'recommend', 'relationship', 'scientific', 'situation', 'something', 'statement', 'structure', 'substitute', 'successful', 'sufficient', 'technology', 'television', 'temperature', 'throughout', 'transition', 'understand', 'university'],
      special: ['@algorithm', '#beautiful', '$contract', '&database', '*establish', '!financial', '?government', '+knowledge']
    }
  };

  // Get word list based on difficulty and special chars
  const wordList = includeSpecialChars 
    ? (paragraphData[difficulty]?.special || paragraphData.medium.special)
    : (paragraphData[difficulty]?.normal || paragraphData.medium.normal);

  // Calculate number of words needed (assuming 150 WPM typing speed)
  const wordsNeeded = Math.floor((150 / 60) * timeInSeconds);

  // Generate random words
  const words = [];
  for (let i = 0; i < wordsNeeded; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    words.push(wordList[randomIndex]);
  }

  return {
    paragraph: words,
    message: 'Paragraph generated offline',
    isOfflineGenerated: true,
  };
};

/**
 * Check if we can serve data offline
 * @returns {boolean}
 */
export const canWorkOffline = () => {
  return typeof caches !== 'undefined';
};
