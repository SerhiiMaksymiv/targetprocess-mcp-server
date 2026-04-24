#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";

import { TpClient } from "./tp.js";
import * as TP from "./types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

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
  async ({ id }) => {
    const userStory = await tp.getUserStory<TP.UserStory>(id)

    if (!userStory) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get user story, id: ${id}\n JSON: ${JSON.stringify(userStory, null, 2)}`
        }],
      }
    }
    const description = userStory.Description || '';
    if (!description) {
      return {
        content: [{
          type: "text",
          text: `No description for ${id} tp card`,
        }],
      };
    }

    let userStoryResults = {
      name: userStory.Name,
      id: userStory.Id,
      description: '',
      feature: userStory.Feature?.Name,
      featureId: userStory.Feature?.Id,
      customFields: userStory.CustomFields,
    }

    try {
      const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
      const descriptionText = dom.window.document.getElementById('content')?.textContent

      if (descriptionText) {
        userStoryResults.description = descriptionText
      }

    } catch (error) {
      console.error("Error parsing user story description:", error);
      console.error("Returning user story without description");
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(userStoryResults)
      }],
    };
  }
);

server.registerTool(
  'get_current_releases',
  {
    title: 'Get current releases',
    description: 'Get current releases',
  },
  async ({ }) => {
    const releases = await tp.getCurrentReleases<TP.TpResponse<TP.Release>>()

    if (!releases) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get current releases, JSON: ${JSON.stringify(releases, null, 2)}`
        }],
      }
    }
    const items = releases.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No releases found`,
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
  async ({ name, results }) => {
    const release = await tp.getReleaseUserStories<TP.TpResponse<TP.UserStory>>({ name, results })

    if (!release) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${name} release user stories, JSON: ${JSON.stringify(release, null, 2)}`
        }],
      }
    }
    const items = release.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No release user stories found`,
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
  async ({ name, results }) => {
    const release = await tp.getReleaseBugs<TP.TpResponse<TP.Bug>>({ name, results })

    if (!release) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${name} release bugs, JSON: ${JSON.stringify(release, null, 2)}`
        }],
      }
    }
    const items = release.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No release bugs found`,
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
  async ({ name, results }) => {
    const release = await tp.getReleaseFeatures<TP.TpResponse<TP.Feature>>({ name, results })

    if (!release) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${name} release features, JSON: ${JSON.stringify(release, null, 2)}`
        }],
      }
    }
    const items = release.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No release features found`,
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
  async ({ name, withDescription }) => {
    const release = await tp.getReleaseUserStories<TP.TpResponse<TP.Release>>({ name, withDescription })

    if (!release) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${name} release user stories, JSON: ${JSON.stringify(release, null, 2)}`
        }],
      }
    }
    const items = release.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No release user stories found`,
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
  async ({ name, results, withDescription }) => {
    const release = await tp.getReleaseOpenBugs<TP.TpResponse<TP.Release>>({ name, results, withDescription })

    if (!release) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${name} release bugs, JSON: ${JSON.stringify(release, null, 2)}`
        }],
      }
    }
    const items = release.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No release bugs found`,
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
  async ({ name, results, withDescription }) => {
    const release = await tp.getReleaseOpenUserStories<TP.TpResponse<TP.Release>>({ name, results, withDescription })

    if (!release) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get ${name} release user stories, JSON: ${JSON.stringify(release, null, 2)}`
        }],
      }
    }
    const items = release.Items || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No release user stories found`,
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
);

server.registerTool(
  'search_all_cards_by_keyword',
  {
    title: 'Search TP cards (user stories, bugs, features) by keyword or partial name',
    description: `Searches tp cards (user stories, bugs, features) by keyword or partial name or partial keyphrase e.g. "Text Element"`,
    inputSchema: {
      keyword: z.string()
        .describe('Keyword or partial name or keyphrase to search for'),
    },
  },
  async ({ keyword }) => {
    const results = await Promise.all<TP.TpResponse<TP.General>>([
      tp.searchContainsNameText<TP.TpResponse<TP.UserStory>>({ text: keyword, entityType: "UserStories" }),
      tp.searchContainsNameText<TP.TpResponse<TP.Bug>>({ text: keyword, entityType: "Bugs" }),
      tp.searchContainsNameText<TP.TpResponse<TP.Feature>>({ text: keyword, entityType: "Features" }),
    ])

    const generalResults = results.map((item: TP.TpResponse<TP.General>) => item.Items).flat()

    if (!generalResults) {
      return {
        content: [{
          type: 'text',
          text: `Failed to find card by keyword: "${keyword}"\n JSON: ${JSON.stringify(generalResults, null, 2)}`
        }],
      }
    }
    const items = generalResults || [];
    if (items.length == 0) {
      return {
        content: [{
          type: "text",
          text: `No results for ${keyword}`,
        }],
      };
    }

    const parsedItems = items.map((item) => {
      const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
      const descriptionText = dom.window.document.getElementById('content')?.textContent
      return {
        title: item.Name,
        id: item.Id,
        description: descriptionText,
      }
    })

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(parsedItems)
      }],
    };
  }
);

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
  async ({ id }) => {
    const bug = await tp.getBug<TP.Bug>(id)

    if (!bug) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get bug, id: ${id}\n JSON: ${JSON.stringify(bug, null, 2)}`
        }],
      }
    }

    let bugResult = {
      name: bug.Name,
      id: bug.Id,
      description: '',
      origin: ''
    }

    try {
      const dom = new JSDOM(`<html><body><div id="content">${bug.Description}</div></body></html>`)
      const descriptionText = dom.window.document.getElementById('content')?.textContent

      if (descriptionText) {
        bugResult.description = descriptionText
      }

    } catch (error) {
      console.error("Error parsing bug description:", error);
      console.error("Returning bug without description");
    }

    try {
      bugResult.origin = bug.CustomFields?.find((field) => field?.Value === "Origin")?.Value
    } catch (error) {
      console.error("Error parsing bug origin:", error);
      console.error("Returning bug without origin");
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(bugResult)
      }],
    };
  }
);

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
  async ({ id, comment }) => {
    try {
      const addCommentResponse = await tp.addComment<TP.Comment>(id, comment);
      if (!addCommentResponse) {
        return {
          content: [{
            type: 'text',
            text: `Failed to add comment to user story, id: ${id}\n JSON: ${JSON.stringify(addCommentResponse, null, 2)}`
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
          text: `Failed to add comment to user story, id: ${id}\n Error: ${error}`
        }]
      };
    }
  }
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
  async ({ id, results }) => {
    const response = await tp.getUserStoryComments<TP.TpResponse<TP.Comment>>(id, results)

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get comments for user story id: ${id}`
        }],
      }
    }

    const items = response.Items || []
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No comments found for user story id: ${id}`,
        }],
      }
    }

    let parsedItems = []
    try {
      parsedItems = items.map((item) => {
        const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
        const descriptionText = dom.window.document.getElementById('content')?.textContent
        return {
          id: item.Id,
          description: descriptionText,
          createDate: item.CreateDate,
          owner: item.Owner.FullName,
        }
      })
    } catch (error) {
      console.error("Error parsing user story comments:", error);
      return {
        content: [{
          type: 'text',
          text: `Failed to parse user story comments for user story id: ${id}`,
        }],
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(parsedItems)
      }],
    }
  }
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
  async ({ id, results }) => {
    const response = await tp.getBugComments<TP.TpResponse<TP.Comment>>(id, results)

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get comments for bug id: ${id}`
        }],
      }
    }

    const items = response.Items || []
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No comments found for bug id: ${id}`,
        }],
      }
    }

    let parsedItems = []
    try {
      parsedItems = items.map((item) => {
        const dom = new JSDOM(`<html><body><div id="content">${item.Description}</div></body></html>`)
        const descriptionText = dom.window.document.getElementById('content')?.textContent
        return {
          id: item.Id,
          description: descriptionText,
          createDate: item.CreateDate,
          owner: item.Owner.FullName,
        }
      })
    } catch (error) {
      console.error("Error parsing bug comments:", error);
      return {
        content: [{
          type: 'text',
          text: `Failed to parse bug comments for bug id: ${id}`,
        }],
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(parsedItems)
      }],
    }
  }
)

server.registerTool(
  'create_bug_based_on_card',
  {
    title: 'Create a new bug card based on provided card id',
    description: `Create a new bug card based on provided card id that summarizes the problem in concise, descriptive manner answering questions What? Where? When?, and content explaining what happened in detail. 
      NOTE: this tool requires a user story or bug card as a reference (i.e. card ID).
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps: 
        1) IF you already have user story or bug card content, proceed to step 3 skipping step 2;
        2) ELSE call "get_user_story_content" tool or "get_bug_content" tool to get user story or bug card content;
        3) format the new bug inside html <div> tags with Issue Description, Steps to Reproduce, Expected Behavior, Actual Behavior;
        4) add a comment to the card with bug Id provided in the first step and Title`,
    inputSchema: {
      title: z.string()
        .describe('Bug card title that summarizes the problem in concise, descriptive, and actionable manner, enabling a developer to understand the issue without opening the report'),
      card: z.object({
        id: z.string()
          .min(5)
          .max(6)
          .describe(`Usually user story id or bug ID (e.g. 145789)`),
        type: z.enum(["UserStory", "Bug"])
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
        .describe('Where the bug was found, defaults to "Manual QA"'),
    },
  },
  async ({ title, card, bugContent, origin }) => {
    const bugResponse = await tp.createBug<TP.Bug>({ title, card, bugContent, origin });

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
  'create_bug',
  {
    title: 'Create a new bug card',
    description: `Create a new bug card that summarizes the problem in concise, descriptive manner answering questions "What? Where? When?" and content explaining what happened in detail.
      NOTE: this tool does not require a user story or bug card referenced.
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps:
        1) format the new bug inside html <div> tags with Issue Description, Steps to Reproduce, Expected Behavior, Actual Behavior;
        2) add a comment to the newly created bug with its Id and Title`,
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
        .describe('Where the bug was found, defaults to "Manual QA"'),
    },
  },
  async ({ title, bugContent, origin }) => {
    const bugResponse = await tp.createBugOnly<TP.Bug>({ title, bugContent, origin });

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
  'create_test_plan',
  {
    title: 'Create a new test plan linked to a TP card',
    description: `Create a new test plan linked to a UserStory, Bug, or Feature. Name and Project are required by the API; Description, StartDate, and EndDate are optional.`,
    inputSchema: {
      title: z.string()
        .describe('Test plan title — use the linked card name with a prefix (e.g. "Test Plan: User story title")'),
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
  async ({ id }) => {
    const response = await tp.getFeatureUserStories<TP.TpResponseV2<TP.TpResponseItemsV2<TP.TpResultItemV2>>>(id)

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get user stories for feature id: ${id}`
        }],
      }
    }

    const items = response.items || []
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No user stories found in outer items for feature id: ${id}`,
        }],
      }
    }

    const featureItems = items[0].items || []
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No user stories found for feature id: ${id}`,
        }],
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(featureItems)
      }],
    }
  }
);

server.registerTool(
  'get_projects',
  {
    title: 'Get projects',
    description: 'Get all Targetprocess projects',
  },
  async ({ }) => {
    const response = await tp.getProjects<TP.TpResponse<TP.Project>>()

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get projects, JSON: ${JSON.stringify(response, null, 2)}`
        }],
      }
    }

    const items = response.Items || [];
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No projects found`,
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(items.map((p) => ({ id: p.Id, name: p.Name })))
      }],
    };
  }
);

server.registerTool(
  'get_teams',
  {
    title: 'Get teams',
    description: 'Get all Targetprocess teams',
  },
  async ({ }) => {
    const response = await tp.getTeams<TP.TpResponse<TP.Team>>()

    if (!response) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get teams, JSON: ${JSON.stringify(response, null, 2)}`
        }],
      }
    }

    const items = response.Items || [];
    if (items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No teams found`,
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(items.map((t) => ({ id: t.Id, name: t.Name })))
      }],
    };
  }
);

server.registerTool(
  'get_logged_in_user',
  {
    title: 'Get logged in user',
    description: 'Get logged in user',
  },
  async () => {
    const ctx = await tp.getContext<TP.Context>()

    if (!ctx) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get context, JSON: ${JSON.stringify(ctx, null, 2)}`
        }],
      }
    }

    const loggedInUser = ctx.LoggedUser
    if (!loggedInUser) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get logged in user in this context, JSON: ${JSON.stringify(ctx, null, 2)}`
        }],
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(loggedInUser)
      }],
    };
  }
);

server.registerTool(
  'write_test_cases',
  {
    title: 'Write test cases for a TP card (UserStory, Bug, or Feature)',
    description: `Fetches a TP card (UserStory, Bug, or Feature) content by ID.
      CRITICAL WORKFLOW — after receiving the card content, you MUST:
        1) Thoroughly analyze the card name and description to understand the feature or issue being tested
        2) Write detailed test cases covering: happy path, edge cases, boundary conditions, and error scenarios
        3) Format each test case description inside an html <div> element structured as:
            <div>
              <p><strong>Preconditions:</strong> ...</p>
              <p><strong>Test Steps:</strong><ol><li>...</li></ol></p>
              <p><strong>Expected Result:</strong> ...</p>
              <p><strong>Test Type:</strong> ...</p>
            </div>
        4) Call "create_test_plan" tool passing: resourceId (the card id), resourceType, testPlanTitle (use the card name prefixed with "Test Plan: "), and the testCases array
        5) Call "add_test_case_to_test_plan" tool passing: testPlanId (the test plan id), and the testCases array`,
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
        .describe('TP card ID to link the test plan to (e.g. 145789)'),
      testCases: z.array(z.object({
        name: z.string()
          .describe('Test case title (concise, action-oriented)'),
        description: z.string()
          .describe('Test case steps and expected results formatted as HTML'),
      }))
        .min(1)
        .describe('Array of test cases to create in the new test plan'),
    },
  },
  async ({ testPlanId, testCases }) => {
    const created: { id: number; name: string }[] = []
    const failed: string[] = []

    for (const tc of testCases) {
      const result = await tp.createTestCase<TP.TestCase>(tc.name, tc.description, String(testPlanId))
      if (result) {
        created.push({ id: result.Id, name: result.Name })
      } else {
        failed.push(tc.name)
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          created,
          failed,
        })
      }]
    }
  }
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
