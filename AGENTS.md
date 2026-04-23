# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

An MCP (Model Context Protocol) server that connects AI assistants to the [Targetprocess](https://www.targetprocess.com/) project management platform. It exposes tools that let Claude query and manage Targetprocess entities (user stories, bugs, features, releases, test plans) via the Targetprocess REST API.

## Commands

```bash
npm run build     # Compile TypeScript → build/src/ (runs rimraf first, chmod +x after)
npm start         # Build + run the server
```

There are no test or lint commands configured.

## Architecture

Four source files in `src/`:

- **`index.ts`** — MCP server entry point. Creates `McpServer`, instantiates `TpClient`, registers all tools with Zod input schemas, and connects via `StdioServerTransport`. Each tool maps to one or more `TpClient` method calls.
- **`tp.ts`** — `TpClient` class. Wraps the Targetprocess REST API with typed GET/POST methods. Auth token is appended as a query param on every request.
- **`types.ts`** — TypeScript interfaces for Targetprocess API response shapes (UserStory, Bug, Release, Feature, TestPlan, General, etc.).
- **`config.ts`** — Loads env vars via dotenv: `TP_BASE_URL`, `TP_TOKEN`, `TP_OWNER_ID`, `TP_PROJECT_ID`, `TP_TEAM_ID`.

**Data flow**: MCP client (Claude) → stdio → `index.ts` tool handler → `TpClient` method → Targetprocess HTTP API → response mapped to MCP content.

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
