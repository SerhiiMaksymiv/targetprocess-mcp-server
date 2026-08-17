import type { TpClient } from '../tp.js'

export async function handleUpdateBug(
  tp: TpClient,
  params: {
    id: string
    title?: string
    bugContent?: string
    origin?: string
    releaseId?: string
    projectId?: string
    teamId?: string
    entityStateId?: string
    tags?: string
    teamIterationId?: string
  },
) {
  const bugResponse = await tp.updateBug<any>(params)
  if (bugResponse instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to update bug "${params.title}"\n Error: ${bugResponse.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(bugResponse) }],
  }
}
