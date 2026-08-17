import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

type ScenarioBlock = { name: string; steps: string[] }

const gherkinBlock = (items: ScenarioBlock[]) =>
  items.map((s, indx) => `<div><strong>Scenario ${indx + 1} - ${s.name}:</strong></div><div>${s.steps.map(step => `<div>\t${step}</div>`).join('\n')}</div>`).join('<br>')

export async function handleCreateFormattedFeature(
  tp: TpClient,
  params: {
    title: string
    header: { featureId?: string; businessBackground: string }
    definitions?: { term: string; description: string }[]
    scope?: { includes?: string[]; excludes?: string[] }
    nonFunctionalRequirements: { area: string; requirement: string; status: "Covered" | "Gap" | "Decision needed"; storyOrOwner: string }[]
    crossCuttingScenarios?: ScenarioBlock[]
    childStories?: { id: string; name: string; covered: boolean }[]
    openQuestions?: string[]
    references?: string
    notes?: string
    epicId?: string
    releaseId?: string
    projectId?: string
    teamId?: string
  },
) {
  const { title, header, definitions, scope, nonFunctionalRequirements, crossCuttingScenarios, childStories, openQuestions, references, notes, epicId, releaseId, projectId, teamId } = params

  const parts: string[] = ['<div>']

  parts.push('<h3>Header</h3>')
  if (header.featureId) parts.push(`<p><strong>Feature ID:</strong> ${header.featureId}</p>`)
  parts.push(`<p><strong>Business Background:</strong> ${header.businessBackground}</p>`)

  if (definitions && definitions.length > 0) {
    parts.push('<h3>Definitions</h3>')
    parts.push('<div>')
    for (const def of definitions) {
      parts.push(`<p><strong>${def.term}</strong> — ${def.description}</p>`)
    }
    parts.push('</div>')
  }

  if (scope && ((scope.includes?.length ?? 0) > 0 || (scope.excludes?.length ?? 0) > 0)) {
    parts.push('<h3>Scope & Boundaries</h3>')
    if (scope.includes && scope.includes.length > 0) {
      parts.push('<p><strong>Includes:</strong></p>')
      parts.push('<ul>')
      for (const item of scope.includes) parts.push(`<li>${item}</li>`)
      parts.push('</ul>')
    }
    if (scope.excludes && scope.excludes.length > 0) {
      parts.push('<p><strong>Excludes:</strong></p>')
      parts.push('<ul>')
      for (const item of scope.excludes) parts.push(`<li>${item}</li>`)
      parts.push('</ul>')
    }
  }

  parts.push('<h3>Non-Functional Requirements</h3>')
  parts.push('<table><tr><th>NFR Area</th><th>Requirement</th><th>Status</th><th>Story / Owner</th></tr>')
  for (const nfr of nonFunctionalRequirements) {
    parts.push(`<tr><td>${nfr.area}</td><td>${nfr.requirement}</td><td>${nfr.status}</td><td>${nfr.storyOrOwner}</td></tr>`)
  }
  parts.push('</table>')

  if (crossCuttingScenarios && crossCuttingScenarios.length > 0) {
    parts.push('<h3>Cross-Cutting Scenarios</h3>')
    parts.push(gherkinBlock(crossCuttingScenarios))
  }

  if (childStories && childStories.length > 0) {
    parts.push('<h3>Child Stories</h3>')
    parts.push('<ul>')
    for (const story of childStories) {
      parts.push(`<li>[${story.covered ? 'x' : ' '}] ${story.id} — ${story.name}${story.covered ? ' (covered)' : ' (not yet covered by tests)'}</li>`)
    }
    parts.push('</ul>')
  }

  if (openQuestions && openQuestions.length > 0) {
    parts.push('<h3>Open Questions / Risks</h3>')
    parts.push('<ul>')
    for (const question of openQuestions) parts.push(`<li>${question}</li>`)
    parts.push('</ul>')
  }

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

  const featureResponse = await tp.createFeature<TP.Feature>({ title, description, epicId, releaseId, projectId, teamId })

  if (featureResponse instanceof Error) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to create formatted feature "${title}"\n Error: ${featureResponse.message}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(featureResponse) }],
  }
}
