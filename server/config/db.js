const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "inventory_saas",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    });

pool.connect()
  .then((client) => {
    console.log("PostgreSQL database connected successfully.");
    client.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;