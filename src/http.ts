#!/usr/bin/env node

import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createServer } from "./index.js";
import { config } from "./config.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!config.http.authToken) {
    next();
    return;
  }

  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || token !== config.http.authToken) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: null,
    });
    return;
  }

  next();
}

app.post("/mcp", requireAuth, async (req, res) => {
  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/mcp", requireAuth, (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

app.delete("/mcp", requireAuth, (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

if (!config.http.authToken) {
  console.error(
    `Warning: MCP_AUTH_TOKEN is not set — the remote server at /mcp is unauthenticated. Set MCP_AUTH_TOKEN to require a bearer token (e.g. export MCP_AUTH_TOKEN=${randomUUID()}).`
  );
}

app.listen(config.http.port, () => {
  console.error(`TP MCP Server listening on http://localhost:${config.http.port}/mcp`);
});
