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

User Stories
- `get_user_story_bugs` — Get all bugs linked to a user story by its ID (id)

Tasks
- `get_in_progress_tasks_and_bugs` — Get all Tasks and Bugs currently in "In Progress" state assigned to a given user (userId)
- `create_task` — Create a new task linked to a user story (title, userStoryId, optional description)

Cards — Read
- `get_card_current_status` — Get EntityState, TeamState, and assigned teams for a card (id, optional resourceType: UserStory | Bug | Feature, default: UserStory)
- `get_bug_content` — Fetch full content of a bug by ID (id)
- `get_user_story_content` — Fetch full content of a user story by ID (id)
- `get_bug_comments` — Get comments on a bug (id, optional results)
- `get_user_story_comments` — Get comments on a user story (id, optional results)
- `get_user_story_test_cases` — Fetch the linked test plan and all its test cases (with steps) for a user story (resourceId)
- `search_tp_cards` — Search TP cards by keyword or phrase in description (keyword, optional entityType: UserStories | Bugs, default: UserStories)

Cards — Write
- `add_comment` — Post a comment to any card (id, comment)
- `add_comment_with_user` — Post a comment to any card and mention a specific user (id, comment, user object from `get_users`)
- `update_bug` — Update an existing bug (id, optional title, optional bugContent, optional origin, optional projectId, optional teamId, optional entityStateId)
  > Resolve state name → ID via `get_bug_workflows` before passing `entityStateId`
- `update_user_story` — Update an existing user story (id, optional title, optional description, optional projectId, optional teamId, optional entityStateId)
  > Resolve state name → ID via `get_user_story_workflows` before passing `entityStateId`
- `create_bug` — Create a standalone bug (title, bugContent, optional origin, optional projectId, optional teamId, optional entityStateName)
  > `origin` accepted values: `Production - Customer`, `Production - Internal`, `Pre-Release - Customer`, `Pre-Release - Internal`, `Regression - Dev01`, `Regression - Team Env`, `Manual QA` *(default)*, `Developer Raised`, `Operations`
  > `entityStateName` accepted values: `Backlog`, `In Triage`, `Ready for Dev`, `In Dev`, `Blocked`, `PR Raised`, `Ready for Feature PCH`, `Ready for Feature QA`, `In Feature QA`, `Failed Feature QA`, `Ready for Merge`, `Ready to Deploy to Dev01`, `Ready for Dev01 QA`, `In Dev01 QA`, `Failed Dev01 QA`, `Ready to Deploy to prod`, `Closed`
> [!NOTE]  
> `projectId` and `teamId` are optional — fall back to `TP_PROJECT_ID` and `TP_TEAM_ID` from config  
- `create_bug_based_on_card` — Create a bug linked to an existing user story or bug card (card object with id+type, title, bugContent, optional origin, optional projectId, optional teamId)  
> [!NOTE]  
> `projectId` and `teamId` are optional — fall back to `TP_PROJECT_ID` and `TP_TEAM_ID` from config  
- `create_user_story` — Create a new user story (title, optional description, optional featureId, optional releaseId, optional projectId, optional teamId)  
> [!NOTE]  
> `projectId` and `teamId` are optional — fall back to `TP_PROJECT_ID` and `TP_TEAM_ID` from config  
- `create_feature` — Create a new feature (title, optional description, optional epicId, optional releaseId, optional projectId, optional teamId)  
> [!NOTE]  
> `projectId` and `teamId` are optional — fall back to `TP_PROJECT_ID` and `TP_TEAM_ID` from config  
- `create_test_plan` — Create a test plan linked to a UserStory, Bug, or Feature (title, resourceId, optional resourceType, optional description/startDate/endDate)  
> [!NOTE]  
> requires `TP_PROJECT_ID`, 

Test Case Workflows
- `write_test_cases` — Fetch a card (UserStory, Bug, or Feature) by ID and trigger the full test case writing workflow: Claude analyzes the card, generates detailed test cases covering happy path, edge cases, and error scenarios, creates a linked test plan via `create_test_plan`, then calls `add_test_cases_to_test_plan`. Each test case description contains Preconditions and Test Type as HTML; steps are passed as a structured array (resourceId, optional resourceType)
- `add_test_cases_to_test_plan` — Add pre-generated test cases to an existing test plan. Each test case has a `name`, an HTML `description` (Preconditions and Test Type only), and a `steps` array of `{ description, result }` objects — steps are created via the TP test step API rather than embedded in the description (testPlanId, testCases array of {name, description, steps})

Processes & Workflows
- `get_processes` — Get all Targetprocess processes (no params needed)
- `get_process_workflows` — Get workflows for a specific process (processId)
- `get_bug_workflows` — Get all bug entity states/workflows for the configured process (no params needed)
- `get_user_story_workflows` — Get all user story entity states/workflows for the configured process (no params needed)

Projects
- `get_projects` — Get all Targetprocess projects (no params needed)

Teams
- `get_teams` — Get all Targetprocess teams returning id and name (no params needed)

User
- `get_logged_in_user` — Get the currently logged-in user's info (no params needed)
- `get_users` — Get all Targetprocess users (no params needed)
- `get_user_by_id` — Get a single Targetprocess user by their ID (id)

Developer Tools
- `get_commit_message` — Returns a formatted commit message string for a task or bug ID (id, type: task | bug)
  > Format for task on a user story: `F#<featureId> US#<userStoryId> T#<taskId> <title>`
  > Format for bug on a user story: `F#<featureId> US#<userStoryId> B#<bugId> <title>`
  > Format for standalone bug: `B#<bugId> <title>`


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
        "TP_PROJECT_ID": "<tp-project-id>"
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
        "TP_BASE_URL": "<tp-api-endpoint>", // required
        "TP_OWNER_ID": "<tp-owner-id>", // required, your user id
        "TP_PROJECT_ID": "<tp-project-id>", // optional see available tools 
        "TP_TEAM_ID": "<tp-team-id>" // optional see available tools
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
