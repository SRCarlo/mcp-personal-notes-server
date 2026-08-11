import { randomUUID } from "node:crypto";

import { z } from "zod";

import {
  getAllNotes,
  getNoteById,
  createNote,
  searchNotes,
  deleteNote,
} from "../storage.js";

/**
 * Register all note-related MCP tools.
 */
export function registerNoteTools(server) {
  // ==========================================
  // SAVE NOTE
  // ==========================================

  server.registerTool(
    "save_note",
    {
      title: "Save Note",

      description: "Save a new personal note.",

      inputSchema: {
        title: z.string().min(1).max(200),

        content: z.string().min(1),

        category: z.string().min(1).max(50).optional(),
      },
    },

    async ({ title, content, category }) => {
      const note = await createNote({
        id: randomUUID(),
        title,
        content,
        category: category || "General",
      });

      return {
        content: [
          {
            type: "text",

            text:
              `Note saved successfully.\n\n` +
              `ID: ${note.id}\n` +
              `Title: ${note.title}\n` +
              `Category: ${note.category}`,
          },
        ],
      };
    },
  );

  // ==========================================
  // LIST NOTES
  // ==========================================

  server.registerTool(
    "list_notes",
    {
      title: "List Notes",

      description: "List all saved personal notes.",
    },

    async () => {
      const notes = await getAllNotes();

      if (notes.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No notes found.",
            },
          ],
        };
      }

      const result = notes
        .map(
          (note, index) =>
            `${index + 1}. ${note.title}\n` +
            `   ID: ${note.id}\n` +
            `   Category: ${note.category}\n` +
            `   Created: ${note.created_at}`,
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );

  // ==========================================
  // GET NOTE
  // ==========================================

  server.registerTool(
    "get_note",
    {
      title: "Get Note",

      description: "Get one note using its ID.",

      inputSchema: {
        id: z.string().uuid(),
      },
    },

    async ({ id }) => {
      const note = await getNoteById(id);

      if (!note) {
        return {
          content: [
            {
              type: "text",
              text: "Note not found.",
            },
          ],

          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",

            text:
              `Title: ${note.title}\n\n` +
              `Content: ${note.content}\n\n` +
              `Category: ${note.category}\n` +
              `Created: ${note.created_at}\n` +
              `ID: ${note.id}`,
          },
        ],
      };
    },
  );

  // ==========================================
  // SEARCH NOTES
  // ==========================================

  server.registerTool(
    "search_notes",
    {
      title: "Search Notes",

      description: "Search notes by title, content, or category.",

      inputSchema: {
        query: z.string().min(1),
      },
    },

    async ({ query }) => {
      const notes = await searchNotes(query);

      if (notes.length === 0) {
        return {
          content: [
            {
              type: "text",

              text: `No notes found for "${query}".`,
            },
          ],
        };
      }

      const result = notes
        .map(
          (note, index) =>
            `${index + 1}. ${note.title}\n` +
            `   Category: ${note.category}\n` +
            `   Content: ${note.content}\n` +
            `   ID: ${note.id}`,
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",

            text: `Search results for "${query}":\n\n${result}`,
          },
        ],
      };
    },
  );

  // ==========================================
  // DELETE NOTE
  // ==========================================

  server.registerTool(
    "delete_note",
    {
      title: "Delete Note",

      description: "Delete a note using its ID.",

      inputSchema: {
        id: z.string().uuid(),
      },
    },

    async ({ id }) => {
      const deleted = await deleteNote(id);

      if (!deleted) {
        return {
          content: [
            {
              type: "text",
              text: "Note not found.",
            },
          ],

          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",

            text: `Note ${id} deleted successfully.`,
          },
        ],
      };
    },
  );
}
