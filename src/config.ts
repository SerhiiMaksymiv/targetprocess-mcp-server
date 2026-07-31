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
  },

  http: {
    // Shared secret gating access to the hosted server, checked against the
    // "Authorization: Bearer <key>" header on every request. Distinct from a
    // caller's personal TP_TOKEN, which is supplied per-session via X-TP-Token.
    hostingApiKey: process.env.HOSTING_API_KEY || "",
    port: Number(process.env.HTTP_PORT) || 3000,
    host: process.env.HTTP_HOST || "127.0.0.1",
    allowedHosts: process.env.HTTP_ALLOWED_HOSTS
      ? process.env.HTTP_ALLOWED_HOSTS.split(",").map((h) => h.trim()).filter(Boolean)
      : undefined,
  }
}
