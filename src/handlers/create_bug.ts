import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleCreateBug(
  tp: TpClient,
  params: {
    title: string
    bugContent: string
    origin?: string
    projectId?: string
    teamId?: string
    entityStateId?: string
  },
) {
  const bugResponse = await tp.createBugOnly<TP.Bug>(params)

  if (!bugResponse) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create bug "${params.title}"\n JSON: ${JSON.stringify(bugResponse, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(bugResponse) }],
  }
}
