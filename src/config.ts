import "dotenv/config";

export const config = {
  tp: {
    url: process.env.TP_BASE_URL || "",
    token: process.env.TP_TOKEN || "",
    ownerId: process.env.TP_OWNER_ID || "1504",
    projectId: process.env.TP_PROJECT_ID || "",
    teamId: process.env.TP_TEAM_ID || "",

    processId: process.env.TP_PROCESS_ID || "89",
    userStoryWorkflowId: process.env.TP_USER_STORY_WORKFLOW_ID || "",
    bugWorkflowId: process.env.TP_BUG_WORKFLOW_ID || "",
  }
}
