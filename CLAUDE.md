# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

An MCP (Model Context Protocol) server that connects AI assistants to the [Targetprocess](https://www.targetprocess.com/) project management platform. It exposes tools that let Claude query and manage Targetprocess entities (user stories, bugs, features, releases, test plans) via the Targetprocess REST API.

## Commands

```bash
npm run build     # Compile TypeScript → build/src/ (runs rimraf first, chmod +x after)
npm start         # Build + run the server over stdio (local)
npm run start:http # Build + run the server over Streamable HTTP (remote)
```

There are no test or lint commands configured.

## Architecture

Source files in `src/`:

- **`index.ts`** — Tool registration. Exports `createServer()`, which creates an `McpServer`, instantiates `TpClient`, and registers all tools with Zod input schemas. Each tool maps to one or more `TpClient` method calls. When run directly (`node build/index.js`), connects `createServer()` to a `StdioServerTransport` — guarded so importing `createServer` elsewhere doesn't also start a stdio listener.
- **`http.ts`** — Remote entry point. Express app exposing `POST /mcp` (Streamable HTTP transport, stateless mode — a fresh `McpServer`/transport pair per request) and `GET /health`. Requires an `Authorization: Bearer <MCP_AUTH_TOKEN>` header on `/mcp` when `MCP_AUTH_TOKEN` is set; this is a single-account deployment (one set of TP credentials shared across all callers), not multi-tenant.
- **`tp.ts`** — `TpClient` class. Wraps the Targetprocess REST API with typed GET/POST methods. Auth token is appended as a query param on every request.
- **`types.ts`** — TypeScript interfaces for Targetprocess API response shapes (UserStory, Bug, Release, Feature, TestPlan, General, etc.).
- **`config.ts`** — Loads env vars via dotenv: `TP_BASE_URL`, `TP_TOKEN`, `TP_OWNER_ID`, `TP_PROJECT_ID`, `TP_TEAM_ID`, plus `PORT`/`MCP_AUTH_TOKEN` for `http.ts`.

**Data flow**: MCP client → stdio or HTTP → tool handler (registered in `createServer()`) → `TpClient` method → Targetprocess HTTP API → response mapped to MCP content.

HTML descriptions from Targetprocess are stripped to plain text using JSDOM before returning to the caller.

## Environment Variables

Copy `.env.example` and fill in:

| Variable | Purpose |
|----------|---------|
| `TP_TOKEN` | Targetprocess API token |
| `TP_BASE_URL` | Targetprocess API base URL |
| `TP_OWNER_ID` | Default owner/user ID |
| `TP_PROJECT_ID` | Target project ID |
| `TP_TEAM_ID` | Team ID |

## Adding New Tools

1. Add a method to `TpClient` in `tp.ts` for the API call
2. Add any new response types to `types.ts`
3. Register the tool in `index.ts` using `server.registerTool()` with a Zod `inputSchema`

## Known Quirks

- Some project/team IDs are hardcoded in `tp.ts` in addition to being read from env
