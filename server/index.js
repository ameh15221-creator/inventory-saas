const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ override: true });
}

console.log("=== INDEX.JS IS RUNNING ===");
console.log("Current directory:", process.cwd());

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

app.use(cors());
app.use(express.json());

// Serve uploaded product images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory SaaS API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
