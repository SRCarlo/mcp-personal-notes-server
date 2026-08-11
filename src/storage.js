import { getPool } from "./database.js";

// Get all notes.
export async function getAllNotes() {
  const pool = getPool();

  const result = await pool.query(`
    SELECT
      id,
      title,
      content,
      category,
      created_at
    FROM notes
    ORDER BY created_at DESC
  `);

  return result.rows;
}

// Get one note by ID.
export async function getNoteById(id) {
  const pool = getPool();

  const result = await pool.query(
    `
    SELECT
      id,
      title,
      content,
      category,
      created_at
    FROM notes
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

// Create a new note.

export async function createNote({ id, title, content, category }) {
  const pool = getPool();

  const result = await pool.query(
    `
    INSERT INTO notes (
      id,
      title,
      content,
      category
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      title,
      content,
      category,
      created_at
    `,
    [id, title, content, category],
  );

  return result.rows[0];
}

// Search notes.
export async function searchNotes(query) {
  const pool = getPool();

  const searchPattern = `%${query}%`;

  const result = await pool.query(
    `
    SELECT
      id,
      title,
      content,
      category,
      created_at
    FROM notes
    WHERE
      title ILIKE $1
      OR content ILIKE $1
      OR category ILIKE $1
    ORDER BY created_at DESC
    `,
    [searchPattern],
  );

  return result.rows;
}

// Delete a note.

export async function deleteNote(id) {
  const pool = getPool();

  const result = await pool.query(
    `
    DELETE FROM notes
    WHERE id = $1
    RETURNING id
    `,
    [id],
  );

  return result.rowCount > 0;
}
