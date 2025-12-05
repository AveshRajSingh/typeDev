import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = 
      req.cookies?.accessToken || 
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        message: "Unauthorized - No token provided" 
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user by id from token
    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token" 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Unauthorized - Token expired" 
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token" 
      });
    }
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
