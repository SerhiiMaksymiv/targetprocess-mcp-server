import type { TpClient } from '../tp.js'

export async function handleUpdateBug(
  tp: TpClient,
  params: {
    id: string
    title?: string
    bugContent?: string
    origin?: string
    projectId?: string
    teamId?: string
    entityStateId?: string
  },
) {
  const bugResponse = await tp.updateBug<any>(params)

  if (!bugResponse) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to update bug "${params.title}"\n JSON: ${JSON.stringify(bugResponse, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(bugResponse) }],
  }
}
