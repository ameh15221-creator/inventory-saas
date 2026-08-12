// ======================================
// PostgreSQL Database Connection
// Inventory SaaS
// ======================================

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // Required for some hosted PostgreSQL databases
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

// Test database connection
pool.connect()
    .then((client) => {
        console.log("✅ Connected to PostgreSQL");
        client.release();
    })
    .catch((error) => {
        console.error(
            "❌ PostgreSQL connection failed:",
            error.message
        );
    });

// Export pool correctly
module.exports = pool;
