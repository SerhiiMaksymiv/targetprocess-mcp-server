import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetReleaseFeatures(
  tp: TpClient,
  name: string,
  results?: number,
) {
  const release = await tp.getReleaseFeatures<TP.TpResponse<TP.Feature>>({ name, results })

  if (release instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get ${name} release features, Error: ${release.message}`
      }],
    }
  }

  const items = release.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No release features found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
