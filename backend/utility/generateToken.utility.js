import jwt from "jsonwebtoken";

const generateAccessToken = async (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = async (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { generateAccessToken, generateRefreshToken, generateOtp };
