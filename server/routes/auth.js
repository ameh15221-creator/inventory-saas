const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const db = require("../config/db");

// =====================================================
// VALID ROLES
// =====================================================

const VALID_ROLES = [
  "CEO",
  "MANAGER",
  "CASHIER",
  "STAFF",
];

// =====================================================
// REGISTER USER
// =====================================================
// Public registration creates STAFF accounts only.
// CEO/Manager will later be able to create other roles.
// =====================================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -----------------------------
    // Validate input
    // -----------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // -----------------------------
    // Check existing user
    // -----------------------------

    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    // -----------------------------
    // Encrypt password
    // -----------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // -----------------------------
    // New public accounts = STAFF
    // -----------------------------

    const role = "STAFF";

    // -----------------------------
    // Save user
    // -----------------------------

    const newUser = await db.query(
      `
      INSERT INTO users
      (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
      `,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        role,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating account.",
    });
  }
});

// =====================================================
// LOGIN USER
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------
    // Validate input
    // -----------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // -----------------------------
    // Find user
    // -----------------------------

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    // -----------------------------
    // Check password
    // -----------------------------

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // -----------------------------
    // Normalize role
    // -----------------------------

    const role = String(
      user.role || "STAFF"
    ).toUpperCase();

    // -----------------------------
    // Safety check
    // -----------------------------

    if (!VALID_ROLES.includes(role)) {
      console.error(
        `Invalid role for user ${user.email}: ${role}`
      );

      return res.status(403).json({
        success: false,
        message: "User account has an invalid role.",
      });
    }

    // -----------------------------
    // Create JWT
    // -----------------------------

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // -----------------------------
    // Send response
    // -----------------------------

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in.",
    });
  }
});

module.exports = router;