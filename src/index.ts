import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";

import { TpClient } from "./tp.js";
import {
  UserStoryComment,
  UserStory,
  Bug,
  TestPlan,
  GeneralSearchResponse,
  Release,
  TpResponse
} from "./types.js";
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
    const userStory = await tp.getUserStory<UserStory>(id)

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

    const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
    const descriptionText = dom.window.document.getElementById('content')?.textContent

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(descriptionText)
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
    const releases = await tp.getCurrentReleases<TpResponse<Release>>()

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
    },
  },
  async ({ name }) => {
    const release = await tp.getReleaseUserStories<TpResponse<Release>>({ name })

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
    const release = await tp.getReleaseUserStories<TpResponse<Release>>({ name, withDescription })

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
  'search_by_keyword',
  {
    title: 'Search TP user stories by keyword or partial name',
    description: `Searches tp cards (user stories, bugs) by keyword or partial name or partial keyphrase e.g. "Text Element"
      returns JSON with the following fields:
      [{
        "id": number,
        "name": string,
        "description": string,
        "type": string
      }]
    `,
    inputSchema: {
      keyword: z.string()
        .describe('Keyword or partial name or keyphrase to search for'),
    },
  },
  async ({ keyword }) => {
    console.log(`Searching for:"${keyword}"`)
    const generalResults = await tp.searchContainsNameText<GeneralSearchResponse>(keyword)

    if (!generalResults) {
      return {
        content: [{
          type: 'text',
          text: `Failed to search user stories by keyword: "${keyword}"\n JSON: ${JSON.stringify(generalResults, null, 2)}`
        }],
      }
    }
    const items = generalResults.Items || [];
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
        type: item.EntityType.Name
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
    const bug = await tp.getBug<Bug>(id)

    if (!bug) {
      return {
        content: [{
          type: 'text',
          text: `Failed to get bug, id: ${id}\n JSON: ${JSON.stringify(bug, null, 2)}`
        }],
      }
    }
    const description = bug.Description || '';
    if (!description) {
      return {
        content: [{
          type: "text",
          text: `No description for ${id} tp card`,
        }],
      };
    }

    const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
    const descriptionText = dom.window.document.getElementById('content')?.textContent

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(descriptionText)
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
      const addCommentResponse = await tp.addComment<UserStoryComment>(id, comment);
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
  'create_bug',
  {
    title: 'Create a new bug card based on provided card id',
    description: `Create a new bug card based on provided card id that summarizes the problem in concise,
      descriptive manner answering questions What? Where? When?,
      and content explaining what happened in detail.
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps: 
        1) IF you already have user story or bug card content, proceed to step 3 skipping step 2;
        2) ELSE call "get_user_story_content" tool or "get_bug_content" tool to get user story or bug card content;
        3) format the new bug inside html <div> tags with Issue Description, Steps to Reproduce, Expected Behavior, Actual Behavior;
        4) add a comment to the card which was based on with the ID provided in the first step;
      `,
    inputSchema: {
      title: z.string()
        .describe('Bug card title that summarizes the problem in concise, descriptive, and actionable manner, enabling a developer to understand the issue without opening the report'),
      id: z.string()
        .min(5)
        .max(6)
        .describe(`Usually user story id or bug ID (e.g. 145789)`),
      bugContent: z.string()
        .describe(`Comment content to add, explain what happened in detail.
                  Include expected behaviour and what actually occurred.
                  Be specific and avoid assumptions.
                  Clearly outline the actions needed to trigger the bug.
                  Number each step so anyone can follow them easily`),
    },
  },
  async ({ title, id, bugContent }) => {
    const bugResponse = await tp.creteBugBasedOnCardId<Bug>(title, id, bugContent);

    if (!bugResponse) {
      return {
        content: [{
          type: 'text',
          text: `Failed to create comment "${title}"\n JSON: ${JSON.stringify(bugResponse, null, 2)}`
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
    title: 'Create a new test plan for a user story',
    description: `Create a new test plan with provided title and user story id`,
    inputSchema: {
      title: z.string()
        .describe(`Test plan title that is taken from user story title`),
      userStoryId: z.string()
        .min(5)
        .max(6)
        .describe(`User story id, usually user story or bug ID (e.g. 145789)`),
    },
  },
  async ({ title, userStoryId }) => {
    const testPlanResponse = await tp.creteTestPlan<TestPlan>(title, userStoryId);

    if (!testPlanResponse) {
      return {
        content: [{
          type: 'text',
          text: `Failed to create testPlanResponse "${title}"\n JSON: ${JSON.stringify(testPlanResponse, null, 2)}`
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

server.registerPrompt(
  'create_bug',
  {
    title: 'Create a new bug',
    description: `Create a new bug card with provided title that summarizes the problem in concise,
      descriptive manner answering questions What? Where? When?,
      and content explaining what happened in detail.
      CRITICAL WORKFLOW: Before calling this tool, you MUST follow these steps: 
        1) call "get_user_story_content" tool or "get_bug_content" tool to get user story or bug content
        2) format the new bug inside html <div> tags with Short Summary, Steps to Reproduce, Expected Behavior, Actual Behavior.
        3) IF "get_user_story_content" tool was called in the first step, THEN add a comment to the user story with the ID provided in the first step
        4) ELSE IF "get_bug_content" tool was called in the first step, THEN add a comment to the bug with the ID provided in the first step
      `,
    argsSchema: {
      title: z.string().describe('Title of the bug report'),
      userStoryId: z.string()
        .length(6)
        .describe(`User story id, usually user story or bug ID (e.g. 145789)`),
    },
  },
  async ({ title, userStoryId }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a new bug based on "${userStoryId}" tp card with the title: "${title}"`,
          },
        },
      ],
    }
  }
)

server.registerPrompt(
  'search_by_keyword',
  {
    title: 'Search TP user stories, bugs, features, tasks by keyword or phrase',
    description: `Search for tp cards (user stories, bugs, features, tasks) by keyword or partial name or partial keyphrase e.g. "Text Element".
      IF user uses "find/get me/search for" or similar keyphrase for searching THEN consider using this tool
      User can include "tp" or "tp card" or "ticket" in the prompt to search by partial name.`,
    argsSchema: {
      keyword: z.string()
        .describe('Keyword or partial name or keyphrase to search for'),
    },
  },
  async ({ keyword }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search for tp cards (user stories, bugs, features, tasks) by partial name or partial keyphrase: "${keyword}".`
          },
        },
      ],
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
