import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleCreateBugBasedOnCard(
  tp: TpClient,
  params: {
    title: string
    card: { id: string, type: "UserStory" | "Bug" | "Feature" }
    bugContent: string
    origin?: string
    releaseId?: string
    projectId?: string
    teamId?: string
  },
) {
  const bugResponse = await tp.createBug<TP.Bug>(params)

  if (bugResponse instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create bug "${params.title}"\n Error: ${bugResponse.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(bugResponse) }],
  }
}
