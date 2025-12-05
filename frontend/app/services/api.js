import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Create axios instance with credentials
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// User Authentication APIs
const loginUser = async (identifier, password) => {
  try {
    console.log('API: loginUser called with identifier:', identifier)
    const response = await api.post('/users/login', {
      identifier,
      password,
    });
    console.log('API: Login successful, response:', response.data)
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    console.error("Login error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user";
    console.error("Get current user error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const signupUser = async (username, email, password) => {
  try {
    const response = await api.post('/users/create-user', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Signup failed";
    console.error("Signup error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const verifyOtp = async (username, otp) => {
  try {
    const response = await api.post('/users/verify-otp', {
      username,
      otp,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "OTP verification failed";
    console.error("Verify OTP error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const resendOtp = async (username) => {
  try {
    const response = await api.post('/users/resend-otp', {
      username,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to resend OTP";
    console.error("Resend OTP error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export { 
  getPara, 
  loginUser, 
  getCurrentUser, 
  signupUser, 
  verifyOtp, 
  resendOtp 
};
