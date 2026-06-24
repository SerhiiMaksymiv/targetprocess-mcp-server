import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetProjects(tp: TpClient) {
  const response = await tp.getProjects<TP.TpResponse<TP.Project>>()

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get projects, JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No projects found' }],
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(items.map((p) => ({ id: p.Id, name: p.Name })))
    }],
  }
}
