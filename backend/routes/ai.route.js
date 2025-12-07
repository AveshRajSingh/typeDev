import express from "express";
import { getAIFeedback, generateParagraph } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route - allows both authenticated and guest users
// Guest users tracked via guestToken in request body
// Authenticated users checked via optional JWT
router.post("/feedback", async (req, res, next) => {
  // Try to verify JWT if present, but don't require it
  const token = req.cookies?.accessToken;
  if (token) {
    try {
      await verifyJWT(req, res, () => {});
    } catch (error) {
      // Ignore JWT errors for public route
      req.user = null;
    }
  }
  next();
}, getAIFeedback);

// Protected route - requires authentication
router.post("/generate-paragraph", verifyJWT, generateParagraph);

export default router;
