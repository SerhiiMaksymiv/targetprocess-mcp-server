# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

An MCP (Model Context Protocol) server that connects AI assistants to the [Targetprocess](https://www.targetprocess.com/) project management platform. It exposes tools that let Claude query and manage Targetprocess entities (user stories, bugs, features, releases, test plans) via the Targetprocess REST API.

## Commands

```bash
npm run build       # Compile TypeScript → build/ (runs rimraf first, chmod +x after)
npm start           # Build + run the stdio server
npm run start:http  # Run the hosted Streamable HTTP server (after build)
```

There are no lint commands configured. Tests: `npx vitest run` (see Testing in README.md).

## Architecture

- **`server.ts`** — `createMcpServer(tp: TpClient): McpServer` factory. Creates an `McpServer` and registers every tool (Zod input schemas, handler closes over the `tp` argument). This is the shared core — both entry points below call it.
- **`index.ts`** — stdio entry point. Builds one `TpClient()` from env-var defaults, calls `createMcpServer(tp)`, connects via `StdioServerTransport`. One process, one identity — for local/single-user use.
- **`http.ts`** — hosted Streamable HTTP entry point (`POST/GET/DELETE /mcp`). Multi-tenant: sessions are keyed by `mcp-session-id` in an in-memory map. Two auth layers gate every request:
  1. `Authorization: Bearer <HOSTING_API_KEY>` — one shared secret admitting traffic to the server at all (checked in `requireHostingKey`); the process refuses to start if `HOSTING_API_KEY` is unset.
  2. `X-TP-Token: <personal-tp-token>` — read once per session in `resolveTpClient`, which calls TP's `Context` endpoint to validate the token and resolve the caller's own TP user ID. `createMcpServer` is then called with a `TpClient` bound to that specific user, so each session's tool calls, comments, and time logs are attributed to the right person instead of one shared identity.
- **`tp.ts`** — `TpClient` class. Wraps the Targetprocess REST API with typed GET/POST methods. Constructor takes `(token, ownerId)`, both defaulting to `config.tp.*` for the stdio path; the HTTP path always passes them explicitly per session. Auth token is appended as a query param on every request; `redact()` strips it from logs (this matters more in hosted mode, where logs are shared across every org member instead of one person's own machine).
- **`types.ts`** — TypeScript interfaces for Targetprocess API response shapes (UserStory, Bug, Release, Feature, TestPlan, General, Context, etc.).
- **`config.ts`** — Loads env vars via dotenv: `TP_BASE_URL`, `TP_TOKEN`, `TP_OWNER_ID`, `TP_PROJECT_ID`, `TP_TEAM_ID` under `config.tp`; `HOSTING_API_KEY`, `HTTP_PORT`, `HTTP_HOST`, `HTTP_ALLOWED_HOSTS` under `config.http` (hosted mode only — `TP_TOKEN`/`TP_OWNER_ID` are not used in hosted mode, since those come from the per-session `X-TP-Token` header instead).

**Data flow (stdio)**: MCP client → stdio → `server.ts` tool handler → `TpClient` method → Targetprocess HTTP API → response mapped to MCP content.

**Data flow (hosted HTTP)**: MCP client → `Authorization`/`X-TP-Token` headers → `http.ts` auth middleware → per-session `TpClient` → `server.ts` tool handler (same handlers as stdio) → Targetprocess HTTP API → response mapped to MCP content.

HTML descriptions from Targetprocess are stripped to plain text using JSDOM before returning to the caller.

## Environment Variables

Copy `.env.example` and fill in. See README.md § "Hosted Streamable HTTP" for the `HTTP_*` vars and the two-layer auth model.

| Variable | Purpose |
|----------|---------|
| `TP_TOKEN` | Targetprocess API token (stdio mode only) |
| `TP_BASE_URL` | Targetprocess API base URL |
| `TP_OWNER_ID` | Default owner/user ID (stdio mode only) |
| `TP_PROJECT_ID` | Target project ID |
| `TP_TEAM_ID` | Team ID |
| `HOSTING_API_KEY` | Shared secret gating the hosted HTTP server (hosted mode only, required) |
| `HTTP_PORT` / `HTTP_HOST` / `HTTP_ALLOWED_HOSTS` | Hosted HTTP server bind config (hosted mode only, optional) |

## Adding New Tools

1. Add a method to `TpClient` in `tp.ts` for the API call
2. Add any new response types to `types.ts`
3. Register the tool in `server.ts` (inside `createMcpServer`) using `server.registerTool()` with a Zod `inputSchema` — it becomes available on both the stdio and hosted HTTP entry points automatically

## Known Quirks

- Some project/team IDs are hardcoded in `tp.ts` in addition to being read from env
