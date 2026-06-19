import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetEpicFeatures(tp: TpClient, epicId: string) {
  const response = await tp.getEpicFeatures<TP.TpResponse<TP.Feature>>(epicId)

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get features for epic id: ${epicId}`
      }],
    }
  }

  const features = response.Items ?? []

  const result = features.map(f => ({
    id: f.Id,
    name: f.Name,
    entityState: f.EntityState?.Name,
    team: f.Team?.Name,
    release: (f as any).Release?.Name,
    progress: f.Progress,
    effort: f.Effort,
  }))

  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ total: result.length, features: result }) }],
  }
}
