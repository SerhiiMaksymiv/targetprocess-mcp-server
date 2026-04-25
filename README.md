# Targetprocess MCP Server

An **MCP (Model Context Protocol) server** that enables AI assistants to interact with the **Targetprocess** project management platform through structured tools and natural language workflows.

This server exposes powerful capabilities for querying, creating, and managing Targetprocess entities such as user stories, bugs, tasks, and features.

It acts as a **bridge between LLM agents and the Targetprocess API**, providing:

- Structured **tool-based access**
- Semantic, natural-language-driven workflows

---

## Features
  - Create standalone bugs or bugs linked to a user story/bug card
  - Retrieve TP entities: bugs, user stories, features, releases

- **LLM-Friendly Tools**
  - Designed for Claude MCP AI agents

---

## Use Cases examples:

- "Show me currently active release"
- "write me test cases based on 145322 tp user story"
- "write detailed test cases based on 145642 bug, format them inside html <div> element, create a test plan and add test cases to it"
- "add a comment to 145155 card saying 'test'"
- "write test cases based on 145640 feature"
- "create a bug based on 145637 user story where Add Tile flyout (for a Static Tile) not show"
- "search for a card with 'Text Element' title"

---
## Available tools:
Releases
- `get_current_releases` — List all current releases (no params needed)
- `get_release_bugs` — Get bugs for a release (name, optional results)
- `get_release_features` — Get features for a release (name, optional results)
- `get_release_user_stories` — Get user stories for a release (name, optional results)
- `get_release_user_stories_with_description` — Same as above but includes full descriptions (name, withDescription)
- `get_release_open_bugs` — Get only active/open bugs for a release (name, withDescription, optional results)
- `get_release_open_user_stories` — Get only active/open user stories for a release (name, withDescription, optional results)

Features
- `get_feature_user_stories` — Get all user stories for a feature by its ID (id)
- `get_not_covered_user_stories_in_feature` — Get user stories in a feature not yet covered by tests, includes `covered` field based on "Test Automation" custom field (id)

Cards — Read
- `get_bug_content` — Fetch full content of a bug by ID (id)
- `get_user_story_content` — Fetch full content of a user story by ID (id)
- `get_bug_comments` — Get comments on a bug (id, optional results)
- `get_user_story_comments` — Get comments on a user story (id, optional results)
- `search_all_cards_by_keyword` — Search bugs, stories, and features by keyword (keyword)

Cards — Write
- `add_comment` — Post a comment to any card (id, comment)
- `create_bug` — Create a standalone bug (title, bugContent, optional origin)
- `create_bug_based_on_card` — Create a bug linked to an existing user story or bug card (card object with id+type, title, bugContent, optional origin)
- `create_test_plan` — Create a test plan linked to a UserStory, Bug, or Feature (title, resourceId, optional resourceType, optional description/startDate/endDate)
- `add_test_cases` — Create a test plan and add generated test cases to it in one call (resourceId, testPlanTitle, testCases array of {name, description}, optional resourceType)

Test Case Workflows
- `write_test_cases` — Fetch a card (UserStory, Bug, or Feature) by ID and trigger the full test case writing workflow: Claude analyzes the card, generates detailed test cases covering happy path, edge cases, and error scenarios, creates a linked test plan via `create_test_plan`, then calls `add_test_cases_to_test_plan`. Each test case description contains Preconditions and Test Type as HTML; steps are passed as a structured array (resourceId, optional resourceType)
- `add_test_cases_to_test_plan` — Add pre-generated test cases to an existing test plan. Each test case has a `name`, an HTML `description` (Preconditions and Test Type only), and a `steps` array of `{ description, result }` objects — steps are created via the TP test step API rather than embedded in the description (testPlanId, testCases array of {name, description, steps})

Projects
- `get_projects` — Get all Targetprocess projects (no params needed)

Teams
- `get_teams` — Get all Targetprocess teams returning id and name (no params needed)

User
- `get_logged_in_user` — Get the currently logged-in user's info (no params needed)

> `origin` accepted values: `Production - Customer`, `Production - Internal`, `Pre-Release - Customer`, `Pre-Release - Internal`, `Regression - Dev01`, `Regression - Team Env`, `Manual QA` *(default)*, `Developer Raised`, `Operations`
---

## Installation
### Local Installation for Development
```json
{
  "mcpServers": {
    "targetprocess": {
      "command": "/Users/xxx/.config/nvm/versions/node/v22.14.0/bin/node",
      "args": [
        "/path/to/repository"
      ],
      "env": {
        "TP_TOKEN": "<your-tp-token>" // Settings -> Authentication and Security -> New Access Token,
        "TP_BASE_URL": "<tp-api-endpoint>",
        "TP_OWNER_ID": "<tp-owner-id>", // your user id
        "TP_PROJECT_ID": "<tp-project-id>",
        "TP_TEAM_ID": "<tp-team-id>"
      }
    }
}
```
### Claude Desktop

> [!NOTE] 
> You need to have `node` and `npm` installed on your machine.

```json
{
  "mcpServers": {
    "targetprocess": {
      "command": "npx",
      "args": [
        "-y",
        "targetprocess-mcp-server"
      ],
      "env": {
        "TP_TOKEN": "<your-tp-token>" // Settings -> Authentication and Security -> New Access Token,
        "TP_BASE_URL": "<tp-api-endpoint>",
        "TP_OWNER_ID": "<tp-owner-id>", // your user id
        "TP_PROJECT_ID": "<tp-project-id>",
        "TP_TEAM_ID": "<tp-team-id>"
      }
    }
  },
}

```

### Claude Code
```bash
claude mcp add targetprocess -s user \
  -e TP_TOKEN=<your-tp-token> -e TP_BASE_URL=<tp-api-endpoint> -- npx -y targetprocess-mcp-server
```

## Local Development
```
git clone --recursive https://github.com/SerhiiMaksymiv/targetprocess-mcp-server.git
cd targetprocess-mcp-server

npm install
npm run build
```
