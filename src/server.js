import "dotenv/config";

import express from "express";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { registerNoteTools } from "./tools/notes.js";

import { testDatabaseConnection } from "./database.js";

import { initializeDatabase } from "./database-init.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// CREATE MCP SERVER
const mcpServer = new McpServer({
  name: "mcp-personal-notes-server",
  version: "1.0.0",
});

// REGISTER MCP TOOLS
registerNoteTools(mcpServer);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "success",
    server: "MCP Personal Notes Server",
    version: "1.0.0",
    database: "PostgreSQL",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

// MCP ENDPOINT
app.post("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
    });

    await mcpServer.connect(transport);

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",

        error: {
          code: -32603,
          message: "Internal server error",
        },

        id: null,
      });
    }
  }
});

// START SERVER
async function startServer() {
  try {
    await testDatabaseConnection();

    await initializeDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`MCP Personal Notes Server running on port ${PORT}`);

      console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
}

startServer();
