import axios from "axios";

const BASE_URL = "http://localhost:5000";

const getPara = async (
  isSpecialCharIncluded = false,
  language = "en",
  difficultyLevel = "hard",
  timeInSeconds = 60
) => {
  try {
    const response = await axios.post(`${BASE_URL}/para/get-para`, {
      isSpecialCharIncluded,
      language,
      difficultyLevel,
      timeInSeconds
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching paragraph:", error.message);
    throw error;
  }
};
export { getPara };
