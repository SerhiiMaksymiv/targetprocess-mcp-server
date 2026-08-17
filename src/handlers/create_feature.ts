import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleCreateFeature(
  tp: TpClient,
  params: {
    title: string
    description?: string
    epicId?: string
    releaseId?: string
    projectId?: string
    teamId?: string
  },
) {
  const response = await tp.createFeature<TP.Feature>(params)

  if (response instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create feature "${params.title}"\n Error: ${response.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
