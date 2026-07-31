#!/usr/bin/env node

import { randomUUID, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { config } from "./config.js";
import { TpClient } from "./tp.js";
import { createMcpServer } from "./server.js";
import * as TP from "./types.js";

type Session = {
  transport: StreamableHTTPServerTransport
}

const sessions = new Map<string, Session>()

// Constant-time comparison so a mistyped/guessed key can't be distinguished
// from a correct one by response-time timing.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function jsonRpcError(res: Response, status: number, message: string) {
  res.status(status).json({
    jsonrpc: "2.0",
    error: { code: -32001, message },
    id: null,
  })
}

// Layer A: a single shared secret gating access to this hosted server at all,
// independent of which org member is calling.
function requireHostingKey(req: Request, res: Response, next: NextFunction) {
  const expected = config.http.hostingApiKey
  const header = req.header("authorization") || ""
  const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : ""

  if (!expected || !provided || !safeEqual(provided, expected)) {
    jsonRpcError(res, 401, "Unauthorized: missing or invalid hosting API key")
    return
  }
  next()
}

// Layer B: resolves the caller's own TP identity from their personal token.
// Calling Context also validates the token against Targetprocess itself, so a
// bad/expired token is rejected here rather than surfacing as a confusing
// failure from inside a tool call later.
async function resolveTpClient(req: Request, res: Response): Promise<TpClient | null> {
  const userToken = req.header("x-tp-token")
  if (!userToken) {
    jsonRpcError(res, 401, "Unauthorized: missing X-TP-Token header")
    return null
  }

  const probe = new TpClient(userToken)
  const ctx = await probe.getContext<TP.Context>()
  const loggedUser = ctx?.LoggedUser

  if (!loggedUser?.Id) {
    jsonRpcError(res, 401, "Unauthorized: X-TP-Token was rejected by Targetprocess")
    return null
  }

  return new TpClient(userToken, String(loggedUser.Id))
}

if (!config.http.hostingApiKey) {
  console.error("Fatal: HOSTING_API_KEY is not set. Refusing to start without a hosting gate.")
  process.exit(1)
}

const app = createMcpExpressApp({ host: config.http.host, allowedHosts: config.http.allowedHosts })

app.use(requireHostingKey)

app.post("/mcp", async (req, res) => {
  const sessionId = req.header("mcp-session-id")

  try {
    if (sessionId) {
      const session = sessions.get(sessionId)
      if (!session) {
        jsonRpcError(res, 404, "Session not found")
        return
      }
      await session.transport.handleRequest(req, res, req.body)
      return
    }

    if (!isInitializeRequest(req.body)) {
      jsonRpcError(res, 400, "Bad Request: No valid session ID provided")
      return
    }

    const tp = await resolveTpClient(req, res)
    if (!tp) return // response already sent by resolveTpClient

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        sessions.set(newSessionId, { transport })
      },
    })

    transport.onclose = () => {
      const sid = transport.sessionId
      if (sid) sessions.delete(sid)
    }

    const server = createMcpServer(tp)
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    console.error("Error handling MCP POST request:", error)
    if (!res.headersSent) {
      jsonRpcError(res, 500, "Internal server error")
    }
  }
})

async function handleSessionRequest(req: Request, res: Response) {
  const sessionId = req.header("mcp-session-id")
  const session = sessionId ? sessions.get(sessionId) : undefined
  if (!session) {
    res.status(400).send("Invalid or missing session ID")
    return
  }
  await session.transport.handleRequest(req, res)
}

app.get("/mcp", handleSessionRequest)
app.delete("/mcp", handleSessionRequest)

app.listen(config.http.port, config.http.host, () => {
  console.error(`TP MCP Streamable HTTP server listening on ${config.http.host}:${config.http.port}`)
})

process.on("SIGINT", async () => {
  console.error("Shutting down, closing active sessions...")
  for (const [sessionId, session] of sessions) {
    try {
      await session.transport.close()
    } catch (error) {
      console.error(`Error closing session ${sessionId}:`, error)
    }
  }
  process.exit(0)
})
