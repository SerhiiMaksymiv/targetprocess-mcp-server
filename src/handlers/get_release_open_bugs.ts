import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetReleaseOpenBugs(
  tp: TpClient,
  name: string,
  results?: number,
  withDescription?: boolean,
) {
  const release = await tp.getReleaseOpenBugs<TP.TpResponse<TP.Bug>>({ name, results, withDescription })

  if (release instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get ${name} release bugs, Error: ${release.message}`
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
