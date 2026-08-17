import type { TpClient } from '../tp.js'

export async function handleCreateEpic(
  tp: TpClient,
  params: {
    title: string
    description?: string
    releaseId?: string
    projectId?: string
  },
) {
  const response = await tp.createEpic(params)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create epic "${params.title}"\n Error: ${response.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
