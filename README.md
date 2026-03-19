# Targetprocess MCP Server

An **MCP (Model Context Protocol) server** that enables AI assistants to interact with the **Targetprocess** project management platform through structured tools and natural language workflows.

This server exposes powerful capabilities for querying, creating, and managing Targetprocess entities such as user stories, bugs, tasks, and features.

It acts as a **bridge between LLM agents and the Targetprocess API**, providing:

- Structured **tool-based access**
- Semantic, natural-language-driven workflows

---

## Features
  - Create Bugs based on user story
  - Retreive TP entities: bugs, user stories

- **LLM-Friendly Tools**
  - Designed for Claude MCP AI agents

---

## Use Cases examples:

- "Show me currently active release"
- "write me test cases based on 145322 tp user story"
- "add a comment to 145155 card saying 'test'"

- "write test cases based on 145640 user story"
- "write detailed test cases based on 145642 user story, format them inside html <div> element and add them as a comment"

- "create a bug based on 145637 user story where Add Tile flyout (for a Static Tile) not show"

- search for a card with 'Text Element' title

---

## Installation
```json
{
  "mcpServers": {
    "targetprocess": {
      "command": "/Users/mcs/.config/nvm/versions/node/v22.14.0/bin/node",
      "args": [
        "/path/to/repository"
      ],
      "env": {
        "TP_TOKEN": "your-tp-token",
        "TP_BASE_URL": "tp-api-endpoint",
        "TP_API_VERSION": "v1",
        "TP_OWNER_ID": "1504",
        "TP_PROJECT_ID": "59901",
        "TP_TEAM_ID": "127063"
      }
    }
}
```

## Local Development
```
git clone --recursive https://github.com/SerhiiMaksymiv/targetprocess-mcp-server.git
cd targetprocess-mcp-server

npm install
npm run build
```
