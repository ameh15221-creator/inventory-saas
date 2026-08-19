
// ==============================
// ROLE AUTHORIZATION MIDDLEWARE
// ==============================

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // ==============================
    // MAKE SURE USER IS AUTHENTICATED
    // ==============================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    // ==============================
    // NORMALIZE USER ROLE
    // ==============================

    const userRole = String(
      req.user.role || ""
    ).toUpperCase();

    // ==============================
    // NORMALIZE ALLOWED ROLES
    // ==============================

    const normalizedRoles = allowedRoles.map(
      (role) =>
        String(role).toUpperCase()
    );

    // ==============================
    // CHECK PERMISSION
    // ==============================

    if (!normalizedRoles.includes(userRole)) {

      console.log(
        `ROLE ACCESS DENIED: ${userRole}`
      );

      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission."
      });
    }

    // ==============================
    // ACCESS GRANTED
    // ==============================

    console.log(
      `ROLE ACCESS GRANTED: ${userRole}`
    );

    next();
  };
};

module.exports = allowRoles;