import "dotenv/config";

export const config = {
  tp: {
    url: process.env.TP_BASE_URL || "",
    token: process.env.TP_TOKEN || "",
    ownerId: process.env.TP_OWNER_ID || "",
    projectId: process.env.TP_PROJECT_ID || "",
    teamId: process.env.TP_TEAM_ID || "",
  }
}
