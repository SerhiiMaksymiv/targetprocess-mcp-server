import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetReleaseBugs(
  tp: TpClient,
  name: string,
  results?: number,
) {
  const release = await tp.getReleaseBugs<TP.TpResponse<TP.Bug>>({ name, results })

  if (!release) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get ${name} release bugs, JSON: ${JSON.stringify(release, null, 2)}`
      }],
    }
  }

  const items = release.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No release bugs found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items) }],
  }
}
