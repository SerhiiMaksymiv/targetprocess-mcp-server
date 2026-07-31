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
- `get_feature_content` — Get a Targetprocess Feature by ID, including description, state, and progress (id)
- `get_feature_comments` — Get comments for a feature by its ID (id, optional results)
- `get_feature_user_stories` — Get all user stories for a feature by its ID (id)
- `get_not_covered_user_stories_in_feature` — Get user stories in a feature not yet covered by tests, includes `covered` field based on "Test Automation" custom field (id)

User Stories
- `get_user_story_bugs` — Get all bugs linked to a user story by its ID (id)

Tasks
- `get_in_progress_tasks_and_bugs` — Get all Tasks and Bugs currently in "In Progress" state assigned to a given user (userId)
- `create_task` — Create a new task linked to a user story (title, userStoryId, optional description)
- `list_my_user_stories` — List User Stories assigned to the current user, optionally filtered by state (optional state, optional take, optional skip)
- `list_my_bugs` — List Bugs assigned to the current user, optionally filtered by state (optional state, optional take, optional skip)

Cards — Read
- `get_card_current_status` — Get EntityState, TeamState, and assigned teams for a card (id, optional resourceType: UserStory | Bug | Feature, default: UserStory)
- `get_bug_content` — Fetch full content of a bug by ID (id)
- `get_user_story_content` — Fetch full content of a user story by ID (id)
- `get_bug_comments` — Get comments on a bug (id, optional results)
- `get_user_story_comments` — Get comments on a user story (id, optional results)
- `get_user_story_test_cases` — Fetch the linked test plan and all its test cases (with steps) for a user story (resourceId)
- `get_card_relations` — Get all relations (Dependency, Blocker, Relation, Link, Duplicate) for a card, with direction and the related card (id)
- `get_relation_types` — List the relation types available in this instance (id + name); use to find the `relationType` name for `create_card_relation` (no params)
- `search_tp_cards` — Search TP cards by keyword or phrase in description (keyword, optional entityType: UserStories | Bugs, default: UserStories)

Cards — Write
- `add_comment` — Post a comment to any card (id, comment)
- `add_comment_with_user` — Post a comment to any card and mention a specific user (id, comment, user object from `get_users`)
- `update_bug` — Update an existing bug (id, optional title, optional bugContent, optional origin, optional projectId, optional teamId, optional entityStateId)
  > Resolve state name → ID via `get_bug_workflows` before passing `entityStateId`
- `update_user_story` — Update an existing user story (id, optional title, optional description, optional projectId, optional teamId, optional entityStateId)
  > Resolve state name → ID via `get_user_story_workflows` before passing `entityStateId`
- `create_card_relation` — Create a relation between two cards (masterId, slaveId, optional relationType name, default: "Depends on")
  > The Slave depends on the Master — the Master must be done first
  > `relationType` is matched by name against this instance's types; resolve exact names via `get_relation_types` (it's resolved to an ID before the API call, since TP rejects relation types passed by name)
- `delete_card_relation` — Remove a relation by its relation ID (relationId)
  > Get the `relationId` from `get_card_relations` first — it's the relation's own ID, not a card ID
- `update_user_story_state` — Update the sub-state (team assignment entity state) for a user story (id, optional entityStateId, optional teamId, optional teamAssignmentId)
  > 1. Call `get_user_story_content` first to find the assigned team and `teamAssignmentId`
  > 2. Call `get_user_story_workflows` to resolve the target state name → `entityStateId`
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
- `create_formatted_user_story` — Create a new user story with a structured template description in Header → Definitions → Scenarios → Examples Table → Edge Cases → Acceptance Criteria → References → Notes order (title, header object with asA/iWant/soThat, scenarios array with Gherkin steps, acceptanceCriteria array, optional definitions, examplesTable, edgeCases, references, notes, optional featureId, releaseId, projectId, teamId)  
> [!NOTE]  
> `projectId` and `teamId` are optional — fall back to `TP_PROJECT_ID` and `TP_TEAM_ID` from config  
- `format_existing_user_story` — Re-format the description of an existing user story using the structured template (id, header object with asA/iWant/soThat, acceptanceCriteria array, scenarios array with Gherkin steps, optional title, definitions, examplesTable, edgeCases, references, notes)
  > Call `get_user_story_content` first to read the current content, then reconstruct the structured fields before calling this tool
- `get_epic_content` — Get a Targetprocess Epic by ID, including description, state, and progress (id)
- `update_epic` — Update an epic's title, description, release, or project (id, optional title, optional description, optional releaseId, optional projectId)
- `get_epic_features` — Get all features belonging to an epic (id)
- `create_feature` — Create a new feature (title, optional description, optional epicId, optional releaseId, optional projectId, optional teamId)  
> [!NOTE]  
> `projectId` and `teamId` are optional — fall back to `TP_PROJECT_ID` and `TP_TEAM_ID` from config  
- `create_formatted_feature` — Create a new feature with a feature-level TDRE template in Header → Definitions → Scope & Boundaries → Non-Functional Requirements → Cross-Cutting Scenarios → Child Stories → Open Questions/Risks → References → Notes order (title, header object with businessBackground, nonFunctionalRequirements array with area/requirement/status/storyOrOwner, optional definitions, scope, crossCuttingScenarios, childStories, openQuestions, references, notes, optional epicId, releaseId, projectId, teamId)  
- `update_feature` — Update a feature card with data provided from user input; pass only the fields to change (id, optional title, optional description, optional epicId, optional releaseId, optional projectId, optional teamId, optional entityStateId, optional tags, optional teamIterationId)  
- `create_test_plan` — Create a test plan linked to a UserStory, Bug, or Feature (title, resourceId, optional resourceType, optional description/startDate/endDate)  
> [!NOTE]  
> requires `TP_PROJECT_ID`, 

Test Case Workflows
- `write_test_cases` — Fetch a card (UserStory, Bug, or Feature) by ID and trigger the full test case writing workflow: Claude analyzes the card, generates detailed test cases covering happy path, edge cases, and error scenarios, creates a linked test plan via `create_test_plan`, then calls `add_test_cases_to_test_plan`. Each test case description contains Preconditions and Test Type as HTML; steps are passed as a structured array (resourceId, optional resourceType)
- `add_test_cases_to_test_plan` — Add pre-generated test cases to an existing test plan. Each test case has a `name`, an HTML `description` (Preconditions and Test Type only), and a `steps` array of `{ description, result }` objects — steps are created via the TP test step API rather than embedded in the description (testPlanId, testCases array of {name, description, steps})
- `get_test_plan_by_id` — Get a test plan by ID, including name, plain-text description, state, project, and linked card (id)
- `get_test_plan_test_cases_by_id` — Get test cases for a test plan by ID, including cases from nested child test plans/containers; returns id, name, plain-text description, and containing test plan metadata, no steps (id)
- `get_test_plan_test_cases_with_steps_by_id` — Get test cases directly on a test plan by ID, each with its steps (id)
- `get_test_case_by_id` — Get a single test case by ID, including plain-text description and its steps (id)
- `update_test_case_by_id` — Update a test case's name and/or description (id, optional name, optional description)
- `add_test_case_step_by_id` — Add a new step to a test case (testCaseId, description, result)
- `update_test_case_step_by_id` — Update a test step's description and/or result (id, optional description, optional result)
- `delete_test_case_step_by_id` — Delete a test step by ID (id)

Processes & Workflows
- `get_processes` — Get all Targetprocess processes (no params needed)
- `get_process_workflows` — Get workflows for a specific process (processId)
- `get_bug_workflows` — Get all bug entity states/workflows for the configured process (no params needed)
- `get_user_story_workflows` — Get all user story entity states/workflows for the configured process (no params needed)

Projects
- `get_projects` — Get all Targetprocess projects (no params needed)

Teams
- `get_teams` — Get all Targetprocess teams returning id and name (no params needed)
- `get_teams_and_team_assignments` — Get all teams and team assignments (id and name for each) (no params needed)

User
- `get_logged_in_user` — Get the currently logged-in user's info (no params needed)
- `get_users` — Get all Targetprocess users (no params needed)
- `get_user_by_id` — Get a single Targetprocess user by their ID (id)

Time Tracking
- `log_time` — Log time spent on a Task, User Story, or Bug (entityId, entityType: Task | UserStory | Bug, hours, optional description, optional date)
- `get_my_time_logs` — Get recent time log entries submitted by the current user (optional take)

Assignments
- `assign_role` — Assign a user to a role (e.g. Business Analyst, Developer, QA Engineer) on a TP card (cardId, userId, roleId)
- `assign_role_to_feature` — Assign a user to a role on all user stories in a feature in one call (featureId, userId, roleId)
- `get_assignment_roles` — List all available assignment roles with their IDs

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

## Hosted Streamable HTTP (multi-user)

The installs above run one `TpClient` per stdio process, tied to whichever `TP_TOKEN` is in its env — fine for one person on one machine. `src/http.ts` runs the same set of tools over **Streamable HTTP** instead, so one deployment can serve an entire org, with each person's tool calls attributed to *their own* Targetprocess account rather than one shared token.

### Auth model

Every request needs two things, layered:

1. **Hosting API key** — one shared secret for the whole deployment, sent as `Authorization: Bearer <HOSTING_API_KEY>`. This just gates access to the server itself; it has nothing to do with Targetprocess. Generate one with `openssl rand -hex 32` and set it as `HOSTING_API_KEY` in the server's environment. The server refuses to start without it.
2. **Personal TP token** — each user's own Targetprocess API token, sent as `X-TP-Token: <their-token>` on every request. On session start, the server calls Targetprocess's `Context` endpoint with that token to confirm it's valid and to resolve the caller's own user ID — that ID (not a shared `TP_OWNER_ID`) is what gets used for comment attribution, time logging, and "my stories"/"my bugs" queries for the rest of that session. A missing or rejected token gets a 401 before any tool runs.

`TP_TOKEN` / `TP_OWNER_ID` in the server's env are **not used** in this mode — they only matter for the stdio path. `TP_BASE_URL`, `TP_PROJECT_ID`, and `TP_TEAM_ID` still apply org-wide, same as today.

### Running it

```bash
npm run build
HOSTING_API_KEY=<generated-key> TP_BASE_URL=<tp-api-endpoint> npm run start:http
```

See `.env.example` for the full list of `HTTP_*` variables (port, host, allowed hosts). Reverse proxy / TLS / process management are outside this server's scope — put it behind whatever you already use for other internal HTTP services.

### Client configuration

Each org member points their MCP client at the hosted URL and supplies both headers:

```json
{
  "mcpServers": {
    "targetprocess": {
      "url": "https://<your-hosted-endpoint>/mcp",
      "headers": {
        "Authorization": "Bearer <HOSTING_API_KEY>",
        "X-TP-Token": "<their-own-tp-token>"
      }
    }
  }
}
```

The `HOSTING_API_KEY` is the same for everyone in the org; `X-TP-Token` is personal to each user (Targetprocess → Settings → Authentication and Security → New Access Token) and should never be shared between people, since it's what the server uses to tell them apart.

## Local Development
```
git clone --recursive https://github.com/SerhiiMaksymiv/targetprocess-mcp-server.git
cd targetprocess-mcp-server

npm install
npm run build
```

## Testing

Tests live in `tests/` and use [Vitest](https://vitest.dev/). All tool handlers are extracted to `src/handlers/` and tested with mocked `TpClient` instances — no network calls are made.

```bash
npx vitest run        # run all tests once
npx vitest            # watch mode
```

### Coverage

**53 of 64 tools (83%) are covered by unit tests.**

| Test file | Handlers covered |
|---|---|
| `get_bug_content.test.ts` | `get_bug_content` |
| `get_user_story_content.test.ts` | `get_user_story_content` |
| `get_commit_message.test.ts` | `get_commit_message` |
| `get_current_releases.test.ts` | `get_current_releases` |
| `get_projects.test.ts` | `get_projects` |
| `get_logged_in_user.test.ts` | `get_logged_in_user` |
| `get_user_by_id.test.ts` | `get_user_by_id` |
| `release_tools.test.ts` | `get_release_user_stories`, `get_release_bugs`, `get_release_features`, `get_release_open_bugs`, `get_release_open_user_stories` |
| `user_team_tools.test.ts` | `get_users`, `get_teams`, `get_teams_and_team_assignments` |
| `comment_tools.test.ts` | `add_comment`, `get_user_story_comments`, `get_bug_comments` |
| `creation_tools.test.ts` | `create_bug`, `create_user_story`, `create_feature`, `create_task`, `update_bug`, `update_user_story_state` |
| `my_work_tools.test.ts` | `get_in_progress_tasks_and_bugs`, `list_my_user_stories`, `list_my_bugs`, `log_time`, `get_my_time_logs` |
| `entity_tools.test.ts` | `get_feature_user_stories`, `get_user_story_bugs`, `get_card_current_status` |
| `relation_tools.test.ts` | `get_card_relations`, `create_card_relation`, `delete_card_relation` |
| `epic_tools.test.ts` | `create_epic`, `get_epic_content`, `update_epic`, `get_epic_features` |
| `test_plan_tools.test.ts` | `get_test_plan_by_id`, `get_test_plan_test_cases_by_id`, `get_test_plan_test_cases_with_steps_by_id` |
| `test_case_tools.test.ts` | `get_test_case_by_id`, `update_test_case_by_id`, `add_test_case_step_by_id`, `update_test_case_step_by_id`, `delete_test_case_step_by_id` |
| `workflow_tools.test.ts` | `get_processes`, `get_process_workflows`, `get_bug_workflows`, `get_user_story_workflows`, `get_relation_types`, `get_version` |
