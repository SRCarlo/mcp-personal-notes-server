import pg from "pg";

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection
pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

// Get database connection pool.

export function getPool() {
  return pool;
}

//  Test the database connection.
export async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query("SELECT NOW()");

    console.log("PostgreSQL connected successfully.");
  } finally {
    client.release();
  }
}
