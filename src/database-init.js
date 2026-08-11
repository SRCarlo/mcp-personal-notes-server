import { getPool } from "./database.js";

// Create the notes table if it doesn't already exist.

export async function initializeDatabase() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'General',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log("Database initialized successfully.");
}
