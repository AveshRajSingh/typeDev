/**
 * Middleware to verify if the authenticated user is an admin
 */
export const verifyAdmin = (req, res, next) => {
  try {
    // verifyJWT middleware should run before this
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - Authentication required",
        error: "No user found in request"
      });
    }
    
    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      return res.status(403).json({
        message: "Forbidden - Admin access required",
        error: "User is not an administrator"
      });
    }
    
    // User is admin, proceed to next middleware/controller
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({
      message: "Internal server error during admin verification",
      error: error.message
    });
  }
};
