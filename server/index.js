console.log("=== INDEX.JS IS RUNNING ===");
console.log("Current directory:", __dirname);

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

console.log("Loading database...");
require("./config/db");

console.log("Loading product routes...");
const productRoutes = require("./routes/products");
console.log("✅ Product routes loaded successfully.");

console.log("Loading category routes...");
const categoryRoutes = require("./routes/categories");
console.log("✅ Category routes loaded successfully.");

console.log("Loading authentication routes...");
const authRoutes = require("./routes/auth");
console.log("✅ Authentication routes loaded successfully.");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Inventory SaaS Backend is running successfully!"
  });
});

// ==============================
// API ROUTES
// ==============================

// Product API
app.use("/api/products", productRoutes);

// Category API
app.use("/api/categories", categoryRoutes);

// Authentication API
app.use("/api/auth", authRoutes);

// ==============================
// START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
