import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

type ScenarioBlock = { name: string; steps: string[] }

const gherkinBlock = (items: ScenarioBlock[]) =>
  items.map((s, indx) => `<div><strong>Scenario ${indx + 1} - ${s.name}:</strong></div><div>${s.steps.map(step => `<div>\t${step}</div>`).join('\n')}</div>`).join('<br>')

export async function handleCreateFormattedUserStory(
  tp: TpClient,
  params: {
    title: string
    header: { storyId?: string; asA: string; iWant: string; soThat: string }
    definitions?: { term: string; description: string }[]
    scenarios: ScenarioBlock[]
    examplesTable?: string
    edgeCases?: ScenarioBlock[]
    acceptanceCriteria: string[]
    references?: string
    notes?: string
    featureId?: string
    releaseId?: string
    projectId?: string
    teamId?: string
    tags?: string
    teamIterationId?: string
  },
) {
  const { title, header, definitions, scenarios, examplesTable, edgeCases, acceptanceCriteria, references, notes, featureId, releaseId, projectId, teamId, tags, teamIterationId } = params

  const parts: string[] = ['<div>']

  parts.push('<h3>Header</h3>')
  if (header.storyId) parts.push(`<p><strong>Story ID:</strong> ${header.storyId}</p>`)
  parts.push(`<p>As a ${header.asA} <br> I want ${header.iWant} <br> so that ${header.soThat}</p>`)

  if (definitions && definitions.length > 0) {
    parts.push('<h3>Definitions</h3>')
    parts.push('<div>')
    for (const def of definitions) {
      parts.push(`<p><strong>${def.term}</strong> — ${def.description}</p>`)
    }
    parts.push('</div>')
  }

  parts.push('<h3>Scenarios</h3>')
  parts.push(gherkinBlock(scenarios))

  if (examplesTable) {
    parts.push('<h3>Examples Table</h3>')
    parts.push(`<pre>${examplesTable}</pre>`)
  }

  if (edgeCases && edgeCases.length > 0) {
    parts.push('<h3>Edge Cases</h3>')
    parts.push(gherkinBlock(edgeCases))
  }

  parts.push('<h3>Acceptance Criteria</h3>')
  parts.push('<ol>')
  for (const criterion of acceptanceCriteria) {
    parts.push(`<li>${criterion}</li>`)
  }
  parts.push('</ol>')

  if (references) {
    parts.push('<h3>References</h3>')
    parts.push(`<p>${references}</p>`)
  }

  if (notes) {
    parts.push('<h3>Notes</h3>')
    parts.push(`<p>${notes}</p>`)
  }

  parts.push('</div>')

  const description = parts.join('\n')

  const userStoryResponse = await tp.createUserStory<TP.UserStory>({ title, description, featureId, releaseId, projectId, teamId, tags, teamIterationId })

  if (userStoryResponse instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create formatted user story "${title}"\n Error: ${userStoryResponse.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(userStoryResponse) }],
  }
}
