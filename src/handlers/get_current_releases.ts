import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetCurrentReleases(tp: TpClient) {
  const releases = await tp.getCurrentReleases<TP.TpResponse<TP.Release>>()

  if (!releases) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get current releases, JSON: ${JSON.stringify(releases, null, 2)}`
      }],
    }
  }

  const items = releases.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No releases found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
