#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";

import { TpClient } from "./tp.js";
import * as TP from "./types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config.js";
import { handleGetProjects } from "./handlers/get_projects.js";
import { handleGetUserById } from "./handlers/get_user_by_id.js";
import { handleGetCurrentReleases } from "./handlers/get_current_releases.js";
import { handleGetBugContent } from "./handlers/get_bug_content.js";
import { handleGetLoggedInUser } from "./handlers/get_logged_in_user.js";
import { handleGetUserStoryContent } from "./handlers/get_user_story_content.js";
import { handleGetCommitMessage } from "./handlers/get_commit_message.js";
import { handleGetReleaseUserStories } from "./handlers/get_release_user_stories.js";
import { handleGetReleaseBugs } from "./handlers/get_release_bugs.js";
import { handleGetReleaseFeatures } from "./handlers/get_release_features.js";
import { handleGetReleaseOpenBugs } from "./handlers/get_release_open_bugs.js";
import { handleGetReleaseOpenUserStories } from "./handlers/get_release_open_user_stories.js";
import { handleGetUsers } from "./handlers/get_users.js";
import { handleGetTeams, handleGetTeamsAndTeamAssignments } from "./handlers/get_teams.js";
import { handleAddComment } from "./handlers/add_comment.js";
import { handleGetUserStoryComments } from "./handlers/get_user_story_comments.js";
import { handleGetBugComments } from "./handlers/get_bug_comments.js";
import { handleCreateBug } from "./handlers/create_bug.js";
import { handleCreateUserStory } from "./handlers/create_user_story.js";
import { handleCreateFeature } from "./handlers/create_feature.js";
import { handleCreateTask } from "./handlers/create_task.js";
import { handleUpdateBug } from "./handlers/update_bug.js";
import { handleGetInProgressTasksAndBugs } from "./handlers/get_in_progress_tasks_and_bugs.js";
import { handleListMyUserStories } from "./handlers/list_my_user_stories.js";
import { handleListMyBugs } from "./handlers/list_my_bugs.js";
import { handleLogTime } from "./handlers/log_time.js";
import { handleGetMyTimeLogs } from "./handlers/get_my_time_logs.js";
import { handleGetFeatureUserStories } from "./handlers/get_feature_user_stories.js";
import { handleGetUserStoryBugs } from "./handlers/get_user_story_bugs.js";
import { handleGetCardCurrentStatus } from "./handlers/get_card_current_status.js";
import { handleUpdateUserStorySubState } from "./handlers/update_user_story_sub_state.js";

const server = new McpServer(
  {
    name: "tp",
    version: "1.0.0"
  },
  {
    capabilities: {
      "tools": {
        "listChanged": true
      },
      "prompts": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      }
    }
  }
)

const tp = new TpClient()

server.registerTool(
  'get_user_story_content',
  {
    title: 'Get TP user story content',
    description: 'Get tp card (user story) content by specified id, e.g. 145789',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP (or tp) ID (e.g. 145789)')
    },
  },
  async ({ id }) => handleGetUserStoryContent(tp, id)
);

server.registerTool(
  'get_current_releases',
  {
    title: 'Get current releases',
    description: 'Get current releases',
  },
  async () => handleGetCurrentReleases(tp)
);

server.registerTool(
  'get_release_user_stories',
  {
    title: 'Get release user stories',
    description: 'Get release user stories',
    inputSchema: {
      name: z.string()
        .describe('Release name'),
      results: z.number()
        .default(50)
        .optional()
        .describe('Number of results to return, default is 50'),
    },
  },
  async ({ name, results }) => handleGetReleaseUserStories(tp, name, results)
);

server.registerTool(
  'get_release_bugs',
  {
    title: 'Get release bugs',
    description: 'Get release bugs',
    inputSchema: {
      name: z.string()
        .describe('Release name'),
      results: z.number()
        .default(100)
        .optional()
        .describe('Number of results to return, default is 100'),
    },
  },
  async ({ name, results }) => handleGetReleaseBugs(tp, name, results)
);

server.registerTool(
  'get_release_features',
  {
    title: 'Get release features',
    description: 'Get release features',
    inputSchema: {
      name: z.string()
        .describe('Release name'),
      results: z.number()
        .default(50)
        .optional()
        .describe('Number of results to return, default is 100'),
    },
  },
  async ({ name, results }) => handleGetReleaseFeatures(tp, name, results)
);

server.registerTool(
  'get_release_user_stories_with_description',
  {
    title: 'Get release user stories with description',
    description: `Get release user stories with description in the response.
      Note: this is slower than "get_release_user_stories_names" tool,
      but if user wants to get descriptions, then this tool is the way to go.
    `,
    inputSchema: {
      name: z.string()
        .describe('Release name'),
      withDescription: z.boolean()
        .describe('Include description in the response'),
    },
  },
  async ({ name, withDescription }) => handleGetReleaseUserStories(tp, name, undefined, withDescription)
);

server.registerTool(
  'get_release_open_bugs',
  {
    title: 'Get release active bugs',
    description: `Get release active bugs (bugs that are not closed, done, passed, ready to deploy)`,
    inputSchema: {
      name: z.string()
        .describe('Release name'),
      results: z.number()
        .default(200)
        .optional()
        .describe('Number of results to return, default is 50'),
      withDescription: z.boolean()
        .describe('Include description in the response'),
    },
  },
  async ({ name, results, withDescription }) => handleGetReleaseOpenBugs(tp, name, results, withDescription)
);

server.registerTool(
  'get_release_open_user_stories',
  {
    title: 'Get release active user stories',
    description: `Get release active user stories (user stories that are not closed, done, passed, ready to deploy)`,
    inputSchema: {
      name: z.string()
        .describe('Release name'),
      results: z.number()
        .default(100)
        .optional()
        .describe('Number of results to return, default is 50'),
      withDescription: z.boolean()
        .describe('Include description in the response'),
    },
  },
  async ({ name, results, withDescription }) => handleGetReleaseOpenUserStories(tp, name, results, withDescription)
);

server.registerTool('search_tp_cards', {
  title: 'Search TP cards by keyword or phrase in description',
  description: `Searches TP cards (UserStories or Bugs) by keyword or phrase or partial keyphrase in Card Description e.g. "Text Element", "Font field"
    NOTE: after results are returned, try analyze and filter results by most relevant to what user is looking for in the description text
    FALLBACK: if no results are found, try spliting phrase by spaces and searching for each word and with "Generals" entity type`,
  inputSchema: {
    keyword: z.string()
      .describe('Keyword or partial name or keyphrase to search for in description'),
    entityType: z.enum(["UserStories", "Bugs", "Generals"])
      .default("UserStories")
      .optional()
      .describe('Type of TP entity to search — UserStories or Bugs (default: UserStories)'),
  },
},
  async ({ keyword, entityType = "UserStories" }) => {
    const results = await Promise.all<TP.TpResponse<TP.General>>([
      tp.searchContainsNameText<TP.TpResponse<TP.UserStory>>({ text: keyword, entityType }),
      tp.searchContainsDescriptionText<TP.TpResponse<TP.General>>({ text: keyword, entityType })
    ])
    if (!results) {
      return {
        content: [{
          type: 'text',
          text: `Failed to search for keyword: "${keyword}"\n JSON: ${JSON.stringify(results, null, 2)}`
        }],
      }
    }

    const items = results.map((item: TP.TpResponse<TP.General>) => item.Items).flat()

    if (items.length == 0) {
      return {
        content: [{
          type: 'text',
          text: `Failed to find card by keyword: "${keyword}"\n JSON: ${JSON.stringify(results, null, 2)}`
        }],
      }
    }

    const parsedItems = items.map((item) => {
      const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
      const descriptionText = dom.window.document.getElementById('content')?.textContent
      return {
        title: item.Name,
        id: item.Id,
        description: descriptionText,
        url: `${config.tp.url}/entity/${item.Id}`,
      }
    })

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(parsedItems)
      }],
    };
  }
)

server.registerTool(
  'get_bug_content',
  {
    title: 'Get TP bug content',
    description: 'Get tp card (bug) content by specified id, e.g. 145789',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('Bug card ID (e.g. 145789)')
    },
  },
  async ({ id }) => handleGetBugContent(tp, id)
);

server.registerTool(
  'get_user_by_id',
  {
    title: 'Get user by id',
    description: 'Get user by id',
    inputSchema: {
      id: z.string()
        .describe('User email'),
    },
  },
  async ({ id }) => handleGetUserById(tp, id)
);

server.registerTool(
  'get_users',
  {
    title: 'Get users',
    description: 'Get all users',
  },
  async () => handleGetUsers(tp)
);

server.registerTool(
  'add_comment_with_user',
  {
    title: 'Adds provided content to TP card (user story) as a comment',
    description: `Adds provided content as a comment to the specified tp card by id, e.g. 145789 and mentions the user in the comment
    CRITICAL WORKFLOW:
      1) call 'get_users' to get list of available users
      2) find the user by email, first name, or last name in the users list
      `,
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP card id, usually user story or bug ID (e.g. 145789)'),
      comment: z.string()
        .describe('Comment content to add'),
      user: z.object({
        Email: z.string()
          .describe('User email'),
        FirstName: z.string()
          .describe('User first name'),
        LastName: z.string()
          .describe('User last name'),
        IsActive: z.boolean()
          .describe('User is active'),
      })
        .describe('User to add to the comment, from "get_users" tool'),
    },
  },
  async ({ id, comment, user }) => {
    try {
      const addCommentResponse = await tp.addCommentWithUser<TP.Comment>(id, comment, (user as TP.LoggedUser));
      if (!addCommentResponse) {
        return {
          content: [{
            type: 'text',
            text: `Failed to add comment to user story id: ${id}`
          }]
        };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(addCommentResponse)
        }],
      };
    } catch (error) {
      console.error("Error adding comment to user story:", error);
      return {
        content: [{
          type: 'text',
          text: `Failed to add comment to user story id: ${id}`
        }]
      };
    }
  }
)

server.registerTool(
  'add_comment',
  {
    title: 'Adds provided content to TP card (user story) as a comment',
    description: `Adds provided content as a comment to the specified tp card by id, e.g. 145789`,
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP card id, usually user story or bug ID (e.g. 145789)'),
      comment: z.string()
        .describe('Comment content to add'),
    },
  },
  async ({ id, comment }) => handleAddComment(tp, id, comment)
)

server.registerTool(
  'get_user_story_comments',
  {
    title: 'Get user story comments',
    description: 'Get comments for a TP user story by its ID',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP user story ID (e.g. 145789)'),
      results: z.number()
        .default(25)
        .optional()
        .describe('Number of comments to return, default is 25'),
    },
  },
  async ({ id, results }) => handleGetUserStoryComments(tp, id, results)
)

server.registerTool(
  'get_bug_comments',
  {
    title: 'Get bug comments',
    description: 'Get comments for a TP bug by its ID',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP bug ID (e.g. 145789)'),
      results: z.number()
        .default(25)
        .optional()
        .describe('Number of comments to return, default is 25'),
    },
  },
  async ({ id, results }) => handleGetBugComments(tp, id, results)
)

server.registerTool(
  'create_bug_based_on_card',
  {
    title: 'Create a new bug card based on provided card id',
    description: `Create a new bug card based on provided card id that summarizes the problem in concise, descriptive manner answering questions What? Where? When?, and content explaining what happened in detail. 
      NOTE: this tool requires a user story, bug, or feature card as a reference (i.e. card ID).
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps:
        1) IF you already have user story, bug, or feature card content, proceed to step 3 skipping step 2;
        2) ELSE call "get_user_story_content" tool, "get_bug_content" tool, or fetch the feature to get card content;
        3) format the new bug inside html <div> tags with Environment (describes where bug was found, dev, feature, review or uat Environment), Issue Description, Steps to Reproduce, Expected Behavior, Actual Behavior and Attachments sections (note: section titles should be wrapped in <h3> tags, e.g. <h3>Issue Description</h3>);
        4) IF the user specified a team by name (not ID), call "get_teams" to find the matching team and use its ID as teamId;
        5) IF the user specified a project by name (not ID), call "get_projects" to find the matching project and use its ID as projectId;
        6) add a comment to the card with created bug Id and its Title`,
    inputSchema: {
      title: z.string()
        .describe('Bug card title that summarizes the problem in concise, descriptive, and actionable manner, enabling a developer to understand the issue without opening the report'),
      card: z.object({
        id: z.string()
          .min(5)
          .max(6)
          .describe(`Usually user story id, bug ID, or feature ID (e.g. 145789)`),
        type: z.enum(["UserStory", "Bug", "Feature"])
      }),
      bugContent: z.string()
        .describe(`Comment content to add, explain what happened in detail.
                  Include expected behaviour and what actually occurred.
                  Be specific and avoid assumptions.
                  Clearly outline the actions needed to trigger the bug.
                  Number each step so anyone can follow them easily`),
      origin: z.enum([
        "Production - Customer",
        "Production - Internal",
        "Pre-Release - Customer",
        "Pre-Release - Internal",
        "Regression - Dev01",
        "Regression - Team Env",
        "Manual QA",
        "Developer Raised",
        "Operations",
      ])
        .default("Manual QA")
        .optional()
        .describe('Where the bug was found, defaults to "Manual QA" if no origin was specified'),
      projectId: z.string()
        .optional()
        .describe('Optional Project ID — if user gave a project name, resolve it via "get_projects" first; defaults to TP_PROJECT_ID from config'),
      teamId: z.string()
        .optional()
        .describe('Optional Team ID — if user gave a team name, resolve it via "get_teams" first; defaults to TP_TEAM_ID from config'),
    },
  },
  async ({ title, card, bugContent, origin, projectId, teamId }) => {
    const bugResponse = await tp.createBug<TP.Bug>({ title, card, bugContent, origin, projectId, teamId });

    if (!bugResponse) {
      return {
        content: [{
          type: 'text',
          text: `Failed to create bug "${title}"\n JSON: ${JSON.stringify(bugResponse, null, 2)}`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(bugResponse)
      }],
    };
  }
)

server.registerTool(
  'update_bug',
  {
    title: 'Update a bug card',
    description: `Update a bug card with data proded from user input.
      NOTE: pass only the fields that user wants to update.
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps:
        1) IF the user specified a team by name (not ID), call "get_teams" to find the matching team and use its ID as teamId;
        2) IF the user specified a project by name (not ID), call "get_projects" to find the matching project and use its ID as projectId;
        3) IF the user specified a state by name (not ID), call "get_bug_workflows" to find the matching state and use its ID as entityStateId;`,
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('Bug card ID (e.g. 145789)'),
      title: z.string()
        .optional()
        .describe('Bug card title that summarizes the problem in concise, descriptive, and actionable manner, enabling a developer to understand the issue without opening the report'),
      bugContent: z.string()
        .optional()
        .describe(`Bug description content, explain what happened in detail. Include expected behaviour and what actually occurred. Be specific and avoid assumptions. Clearly outline the actions needed to trigger the bug. Number each step so anyone can follow them easily`),
      origin: z.enum([
        "Production - Customer",
        "Production - Internal",
        "Pre-Release - Customer",
        "Pre-Release - Internal",
        "Regression - Dev01",
        "Regression - Team Env",
        "Manual QA",
        "Developer Raised",
        "Operations",
      ])
        .optional()
        .describe('Where the bug was found, defaults to "Manual QA"'),
      projectId: z.string()
        .optional()
        .describe('Optional Project ID — if user gave a project name, resolve it via "get_projects" first; defaults to TP_PROJECT_ID from config'),
      teamId: z.string()
        .optional()
        .describe('Optional Team ID — if user gave a team name, resolve it via "get_teams" first; defaults to TP_TEAM_ID from config'),
      entityStateId: z.string()
        .optional()
        .describe('Optional Entity State ID — if user gave a state name, resolve it via "get_bug_workflows" first; defaults to "Done"'),
    },
  },
  async ({ id, title, bugContent, origin, projectId, teamId, entityStateId }) =>
    handleUpdateBug(tp, { id, title, bugContent, origin, projectId, teamId, entityStateId })
)

server.registerTool(
  'update_user_story_state',
  {
    title: 'Update a user story card sub state',
    description: `Update a user story card sub state with data provided from user input.
    CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps:
      1) call "get_user_story_content" to find the matching team, assigned (responsible) team and their IDs
      1) call "get_user_story_workflows" to find matching state and use its ID in entityStateId`,
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('User story card ID (e.g. 145789)'),
      entityStateId: z.string()
        .optional()
        .describe('Entity state ID, resolve it via "get_user_story_workflows" first'),
      teamId: z.string()
        .optional()
        .describe('Team ID, resolve it via "get_teams" first'),
      teamAssignmentId: z.string()
        .optional()
        .describe('Team Assignment ID, resolve it via "get_user_story_content" first'),
    },
  }, async ({ id, teamId, teamAssignmentId, entityStateId }) => handleUpdateUserStorySubState(tp, { id, teamId, teamAssignmentId, entityStateId }))

server.registerTool(
  'update_user_story',
  {
    title: 'Update a user story card',
    description: `Update a user story card with data provided from user input.
      NOTE: pass only the fields that user wants to update.
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps:
        1) IF the user specified a team by name (not ID), call "get_teams" to find the matching team and use its ID as teamId;
        2) IF the user specified a project by name (not ID), call "get_projects" to find the matching project and use its ID as projectId;
        3) IF the user specified a state by name (not ID), call "get_user_story_workflows" to find the matching state and use its ID as entityStateId;`,
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('User story card ID (e.g. 145789)'),
      title: z.string()
        .optional()
        .describe('Updated user story title'),
      description: z.string()
        .optional()
        .describe('Updated user story description (format as HTML)'),
      projectId: z.string()
        .optional()
        .describe('Optional Project ID — if user gave a project name, resolve it via "get_projects" first'),
      teamId: z.string()
        .optional()
        .describe('Optional Team ID — if user gave a team name, resolve it via "get_teams" first'),
      entityStateId: z.string()
        .optional()
        .describe('Optional Entity State ID — if user gave a state name, resolve it via "get_user_story_workflows" first'),
    },
  },
  async ({ id, title, description, projectId, teamId, entityStateId }) => {
    const response = await tp.updateUserStory<any>({ id, title, description, projectId, teamId, entityStateId });

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to update user story id: ${id}\n JSON: ${JSON.stringify(response, null, 2)}`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response)
      }],
    };
  }
)

server.registerTool(
  'create_bug',
  {
    title: 'Create a new bug card',
    description: `Create a new bug card that summarizes the problem in concise, descriptive manner answering questions "What? Where? When?" and content explaining what happened in detail.
      NOTE: this tool does not require a user story or bug card reference.
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps:
        1) format the new bug inside html <div> tags with Environment(describes where bug was found, dev, feature, review or uat Environment), Issue Description, Steps to Reproduce, Expected Behavior, Actual Behavior and Attachments sections (note: section titles should be wrapped in <h3> tags, e.g. <h3>Issue Description</h3>, step to reproduce should be wrapped in <ol>);
        2) IF the user specified a team by name (not ID), call "get_teams" to find the matching team and use its ID as teamId;
        3) IF the user specified a project by name (not ID), call "get_projects" to find the matching project and use its ID as projectId;`,
    inputSchema: {
      title: z.string()
        .describe('Bug card title that summarizes the problem in concise, descriptive, and actionable manner, enabling a developer to understand the issue without opening the report'),
      bugContent: z.string()
        .describe(`Bug description content, explain what happened in detail. Include expected behaviour and what actually occurred. Be specific and avoid assumptions. Clearly outline the actions needed to trigger the bug. Number each step so anyone can follow them easily`),
      origin: z.enum([
        "Production - Customer",
        "Production - Internal",
        "Pre-Release - Customer",
        "Pre-Release - Internal",
        "Regression - Dev01",
        "Regression - Team Env",
        "Manual QA",
        "Developer Raised",
        "Operations",
      ])
        .default("Manual QA")
        .optional()
        .describe('Where the bug was found, defaults to "Manual QA" if no origin was specified'),
      projectId: z.string()
        .optional()
        .describe('Optional Project ID — if user gave a project name, resolve it via "get_projects" first; defaults to TP_PROJECT_ID from config'),
      teamId: z.string()
        .optional()
        .describe('Optional Team ID — if user gave a team name, resolve it via "get_teams" first; defaults to TP_TEAM_ID from config'),
      entityStateId: z.string()
        .optional()
        .describe('Optional Entity State ID — if user gave a state name, resolve it via "get_bug_workflows" first; defaults to "Done"'),
    },
  },
  async ({ title, bugContent, origin, projectId, teamId, entityStateId }) =>
    handleCreateBug(tp, { title, bugContent, origin, projectId, teamId, entityStateId })
)

server.registerTool(
  'create_user_story',
  {
    title: 'Create a new user story',
    description: `Create a new user story in Targetprocess.`,
    inputSchema: {
      title: z.string()
        .describe('User story title'),
      description: z.string()
        .optional()
        .describe('Optional user story description (when provided, format as HTML)'),
      featureId: z.string()
        .min(5)
        .max(6)
        .optional()
        .describe('Optional Feature ID to link this user story to (e.g. 145636)'),
      releaseId: z.string()
        .min(5)
        .max(6)
        .optional()
        .describe('Optional Release ID to link this user story to (e.g. 145200)'),
      projectId: z.string()
        .optional()
        .describe('Optional Project ID — defaults to TP_PROJECT_ID from config'),
      teamId: z.string()
        .optional()
        .describe('Optional Team ID — defaults to TP_TEAM_ID from config'),
    },
  },
  async ({ title, description, featureId, releaseId, projectId, teamId }) =>
    handleCreateUserStory(tp, { title, description, featureId, releaseId, projectId, teamId })
)

server.registerTool(
  'create_feature',
  {
    title: 'Create a new feature',
    description: `Create a new Feature in Targetprocess.`,
    inputSchema: {
      title: z.string()
        .describe('Feature title'),
      description: z.string()
        .optional()
        .describe('Optional feature description (when provided, format as HTML)'),
      epicId: z.string()
        .min(5)
        .max(6)
        .optional()
        .describe('Optional Epic ID to link this feature to (e.g. 145636)'),
      releaseId: z.string()
        .min(5)
        .max(6)
        .optional()
        .describe('Optional Release ID to link this feature to (e.g. 145200)'),
      projectId: z.string()
        .optional()
        .describe('Optional Project ID — defaults to TP_PROJECT_ID from config'),
      teamId: z.string()
        .optional()
        .describe('Optional Team ID — defaults to TP_TEAM_ID from config'),
    },
  },
  async ({ title, description, epicId, releaseId, projectId, teamId }) =>
    handleCreateFeature(tp, { title, description, epicId, releaseId, projectId, teamId })
)

server.registerTool(
  'create_test_plan',
  {
    title: 'Create a new test plan linked to a TP card',
    description: `Create a new test plan linked to a UserStory, Bug, or Feature. Name and Project are required by the API; Description, StartDate, and EndDate are optional.`,
    inputSchema: {
      title: z.string()
        .describe('Test plan title — use the linked card name'),
      resourceId: z.string()
        .min(5)
        .max(6)
        .describe('ID of the card to link this test plan to (e.g. 145789)'),
      resourceType: z.enum(['UserStory', 'Bug', 'Feature'])
        .default('UserStory')
        .optional()
        .describe('Type of the linked card — UserStory, Bug, or Feature (default: UserStory)'),
      description: z.string()
        .optional()
        .describe('Optional description of the test plan scope or goals')
    },
  },
  async ({ title, resourceId, resourceType, description }) => {
    const testPlanResponse = await tp.createTestPlan<TP.TestPlan>(title, resourceId, resourceType, { description });

    if (!testPlanResponse) {
      return {
        content: [{
          type: 'text',
          text: `Failed to create test plan "${title}" for ${resourceType} id: ${resourceId}`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(testPlanResponse)
      }],
    };
  }
)

server.registerTool(
  'get_not_covered_user_stories_in_feature',
  {
    title: 'Get not covered user stories in feature',
    description: 'Get user stories for a TP feature by its ID that are not covered by any tests',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP feature ID (e.g. 145636)'),
    },
  },
  async ({ id }) => {
    const response = await tp.getUserStoriesIdsByFeatureId<TP.TpResponseItemsV2<{ id: string }>>(id)

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get user stories for feature id: ${id}`
        }],
      }
    }

    const userStoriesIds = response.items || []
    if (userStoriesIds.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No user stories found in outer items for feature id: ${id}`,
        }],
      }
    }

    const userStoriesPromise = userStoriesIds.map((item: { id: string }) => tp.getUserStory<TP.UserStory>(item.id))
    let userStoriesResults = []
    try {
      const results = await Promise.all(userStoriesPromise)
      userStoriesResults = results.map((item: TP.UserStory) => item).flat()
    } catch (error) {
      console.error("Error getting user stories:", error);
      return {
        content: [{
          type: 'text',
          text: `Failed to get user stories for feature id: ${id}. Error: ${error}.`
        }],
      }
    }

    if (userStoriesResults.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No user stories promise found for feature id: ${id}`,
        }],
      }
    }

    let userStories: {
      id: number
      name: string
      description: string
      featureId?: number
      featureName?: string
      covered: boolean
    }[] = []

    try {
      for (const userStory of userStoriesResults) {
        const covered = userStory?.CustomFields.find((field: any) => field.Name === "Test Automation")?.Value === "Done"

        userStories.push({
          id: userStory.Id,
          name: userStory.Name,
          description: userStory.Description,
          featureId: userStory.Feature.Id,
          featureName: userStory.Feature.Name,
          covered,
        })
      }
    } catch (error) {
      console.error("Error getting user stories:", error);
      return {
        content: [{
          type: 'text',
          text: `Failed to get user stories array for feature id: ${id}: Error: ${error}.`
        }],
      }
    }

    if (userStories.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No user stories unable to convert to TP card found for feature id: ${id}`,
        }],
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(userStories)
      }],
    }
  }
)

server.registerTool(
  'get_feature_user_stories',
  {
    title: 'Get feature user stories',
    description: 'Get user stories for a TP feature by its ID',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP feature ID (e.g. 145636)'),
    },
  },
  async ({ id }) => handleGetFeatureUserStories(tp, id)
);

server.registerTool(
  'get_user_story_bugs',
  {
    title: 'Get user story bugs',
    description: 'Get bugs linked to a TP user story by its ID',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP user story ID (e.g. 145789)'),
    },
  },
  async ({ id }) => handleGetUserStoryBugs(tp, id)
);

server.registerTool(
  'get_projects',
  {
    title: 'Get projects',
    description: 'Get all Targetprocess projects',
  },
  async () => handleGetProjects(tp)
);

server.registerTool('get_teams_and_team_assignments', {
  title: 'Get teams and team assignments',
  description: 'Get all Targetprocess teams and team assignments',
}, async () => handleGetTeamsAndTeamAssignments(tp))

server.registerTool(
  'get_teams',
  {
    title: 'Get teams',
    description: 'Get all Targetprocess teams',
  },
  async () => handleGetTeams(tp)
);

server.registerTool(
  'get_logged_in_user',
  {
    title: 'Get logged in user',
    description: 'Get logged in user',
  },
  async () => handleGetLoggedInUser(tp)
);

server.registerTool(
  'get_user_story_test_cases',
  {
    title: 'Get test cases for TP UserStory card',
    description: `Fetches a TP UserStory Linked Test Plan and fetches its Test Cases by provided card ID.`,
    inputSchema: {
      resourceId: z.string()
        .min(5)
        .max(6)
        .describe('TP UserStory ID (e.g. 145789)')
    },
  },
  async ({ resourceId }) => {
    const userStoryResponse = await tp.getUserStoryTestPlan<TP.TpResponseV2<Record<"linkedTestPlan", TP.TpResultItemV2>>>(resourceId)

    if (!userStoryResponse) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get test user story, JSON: ${JSON.stringify(userStoryResponse, null, 2)}`
        }],
      }
    }

    const items = userStoryResponse.items
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No items in ${resourceId} user story response`,
        }],
      };
    }

    const testPlan = items[0].linkedTestPlan
    if (!testPlan) {
      return {
        content: [{
          type: 'text',
          text: `No linked test plan found for user story id: ${resourceId}`,
        }],
      };
    }

    const testCases = await tp.getTestPlanTestCases<TP.TpResponse<TP.TestCase>>(String(testPlan.id))
    if (testCases.Items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No test cases found in test plan id: ${testPlan.id}`,
        }],
      };
    }

    const testCaseItems = testCases.Items
    if (!testCaseItems || testCaseItems.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No test case items found in test plan id: ${testPlan.id}`,
        }],
      };
    }

    const testCasesData = await Promise.all(testCaseItems.map(async (item) => {
      const testCaseSteps = await tp.getTestCaseSteps<TP.TpResponse<TP.TestStep>>(String(item.Id))
      return {
        testCaseId: item.Id,
        testCaseName: item.Name,
        testCaseDescription: item.Description,
        testCaseSteps: testCaseSteps.Items.map((step) => ({
          description: step.Description,
          result: step.Result,
          runOrder: step.RunOrder,
        }))
      }
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(testCasesData)
      }],
    };
  }
)

server.registerTool(
  'write_test_cases',
  {
    title: 'Write test cases for a TP card (UserStory, Bug, or Feature)',
    description: `Fetches a TP card (UserStory, Bug, or Feature) content by ID.
      CRITICAL WORKFLOW — after receiving the card content, you MUST:
        1) Thoroughly analyze the card name and description to understand the feature or issue being tested
        2) Write detailed test cases covering: happy path, edge cases, boundary conditions, and error scenarios
        3) For each test case produce:
            - name: concise action-oriented title
            - description: HTML <div> with Preconditions and Test Type sections only (no steps here)
            - steps: ordered array of { description: "<step action>", result: "<expected result>" }
        4) Call "create_test_plan" tool passing: resourceId (the card id), resourceType, testPlanTitle (use the card name/title), NOTE: IF test plan already exists - skip this step and proceed to step 5.
        5) Call "add_test_cases_to_test_plan" tool passing: testPlanId (the test plan id), and the testCases array with name, description, and steps`,
    inputSchema: {
      resourceId: z.string()
        .min(5)
        .max(6)
        .describe('TP card ID (e.g. 145789)'),
      resourceType: z.enum(['UserStory', 'Bug', 'Feature'])
        .default('UserStory')
        .optional()
        .describe('Type of the TP card — UserStory, Bug, or Feature (default: UserStory)'),
    },
  },
  async ({ resourceId, resourceType = 'UserStory' }) => {
    let card: TP.UserStory | TP.Bug | TP.Feature | null = null

    if (resourceType === 'Bug') {
      card = await tp.getBug<TP.Bug>(resourceId)
    } else if (resourceType === 'Feature') {
      card = await tp.getFeature<TP.Feature>(resourceId)
    } else {
      card = await tp.getUserStory<TP.UserStory>(resourceId)
    }

    if (!card) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${resourceType} with id: ${resourceId}`
        }],
      }
    }

    let description = ''
    try {
      const dom = new JSDOM(`<html><body><div id="content">${card.Description}</div></body></html>`)
      description = dom.window.document.getElementById('content')?.textContent || ''
    } catch (error) {
      console.error("Error parsing card description:", error)
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          id: card.Id,
          name: card.Name,
          resourceType,
          description,
          customFields: card.CustomFields,
        })
      }],
    }
  }
)

server.registerTool(
  'add_test_cases_to_test_plan',
  {
    title: 'Adds generated test cases to a test plan linked to a TP card (UserStory, Bug, or Feature).',
    description: `Adds generated test cases to a test plan linked to a TP card (UserStory, Bug, or Feature).`,
    inputSchema: {
      testPlanId: z.string()
        .min(5)
        .max(6)
        .describe('Test plan ID to add test cases to (e.g. 145789)'),
      testCases: z.array(z.object({
        name: z.string()
          .describe('Test case title (concise, action-oriented)'),
        description: z.string()
          .describe('Test case context formatted as HTML — include Preconditions and Test Type sections, but NOT test steps (those go in the steps field)'),
        steps: z.array(z.object({
          description: z.string()
            .describe('Step action text'),
          result: z.string()
            .describe('Expected result for this step'),
        }))
          .min(1)
          .describe('Ordered list of test steps with their expected results'),
      }))
        .min(1)
        .describe('Array of test cases to create in the test plan'),
    },
  },
  async ({ testPlanId, testCases }) => {
    const created: { id: number; name: string; stepsAdded: number; stepsFailed: number }[] = []
    const failed: string[] = []

    for (const tc of testCases) {
      const testCase = await tp.createTestCase<TP.TestCase>(tc.name, tc.description, String(testPlanId))
      if (!testCase) {
        failed.push(tc.name)
        continue
      }

      let stepsAdded = 0
      let stepsFailed = 0
      for (const step of tc.steps) {
        const stepResult = await tp.addTestStep<TP.TestStep>(String(testCase.Id), step)
        if (stepResult) {
          stepsAdded++
        } else {
          stepsFailed++
        }
      }

      created.push({ id: testCase.Id, name: testCase.Name, stepsAdded, stepsFailed })
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ created, failed })
      }]
    }
  }
)

server.registerTool(
  'get_process_workflows',
  {
    title: 'Get process workflows',
    description: 'Get all Targetprocess process workflows',
    inputSchema: {
      processId: z.string()
        .describe('Process ID (e.g. 145636)'),
    },
  },
  async ({ processId }) => {
    const response = await tp.getProcessWorkflows<TP.TpResponseV2<TP.ProcessV2>>({ processId })

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get process workflows, JSON: ${JSON.stringify(response, null, 2)}`
        }],
      }
    }

    const items = response.items || [];
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No process workflows found`,
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(items)
      }],
    };
  }
)

server.registerTool(
  'get_processes',
  {
    title: 'Get processes',
    description: 'Get all Targetprocess processes',
  },
  async ({ }) => {
    const response = await tp.getProcesses<TP.TpResponseV2<TP.ProcessV2>>()

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get processes, JSON: ${JSON.stringify(response, null, 2)}`
        }],
      }
    }

    const items = response.items || [];
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No processes found`,
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(items)
      }],
    };
  }
)

server.registerTool(
  'get_bug_workflows',
  {
    title: 'Get bug workflows',
    description: 'Get all Targetprocess bug workflows',
  },
  async ({ }) => {
    const response = await tp.getBugWorkflows<TP.TpResponseV2<TP.WorkflowV2>>()

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get bug entity statuses, JSON: ${JSON.stringify(response, null, 2)}`
        }],
      }
    }

    const items = response.items || []
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No status data found for workflows`
        }],
      }
    }

    const workflows = items.map((w) => ({
      id: w.id,
      name: w.name,
      processId: w.process,
      entityType: w.entityType,
      entityStates: w.entityStates.map((es) => ({
        id: es.id,
        name: es.name,
      })),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(workflows)
      }],
    };
  })

server.registerTool(
  'get_user_story_workflows',
  {
    title: 'Get User Story workflows',
    description: 'Get all Targetprocess user story workflows, with sub-states',
  },
  async ({ }) => {
    const response = await tp.getUserStoryWorkflowsWithSubStates<TP.TpResponseV2<TP.WorkflowV2WithSubStates>>()

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get user story entity statuses, JSON: ${JSON.stringify(response, null, 2)}`
        }],
      }
    }

    const items = response.items || []
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No status data found for workflows`
        }],
      }
    }

    const userStoryWorkflows = items.filter((w) => w.entityType.name === "UserStory")
    const workflows = userStoryWorkflows.map((w) => ({
      id: w.id,
      processId: w.workflow.process.id,
      entityType: w.entityType.name,
      entityStates: w.subEntityStates.map((es) => ({
        id: es.id,
        name: es.name,
      })),
    }))

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(workflows)
      }],
    };
  }
)

server.registerTool(
  'get_card_current_status',
  {
    title: 'Get card status',
    description: 'Get the EntityState, TeamState, and assigned teams for a TP card (UserStory, Bug, or Feature) by ID',
    inputSchema: {
      id: z.string()
        .min(5)
        .max(6)
        .describe('TP card ID (e.g. 146055)'),
      resourceType: z.enum(['UserStory', 'Bug', 'Feature'])
        .default('UserStory')
        .optional()
        .describe('Type of the TP card — UserStory, Bug, or Feature (default: UserStory)'),
    },
  },
  async ({ id, resourceType = 'UserStory' }) => handleGetCardCurrentStatus(tp, id, resourceType)
)

server.registerTool(
  'get_in_progress_tasks_and_bugs',
  {
    title: 'Get in-progress tasks and bugs for a user',
    description: 'Get all Tasks and Bugs currently in "In Progress" state assigned to a given user ID',
    inputSchema: {
      userId: z.string()
        .describe('Targetprocess user ID (e.g. 123)'),
    },
  },
  async ({ userId }) => handleGetInProgressTasksAndBugs(tp, userId)
);

server.registerTool(
  'create_task',
  {
    title: 'Create a new task',
    description: 'Create a new task linked to a user story.',
    inputSchema: {
      title: z.string()
        .describe('Task title'),
      userStoryId: z.string()
        .min(5)
        .max(6)
        .describe('User story ID to link the task to (e.g. 145789)'),
      description: z.string()
        .optional()
        .describe('Task description (optional)'),
    },
  },
  async ({ title, userStoryId, description }) =>
    handleCreateTask(tp, { title, userStoryId, description })
)

server.registerTool(
  'get_commit_message',
  {
    title: 'Get commit message for a task or bug',
    description: `Returns the formatted commit message string for a given task or bug ID.
Formats:
- Task on a user story: "F#<featureId> US#<userStoryId> T#<taskId> <title>"
- Bug on a user story: "F#<featureId> US#<userStoryId> B#<bugId> <title>"
- Standalone bug (no user story): "B#<bugId> <title>"`,
    inputSchema: {
      id: z.string()
        .describe('The task or bug ID (e.g. 145789)'),
      type: z.enum(['task', 'bug'])
        .describe('Whether the ID refers to a task or a bug'),
    },
  },
  async ({ id, type }) => handleGetCommitMessage(tp, id, type)
)

server.registerTool(
  'list_my_user_stories',
  {
    title: 'List my user stories',
    description: 'List User Stories assigned to me. Use this to get an overview of current work. Optionally filter by state.',
    inputSchema: {
      state: z.string()
        .optional()
        .describe('Filter by state name (e.g. "Open", "In Progress", "Done")'),
      take: z.number()
        .default(25)
        .optional()
        .describe('Number of results to return, default is 25'),
      skip: z.number()
        .default(0)
        .optional()
        .describe('Pagination offset, default is 0'),
    },
  },
  async ({ state, take, skip }) => handleListMyUserStories(tp, { state, take, skip })
)

server.registerTool(
  'list_my_bugs',
  {
    title: 'List my bugs',
    description: 'List Bugs assigned to me. Optionally filter by state.',
    inputSchema: {
      state: z.string()
        .optional()
        .describe('Filter by state name (e.g. "Open", "In Progress", "Fixed")'),
      take: z.number()
        .default(25)
        .optional()
        .describe('Number of results to return, default is 25'),
      skip: z.number()
        .default(0)
        .optional()
        .describe('Pagination offset, default is 0'),
    },
  },
  async ({ state, take, skip }) => handleListMyBugs(tp, { state, take, skip })
)

server.registerTool(
  'log_time',
  {
    title: 'Log time on a Task, User Story, or Bug',
    description: 'Log time spent working on a Task, User Story, or Bug. Call this after completing a task or at the end of a work session.',
    inputSchema: {
      entityId: z.string()
        .min(1)
        .describe('ID of the Task, User Story, or Bug to log time against (e.g. 145789)'),
      entityType: z.enum(['Task', 'UserStory', 'Bug'])
        .describe('Type of the entity'),
      hours: z.number()
        .positive()
        .describe('Hours spent (can be decimal e.g. 1.5)'),
      description: z.string()
        .optional()
        .describe('What was done — brief summary of the work'),
      date: z.string()
        .optional()
        .describe('ISO date string, defaults to today (e.g. "2024-05-21")'),
    },
  },
  async ({ entityId, entityType, hours, description, date }) =>
    handleLogTime(tp, { entityId, entityType, hours, description, date })
)

server.registerTool(
  'get_my_time_logs',
  {
    title: 'Get my recent time log entries',
    description: 'Get recent time log entries submitted by me.',
    inputSchema: {
      take: z.number()
        .default(25)
        .optional()
        .describe('Number of entries to return, default is 25'),
    },
  },
  async ({ take }) => handleGetMyTimeLogs(tp, take)
)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
