const jwt = require("jsonwebtoken");

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const authMiddleware = (req, res, next) => {
  try {
    console.log("🔥 AUTH MIDDLEWARE CALLED");

    // -----------------------------
    // Get Authorization header
    // -----------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // -----------------------------
    // Check Bearer format
    // -----------------------------

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // -----------------------------
    // Extract token
    // -----------------------------

    const token = authHeader
      .split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing.",
      });
    }

    // -----------------------------
    // Verify token
    // -----------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -----------------------------
    // Normalize role
    // -----------------------------

    decoded.role = String(
      decoded.role || "STAFF"
    ).toUpperCase();

    // -----------------------------
    // Attach user to request
    // -----------------------------

    req.user = decoded;

    console.log(
      "Authenticated User:",
      req.user
    );

    next();

  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// =====================================================
// ROLE AUTHORIZATION
// =====================================================
// Example:
//
// router.get(
//   "/something",
//   authMiddleware,
//   authorizeRoles("CEO", "MANAGER"),
//   controller
// );
//
// =====================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // User must already be authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const userRole = String(
        req.user.role || ""
      ).toUpperCase();

      const normalizedRoles =
        allowedRoles.map((role) =>
          String(role).toUpperCase()
        );

      // -----------------------------
      // Check permission
      // -----------------------------

      if (
        !normalizedRoles.includes(userRole)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You do not have permission to perform this action.",
        });
      }

      next();

    } catch (error) {
      console.error(
        "Role Authorization Error:",
        error
      );

      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = authMiddleware;
