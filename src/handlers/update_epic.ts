import type { TpClient } from '../tp.js'

export async function handleUpdateEpic(
  tp: TpClient,
  params: {
    id: string
    title?: string
    description?: string
    releaseId?: string
    projectId?: string
  },
) {
  const response = await tp.updateEpic(params)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to update epic id: ${params.id}\n Error: ${response.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
